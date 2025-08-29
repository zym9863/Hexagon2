/**
 * Ball - 小球物理对象类
 * 管理小球的位置、速度、加速度和物理属性
 */
class Ball {
    /**
     * 创建一个小球实例
     * @param {number} x - 初始X坐标
     * @param {number} y - 初始Y坐标
     * @param {number} radius - 小球半径（可选，会使用配置中的值）
     * @param {number} mass - 小球质量（可选，会使用配置中的值）
     */
    constructor(x = 0, y = 0, radius = null, mass = null) {
        // 获取全局配置
        const globalConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('ball') 
            : this._getDefaultBallConfig();
        
        // 位置向量
        this.position = new Vector2D(x, y);
        
        // 速度向量
        this.velocity = new Vector2D(0, 0);
        
        // 加速度向量
        this.acceleration = new Vector2D(0, 0);
        
        // 物理属性
        this.radius = radius || globalConfig.radius || 10;
        this.mass = mass || globalConfig.mass || 1;
        
        // 渲染属性
        this.color = globalConfig.color || '#FF5722';
        this.strokeColor = globalConfig.strokeColor || '#D32F2F';
        this.strokeWidth = globalConfig.strokeWidth || 2;
        
        // 物理常数
        const physicsConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('physics') 
            : { maxVelocity: 1000 };
        this.MAX_VELOCITY = physicsConfig.maxVelocity || 1000; // 最大速度限制，防止数值溢出

        // 监听配置变更
        if (typeof window !== 'undefined' && window.configManager) {
            this._setupConfigListeners();
        }
        
        // Debug logging (only in browser environment)
        if (typeof window !== 'undefined') {
            console.log(`Ball created at (${x}, ${y}) with radius ${this.radius} and mass ${this.mass}`);
        }
    }

    /**
     * 更新小球的物理状态
     * @param {number} deltaTime - 时间步长（秒）
     */
    update(deltaTime) {
        // 验证时间步长
        if (!isFinite(deltaTime) || deltaTime <= 0) {
            console.warn('Invalid deltaTime in Ball.update:', deltaTime);
            return;
        }

        // 根据加速度更新速度 (v = v0 + a*t)
        this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
        
        // 速度限制，防止数值溢出
        this._limitVelocity();
        
        // 根据速度更新位置 (s = s0 + v*t)
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // 验证位置数值
        this._validatePosition();
        
        // 重置加速度（每帧重新计算）
        this.acceleration.set(0, 0);
    }

    /**
     * 对小球施加力
     * @param {Vector2D} force - 力向量
     */
    applyForce(force) {
        if (!force || !isFinite(force.x) || !isFinite(force.y)) {
            console.warn('Invalid force applied to ball:', force);
            return;
        }
        
        // F = ma, 所以 a = F/m
        const acceleration = force.multiply(1 / this.mass);
        this.acceleration = this.acceleration.add(acceleration);
    }

    /**
     * 设置小球位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        if (!isFinite(x) || !isFinite(y)) {
            console.warn('Invalid position values:', x, y);
            return;
        }
        
        this.position.set(x, y);
        if (typeof window !== 'undefined') {
            console.log(`Ball position set to (${x}, ${y})`);
        }
    }

    /**
     * 设置小球速度
     * @param {number} vx - X方向速度
     * @param {number} vy - Y方向速度
     */
    setVelocity(vx, vy) {
        if (!isFinite(vx) || !isFinite(vy)) {
            console.warn('Invalid velocity values:', vx, vy);
            return;
        }
        
        this.velocity.set(vx, vy);
        this._limitVelocity();
        if (typeof window !== 'undefined') {
            console.log(`Ball velocity set to (${vx}, ${vy})`);
        }
    }

    /**
     * 获取小球的动能
     * @returns {number} 动能值
     */
    getKineticEnergy() {
        const speed = this.velocity.magnitude();
        return 0.5 * this.mass * speed * speed;
    }

    /**
     * 获取小球的动量
     * @returns {Vector2D} 动量向量
     */
    getMomentum() {
        return this.velocity.multiply(this.mass);
    }

    /**
     * 渲染小球
     * @param {Renderer} renderer - 渲染器实例
     */
    render(renderer) {
        if (!renderer) {
            console.error('Renderer is required for Ball.render()');
            return;
        }

        // 绘制小球主体和边框
        renderer.drawCircle(
            this.position.x, 
            this.position.y, 
            this.radius, 
            this.color,
            this.strokeWidth > 0 ? this.strokeColor : null,
            this.strokeWidth
        );

        // 可选：绘制速度向量（调试用）
        if (this._shouldDrawVelocityVector()) {
            this._drawVelocityVector(renderer);
        }
    }

    /**
     * 检查小球是否在指定的六边形内部
     * @param {Hexagon} hexagon - 六边形实例
     * @returns {boolean} 是否在内部
     */
    isInsideHexagon(hexagon) {
        if (!hexagon) {
            console.warn('Hexagon is required for Ball.isInsideHexagon()');
            return false;
        }
        
        return hexagon.isPointInside(this.position);
    }

    /**
     * 获取小球的边界框
     * @returns {Object} 边界框 {minX, minY, maxX, maxY}
     */
    getBoundingBox() {
        return {
            minX: this.position.x - this.radius,
            minY: this.position.y - this.radius,
            maxX: this.position.x + this.radius,
            maxY: this.position.y + this.radius
        };
    }

    /**
     * 复制小球实例
     * @returns {Ball} 小球的副本
     */
    clone() {
        const ball = new Ball(
            this.position.x,
            this.position.y,
            this.radius,
            this.mass
        );
        
        ball.velocity = this.velocity.clone();
        ball.acceleration = this.acceleration.clone();
        ball.color = this.color;
        ball.strokeColor = this.strokeColor;
        ball.strokeWidth = this.strokeWidth;
        
        return ball;
    }

