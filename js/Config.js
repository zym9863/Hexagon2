/**
 * Config - 配置系统
 * 管理所有物理参数、渲染设置和游戏配置
 */

/**
 * 主配置对象
 * 包含所有可调整的物理参数和游戏设置
 */
const CONFIG = {
    // 物理引擎配置
    physics: {
        // 重力加速度 (像素/秒²)
        gravity: 9.81 * 50, // 缩放到屏幕坐标系，适合视觉效果
        
        // 摩擦系数 (0-1之间，1表示无摩擦)
        frictionCoefficient: 0.98, // 轻微摩擦，保持运动的流畅性
        
        // 反弹系数 (0-1之间，1表示完全弹性碰撞)
        restitution: 0.8, // 80%弹性，提供真实感同时保持活跃度
        
        // 时间缩放因子
        timeScale: 1.0, // 正常时间流速
        
        // 最小速度阈值，低于此值视为静止
        minVelocityThreshold: 0.1,
        
        // 最大速度限制，防止数值溢出
        maxVelocity: 1000,
        
        // 空气阻力系数 (接近1表示阻力很小)
        airResistance: 0.999, // 轻微空气阻力，增加真实感
        
        // 旋转表面摩擦系数
        rotationalFriction: 0.3,
        
        // 表面速度传递系数 (旋转表面对小球的拖拽效果)
        surfaceDragEffect: 0.15
    },

    // 六边形容器配置
    hexagon: {
        // 六边形外接圆半径 (像素)
        radius: 200, // 适中大小，提供足够的运动空间
        
        // 旋转速度 (弧度/秒)
        rotationSpeed: 0.5, // 适中的旋转速度，便于观察
        
        // 渲染样式
        strokeWidth: 3,
        strokeColor: '#2196F3', // 蓝色边框
        fillColor: 'transparent', // 透明填充
        
        // 自适应大小系数 (相对于屏幕尺寸)
        sizeRatio: 0.3 // 六边形半径 = min(屏幕宽度, 屏幕高度) * sizeRatio
    },

    // 小球配置
    ball: {
        // 小球半径 (像素)
        radius: 10,
        
        // 小球质量 (影响物理计算)
        mass: 1,
        
        // 渲染样式
        color: '#FF5722', // 橙红色
        strokeColor: '#D32F2F', // 深红色边框
        strokeWidth: 2,
        
        // 初始位置偏移 (相对于六边形中心)
        initialPosition: {
            x: 0,
            y: -50 // 稍微偏上，避免直接在中心
        },
        
        // 初始速度 (像素/秒)
        initialVelocity: {
            x: 100, // 水平初始速度
            y: -30  // 轻微向上的初始速度
        }
    },

    // Canvas和渲染配置
    canvas: {
        // 背景颜色
        backgroundColor: '#f5f5f5', // 浅灰色背景
        
        // 默认尺寸 (会被响应式调整覆盖)
        defaultWidth: 800,
        defaultHeight: 600,
        
        // 高DPI支持
        enableHighDPI: true,
        
        // 抗锯齿
        enableAntialiasing: true
    },

    // 游戏控制配置
    game: {
        // 目标帧率
        targetFPS: 60,
        
        // 最大时间步长 (秒)，防止大的时间跳跃
        maxDeltaTime: 1/30, // 30 FPS对应的时间步长
        
        // 调试模式
        enableDebug: false,
        
        // 性能监控
        enablePerformanceMonitor: true,
        
        // 自动启动
        autoStart: true,
        
        // 键盘控制
        enableKeyboardControls: true
    },

    // UI和交互配置
    ui: {
        // 显示FPS
        showFPS: true,
        
        // 显示物理信息
        showPhysicsInfo: true,
        
        // 显示控制提示
        showControlHints: true,
        
        // UI文字颜色
        textColor: '#333',
        
        // UI字体
        font: '16px Arial',
        
        // 调试信息字体
        debugFont: '12px Arial'
    },

    // 响应式设计配置
    responsive: {
        // 启用响应式
        enabled: true,
        
        // 最小尺寸
        minWidth: 300,
        minHeight: 300,
        
        // 移动设备检测阈值
        mobileBreakpoint: 768,
        
        // 移动设备优化
        mobileOptimizations: {
            // 降低目标帧率以提高性能
            targetFPS: 30,
            
            // 简化渲染
            simplifiedRendering: false,
            
            // 禁用某些效果
            disableDebugInfo: true
        }
    },

    // 性能配置
    performance: {
        // 性能监控采样间隔 (毫秒)
        monitoringInterval: 1000,
        
        // 低性能警告阈值
        lowFPSThreshold: 30,
        
        // 高帧时间警告阈值 (毫秒)
        highFrameTimeThreshold: 33.33,
        
        // 自动性能调整
        autoPerformanceAdjustment: true
    }
};

