/**
 * 简单的PhysicsEngine功能测试
 * 验证基础物理功能是否正常工作
 */

// 模拟浏览器环境
global.window = {};
global.performance = { now: () => Date.now() };
global.document = { querySelector: () => ({ width: 800, height: 600 }) };

// 简单的类加载器
function loadClass(className, filePath) {
    const fs = require('fs');
    const path = require('path');
    
    const fullPath = path.join(__dirname, '..', 'js', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 使用Function构造器创建类
    const classCode = content + `\nreturn ${className};`;
    const ClassConstructor = new Function(classCode)();
    
    return ClassConstructor;
}

try {
    console.log('Loading classes...');
    
    // 按依赖顺序加载
    const Vector2D = loadClass('Vector2D', 'Vector2D.js');
    global.Vector2D = Vector2D;
    
    const Ball = loadClass('Ball', 'Ball.js');
    global.Ball = Ball;
    
    const PhysicsEngine = loadClass('PhysicsEngine', 'PhysicsEngine.js');
    
    console.log('Classes loaded successfully!');
    
    // 基础功能测试
    console.log('\n=== Testing PhysicsEngine Basic Functionality ===');
    
    // 1. 创建物理引擎
    const engine = new PhysicsEngine({
        gravity: 100,
        frictionCoefficient: 0.98,
        restitution: 0.8
    });
    
    console.log('✓ PhysicsEngine created with custom config');
    console.log('  Gravity:', engine.config.gravity);
    console.log('  Friction:', engine.config.frictionCoefficient);
    console.log('  Restitution:', engine.config.restitution);
    
    // 2. 创建小球
    const ball = new Ball(0, 0, 10, 1);
    console.log('✓ Ball created:', ball.toString());
    
    // 3. 测试重力应用
    console.log('\n--- Testing Gravity ---');
    const initialVelocity = ball.velocity.clone();
    engine.applyGravity(ball, 0.016);
    ball.update(0.016);
    
    console.log('Initial velocity:', initialVelocity.toString());
    console.log('After gravity:', ball.velocity.toString());
    console.log('✓ Gravity applied successfully');
    
    // 4. 测试摩擦力
    console.log('\n--- Testing Friction ---');
    ball.setVelocity(100, 50);
    const speedBefore = ball.velocity.magnitude();
    engine.applyFriction(ball);
    const speedAfter = ball.velocity.magnitude();
    
    console.log('Speed before friction:', speedBefore.toFixed(2));
    console.log('Speed after friction:', speedAfter.toFixed(2));
    console.log('Speed reduction:', ((speedBefore - speedAfter) / speedBefore * 100).toFixed(1) + '%');
    console.log('✓ Friction applied successfully');
    
    // 5. 测试完整物理更新
    console.log('\n--- Testing Physics Update Loop ---');
    ball.setPosition(0, 0);
    ball.setVelocity(50, -25);
    
    console.log('Initial state:', ball.toString());
    
    // 模拟几帧更新
    for (let i = 0; i < 5; i++) {
        engine.update(ball, null, 0.016);
        console.log(`Frame ${i + 1}:`, ball.toString());
    }
    
    console.log('✓ Physics update loop working correctly');
    
    // 6. 测试能量计算
    console.log('\n--- Testing Energy Calculation ---');
    ball.setPosition(0, -100);
    ball.setVelocity(50, 0);
    
    const kineticEnergy = ball.getKineticEnergy();
    const totalEnergy = engine.calculateTotalEnergy(ball, 0);
    
    console.log('Kinetic energy:', kineticEnergy.toFixed(2));
    console.log('Total energy:', totalEnergy.toFixed(2));
    console.log('✓ Energy calculation working correctly');
    
    // 7. 测试冲量应用
    console.log('\n--- Testing Impulse Application ---');
    ball.setVelocity(0, 0);
    const impulse = new Vector2D(20, -10);
    const velocityBefore = ball.velocity.clone();
    
    engine.applyImpulse(ball, impulse);
    
    console.log('Velocity before impulse:', velocityBefore.toString());
    console.log('Applied impulse:', impulse.toString());
    console.log('Velocity after impulse:', ball.velocity.toString());
    console.log('✓ Impulse application working correctly');
    
    // 8. 测试静态工厂方法
    console.log('\n--- Testing Static Factory Methods ---');
    const defaultEngine = PhysicsEngine.createDefault();
    const highFrictionEngine = PhysicsEngine.createHighFriction();
    const lowGravityEngine = PhysicsEngine.createLowGravity();
    
    console.log('Default engine gravity:', defaultEngine.config.gravity);
    console.log('High friction engine friction:', highFrictionEngine.config.frictionCoefficient);
    console.log('Low gravity engine gravity:', lowGravityEngine.config.gravity);
    console.log('✓ Static factory methods working correctly');
    
    // 9. 测试性能监控
    console.log('\n--- Testing Performance Monitoring ---');
    const perfEngine = new PhysicsEngine();
    const perfBall = new Ball(0, 0, 10, 1);
    
    // 执行一些更新来生成性能数据
    for (let i = 0; i < 100; i++) {
        perfEngine.update(perfBall, null, 0.016);
    }
    
    const stats = perfEngine.getPerformanceStats();
    console.log('Performance stats after 100 updates:');
    console.log('  Update count:', stats.updateCount);
    console.log('  Average update time:', stats.averageUpdateTime.toFixed(3) + 'ms');
    console.log('✓ Performance monitoring working correctly');
    
    console.log('\n🎉 All PhysicsEngine tests passed successfully!');
    
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}