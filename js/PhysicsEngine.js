/**
 * PhysicsEngine - 物理引擎类
 * 处理重力、摩擦力和物理更新循环
 */
class PhysicsEngine {
    /**
     * 创建物理引擎实例
     * @param {Object} config - 物理配置参数（可选，会与全局CONFIG合并）
     */
    constructor(config = {}) {
        // 获取全局配置，如果CONFIG不存在则使用默认值
        const globalConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('physics') 
            : this._getDefaultPhysicsConfig();
            
        // 物理常数配置 - 合并全局配置和传入的配置
        this.config = {
            // 重力加速度 (像素/秒²)
            gravity: config.gravity || globalConfig.gravity || 9.81 * 50,
            
            // 摩擦系数 (0-1之间，1表示无摩擦)
            frictionCoefficient: config.frictionCoefficient || globalConfig.frictionCoefficient || 0.98,
            
            // 反弹系数 (0-1之间，1表示完全弹性碰撞)
            restitution: config.restitution || globalConfig.restitution || 0.8,
            
            // 时间缩放因子
            timeScale: config.timeScale || globalConfig.timeScale || 1.0,
            
            // 最小速度阈值，低于此值视为静止
            minVelocityThreshold: config.minVelocityThreshold || globalConfig.minVelocityThreshold || 0.1,
            
            // 最大速度限制
            maxVelocity: config.maxVelocity || globalConfig.maxVelocity || 1000,
            
            // 空气阻力系数
            airResistance: config.airResistance || globalConfig.airResistance || 0.999,
            
            // 旋转表面摩擦系数
            rotationalFriction: config.rotationalFriction || globalConfig.rotationalFriction || 0.3,
            
            // 表面速度传递系数
            surfaceDragEffect: config.surfaceDragEffect || globalConfig.surfaceDragEffect || 0.15
        };

        // 监听配置变更
        if (typeof window !== 'undefined' && window.configManager) {
            this._setupConfigListeners();
        }

        // 性能监控
        this.performanceStats = {
            updateCount: 0,
            totalUpdateTime: 0,
            averageUpdateTime: 0
        };

        // Scale factor for responsive design
        this.scaleFactor = 1.0;

        // Debug logging
        if (typeof window !== 'undefined') {
            console.log('PhysicsEngine initialized with config:', this.config);
        }
    }

    /**
     * Set scale factor for responsive physics
     * @param {number} scaleFactor - Scale factor for physics parameters
     */
    setScaleFactor(scaleFactor) {
        if (!isFinite(scaleFactor) || scaleFactor <= 0) {
            console.warn('Invalid scale factor:', scaleFactor);
            return;
        }
        
        this.scaleFactor = scaleFactor;
        console.log('PhysicsEngine scale factor updated to:', scaleFactor);
    }

    /**
     * Get current scale factor
     * @returns {number} Current scale factor
     */
    getScaleFactor() {
        return this.scaleFactor;
    }

    /**
     * 更新物理系统
     * @param {Ball} ball - 小球对象
     * @param {Hexagon} hexagon - 六边形容器（可选，用于碰撞检测）
     * @param {number} deltaTime - 时间步长（秒）
     */
    update(ball, hexagon, deltaTime) {
        const startTime = performance.now();

        try {
            // 验证输入参数
            if (!ball) {
                throw new Error('Ball object is required');
            }
            
            if (!this._isValidDeltaTime(deltaTime)) {
                console.warn(`Invalid deltaTime: ${deltaTime}, skipping physics update`);
                return;
            }

            // 验证小球状态
            this._validateBallState(ball);

            // 应用时间缩放
            const scaledDeltaTime = deltaTime * this.config.timeScale;

            // 应用重力
            this.applyGravity(ball, scaledDeltaTime);

            // 应用摩擦力
            this.applyFriction(ball);

            // 应用空气阻力
            this.applyAirResistance(ball);

            // 验证物理计算结果
            this._validatePhysicsCalculations(ball);

            // 更新小球物理状态
            ball.update(scaledDeltaTime);

            // 再次验证更新后的状态
            this._validateBallState(ball);

            // 处理碰撞（如果提供了六边形）
            if (hexagon) {
                this.handleCollision(ball, hexagon);
            }

            // 应用速度限制
            this._limitVelocity(ball);

            // 最终状态验证
            this._validateBallState(ball);

        } catch (error) {
            console.error('Error in PhysicsEngine.update:', error);
            this._handlePhysicsError(error, ball);
        } finally {
            // 更新性能统计
            this._updatePerformanceStats(startTime);
        }
    }

