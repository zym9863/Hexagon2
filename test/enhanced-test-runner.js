#!/usr/bin/env node

/**
 * 增强测试运行器 - Enhanced Test Runner
 * 运行完整的测试套件：单元测试、集成测试、性能测试和兼容性测试
 * 
 * Requirements: 6.1, 6.4 - 流畅动画和性能优化验证
 */

const fs = require('fs');
const path = require('path');

// 颜色输出支持
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return colors[color] + text + colors.reset;
}

// 设置全局环境模拟浏览器API
function setupEnhancedTestEnvironment() {
    // 模拟window对象
    global.window = {
        DEBUG_PHYSICS: false,
        devicePixelRatio: 2, // 模拟高DPI屏幕
        requestAnimationFrame: (callback) => setTimeout(callback, 16),
        cancelAnimationFrame: (id) => clearTimeout(id),
        innerWidth: 1920,
        innerHeight: 1080
    };

    // 增强的performance API模拟
    global.performance = {
        now: () => {
            const hrTime = process.hrtime();
            return hrTime[0] * 1000 + hrTime[1] / 1e6;
        },
        memory: {
            usedJSHeapSize: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
            totalJSHeapSize: Math.floor(Math.random() * 100000000) + 50000000, // 50-150MB
            jsHeapSizeLimit: Math.floor(Math.random() * 200000000) + 100000000 // 100-300MB
        },
        mark: (name) => {},
        measure: (name, startMark, endMark) => {},
        getEntriesByType: (type) => [],
        clearMarks: () => {},
        clearMeasures: () => {}
    };

    // 增强的document对象模拟
    global.document = {
        createElement: (tagName) => {
            if (tagName === 'canvas') {
                return {
                    width: 800,
                    height: 600,
                    style: {},
                    parentElement: {
                        getBoundingClientRect: () => ({
                            width: 800,
                            height: 600,
                            left: 0,
                            top: 0
                        })
                    },
                    getContext: (type) => {
                        if (type === '2d') {
                            return createMockCanvas2DContext();
                        } else if (type === 'webgl' || type === 'experimental-webgl') {
                            return createMockWebGLContext();
                        }
                        return null;
                    }
                };
            }
            return {
                style: {},
                addEventListener: () => {},
                removeEventListener: () => {}
            };
        },
        querySelector: (selector) => ({
            width: 800,
            height: 600,
            style: {}
        }),
        querySelectorAll: () => []
    };

    // 模拟navigator对象
    global.navigator = {
        userAgent: 'Mozilla/5.0 (Test Environment) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        platform: 'Test Platform',
        language: 'en-US',
        cookieEnabled: true,
        onLine: true,
        hardwareConcurrency: 8,
        deviceMemory: 8
    };

    // 模拟screen对象
    global.screen = {
        width: 1920,
        height: 1080,
        colorDepth: 24,
        pixelDepth: 24
    };

    // 全局函数
    global.requestAnimationFrame = global.window.requestAnimationFrame;
    global.cancelAnimationFrame = global.window.cancelAnimationFrame;
    global.isFinite = Number.isFinite;
    
    console.log(colorize('✓ Enhanced test environment initialized', 'green'));
}

// 创建模拟的Canvas 2D上下文
function createMockCanvas2DContext() {
    return {
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        fillRect: () => {},
        strokeRect: () => {},
        createLinearGradient: () => ({
            addColorStop: () => {}
        }),
        createPattern: () => ({}),
        measureText: (text) => ({ width: text.length * 8 }),
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
        drawImage: () => {},
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: true
    };
}

// 创建模拟的WebGL上下文
function createMockWebGLContext() {
    return {
        getParameter: (param) => {
            const GL_RENDERER = 0x1F01;
            const GL_VENDOR = 0x1F00;
            const GL_VERSION = 0x1F02;
            
            switch (param) {
                case GL_RENDERER: return 'Mock WebGL Renderer';
                case GL_VENDOR: return 'Mock WebGL Vendor';
                case GL_VERSION: return 'WebGL 1.0 (Mock)';
                default: return null;
            }
        },
        createShader: () => ({}),
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        getAttribLocation: () => 0,
        getUniformLocation: () => ({}),
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        drawArrays: () => {},
        drawElements: () => {}
    };
}

