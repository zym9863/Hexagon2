/**
 * 主应用程序入口点 - 旋转六边形小球物理模拟
 * 
 * 这是一个完整的物理模拟应用程序，展示了一个小球在旋转六边形容器内的真实物理行为。
 * 应用程序包含以下核心功能：
 * - 真实的物理引擎（重力、摩擦力、碰撞检测）
 * - 响应式设计，适配各种屏幕尺寸
 * - 性能优化和错误处理
 * - 用户交互控制（重置、暂停、键盘控制）
 * - 可配置的物理参数和预设方案
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @requires Vector2D, Ball, Hexagon, PhysicsEngine, Renderer, Game, Config, ErrorHandler
 */

// 全局游戏实例
let game = null;

// 应用程序状态管理
const AppState = {
    isInitialized: false,
    hasError: false,
    performanceMode: 'auto', // 'auto', 'high', 'low'
    debugMode: false
};

/**
 * 应用程序初始化函数
 * 负责完整的应用程序启动流程，包括错误处理、性能优化和用户交互设置
 */
function initializeApplication() {
    console.log('🚀 Initializing Rotating Hexagon Ball Physics Application...');
    
    try {
        // 1. 初始化错误处理系统
        initializeErrorHandling();
        
        // 2. 检测和应用性能优化
        detectAndApplyPerformanceOptimizations();
        
        // 3. 应用设备优化配置
        const optimizedConfig = configManager.getOptimizedConfig();
        console.log('📱 Using optimized config for device:', {
            isMobile: optimizedConfig.responsive?.mobileOptimizations ? true : false,
            targetFPS: optimizedConfig.game.targetFPS,
            performanceMode: AppState.performanceMode
        });
        
        // 4. 创建游戏实例
        game = new Game('physics-canvas', {
            enablePerformanceMonitor: true,
            enableDebug: AppState.debugMode,
            targetFPS: optimizedConfig.game.targetFPS
        });
        
        // 5. 设置用户交互
        setupUserInteractions();
        
        // 6. 设置性能监控
        setupPerformanceMonitoring();
        
        // 7. 启动游戏
        game.start();
        
        // 8. 标记初始化完成
        AppState.isInitialized = true;
        console.log('✅ Game initialized and started successfully!');
        
        // 9. 可选功能
        handleOptionalFeatures();
        
        // 10. 显示启动成功信息
        showStartupSuccess();
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        handleInitializationError(error);
    }
}

/**
 * 初始化错误处理系统
 */
function initializeErrorHandling() {
    if (!window.errorHandler) {
        console.log('🛡️ Initializing error handling system...');
        window.errorHandler = new ErrorHandler();
    }
    
    // 设置全局错误捕获
    window.addEventListener('error', (event) => {
        window.errorHandler.handleError({
            type: 'runtime',
            message: event.message,
            error: event.error,
            level: 'error',
            context: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            }
        });
    });
    
    // 设置Promise错误捕获
    window.addEventListener('unhandledrejection', (event) => {
        window.errorHandler.handleError({
            type: 'promise',
            message: 'Unhandled Promise Rejection',
            error: event.reason,
            level: 'error'
        });
    });
}

/**
 * 检测设备性能并应用优化
 */
function detectAndApplyPerformanceOptimizations() {
    console.log('⚡ Detecting device performance...');
    
    // 检测设备性能指标
    const deviceInfo = {
        cores: navigator.hardwareConcurrency || 2,
        memory: navigator.deviceMemory || 2,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        screenSize: Math.min(window.innerWidth, window.innerHeight),
        pixelRatio: window.devicePixelRatio || 1
    };
    
    console.log('📊 Device info:', deviceInfo);
    
    // 根据设备性能设置性能模式
    if (deviceInfo.cores <= 2 || deviceInfo.memory <= 2 || deviceInfo.isMobile) {
        AppState.performanceMode = 'low';
        console.log('🔋 Low performance mode enabled');
        
        // 应用低性能优化
        configManager.update({
            'game.targetFPS': 30,
            'physics.maxVelocity': 800,
            'canvas.enableHighDPI': false
        });
    } else if (deviceInfo.cores >= 8 && deviceInfo.memory >= 8) {
        AppState.performanceMode = 'high';
        console.log('🚀 High performance mode enabled');
        
        // 应用高性能设置
        configManager.update({
            'game.targetFPS': 60,
            'physics.maxVelocity': 1200,
            'canvas.enableHighDPI': true
        });
    } else {
        AppState.performanceMode = 'auto';
        console.log('⚖️ Auto performance mode enabled');
    }
}

