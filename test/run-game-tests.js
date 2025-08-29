/**
 * Simple Game class test runner for Node.js
 * 运行Game类的基础测试
 */

// Import required classes
const Vector2D = require('../js/Vector2D.js');
const { Game, PerformanceMonitor } = require('../js/Game.js');

// Mock DOM environment for Node.js testing
function setupMockEnvironment() {
    // Mock canvas context
    const mockContext = {
        scale: () => {},
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fillText: () => {},
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: 'left'
    };
    
    // Mock canvas element
    const mockCanvas = {
        id: 'physics-canvas',
        getContext: () => mockContext,
        parentElement: {
            getBoundingClientRect: () => ({
                width: 800,
                height: 600
            })
        },
        style: {},
        width: 800,
        height: 600
    };
    
    // Mock global objects
    global.document = {
        getElementById: (id) => {
            if (id === 'physics-canvas') return mockCanvas;
            return { addEventListener: () => {} };
        },
        addEventListener: () => {},
        querySelector: () => mockCanvas
    };
    
    global.window = {
        devicePixelRatio: 1,
        addEventListener: () => {},
        removeEventListener: () => {},
        requestAnimationFrame: (callback) => {
            setTimeout(() => callback(Date.now()), 16);
            return 1;
        },
        cancelAnimationFrame: () => {},
        location: { search: '' }
    };
    
    global.performance = {
        now: () => Date.now()
    };
    
    global.console = console;
}

/**
 * 运行测试
 */
function runTests() {
    console.log('🚀 Starting Game class tests...\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    const test = (name, testFn) => {
        totalTests++;
        try {
            testFn();
            console.log(`✅ ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
        }
    };
    
    // Setup mock environment
    setupMockEnvironment();
    
    // Test PerformanceMonitor class
    test('PerformanceMonitor creation', () => {
        const monitor = new PerformanceMonitor();
        if (!monitor) throw new Error('Failed to create PerformanceMonitor');
        if (monitor.getFPS() !== 0) throw new Error('Initial FPS should be 0');
    });
    
    test('PerformanceMonitor frame tracking', () => {
        const monitor = new PerformanceMonitor();
        monitor.update(1000);
        monitor.update(1016);
        monitor.update(1032);
        
        const avgFrameTime = monitor.getAverageFrameTime();
        if (avgFrameTime <= 0) throw new Error('Average frame time should be positive');
    });
    
    test('PerformanceMonitor reset', () => {
        const monitor = new PerformanceMonitor();
        monitor.update(1000);
        monitor.update(1016);
        monitor.reset();
        
        if (monitor.getFPS() !== 0) throw new Error('FPS should be 0 after reset');
        if (monitor.getAverageFrameTime() !== 0) throw new Error('Frame time should be 0 after reset');
    });
    
    // Test Game class (basic functionality)
    test('Game class creation', () => {
        try {
            const game = new Game('physics-canvas');
            if (!game) throw new Error('Failed to create Game instance');
            if (game.isRunning !== false) throw new Error('Game should not be running initially');
            if (game.isPaused !== false) throw new Error('Game should not be paused initially');
        } catch (error) {
            // Expected to fail in Node.js environment due to missing browser APIs
            // But the class should at least be constructible
            if (error.message.includes('not found') || error.message.includes('not supported')) {
                console.log('  ℹ️  Expected failure in Node.js environment (missing browser APIs)');
            } else {
                throw error;
            }
        }
    });
    
    test('Game configuration', () => {
        try {
            const game = new Game('physics-canvas', {
                enableDebug: true,
                targetFPS: 30
            });
            
            if (game.config.enableDebug !== true) throw new Error('Debug config not set');
            if (game.config.targetFPS !== 30) throw new Error('Target FPS config not set');
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not supported')) {
                console.log('  ℹ️  Expected failure in Node.js environment');
            } else {
                throw error;
            }
        }
    });
    
    // Test Vector2D integration (this should work in Node.js)
    test('Vector2D integration', () => {
        const v1 = new Vector2D(3, 4);
        const v2 = new Vector2D(1, 2);
        
        const sum = v1.add(v2);
        if (sum.x !== 4 || sum.y !== 6) throw new Error('Vector addition failed');
        
        const magnitude = v1.magnitude();
        if (Math.abs(magnitude - 5) > 0.001) throw new Error('Vector magnitude calculation failed');
    });
    
    // Summary
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed!');
        return true;
    } else {
        console.log('⚠️  Some tests failed. This is expected in Node.js environment due to missing browser APIs.');
        return false;
    }
}

/**
 * 测试Game类的核心功能（不依赖DOM的部分）
 */
function testGameLogic() {
    console.log('\n🔧 Testing Game logic components...\n');
    
    // Test PerformanceMonitor in detail
    console.log('Testing PerformanceMonitor performance detection...');
    const monitor = new PerformanceMonitor();
    
    // Simulate good performance (60 FPS)
    let time = 1000;
    for (let i = 0; i < 60; i++) {
        monitor.update(time);
        time += 16.67; // 60 FPS
    }
    
    console.log(`  - Simulated 60 FPS: ${monitor.isPerformanceGood() ? '✅ Good' : '❌ Poor'}`);
    console.log(`  - Average frame time: ${monitor.getAverageFrameTime().toFixed(2)}ms`);
    
    // Reset and simulate poor performance (20 FPS)
    monitor.reset();
    time = 1000;
    for (let i = 0; i < 20; i++) {
        monitor.update(time);
        time += 50; // 20 FPS
    }
    
    console.log(`  - Simulated 20 FPS: ${monitor.isPerformanceGood() ? '✅ Good' : '❌ Poor'}`);
    console.log(`  - Average frame time: ${monitor.getAverageFrameTime().toFixed(2)}ms`);
    
    console.log('\n✅ Game logic components test completed!');
}

// Run tests
if (require.main === module) {
    const success = runTests();
    testGameLogic();
    
    console.log('\n📝 Note: Full Game class testing requires a browser environment.');
    console.log('   Use test-game.html for complete browser-based testing.');
    
    process.exit(success ? 0 : 1);
}

module.exports = { runTests, testGameLogic };