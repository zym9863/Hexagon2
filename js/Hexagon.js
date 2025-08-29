/**
 * Hexagon class - 管理六边形容器的几何和物理属性
 * 负责六边形的顶点计算、旋转变换和渲染
 */
class Hexagon {
    /**
     * 构造函数
     * @param {number} centerX - 六边形中心X坐标
     * @param {number} centerY - 六边形中心Y坐标
     * @param {number} radius - 六边形外接圆半径（可选，会使用配置中的值）
     */
    constructor(centerX, centerY, radius = null) {
        this.center = new Vector2D(centerX, centerY);
        
        // 获取全局配置
        const globalConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('hexagon') 
            : this._getDefaultHexagonConfig();
        
        this.radius = radius || globalConfig.radius || 200;
        this.rotation = 0; // 当前旋转角度（弧度）
        this.rotationSpeed = globalConfig.rotationSpeed || 0.5; // 旋转速度（弧度/秒）
        
        // 渲染属性
        this.strokeWidth = globalConfig.strokeWidth || 3;
        this.strokeColor = globalConfig.strokeColor || '#2196F3';
        this.fillColor = globalConfig.fillColor || 'transparent';

        // 监听配置变更
        if (typeof window !== 'undefined' && window.configManager) {
            this._setupConfigListeners();
        }
    }

    /**
     * 更新六边形旋转
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        this.rotation += this.rotationSpeed * deltaTime;
        // 保持角度在 0-2π 范围内
        this.rotation = this.rotation % (2 * Math.PI);
    }

    /**
     * 设置旋转角度
     * @param {number} angle - 旋转角度（弧度）
     */
    rotate(angle) {
        this.rotation = angle;
    }

