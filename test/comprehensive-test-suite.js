/**
 * 综合测试套件 - Comprehensive Test Suite
 * 包含物理引擎单元测试、碰撞检测集成测试、性能基准测试和兼容性测试
 */

class ComprehensiveTestSuite {
    constructor() {
        this.testResults = {
            unitTests: [],
            integrationTests: [],
            performanceTests: [],
            compatibilityTests: []
        };
        this.startTime = 0;
        this.endTime = 0;
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite...\n');
        this.startTime = performance.now();

        try {
            // 1. 物理引擎单元测试
            console.log('📋 Running Physics Engine Unit Tests...');
            await this.runPhysicsUnitTests();

            // 2. 碰撞检测集成测试
            console.log('\n🔄 Running Collision Detection Integration Tests...');
            await this.runCollisionIntegrationTests();

            // 3. 性能基准测试
            console.log('\n⚡ Running Performance Benchmark Tests...');
            await this.runPerformanceBenchmarks();

            // 4. 跨浏览器兼容性测试
            console.log('\n🌐 Running Cross-Browser Compatibility Tests...');
            await this.runCompatibilityTests();

            this.endTime = performance.now();
            this.generateTestReport();

        } catch (error) {
            console.error('❌ Test suite failed:', error);
            throw error;
        }
    }

    // 物理引擎单元测试
    async runPhysicsUnitTests() {
        const tests = [
            this.testGravityApplication.bind(this),
            this.testFrictionApplication.bind(this),
            this.testVelocityLimiting.bind(this),
            this.testForceAccumulation.bind(this),
            this.testTimeScaling.bind(this),
            this.testBoundaryConditions.bind(this)
        ];

        for (const test of tests) {
            try {
                const result = await test();
                this.testResults.unitTests.push(result);
                console.log(`  ✓ ${result.name}`);
            } catch (error) {
                const result = { name: test.name, passed: false, error: error.message };
                this.testResults.unitTests.push(result);
                console.log(`  ❌ ${result.name}: ${error.message}`);
            }
        }
    }

    // 重力应用测试
    testGravityApplication() {
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({
            gravity: 9.81,
            friction: 1.0,
            restitution: 1.0
        });

        const initialVelocity = ball.velocity.y;
        physics.applyGravity(ball, 0.016); // 16ms frame
        
        const expectedVelocity = initialVelocity + 9.81 * 0.016;
        const actualVelocity = ball.velocity.y;
        
        if (Math.abs(actualVelocity - expectedVelocity) > 0.001) {
            throw new Error(`Expected velocity ${expectedVelocity}, got ${actualVelocity}`);
        }

        return { name: 'Gravity Application', passed: true };
    }

    // 摩擦力应用测试
    testFrictionApplication() {
        const ball = new Ball(0, 0, 10, 1);
        ball.velocity.x = 100;
        ball.velocity.y = 50;
        
        const physics = new PhysicsEngine({
            gravity: 0,
            friction: 0.98,
            restitution: 1.0
        });

        const initialSpeed = ball.velocity.magnitude();
        physics.applyFriction(ball);
        const finalSpeed = ball.velocity.magnitude();
        
        if (finalSpeed >= initialSpeed) {
            throw new Error('Friction should reduce speed');
        }
        
        const expectedSpeed = initialSpeed * 0.98;
        if (Math.abs(finalSpeed - expectedSpeed) > 0.001) {
            throw new Error(`Expected speed ${expectedSpeed}, got ${finalSpeed}`);
        }

        return { name: 'Friction Application', passed: true };
    }

    // 速度限制测试
    testVelocityLimiting() {
        const ball = new Ball(0, 0, 10, 1);
        ball.velocity.x = 2000; // 超过最大速度
        ball.velocity.y = 2000;
        
        const physics = new PhysicsEngine({
            gravity: 0,
            friction: 1.0,
            restitution: 1.0
        });

        physics.limitVelocity(ball);
        
        const speed = ball.velocity.magnitude();
        const maxSpeed = physics.config.maxVelocity || 1000;
        
        if (speed > maxSpeed + 0.001) {
            throw new Error(`Velocity ${speed} exceeds maximum ${maxSpeed}`);
        }

        return { name: 'Velocity Limiting', passed: true };
    }

    // 力累积测试
    testForceAccumulation() {
        const ball = new Ball(0, 0, 10, 1);
        
        const force1 = new Vector2D(10, 0);
        const force2 = new Vector2D(0, 15);
        
        ball.applyForce(force1);
        ball.applyForce(force2);
        
        const expectedAcceleration = force1.add(force2);
        
        if (Math.abs(ball.acceleration.x - expectedAcceleration.x) > 0.001 ||
            Math.abs(ball.acceleration.y - expectedAcceleration.y) > 0.001) {
            throw new Error('Force accumulation incorrect');
        }

        return { name: 'Force Accumulation', passed: true };
    }