/**
 * 设置用户交互功能
 */
function setupUserInteractions() {
    console.log('🎮 Setting up user interactions...');
    
    // 增强的重置功能
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (game) {
                game.reset();
                showNotification('游戏已重置', 'success');
            }
        });
    }
    
    // 增强的暂停功能
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (game) {
                game.togglePause();
                const isPaused = game.isPaused;
                showNotification(isPaused ? '游戏已暂停' : '游戏已继续', 'info');
            }
        });
    }
    
    // 键盘快捷键
    document.addEventListener('keydown', (event) => {
        if (!game) return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                game.togglePause();
                break;
            case 'KeyR':
                event.preventDefault();
                game.reset();
                showNotification('游戏已重置', 'success');
                break;
            case 'KeyD':
                event.preventDefault();
                AppState.debugMode = !AppState.debugMode;
                game.toggleDebug();
                showNotification(`调试模式: ${AppState.debugMode ? '开启' : '关闭'}`, 'info');
                break;
            case 'KeyP':
                event.preventDefault();
                cyclePerformanceMode();
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
                event.preventDefault();
                const presetNumber = parseInt(event.code.slice(-1));
                applyPresetByNumber(presetNumber);
                break;
        }
    });
    
    // Canvas点击交互
    const canvas = document.getElementById('physics-canvas');
    if (canvas) {
        canvas.addEventListener('click', (event) => {
            if (!game) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // 点击重置小球位置（可选功能）
            if (event.shiftKey && game.ball && game.hexagon) {
                const canvasCoords = game.renderer.fromCanvasCoords(x, y);
                if (game.hexagon.isPointInside(new Vector2D(canvasCoords.x, canvasCoords.y))) {
                    game.ball.setPosition(canvasCoords.x, canvasCoords.y);
                    game.ball.setVelocity(0, 0);
                    showNotification('小球位置已重置', 'info');
                }
            }
        });
        
        // 添加触摸支持
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (event.touches.length === 2) {
                // 双指触摸重置游戏
                if (game) {
                    game.reset();
                    showNotification('游戏已重置', 'success');
                }
            }
        });
    }
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitoring() {
    console.log('📊 Setting up performance monitoring...');
    
    // 创建性能信息显示元素
    const perfInfo = document.createElement('div');
    perfInfo.id = 'performance-info';
    perfInfo.className = 'performance-info';
    document.body.appendChild(perfInfo);
    
    // 定期更新性能信息
    setInterval(() => {
        if (game && game.performanceMonitor && AppState.debugMode) {
            const fps = game.performanceMonitor.getFPS();
            const frameTime = game.performanceMonitor.getAverageFrameTime();
            const gameState = game.getGameState();
            
            perfInfo.innerHTML = `
                FPS: ${fps}<br>
                Frame: ${frameTime.toFixed(2)}ms<br>
                Mode: ${AppState.performanceMode}<br>
                Energy: ${gameState.totalEnergy.toFixed(1)}
            `;
            perfInfo.classList.toggle('show', AppState.debugMode);
        } else {
            perfInfo.classList.remove('show');
        }
    }, 1000);
}

/**
 * 处理可选功能
 */
function handleOptionalFeatures() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 测试模式
    if (urlParams.has('test')) {
        console.log('🧪 Test mode enabled');
        setTimeout(() => runComponentTests(), 1000);
    }
    
    // 调试模式
    if (urlParams.has('debug')) {
        AppState.debugMode = true;
        if (game) game.toggleDebug();
        console.log('🐛 Debug mode enabled via URL');
    }
    
    // 性能模式
    const perfMode = urlParams.get('performance');
    if (perfMode && ['low', 'high', 'auto'].includes(perfMode)) {
        AppState.performanceMode = perfMode;
        console.log(`⚡ Performance mode set to: ${perfMode}`);
    }
    
    // 预设配置
    const preset = urlParams.get('preset');
    if (preset && CONFIG_PRESETS[preset]) {
        applyConfigPreset(preset);
        console.log(`🎛️ Applied preset: ${preset}`);
    }
}

/**
 * 显示启动成功信息
 */
function showStartupSuccess() {
    showNotification('物理模拟已启动！使用空格键暂停，R键重置', 'success', 3000);
    
    // 显示控制提示
    setTimeout(() => {
        if (!AppState.debugMode) {
            showNotification('按D键开启调试模式查看更多信息', 'info', 2000);
        }
    }, 4000);
}

/**
 * 处理初始化错误
 */
