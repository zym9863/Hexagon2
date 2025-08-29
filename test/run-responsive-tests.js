/**
 * 响应式设计测试运行器
 * 在Node.js环境中运行响应式设计测试
 */

// 模拟浏览器环境
global.window = {
    innerWidth: 1200,
    innerHeight: 800,
    devicePixelRatio: 1,
    matchMedia: (query) => ({
        matches: false,
        media: query
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
};

global.document = {
    createElement: (tagName) => {
        const element = {
            tagName: tagName.toUpperCase(),
            style: {},
            appendChild: () => {},
            removeChild: () => {},
            getBoundingClientRect: () => ({
                width: 800,
                height: 600,
                top: 0,
                left: 0
            })
        };
        
        if (tagName === 'canvas') {
            element.getContext = () => ({
                scale: () => {},
                clearRect: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                moveTo: () => {},
                lineTo: () => {},
                closePath: () => {},
                fillRect: () => {}
            });
            element.width = 800;
            element.height = 600;
            element.clientWidth = 800;
            element.clientHeight = 600;
        }
        
        return element;
    },
    body: {
        appendChild: () => {},
        removeChild: () => {},
        style: {}
    }
};

global.performance = {
    now: () => Date.now(),
    memory: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000
    }
};

global.console = console;

// 加载必要的类
const path = require('path');
const fs = require('fs');

// 读取并执行JavaScript文件
function loadScript(filename) {
    const filepath = path.join(__dirname, '..', 'js', filename);
    if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        eval(content);
    } else {
        console.warn(`Script not found: ${filepath}`);
    }
}

// 加载核心类
try {
    loadScript('Vector2D.js');
    loadScript('ErrorHandler.js');
    loadScript('Config.js');
    loadScript('Renderer.js');
    loadScript('Hexagon.js');
    loadScript('Ball.js');
    loadScript('PhysicsEngine.js');
    
    // 加载测试文件
    const testPath = path.join(__dirname, 'responsive-design-test.js');
    if (fs.existsSync(testPath)) {
        const testContent = fs.readFileSync(testPath, 'utf8');
        eval(testContent);
    }
    
    // 运行测试
    console.log('开始运行响应式设计测试...\n');
    
    const results = runResponsiveDesignTests();
    
    // 输出最终结果
    console.log('\n' + '='.repeat(50));
    console.log('响应式设计测试完成');
    console.log('='.repeat(50));
    console.log(`总测试数: ${results.passed + results.failed}`);
    console.log(`通过: ${results.passed}`);
    console.log(`失败: ${results.failed}`);
    console.log(`成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n失败详情:');
        results.tests.filter(test => !test.passed).forEach((test, index) => {
            console.log(`${index + 1}. ${test.name}`);
            console.log(`   错误: ${test.error}`);
        });
        process.exit(1);
    } else {
        console.log('\n🎉 所有响应式设计测试通过！');
        process.exit(0);
    }
    
} catch (error) {
    console.error('测试运行失败:', error);
    process.exit(1);
}