    // 时间缩放测试
    testTimeScaling() {
        const ball = new Ball(0, 0, 10, 1);
        ball.velocity.x = 100;
        
        const initialPosition = ball.position.x;
        ball.update(0.016); // 16ms
        
        const expectedPosition = initialPosition + 100 * 0.016;
        
        if (Math.abs(ball.position.x - expectedPosition) > 0.001) {
            throw new Error(`Expected position ${expectedPosition}, got ${ball.position.x}`);
        }

        return { name: 'Time Scaling', passed: true };
    }

    // 边界条件测试
    testBoundaryConditions() {
        const ball = new Ball(0, 0, 10, 1);
        
        // 测试NaN处理
        ball.velocity.x = NaN;
        ball.velocity.y = Infinity;
        
        const physics = new PhysicsEngine({});
        physics.validatePhysicsState(ball);
        
        if (!isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
            throw new Error('Invalid velocity values not handled');
        }

        return { name: 'Boundary Conditions', passed: true };
    }

    // 碰撞检测集成测试
    async runCollisionIntegrationTests() {
        const tests = [
            this.testBallHexagonCollision.bind(this),
            this.testRotatingHexagonCollision.bind(this),
            this.testMultipleCollisions.bind(this),
            this.testCollisionResponse.bind(this),
            this.testEnergyConservation.bind(this)
        ];

        for (const test of tests) {
            try {
                const result = await test();
                this.testResults.integrationTests.push(result);
                console.log(`  ✓ ${result.name}`);
            } catch (error) {
                const result = { name: test.name, passed: false, error: error.message };
                this.testResults.integrationTests.push(result);
                console.log(`  ❌ ${result.name}: ${error.message}`);
            }
        }
    }