function handleInitializationError(error) {
    AppState.hasError = true;
    
    // 使用ErrorHandler记录严重错误
    if (window.errorHandler) {
        window.errorHandler.handleError({
            type: 'initialization',
            message: 'Application initialization failed',
            error: error,
            level: 'critical'
        });
    }
    
    showInitializationError(error.message);
}

// 等待DOM加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', initializeApplication);

/**
 * 运行组件测试
 */
function runComponentTests() {
    console.log('Running component tests...');
    
    // 测试Vector2D类
    testVector2D();
    
    // 测试其他组件
    if (game && game.renderer) {
        testRenderer(game.renderer);
        testHexagon(game.renderer);
        testBall(game.renderer);
    }
    
    console.log('Component tests completed!');
}

/**
 * 测试Vector2D类
 */
function testVector2D() {
    console.log('Testing Vector2D class...');
    
    const v1 = new Vector2D(3, 4);
    const v2 = new Vector2D(1, 2);
    
    console.log('v1:', v1.toString());
    console.log('v2:', v2.toString());
    console.log('v1.magnitude():', v1.magnitude());
    console.log('v1.normalize():', v1.normalize().toString());
    console.log('v1.add(v2):', v1.add(v2).toString());
    console.log('v1.subtract(v2):', v1.subtract(v2).toString());
    console.log('v1.multiply(2):', v1.multiply(2).toString());
    console.log('v1.dot(v2):', v1.dot(v2));
    console.log('v1.rotate(Math.PI/4):', v1.rotate(Math.PI/4).toString());
    
    console.log('Vector2D class test completed successfully!');
}

/**
 * 测试Renderer类功能
 */
function testRenderer(renderer) {
    console.log('Testing Renderer class...');
    
    const dimensions = renderer.getDimensions();
    const center = renderer.getCenter();
    
    console.log('Canvas dimensions:', dimensions);
    console.log('Canvas center:', center);
    
    // 测试坐标转换
    const transformed = renderer.toCanvasCoords(100, -100);
    console.log('Coordinate transformation (100, -100):', transformed);
    
    console.log('Renderer class test completed successfully!');
}

/**
 * 测试Hexagon类
 */
function testHexagon(renderer) {
    console.log('Testing Hexagon class...');
    
    const center = renderer.getCenter();
    const testHex = new Hexagon(center.x, center.y, 100);
    
    // 测试顶点计算
    const vertices = testHex.getVertices();
    console.log('Hexagon vertices count:', vertices.length);
    console.log('First vertex:', vertices[0]);
    
    // 测试边计算
    const edges = testHex.getEdges();
    console.log('Hexagon edges count:', edges.length);
    
    // 测试点在内部检测
    const centerPoint = new Vector2D(center.x, center.y);
    const outsidePoint = new Vector2D(center.x + 200, center.y);
    console.log('Center point inside:', testHex.isPointInside(centerPoint));
    console.log('Outside point inside:', testHex.isPointInside(outsidePoint));
    
    // 测试边界框
    const bbox = testHex.getBoundingBox();
    console.log('Bounding box:', bbox);
    
    // 测试旋转
    testHex.rotate(Math.PI / 6); // 30度
    const rotatedVertices = testHex.getVertices();
    console.log('Rotated first vertex:', rotatedVertices[0]);
    
    // 测试碰撞检测
    const testBallObj = {
        position: new Vector2D(center.x + 90, center.y),
        radius: 15
    };
    const collision = testHex.checkCollision(testBallObj);
    console.log('Collision detected:', collision !== null);
    if (collision) {
        console.log('Collision info:', collision);
    }
    
    console.log('Hexagon class test completed successfully!');
}

/**
 * 测试Ball类
 */
function testBall(renderer) {
    console.log('Testing Ball class...');
    
    const center = renderer.getCenter();
    
    // 测试基本构造
    const ball1 = new Ball(center.x, center.y, 15, 2);
    console.log('Ball created:', ball1.toString());
    
    // 测试物理属性设置
    ball1.setVelocity(100, -50);
    ball1.applyForce(new Vector2D(0, 98)); // 重力
    console.log('After applying force:', ball1.toString());
    
    // 测试更新
    ball1.update(0.016); // 模拟16ms时间步长
    console.log('After update:', ball1.toString());
    
    // 测试动能和动量
    console.log('Kinetic energy:', ball1.getKineticEnergy());
    console.log('Momentum:', ball1.getMomentum().toString());
    
    // 测试边界框
    const bbox = ball1.getBoundingBox();
    console.log('Ball bounding box:', bbox);
    
    // 测试克隆
    const ball2 = ball1.clone();
    console.log('Cloned ball:', ball2.toString());
    
    // 测试在六边形内创建小球
    const testHexagon = new Hexagon(center.x, center.y, 100);
    const ballInHex = Ball.createInsideHexagon(testHexagon, 10, 1);
    console.log('Ball created inside hexagon:', ballInHex.toString());
    console.log('Is ball inside hexagon:', ballInHex.isInsideHexagon(testHexagon));
    
    console.log('Ball class test completed successfully!');
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'info', 'warning')
 * @param {number} duration - 显示时长（毫秒）
 */
