/**
 * PhysicsEngine 单元测试
 * 测试物理引擎的重力、摩擦力和时间更新功能
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
    global.performance = {
        now: () => Date.now()
    };
}

// 导入依赖类
if (typeof require !== 'undefined') {
    // Node.js 环境
    const Vector2D = require('../js/Vector2D.js');
    const Ball = require('../js/Ball.js');
    const PhysicsEngine = require('../js/PhysicsEngine.js');
    global.Vector2D = Vector2D;
    global.Ball = Ball;
    global.PhysicsEngine = PhysicsEngine;
}

/**
 * 测试套件：PhysicsEngine 基础功能
 */
function testPhysicsEngineBasics() {
    console.log('Testing PhysicsEngine basics...');
    
    // 测试构造函数
    const engine = new PhysicsEngine();
    
    // 验证默认配置
    assert(engine.config.gravity > 0, 'Gravity should be positive');
    assert(engine.config.frictionCoefficient > 0 && engine.config.frictionCoefficient <= 1, 
           'Friction coefficient should be between 0 and 1');
    assert(engine.config.restitution > 0 && engine.config.restitution <= 1, 
           'Restitution should be between 0 and 1');
    
    console.log('✓ PhysicsEngine constructor works correctly');
    
    // 测试自定义配置
    const customEngine = new PhysicsEngine({
        gravity: 100,
        frictionCoefficient: 0.5,
        restitution: 0.9
    });
    
    assert(customEngine.config.gravity === 100, 'Custom gravity should be set');
    assert(customEngine.config.frictionCoefficient === 0.5, 'Custom friction should be set');
    assert(customEngine.config.restitution === 0.9, 'Custom restitution should be set');
    
    console.log('✓ Custom configuration works correctly');
}

/**
 * 测试套件：重力应用
 */
function testGravityApplication() {
    console.log('Testing gravity application...');
    
    const engine = new PhysicsEngine({ gravity: 100 });
    const ball = new Ball(0, 0, 10, 1);
    
    // 记录初始状态
    const initialVelocity = ball.velocity.clone();
    
    // 应用重力
    engine.applyGravity(ball, 0.016); // 60 FPS
    
    // 验证重力效果
    assert(ball.acceleration.y > 0, 'Gravity should create downward acceleration');
    assert(ball.acceleration.x === 0, 'Gravity should not affect horizontal acceleration');
    
    // 更新小球状态
    ball.update(0.016);
    
    // 验证速度变化
    assert(ball.velocity.y > initialVelocity.y, 'Velocity should increase due to gravity');
    
    console.log('✓ Gravity application works correctly');
    
    // 测试多次重力应用
    const initialY = ball.velocity.y;
    engine.applyGravity(ball, 0.016);
    ball.update(0.016);
    
    assert(ball.velocity.y > initialY, 'Gravity should continue to accelerate ball');
    
    console.log('✓ Continuous gravity application works correctly');
}

/**
 * 测试套件：摩擦力应用
 */
function testFrictionApplication() {
    console.log('Testing friction application...');
    
    const engine = new PhysicsEngine({ frictionCoefficient: 0.9 });
    const ball = new Ball(0, 0, 10, 1);
    
    // 设置初始速度
    ball.setVelocity(100, 50);
    const initialSpeed = ball.velocity.magnitude();
    
    // 应用摩擦力
    engine.applyFriction(ball);
    
    // 验证摩擦力效果
    const newSpeed = ball.velocity.magnitude();
    assert(newSpeed < initialSpeed, 'Friction should reduce speed');
    assert(newSpeed === initialSpeed * 0.9, 'Friction should reduce speed by friction coefficient');
    
    console.log('✓ Friction application works correctly');
    
    // 测试低速度阈值
    ball.setVelocity(0.05, 0.05); // 低于默认阈值 0.1
    engine.applyFriction(ball);
    
    assert(ball.velocity.magnitude() === 0, 'Low velocity should be set to zero');
    
    console.log('✓ Low velocity threshold works correctly');
}

/**
 * 测试套件：物理更新循环
 */
function testPhysicsUpdate() {
    console.log('Testing physics update loop...');
    
    const engine = new PhysicsEngine({
        gravity: 100,
        frictionCoefficient: 0.98
    });
    const ball = new Ball(0, 0, 10, 1);
    
    // 记录初始状态
    const initialPosition = ball.position.clone();
    const initialVelocity = ball.velocity.clone();
    
    // 执行物理更新
    engine.update(ball, null, 0.016);
    
    // 验证位置和速度变化
    assert(ball.position.y > initialPosition.y, 'Ball should move down due to gravity');
    assert(ball.velocity.y > initialVelocity.y, 'Ball should accelerate down due to gravity');
    
    console.log('✓ Physics update loop works correctly');
    
    // 测试多次更新
    const positionAfterFirst = ball.position.clone();
    engine.update(ball, null, 0.016);
    
    assert(ball.position.y > positionAfterFirst.y, 'Ball should continue moving');
    
    console.log('✓ Multiple physics updates work correctly');
}

/**
 * 测试套件：参数设置和获取
 */
function testParameterManagement() {
    console.log('Testing parameter management...');
    
    const engine = new PhysicsEngine();
    
    // 测试参数设置
    engine.setParameter('gravity', 200);
    assert(engine.getParameter('gravity') === 200, 'Parameter should be updated');
    
    engine.setParameter('frictionCoefficient', 0.5);
    assert(engine.getParameter('frictionCoefficient') === 0.5, 'Friction parameter should be updated');
    
    console.log('✓ Parameter management works correctly');
    
    // 测试无效参数
    const originalGravity = engine.getParameter('gravity');
    engine.setParameter('invalidParameter', 100);
    assert(engine.getParameter('gravity') === originalGravity, 'Invalid parameter should not affect existing ones');
    
    console.log('✓ Invalid parameter handling works correctly');
}