    // 小球-六边形碰撞测试
    testBallHexagonCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1); // 靠近右边缘
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision not detected');
        }
        
        if (collision.penetration <= 0) {
            throw new Error('Collision penetration should be positive');
        }
        
        if (!collision.normal || collision.normal.magnitude() === 0) {
            throw new Error('Collision normal should be valid');
        }

        return { name: 'Ball-Hexagon Collision', passed: true };
    }

    // 旋转六边形碰撞测试
    testRotatingHexagonCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        
        // 测试旋转前的碰撞
        const collisionBefore = hexagon.checkCollision(ball);
        
        // 旋转六边形
        hexagon.rotate(Math.PI / 6); // 30度
        
        // 测试旋转后的碰撞
        const collisionAfter = hexagon.checkCollision(ball);
        
        // 验证旋转影响碰撞检测
        if (collisionBefore && collisionAfter) {
            const normalDiff = collisionBefore.normal.subtract(collisionAfter.normal).magnitude();
            if (normalDiff < 0.1) {
                throw new Error('Rotation should affect collision normal');
            }
        }

        return { name: 'Rotating Hexagon Collision', passed: true };
    }

    // 多重碰撞测试
    testMultipleCollisions() {
        const hexagon = new Hexagon(0, 0, 50); // 小六边形
        const ball = new Ball(0, 0, 40, 1); // 大球，会与多个边碰撞
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision with multiple edges');
        }
        
        // 验证碰撞处理的一致性
        if (collision.penetration <= 0) {
            throw new Error('Multiple collision penetration should be positive');
        }

        return { name: 'Multiple Collisions', passed: true };
    }

    // 碰撞响应测试
    testCollisionResponse() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        ball.velocity.x = -50; // 向左运动，撞向右边缘
        
        const physics = new PhysicsEngine({
            gravity: 0,
            friction: 1.0,
            restitution: 0.8
        });
        
        const initialSpeed = ball.velocity.magnitude();
        physics.handleCollision(ball, hexagon);
        const finalSpeed = ball.velocity.magnitude();
        
        // 验证反弹后速度方向改变
        if (ball.velocity.x <= 0) {
            throw new Error('Ball should bounce away from wall');
        }
        
        // 验证能量损失
        if (finalSpeed >= initialSpeed) {
            throw new Error('Collision should reduce speed due to restitution');
        }

        return { name: 'Collision Response', passed: true };
    }

    // 能量守恒测试
    testEnergyConservation() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(0, -50, 10, 1);
        ball.velocity.y = 100; // 向下运动
        
        const physics = new PhysicsEngine({
            gravity: 0,
            friction: 1.0,
            restitution: 1.0 // 完全弹性碰撞
        });
        
        const initialKineticEnergy = 0.5 * ball.mass * Math.pow(ball.velocity.magnitude(), 2);
        
        // 模拟碰撞
        physics.handleCollision(ball, hexagon);
        
        const finalKineticEnergy = 0.5 * ball.mass * Math.pow(ball.velocity.magnitude(), 2);
        
        // 在完全弹性碰撞中，动能应该守恒
        if (Math.abs(finalKineticEnergy - initialKineticEnergy) > 0.1) {
            throw new Error(`Energy not conserved: ${initialKineticEnergy} -> ${finalKineticEnergy}`);
        }

        return { name: 'Energy Conservation', passed: true };
    }

    // 性能基准测试
    async runPerformanceBenchmarks() {
        const benchmarks = [
            this.benchmarkPhysicsUpdate.bind(this),
            this.benchmarkCollisionDetection.bind(this),
            this.benchmarkRenderingPerformance.bind(this),
            this.benchmarkMemoryUsage.bind(this)
        ];

        for (const benchmark of benchmarks) {
            try {
                const result = await benchmark();
                this.testResults.performanceTests.push(result);
                console.log(`  ✓ ${result.name}: ${result.performance}`);
            } catch (error) {
                const result = { name: benchmark.name, passed: false, error: error.message };
                this.testResults.performanceTests.push(result);
                console.log(`  ❌ ${result.name}: ${error.message}`);
            }
        }
    }

    // 物理更新性能基准
    benchmarkPhysicsUpdate() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({});
        
        const iterations = 10000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            physics.update(ball, hexagon, 0.016);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        if (avgTime > 1.0) { // 超过1ms per update认为性能不佳
            throw new Error(`Physics update too slow: ${avgTime.toFixed(3)}ms per update`);
        }
        
        return {
            name: 'Physics Update Performance',
            passed: true,
            performance: `${avgTime.toFixed(3)}ms per update (${iterations} iterations)`
        };
    }

    // 碰撞检测性能基准
    benchmarkCollisionDetection() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        
        const iterations = 50000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            hexagon.checkCollision(ball);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        if (avgTime > 0.1) { // 超过0.1ms per check认为性能不佳
            throw new Error(`Collision detection too slow: ${avgTime.toFixed(4)}ms per check`);
        }
        
        return {
            name: 'Collision Detection Performance',
            passed: true,
            performance: `${avgTime.toFixed(4)}ms per check (${iterations} iterations)`
        };
    }

    // 渲染性能基准
    benchmarkRenderingPerformance() {
        // 创建虚拟canvas用于测试
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        const renderer = new Renderer(canvas);
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(50, 50, 10, 1);
        
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            renderer.clear();
            renderer.drawHexagon(hexagon);
            renderer.drawBall(ball);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        if (avgTime > 5.0) { // 超过5ms per frame认为性能不佳
            throw new Error(`Rendering too slow: ${avgTime.toFixed(3)}ms per frame`);
        }
        
        return {
            name: 'Rendering Performance',
            passed: true,
            performance: `${avgTime.toFixed(3)}ms per frame (${iterations} frames)`
        };
    }

    // 内存使用基准
    benchmarkMemoryUsage() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // 创建大量对象来测试内存使用
        const objects = [];
        for (let i = 0; i < 1000; i++) {
            objects.push(new Ball(Math.random() * 100, Math.random() * 100, 10, 1));
            objects.push(new Hexagon(Math.random() * 100, Math.random() * 100, 50));
        }
        
        const peakMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // 清理对象
        objects.length = 0;
        
        // 强制垃圾回收（如果可用）
        if (global.gc) {
            global.gc();
        }
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = peakMemory - initialMemory;
        const memoryLeaked = finalMemory - initialMemory;
        
        if (memoryLeaked > memoryIncrease * 0.5) {
            throw new Error(`Potential memory leak: ${memoryLeaked} bytes not released`);
        }
        
        return {
            name: 'Memory Usage',
            passed: true,
            performance: `Peak: +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB, Leaked: ${(memoryLeaked / 1024 / 1024).toFixed(2)}MB`
        };
    }

    // 跨浏览器兼容性测试
    async runCompatibilityTests() {
        const tests = [
            this.testCanvasSupport.bind(this),
            this.testRequestAnimationFrameSupport.bind(this),
            this.testES6Features.bind(this),
            this.testMathFunctions.bind(this),
            this.testPerformanceAPI.bind(this)
        ];

        for (const test of tests) {
            try {
                const result = await test();
                this.testResults.compatibilityTests.push(result);
                console.log(`  ✓ ${result.name}`);
            } catch (error) {
                const result = { name: test.name, passed: false, error: error.message };
                this.testResults.compatibilityTests.push(result);
                console.log(`  ❌ ${result.name}: ${error.message}`);
            }
        }
    }

    // Canvas支持测试
    testCanvasSupport() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas 2D context not supported');
        }
        
        // 测试基本绘制功能
        ctx.beginPath();
        ctx.arc(50, 50, 25, 0, Math.PI * 2);
        ctx.fill();
        
        return { name: 'Canvas Support', passed: true };
    }

    // requestAnimationFrame支持测试
    testRequestAnimationFrameSupport() {
        if (typeof requestAnimationFrame === 'undefined') {
            throw new Error('requestAnimationFrame not supported');
        }
        
        if (typeof cancelAnimationFrame === 'undefined') {
            throw new Error('cancelAnimationFrame not supported');
        }
        
        return { name: 'RequestAnimationFrame Support', passed: true };
    }

    // ES6特性测试
    testES6Features() {
        // 测试类语法
        class TestClass {
            constructor(value) {
                this.value = value;
            }
        }
        
        const instance = new TestClass(42);
        if (instance.value !== 42) {
            throw new Error('Class syntax not working');
        }
        
        // 测试箭头函数
        const arrowFunc = (x) => x * 2;
        if (arrowFunc(5) !== 10) {
            throw new Error('Arrow functions not working');
        }
        
        // 测试解构赋值
        const { x, y } = { x: 1, y: 2 };
        if (x !== 1 || y !== 2) {
            throw new Error('Destructuring not working');
        }
        
        return { name: 'ES6 Features', passed: true };
    }

    // 数学函数测试
    testMathFunctions() {
        const tests = [
            { func: Math.sin, input: Math.PI / 2, expected: 1 },
            { func: Math.cos, input: 0, expected: 1 },
            { func: Math.sqrt, input: 16, expected: 4 },
            { func: Math.abs, input: -5, expected: 5 }
        ];
        
        for (const test of tests) {
            const result = test.func(test.input);
            if (Math.abs(result - test.expected) > 0.001) {
                throw new Error(`${test.func.name}(${test.input}) = ${result}, expected ${test.expected}`);
            }
        }
        
        return { name: 'Math Functions', passed: true };
    }

    // Performance API测试
    testPerformanceAPI() {
        if (typeof performance === 'undefined') {
            throw new Error('Performance API not available');
        }
        
        if (typeof performance.now !== 'function') {
            throw new Error('performance.now() not available');
        }
        
        const start = performance.now();
        // 简单延时
        for (let i = 0; i < 1000; i++) {
            Math.random();
        }
        const end = performance.now();
        
        if (end <= start) {
            throw new Error('performance.now() not working correctly');
        }
        
        return { name: 'Performance API', passed: true };
    }

    // 生成测试报告
    generateTestReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        
        const totalTime = this.endTime - this.startTime;
        console.log(`⏱️  Total execution time: ${totalTime.toFixed(2)}ms\n`);
        
        // 单元测试结果
        const unitPassed = this.testResults.unitTests.filter(t => t.passed).length;
        const unitTotal = this.testResults.unitTests.length;
        console.log(`🧪 Unit Tests: ${unitPassed}/${unitTotal} passed`);
        
        // 集成测试结果
        const integrationPassed = this.testResults.integrationTests.filter(t => t.passed).length;
        const integrationTotal = this.testResults.integrationTests.length;
        console.log(`🔄 Integration Tests: ${integrationPassed}/${integrationTotal} passed`);
        
        // 性能测试结果
        const performancePassed = this.testResults.performanceTests.filter(t => t.passed).length;
        const performanceTotal = this.testResults.performanceTests.length;
        console.log(`⚡ Performance Tests: ${performancePassed}/${performanceTotal} passed`);
        
        // 兼容性测试结果
        const compatibilityPassed = this.testResults.compatibilityTests.filter(t => t.passed).length;
        const compatibilityTotal = this.testResults.compatibilityTests.length;
        console.log(`🌐 Compatibility Tests: ${compatibilityPassed}/${compatibilityTotal} passed`);
        
        // 总体结果
        const totalPassed = unitPassed + integrationPassed + performancePassed + compatibilityPassed;
        const totalTests = unitTotal + integrationTotal + performanceTotal + compatibilityTotal;
        
        console.log('\n' + '-'.repeat(60));
        console.log(`📈 OVERALL RESULT: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed === totalTests) {
            console.log('🎉 ALL TESTS PASSED! System is ready for production.');
        } else {
            console.log('⚠️  Some tests failed. Please review the results above.');
        }
        
        console.log('='.repeat(60));
    }
}

// 导出测试套件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveTestSuite;
}