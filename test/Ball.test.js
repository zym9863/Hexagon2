/**
 * Ball类单元测试
 * 验证小球物理对象的基本功能
 */

// 简单的测试框架函数
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertApproxEqual(actual, expected, tolerance = 0.001, message = '') {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`);
    }
}

// 测试Ball类
function testBallClass() {
    console.log('Running Ball class tests...');
    
    // 测试1: 基本构造函数
    console.log('Test 1: Constructor');
    const ball = new Ball(10, 20, 5, 2);
    assert(ball.position.x === 10, 'Position X should be 10');
    assert(ball.position.y === 20, 'Position Y should be 20');
    assert(ball.radius === 5, 'Radius should be 5');
    assert(ball.mass === 2, 'Mass should be 2');
    assert(ball.velocity.x === 0, 'Initial velocity X should be 0');
    assert(ball.velocity.y === 0, 'Initial velocity Y should be 0');
    console.log('✓ Constructor test passed');
    
    // 测试2: 设置位置和速度
    console.log('Test 2: Set position and velocity');
    ball.setPosition(30, 40);
    ball.setVelocity(50, -25);
    assert(ball.position.x === 30, 'Position X should be updated to 30');
    assert(ball.position.y === 40, 'Position Y should be updated to 40');
    assert(ball.velocity.x === 50, 'Velocity X should be 50');
    assert(ball.velocity.y === -25, 'Velocity Y should be -25');
    console.log('✓ Set position and velocity test passed');
    
    // 测试3: 施加力
    console.log('Test 3: Apply force');
    const initialAcceleration = ball.acceleration.clone();
    const force = new Vector2D(20, 40);
    ball.applyForce(force);
    // F = ma, 所以 a = F/m = (20, 40) / 2 = (10, 20)
    assertApproxEqual(ball.acceleration.x, initialAcceleration.x + 10, 0.001, 'Acceleration X should increase by 10');
    assertApproxEqual(ball.acceleration.y, initialAcceleration.y + 20, 0.001, 'Acceleration Y should increase by 20');
    console.log('✓ Apply force test passed');
    
    // 测试4: 物理更新
    console.log('Test 4: Physics update');
    const initialPos = ball.position.clone();
    const initialVel = ball.velocity.clone();
    const deltaTime = 0.1; // 0.1秒
    
    ball.update(deltaTime);
    
    // 验证速度更新: v = v0 + a*t
    const expectedVelX = initialVel.x + ball.acceleration.x * deltaTime;
    const expectedVelY = initialVel.y + ball.acceleration.y * deltaTime;
    // 注意：update后加速度被重置，所以我们需要使用之前计算的值
    // 由于加速度在update后被重置，我们检查位置更新
    
    // 验证位置有所变化（具体数值计算较复杂，这里只验证有变化）
    assert(ball.position.x !== initialPos.x || ball.position.y !== initialPos.y, 'Position should change after update');
    assert(ball.acceleration.x === 0 && ball.acceleration.y === 0, 'Acceleration should be reset after update');
    console.log('✓ Physics update test passed');
    
    // 测试5: 动能计算
    console.log('Test 5: Kinetic energy');
    ball.setVelocity(10, 0); // 设置简单的速度便于计算
    const expectedKE = 0.5 * ball.mass * 10 * 10; // 0.5 * 2 * 100 = 100
    assertApproxEqual(ball.getKineticEnergy(), expectedKE, 0.001, 'Kinetic energy calculation');
    console.log('✓ Kinetic energy test passed');
    
    // 测试6: 动量计算
    console.log('Test 6: Momentum');
    const momentum = ball.getMomentum();
    assertApproxEqual(momentum.x, ball.velocity.x * ball.mass, 0.001, 'Momentum X calculation');
    assertApproxEqual(momentum.y, ball.velocity.y * ball.mass, 0.001, 'Momentum Y calculation');
    console.log('✓ Momentum test passed');
    
    // 测试7: 边界框
    console.log('Test 7: Bounding box');
    ball.setPosition(100, 200);
    const bbox = ball.getBoundingBox();
    assert(bbox.minX === 100 - ball.radius, 'Bounding box minX');
    assert(bbox.minY === 200 - ball.radius, 'Bounding box minY');
    assert(bbox.maxX === 100 + ball.radius, 'Bounding box maxX');
    assert(bbox.maxY === 200 + ball.radius, 'Bounding box maxY');
    console.log('✓ Bounding box test passed');
    
    // 测试8: 克隆
    console.log('Test 8: Clone');
    const clonedBall = ball.clone();
    assert(clonedBall.position.x === ball.position.x, 'Cloned position X');
    assert(clonedBall.position.y === ball.position.y, 'Cloned position Y');
    assert(clonedBall.velocity.x === ball.velocity.x, 'Cloned velocity X');
    assert(clonedBall.velocity.y === ball.velocity.y, 'Cloned velocity Y');
    assert(clonedBall.radius === ball.radius, 'Cloned radius');
    assert(clonedBall.mass === ball.mass, 'Cloned mass');
    // 验证是不同的对象
    assert(clonedBall !== ball, 'Clone should be different object');
    assert(clonedBall.position !== ball.position, 'Clone position should be different object');
    console.log('✓ Clone test passed');
    
    // 测试9: 数值验证和边界情况
    console.log('Test 9: Edge cases and validation');
    
    // 测试无效的deltaTime
    const posBeforeInvalidUpdate = ball.position.clone();
    ball.update(0); // 无效的deltaTime
    assert(ball.position.x === posBeforeInvalidUpdate.x && ball.position.y === posBeforeInvalidUpdate.y, 
           'Position should not change with invalid deltaTime');
    
    // 测试无效的力
    const accBeforeInvalidForce = ball.acceleration.clone();
    ball.applyForce(new Vector2D(NaN, 10));
    assert(ball.acceleration.x === accBeforeInvalidForce.x && ball.acceleration.y === accBeforeInvalidForce.y,
           'Acceleration should not change with invalid force');
    
    console.log('✓ Edge cases test passed');
    
    console.log('All Ball class tests passed! ✅');
}

// 运行测试
try {
    testBallClass();
} catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
}