// 加载类文件（增强版）
function loadClassEnhanced(filename) {
    const filePath = path.join(__dirname, '..', 'js', filename);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Class file not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 创建VM上下文
    const vm = require('vm');
    const context = {
        console: console,
        Math: Math,
        isFinite: isFinite,
        Number: Number,
        window: global.window,
        performance: global.performance,
        document: global.document,
        navigator: global.navigator,
        screen: global.screen,
        requestAnimationFrame: global.requestAnimationFrame,
        cancelAnimationFrame: global.cancelAnimationFrame,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        module: { exports: {} },
        exports: {},
        global: global
    };
    
    // 添加已加载的类到上下文
    const loadedClasses = ['Vector2D', 'Ball', 'Hexagon', 'PhysicsEngine', 'Renderer', 'Game'];
    loadedClasses.forEach(className => {
        if (global[className]) {
            context[className] = global[className];
        }
    });
    
    // 执行类定义
    vm.createContext(context);
    vm.runInContext(content, context);
    
    // 返回类构造函数
    const className = path.parse(filename).name;
    
    if (context[className]) {
        return context[className];
    }
    
    if (context.module && context.module.exports) {
        return context.module.exports;
    }
    
    throw new Error(`Class ${className} not found in ${filename}`);
}

// 加载测试套件（增强版）
function loadTestSuiteEnhanced(filename) {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Test suite file not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    const vm = require('vm');
    const context = {
        console: console,
        Math: Math,
        isFinite: isFinite,
        Number: Number,
        performance: global.performance,
        document: global.document,
        navigator: global.navigator,
        screen: global.screen,
        window: global.window,
        Vector2D: global.Vector2D,
        Ball: global.Ball,
        Hexagon: global.Hexagon,
        PhysicsEngine: global.PhysicsEngine,
        Renderer: global.Renderer,
        Game: global.Game,
        BrowserCompatibilityTest: global.BrowserCompatibilityTest,
        PerformanceBenchmark: global.PerformanceBenchmark,
        module: { exports: {} },
        global: global,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Promise: Promise,
        require: require // 允许测试套件加载其他模块
    };
    
    vm.createContext(context);
    vm.runInContext(content, context);
    
    return context.module.exports;
}

// 运行单个测试套件（增强版）
async function runEnhancedTestSuite(suiteName, TestSuiteClass) {
    console.log(colorize(`\n🧪 Running ${suiteName}...`, 'cyan'));
    console.log('='.repeat(60));
    
    const startTime = performance.now();
    
    try {
        const suite = new TestSuiteClass();
        const results = await suite.runAllTests();
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // 计算统计信息
        let totalTests = 0;
        let passedTests = 0;
        
        if (Array.isArray(results)) {
            totalTests = results.length;
            passedTests = results.filter(r => r.passed).length;
        } else if (suite.testResults) {
            // 处理分类测试结果
            Object.values(suite.testResults).forEach(category => {
                if (Array.isArray(category)) {
                    totalTests += category.length;
                    passedTests += category.filter(t => t.passed).length;
                }
            });
        } else if (suite.getResults) {
            const suiteResults = suite.getResults();
            if (suiteResults.testResults) {
                Object.values(suiteResults.testResults).forEach(category => {
                    if (Array.isArray(category)) {
                        totalTests += category.length;
                        passedTests += category.filter(t => t.passed).length;
                    }
                });
            }
        }
        
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
        
        if (passedTests === totalTests) {
            console.log(colorize(`✅ ${suiteName} completed successfully!`, 'green'));
            console.log(colorize(`📊 Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`, 'green'));
            console.log(colorize(`⏱️  Execution time: ${executionTime.toFixed(2)}ms`, 'green'));
        } else {
            console.log(colorize(`⚠️ ${suiteName} completed with failures.`, 'yellow'));
            console.log(colorize(`📊 Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`, 'yellow'));
            console.log(colorize(`⏱️  Execution time: ${executionTime.toFixed(2)}ms`, 'yellow'));
        }
        
        return { 
            suiteName, 
            totalTests, 
            passedTests, 
            successRate, 
            executionTime,
            success: passedTests === totalTests,
            results: results || suite.testResults || suite.getResults()
        };
        
    } catch (error) {
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        console.error(colorize(`❌ ${suiteName} failed:`, 'red'));
        console.error(colorize(error.message, 'red'));
        if (error.stack) {
            console.error(colorize('Stack trace:', 'red'));
            console.error(error.stack);
        }
        
        return { 
            suiteName, 
            totalTests: 0, 
            passedTests: 0, 
            successRate: 0, 
            executionTime,
            success: false, 
            error: error.message 
        };
    }
}