    /**
     * 对小球施加重力
     * @param {Ball} ball - 小球对象
     * @param {number} deltaTime - 时间步长
     */
    applyGravity(ball, deltaTime) {
        if (!ball || !this._isValidDeltaTime(deltaTime)) {
            return;
        }

        // 创建重力向量（向下为正），应用缩放因子
        const scaledGravity = this.config.gravity * this.scaleFactor;
        const gravityForce = new Vector2D(0, scaledGravity * ball.mass);
        
        // 应用重力力
        ball.applyForce(gravityForce);

        // Debug logging
        if (this._shouldDebugLog()) {
            console.log(`Applied scaled gravity force: ${gravityForce.toString()}, scale: ${this.scaleFactor}`);
        }
    }

    /**
     * 应用摩擦力
     * @param {Ball} ball - 小球对象
     */
    applyFriction(ball) {
        if (!ball) {
            return;
        }

        // 获取当前速度
        const velocity = ball.velocity;
        const speed = velocity.magnitude();

        // 如果速度很小，直接停止
        if (speed < this.config.minVelocityThreshold) {
            ball.velocity.set(0, 0);
            return;
        }

        // 应用摩擦力（与速度方向相反）
        ball.velocity = velocity.multiply(this.config.frictionCoefficient);

        // Debug logging
        if (this._shouldDebugLog()) {
            console.log(`Applied friction, new velocity: ${ball.velocity.toString()}`);
        }
    }

    /**
     * 应用空气阻力
     * @param {Ball} ball - 小球对象
     */
    applyAirResistance(ball) {
        if (!ball) {
            return;
        }

        // 空气阻力与速度的平方成正比，方向与速度相反
        const velocity = ball.velocity;
        const speed = velocity.magnitude();

        if (speed > 0) {
            // 简化的空气阻力模型
            ball.velocity = velocity.multiply(this.config.airResistance);
        }
    }

    /**
     * 处理碰撞检测和响应
     * @param {Ball} ball - 小球对象
     * @param {Hexagon} hexagon - 六边形容器
     */
    handleCollision(ball, hexagon) {
        if (!ball || !hexagon) {
            return;
        }

        // 检查与六边形的碰撞
        const collisionInfo = hexagon.checkCollision(ball);
        
        if (collisionInfo) {
            // 如果六边形在旋转，使用旋转碰撞处理
            if (Math.abs(hexagon.rotationSpeed) > 0.001) {
                this.handleRotatingHexagonCollision(ball, hexagon, collisionInfo);
            } else {
                // 静态六边形的标准碰撞处理
                this._resolveCollision(ball, collisionInfo);
            }
            
            if (this._shouldDebugLog()) {
                console.log('Collision detected and resolved:', {
                    penetration: collisionInfo.penetration.toFixed(2),
                    normal: collisionInfo.normal.toString(),
                    ballVelocity: ball.velocity.toString(),
                    hexagonRotationSpeed: hexagon.rotationSpeed.toFixed(3)
                });
            }
        }
        
        // 备用边界检查：确保小球不会离开屏幕（安全网）
        this._applyScreenBoundaries(ball);
    }

    /**
     * 解决碰撞响应和反弹物理
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Object} collisionInfo - 碰撞信息
     */
    _resolveCollision(ball, collisionInfo) {
        const { normal, penetration, closestPoint } = collisionInfo;
        
        // 1. 位置修正：将小球推出碰撞区域
        this._correctPosition(ball, normal, penetration);
        
        // 2. 速度反弹：基于法向量计算反弹速度
        this._applyBounceResponse(ball, normal);
        
        // 3. 应用能量损失（反弹系数）
        this._applyEnergyLoss(ball);
        
        // 4. 验证反弹结果的物理正确性
        this._validateBounceResult(ball, normal);
    }

