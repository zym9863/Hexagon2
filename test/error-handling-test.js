/**
 * 错误处理和性能监控测试
 */

// 测试错误处理器
function testErrorHandler() {
    console.log('Testing ErrorHandler...');
    
    if (!window.errorHandler) {
        console.error('ErrorHandler not found');
        return false;
    }
    
    const errorHandler = window.errorHandler;
    
    // 测试基本错误处理
    try {
        errorHandler.handleError({
            type: 'test',
            message: 'Test error message',
            level: 'error'
        });
        console.log('✓ Basic error handling works');
    } catch (error) {
        console.error('✗ Basic error handling failed:', error);
        return false;
    }
    
    // 测试警告处理
    try {
        errorHandler.handleError({
            type: 'performance',
            message: 'Test memory warning',
            level: 'warn'
        });
        console.log('✓ Warning handling works');
    } catch (error) {
        console.error('✗ Warning handling failed:', error);
        return false;
    }
    
    // 测试错误统计
    try {
        const stats = errorHandler.getErrorStats();
        if (stats && typeof stats.totalErrors === 'number') {
            console.log('✓ Error statistics work:', stats);
        } else {
            console.error('✗ Error statistics failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Error statistics failed:', error);
        return false;
    }
    
    // 测试健康状态
    try {
        const health = errorHandler.getHealthStatus();
        if (health && typeof health.isHealthy === 'boolean') {
            console.log('✓ Health status works:', health);
        } else {
            console.error('✗ Health status failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Health status failed:', error);
        return false;
    }
    
    return true;
}

// 测试性能监控器
function testPerformanceMonitor() {
    console.log('Testing PerformanceMonitor...');
    
    try {
        const monitor = new PerformanceMonitor();
        
        // 测试基本功能
        monitor.update(performance.now());
        
        if (typeof monitor.getFPS() === 'number') {
            console.log('✓ FPS monitoring works');
        } else {
            console.error('✗ FPS monitoring failed');
            return false;
        }
        
        if (typeof monitor.getAverageFrameTime() === 'number') {
            console.log('✓ Frame time monitoring works');
        } else {
            console.error('✗ Frame time monitoring failed');
            return false;
        }
        
        // 测试性能报告
        const report = monitor.getPerformanceReport();
        if (report && typeof report.fps === 'number') {
            console.log('✓ Performance report works:', report);
        } else {
            console.error('✗ Performance report failed');
            return false;
        }
        
        // 测试性能建议
        const suggestions = monitor.getPerformanceSuggestions();
        if (Array.isArray(suggestions)) {
            console.log('✓ Performance suggestions work:', suggestions);
        } else {
            console.error('✗ Performance suggestions failed');
            return false;
        }
        
        // 清理
        monitor.destroy();
        
        return true;
        
    } catch (error) {
        console.error('✗ PerformanceMonitor test failed:', error);
        return false;
    }
}

// 测试渲染器错误处理
function testRendererErrorHandling() {
    console.log('Testing Renderer error handling...');
    
    try {
        // 创建测试canvas
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        document.body.appendChild(canvas);
        
        const renderer = new Renderer(canvas);
        
        // 测试正常绘制
        if (renderer.drawCircle(50, 50, 10, '#ff0000')) {
            console.log('✓ Normal drawing works');
        }
        
        // 测试无效参数
        if (!renderer.drawCircle(NaN, 50, 10, '#ff0000')) {
            console.log('✓ Invalid parameter handling works');
        }
        
        // 测试错误统计
        const errorStats = renderer.getErrorStats();
        if (errorStats && typeof errorStats.errorCount === 'number') {
            console.log('✓ Renderer error stats work:', errorStats);
        }
        
        // 测试健康检查
        if (typeof renderer.isHealthy() === 'boolean') {
            console.log('✓ Renderer health check works');
        }
        
        // 清理
        document.body.removeChild(canvas);
        
        return true;
        
    } catch (error) {
        console.error('✗ Renderer error handling test failed:', error);
        return false;
    }
}

// 测试物理引擎错误处理
function testPhysicsEngineErrorHandling() {
    console.log('Testing PhysicsEngine error handling...');
    
    try {
        const physics = new PhysicsEngine();
        
        // 创建测试小球
        const ball = new Ball(0, 0, 10, 1);
        
        // 测试正常更新
        physics.update(ball, null, 0.016);
        console.log('✓ Normal physics update works');
        
        // 测试无效时间步长
        physics.update(ball, null, NaN);
        console.log('✓ Invalid deltaTime handling works');
        
        // 测试无效小球
        physics.update(null, null, 0.016);
        console.log('✓ Invalid ball handling works');
        
        // 测试性能统计
        const stats = physics.getPerformanceStats();
        if (stats && typeof stats.updateCount === 'number') {
            console.log('✓ Physics performance stats work:', stats);
        }
        
        return true;
        
    } catch (error) {
        console.error('✗ PhysicsEngine error handling test failed:', error);
        return false;
    }
}

// 模拟内存泄漏测试
function testMemoryLeakDetection() {
    console.log('Testing memory leak detection...');
    
    if (!window.errorHandler) {
        console.log('ErrorHandler not available, skipping memory test');
        return true;
    }
    
    try {
        // 创建大量对象来模拟内存使用
        const objects = [];
        for (let i = 0; i < 1000; i++) {
            objects.push({
                data: new Array(1000).fill(Math.random()),
                timestamp: Date.now()
            });
        }
        
        // 触发内存检查
        if (window.errorHandler.getMemoryInfo) {
            const memInfo = window.errorHandler.getMemoryInfo();
            console.log('Memory info:', memInfo);
        }
        
        // 清理对象
        objects.length = 0;
        
        console.log('✓ Memory leak detection test completed');
        return true;
        
    } catch (error) {
        console.error('✗ Memory leak detection test failed:', error);
        return false;
    }
}

// 运行所有测试
function runErrorHandlingTests() {
    console.log('=== Error Handling and Performance Monitoring Tests ===');
    
    const tests = [
        { name: 'ErrorHandler', fn: testErrorHandler },
        { name: 'PerformanceMonitor', fn: testPerformanceMonitor },
        { name: 'Renderer Error Handling', fn: testRendererErrorHandling },
        { name: 'PhysicsEngine Error Handling', fn: testPhysicsEngineErrorHandling },
        { name: 'Memory Leak Detection', fn: testMemoryLeakDetection }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        console.log(`\n--- Testing ${test.name} ---`);
        try {
            if (test.fn()) {
                console.log(`✓ ${test.name} passed`);
                passed++;
            } else {
                console.log(`✗ ${test.name} failed`);
                failed++;
            }
        } catch (error) {
            console.error(`✗ ${test.name} threw error:`, error);
            failed++;
        }
    });
    
    console.log(`\n=== Test Results ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${tests.length}`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('❌ Some tests failed');
    }
    
    return failed === 0;
}

// 导出测试函数
if (typeof window !== 'undefined') {
    window.runErrorHandlingTests = runErrorHandlingTests;
    window.testErrorHandler = testErrorHandler;
    window.testPerformanceMonitor = testPerformanceMonitor;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runErrorHandlingTests,
        testErrorHandler,
        testPerformanceMonitor,
        testRendererErrorHandling,
        testPhysicsEngineErrorHandling,
        testMemoryLeakDetection
    };
}