// 主执行函数（增强版）
async function runEnhancedTests() {
    console.log(colorize('🚀 Starting Enhanced Comprehensive Test Execution...', 'bright'));
    console.log(colorize('Testing Rotating Hexagon Ball Physics System', 'blue'));
    console.log(colorize('Requirements: 6.1 (Animation Performance), 6.4 (Optimization)', 'blue'));
    console.log('='.repeat(80));
    
    const startTime = performance.now();
    const results = [];
    
    try {
        // 设置增强测试环境
        console.log(colorize('📦 Setting up enhanced test environment...', 'cyan'));
        setupEnhancedTestEnvironment();
        
        // 按依赖顺序加载所有核心类
        console.log(colorize('📚 Loading core classes...', 'cyan'));
        
        const classesToLoad = [
            'Vector2D.js',
            'Ball.js', 
            'Hexagon.js',
            'PhysicsEngine.js',
            'Renderer.js',
            'Game.js'
        ];
        
        for (const className of classesToLoad) {
            try {
                const ClassConstructor = loadClassEnhanced(className);
                const name = path.parse(className).name;
                global[name] = ClassConstructor;
                console.log(colorize(`  ✓ ${name} loaded`, 'green'));
            } catch (error) {
                console.error(colorize(`  ❌ Failed to load ${className}: ${error.message}`, 'red'));
                throw error;
            }
        }
        
        // 加载辅助测试类
        console.log(colorize('🔧 Loading test utilities...', 'cyan'));
        try {
            const BrowserCompatibilityTest = loadTestSuiteEnhanced('browser-compatibility-test.js');
            global.BrowserCompatibilityTest = BrowserCompatibilityTest;
            console.log(colorize('  ✓ BrowserCompatibilityTest loaded', 'green'));
        } catch (error) {
            console.log(colorize(`  ⚠️  BrowserCompatibilityTest not available: ${error.message}`, 'yellow'));
        }
        
        try {
            const PerformanceBenchmark = loadTestSuiteEnhanced('performance-benchmark.js');
            global.PerformanceBenchmark = PerformanceBenchmark;
            console.log(colorize('  ✓ PerformanceBenchmark loaded', 'green'));
        } catch (error) {
            console.log(colorize(`  ⚠️  PerformanceBenchmark not available: ${error.message}`, 'yellow'));
        }
        
        // 运行增强综合测试套件
        console.log(colorize('🧪 Loading enhanced comprehensive test suite...', 'cyan'));
        try {
            const EnhancedComprehensiveTestSuite = loadTestSuiteEnhanced('enhanced-comprehensive-test-suite-fixed.js');
            console.log(colorize('  ✓ EnhancedComprehensiveTestSuite loaded', 'green'));
            
            // 运行增强综合测试套件
            const enhancedResult = await runEnhancedTestSuite('Enhanced Comprehensive Test Suite', EnhancedComprehensiveTestSuite);
            results.push(enhancedResult);
            
        } catch (error) {
            console.error(colorize(`  ❌ Failed to load EnhancedComprehensiveTestSuite: ${error.message}`, 'red'));
            results.push({ 
                suiteName: 'Enhanced Comprehensive Test Suite', 
                totalTests: 0, 
                passedTests: 0, 
                successRate: 0, 
                success: false, 
                error: error.message 
            });
        }
        
        // 运行独立性能基准测试（如果可用）
        if (global.PerformanceBenchmark) {
            try {
                const performanceResult = await runEnhancedTestSuite('Performance Benchmark', global.PerformanceBenchmark);
                results.push(performanceResult);
            } catch (error) {
                console.error(colorize(`Performance Benchmark failed: ${error.message}`, 'red'));
                results.push({ 
                    suiteName: 'Performance Benchmark', 
                    totalTests: 0, 
                    passedTests: 0, 
                    successRate: 0, 
                    success: false, 
                    error: error.message 
                });
            }
        }
        
        // 生成最终报告
        generateEnhancedFinalReport(results, startTime);
        
        // 确定退出代码
        const allPassed = results.every(r => r.success);
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        console.error(colorize('\n❌ Enhanced test execution failed:', 'red'));
        console.error(colorize(error.message, 'red'));
        if (error.stack) {
            console.error(colorize('\nStack trace:', 'red'));
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// 生成增强最终测试报告
function generateEnhancedFinalReport(results, startTime) {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log('\n' + colorize('='.repeat(80), 'bright'));
    console.log(colorize('📊 ENHANCED FINAL TEST REPORT', 'bright'));
    console.log(colorize('='.repeat(80), 'bright'));
    
    console.log(colorize(`⏱️  Total execution time: ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)`, 'cyan'));
    console.log(colorize(`🎯 Requirements tested: 6.1 (Animation Performance), 6.4 (Optimization)`, 'cyan'));
    console.log('');
    
    let totalTests = 0;
    let totalPassed = 0;
    let allSuccess = true;
    
    // 显示每个测试套件的结果
    results.forEach(result => {
        const status = result.success ? colorize('✅ PASS', 'green') : colorize('❌ FAIL', 'red');
        console.log(`${status} ${result.suiteName}`);
        
        if (result.error) {
            console.log(colorize(`     Error: ${result.error}`, 'red'));
        } else {
            console.log(`     Tests: ${result.passedTests}/${result.totalTests} passed (${result.successRate}%)`);
            console.log(`     Time: ${result.executionTime.toFixed(2)}ms`);
        }
        
        totalTests += result.totalTests;
        totalPassed += result.passedTests;
        allSuccess = allSuccess && result.success;
    });
    
    console.log('\n' + colorize('-'.repeat(80), 'bright'));
    
    // 总体统计
    const overallSuccessRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;
    
    if (allSuccess) {
        console.log(colorize('🎉 ALL TEST SUITES PASSED!', 'green'));
        console.log(colorize(`📈 Overall: ${totalPassed}/${totalTests} tests passed (${overallSuccessRate}%)`, 'green'));
        console.log(colorize('✨ System meets all performance and quality requirements!', 'green'));
        console.log(colorize('🚀 Ready for production deployment!', 'green'));
    } else {
        console.log(colorize('⚠️  SOME TEST SUITES FAILED', 'yellow'));
        console.log(colorize(`📈 Overall: ${totalPassed}/${totalTests} tests passed (${overallSuccessRate}%)`, 'yellow'));
        console.log(colorize('🔧 Please review the failed tests above.', 'yellow'));
    }
    
    // 性能分析
    console.log('\n' + colorize('📊 Performance Analysis:', 'cyan'));
    if (totalTime < 5000) {
        console.log(colorize('   ⚡ Excellent: Test execution is very fast', 'green'));
    } else if (totalTime < 15000) {
        console.log(colorize('   ✅ Good: Test execution time is acceptable', 'green'));
    } else {
        console.log(colorize('   ⚠️  Slow: Consider optimizing test execution', 'yellow'));
    }
    
    // 质量评估
    console.log(colorize('🎯 Quality Assessment:', 'cyan'));
    if (overallSuccessRate >= 95) {
        console.log(colorize('   🏆 Excellent: System quality is outstanding', 'green'));
    } else if (overallSuccessRate >= 85) {
        console.log(colorize('   ✅ Good: System quality is solid', 'green'));
    } else if (overallSuccessRate >= 70) {
        console.log(colorize('   ⚠️  Fair: System needs improvement', 'yellow'));
    } else {
        console.log(colorize('   ❌ Poor: System requires significant fixes', 'red'));
    }
    
    // 建议
    console.log('\n' + colorize('💡 Recommendations:', 'cyan'));
    
    if (allSuccess) {
        console.log(colorize('   ✨ System is production-ready with excellent test coverage', 'green'));
        console.log(colorize('   📚 Consider adding more edge case tests for robustness', 'cyan'));
        console.log(colorize('   🔄 Set up continuous integration for ongoing quality assurance', 'cyan'));
    } else {
        console.log(colorize('   🔧 Fix all failing tests before production deployment', 'yellow'));
        console.log(colorize('   📊 Focus on performance optimizations for failed benchmarks', 'yellow'));
        console.log(colorize('   🧪 Add more comprehensive test coverage for weak areas', 'yellow'));
    }
    
    console.log(colorize('='.repeat(80), 'bright'));
    
    // 测试覆盖率建议
    if (totalTests < 50) {
        console.log(colorize('\n📈 Test Coverage Note: Consider adding more test cases for comprehensive coverage.', 'yellow'));
    }
    
    // 性能建议
    if (totalTime > 30000) { // 超过30秒
        console.log(colorize('\n⚡ Performance Note: Test execution is slow. Consider parallel execution or optimization.', 'yellow'));
    }
}

// 如果直接运行此文件，执行增强测试
if (require.main === module) {
    runEnhancedTests().catch(error => {
        console.error(colorize('Unhandled error in enhanced test execution:', 'red'));
        console.error(error);
        process.exit(1);
    });
}

module.exports = { 
    runEnhancedTests, 
    setupEnhancedTestEnvironment, 
    loadClassEnhanced, 
    loadTestSuiteEnhanced,
    runEnhancedTestSuite,
    generateEnhancedFinalReport
};