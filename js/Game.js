/**
 * Game - 主游戏控制器类
 * 协调所有组件，管理动画循环和游戏状态
 */
class Game {
    /**
     * 创建游戏实例
     * @param {string} canvasId - Canvas元素的ID
     * @param {Object} config - 游戏配置参数
     */
    constructor(canvasId, config = {}) {
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.lastTime = 0;
        
        // 性能监控
        this.performanceMonitor = new PerformanceMonitor();
        
        // 获取全局配置
        const globalConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('game') 
            : this._getDefaultGameConfig();
        
        // 游戏配置 - 合并全局配置和传入的配置
        this.config = {
            targetFPS: config.targetFPS || globalConfig.targetFPS || 60,
            enableDebug: config.enableDebug || globalConfig.enableDebug || false,
            enablePerformanceMonitor: config.enablePerformanceMonitor || globalConfig.enablePerformanceMonitor || true,
            maxDeltaTime: config.maxDeltaTime || globalConfig.maxDeltaTime || 1/30,
            autoStart: config.autoStart || globalConfig.autoStart || true,
            enableKeyboardControls: config.enableKeyboardControls || globalConfig.enableKeyboardControls || true,
            ...config
        };

        // 监听配置变更
        if (typeof window !== 'undefined' && window.configManager) {
            this._setupConfigListeners();
        }
        
        // 初始化组件
        this.initializeComponents(canvasId);
        
        // 设置事件监听
        this.setupEventListeners();
        
        console.log('Game initialized successfully');
    }

