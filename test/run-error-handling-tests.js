/**
 * 简单的错误处理测试运行器
 * 用于验证错误处理和性能监控功能
 */

// 模拟浏览器环境的基本对象
const mockWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
    devicePixelRatio: 1,
    location: { href: 'http://localhost', hostname: 'localhost' },
    performance: {
        now: () => Date.now(),
        memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000,
            jsHeapSizeLimit: 10000000
        }
    },
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    cancelAnimationFrame: (id) => clearTimeout(id)
};

const mockDocument = {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: (tag) => ({
        tagName: tag,
        style: {},
        addEventListener: () => {},
        appendChild: () => {},
        removeChild: () => {}
    }),
    getElementById: () => null,
    body: {
        appendChild: () => {},
        removeChild: () => {}
    },
    hidden: false
};

// Store original console methods
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
};

const mockConsole = {
    log: (...args) => originalConsole.log(...args),
    warn: (...args) => originalConsole.warn(...args),
    error: (...args) => originalConsole.error(...args)
};

// 设置全局对象
global.window = mockWindow;
global.document = mockDocument;
global.console = mockConsole;
global.performance = mockWindow.performance;
global.navigator = { userAgent: 'Node.js Test Environment' };
global.HTMLCanvasElement = class HTMLCanvasElement {};

// 引入需要测试的类
const ErrorHandler = require('../js/ErrorHandler.js');

// 测试ErrorHandler基本功能
function testErrorHandlerBasics() {
    console.log('Testing ErrorHandler basics...');
    
    try {
        const errorHandler = new ErrorHandler();
        
        // 测试错误处理
        errorHandler.handleError({
            type: 'test',
            message: 'Test error message',
            level: 'error'
        });
        
        // 测试错误统计
        const stats = errorHandler.getErrorStats();
        if (stats.totalErrors > 0) {
            console.log('✓ Error handling and statistics work');
        } else {
            console.log('✗ Error statistics failed');
            return false;
        }
        
        // 测试健康状态
        const health = errorHandler.getHealthStatus();
        if (typeof health.isHealthy === 'boolean') {
            console.log('✓ Health status works');
        } else {
            console.log('✗ Health status failed');
            return false;
        }
        
        // 清理
        errorHandler.destroy();
        
        return true;
        
    } catch (error) {
        console.error('✗ ErrorHandler test failed:', error);
        return false;
    }
}

// 测试错误级别处理
function testErrorLevels() {
    console.log('Testing error levels...');
    
    try {
        const errorHandler = new ErrorHandler();
        
        // 测试不同级别的错误
        const levels = ['info', 'warn', 'error', 'critical'];
        
        levels.forEach(level => {
            errorHandler.handleError({
                type: 'test',
                message: `Test ${level} message`,
                level: level
            });
        });
        
        const stats = errorHandler.getErrorStats();
        if (stats.totalErrors === levels.length) {
            console.log('✓ Error levels handling works');
        } else {
            console.log('✗ Error levels handling failed');
            return false;
        }
        
        errorHandler.destroy();
        return true;
        
    } catch (error) {
        console.error('✗ Error levels test failed:', error);
        return false;
    }
}

// 测试资源管理
function testResourceManagement() {
    console.log('Testing resource management...');
    
    try {
        const errorHandler = new ErrorHandler();
        
        // 创建模拟资源
        const mockResource = {
            destroyed: false,
            destroy: function() {
                this.destroyed = true;
            }
        };
        
        // 注册资源
        errorHandler.registerResource(mockResource);
        
        // 注册清理回调
        let callbackCalled = false;
        errorHandler.registerCleanupCallback(() => {
            callbackCalled = true;
        });
        
        // 执行清理
        errorHandler.cleanup();
        
        if (mockResource.destroyed && callbackCalled) {
            console.log('✓ Resource management works');
        } else {
            console.log('✗ Resource management failed');
            return false;
        }
        
        errorHandler.destroy();
        return true;
        
    } catch (error) {
        console.error('✗ Resource management test failed:', error);
        return false;
    }
}

// 运行所有测试
function runAllTests() {
    console.log('=== Error Handling Tests (Node.js Environment) ===\n');
    
    const tests = [
        { name: 'ErrorHandler Basics', fn: testErrorHandlerBasics },
        { name: 'Error Levels', fn: testErrorLevels },
        { name: 'Resource Management', fn: testResourceManagement }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        console.log(`--- Testing ${test.name} ---`);
        try {
            if (test.fn()) {
                console.log(`✓ ${test.name} passed\n`);
                passed++;
            } else {
                console.log(`✗ ${test.name} failed\n`);
                failed++;
            }
        } catch (error) {
            console.error(`✗ ${test.name} threw error:`, error);
            failed++;
        }
    });
    
    console.log('=== Test Results ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${tests.length}`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed');
        process.exit(1);
    }
}

// 运行测试
runAllTests();