/**
 * 配置管理器类
 * 提供配置的获取、设置和验证功能
 */
class ConfigManager {
    constructor() {
        this.config = this._deepClone(CONFIG);
        this.listeners = new Map(); // 配置变更监听器
        this.validationRules = this._initValidationRules();
    }

    /**
     * 获取配置值
     * @param {string} path - 配置路径，如 'physics.gravity'
     * @returns {*} 配置值
     */
    get(path) {
        return this._getNestedValue(this.config, path);
    }

    /**
     * 设置配置值
     * @param {string} path - 配置路径
     * @param {*} value - 新值
     * @returns {boolean} 是否设置成功
     */
    set(path, value) {
        // 验证新值
        if (!this._validateValue(path, value)) {
            console.warn(`Invalid value for config path '${path}':`, value);
            return false;
        }

        const oldValue = this.get(path);
        
        // 设置新值
        if (this._setNestedValue(this.config, path, value)) {
            // 触发变更监听器
            this._notifyListeners(path, value, oldValue);
            
            console.log(`Config updated: ${path} = ${value} (was: ${oldValue})`);
            return true;
        }
        
        return false;
    }

    /**
     * 批量设置配置
     * @param {Object} updates - 配置更新对象
     */
    update(updates) {
        const results = {};
        
        for (const [path, value] of Object.entries(updates)) {
            results[path] = this.set(path, value);
        }
        
        return results;
    }

    /**
     * 重置配置到默认值
     * @param {string} path - 要重置的配置路径，不提供则重置全部
     */
    reset(path = null) {
        if (path) {
            const defaultValue = this._getNestedValue(CONFIG, path);
            this.set(path, defaultValue);
        } else {
            this.config = this._deepClone(CONFIG);
            console.log('All config reset to defaults');
        }
    }

    /**
     * 添加配置变更监听器
     * @param {string} path - 监听的配置路径
     * @param {Function} callback - 回调函数
     */
    addListener(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
    }

    /**
     * 移除配置变更监听器
     * @param {string} path - 配置路径
     * @param {Function} callback - 要移除的回调函数
     */
    removeListener(path, callback) {
        if (this.listeners.has(path)) {
            const callbacks = this.listeners.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 获取所有配置
     * @returns {Object} 配置对象的副本
     */
    getAll() {
        return this._deepClone(this.config);
    }

    /**
     * 导出配置为JSON
     * @returns {string} JSON字符串
     */
    exportToJSON() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * 从JSON导入配置
     * @param {string} jsonString - JSON字符串
     * @returns {boolean} 是否导入成功
     */
    importFromJSON(jsonString) {
        try {
            const importedConfig = JSON.parse(jsonString);
            
            // 验证导入的配置结构
            if (this._validateConfigStructure(importedConfig)) {
                this.config = importedConfig;
                console.log('Config imported successfully');
                return true;
            } else {
                console.error('Invalid config structure in imported JSON');
                return false;
            }
        } catch (error) {
            console.error('Failed to import config from JSON:', error);
            return false;
        }
    }

    /**
     * 获取适合当前设备的配置
     * @returns {Object} 优化后的配置
     */
    getOptimizedConfig() {
        const optimized = this._deepClone(this.config);
        
        // 检测设备类型
        const isMobile = this._isMobileDevice();
        const isLowPerformance = this._isLowPerformanceDevice();
        
        if (isMobile && optimized.responsive.mobileOptimizations) {
            const mobileOpts = optimized.responsive.mobileOptimizations;
            
            // 应用移动设备优化
            optimized.game.targetFPS = mobileOpts.targetFPS;
            optimized.ui.showPhysicsInfo = !mobileOpts.disableDebugInfo;
            optimized.ui.showControlHints = !mobileOpts.disableDebugInfo;
        }
        
        if (isLowPerformance) {
            // 低性能设备优化
            optimized.game.targetFPS = Math.min(optimized.game.targetFPS, 30);
            optimized.physics.maxVelocity = Math.min(optimized.physics.maxVelocity, 800);
            optimized.performance.autoPerformanceAdjustment = true;
        }
        
        return optimized;
    }

    // 私有方法

    /**
     * 深度克隆对象
     * @private
     */
    _deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this._deepClone(item));
        }
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this._deepClone(obj[key]);
            }
        }
        
        return cloned;
    }

    /**
     * 获取嵌套对象的值
     * @private
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * 设置嵌套对象的值
     * @private
     */
    _setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        if (target && lastKey) {
            target[lastKey] = value;
            return true;
        }
        
        return false;
    }

    /**
     * 初始化验证规则
     * @private
     */
    _initValidationRules() {
        return {
            'physics.gravity': (value) => typeof value === 'number' && value >= 0 && value <= 2000,
            'physics.frictionCoefficient': (value) => typeof value === 'number' && value >= 0 && value <= 1,
            'physics.restitution': (value) => typeof value === 'number' && value >= 0 && value <= 1,
            'physics.timeScale': (value) => typeof value === 'number' && value > 0 && value <= 5,
            'physics.maxVelocity': (value) => typeof value === 'number' && value > 0 && value <= 5000,
            'hexagon.radius': (value) => typeof value === 'number' && value >= 50 && value <= 500,
            'hexagon.rotationSpeed': (value) => typeof value === 'number' && Math.abs(value) <= 10,
            'ball.radius': (value) => typeof value === 'number' && value >= 1 && value <= 50,
            'ball.mass': (value) => typeof value === 'number' && value > 0 && value <= 100,
            'game.targetFPS': (value) => typeof value === 'number' && value >= 15 && value <= 120
        };
    }

    /**
     * 验证配置值
     * @private
     */
    _validateValue(path, value) {
        const validator = this.validationRules[path];
        return validator ? validator(value) : true; // 没有验证规则的配置项默认通过
    }

    /**
     * 验证配置结构
     * @private
     */
    _validateConfigStructure(config) {
        const requiredSections = ['physics', 'hexagon', 'ball', 'canvas', 'game'];
        
        for (const section of requiredSections) {
            if (!config[section] || typeof config[section] !== 'object') {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 通知配置变更监听器
     * @private
     */
    _notifyListeners(path, newValue, oldValue) {
        // 通知精确路径的监听器
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('Error in config listener:', error);
                }
            });
        }
        
        // 通知父路径的监听器
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            if (this.listeners.has(parentPath)) {
                this.listeners.get(parentPath).forEach(callback => {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (error) {
                        console.error('Error in config listener:', error);
                    }
                });
            }
        }
    }

    /**
     * 检测是否为移动设备
     * @private
     */
    _isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= this.config.responsive.mobileBreakpoint;
    }

    /**
     * 检测是否为低性能设备
     * @private
     */
    _isLowPerformanceDevice() {
        // 简单的性能检测，可以根据需要扩展
        return navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    }
}

