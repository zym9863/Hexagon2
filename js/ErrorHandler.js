/**
 * ErrorHandler - 全局错误处理和资源管理类
 * 提供统一的错误处理、日志记录和资源清理功能
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // 最大错误记录数
        this.errorCounts = new Map(); // 错误类型计数
        this.isInitialized = false;
        
        // 错误级别
        this.ERROR_LEVELS = {
            INFO: 'info',
            WARN: 'warn',
            ERROR: 'error',
            CRITICAL: 'critical'
        };
        
        // 资源管理
        this.resources = new Set();
        this.cleanupCallbacks = new Set();
        
        this.init();
    }
    
    /**
     * 初始化错误处理器
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            // 设置全局错误处理
            this.setupGlobalErrorHandlers();
            
            // 设置页面卸载时的清理
            this.setupCleanupHandlers();
            
            this.isInitialized = true;
            console.log('ErrorHandler initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize ErrorHandler:', error);
        }
    }
    
    /**
     * 设置全局错误处理器
     */
    setupGlobalErrorHandlers() {
        // JavaScript运行时错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                level: this.ERROR_LEVELS.ERROR
            });
        });
        
        // Promise未捕获的拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                level: this.ERROR_LEVELS.ERROR
            });
        });
        
        // 资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    level: this.ERROR_LEVELS.WARN
                });
            }
        }, true);
    }
    
    /**
     * 设置清理处理器
     */
    setupCleanupHandlers() {
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // 页面隐藏时的处理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
    }
    
    /**
     * 处理错误
     * @param {Object} errorInfo - 错误信息
     */
    handleError(errorInfo) {
        try {
            // 创建标准化的错误对象
            const standardError = {
                id: this.generateErrorId(),
                timestamp: Date.now(),
                type: errorInfo.type || 'unknown',
                level: errorInfo.level || this.ERROR_LEVELS.ERROR,
                message: errorInfo.message || 'Unknown error',
                stack: errorInfo.error?.stack || errorInfo.stack,
                context: this.getErrorContext(),
                ...errorInfo
            };
            
            // 记录错误
            this.logError(standardError);
            
            // 更新错误统计
            this.updateErrorStats(standardError);
            
            // 根据错误级别采取行动
            this.handleErrorByLevel(standardError);
            
        } catch (handlingError) {
            console.error('Error in error handler:', handlingError);
        }
    }
    
    /**
     * 记录错误
     * @param {Object} error - 标准化错误对象
     */
    logError(error) {
        // 添加到错误列表
        this.errors.push(error);
        
        // 保持错误列表大小
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // 控制台输出
        const logMethod = this.getLogMethod(error.level);
        logMethod(`[${error.type.toUpperCase()}] ${error.message}`, error);
        
        // 可选：发送到远程日志服务
        this.sendToRemoteLogger(error);
    }
    
    /**
     * 更新错误统计
     * @param {Object} error - 错误对象
     */
    updateErrorStats(error) {
        const key = `${error.type}:${error.level}`;
        const count = this.errorCounts.get(key) || 0;
        this.errorCounts.set(key, count + 1);
    }
    
    /**
     * 根据错误级别处理
     * @param {Object} error - 错误对象
     */
    handleErrorByLevel(error) {
        switch (error.level) {
            case this.ERROR_LEVELS.CRITICAL:
                this.handleCriticalError(error);
                break;
            case this.ERROR_LEVELS.ERROR:
                this.handleRegularError(error);
                break;
            case this.ERROR_LEVELS.WARN:
                this.handleWarning(error);
                break;
            case this.ERROR_LEVELS.INFO:
                // 信息级别，仅记录
                break;
        }
    }
    
    /**
     * 处理严重错误
     * @param {Object} error - 错误对象
     */
    handleCriticalError(error) {
        console.error('CRITICAL ERROR detected:', error);
        
        // 尝试保存当前状态
        this.saveErrorState();
        
        // 显示用户友好的错误信息
        this.showUserErrorMessage('应用遇到严重错误，正在尝试恢复...');
        
        // 尝试恢复
        setTimeout(() => {
            this.attemptRecovery();
        }, 1000);
    }
    
    /**
     * 处理常规错误
     * @param {Object} error - 错误对象
     */
    handleRegularError(error) {
        // 检查是否为重复错误
        const recentSimilarErrors = this.errors
            .filter(e => e.type === error.type && e.message === error.message)
            .filter(e => Date.now() - e.timestamp < 5000); // 5秒内
            
        if (recentSimilarErrors.length > 3) {
            console.warn('Repeated error detected, may indicate a persistent issue');
        }
    }
    
    /**
     * 处理警告
     * @param {Object} error - 警告对象
     */
    handleWarning(error) {
        // 警告级别的处理逻辑
        if (error.type === 'performance') {
            this.handlePerformanceWarning(error);
        }
    }
    
    /**
     * 处理性能警告
     * @param {Object} warning - 性能警告
     */
    handlePerformanceWarning(warning) {
        console.warn('Performance warning:', warning.message);
        
        // 可以在这里实现性能优化建议
        if (warning.message.includes('memory')) {
            this.suggestMemoryOptimization();
        } else if (warning.message.includes('fps')) {
            this.suggestFPSOptimization();
        }
    }
    
    /**
     * 获取错误上下文信息
     * @returns {Object} 上下文信息
     */
    getErrorContext() {
        return {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: this.getMemoryInfo(),
            performance: this.getPerformanceInfo()
        };
    }
    
    /**
     * 获取内存信息
     * @returns {Object} 内存信息
     */
    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return { supported: false };
    }
    
    /**
     * 获取性能信息
     * @returns {Object} 性能信息
     */
    getPerformanceInfo() {
        return {
            timing: performance.timing ? {
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null,
            now: performance.now()
        };
    }
    
    /**
     * 生成错误ID
     * @returns {string} 唯一错误ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 获取日志方法
     * @param {string} level - 错误级别
     * @returns {Function} 日志方法
     */
    getLogMethod(level) {
        switch (level) {
            case this.ERROR_LEVELS.CRITICAL:
            case this.ERROR_LEVELS.ERROR:
                return console.error;
            case this.ERROR_LEVELS.WARN:
                return console.warn;
            case this.ERROR_LEVELS.INFO:
            default:
                return console.log;
        }
    }
    
    /**
     * 发送到远程日志服务（可选实现）
     * @param {Object} error - 错误对象
     */
    sendToRemoteLogger(error) {
        // 这里可以实现发送到远程日志服务的逻辑
        // 例如发送到 Sentry, LogRocket 等服务
        
        // 示例：只在生产环境发送严重错误
        if (error.level === this.ERROR_LEVELS.CRITICAL && window.location.hostname !== 'localhost') {
            // 实现远程日志发送
            console.log('Would send to remote logger:', error);
        }
    }
    
    /**
     * 显示用户错误信息
     * @param {string} message - 用户友好的错误信息
     */
    showUserErrorMessage(message) {
        // 创建或更新错误提示元素
        let errorElement = document.getElementById('error-notification');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-notification';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 300px;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `;
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 5000);
    }
    
    /**
     * 保存错误状态
     */
    saveErrorState() {
        try {
            const state = {
                errors: this.errors.slice(-10), // 保存最近10个错误
                timestamp: Date.now(),
                context: this.getErrorContext()
            };
            
            localStorage.setItem('game_error_state', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save error state:', error);
        }
    }
    
    /**
     * 尝试恢复
     */
    attemptRecovery() {
        console.log('Attempting system recovery...');
        
        try {
            // 清理可能的问题资源
            this.cleanup();
            
            // 重新加载页面作为最后手段
            if (this.shouldReloadPage()) {
                console.log('Reloading page for recovery...');
                window.location.reload();
            }
            
        } catch (error) {
            console.error('Recovery attempt failed:', error);
        }
    }
    
    /**
     * 判断是否应该重新加载页面
     * @returns {boolean} 是否应该重新加载
     */
    shouldReloadPage() {
        // 如果严重错误过多，建议重新加载
        const criticalErrors = this.errors.filter(e => e.level === this.ERROR_LEVELS.CRITICAL);
        return criticalErrors.length >= 3;
    }
    
    /**
     * 页面隐藏时的处理
     */
    onPageHidden() {
        console.log('Page hidden, pausing error monitoring');
        // 可以在这里暂停一些监控活动
    }
    
    /**
     * 页面可见时的处理
     */
    onPageVisible() {
        console.log('Page visible, resuming error monitoring');
        // 可以在这里恢复监控活动
    }
    
    /**
     * 注册资源
     * @param {Object} resource - 需要管理的资源
     */
    registerResource(resource) {
        this.resources.add(resource);
    }
    
    /**
     * 注册清理回调
     * @param {Function} callback - 清理回调函数
     */
    registerCleanupCallback(callback) {
        this.cleanupCallbacks.add(callback);
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        console.log('Cleaning up resources...');
        
        try {
            // 执行清理回调
            this.cleanupCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error in cleanup callback:', error);
                }
            });
            
            // 清理注册的资源
            this.resources.forEach(resource => {
                try {
                    if (resource && typeof resource.destroy === 'function') {
                        resource.destroy();
                    }
                } catch (error) {
                    console.error('Error destroying resource:', error);
                }
            });
            
            this.resources.clear();
            this.cleanupCallbacks.clear();
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
    
    /**
     * 建议内存优化
     */
    suggestMemoryOptimization() {
        console.warn('Memory optimization suggestions:');
        console.warn('- Check for memory leaks in event listeners');
        console.warn('- Clear unused object references');
        console.warn('- Consider reducing canvas size or quality');
    }
    
    /**
     * 建议FPS优化
     */
    suggestFPSOptimization() {
        console.warn('FPS optimization suggestions:');
        console.warn('- Reduce rendering complexity');
        console.warn('- Optimize physics calculations');
        console.warn('- Consider using requestAnimationFrame throttling');
    }
    
    /**
     * 获取错误统计
     * @returns {Object} 错误统计信息
     */
    getErrorStats() {
        return {
            totalErrors: this.errors.length,
            errorsByType: Object.fromEntries(this.errorCounts),
            recentErrors: this.errors.slice(-5),
            criticalErrors: this.errors.filter(e => e.level === this.ERROR_LEVELS.CRITICAL).length
        };
    }
    
    /**
     * 获取健康状态
     * @returns {Object} 系统健康状态
     */
    getHealthStatus() {
        const stats = this.getErrorStats();
        const recentCriticalErrors = this.errors
            .filter(e => e.level === this.ERROR_LEVELS.CRITICAL)
            .filter(e => Date.now() - e.timestamp < 60000); // 最近1分钟
            
        return {
            isHealthy: recentCriticalErrors.length === 0 && stats.totalErrors < 50,
            errorCount: stats.totalErrors,
            criticalErrorCount: stats.criticalErrors,
            recentCriticalErrors: recentCriticalErrors.length,
            status: this.getHealthStatusText(stats, recentCriticalErrors.length)
        };
    }
    
    /**
     * 获取健康状态文本
     * @param {Object} stats - 错误统计
     * @param {number} recentCriticalCount - 最近严重错误数
     * @returns {string} 状态文本
     */
    getHealthStatusText(stats, recentCriticalCount) {
        if (recentCriticalCount > 0) {
            return 'critical';
        } else if (stats.totalErrors > 30) {
            return 'warning';
        } else if (stats.totalErrors > 10) {
            return 'caution';
        } else {
            return 'healthy';
        }
    }
    
    /**
     * 销毁错误处理器
     */
    destroy() {
        this.cleanup();
        this.errors = [];
        this.errorCounts.clear();
        this.isInitialized = false;
        console.log('ErrorHandler destroyed');
    }
}

// 创建全局错误处理器实例
if (typeof window !== 'undefined') {
    window.errorHandler = new ErrorHandler();
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}