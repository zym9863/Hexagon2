#!/usr/bin/env node

/**
 * 全面测试运行器 - Complete Test Runner
 * 运行所有测试套件：单元测试、集成测试、性能测试和兼容性测试
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
function setupTestEnvironment() {
    // 模拟window对象
    global.window = {
        DEBUG_PHYSICS: false,
        devicePixelRatio: 1,
        requestAnimationFrame: (callback) => setTimeout(callback, 16),
        cancelAnimationFrame: (id) => clearTimeout(id)
    };

    // 模拟performance API
    global.performance = {
        now: () => Date.now(),
        memory: {
            usedJSHeapSize: Math.floor(Math.random() * 1000000) + 500000,
            totalJSHeapSize: Math.floor(Math.random() * 2000000) + 1000000,
            jsHeapSizeLimit: Math.floor(Math.random() * 4000000) + 2000000
        }
    };

    // 模拟document对象
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
                            height: 600
                        })
                    },
                    getContext: (type) => {
                        if (type === '2d') {
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
                                strokeRect: () => {}
                            };
                        }
                        return null;
                    }
                };
            }
            return {};
        },
        querySelector: () => ({
            width: 800,
            height: 600
        })
    };

    // 模拟requestAnimationFrame
    global.requestAnimationFrame = global.window.requestAnimationFrame;
    global.cancelAnimationFrame = global.window.cancelAnimationFrame;
    
    // 模拟isFinite
    global.isFinite = Number.isFinite;
}

// 加载类文件
function loadClass(filename) {
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
        requestAnimationFrame: global.requestAnimationFrame,
        cancelAnimationFrame: global.cancelAnimationFrame,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        module: { exports: {} },
        exports: {}
    };
    
    // 添加已加载的类到上下文
    if (global.Vector2D) context.Vector2D = global.Vector2D;
    if (global.Ball) context.Ball = global.Ball;
    if (global.Hexagon) context.Hexagon = global.Hexagon;
    if (global.PhysicsEngine) context.PhysicsEngine = global.PhysicsEngine;
    if (global.Renderer) context.Renderer = global.Renderer;
    
    // 执行类定义
    vm.createContext(context);
    vm.runInContext(content, context);
    
    // 返回类构造函数
    const className = path.parse(filename).name;
    
    // 首先尝试从context中获取类
    if (context[className]) {
        return context[className];
    }
    
    // 如果context中没有，尝试从module.exports获取
    if (context.module && context.module.exports) {
        return context.module.exports;
    }
    
    // 最后尝试直接eval获取
    try {
        const evalResult = vm.runInContext(className, context);
        if (evalResult) {
            return evalResult;
        }
    } catch (e) {
        // Ignore eval errors
    }
    
    throw new Error(`Class ${className} not found in ${filename}`);
}

// 加载测试套件
function loadTestSuite(filename) {
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
        Vector2D: global.Vector2D,
        Ball: global.Ball,
        Hexagon: global.Hexagon,
        PhysicsEngine: global.PhysicsEngine,
        Renderer: global.Renderer,
        PerformanceBenchmark: global.PerformanceBenchmark,
        module: { exports: {} },
        global: global,
        setTimeout: setTimeout,
        Promise: Promise
    };
    
    vm.createContext(context);
    vm.runInContext(content, context);
    
    return context.module.exports;
}

// 运行单个测试套件
async function runTestSuite(suiteName, TestSuiteClass) {
    console.log(colorize(`\n🧪 Running ${suiteName}...`, 'cyan'));
    console.log('='.repeat(60));
    
    try {
        const suite = new TestSuiteClass();
        const results = await suite.runAllTests();
        
        // 计算统计信息
        const totalTests = Array.isArray(results) ? results.length : 
            Object.values(suite.testResults || {}).reduce((sum, tests) => sum + tests.length, 0);
        const passedTests = Array.isArray(results) ? results.filter(r => r.passed).length :
            Object.values(suite.testResults || {}).reduce((sum, tests) => 
                sum + tests.filter(t => t.passed).length, 0);
        
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
        
        if (passedTests === totalTests) {
            console.log(colorize(`✅ ${suiteName} completed successfully!`, 'green'));
            console.log(colorize(`📊 Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`, 'green'));
        } else {
            console.log(colorize(`⚠️ ${suiteName} completed with failures.`, 'yellow'));
            console.log(colorize(`📊 Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`, 'yellow'));
        }
        
        return { suiteName, totalTests, passedTests, successRate, success: passedTests === totalTests };
        
    } catch (error) {
        console.error(colorize(`❌ ${suiteName} failed:`, 'red'));
        console.error(colorize(error.message, 'red'));
        if (error.stack) {
            console.error(colorize('Stack trace:', 'red'));
            console.error(error.stack);
        }
        
        return { suiteName, totalTests: 0, passedTests: 0, successRate: 0, success: false, error: error.message };
    }
}

// 主执行函数
async function runAllTests() {
    console.log(colorize('🚀 Starting Comprehensive Test Execution...', 'bright'));
    console.log(colorize('Testing Rotating Hexagon Ball Physics System', 'blue'));
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    const results = [];
    
    try {
        // 设置测试环境
        console.log(colorize('📦 Setting up test environment...', 'cyan'));
        setupTestEnvironment();
        
        // 按依赖顺序加载所有核心类
        console.log(colorize('📚 Loading core classes...', 'cyan'));
        
        const classesToLoad = [
            'Vector2D.js',
            'Ball.js', 
            'Hexagon.js',
            'PhysicsEngine.js',
            'Renderer.js'
        ];
        
        for (const className of classesToLoad) {
            try {
                const ClassConstructor = loadClass(className);
                const name = path.parse(className).name;
                global[name] = ClassConstructor;
                console.log(colorize(`  ✓ ${name} loaded`, 'green'));
            } catch (error) {
                console.error(colorize(`  ❌ Failed to load ${className}: ${error.message}`, 'red'));
                throw error;
            }
        }
        
        // 加载性能基准测试
        console.log(colorize('📈 Loading performance benchmark...', 'cyan'));
        try {
            const PerformanceBenchmark = loadTestSuite('performance-benchmark.js');
            global.PerformanceBenchmark = PerformanceBenchmark;
            console.log(colorize('  ✓ PerformanceBenchmark loaded', 'green'));
        } catch (error) {
            console.error(colorize(`  ❌ Failed to load PerformanceBenchmark: ${error.message}`, 'red'));
            throw error;
        }
        
        // 加载综合测试套件
        console.log(colorize('🧪 Loading comprehensive test suite...', 'cyan'));
        try {
            const ComprehensiveTestSuite = loadTestSuite('comprehensive-test-suite.js');
            console.log(colorize('  ✓ ComprehensiveTestSuite loaded', 'green'));
            
            // 运行综合测试套件
            const comprehensiveResult = await runTestSuite('Comprehensive Test Suite', ComprehensiveTestSuite);
            results.push(comprehensiveResult);
            
        } catch (error) {
            console.error(colorize(`  ❌ Failed to load ComprehensiveTestSuite: ${error.message}`, 'red'));
            results.push({ 
                suiteName: 'Comprehensive Test Suite', 
                totalTests: 0, 
                passedTests: 0, 
                successRate: 0, 
                success: false, 
                error: error.message 
            });
        }
        
        // 运行独立性能基准测试
        try {
            const performanceResult = await runTestSuite('Performance Benchmark', global.PerformanceBenchmark);
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
        
        // 生成最终报告
        generateFinalReport(results, startTime);
        
        // 确定退出代码
        const allPassed = results.every(r => r.success);
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        console.error(colorize('\n❌ Test execution failed:', 'red'));
        console.error(colorize(error.message, 'red'));
        if (error.stack) {
            console.error(colorize('\nStack trace:', 'red'));
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// 生成最终测试报告
function generateFinalReport(results, startTime) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('\n' + colorize('='.repeat(80), 'bright'));
    console.log(colorize('📊 FINAL TEST REPORT', 'bright'));
    console.log(colorize('='.repeat(80), 'bright'));
    
    console.log(colorize(`⏱️  Total execution time: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`, 'cyan'));
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
        console.log(colorize('✨ System is ready for production!', 'green'));
    } else {
        console.log(colorize('⚠️  SOME TEST SUITES FAILED', 'yellow'));
        console.log(colorize(`📈 Overall: ${totalPassed}/${totalTests} tests passed (${overallSuccessRate}%)`, 'yellow'));
        console.log(colorize('🔧 Please review the failed tests above.', 'yellow'));
    }
    
    console.log(colorize('='.repeat(80), 'bright'));
    
    // 性能建议
    if (totalTime > 10000) { // 超过10秒
        console.log(colorize('\n💡 Performance Note: Tests took longer than expected.', 'yellow'));
        console.log(colorize('   Consider optimizing test execution or system performance.', 'yellow'));
    }
    
    // 测试覆盖率建议
    if (overallSuccessRate < 100) {
        console.log(colorize('\n🎯 Next Steps:', 'cyan'));
        console.log(colorize('   1. Review failed test details above', 'cyan'));
        console.log(colorize('   2. Fix identified issues in the codebase', 'cyan'));
        console.log(colorize('   3. Re-run tests to verify fixes', 'cyan'));
        console.log(colorize('   4. Consider adding additional test cases', 'cyan'));
    }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    runAllTests().catch(error => {
        console.error(colorize('Unhandled error in test execution:', 'red'));
        console.error(error);
        process.exit(1);
    });
}

module.exports = { runAllTests, setupTestEnvironment, loadClass, loadTestSuite };