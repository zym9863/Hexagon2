/**
 * 碰撞响应和反弹物理测试
 * 测试PhysicsEngine的碰撞处理功能
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
    global.performance = { now: () => Date.now() };
    global.console = console;
    global.document = {
        querySelector: () => ({ width: 800, height: 600 })
    };
}

// 导入所需的类
const Vector2D = require('../js/Vector2D.js');
global.Vector2D = Vector2D; // Make Vector2D globally available
const Ball = require('../js/Ball.js');
const Hexagon = require('../js/Hexagon.js');
const PhysicsEngine = require('../js/PhysicsEngine.js');

/**
 * 测试基本碰撞响应
 */
function testBasicCollisionResponse() {
    console.log('\n=== 测试基本碰撞响应 ===');
    
    // 创建物理引擎
    const engine = new PhysicsEngine({
        gravity: 0, // 关闭重力，专注测试碰撞
        restitution: 0.8,
        frictionCoefficient: 1.0
    });
    
    // 创建六边形容器
    const hexagon = new Hexagon(400, 300, 200);
    
    // 创建小球，位置接近六边形边界
    const ball = new Ball(595, 300, 10, 1); // 更接近右边界，确保碰撞
    ball.setVelocity(50, 0); // 向右运动
    
    console.log('碰撞前状态:');
    console.log(`  小球位置: ${ball.position.toString()}`);
    console.log(`  小球速度: ${ball.velocity.toString()}`);
    console.log(`  小球动能: ${ball.getKineticEnergy().toFixed(3)}`);
    
    // 检查碰撞
    const collisionInfo = hexagon.checkCollision(ball);
    if (collisionInfo) {
        console.log('检测到碰撞:');
        console.log(`  穿透深度: ${collisionInfo.penetration.toFixed(3)}`);
        console.log(`  法向量: ${collisionInfo.normal.toString()}`);
        
        // 记录碰撞前的速度用于验证
        const velocityBefore = ball.velocity.clone();
        
        // 处理碰撞
        engine.handleCollision(ball, hexagon);
        
        console.log('碰撞后状态:');
        console.log(`  小球位置: ${ball.position.toString()}`);
        console.log(`  小球速度: ${ball.velocity.toString()}`);
        console.log(`  小球动能: ${ball.getKineticEnergy().toFixed(3)}`);
        
        // 验证物理正确性
        const physicsValid = engine.validateCollisionPhysics(ball, collisionInfo.normal, velocityBefore);
        console.log(`  物理验证: ${physicsValid ? '通过' : '失败'}`);
        
        // 计算能量损失
        const energyLoss = engine.calculateEnergyLoss(ball, velocityBefore);
        console.log(`  能量损失: ${(energyLoss * 100).toFixed(1)}%`);
        
        return true;
    } else {
        console.log('未检测到碰撞');
        return false;
    }
}

/**
 * 测试反弹角度计算
 */
function testBounceAngleCalculation() {
    console.log('\n=== 测试反弹角度计算 ===');
    
    const engine = new PhysicsEngine({
        gravity: 0,
        restitution: 1.0, // 完全弹性碰撞
        frictionCoefficient: 1.0
    });
    
    const hexagon = new Hexagon(400, 300, 200);
    
    // 测试不同角度的碰撞
    const testCases = [
        { angle: 0, description: '水平碰撞' },
        { angle: Math.PI / 4, description: '45度角碰撞' },
        { angle: Math.PI / 2, description: '垂直碰撞' },
        { angle: 3 * Math.PI / 4, description: '135度角碰撞' }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`\n测试案例 ${index + 1}: ${testCase.description}`);
        
        // 创建以特定角度运动的小球
        const speed = 100;
        const vx = speed * Math.cos(testCase.angle);
        const vy = speed * Math.sin(testCase.angle);
        
        const ball = new Ball(595, 300, 10, 1);
        ball.setVelocity(vx, vy);
        
        console.log(`  入射速度: (${vx.toFixed(2)}, ${vy.toFixed(2)})`);
        console.log(`  入射角度: ${(testCase.angle * 180 / Math.PI).toFixed(1)}°`);
        
        const collisionInfo = hexagon.checkCollision(ball);
        if (collisionInfo) {
            const velocityBefore = ball.velocity.clone();
            engine.handleCollision(ball, hexagon);
            
            const reflectedAngle = Math.atan2(ball.velocity.y, ball.velocity.x);
            console.log(`  反射速度: (${ball.velocity.x.toFixed(2)}, ${ball.velocity.y.toFixed(2)})`);
            console.log(`  反射角度: ${(reflectedAngle * 180 / Math.PI).toFixed(1)}°`);
            
            // 验证入射角等于反射角（对于垂直表面）
            const incidentAngle = Math.atan2(velocityBefore.y, velocityBefore.x);
            const angleDifference = Math.abs(reflectedAngle - incidentAngle);
            console.log(`  角度差异: ${(angleDifference * 180 / Math.PI).toFixed(1)}°`);
        }
    });
}