/**
 * 测试套件：能量计算
 */
function testEnergyCalculation() {
    console.log('Testing energy calculation...');
    
    const engine = new PhysicsEngine({ gravity: 9.81 * 50 });
    const ball = new Ball(0, 0, 10, 1);
    
    // 测试静止状态的能量
    const restEnergy = engine.calculateTotalEnergy(ball, 0);
    assert(restEnergy === 0, 'Ball at rest at reference height should have zero energy');
    
    // 测试有速度的能量
    ball.setVelocity(10, 0);
    const kineticEnergy = engine.calculateTotalEnergy(ball, 0);
    assert(kineticEnergy > 0, 'Moving ball should have positive kinetic energy');
    
    // 测试势能
    ball.setVelocity(0, 0);
    ball.setPosition(0, -100); // 高于参考点
    const potentialEnergy = engine.calculateTotalEnergy(ball, 0);
    assert(potentialEnergy > 0, 'Ball above reference should have positive potential energy');
    
    console.log('✓ Energy calculation works correctly');
}

/**
 * 测试套件：冲量应用
 */
function testImpulseApplication() {
    console.log('Testing impulse application...');
    
    const engine = new PhysicsEngine();
    const ball = new Ball(0, 0, 10, 1);
    
    // 应用冲量
    const impulse = new Vector2D(10, -5);
    const initialVelocity = ball.velocity.clone();
    
    engine.applyImpulse(ball, impulse);
    
    // 验证速度变化
    const expectedVelocity = initialVelocity.add(impulse.multiply(1 / ball.mass));
    assert(Math.abs(ball.velocity.x - expectedVelocity.x) < 0.001, 'Impulse should change velocity correctly');
    assert(Math.abs(ball.velocity.y - expectedVelocity.y) < 0.001, 'Impulse should change velocity correctly');
    
    console.log('✓ Impulse application works correctly');
}

/**
 * 测试套件：性能监控
 */
function testPerformanceMonitoring() {
    console.log('Testing performance monitoring...');
    
    const engine = new PhysicsEngine();
    const ball = new Ball(0, 0, 10, 1);
    
    // 执行一些更新
    for (let i = 0; i < 10; i++) {
        engine.update(ball, null, 0.016);
    }
    
    const stats = engine.getPerformanceStats();
    assert(stats.updateCount === 10, 'Update count should be tracked');
    assert(stats.totalUpdateTime > 0, 'Total update time should be positive');
    assert(stats.averageUpdateTime > 0, 'Average update time should be positive');
    
    console.log('✓ Performance monitoring works correctly');
    
    // 测试重置
    engine.reset();
    const resetStats = engine.getPerformanceStats();
    assert(resetStats.updateCount === 0, 'Reset should clear update count');
    assert(resetStats.totalUpdateTime === 0, 'Reset should clear total time');
    
    console.log('✓ Performance reset works correctly');
}

/**
 * 测试套件：静态工厂方法
 */
function testStaticFactoryMethods() {
    console.log('Testing static factory methods...');
    
    // 测试默认配置
    const defaultEngine = PhysicsEngine.createDefault();
    assert(defaultEngine instanceof PhysicsEngine, 'Should create PhysicsEngine instance');
    assert(defaultEngine.config.gravity > 0, 'Default engine should have gravity');
    
    // 测试高摩擦配置
    const highFrictionEngine = PhysicsEngine.createHighFriction();
    assert(highFrictionEngine.config.frictionCoefficient < defaultEngine.config.frictionCoefficient,
           'High friction engine should have lower friction coefficient');
    
    // 测试低重力配置
    const lowGravityEngine = PhysicsEngine.createLowGravity();
    assert(lowGravityEngine.config.gravity < defaultEngine.config.gravity,
           'Low gravity engine should have lower gravity');
    
    console.log('✓ Static factory methods work correctly');
}

/**
 * 测试套件：边界情况处理
 */
function testEdgeCases() {
    console.log('Testing edge cases...');
    
    const engine = new PhysicsEngine();
    const ball = new Ball(0, 0, 10, 1);
    
    // 测试无效时间步长
    const initialPosition = ball.position.clone();
    engine.update(ball, null, -1); // 负时间
    assert(ball.position.x === initialPosition.x && ball.position.y === initialPosition.y,
           'Invalid deltaTime should not update position');
    
    engine.update(ball, null, NaN); // NaN时间
    assert(ball.position.x === initialPosition.x && ball.position.y === initialPosition.y,
           'NaN deltaTime should not update position');
    
    // 测试null参数
    engine.update(null, null, 0.016); // 应该不会崩溃
    
    console.log('✓ Edge cases handled correctly');
}

/**
 * 简单的断言函数
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * 运行所有测试
 */
function runAllTests() {
    console.log('Starting PhysicsEngine tests...\n');
    
    try {
        testPhysicsEngineBasics();
        testGravityApplication();
        testFrictionApplication();
        testPhysicsUpdate();
        testParameterManagement();
        testEnergyCalculation();
        testImpulseApplication();
        testPerformanceMonitoring();
        testStaticFactoryMethods();
        testEdgeCases();
        
        console.log('\n✅ All PhysicsEngine tests passed!');
        return true;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testPhysicsEngineBasics,
        testGravityApplication,
        testFrictionApplication,
        testPhysicsUpdate,
        testParameterManagement,
        testEnergyCalculation,
        testImpulseApplication,
        testPerformanceMonitoring,
        testStaticFactoryMethods,
        testEdgeCases
    };
}

// 如果直接运行此文件，执行所有测试
if (typeof window === 'undefined' && require.main === module) {
    runAllTests();
}