    /**
     * 修正小球位置，将其推出碰撞区域
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} normal - 碰撞法向量
     * @param {number} penetration - 穿透深度
     */
    _correctPosition(ball, normal, penetration) {
        if (penetration <= 0) return;
        
        // 将小球沿法向量方向推出，加上小的安全距离
        const correction = normal.multiply(penetration + 0.1);
        ball.position = ball.position.add(correction);
        
        if (this._shouldDebugLog()) {
            console.log(`Position corrected by: ${correction.toString()}`);
        }
    }

    /**
     * 应用基于法向量的速度反弹
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} normal - 碰撞法向量（指向小球的方向）
     */
    _applyBounceResponse(ball, normal) {
        // 计算速度在法向量上的投影（点积）
        const velocityDotNormal = ball.velocity.dot(normal);
        
        // 如果小球正在远离墙壁，不需要反弹
        if (velocityDotNormal >= 0) {
            return;
        }
        
        // 计算反弹速度：v' = v - 2(v·n)n
        // 这是完全弹性碰撞的公式，后续会应用反弹系数
        const reflection = normal.multiply(2 * velocityDotNormal);
        ball.velocity = ball.velocity.subtract(reflection);
        
        if (this._shouldDebugLog()) {
            console.log(`Velocity reflected: dot product = ${velocityDotNormal.toFixed(3)}, new velocity = ${ball.velocity.toString()}`);
        }
    }

    /**
     * 应用能量损失（反弹系数）
     * @private
     * @param {Ball} ball - 小球对象
     */
    _applyEnergyLoss(ball) {
        // 应用反弹系数，模拟能量损失
        ball.velocity = ball.velocity.multiply(this.config.restitution);
        
        // 如果速度变得很小，设为零以避免无限小的振动
        if (ball.velocity.magnitude() < this.config.minVelocityThreshold) {
            ball.velocity.set(0, 0);
            
            if (this._shouldDebugLog()) {
                console.log('Ball velocity set to zero due to low speed');
            }
        }
    }

    /**
     * 验证反弹结果的物理正确性
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} normal - 碰撞法向量
     */
    _validateBounceResult(ball, normal) {
        // 检查速度是否有效
        if (!isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
            console.error('Invalid velocity after bounce, resetting');
            ball.velocity.set(0, 0);
            return;
        }
        
        // 检查反弹后的速度方向是否合理
        // 反弹后，速度在法向量上的分量应该为正（远离墙壁）
        const velocityDotNormal = ball.velocity.dot(normal);
        if (velocityDotNormal < -0.01) { // 允许小的数值误差
            console.warn('Bounce result may be incorrect: velocity still pointing into wall');
            
            // 强制修正：确保速度不指向墙壁
            const correction = normal.multiply(-velocityDotNormal + 0.1);
            ball.velocity = ball.velocity.add(correction);
        }
        
        // 应用最大速度限制
        this._limitVelocity(ball);
    }

    /**
     * 应用考虑旋转表面的能量损失
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} surfaceVelocity - 表面速度
     */
    _applyRotationalEnergyLoss(ball, surfaceVelocity) {
        // 计算小球相对于表面的速度
        const relativeSpeed = ball.velocity.subtract(surfaceVelocity).magnitude();
        
        // 如果相对速度很小，应用标准能量损失
        if (relativeSpeed < 1.0) {
            this._applyEnergyLoss(ball);
            return;
        }
        
        // 对于旋转表面，能量损失可能较小（因为表面在传递能量）
        const rotationalRestitution = Math.min(this.config.restitution * 1.1, 0.95);
        ball.velocity = ball.velocity.multiply(rotationalRestitution);
        
        // 如果速度变得很小，设为零
        if (ball.velocity.magnitude() < this.config.minVelocityThreshold) {
            ball.velocity.set(0, 0);
        }
    }