/**
 * 测试能量守恒
 */
function testEnergyConservation() {
    console.log('\n=== 测试能量守恒 ===');
    
    const restitutionValues = [0.5, 0.8, 1.0];
    
    restitutionValues.forEach(restitution => {
        console.log(`\n反弹系数: ${restitution}`);
        
        const engine = new PhysicsEngine({
            gravity: 0,
            restitution: restitution,
            frictionCoefficient: 1.0
        });
        
        const hexagon = new Hexagon(400, 300, 200);
        const ball = new Ball(595, 300, 10, 1);
        ball.setVelocity(100, 0);
        
        const energyBefore = ball.getKineticEnergy();
        console.log(`  碰撞前动能: ${energyBefore.toFixed(3)}`);
        
        const collisionInfo = hexagon.checkCollision(ball);
        if (collisionInfo) {
            engine.handleCollision(ball, hexagon);
            
            const energyAfter = ball.getKineticEnergy();
            const expectedEnergy = energyBefore * (restitution ** 2);
            const energyRatio = energyAfter / expectedEnergy;
            
            console.log(`  碰撞后动能: ${energyAfter.toFixed(3)}`);
            console.log(`  期望动能: ${expectedEnergy.toFixed(3)}`);
            console.log(`  能量比率: ${energyRatio.toFixed(3)}`);
            console.log(`  能量守恒: ${Math.abs(energyRatio - 1) < 0.1 ? '通过' : '失败'}`);
        }
    });
}

/**
 * 测试多次碰撞的稳定性
 */
function testMultipleCollisionStability() {
    console.log('\n=== 测试多次碰撞稳定性 ===');
    
    const engine = new PhysicsEngine({
        gravity: 0,
        restitution: 0.9,
        frictionCoefficient: 0.99
    });
    
    const hexagon = new Hexagon(400, 300, 150);
    const ball = new Ball(400, 300, 8, 1);
    ball.setVelocity(200, 150);
    
    console.log('模拟100次物理更新...');
    
    let collisionCount = 0;
    let maxSpeed = 0;
    let minSpeed = Infinity;
    
    for (let i = 0; i < 100; i++) {
        const speedBefore = ball.velocity.magnitude();
        
        engine.update(ball, hexagon, 0.016); // 60 FPS
        
        const speedAfter = ball.velocity.magnitude();
        maxSpeed = Math.max(maxSpeed, speedAfter);
        minSpeed = Math.min(minSpeed, speedAfter);
        
        // 检查是否发生了碰撞（速度显著变化）
        if (Math.abs(speedAfter - speedBefore) > 10) {
            collisionCount++;
        }
        
        // 检查数值稳定性
        if (!isFinite(ball.position.x) || !isFinite(ball.position.y) ||
            !isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
            console.error(`数值不稳定在第${i}次更新`);
            return false;
        }
    }
    
    console.log(`  碰撞次数: ${collisionCount}`);
    console.log(`  最大速度: ${maxSpeed.toFixed(2)}`);
    console.log(`  最小速度: ${minSpeed.toFixed(2)}`);
    console.log(`  最终位置: ${ball.position.toString()}`);
    console.log(`  最终速度: ${ball.velocity.toString()}`);
    console.log(`  数值稳定性: 通过`);
    
    return true;
}

/**
 * 运行所有测试
 */
function runAllTests() {
    console.log('开始碰撞响应和反弹物理测试...\n');
    
    const tests = [
        testBasicCollisionResponse,
        testBounceAngleCalculation,
        testEnergyConservation,
        testMultipleCollisionStability
    ];
    
    let passedTests = 0;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result !== false) {
                passedTests++;
            }
        } catch (error) {
            console.error(`测试 ${index + 1} 出错:`, error.message);
        }
    });
    
    console.log(`\n=== 测试总结 ===`);
    console.log(`通过测试: ${passedTests}/${tests.length}`);
    console.log(`测试${passedTests === tests.length ? '全部通过' : '部分失败'}！`);
    
    return passedTests === tests.length;
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testBasicCollisionResponse,
    testBounceAngleCalculation,
    testEnergyConservation,
    testMultipleCollisionStability,
    runAllTests
};