    /**
     * 获取小球状态的字符串表示
     * @returns {string} 状态字符串
     */
    toString() {
        return `Ball(pos: ${this.position.toString()}, vel: ${this.velocity.toString()}, r: ${this.radius})`;
    }

    // 私有方法

    /**
     * 限制速度大小，防止数值溢出
     * @private
     */
    _limitVelocity() {
        const speed = this.velocity.magnitude();
        if (speed > this.MAX_VELOCITY) {
            this.velocity = this.velocity.normalize().multiply(this.MAX_VELOCITY);
            console.warn(`Ball velocity limited to ${this.MAX_VELOCITY}`);
        }
    }

    /**
     * 验证位置数值的有效性
     * @private
     */
    _validatePosition() {
        if (!isFinite(this.position.x) || !isFinite(this.position.y)) {
            console.error('Invalid ball position detected:', this.position);
            // 重置到原点
            this.position.set(0, 0);
            this.velocity.set(0, 0);
        }
    }

    /**
     * 判断是否应该绘制速度向量（调试模式）
     * @private
     * @returns {boolean}
     */
    _shouldDrawVelocityVector() {
        // 可以通过全局变量或配置控制
        return window.DEBUG_BALL_VELOCITY || false;
    }

    /**
     * 绘制速度向量（调试用）
     * @private
     * @param {Renderer} renderer - 渲染器实例
     */
    _drawVelocityVector(renderer) {
        const scale = 0.1; // 速度向量显示比例
        const endPoint = this.position.add(this.velocity.multiply(scale));
        
        // 绘制速度向量线
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(this.position.x, this.position.y);
        renderer.ctx.lineTo(endPoint.x, endPoint.y);
        renderer.ctx.strokeStyle = '#00BCD4';
        renderer.ctx.lineWidth = 2;
        renderer.ctx.stroke();
        
        // 绘制箭头头部
        const arrowSize = 5;
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(endPoint.x, endPoint.y);
        renderer.ctx.lineTo(
            endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
            endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        renderer.ctx.moveTo(endPoint.x, endPoint.y);
        renderer.ctx.lineTo(
            endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
            endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        renderer.ctx.stroke();
    }

    /**
     * 获取默认小球配置
     * @private
     * @returns {Object} 默认小球配置
     */
    _getDefaultBallConfig() {
        return {
            radius: 10,
            mass: 1,
            color: '#FF5722',
            strokeColor: '#D32F2F',
            strokeWidth: 2
        };
    }

    /**
     * 设置配置监听器
     * @private
     */
    _setupConfigListeners() {
        const configManager = window.configManager;
        
        // 监听小球配置变更
        configManager.addListener('ball.color', (newValue) => {
            this.color = newValue;
        });
        
        configManager.addListener('ball.strokeColor', (newValue) => {
            this.strokeColor = newValue;
        });
        
        configManager.addListener('ball.strokeWidth', (newValue) => {
            this.strokeWidth = newValue;
        });
        
        // 监听物理配置变更
        configManager.addListener('physics.maxVelocity', (newValue) => {
            this.MAX_VELOCITY = newValue;
        });
    }

    /**
     * 更新小球配置
     * @param {Object} newConfig - 新的配置参数
     */
    updateConfig(newConfig) {
        if (newConfig.color !== undefined) {
            this.color = newConfig.color;
        }
        if (newConfig.strokeColor !== undefined) {
            this.strokeColor = newConfig.strokeColor;
        }
        if (newConfig.strokeWidth !== undefined) {
            this.strokeWidth = newConfig.strokeWidth;
        }
        
        console.log('Ball config updated:', newConfig);
    }

    /**
     * 静态方法：创建一个在六边形内部的随机位置的小球
     * @param {Hexagon} hexagon - 六边形实例
     * @param {number} radius - 小球半径（可选）
     * @param {number} mass - 小球质量（可选）
     * @returns {Ball} 新的小球实例
     */
    static createInsideHexagon(hexagon, radius = null, mass = null) {
        if (!hexagon) {
            console.error('Hexagon is required for Ball.createInsideHexagon()');
            return new Ball(0, 0, radius, mass);
        }

        // 获取六边形的边界框
        const bbox = hexagon.getBoundingBox();
        const maxAttempts = 100;
        let attempts = 0;

        // 尝试在六边形内部找到一个有效位置
        while (attempts < maxAttempts) {
            // 在边界框内生成随机位置
            const x = bbox.minX + Math.random() * (bbox.maxX - bbox.minX);
            const y = bbox.minY + Math.random() * (bbox.maxY - bbox.minY);
            
            const testPoint = new Vector2D(x, y);
            
            // 检查点是否在六边形内部，且距离边界有足够距离
            if (hexagon.isPointInside(testPoint)) {
                // 检查距离边界是否足够远（至少是小球半径的距离）
                const distanceToEdge = hexagon.getDistanceToNearestEdge(testPoint);
                const ballRadius = radius || (typeof window !== 'undefined' && window.configManager ? window.configManager.get('ball.radius') : 10);
                if (distanceToEdge >= ballRadius + 5) { // 额外5像素的安全距离
                    const ball = new Ball(x, y, radius, mass);
                    if (typeof window !== 'undefined') {
                        console.log(`Ball created inside hexagon at (${x.toFixed(2)}, ${y.toFixed(2)})`);
                    }
                    return ball;
                }
            }
            
            attempts++;
        }

        // 如果无法找到合适位置，使用六边形中心
        console.warn('Could not find suitable position inside hexagon, using center');
        return new Ball(hexagon.center.x, hexagon.center.y, radius, mass);
    }
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ball;
}