    /**
     * 验证旋转碰撞的反弹结果
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} normal - 碰撞法向量
     * @param {Vector2D} surfaceVelocity - 表面速度
     */
    _validateRotationalBounceResult(ball, normal, surfaceVelocity) {
        // 首先进行标准验证
        this._validateBounceResult(ball, normal);
        
        // 额外验证：检查相对速度的合理性
        const relativeVelocity = ball.velocity.subtract(surfaceVelocity);
        const relativeVelocityDotNormal = relativeVelocity.dot(normal);
        
        // 相对速度在法向量上的分量应该为正（远离表面）
        if (relativeVelocityDotNormal < -0.01) {
            console.warn('Rotational bounce result may be incorrect: relative velocity pointing into surface');
            
            // 修正相对速度
            const correction = normal.multiply(-relativeVelocityDotNormal + 0.1);
            ball.velocity = ball.velocity.add(correction);
        }
        
        // 检查速度是否过大（可能由于旋转表面的能量传递）
        const maxReasonableSpeed = this.config.maxVelocity * 0.8;
        if (ball.velocity.magnitude() > maxReasonableSpeed) {
            console.warn('Ball velocity too high after rotational collision, limiting');
            ball.velocity = ball.velocity.normalize().multiply(maxReasonableSpeed);
        }
    }

    /**
     * 设置物理参数
     * @param {string} parameter - 参数名
     * @param {number} value - 参数值
     */
    setParameter(parameter, value) {
        if (this.config.hasOwnProperty(parameter)) {
            const oldValue = this.config[parameter];
            this.config[parameter] = value;
            
            if (typeof window !== 'undefined') {
                console.log(`Physics parameter '${parameter}' changed from ${oldValue} to ${value}`);
            }
        } else {
            console.warn(`Unknown physics parameter: ${parameter}`);
        }
    }

    /**
     * 获取物理参数
     * @param {string} parameter - 参数名
     * @returns {number} 参数值
     */
    getParameter(parameter) {
        return this.config[parameter];
    }

    /**
     * 重置物理引擎状态
     */
    reset() {
        this.performanceStats = {
            updateCount: 0,
            totalUpdateTime: 0,
            averageUpdateTime: 0
        };

        if (typeof window !== 'undefined') {
            console.log('PhysicsEngine reset');
        }
    }

    /**
     * 获取性能统计信息
     * @returns {Object} 性能统计数据
     */
    getPerformanceStats() {
        return { ...this.performanceStats };
    }

    /**
     * 计算小球的总能量（动能 + 势能）
     * @param {Ball} ball - 小球对象
     * @param {number} referenceHeight - 参考高度（用于计算势能）
     * @returns {number} 总能量
     */
    calculateTotalEnergy(ball, referenceHeight = 0) {
        if (!ball) {
            return 0;
        }

        // 动能 = 1/2 * m * v²
        const kineticEnergy = ball.getKineticEnergy();

        // 势能 = m * g * h（以参考高度为基准）
        const height = referenceHeight - ball.position.y; // Y轴向下为正
        const potentialEnergy = ball.mass * (this.config.gravity / 50) * height; // 还原重力缩放

        return kineticEnergy + potentialEnergy;
    }

    /**
     * 应用冲量到小球
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} impulse - 冲量向量
     */
    applyImpulse(ball, impulse) {
        if (!ball || !impulse) {
            return;
        }

        // 冲量 = 质量 * 速度变化
        // 速度变化 = 冲量 / 质量
        const velocityChange = impulse.multiply(1 / ball.mass);
        ball.velocity = ball.velocity.add(velocityChange);

        // 应用速度限制
        this._limitVelocity(ball);

        if (this._shouldDebugLog()) {
            console.log(`Applied impulse: ${impulse.toString()}, velocity change: ${velocityChange.toString()}`);
        }
    }

    // 私有方法

    /**
     * 验证时间步长的有效性
     * @private
     * @param {number} deltaTime - 时间步长
     * @returns {boolean} 是否有效
     */
    _isValidDeltaTime(deltaTime) {
        return isFinite(deltaTime) && deltaTime > 0 && deltaTime < 1; // 最大1秒
    }
    