    /**
     * 初始化游戏组件
     * @param {string} canvasId - Canvas元素ID
     */
    initializeComponents(canvasId) {
        try {
            // 初始化Canvas和Renderer
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas element with id '${canvasId}' not found`);
            }
            
            this.renderer = new Renderer(this.canvas);
            console.log('Renderer initialized');
            
            // 创建游戏对象
            this.createGameObjects();
            
            // 初始化物理引擎
            this.physicsEngine = PhysicsEngine.createDefault();
            console.log('PhysicsEngine initialized');
            
        } catch (error) {
            console.error('Failed to initialize game components:', error);
            this.showError('游戏初始化失败：' + error.message);
            throw error;
        }
    }

    /**
     * 创建游戏对象（六边形和小球）
     */
    createGameObjects() {
        const center = this.renderer.getCenter();
        const dimensions = this.renderer.getDimensions();
        const scaleFactor = this.renderer.getScaleFactor();
        
        // 获取配置
        const hexagonConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('hexagon') 
            : { radius: 200, sizeRatio: 0.3 };
        const ballConfig = (typeof window !== 'undefined' && window.configManager) 
            ? window.configManager.get('ball') 
            : { initialVelocity: { x: 100, y: -30 }, initialPosition: { x: 0, y: -50 } };
        
        // 计算六边形半径 - 使用配置中的sizeRatio或固定半径，并应用缩放
        let hexagonRadius;
        if (hexagonConfig.sizeRatio) {
            hexagonRadius = Math.min(dimensions.width, dimensions.height) * hexagonConfig.sizeRatio;
        } else {
            hexagonRadius = (hexagonConfig.radius || 200) * scaleFactor;
        }
        
        // 确保六边形不会太小或太大
        const minRadius = Math.min(dimensions.width, dimensions.height) * 0.2;
        const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.45;
        hexagonRadius = Math.max(minRadius, Math.min(maxRadius, hexagonRadius));
        
        // 创建六边形
        this.hexagon = new Hexagon(center.x, center.y, hexagonRadius);
        console.log('Hexagon created at center:', center, 'with radius:', hexagonRadius, 'scale factor:', scaleFactor);
        
        // 创建小球，半径也要根据缩放调整
        const ballRadius = (ballConfig.radius || 10) * scaleFactor;
        const clampedBallRadius = Math.max(5, Math.min(20, ballRadius)); // 限制小球大小
        
        this.ball = Ball.createInsideHexagon(this.hexagon, clampedBallRadius);
        
        // 设置初始位置（相对于六边形中心的偏移，也要缩放）
        if (ballConfig.initialPosition) {
            const scaledOffsetX = ballConfig.initialPosition.x * scaleFactor;
            const scaledOffsetY = ballConfig.initialPosition.y * scaleFactor;
            const initialX = center.x + scaledOffsetX;
            const initialY = center.y + scaledOffsetY;
            
            // 确保初始位置在六边形内部
            const testPoint = new Vector2D(initialX, initialY);
            if (this.hexagon.isPointInside(testPoint)) {
                this.ball.setPosition(initialX, initialY);
            }
        }
        
        // 设置初始速度（也要根据缩放调整）
        if (ballConfig.initialVelocity) {
            const scaledVelX = ballConfig.initialVelocity.x * scaleFactor;
            const scaledVelY = ballConfig.initialVelocity.y * scaleFactor;
            this.ball.setVelocity(scaledVelX, scaledVelY);
        }
        
        // 更新物理引擎的缩放参数
        if (this.physicsEngine) {
            this.physicsEngine.setScaleFactor(scaleFactor);
        }
        
        console.log('Ball created inside hexagon with scaled initial velocity and radius:', clampedBallRadius);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
        
        // 控制按钮
        this.setupControlButtons();
        
        // 键盘控制
        this.setupKeyboardControls();
        
        // 错误处理
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
            this.handleError(event.error);
        });
        
        // 注册游戏实例到错误处理器进行资源管理
        if (window.errorHandler) {
            window.errorHandler.registerResource(this);
            window.errorHandler.registerCleanupCallback(() => {
                if (this.isRunning) {
                    this.stop();
                }
            });
        }
    }

    /**
     * 设置控制按钮
     */
    setupControlButtons() {
        const resetBtn = document.getElementById('reset-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
    }

    /**
     * 设置键盘控制
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePause();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    this.reset();
                    break;
                case 'KeyD':
                    event.preventDefault();
                    this.toggleDebug();
                    break;
            }
        });
    }

    /**
     * 启动游戏
     */
    start() {
        if (this.isRunning) {
            console.warn('Game is already running');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        // 更新UI
        this.updateUI();
        
        // 开始游戏循环
        this.gameLoop(this.lastTime);
        
        console.log('Game started');
    }

    /**
     * 停止游戏
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 更新UI
        this.updateUI();
        
        console.log('Game stopped');
    }

    /**
     * 暂停/恢复游戏
     */
    togglePause() {
        if (!this.isRunning) {
            this.start();
            return;
        }
        
        this.isPaused = !this.isPaused;
        
        if (!this.isPaused) {
            // 恢复时重置时间，避免大的时间跳跃
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }
        
        // 更新UI
        this.updateUI();
        
        console.log(this.isPaused ? 'Game paused' : 'Game resumed');
    }

    /**
     * 重置游戏
     */
    reset() {
        console.log('Resetting game...');
        
        // 重置六边形
        if (this.hexagon) {
            this.hexagon.rotation = 0;
        }
        
        // 重新创建小球
        if (this.hexagon) {
            this.ball = Ball.createInsideHexagon(this.hexagon);
            
            // 应用配置中的初始速度
            const ballConfig = (typeof window !== 'undefined' && window.configManager) 
                ? window.configManager.get('ball') 
                : { initialVelocity: { x: 100, y: -30 } };
            
            if (ballConfig.initialVelocity) {
                this.ball.setVelocity(ballConfig.initialVelocity.x, ballConfig.initialVelocity.y);
            }
        }
        
        // 重置物理引擎
        if (this.physicsEngine) {
            this.physicsEngine.reset();
        }
        
        // 重置性能监控
        this.performanceMonitor.reset();
        
        // 重新绘制
        this.render();
        
        console.log('Game reset completed');
    }

    /**
     * 主游戏循环
     * @param {number} currentTime - 当前时间戳
     */
    gameLoop(currentTime) {
        if (!this.isRunning) {
            return;
        }
        
        // 计算时间增量
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, this.config.maxDeltaTime); // 限制最大时间步长
        this.lastTime = currentTime;
        
        // 更新性能监控
        this.performanceMonitor.update(currentTime);
        
        if (!this.isPaused && deltaTime > 0) {
            // 更新游戏状态
            this.update(deltaTime);
        }
        
        // 渲染
        this.render();
        
        // 继续游戏循环
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * 更新游戏状态
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        try {
            // 更新六边形旋转
            if (this.hexagon) {
                this.hexagon.update(deltaTime);
            }
            
            // 更新物理系统
            if (this.ball && this.hexagon && this.physicsEngine) {
                this.physicsEngine.update(this.ball, this.hexagon, deltaTime);
            }
            
        } catch (error) {
            console.error('Error in game update:', error);
            this.handleError(error);
        }
    }

    /**
     * 渲染游戏画面
     */
    render() {
        try {
            // 获取背景颜色配置
            const canvasConfig = (typeof window !== 'undefined' && window.configManager) 
                ? window.configManager.get('canvas') 
                : { backgroundColor: '#f5f5f5' };
            
            // 清屏
            this.renderer.setBackground(canvasConfig.backgroundColor || '#f5f5f5');
            
            // 渲染六边形
            if (this.hexagon) {
                this.hexagon.render(this.renderer);
                
                // 调试模式：绘制顶点
                if (this.config.enableDebug) {
                    this.renderDebugInfo();
                }
            }
            
            // 渲染小球
            if (this.ball) {
                this.ball.render(this.renderer);
            }
            
            // 渲染UI信息
            this.renderUI();
            
        } catch (error) {
            console.error('Error in game render:', error);
            this.handleError(error);
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo() {
        if (!this.hexagon || !this.ball) return;
        
        // 绘制六边形顶点
        const vertices = this.hexagon.getVertices();
        vertices.forEach((vertex, index) => {
            this.renderer.drawCircle(vertex.x, vertex.y, 4, '#4CAF50');
            
            // 顶点编号
            this.renderer.ctx.fillStyle = '#333';
            this.renderer.ctx.font = '12px Arial';
            this.renderer.ctx.fillText(index.toString(), vertex.x + 8, vertex.y - 8);
        });
        
        // 绘制中心点
        const center = this.renderer.getCenter();
        this.renderer.drawCircle(center.x, center.y, 3, '#333');
        
        // 绘制小球速度向量
        if (this.ball.velocity.magnitude() > 0.1) {
            const scale = 0.1;
            const endPoint = this.ball.position.add(this.ball.velocity.multiply(scale));
            
            this.renderer.ctx.beginPath();
            this.renderer.ctx.moveTo(this.ball.position.x, this.ball.position.y);
            this.renderer.ctx.lineTo(endPoint.x, endPoint.y);
            this.renderer.ctx.strokeStyle = '#00BCD4';
            this.renderer.ctx.lineWidth = 2;
            this.renderer.ctx.stroke();
        }
    }

    /**
     * 渲染UI信息
     */
    renderUI() {
        const ctx = this.renderer.ctx;
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        
        let y = 30;
        const lineHeight = 20;
        
        // 基本信息
        if (this.hexagon) {
            const rotationDegrees = (this.hexagon.rotation * 180 / Math.PI).toFixed(1);
            ctx.fillText(`旋转角度: ${rotationDegrees}°`, 20, y);
            y += lineHeight;
        }
        
        if (this.ball && this.physicsEngine) {
            const speed = this.ball.velocity.magnitude().toFixed(1);
            const energy = this.physicsEngine.calculateTotalEnergy(
                this.ball, 
                this.renderer.getDimensions().height
            ).toFixed(1);
            
            ctx.fillText(`速度: ${speed} px/s`, 20, y);
            y += lineHeight;
            ctx.fillText(`能量: ${energy}`, 20, y);
            y += lineHeight;
        }
        
        // 性能信息
        if (this.config.enablePerformanceMonitor) {
            const fps = this.performanceMonitor.getFPS();
            const frameTime = this.performanceMonitor.getAverageFrameTime();
            
            ctx.fillText(`FPS: ${fps}`, 20, y);
            y += lineHeight;
            ctx.fillText(`帧时间: ${frameTime.toFixed(2)}ms`, 20, y);
            y += lineHeight;
        }
        
        // 游戏状态
        if (this.isPaused) {
            ctx.fillStyle = '#FF5722';
            ctx.font = 'bold 20px Arial';
            const center = this.renderer.getCenter();
            ctx.fillText('暂停', center.x - 20, center.y - 50);
        }
        
        // 控制提示
        if (this.config.enableDebug) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            const tips = [
                '空格键: 暂停/继续',
                'R键: 重置',
                'D键: 调试模式'
            ];
            
            tips.forEach((tip, index) => {
                ctx.fillText(tip, 20, this.renderer.height - 60 + index * 15);
            });
        }
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        console.log('Handling window resize...');
        
        try {
            // 防抖处理，避免频繁调用
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            
            this.resizeTimeout = setTimeout(() => {
                this.performResize();
            }, 150);
            
        } catch (error) {
            console.error('Error in handleResize:', error);
            this.handleError(error);
        }
    }
    
    /**
     * 执行实际的窗口大小调整
     */
    performResize() {
        try {
            console.log('Performing window resize...');
            
            // 保存当前游戏状态
            const gameState = this.getGameState();
            const wasRunning = this.isRunning;
            const wasPaused = this.isPaused;
            
            // 更新渲染器
            this.renderer.updateCanvasSize();
            
            // 获取新的尺寸和缩放因子
            const newDimensions = this.renderer.getDimensions();
            const newScaleFactor = this.renderer.getScaleFactor();
            
            console.log(`New canvas dimensions: ${newDimensions.width}x${newDimensions.height}, scale: ${newScaleFactor.toFixed(2)}`);
            
            // 暂时停止游戏循环
            if (wasRunning) {
                this.stop();
            }
            
            // 重新创建游戏对象以适应新尺寸
            this.createGameObjects();
            
            // 尝试恢复小球的相对位置和速度
            if (gameState.ballPosition && gameState.ballVelocity) {
                const center = this.renderer.getCenter();
                const oldCenter = { x: newDimensions.width / 2, y: newDimensions.height / 2 };
                
                // 计算相对位置
                const relativeX = (gameState.ballPosition.x - oldCenter.x) / (gameState.scaleFactor || 1);
                const relativeY = (gameState.ballPosition.y - oldCenter.y) / (gameState.scaleFactor || 1);
                
                // 应用到新的缩放和中心
                const newX = center.x + relativeX * newScaleFactor;
                const newY = center.y + relativeY * newScaleFactor;
                
                // 确保新位置在六边形内部
                const testPoint = new Vector2D(newX, newY);
                if (this.hexagon && this.hexagon.isPointInside(testPoint)) {
                    this.ball.setPosition(newX, newY);
                    
                    // 缩放速度
                    const scaledVelX = gameState.ballVelocity.x * (newScaleFactor / (gameState.scaleFactor || 1));
                    const scaledVelY = gameState.ballVelocity.y * (newScaleFactor / (gameState.scaleFactor || 1));
                    this.ball.setVelocity(scaledVelX, scaledVelY);
                }
            }
            
            // 恢复游戏状态
            if (wasRunning) {
                this.start();
                if (wasPaused) {
                    this.togglePause();
                }
            } else {
                // 如果游戏没有运行，至少渲染一次
                this.render();
            }
            
            console.log('Window resize completed successfully');
            
        } catch (error) {
            console.error('Error in performResize:', error);
            this.handleError(error);
            
            // 尝试恢复到基本状态
            try {
                this.createGameObjects();
                this.render();
            } catch (recoveryError) {
                console.error('Failed to recover from resize error:', recoveryError);
            }
        }
    }

    /**
     * 切换调试模式
     */
    toggleDebug() {
        this.config.enableDebug = !this.config.enableDebug;
        console.log('Debug mode:', this.config.enableDebug ? 'enabled' : 'disabled');
    }

    /**
     * 更新UI按钮状态
     */
    updateUI() {
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            if (!this.isRunning) {
                pauseBtn.textContent = '开始';
            } else if (this.isPaused) {
                pauseBtn.textContent = '继续';
            } else {
                pauseBtn.textContent = '暂停';
            }
        }
    }

    /**
     * 处理错误
     * @param {Error} error - 错误对象
     */
    handleError(error) {
        console.error('Game error:', error);
        
        // 使用全局错误处理器
        if (window.errorHandler) {
            window.errorHandler.handleError({
                type: 'game',
                message: error.message,
                error: error,
                level: 'error',
                context: {
                    gameState: this.getGameState(),
                    isRunning: this.isRunning,
                    isPaused: this.isPaused
                }
            });
        }
        
        // 尝试恢复
        try {
            this.stop();
            this.showError('游戏遇到错误，已自动停止。请尝试重置游戏。');
        } catch (recoveryError) {
            console.error('Failed to recover from error:', recoveryError);
            
            // 报告严重错误
            if (window.errorHandler) {
                window.errorHandler.handleError({
                    type: 'game',
                    message: 'Failed to recover from game error',
                    error: recoveryError,
                    level: 'critical'
                });
            }
            
            this.showError('游戏遇到严重错误，请刷新页面。');
        }
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    showError(message) {
        // 在Canvas上显示错误信息
        if (this.renderer) {
            this.renderer.setBackground('#ffebee');
            this.renderer.ctx.fillStyle = '#d32f2f';
            this.renderer.ctx.font = 'bold 18px Arial';
            this.renderer.ctx.textAlign = 'center';
            
            const center = this.renderer.getCenter();
            this.renderer.ctx.fillText('错误', center.x, center.y - 20);
            
            this.renderer.ctx.font = '14px Arial';
            this.renderer.ctx.fillText(message, center.x, center.y + 10);
            
            this.renderer.ctx.textAlign = 'left'; // 重置对齐方式
        }
        
        // 也在控制台显示
        console.error(message);
    }

    /**
     * 获取游戏状态信息
     * @returns {Object} 游戏状态
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            fps: this.performanceMonitor.getFPS(),
            frameTime: this.performanceMonitor.getAverageFrameTime(),
            ballPosition: this.ball ? this.ball.position.clone() : null,
            ballVelocity: this.ball ? this.ball.velocity.clone() : null,
            hexagonRotation: this.hexagon ? this.hexagon.rotation : 0,
            totalEnergy: this.ball && this.physicsEngine ? 
                this.physicsEngine.calculateTotalEnergy(this.ball, this.renderer.height) : 0
        };
    }

    /**
     * 设置游戏配置
     * @param {Object} newConfig - 新的配置参数
     */
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Game config updated:', this.config);
    }

    /**
     * 销毁游戏实例
     */
    destroy() {
        console.log('Destroying game instance...');
        
        // 停止游戏循环
        this.stop();
        
        // 移除事件监听器
        window.removeEventListener('resize', this.handleResize);
        
        // 清理引用
        this.renderer = null;
        this.hexagon = null;
        this.ball = null;
        this.physicsEngine = null;
        this.performanceMonitor = null;
        
        console.log('Game instance destroyed');
    }

    /**
     * 获取默认游戏配置
     * @private
     * @returns {Object} 默认游戏配置
     */
    _getDefaultGameConfig() {
        return {
            targetFPS: 60,
            enableDebug: false,
            enablePerformanceMonitor: true,
            maxDeltaTime: 1/30,
            autoStart: true,
            enableKeyboardControls: true
        };
    }

    /**
     * 设置配置监听器
     * @private
     */
    _setupConfigListeners() {
        const configManager = window.configManager;
        
        // 监听游戏配置变更
        configManager.addListener('game.targetFPS', (newValue) => {
            this.config.targetFPS = newValue;
            console.log(`Game target FPS updated: ${newValue}`);
        });
        
        configManager.addListener('game.enableDebug', (newValue) => {
            this.config.enableDebug = newValue;
            console.log(`Game debug mode: ${newValue ? 'enabled' : 'disabled'}`);
        });
        
        configManager.addListener('game.maxDeltaTime', (newValue) => {
            this.config.maxDeltaTime = newValue;
        });
    }
}

/**
 * PerformanceMonitor - 性能监控类
 * 监控帧率、渲染性能和内存使用
 */
class PerformanceMonitor {
    constructor() {
        this.reset();
        this.setupMemoryMonitoring();
    }

    /**
     * 重置性能统计
     */
    reset() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.frameTimes = [];
        this.maxFrameTimeHistory = 60; // 保留最近60帧的时间
        this.lastFrameTime = 0;
        
        // 扩展的性能指标
        this.droppedFrames = 0;
        this.totalFrames = 0;
        this.renderTime = 0;
        this.updateTime = 0;
        this.memoryUsage = {
            used: 0,
            total: 0,
            limit: 0
        };
        
        // 性能警告阈值
        this.thresholds = {
            lowFPS: 30,
            highFrameTime: 33.33, // 30 FPS
            memoryWarning: 0.8, // 80% of available memory
            droppedFrameRate: 0.05 // 5% dropped frames
        };
        
        // 错误和警告计数
        this.warnings = {
            lowFPS: 0,
            highFrameTime: 0,
            memoryWarning: 0,
            droppedFrames: 0
        };
        
        this.startTime = performance.now();
    }

    /**
     * 设置内存监控
     */
    setupMemoryMonitoring() {
        // 检查是否支持内存API
        this.supportsMemoryAPI = 'memory' in performance;
        
        if (this.supportsMemoryAPI) {
            // 每5秒检查一次内存使用
            this.memoryCheckInterval = setInterval(() => {
                this.updateMemoryStats();
            }, 5000);
        }
    }

    /**
     * 更新内存统计
     */
    updateMemoryStats() {
        if (!this.supportsMemoryAPI) return;
        
        try {
            const memory = performance.memory;
            this.memoryUsage = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            };
            
            // 检查内存使用警告
            const memoryUsageRatio = this.memoryUsage.used / this.memoryUsage.limit;
            if (memoryUsageRatio > this.thresholds.memoryWarning) {
                this.warnings.memoryWarning++;
                console.warn(`High memory usage: ${(memoryUsageRatio * 100).toFixed(1)}%`);
            }
            
        } catch (error) {
            console.error('Error updating memory stats:', error);
        }
    }

    /**
     * 更新性能统计
     * @param {number} currentTime - 当前时间戳
     * @param {number} renderTime - 渲染时间（可选）
     * @param {number} updateTime - 更新时间（可选）
     */
    update(currentTime, renderTime = 0, updateTime = 0) {
        this.frameCount++;
        this.totalFrames++;
        
        // 记录渲染和更新时间
        if (renderTime > 0) this.renderTime = renderTime;
        if (updateTime > 0) this.updateTime = updateTime;
        
        // 计算帧时间
        if (this.lastFrameTime > 0) {
            const frameTime = currentTime - this.lastFrameTime;
            this.frameTimes.push(frameTime);
            
            // 检查是否为掉帧
            if (frameTime > this.thresholds.highFrameTime * 2) {
                this.droppedFrames++;
                this.warnings.droppedFrames++;
            }
            
            // 保持数组大小
            if (this.frameTimes.length > this.maxFrameTimeHistory) {
                this.frameTimes.shift();
            }
            
            // 检查帧时间警告
            if (frameTime > this.thresholds.highFrameTime) {
                this.warnings.highFrameTime++;
            }
        }
        this.lastFrameTime = currentTime;
        
        // 每秒更新一次FPS
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // 性能警告
            if (this.fps < this.thresholds.lowFPS) {
                this.warnings.lowFPS++;
                console.warn(`Low FPS detected: ${this.fps}`);
            }
        }
    }

    /**
     * 获取当前FPS
     * @returns {number} FPS值
     */
    getFPS() {
        return this.fps;
    }

    /**
     * 获取平均帧时间
     * @returns {number} 平均帧时间（毫秒）
     */
    getAverageFrameTime() {
        if (this.frameTimes.length === 0) {
            return 0;
        }
        
        const sum = this.frameTimes.reduce((a, b) => a + b, 0);
        return sum / this.frameTimes.length;
    }

    /**
     * 获取最大帧时间
     * @returns {number} 最大帧时间（毫秒）
     */
    getMaxFrameTime() {
        return this.frameTimes.length > 0 ? Math.max(...this.frameTimes) : 0;
    }

    /**
     * 获取最小帧时间
     * @returns {number} 最小帧时间（毫秒）
     */
    getMinFrameTime() {
        return this.frameTimes.length > 0 ? Math.min(...this.frameTimes) : 0;
    }

    /**
     * 获取掉帧率
     * @returns {number} 掉帧率（0-1之间）
     */
    getDroppedFrameRate() {
        return this.totalFrames > 0 ? this.droppedFrames / this.totalFrames : 0;
    }

    /**
     * 获取运行时间
     * @returns {number} 运行时间（毫秒）
     */
    getRunTime() {
        return performance.now() - this.startTime;
    }

    /**
     * 检查性能是否良好
     * @returns {boolean} 性能是否良好
     */
    isPerformanceGood() {
        return this.fps >= this.thresholds.lowFPS && 
               this.getAverageFrameTime() <= this.thresholds.highFrameTime &&
               this.getDroppedFrameRate() <= this.thresholds.droppedFrameRate;
    }

    /**
     * 获取性能等级
     * @returns {string} 性能等级 ('excellent', 'good', 'fair', 'poor')
     */
    getPerformanceGrade() {
        const fps = this.getFPS();
        const avgFrameTime = this.getAverageFrameTime();
        const droppedFrameRate = this.getDroppedFrameRate();
        
        if (fps >= 55 && avgFrameTime <= 18 && droppedFrameRate <= 0.01) {
            return 'excellent';
        } else if (fps >= 45 && avgFrameTime <= 22 && droppedFrameRate <= 0.02) {
            return 'good';
        } else if (fps >= 30 && avgFrameTime <= 33 && droppedFrameRate <= 0.05) {
            return 'fair';
        } else {
            return 'poor';
        }
    }

    /**
     * 获取内存使用信息
     * @returns {Object} 内存使用统计
     */
    getMemoryStats() {
        if (!this.supportsMemoryAPI) {
            return { supported: false };
        }
        
        return {
            supported: true,
            used: this.memoryUsage.used,
            total: this.memoryUsage.total,
            limit: this.memoryUsage.limit,
            usageRatio: this.memoryUsage.used / this.memoryUsage.limit,
            usedMB: (this.memoryUsage.used / 1024 / 1024).toFixed(2),
            totalMB: (this.memoryUsage.total / 1024 / 1024).toFixed(2),
            limitMB: (this.memoryUsage.limit / 1024 / 1024).toFixed(2)
        };
    }

    /**
     * 获取完整的性能报告
     * @returns {Object} 性能报告
     */
    getPerformanceReport() {
        return {
            fps: this.getFPS(),
            averageFrameTime: this.getAverageFrameTime(),
            maxFrameTime: this.getMaxFrameTime(),
            minFrameTime: this.getMinFrameTime(),
            droppedFrames: this.droppedFrames,
            totalFrames: this.totalFrames,
            droppedFrameRate: this.getDroppedFrameRate(),
            runTime: this.getRunTime(),
            renderTime: this.renderTime,
            updateTime: this.updateTime,
            performanceGrade: this.getPerformanceGrade(),
            isPerformanceGood: this.isPerformanceGood(),
            warnings: { ...this.warnings },
            memory: this.getMemoryStats()
        };
    }

    /**
     * 检测性能问题并提供建议
     * @returns {Array} 性能建议列表
     */
    getPerformanceSuggestions() {
        const suggestions = [];
        
        if (this.fps < this.thresholds.lowFPS) {
            suggestions.push('FPS过低，考虑降低渲染质量或优化物理计算');
        }
        
        if (this.getAverageFrameTime() > this.thresholds.highFrameTime) {
            suggestions.push('帧时间过长，检查渲染和更新逻辑的效率');
        }
        
        if (this.getDroppedFrameRate() > this.thresholds.droppedFrameRate) {
            suggestions.push('掉帧率过高，考虑优化动画循环或减少计算复杂度');
        }
        
        const memoryStats = this.getMemoryStats();
        if (memoryStats.supported && memoryStats.usageRatio > this.thresholds.memoryWarning) {
            suggestions.push('内存使用率过高，检查是否存在内存泄漏');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('性能表现良好');
        }
        
        return suggestions;
    }

    /**
     * 销毁性能监控器
     */
    destroy() {
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
            this.memoryCheckInterval = null;
        }
        console.log('PerformanceMonitor destroyed');
    }
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, PerformanceMonitor };
}