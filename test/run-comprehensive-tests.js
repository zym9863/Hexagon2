#!/usr/bin/env node

/**
 * 综合测试执行脚本 - Comprehensive Test Execution Script
 * 一键运行所有测试：单元测试、集成测试、性能测试和兼容性测试
 * 
 * Usage: node test/run-comprehensive-tests.js [options]
 * Options:
 *   --enhanced    Run enhanced comprehensive test suite
 *   --performance Run only performance benchmarks
 *   --unit        Run only unit tests
 *   --integration Run only integration tests
 *   --compatibility Run only compatibility tests
 *   --verbose     Enable verbose output
 *   --help        Show this help message
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
    enhanced: args.includes('--enhanced'),
    performance: args.includes('--performance'),
    unit: args.includes('--unit'),
    integration: args.includes('--integration'),
    compatibility: args.includes('--compatibility'),
    verbose: args.includes('--verbose'),
    help: args.includes('--help')
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return colors[color] + text + colors.reset;
}

// 显示帮助信息
function showHelp() {
    console.log(colorize('🧪 Comprehensive Test Runner for Rotating Hexagon Ball Physics', 'bright'));
    console.log('');
    console.log('Usage: node test/run-comprehensive-tests.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --enhanced      Run enhanced comprehensive test suite (recommended)');
    console.log('  --performance   Run only performance benchmarks');
    console.log('  --unit          Run only unit tests');
    console.log('  --integration   Run only integration tests');
    console.log('  --compatibility Run only compatibility tests');
    console.log('  --verbose       Enable verbose output');
    console.log('  --help          Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node test/run-comprehensive-tests.js --enhanced');
    console.log('  node test/run-comprehensive-tests.js --performance --verbose');
    console.log('  node test/run-comprehensive-tests.js --unit --integration');
    console.log('');
    console.log('Requirements tested: 6.1 (Animation Performance), 6.4 (Optimization)');
}

// 检查测试文件是否存在
function checkTestFiles() {
    const requiredFiles = [
        'test/enhanced-test-runner.js',
        'test/enhanced-comprehensive-test-suite.js',
        'js/Vector2D.js',
        'js/Ball.js',
        'js/Hexagon.js',
        'js/PhysicsEngine.js',
        'js/Renderer.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
        console.error(colorize('❌ Missing required files:', 'red'));
        missingFiles.forEach(file => {
            console.error(colorize(`   ${file}`, 'red'));
        });
        console.error('');
        console.error(colorize('Please ensure all required files are present before running tests.', 'red'));
        process.exit(1);
    }
    
    console.log(colorize('✓ All required test files found', 'green'));
}

// 运行测试命令
function runTestCommand(command, description) {
    console.log(colorize(`\n🚀 ${description}...`, 'cyan'));
    console.log('='.repeat(60));
    
    try {
        const output = execSync(command, { 
            encoding: 'utf8', 
            stdio: options.verbose ? 'inherit' : 'pipe',
            cwd: process.cwd()
        });
        
        if (!options.verbose && output) {
            console.log(output);
        }
        
        console.log(colorize(`✅ ${description} completed successfully`, 'green'));
        return true;
    } catch (error) {
        console.error(colorize(`❌ ${description} failed:`, 'red'));
        console.error(colorize(error.message, 'red'));
        
        if (error.stdout) {
            console.log('\nStdout:');
            console.log(error.stdout);
        }
        
        if (error.stderr) {
            console.error('\nStderr:');
            console.error(error.stderr);
        }
        
        return false;
    }
}

// 主执行函数
async function main() {
    if (options.help) {
        showHelp();
        return;
    }
    
    console.log(colorize('🧪 Comprehensive Test Runner', 'bright'));
    console.log(colorize('Testing Rotating Hexagon Ball Physics System', 'blue'));
    console.log(colorize('Requirements: 6.1 (Animation Performance), 6.4 (Optimization)', 'blue'));
    console.log('='.repeat(80));
    
    // 检查测试文件
    checkTestFiles();
    
    const results = [];
    let hasFailures = false;
    
    // 运行增强综合测试套件（默认或指定）
    if (options.enhanced || (!options.performance && !options.unit && !options.integration && !options.compatibility)) {
        const success = runTestCommand(
            'node test/enhanced-test-runner.js',
            'Enhanced Comprehensive Test Suite'
        );
        results.push({ name: 'Enhanced Comprehensive Tests', success });
        if (!success) hasFailures = true;
    }
    
    // 运行特定测试类别
    if (options.performance) {
        const success = runTestCommand(
            'node test/performance-benchmark.js',
            'Performance Benchmarks'
        );
        results.push({ name: 'Performance Benchmarks', success });
        if (!success) hasFailures = true;
    }
    
    if (options.unit) {
        const success = runTestCommand(
            'node test/PhysicsEngine.test.js',
            'Physics Engine Unit Tests'
        );
        results.push({ name: 'Unit Tests', success });
        if (!success) hasFailures = true;
    }
    
    if (options.integration) {
        const success = runTestCommand(
            'node test/collision-detection-test.js',
            'Collision Detection Integration Tests'
        );
        results.push({ name: 'Integration Tests', success });
        if (!success) hasFailures = true;
    }
    
    if (options.compatibility) {
        const success = runTestCommand(
            'node test/browser-compatibility-test.js',
            'Cross-Browser Compatibility Tests'
        );
        results.push({ name: 'Compatibility Tests', success });
        if (!success) hasFailures = true;
    }
    
    // 生成最终报告
    generateFinalSummary(results, hasFailures);
    
    // 退出代码
    process.exit(hasFailures ? 1 : 0);
}

// 生成最终摘要
function generateFinalSummary(results, hasFailures) {
    console.log('\n' + colorize('='.repeat(80), 'bright'));
    console.log(colorize('📊 FINAL TEST EXECUTION SUMMARY', 'bright'));
    console.log(colorize('='.repeat(80), 'bright'));
    
    const passedCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`\n📈 Test Suites: ${passedCount}/${totalCount} passed\n`);
    
    results.forEach(result => {
        const status = result.success ? colorize('✅ PASS', 'green') : colorize('❌ FAIL', 'red');
        console.log(`${status} ${result.name}`);
    });
    
    console.log('\n' + colorize('-'.repeat(80), 'bright'));
    
    if (!hasFailures) {
        console.log(colorize('🎉 ALL TEST SUITES PASSED!', 'green'));
        console.log(colorize('✨ System is ready for production deployment!', 'green'));
        console.log(colorize('🚀 Requirements 6.1 and 6.4 have been validated successfully!', 'green'));
    } else {
        console.log(colorize('⚠️  SOME TEST SUITES FAILED', 'yellow'));
        console.log(colorize('🔧 Please review the failed tests and fix issues before deployment.', 'yellow'));
    }
    
    console.log('\n💡 Next Steps:');
    if (!hasFailures) {
        console.log(colorize('   ✅ System validation complete - ready for production', 'green'));
        console.log(colorize('   📚 Consider setting up continuous integration', 'cyan'));
        console.log(colorize('   🔄 Run tests regularly during development', 'cyan'));
    } else {
        console.log(colorize('   🔧 Fix all failing tests', 'yellow'));
        console.log(colorize('   📊 Review performance benchmarks', 'yellow'));
        console.log(colorize('   🧪 Add additional test coverage if needed', 'yellow'));
    }
    
    console.log(colorize('='.repeat(80), 'bright'));
}

// 运行主函数
main().catch(error => {
    console.error(colorize('\n❌ Test execution failed:', 'red'));
    console.error(colorize(error.message, 'red'));
    console.error(error.stack);
    process.exit(1);
});