    /**
     * 计算六边形的六个顶点坐标
     * @returns {Vector2D[]} 六个顶点的坐标数组
     */
    getVertices() {
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            // 六边形每个内角为60度，即π/3弧度
            const angle = (i * Math.PI) / 3 + this.rotation;
            const x = this.center.x + this.radius * Math.cos(angle);
            const y = this.center.y + this.radius * Math.sin(angle);
            vertices.push(new Vector2D(x, y));
        }
        return vertices;
    }

    /**
     * 获取六边形的边（线段）
     * @returns {Array} 边的数组，每个边包含起点和终点
     */
    getEdges() {
        const vertices = this.getVertices();
        const edges = [];
        
        for (let i = 0; i < vertices.length; i++) {
            const start = vertices[i];
            const end = vertices[(i + 1) % vertices.length]; // 最后一个顶点连接到第一个
            edges.push({ start, end });
        }
        
        return edges;
    }

    /**
     * 检查点是否在六边形内部
     * 使用射线投射算法
     * @param {Vector2D} point - 要检查的点
     * @returns {boolean} 点是否在六边形内部
     */
    isPointInside(point) {
        const vertices = this.getVertices();
        let inside = false;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const vi = vertices[i];
            const vj = vertices[j];
            
            if (((vi.y > point.y) !== (vj.y > point.y)) &&
                (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x)) {
                inside = !inside;
            }
        }
        
        return inside;
    }

    /**
     * 检查圆形对象（如小球）是否与六边形发生碰撞
     * @param {Object} ball - 小球对象，包含position和radius属性
     * @returns {Object|null} 碰撞信息或null（如果没有碰撞）
     */
    checkCollision(ball) {
        const edges = this.getEdges();
        let minDistance = Infinity;
        let collisionInfo = null;
        let collisionEdgeIndex = -1;
        
        // 检查与每条边的距离
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const info = this.getDistanceToEdge(ball.position, edge.start, edge.end);
            
            if (info.distance < ball.radius && info.distance < minDistance) {
                minDistance = info.distance;
                collisionEdgeIndex = i;
                collisionInfo = {
                    distance: info.distance,
                    normal: info.normal,
                    closestPoint: info.closestPoint,
                    penetration: ball.radius - info.distance,
                    edgeIndex: i,
                    edgeStart: edge.start,
                    edgeEnd: edge.end
                };
            }
        }
        
        // 如果发生碰撞且六边形在旋转，添加旋转相关信息
        if (collisionInfo && Math.abs(this.rotationSpeed) > 0.001) {
            collisionInfo.surfaceVelocity = this.getSurfaceVelocityAtPoint(collisionInfo.closestPoint);
            collisionInfo.isRotating = true;
        } else if (collisionInfo) {
            collisionInfo.surfaceVelocity = new Vector2D(0, 0);
            collisionInfo.isRotating = false;
        }
        
        return collisionInfo;
    }

    /**
     * 计算点到线段的最短距离和法向量
     * @param {Vector2D} point - 点坐标
     * @param {Vector2D} lineStart - 线段起点
     * @param {Vector2D} lineEnd - 线段终点
     * @returns {Object} 包含距离、法向量和最近点的对象
     */
    getDistanceToEdge(point, lineStart, lineEnd) {
        const line = lineEnd.subtract(lineStart);
        const pointToStart = point.subtract(lineStart);
        
        // 计算点在线段上的投影
        const lineLength = line.magnitude();
        if (lineLength === 0) {
            // 线段长度为0，返回到起点的距离
            const distance = pointToStart.magnitude();
            const normal = distance > 0 ? pointToStart.normalize() : new Vector2D(0, -1);
            return { distance, normal, closestPoint: lineStart };
        }
        
        const projection = pointToStart.dot(line) / (lineLength * lineLength);
        
        // 限制投影在线段范围内
        const clampedProjection = Math.max(0, Math.min(1, projection));
        const closestPoint = lineStart.add(line.multiply(clampedProjection));
        
        const distanceVector = point.subtract(closestPoint);
        const distance = distanceVector.magnitude();
        const normal = distance > 0 ? distanceVector.normalize() : new Vector2D(0, -1);
        
        return { distance, normal, closestPoint };
    }

    /**
     * 渲染六边形
     * @param {Renderer} renderer - 渲染器对象
     */
    render(renderer) {
        const vertices = this.getVertices();
        renderer.drawPolygon(vertices, this.fillColor, this.strokeColor, this.strokeWidth);
    }

    /**
     * 设置六边形的渲染样式
     * @param {string} strokeColor - 边框颜色
     * @param {string} fillColor - 填充颜色
     * @param {number} strokeWidth - 边框宽度
     */
    setStyle(strokeColor, fillColor, strokeWidth) {
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.strokeWidth = strokeWidth;
    }

    /**
     * 设置旋转速度
     * @param {number} speed - 旋转速度（弧度/秒）
     */
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }

    /**
     * 获取点到六边形最近边的距离
     * @param {Vector2D} point - 要检查的点
     * @returns {number} 到最近边的距离
     */
    getDistanceToNearestEdge(point) {
        const edges = this.getEdges();
        let minDistance = Infinity;
        
        for (const edge of edges) {
            const info = this.getDistanceToEdge(point, edge.start, edge.end);
            minDistance = Math.min(minDistance, info.distance);
        }
        
        return minDistance;
    }

    /**
     * 计算六边形表面上某点的速度（由于旋转产生）
     * @param {Vector2D} point - 表面上的点
     * @returns {Vector2D} 该点的速度向量
     */
    getSurfaceVelocityAtPoint(point) {
        if (Math.abs(this.rotationSpeed) < 0.001) {
            return new Vector2D(0, 0);
        }
        
        // 计算点相对于六边形中心的位置向量
        const relativePosition = point.subtract(this.center);
        
        // 切向速度 = 角速度 × 半径，方向垂直于半径向量
        // 使用右手定则：角速度为正时逆时针旋转
        const tangentialVelocity = new Vector2D(
            -relativePosition.y * this.rotationSpeed,
            relativePosition.x * this.rotationSpeed
        );
        
        return tangentialVelocity;
    }

    /**
     * 获取六边形在指定时间后的预测位置信息
     * @param {number} deltaTime - 时间增量（秒）
     * @returns {Object} 预测的六边形信息
     */
    getPredictedState(deltaTime) {
        const predictedRotation = this.rotation + this.rotationSpeed * deltaTime;
        
        return {
            rotation: predictedRotation,
            center: this.center.clone(), // 中心位置不变
            rotationSpeed: this.rotationSpeed
        };
    }

    /**
     * 检查旋转六边形与小球的连续碰撞检测
     * 使用时间步长内的插值来提高精度
     * @param {Object} ball - 小球对象
     * @param {number} deltaTime - 时间步长
     * @returns {Object|null} 碰撞信息或null
     */
    checkContinuousCollision(ball, deltaTime) {
        // 如果六边形不旋转或时间步长很小，使用标准检测
        if (Math.abs(this.rotationSpeed) < 0.001 || deltaTime < 0.001) {
            return this.checkCollision(ball);
        }
        
        // 在时间步长内进行多次采样检测
        const samples = Math.max(2, Math.ceil(Math.abs(this.rotationSpeed * deltaTime) / (Math.PI / 12))); // 每15度一次采样
        const timeStep = deltaTime / samples;
        
        let earliestCollision = null;
        let earliestTime = Infinity;
        
        for (let i = 0; i <= samples; i++) {
            const t = i * timeStep;
            const sampleRotation = this.rotation + this.rotationSpeed * t;
            
            // 临时设置旋转角度进行检测
            const originalRotation = this.rotation;
            this.rotation = sampleRotation;
            
            const collision = this.checkCollision(ball);
            
            // 恢复原始旋转角度
            this.rotation = originalRotation;
            
            if (collision && t < earliestTime) {
                earliestTime = t;
                earliestCollision = collision;
                earliestCollision.collisionTime = t;
            }
        }
        
        return earliestCollision;
    }

    /**
     * 获取六边形的边界框
     * @returns {Object} 包含min和max坐标的边界框
     */
    getBoundingBox() {
        const vertices = this.getVertices();
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const vertex of vertices) {
            minX = Math.min(minX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxX = Math.max(maxX, vertex.x);
            maxY = Math.max(maxY, vertex.y);
        }
        
        return {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
            min: new Vector2D(minX, minY),
            max: new Vector2D(maxX, maxY),
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * 获取默认六边形配置
     * @private
     * @returns {Object} 默认六边形配置
     */
    _getDefaultHexagonConfig() {
        return {
            radius: 200,
            rotationSpeed: 0.5,
            strokeWidth: 3,
            strokeColor: '#2196F3',
            fillColor: 'transparent'
        };
    }

    /**
     * 设置配置监听器
     * @private
     */
    _setupConfigListeners() {
        const configManager = window.configManager;
        
        // 监听六边形配置变更
        configManager.addListener('hexagon.rotationSpeed', (newValue) => {
            this.rotationSpeed = newValue;
            console.log(`Hexagon rotation speed updated: ${newValue}`);
        });
        
        configManager.addListener('hexagon.strokeColor', (newValue) => {
            this.strokeColor = newValue;
        });
        
        configManager.addListener('hexagon.strokeWidth', (newValue) => {
            this.strokeWidth = newValue;
        });
        
        configManager.addListener('hexagon.fillColor', (newValue) => {
            this.fillColor = newValue;
        });
    }

    /**
     * 更新六边形配置
     * @param {Object} newConfig - 新的配置参数
     */
    updateConfig(newConfig) {
        if (newConfig.rotationSpeed !== undefined) {
            this.rotationSpeed = newConfig.rotationSpeed;
        }
        if (newConfig.strokeColor !== undefined) {
            this.strokeColor = newConfig.strokeColor;
        }
        if (newConfig.strokeWidth !== undefined) {
            this.strokeWidth = newConfig.strokeWidth;
        }
        if (newConfig.fillColor !== undefined) {
            this.fillColor = newConfig.fillColor;
        }
        
        console.log('Hexagon config updated:', newConfig);
    }
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Hexagon;
}