// 创建全局配置管理器实例
const configManager = new ConfigManager();

// 预设配置方案
const CONFIG_PRESETS = {
    // 默认配置
    default: {
        'physics.gravity': 9.81 * 50,
        'physics.frictionCoefficient': 0.98,
        'physics.restitution': 0.8,
        'hexagon.rotationSpeed': 0.5
    },
    
    // 高弹性配置
    bouncy: {
        'physics.gravity': 9.81 * 40,
        'physics.frictionCoefficient': 0.99,
        'physics.restitution': 0.95,
        'physics.airResistance': 0.9995,
        'hexagon.rotationSpeed': 0.3
    },
    
    // 高摩擦配置
    sticky: {
        'physics.gravity': 9.81 * 60,
        'physics.frictionCoefficient': 0.95,
        'physics.restitution': 0.6,
        'physics.airResistance': 0.99,
        'hexagon.rotationSpeed': 0.7
    },
    
    // 低重力配置
    space: {
        'physics.gravity': 9.81 * 20,
        'physics.frictionCoefficient': 0.995,
        'physics.restitution': 0.9,
        'physics.airResistance': 0.9999,
        'hexagon.rotationSpeed': 0.2
    },
    
    // 快速旋转配置
    spinner: {
        'physics.gravity': 9.81 * 45,
        'physics.frictionCoefficient': 0.97,
        'physics.restitution': 0.85,
        'hexagon.rotationSpeed': 1.5
    }
};

/**
 * 应用预设配置
 * @param {string} presetName - 预设名称
 * @returns {boolean} 是否应用成功
 */
function applyConfigPreset(presetName) {
    const preset = CONFIG_PRESETS[presetName];
    if (!preset) {
        console.warn(`Unknown config preset: ${presetName}`);
        return false;
    }
    
    console.log(`Applying config preset: ${presetName}`);
    const results = configManager.update(preset);
    
    // 检查是否所有配置都应用成功
    const success = Object.values(results).every(result => result === true);
    
    if (success) {
        console.log(`Config preset '${presetName}' applied successfully`);
    } else {
        console.warn(`Some config values in preset '${presetName}' failed to apply:`, results);
    }
    
    return success;
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigManager, configManager, CONFIG_PRESETS, applyConfigPreset };
}

// 全局访问
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.configManager = configManager;
    window.CONFIG_PRESETS = CONFIG_PRESETS;
    window.applyConfigPreset = applyConfigPreset;
}