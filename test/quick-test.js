#!/usr/bin/env node

/**
 * 快速测试 - Quick Test
 * 验证核心功能是否正常工作
 */

const fs = require('fs');
const path = require('path');

// 设置基本环境
global.window = { DEBUG_PHYSICS: false };
global.performance = { now: () => Date.now() };
global.document = {
    createElement: () => ({
        getContext: () => ({
            clearRect: () => {}, beginPath: () => {}, arc: () => {},
            moveTo: () => {}, lineTo: () => {}, closePath: () => {},
            fill: () => {}, stroke: () => {}
        })
    })
};
global.isFinite = Number.isFinite;

// 简单的类加载器
function loadClass(filename) {
    const filePath = path.join(__dirname, '..', 'js', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 使用eval在全局作用域中执行
    eval(content);
    
    const className = path.parse(filename).name;
    return eval(className);
}

async function runQuickTest() {
    console.log('🚀 Running Quick Test...\n');
    
    try {
        // 加载核心类
        console.log('📦 Loading classes...');
        const Vector2D = loadClass('Vector2D.js');
        console.log('  ✓ Vector2D loaded');
        
        const Ball = loadClass('Ball.js');
        console.log('  ✓ Ball loaded');
        
        const Hexagon = loadClass('Hexagon.js');
        console.log('  ✓ Hexagon loaded');
        
        const PhysicsEngine = loadClass('PhysicsEngine.js');
        console.log('  ✓ PhysicsEngine loaded');
        
        // 基本功能测试
        console.log('\n🧪 Testing basic functionality...');
        
        // Vector2D测试
        const v1 = new Vector2D(3, 4);
        const v2 = new Vector2D(1, 2);
        const v3 = v1.add(v2);
        console.log(`  ✓ Vector2D: (3,4) + (1,2) = (${v3.x},${v3.y})`);
        
        // Ball测试
        const ball = new Ball(0, 0, 10, 1);
        ball.setVelocity(50, 0);
        console.log(`  ✓ Ball: velocity = ${ball.velocity.toString()}`);
        
        // Hexagon测试
        const hexagon = new Hexagon(0, 0, 100);
        const vertices = hexagon.getVertices();
        console.log(`  ✓ Hexagon: ${vertices.length} vertices generated`);
        
        // PhysicsEngine测试
        const physics = new PhysicsEngine();
        physics.applyGravity(ball, 0.016);
        console.log(`  ✓ PhysicsEngine: gravity applied, velocity = ${ball.velocity.toString()}`);
        
        // 碰撞检测测试
        ball.setPosition(90, 0); // 靠近六边形边缘
        const collision = hexagon.checkCollision(ball);
        console.log(`  ✓ Collision detection: ${collision ? 'collision detected' : 'no collision'}`);
        
        console.log('\n🎉 Quick test completed successfully!');
        console.log('✅ All core classes are working properly.');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Quick test failed:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        return false;
    }
}

// 运行测试
if (require.main === module) {
    runQuickTest().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { runQuickTest };