    /**
     * 验证小球状态的有效性
     * @private
     * @param {Ball} ball - 小球对象
     */
    _validateBallState(ball) {
        if (!ball) {
            throw new Error('Ball object is null or undefined');
        }
        
        if (!ball.position || !ball.velocity || !ball.acceleration) {
            throw new Error('Ball missing required properties (position, velocity, acceleration)');
        }
        
        // 验证位置
        if (!isFinite(ball.position.x) || !isFinite(ball.position.y)) {
            throw new Error(`Invalid ball position: x=${ball.position.x}, y=${ball.position.y}`);
        }
        
        // 验证速度
        if (!isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
            console.warn(`Invalid ball velocity detected: x=${ball.velocity.x}, y=${ball.velocity.y}`);
            ball.velocity.set(0, 0);
        }
        
        // 验证加速度
        if (!isFinite(ball.acceleration.x) || !isFinite(ball.acceleration.y)) {
            console.warn(`Invalid ball acceleration detected: x=${ball.acceleration.x}, y=${ball.acceleration.y}`);
            ball.acceleration.set(0, 0);
        }
        
        // 验证质量和半径
        if (!isFinite(ball.mass) || ball.mass <= 0) {
            console.warn(`Invalid ball mass: ${ball.mass}, setting to 1`);
            ball.mass = 1;
        }
        
        if (!isFinite(ball.radius) || ball.radius <= 0) {
            console.warn(`Invalid ball radius: ${ball.radius}, setting to 10`);
            ball.radius = 10;
        }
    }
    
    /**
     * 验证物理计算结果
     * @private
     * @param {Ball} ball - 小球对象
     */
    _validatePhysicsCalculations(ball) {
        // 检查速度是否过大
        const speed = ball.velocity.magnitude();
        if (speed > this.config.maxVelocity * 2) {
            console.warn(`Extremely high ball speed detected: ${speed.toFixed(2)}, limiting`);
            ball.velocity = ball.velocity.normalize().multiply(this.config.maxVelocity);
        }
        
        // 检查加速度是否合理
        const acceleration = ball.acceleration.magnitude();
        const maxAcceleration = this.config.gravity * 10; // 10倍重力加速度作为上限
        if (acceleration > maxAcceleration) {
            console.warn(`Extremely high acceleration detected: ${acceleration.toFixed(2)}, limiting`);
            ball.acceleration = ball.acceleration.normalize().multiply(maxAcceleration);
        }
        
        // 检查能量是否合理（简单检查）
        const kineticEnergy = ball.getKineticEnergy();
        const maxReasonableEnergy = 1000000; // 设定一个合理的能量上限
        if (kineticEnergy > maxReasonableEnergy) {
            console.warn(`Extremely high kinetic energy detected: ${kineticEnergy.toFixed(2)}, reducing velocity`);
            ball.velocity = ball.velocity.multiply(0.5);
        }
    }
    
    /**
     * 处理物理引擎错误
     * @private
     * @param {Error} error - 错误对象
     * @param {Ball} ball - 小球对象
     */
    _handlePhysicsError(error, ball) {
        console.error('PhysicsEngine error:', error);
        
        // 尝试恢复小球到安全状态
        if (ball) {
            try {
                // 重置到安全的默认状态
                if (!isFinite(ball.position.x) || !isFinite(ball.position.y)) {
                    ball.position.set(0, 0);
                    console.log('Ball position reset to origin due to invalid values');
                }
                
                if (!isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
                    ball.velocity.set(0, 0);
                    console.log('Ball velocity reset to zero due to invalid values');
                }
                
                if (!isFinite(ball.acceleration.x) || !isFinite(ball.acceleration.y)) {
                    ball.acceleration.set(0, 0);
                    console.log('Ball acceleration reset to zero due to invalid values');
                }
                
                // 确保基本属性有效
                if (!isFinite(ball.mass) || ball.mass <= 0) {
                    ball.mass = 1;
                }
                
                if (!isFinite(ball.radius) || ball.radius <= 0) {
                    ball.radius = 10;
                }
                
            } catch (recoveryError) {
                console.error('Failed to recover ball state:', recoveryError);
            }
        }
        
        // 记录错误统计
        this.performanceStats.errorCount = (this.performanceStats.errorCount || 0) + 1;
        this.performanceStats.lastError = {
            message: error.message,
            timestamp: Date.now()
        };
    }