function showNotification(message, type = 'info', duration = 2000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 设置样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        fontSize: '14px',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // 设置颜色
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * 切换性能模式
 */
function cyclePerformanceMode() {
    const modes = ['auto', 'low', 'high'];
    const currentIndex = modes.indexOf(AppState.performanceMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    AppState.performanceMode = modes[nextIndex];
    
    // 应用性能设置
    const settings = {
        auto: { targetFPS: 60, maxVelocity: 1000 },
        low: { targetFPS: 30, maxVelocity: 800 },
        high: { targetFPS: 60, maxVelocity: 1200 }
    };
    
    const setting = settings[AppState.performanceMode];
    configManager.update({
        'game.targetFPS': setting.targetFPS,
        'physics.maxVelocity': setting.maxVelocity
    });
    
    if (game) {
        game.setConfig({ targetFPS: setting.targetFPS });
    }
    
    showNotification(`性能模式: ${AppState.performanceMode.toUpperCase()}`, 'info');
}

/**
 * 通过数字应用预设配置
 * @param {number} number - 预设编号 (1-5)
 */
function applyPresetByNumber(number) {
    const presets = ['default', 'bouncy', 'sticky', 'space', 'spinner'];
    const presetName = presets[number - 1];
    
    if (presetName && CONFIG_PRESETS[presetName]) {
        applyConfigPreset(presetName);
        if (game) {
            game.reset(); // 重置游戏以应用新配置
        }
        showNotification(`已应用预设: ${presetName.toUpperCase()}`, 'success');
    }
}

/**
 * 显示初始化错误
 * @param {string} message - 错误消息
 */
function showInitializationError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                color: #d32f2f;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                ">
                    <h2 style="margin-bottom: 20px; color: #d32f2f;">🚫 应用程序初始化失败</h2>
                    <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">${message}</p>
                    <div style="margin-bottom: 20px;">
                        <strong>可能的解决方案：</strong>
                        <ul style="text-align: left; color: #666; margin-top: 10px;">
                            <li>检查浏览器是否支持HTML5 Canvas</li>
                            <li>确保JavaScript已启用</li>
                            <li>尝试刷新页面</li>
                            <li>使用现代浏览器（Chrome, Firefox, Safari, Edge）</li>
                        </ul>
                    </div>
                    <button onclick="location.reload()" style="
                        padding: 12px 24px;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.transform='translateY(0)'">
                        🔄 重新加载
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * 全局调试和开发工具接口
 * 提供完整的应用程序控制和调试功能
 */
window.gameDebug = {
    // === 基础游戏控制 ===
    getGame: () => game,
    getGameState: () => game ? game.getGameState() : null,
    getAppState: () => ({ ...AppState }),
    
    // 游戏控制
    start: () => game ? game.start() : null,
    stop: () => game ? game.stop() : null,
    reset: () => game ? game.reset() : null,
    togglePause: () => game ? game.togglePause() : null,
    toggleDebug: () => {
        AppState.debugMode = !AppState.debugMode;
        if (game) game.toggleDebug();
        return AppState.debugMode;
    },
    
    // === 配置管理 ===
    getConfig: (path) => configManager.get(path),
    setConfig: (path, value) => {
        const result = configManager.set(path, value);
        if (result && game) game.reset(); // 重置以应用新配置
        return result;
    },
    resetConfig: (path) => configManager.reset(path),
    exportConfig: () => configManager.exportToJSON(),
    importConfig: (jsonString) => configManager.importFromJSON(jsonString),
    
    // === 预设配置 ===
    applyPreset: (presetName) => {
        const result = applyConfigPreset(presetName);
        if (result && game) game.reset();
        return result;
    },
    listPresets: () => Object.keys(CONFIG_PRESETS),
    
    // 预设快捷方式
    makeBouncy: () => window.gameDebug.applyPreset('bouncy'),
    makeSticky: () => window.gameDebug.applyPreset('sticky'),
    makeSpace: () => window.gameDebug.applyPreset('space'),
    makeSpinner: () => window.gameDebug.applyPreset('spinner'),
    makeDefault: () => window.gameDebug.applyPreset('default'),
    
    // === 性能控制 ===
    setPerformanceMode: (mode) => {
        if (['auto', 'low', 'high'].includes(mode)) {
            AppState.performanceMode = mode;
            detectAndApplyPerformanceOptimizations();
            return true;
        }
        return false;
    },
    getPerformanceInfo: () => {
        if (!game || !game.performanceMonitor) return null;
        return {
            fps: game.performanceMonitor.getFPS(),
            frameTime: game.performanceMonitor.getAverageFrameTime(),
            mode: AppState.performanceMode,
            isRunning: game.isRunning,
            isPaused: game.isPaused
        };
    },
    
    // === 物理调试 ===
    setBallPosition: (x, y) => {
        if (game && game.ball) {
            game.ball.setPosition(x, y);
            return true;
        }
        return false;
    },
    setBallVelocity: (vx, vy) => {
        if (game && game.ball) {
            game.ball.setVelocity(vx, vy);
            return true;
        }
        return false;
    },
    getBallInfo: () => {
        if (!game || !game.ball) return null;
        return {
            position: game.ball.position.clone(),
            velocity: game.ball.velocity.clone(),
            energy: game.ball.getKineticEnergy(),
            momentum: game.ball.getMomentum()
        };
    },
    
    // === 渲染调试 ===
    takeScreenshot: () => {
        if (game && game.renderer && game.renderer.canvas) {
            const canvas = game.renderer.canvas;
            const link = document.createElement('a');
            link.download = `hexagon-physics-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            return true;
        }
        return false;
    },
    
    // === 测试和基准 ===
    runTests: () => {
        if (typeof runComponentTests === 'function') {
            runComponentTests();
            return true;
        }
        return false;
    },
    
    // === 实用工具 ===
    showNotification: (message, type, duration) => showNotification(message, type, duration),
    
    // 获取帮助信息
    help: () => {
        console.log(`
🎮 游戏调试控制台帮助
========================

基础控制:
  gameDebug.start()          - 启动游戏
  gameDebug.stop()           - 停止游戏  
  gameDebug.reset()          - 重置游戏
  gameDebug.togglePause()    - 切换暂停
  gameDebug.toggleDebug()    - 切换调试模式

配置管理:
  gameDebug.getConfig(path)  - 获取配置值
  gameDebug.setConfig(path, value) - 设置配置值
  gameDebug.applyPreset(name) - 应用预设配置
  gameDebug.listPresets()    - 列出所有预设

预设快捷方式:
  gameDebug.makeBouncy()     - 高弹性模式
  gameDebug.makeSticky()     - 高摩擦模式
  gameDebug.makeSpace()      - 低重力模式
  gameDebug.makeSpinner()    - 快速旋转模式
  gameDebug.makeDefault()    - 默认模式

物理调试:
  gameDebug.setBallPosition(x, y)   - 设置小球位置
  gameDebug.setBallVelocity(vx, vy) - 设置小球速度
  gameDebug.getBallInfo()           - 获取小球信息

性能控制:
  gameDebug.setPerformanceMode(mode) - 设置性能模式 ('auto'|'low'|'high')
  gameDebug.getPerformanceInfo()     - 获取性能信息

实用工具:
  gameDebug.takeScreenshot() - 截图保存
  gameDebug.runTests()       - 运行测试
  gameDebug.help()           - 显示此帮助

键盘快捷键:
  空格键 - 暂停/继续
  R键   - 重置游戏
  D键   - 调试模式
  P键   - 切换性能模式
  1-5键 - 应用预设配置
        `);
        return 'Help displayed in console';
    }
};

/**
 * 应用程序完整性检查
 * 在开发模式下验证所有组件是否正确加载
 */
function performIntegrityCheck() {
    const requiredClasses = [
        'Vector2D', 'Ball', 'Hexagon', 'PhysicsEngine', 
        'Renderer', 'Game', 'ErrorHandler', 'ConfigManager'
    ];
    
    const missing = requiredClasses.filter(className => !window[className]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required classes:', missing);
        return false;
    }
    
    console.log('✅ All required classes loaded successfully');
    return true;
}

// 在开发模式下执行完整性检查
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(performIntegrityCheck, 100);
    });
}

// 导出调试接口到全局作用域（仅在开发模式）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameDebug: window.gameDebug, AppState };
}