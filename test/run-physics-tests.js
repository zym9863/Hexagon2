/**
 * PhysicsEngine 测试运行器
 * 在Node.js环境中运行PhysicsEngine的单元测试
 */

const fs = require('fs');
const path = require('path');

// 加载依赖的类文件
function loadClass(filename) {
    const filePath = path.join(__dirname, '..', 'js', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 创建一个新的上下文来执行代码
    const vm = require('vm');
    const context = {
        console: console,
        Math: Math,
        isFinite: isFinite,
        window: global.window,
        performance: global.performance,
        document: global.document
    };
    
    // 添加已加载的类到上下文
    if (global.Vector2D) context.Vector2D = global.Vector2D;
    if (global.Ball) context.Ball = global.Ball;
    
    // 执行类定义
    vm.createContext(context);
    vm.runInContext(content, context);
    
    // 返回类构造函数
    const className = path.parse(filename).name;
    return context[className];
}

// 设置全局环境
global.window = {
    DEBUG_PHYSICS: false
};

global.performance = {
    now: () => Date.now()
};

global.document = {
    querySelector: () => ({
        width: 800,
        height: 600
    })
};

try {
    // 按依赖顺序加载类
    console.log('Loading Vector2D...');
    global.Vector2D = loadClass('Vector2D.js');
    
    console.log('Loading Ball...');
    global.Ball = loadClass('Ball.js');
    
    console.log('Loading PhysicsEngine...');
    global.PhysicsEngine = loadClass('PhysicsEngine.js');
    
    // 加载并运行测试
    console.log('Loading PhysicsEngine tests...');
    const testModule = require('./PhysicsEngine.test.js');
    
    console.log('\n=== Running PhysicsEngine Tests ===\n');
    
    const success = testModule.runAllTests();
    
    if (success) {
        console.log('\n🎉 All tests completed successfully!');
        process.exit(0);
    } else {
        console.log('\n💥 Some tests failed!');
        process.exit(1);
    }
    
} catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
}