    /**
     * 限制小球速度
     * @private
     * @param {Ball} ball - 小球对象
     */
    _limitVelocity(ball) {
        const speed = ball.velocity.magnitude();
        if (speed > this.config.maxVelocity) {
            ball.velocity = ball.velocity.normalize().multiply(this.config.maxVelocity);
            
            if (this._shouldDebugLog()) {
                console.warn(`Ball velocity limited to ${this.config.maxVelocity}`);
            }
        }
    }

    /**
     * 应用屏幕边界限制（临时解决方案）
     * @private
     * @param {Ball} ball - 小球对象
     */
    _applyScreenBoundaries(ball) {
        // 这是一个临时的边界检查，防止小球飞出屏幕
        // 实际的六边形碰撞检测将在后续任务中实现
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const bounds = {
            left: ball.radius,
            right: canvas.width - ball.radius,
            top: ball.radius,
            bottom: canvas.height - ball.radius
        };

        let bounced = false;

        // 左右边界
        if (ball.position.x <= bounds.left) {
            ball.position.x = bounds.left;
            ball.velocity.x = Math.abs(ball.velocity.x) * this.config.restitution;
            bounced = true;
        } else if (ball.position.x >= bounds.right) {
            ball.position.x = bounds.right;
            ball.velocity.x = -Math.abs(ball.velocity.x) * this.config.restitution;
            bounced = true;
        }

        // 上下边界
        if (ball.position.y <= bounds.top) {
            ball.position.y = bounds.top;
            ball.velocity.y = Math.abs(ball.velocity.y) * this.config.restitution;
            bounced = true;
        } else if (ball.position.y >= bounds.bottom) {
            ball.position.y = bounds.bottom;
            ball.velocity.y = -Math.abs(ball.velocity.y) * this.config.restitution;
            bounced = true;
        }

        if (bounced && this._shouldDebugLog()) {
            console.log('Ball bounced off screen boundary');
        }
    }

    /**
     * 更新性能统计
     * @private
     * @param {number} startTime - 开始时间
     */
    _updatePerformanceStats(startTime) {
        const updateTime = performance.now() - startTime;
        this.performanceStats.updateCount++;
        this.performanceStats.totalUpdateTime += updateTime;
        this.performanceStats.averageUpdateTime = 
            this.performanceStats.totalUpdateTime / this.performanceStats.updateCount;

        // 每1000次更新输出一次性能统计
        if (this.performanceStats.updateCount % 1000 === 0 && typeof window !== 'undefined') {
            console.log(`PhysicsEngine performance: avg ${this.performanceStats.averageUpdateTime.toFixed(3)}ms per update`);
        }
    }

    /**
     * 判断是否应该输出调试日志
     * @private
     * @returns {boolean}
     */
    _shouldDebugLog() {
        return typeof window !== 'undefined' && window.DEBUG_PHYSICS;
    }

    /**
     * 获取默认物理配置
     * @private
     * @returns {Object} 默认物理配置
     */
    _getDefaultPhysicsConfig() {
        return {
            gravity: 9.81 * 50,
            frictionCoefficient: 0.98,
            restitution: 0.8,
            timeScale: 1.0,
            minVelocityThreshold: 0.1,
            maxVelocity: 1000,
            airResistance: 0.999,
            rotationalFriction: 0.3,
            surfaceDragEffect: 0.15
        };
    }

    /**
     * 设置配置监听器
     * @private
     */
    _setupConfigListeners() {
        const configManager = window.configManager;
        
        // 监听物理配置变更
        configManager.addListener('physics', (newValue, oldValue, path) => {
            const configKey = path.split('.').pop();
            if (this.config.hasOwnProperty(configKey)) {
                this.config[configKey] = newValue;
                console.log(`PhysicsEngine config updated: ${configKey} = ${newValue}`);
            }
        });
    }

    /**
     * 更新物理配置
     * @param {Object} newConfig - 新的配置参数
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('PhysicsEngine config updated:', newConfig);
    }

    /**
     * 限制小球速度（公共方法，供测试使用）
     * @param {Ball} ball - 小球对象
     */
    limitVelocity(ball) {
        this._limitVelocity(ball);
    }

    /**
     * 验证物理状态（公共方法，供测试使用）
     * @param {Ball} ball - 小球对象
     */
    validatePhysicsState(ball) {
        this._validateBallState(ball);
    }

    /**
     * 静态方法：创建默认配置的物理引擎
     * @returns {PhysicsEngine} 物理引擎实例
     */
    static createDefault() {
        return new PhysicsEngine();
    }

    /**
     * 静态方法：创建高摩擦配置的物理引擎
     * @returns {PhysicsEngine} 物理引擎实例
     */
    static createHighFriction() {
        return new PhysicsEngine({
            gravity: 9.81 * 50,
            frictionCoefficient: 0.95, // 更高摩擦
            restitution: 0.6,          // 更低弹性
            timeScale: 1.0,
            minVelocityThreshold: 0.5,
            maxVelocity: 800,
            airResistance: 0.995       // 更高空气阻力
        });
    }

    /**
     * 静态方法：创建低重力配置的物理引擎
     * @returns {PhysicsEngine} 物理引擎实例
     */
    static createLowGravity() {
        return new PhysicsEngine({
            gravity: 9.81 * 20,        // 更低重力
            frictionCoefficient: 0.99,
            restitution: 0.9,          // 更高弹性
            timeScale: 1.0,
            minVelocityThreshold: 0.05,
            maxVelocity: 1200,
            airResistance: 0.9995      // 更低空气阻力
        });
    }

    /**
     * 处理与旋转六边形的碰撞
     * 考虑六边形的旋转速度对碰撞的影响
     * @param {Ball} ball - 小球对象
     * @param {Hexagon} hexagon - 旋转的六边形容器
     * @param {Object} collisionInfo - 碰撞信息
     */
    handleRotatingHexagonCollision(ball, hexagon, collisionInfo) {
        if (!ball || !hexagon || !collisionInfo) {
            return;
        }

        const { normal, closestPoint, penetration, surfaceVelocity } = collisionInfo;
        
        // 保存碰撞前的状态用于验证
        const velocityBefore = ball.velocity.clone();
        
        // 1. 首先进行位置修正，将小球推出碰撞区域
        this._correctPosition(ball, normal, penetration);
        
        // 2. 使用六边形提供的表面速度信息
        const tangentialVelocity = surfaceVelocity || hexagon.getSurfaceVelocityAtPoint(closestPoint);
        
        // 3. 应用考虑旋转的碰撞响应
        this._applyRotationalCollisionResponse(ball, normal, tangentialVelocity);
        
        // 4. 应用能量损失（但考虑旋转表面的能量传递）
        this._applyRotationalEnergyLoss(ball, tangentialVelocity);
        
        // 5. 验证反弹结果
        this._validateRotationalBounceResult(ball, normal, tangentialVelocity);
        
        // 6. 验证物理合理性
        if (this._shouldDebugLog()) {
            const energyBefore = 0.5 * ball.mass * velocityBefore.magnitude() ** 2;
            const energyAfter = ball.getKineticEnergy();
            const energyChange = ((energyAfter - energyBefore) / energyBefore * 100).toFixed(1);
            
            console.log('Rotating hexagon collision:', {
                penetration: penetration.toFixed(2),
                normal: normal.toString(),
                surfaceVelocity: tangentialVelocity.toString(),
                rotationSpeed: hexagon.rotationSpeed.toFixed(3),
                velocityBefore: velocityBefore.toString(),
                velocityAfter: ball.velocity.toString(),
                energyChange: energyChange + '%',
                edgeIndex: collisionInfo.edgeIndex
            });
        }
    }

    /**
     * 应用考虑旋转的碰撞响应
     * @private
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} normal - 碰撞法向量
     * @param {Vector2D} tangentialVelocity - 碰撞点的切向速度
     */
    _applyRotationalCollisionResponse(ball, normal, tangentialVelocity) {
        // 保存碰撞前的速度用于调试
        const velocityBefore = ball.velocity.clone();
        
        // 计算小球相对于旋转表面的速度
        const relativeVelocity = ball.velocity.subtract(tangentialVelocity);
        
        // 计算相对速度在法向量上的分量
        const relativeVelocityDotNormal = relativeVelocity.dot(normal);
        
        // 如果小球正在远离表面，不需要反弹
        if (relativeVelocityDotNormal >= 0) {
            // 但仍然可能需要传递一些切向速度（摩擦效果）
            if (tangentialVelocity.magnitude() > 0.1) {
                const frictionTransfer = tangentialVelocity.multiply(0.05); // 5%的切向速度传递
                ball.velocity = ball.velocity.add(frictionTransfer);
            }
            return;
        }
        
        // 计算反弹后的法向速度分量
        const newNormalVelocity = -relativeVelocityDotNormal * this.config.restitution;
        
        // 计算相对速度的切向分量
        const tangentialComponent = relativeVelocity.subtract(normal.multiply(relativeVelocityDotNormal));
        
        // 应用摩擦到切向分量
        const frictionCoeff = this.config.rotationalFriction; // 旋转表面的摩擦系数
        const tangentialAfterFriction = tangentialComponent.multiply(1 - frictionCoeff);
        
        // 重新组合速度：新的法向分量 + 摩擦后的切向分量 + 表面切向速度
        const newRelativeVelocity = normal.multiply(newNormalVelocity).add(tangentialAfterFriction);
        ball.velocity = newRelativeVelocity.add(tangentialVelocity);
        
        // 添加旋转表面的额外切向速度传递（模拟表面拖拽效果）
        const surfaceDragEffect = tangentialVelocity.multiply(this.config.surfaceDragEffect); // 表面速度传递
        ball.velocity = ball.velocity.add(surfaceDragEffect);
        
        if (this._shouldDebugLog()) {
            console.log('Rotational collision response details:', {
                velocityBefore: velocityBefore.toString(),
                relativeVelocity: relativeVelocity.toString(),
                tangentialVelocity: tangentialVelocity.toString(),
                relativeVelocityDotNormal: relativeVelocityDotNormal.toFixed(3),
                newNormalVelocity: newNormalVelocity.toFixed(3),
                velocityAfter: ball.velocity.toString(),
                energyBefore: (0.5 * ball.mass * velocityBefore.magnitude() ** 2).toFixed(2),
                energyAfter: ball.getKineticEnergy().toFixed(2)
            });
        }
    }

    /**
     * 计算碰撞的能量损失
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} velocityBefore - 碰撞前的速度
     * @returns {number} 能量损失百分比
     */
    calculateEnergyLoss(ball, velocityBefore) {
        const energyBefore = 0.5 * ball.mass * velocityBefore.magnitude() ** 2;
        const energyAfter = ball.getKineticEnergy();
        
        if (energyBefore === 0) return 0;
        
        const energyLoss = (energyBefore - energyAfter) / energyBefore;
        return Math.max(0, Math.min(1, energyLoss)); // 限制在0-1之间
    }

    /**
     * 检查碰撞响应的物理合理性
     * @param {Ball} ball - 小球对象
     * @param {Vector2D} normal - 碰撞法向量
     * @param {Vector2D} velocityBefore - 碰撞前速度
     * @returns {boolean} 碰撞响应是否合理
     */
    validateCollisionPhysics(ball, normal, velocityBefore) {
        // 检查能量守恒（考虑反弹系数）
        const energyBefore = 0.5 * ball.mass * velocityBefore.magnitude() ** 2;
        const energyAfter = ball.getKineticEnergy();
        const expectedEnergyAfter = energyBefore * (this.config.restitution ** 2);
        
        const energyRatio = energyAfter / expectedEnergyAfter;
        const energyValid = energyRatio >= 0.8 && energyRatio <= 1.2; // 允许20%误差
        
        // 检查动量守恒（法向分量）
        const momentumBefore = velocityBefore.dot(normal);
        const momentumAfter = ball.velocity.dot(normal);
        const expectedMomentumAfter = -momentumBefore * this.config.restitution;
        
        const momentumValid = Math.abs(momentumAfter - expectedMomentumAfter) < 0.1;
        
        if (!energyValid || !momentumValid) {
            console.warn('Collision physics validation failed:', {
                energyValid,
                momentumValid,
                energyRatio: energyRatio.toFixed(3),
                momentumBefore: momentumBefore.toFixed(3),
                momentumAfter: momentumAfter.toFixed(3),
                expectedMomentumAfter: expectedMomentumAfter.toFixed(3)
            });
        }
        
        return energyValid && momentumValid;
    }
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}