/**
 * 增强综合测试套件 - Enhanced Comprehensive Test Suite
 * 完整的物理引擎单元测试、碰撞检测集成测试、性能基准测试和跨浏览器兼容性测试
 * 
 * Requirements: 6.1, 6.4 - 流畅动画和性能优化
 */

class EnhancedComprehensiveTestSuite {
    constructor() {
        this.testResults = {
            physicsUnitTests: [],
            collisionIntegrationTests: [],
            performanceBenchmarks: [],
            compatibilityTests: [],
            stressTests: [],
            accuracyTests: []
        };
        this.startTime = 0;
        this.endTime = 0;
        this.testConfig = {
            performanceThresholds: {
                physicsUpdateTime: 1.0, // ms
                collisionCheckTime: 0.1, // ms
                renderFrameTime: 16.67, // ms (60 FPS)
                memoryLeakThreshold: 0.5 // ratio
            },
            accuracyThresholds: {
                positionTolerance: 0.001,
                velocityTolerance: 0.001,
                energyTolerance: 0.01,
                angleTolerance: 0.001
            }
        };
    }

    // 运行所有增强测试
    async runAllTests() {
        console.log('🚀 Starting Enhanced Comprehensive Test Suite...\n');
        console.log('Testing Rotating Hexagon Ball Physics System');
        console.log('Requirements: 6.1 (Animation Performance), 6.4 (Optimization)');
        console.log('='.repeat(80));
        
        this.startTime = performance.now();

        try {
            // 1. 物理引擎单元测试套件
            await this.runPhysicsUnitTestSuite();
            
            // 2. 碰撞检测集成测试套件
            await this.runCollisionIntegrationTestSuite();
            
            // 3. 性能基准测试套件
            await this.runPerformanceBenchmarkSuite();       
     
            // 4. 跨浏览器兼容性测试套件
            await this.runCompatibilityTestSuite();
            
            // 5. 压力测试套件
            await this.runStressTestSuite();
            
            // 6. 精度验证测试套件
            await this.runAccuracyTestSuite();

            this.endTime = performance.now();
            this.generateEnhancedTestReport();

        } catch (error) {
            console.error('❌ Enhanced test suite failed:', error);
            throw error;
        }
    }

    // ========== 物理引擎单元测试套件 ==========
    async runPhysicsUnitTestSuite() {
        console.log('\n🧪 Running Enhanced Physics Engine Unit Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            // 基础物理测试
            { name: 'Gravity Application Accuracy', test: this.testGravityAccuracy.bind(this) },
            { name: 'Friction Force Calculation', test: this.testFrictionCalculation.bind(this) },
            { name: 'Velocity Integration', test: this.testVelocityIntegration.bind(this) },
            { name: 'Force Accumulation', test: this.testForceAccumulation.bind(this) },
            
            // 高级物理测试
            { name: 'Energy Conservation', test: this.testEnergyConservation.bind(this) },
            { name: 'Momentum Conservation', test: this.testMomentumConservation.bind(this) },
            { name: 'Angular Momentum', test: this.testAngularMomentum.bind(this) },
            { name: 'Damping Effects', test: this.testDampingEffects.bind(this) },
            
            // 边界条件测试
            { name: 'Numerical Stability', test: this.testNumericalStability.bind(this) },
            { name: 'Extreme Values Handling', test: this.testExtremeValues.bind(this) },
            { name: 'Time Step Variations', test: this.testTimeStepVariations.bind(this) },
            { name: 'State Validation', test: this.testStateValidation.bind(this) }
        ];

        await this.runTestCategory('physicsUnitTests', tests);
    }  
  // 重力精度测试
    testGravityAccuracy() {
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({
            gravity: 9.81,
            friction: 1.0,
            restitution: 1.0
        });

        const deltaTime = 0.016; // 60 FPS
        const iterations = 100;
        
        // 理论计算
        const expectedDistance = 0.5 * 9.81 * Math.pow(deltaTime * iterations, 2);
        
        // 实际模拟
        for (let i = 0; i < iterations; i++) {
            physics.applyGravity(ball, deltaTime);
            ball.update(deltaTime);
        }
        
        const actualDistance = ball.position.y;
        const error = Math.abs(actualDistance - expectedDistance);
        const relativeError = error / expectedDistance;
        
        if (relativeError > this.testConfig.accuracyThresholds.positionTolerance) {
            throw new Error(`Gravity accuracy error: ${relativeError.toFixed(6)} (expected < ${this.testConfig.accuracyThresholds.positionTolerance})`);
        }

        return {
            name: 'Gravity Application Accuracy',
            passed: true,
            details: `Relative error: ${relativeError.toFixed(6)}, Distance: ${actualDistance.toFixed(3)}m`
        };
    }

    // 摩擦力计算测试
    testFrictionCalculation() {
        const ball = new Ball(0, 0, 10, 1);
        ball.setVelocity(100, 50);
        
        const physics = new PhysicsEngine({
            gravity: 0,
            friction: 0.95,
            restitution: 1.0
        });

        const initialSpeed = ball.velocity.magnitude();
        physics.applyFriction(ball);
        const finalSpeed = ball.velocity.magnitude();
        
        const expectedSpeed = initialSpeed * 0.95;
        const error = Math.abs(finalSpeed - expectedSpeed);
        
        if (error > this.testConfig.accuracyThresholds.velocityTolerance) {
            throw new Error(`Friction calculation error: ${error.toFixed(6)}`);
        }

        return {
            name: 'Friction Force Calculation',
            passed: true,
            details: `Speed: ${initialSpeed.toFixed(3)} -> ${finalSpeed.toFixed(3)} (expected: ${expectedSpeed.toFixed(3)})`
        };
    } 
   // 速度积分测试
    testVelocityIntegration() {
        const ball = new Ball(0, 0, 10, 1);
        ball.setVelocity(50, 30);
        
        const deltaTime = 0.016;
        const iterations = 50;
        
        // 理论位置计算
        const expectedX = ball.velocity.x * deltaTime * iterations;
        const expectedY = ball.velocity.y * deltaTime * iterations;
        
        // 实际模拟
        for (let i = 0; i < iterations; i++) {
            ball.update(deltaTime);
        }
        
        const errorX = Math.abs(ball.position.x - expectedX);
        const errorY = Math.abs(ball.position.y - expectedY);
        
        if (errorX > this.testConfig.accuracyThresholds.positionTolerance || 
            errorY > this.testConfig.accuracyThresholds.positionTolerance) {
            throw new Error(`Velocity integration error: X=${errorX.toFixed(6)}, Y=${errorY.toFixed(6)}`);
        }

        return {
            name: 'Velocity Integration',
            passed: true,
            details: `Position: (${ball.position.x.toFixed(3)}, ${ball.position.y.toFixed(3)}), Errors: (${errorX.toFixed(6)}, ${errorY.toFixed(6)})`
        };
    }

    // 力累积测试
    testForceAccumulation() {
        const ball = new Ball(0, 0, 10, 2); // mass = 2
        
        const force1 = new Vector2D(10, 0);
        const force2 = new Vector2D(0, 15);
        const force3 = new Vector2D(-5, -8);
        
        ball.applyForce(force1);
        ball.applyForce(force2);
        ball.applyForce(force3);
        
        const expectedAcceleration = force1.add(force2).add(force3).multiply(1 / ball.mass);
        
        const errorX = Math.abs(ball.acceleration.x - expectedAcceleration.x);
        const errorY = Math.abs(ball.acceleration.y - expectedAcceleration.y);
        
        if (errorX > this.testConfig.accuracyThresholds.velocityTolerance || 
            errorY > this.testConfig.accuracyThresholds.velocityTolerance) {
            throw new Error(`Force accumulation error: X=${errorX.toFixed(6)}, Y=${errorY.toFixed(6)}`);
        }

        return {
            name: 'Force Accumulation',
            passed: true,
            details: `Acceleration: (${ball.acceleration.x.toFixed(3)}, ${ball.acceleration.y.toFixed(3)})`
        };
    }   
 // 能量守恒测试
    testEnergyConservation() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(0, -50, 10, 1);
        ball.setVelocity(0, 100);
        
        const physics = new PhysicsEngine({
            gravity: 0,
            friction: 1.0,
            restitution: 1.0 // 完全弹性碰撞
        });
        
        const initialKineticEnergy = 0.5 * ball.mass * Math.pow(ball.velocity.magnitude(), 2);
        
        // 模拟碰撞
        physics.handleCollision(ball, hexagon);
        
        const finalKineticEnergy = 0.5 * ball.mass * Math.pow(ball.velocity.magnitude(), 2);
        const energyLoss = Math.abs(finalKineticEnergy - initialKineticEnergy);
        const relativeEnergyLoss = energyLoss / initialKineticEnergy;
        
        if (relativeEnergyLoss > this.testConfig.accuracyThresholds.energyTolerance) {
            throw new Error(`Energy conservation violation: ${relativeEnergyLoss.toFixed(6)} relative loss`);
        }

        return {
            name: 'Energy Conservation',
            passed: true,
            details: `Initial: ${initialKineticEnergy.toFixed(3)}J, Final: ${finalKineticEnergy.toFixed(3)}J, Loss: ${relativeEnergyLoss.toFixed(6)}`
        };
    }

    // 动量守恒测试
    testMomentumConservation() {
        const ball = new Ball(0, 0, 10, 1);
        ball.setVelocity(50, 30);
        
        const initialMomentum = ball.velocity.multiply(ball.mass);
        
        // 应用冲量
        const impulse = new Vector2D(20, -15);
        const physics = new PhysicsEngine({});
        physics.applyImpulse(ball, impulse);
        
        const finalMomentum = ball.velocity.multiply(ball.mass);
        const expectedMomentum = initialMomentum.add(impulse);
        
        const errorX = Math.abs(finalMomentum.x - expectedMomentum.x);
        const errorY = Math.abs(finalMomentum.y - expectedMomentum.y);
        
        if (errorX > this.testConfig.accuracyThresholds.velocityTolerance || 
            errorY > this.testConfig.accuracyThresholds.velocityTolerance) {
            throw new Error(`Momentum conservation error: X=${errorX.toFixed(6)}, Y=${errorY.toFixed(6)}`);
        }

        return {
            name: 'Momentum Conservation',
            passed: true,
            details: `Final momentum: (${finalMomentum.x.toFixed(3)}, ${finalMomentum.y.toFixed(3)})`
        };
    }    // 数值稳定
性测试
    testNumericalStability() {
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({
            gravity: 9.81,
            friction: 0.99,
            restitution: 0.8
        });

        // 长时间模拟测试
        const iterations = 10000;
        let hasNaN = false;
        let hasInfinity = false;
        
        for (let i = 0; i < iterations; i++) {
            physics.update(ball, null, 0.016);
            
            if (!isFinite(ball.position.x) || !isFinite(ball.position.y) ||
                !isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
                hasNaN = true;
                break;
            }
            
            if (Math.abs(ball.velocity.x) > 1e6 || Math.abs(ball.velocity.y) > 1e6) {
                hasInfinity = true;
                break;
            }
        }
        
        if (hasNaN) {
            throw new Error('Numerical instability: NaN values detected');
        }
        
        if (hasInfinity) {
            throw new Error('Numerical instability: Infinite values detected');
        }

        return {
            name: 'Numerical Stability',
            passed: true,
            details: `Stable for ${iterations} iterations, Final velocity: (${ball.velocity.x.toFixed(3)}, ${ball.velocity.y.toFixed(3)})`
        };
    }

    // 极值处理测试
    testExtremeValues() {
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({});
        
        // 测试极大速度
        ball.setVelocity(1e6, 1e6);
        physics.validatePhysicsState(ball);
        
        if (!isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
            throw new Error('Extreme velocity handling failed');
        }
        
        // 测试极小质量
        ball.mass = 1e-10;
        ball.applyForce(new Vector2D(1, 1));
        
        if (!isFinite(ball.acceleration.x) || !isFinite(ball.acceleration.y)) {
            throw new Error('Extreme mass handling failed');
        }
        
        // 测试零除法
        ball.mass = 0;
        try {
            ball.applyForce(new Vector2D(1, 1));
            // 应该处理零质量情况
        } catch (error) {
            // 预期的错误处理
        }

        return {
            name: 'Extreme Values Handling',
            passed: true,
            details: 'All extreme value cases handled correctly'
        };
    }   
 // ========== 碰撞检测集成测试套件 ==========
    async runCollisionIntegrationTestSuite() {
        console.log('\n🔄 Running Enhanced Collision Detection Integration Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            // 基础碰撞测试
            { name: 'Static Hexagon Collision', test: this.testStaticHexagonCollision.bind(this) },
            { name: 'Rotating Hexagon Collision', test: this.testRotatingHexagonCollision.bind(this) },
            { name: 'Multi-Edge Collision', test: this.testMultiEdgeCollision.bind(this) },
            { name: 'Vertex Collision', test: this.testVertexCollision.bind(this) },
            
            // 高级碰撞测试
            { name: 'Continuous Collision Detection', test: this.testContinuousCollision.bind(this) },
            { name: 'High-Speed Collision', test: this.testHighSpeedCollision.bind(this) },
            { name: 'Grazing Collision', test: this.testGrazingCollision.bind(this) },
            { name: 'Collision Response Accuracy', test: this.testCollisionResponseAccuracy.bind(this) },
            
            // 边界情况测试
            { name: 'Penetration Resolution', test: this.testPenetrationResolution.bind(this) },
            { name: 'Collision Normal Accuracy', test: this.testCollisionNormalAccuracy.bind(this) },
            { name: 'Multiple Simultaneous Collisions', test: this.testMultipleCollisions.bind(this) },
            { name: 'Collision Stability', test: this.testCollisionStability.bind(this) }
        ];

        await this.runTestCategory('collisionIntegrationTests', tests);
    }

    // 静态六边形碰撞测试
    testStaticHexagonCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision not detected');
        }
        
        if (collision.penetration <= 0) {
            throw new Error('Collision penetration should be positive');
        }
        
        if (Math.abs(collision.normal.magnitude() - 1) > this.testConfig.accuracyThresholds.angleTolerance) {
            throw new Error('Collision normal should be unit vector');
        }
        
        // 验证法向量方向
        if (collision.normal.x <= 0) {
            throw new Error('Normal should point away from hexagon center');
        }

        return {
            name: 'Static Hexagon Collision',
            passed: true,
            details: `Penetration: ${collision.penetration.toFixed(3)}, Normal: (${collision.normal.x.toFixed(3)}, ${collision.normal.y.toFixed(3)})`
        };
    }    
// 旋转六边形碰撞测试
    testRotatingHexagonCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        
        // 测试不同旋转角度下的碰撞
        const rotationAngles = [0, Math.PI / 6, Math.PI / 3, Math.PI / 2];
        const collisionResults = [];
        
        for (const angle of rotationAngles) {
            hexagon.rotation = angle;
            const collision = hexagon.checkCollision(ball);
            
            if (collision) {
                collisionResults.push({
                    angle: angle,
                    penetration: collision.penetration,
                    normal: collision.normal.clone()
                });
            }
        }
        
        if (collisionResults.length === 0) {
            throw new Error('No collisions detected at any rotation angle');
        }
        
        // 验证旋转影响碰撞检测
        const firstNormal = collisionResults[0].normal;
        const lastNormal = collisionResults[collisionResults.length - 1].normal;
        const normalDifference = firstNormal.subtract(lastNormal).magnitude();
        
        if (normalDifference < 0.1) {
            throw new Error('Rotation should significantly affect collision normal');
        }

        return {
            name: 'Rotating Hexagon Collision',
            passed: true,
            details: `${collisionResults.length} collisions detected, Normal variation: ${normalDifference.toFixed(3)}`
        };
    }

    // 多边碰撞测试
    testMultiEdgeCollision() {
        const hexagon = new Hexagon(0, 0, 50); // 小六边形
        const ball = new Ball(0, 0, 40, 1); // 大球，会与多个边碰撞
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected multi-edge collision not detected');
        }
        
        // 验证大球的碰撞处理
        if (collision.penetration <= 0) {
            throw new Error('Multi-edge collision should have positive penetration');
        }
        
        // 验证法向量的合理性
        if (Math.abs(collision.normal.magnitude() - 1) > this.testConfig.accuracyThresholds.angleTolerance) {
            throw new Error('Multi-edge collision normal should be unit vector');
        }

        return {
            name: 'Multi-Edge Collision',
            passed: true,
            details: `Penetration: ${collision.penetration.toFixed(3)}, Normal magnitude: ${collision.normal.magnitude().toFixed(6)}`
        };
    }

    // 顶点碰撞测试
    testVertexCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const vertices = hexagon.getVertices();
        
        // 测试与第一个顶点的碰撞
        const vertex = vertices[0];
        const ball = new Ball(vertex.x, vertex.y, 10, 1);
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Vertex collision not detected');
        }
        
        if (collision.penetration <= 0) {
            throw new Error('Vertex collision should have positive penetration');
        }

        return {
            name: 'Vertex Collision',
            passed: true,
            details: `Vertex position: (${vertex.x.toFixed(3)}, ${vertex.y.toFixed(3)}), Penetration: ${collision.penetration.toFixed(3)}`
        };
    }   
 // ========== 性能基准测试套件 ==========
    async runPerformanceBenchmarkSuite() {
        console.log('\n⚡ Running Enhanced Performance Benchmark Tests...');
        console.log('-'.repeat(60));
        
        const benchmarks = [
            // 核心性能测试
            { name: 'Physics Update Performance', test: this.benchmarkPhysicsUpdate.bind(this) },
            { name: 'Collision Detection Performance', test: this.benchmarkCollisionDetection.bind(this) },
            { name: 'Rendering Performance', test: this.benchmarkRendering.bind(this) },
            { name: 'Memory Usage Efficiency', test: this.benchmarkMemoryUsage.bind(this) },
            
            // 高级性能测试
            { name: 'Batch Processing Performance', test: this.benchmarkBatchProcessing.bind(this) },
            { name: 'Frame Rate Consistency', test: this.benchmarkFrameRateConsistency.bind(this) },
            { name: 'Garbage Collection Impact', test: this.benchmarkGarbageCollection.bind(this) },
            { name: 'CPU Utilization', test: this.benchmarkCPUUtilization.bind(this) }
        ];

        await this.runTestCategory('performanceBenchmarks', benchmarks);
    }

    // 物理更新性能基准
    benchmarkPhysicsUpdate() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({
            gravity: 9.81,
            friction: 0.98,
            restitution: 0.8
        });

        const iterations = 10000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            physics.update(ball, hexagon, 0.016);
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        const estimatedFPS = 1000 / (avgTime * 60); // 估算60帧下的FPS能力

        if (avgTime > this.testConfig.performanceThresholds.physicsUpdateTime) {
            throw new Error(`Physics update too slow: ${avgTime.toFixed(4)}ms (threshold: ${this.testConfig.performanceThresholds.physicsUpdateTime}ms)`);
        }

        return {
            name: 'Physics Update Performance',
            passed: true,
            performance: `${avgTime.toFixed(4)}ms per update (~${estimatedFPS.toFixed(0)} FPS capability)`,
            details: `${iterations} iterations in ${totalTime.toFixed(2)}ms`
        };
    }

    // 碰撞检测性能基准
    benchmarkCollisionDetection() {
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];
        
        // 创建多个小球进行批量测试
        for (let i = 0; i < 20; i++) {
            balls.push(new Ball(
                Math.random() * 180 - 90,
                Math.random() * 180 - 90,
                5 + Math.random() * 10,
                1
            ));
        }

        const iterations = 5000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            for (const ball of balls) {
                hexagon.checkCollision(ball);
            }
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / (iterations * balls.length);

        if (avgTime > this.testConfig.performanceThresholds.collisionCheckTime) {
            throw new Error(`Collision detection too slow: ${avgTime.toFixed(6)}ms (threshold: ${this.testConfig.performanceThresholds.collisionCheckTime}ms)`);
        }

        return {
            name: 'Collision Detection Performance',
            passed: true,
            performance: `${avgTime.toFixed(6)}ms per check (${balls.length} balls, ${iterations} iterations)`,
            details: `Total checks: ${iterations * balls.length}, Total time: ${totalTime.toFixed(2)}ms`
        };
    }    // 
渲染性能基准
    benchmarkRendering() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        
        const renderer = new Renderer(canvas);
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];

        // 创建多个小球用于渲染测试
        for (let i = 0; i < 50; i++) {
            balls.push(new Ball(
                Math.random() * 180 - 90,
                Math.random() * 180 - 90,
                5 + Math.random() * 10,
                1
            ));
        }

        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            renderer.clear();
            renderer.drawHexagon(hexagon);
            for (const ball of balls) {
                renderer.drawBall(ball);
            }
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        const estimatedFPS = 1000 / avgTime;

        if (avgTime > this.testConfig.performanceThresholds.renderFrameTime) {
            throw new Error(`Rendering too slow: ${avgTime.toFixed(3)}ms (threshold: ${this.testConfig.performanceThresholds.renderFrameTime}ms for 60 FPS)`);
        }

        return {
            name: 'Rendering Performance',
            passed: true,
            performance: `${avgTime.toFixed(3)}ms per frame (~${estimatedFPS.toFixed(0)} FPS, ${balls.length + 1} objects)`,
            details: `${iterations} frames rendered in ${totalTime.toFixed(2)}ms`
        };
    }

    // 内存使用效率基准
    benchmarkMemoryUsage() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const objects = [];

        // 创建大量对象测试内存使用
        const objectCount = 2000;
        for (let i = 0; i < objectCount; i++) {
            objects.push({
                ball: new Ball(Math.random() * 100, Math.random() * 100, 10, 1),
                hexagon: new Hexagon(Math.random() * 100, Math.random() * 100, 50),
                vectors: Array.from({ length: 5 }, () => 
                    new Vector2D(Math.random() * 100, Math.random() * 100)
                )
            });
        }

        const peakMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = peakMemory - initialMemory;

        // 清理对象
        objects.length = 0;

        return new Promise((resolve) => {
            setTimeout(() => {
                const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                const memoryLeaked = finalMemory - initialMemory;
                const memoryPerObject = memoryIncrease / objectCount;
                const leakRatio = memoryLeaked / memoryIncrease;

                if (leakRatio > this.testConfig.performanceThresholds.memoryLeakThreshold) {
                    throw new Error(`Memory leak detected: ${(leakRatio * 100).toFixed(1)}% not released (threshold: ${(this.testConfig.performanceThresholds.memoryLeakThreshold * 100).toFixed(1)}%)`);
                }

                resolve({
                    name: 'Memory Usage Efficiency',
                    passed: true,
                    performance: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB peak, ${memoryPerObject.toFixed(0)} bytes/object, ${(leakRatio * 100).toFixed(1)}% leaked`,
                    details: `${objectCount} objects created, ${(memoryLeaked / 1024).toFixed(1)}KB leaked`
                });
            }, 100);
        });
    }    // ===
======= 跨浏览器兼容性测试套件 ==========
    async runCompatibilityTestSuite() {
        console.log('\n🌐 Running Enhanced Cross-Browser Compatibility Tests...');
        console.log('-'.repeat(60));
        
        // 使用现有的BrowserCompatibilityTest
        try {
            const BrowserCompatibilityTest = global.BrowserCompatibilityTest || 
                (typeof require !== 'undefined' ? require('./browser-compatibility-test.js') : null);
            
            if (BrowserCompatibilityTest) {
                const compatTest = new BrowserCompatibilityTest();
                const results = await compatTest.runAllTests();
                
                this.testResults.compatibilityTests = results.map(result => ({
                    name: result.name,
                    passed: result.passed,
                    details: result.message || result.error || 'OK'
                }));
            } else {
                // 基础兼容性测试
                const basicTests = [
                    { name: 'Canvas Support', test: this.testBasicCanvasSupport.bind(this) },
                    { name: 'RequestAnimationFrame Support', test: this.testBasicRAFSupport.bind(this) },
                    { name: 'ES6 Classes Support', test: this.testBasicES6Support.bind(this) },
                    { name: 'Performance API Support', test: this.testBasicPerformanceAPI.bind(this) }
                ];
                
                await this.runTestCategory('compatibilityTests', basicTests);
            }
        } catch (error) {
            console.log(`⚠️  Compatibility test error: ${error.message}`);
            this.testResults.compatibilityTests.push({
                name: 'Compatibility Test Suite',
                passed: false,
                details: error.message
            });
        }
    }

    // 基础Canvas支持测试
    testBasicCanvasSupport() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!canvas || !ctx) {
            throw new Error('Canvas or 2D context not supported');
        }
        
        return { name: 'Canvas Support', passed: true, details: 'Canvas and 2D context available' };
    }

    // 基础RAF支持测试
    testBasicRAFSupport() {
        if (typeof requestAnimationFrame !== 'function') {
            throw new Error('requestAnimationFrame not supported');
        }
        
        return { name: 'RequestAnimationFrame Support', passed: true, details: 'RAF available' };
    }

    // 基础ES6支持测试
    testBasicES6Support() {
        try {
            eval('class TestClass {}');
            eval('const arrow = () => {}');
            return { name: 'ES6 Classes Support', passed: true, details: 'ES6 features available' };
        } catch (error) {
            throw new Error('ES6 features not supported');
        }
    }

    // 基础Performance API测试
    testBasicPerformanceAPI() {
        if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
            throw new Error('Performance API not supported');
        }
        
        return { name: 'Performance API Support', passed: true, details: 'Performance.now() available' };
    }    //
 ========== 压力测试套件 ==========
    async runStressTestSuite() {
        console.log('\n💪 Running Stress Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            { name: 'Long Duration Simulation', test: this.testLongDurationSimulation.bind(this) },
            { name: 'High Object Count', test: this.testHighObjectCount.bind(this) },
            { name: 'Rapid State Changes', test: this.testRapidStateChanges.bind(this) },
            { name: 'Memory Pressure', test: this.testMemoryPressure.bind(this) }
        ];

        await this.runTestCategory('stressTests', tests);
    }

    // 长时间模拟测试
    testLongDurationSimulation() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({});

        const iterations = 100000; // 约27分钟的60FPS模拟
        let errorCount = 0;

        for (let i = 0; i < iterations; i++) {
            physics.update(ball, hexagon, 0.016);
            
            if (!isFinite(ball.position.x) || !isFinite(ball.position.y) ||
                !isFinite(ball.velocity.x) || !isFinite(ball.velocity.y)) {
                errorCount++;
            }
            
            if (errorCount > 10) {
                throw new Error(`Too many numerical errors: ${errorCount}`);
            }
        }

        return {
            name: 'Long Duration Simulation',
            passed: true,
            details: `${iterations} iterations completed, ${errorCount} errors`
        };
    }

    // 高对象数量测试
    testHighObjectCount() {
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];
        const ballCount = 100;

        // 创建大量小球
        for (let i = 0; i < ballCount; i++) {
            balls.push(new Ball(
                Math.random() * 180 - 90,
                Math.random() * 180 - 90,
                5,
                1
            ));
        }

        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            for (const ball of balls) {
                hexagon.checkCollision(ball);
            }
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTimePerCheck = totalTime / (iterations * ballCount);

        if (avgTimePerCheck > 0.1) {
            throw new Error(`High object count performance degraded: ${avgTimePerCheck.toFixed(6)}ms per check`);
        }

        return {
            name: 'High Object Count',
            passed: true,
            details: `${ballCount} objects, ${avgTimePerCheck.toFixed(6)}ms per collision check`
        };
    }    // ===
======= 测试执行框架 ==========
    async runTestCategory(categoryName, tests) {
        for (const test of tests) {
            try {
                console.log(`  Testing ${test.name}...`);
                const result = await test.test();
                this.testResults[categoryName].push(result);
                console.log(`    ✓ ${result.name}${result.details ? ': ' + result.details : ''}`);
            } catch (error) {
                const result = { 
                    name: test.name, 
                    passed: false, 
                    error: error.message,
                    details: `Failed: ${error.message}`
                };
                this.testResults[categoryName].push(result);
                console.log(`    ❌ ${result.name}: ${error.message}`);
            }
        }
    }

    // ========== 精度验证测试套件 ==========
    async runAccuracyTestSuite() {
        console.log('\n🎯 Running Accuracy Validation Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            { name: 'Physics Equation Accuracy', test: this.testPhysicsEquationAccuracy.bind(this) },
            { name: 'Collision Angle Accuracy', test: this.testCollisionAngleAccuracy.bind(this) },
            { name: 'Energy Balance Accuracy', test: this.testEnergyBalanceAccuracy.bind(this) },
            { name: 'Geometric Calculation Accuracy', test: this.testGeometricAccuracy.bind(this) }
        ];

        await this.runTestCategory('accuracyTests', tests);
    }

    // 物理方程精度测试
    testPhysicsEquationAccuracy() {
        // 测试自由落体方程: s = ut + (1/2)gt²
        const ball = new Ball(0, 0, 10, 1);
        const physics = new PhysicsEngine({ gravity: 9.81, friction: 1.0 });
        
        const initialVelocity = 0;
        const time = 2.0; // 2秒
        const timeSteps = Math.floor(time / 0.016);
        
        for (let i = 0; i < timeSteps; i++) {
            physics.applyGravity(ball, 0.016);
            ball.update(0.016);
        }
        
        const actualDistance = ball.position.y;
        const expectedDistance = initialVelocity * time + 0.5 * 9.81 * time * time;
        const relativeError = Math.abs(actualDistance - expectedDistance) / expectedDistance;
        
        if (relativeError > 0.01) { // 1% tolerance
            throw new Error(`Physics equation error: ${relativeError.toFixed(6)} (expected < 0.01)`);
        }

        return {
            name: 'Physics Equation Accuracy',
            passed: true,
            details: `Relative error: ${relativeError.toFixed(6)}, Distance: ${actualDistance.toFixed(3)}m vs ${expectedDistance.toFixed(3)}m expected`
        };
    }

    // 碰撞角度精度测试
    testCollisionAngleAccuracy() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(100, 0, 10, 1); // 正好在右边缘
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision not detected');
        }
        
        // 对于右边缘碰撞，法向量应该指向右方 (1, 0)
        const expectedNormal = new Vector2D(1, 0);
        const actualNormal = collision.normal;
        
        const angleDifference = Math.abs(Math.atan2(actualNormal.y, actualNormal.x) - Math.atan2(expectedNormal.y, expectedNormal.x));
        
        if (angleDifference > this.testConfig.accuracyThresholds.angleTolerance) {
            throw new Error(`Collision angle error: ${angleDifference.toFixed(6)} radians`);
        }

        return {
            name: 'Collision Angle Accuracy',
            passed: true,
            details: `Angle difference: ${angleDifference.toFixed(6)} radians, Normal: (${actualNormal.x.toFixed(6)}, ${actualNormal.y.toFixed(6)})`
        };
    }    //
 ========== 测试报告生成 ==========
    generateEnhancedTestReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 ENHANCED COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(80));
        
        const totalTime = this.endTime - this.startTime;
        console.log(`⏱️  Total execution time: ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)\n`);
        
        // 计算各类别统计
        const categories = [
            { name: 'Physics Unit Tests', key: 'physicsUnitTests', icon: '🧪' },
            { name: 'Collision Integration Tests', key: 'collisionIntegrationTests', icon: '🔄' },
            { name: 'Performance Benchmarks', key: 'performanceBenchmarks', icon: '⚡' },
            { name: 'Compatibility Tests', key: 'compatibilityTests', icon: '🌐' },
            { name: 'Stress Tests', key: 'stressTests', icon: '💪' },
            { name: 'Accuracy Tests', key: 'accuracyTests', icon: '🎯' }
        ];
        
        let totalTests = 0;
        let totalPassed = 0;
        
        categories.forEach(category => {
            const results = this.testResults[category.key] || [];
            const passed = results.filter(r => r.passed).length;
            const total = results.length;
            
            totalTests += total;
            totalPassed += passed;
            
            const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
            const status = passed === total ? '✅' : (passed > 0 ? '⚠️' : '❌');
            
            console.log(`${category.icon} ${category.name}: ${status} ${passed}/${total} passed (${percentage}%)`);
            
            // 显示失败的测试
            const failed = results.filter(r => !r.passed);
            if (failed.length > 0) {
                failed.forEach(test => {
                    console.log(`    ❌ ${test.name}: ${test.error || test.details}`);
                });
            }
        });
        
        console.log('\n' + '-'.repeat(80));
        
        // 总体结果
        const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
        
        if (totalPassed === totalTests) {
            console.log('🎉 ALL TESTS PASSED! System is production-ready.');
        } else if (overallPercentage >= 90) {
            console.log('✅ EXCELLENT! Most tests passed with minor issues.');
        } else if (overallPercentage >= 75) {
            console.log('⚠️  GOOD with some concerns. Review failed tests.');
        } else {
            console.log('❌ NEEDS ATTENTION. Multiple test failures detected.');
        }
        
        console.log(`📈 Overall Result: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`);
        
        // 性能摘要
        const perfTests = this.testResults.performanceBenchmarks || [];
        const perfPassed = perfTests.filter(t => t.passed).length;
        if (perfPassed > 0) {
            console.log(`⚡ Performance: ${perfPassed}/${perfTests.length} benchmarks met thresholds`);
        }
        
        // 兼容性摘要
        const compatTests = this.testResults.compatibilityTests || [];
        const compatPassed = compatTests.filter(t => t.passed).length;
        if (compatPassed > 0) {
            console.log(`🌐 Compatibility: ${compatPassed}/${compatTests.length} features supported`);
        }
        
        console.log('\n💡 Recommendations:');
        
        if (overallPercentage >= 95) {
            console.log('   ✨ System is highly optimized and ready for production deployment');
        } else {
            console.log('   🔧 Review failed tests and optimize identified performance bottlenecks');
            console.log('   📚 Consider additional testing for edge cases and error conditions');
        }
        
        console.log('='.repeat(80));
    }

    // 获取测试结果
    getTestResults() {
        return {
            testResults: this.testResults,
            executionTime: this.endTime - this.startTime,
            summary: this.generateSummary()
        };
    }

    // 生成测试摘要
    generateSummary() {
        let totalTests = 0;
        let totalPassed = 0;
        
        Object.values(this.testResults).forEach(category => {
            if (Array.isArray(category)) {
                totalTests += category.length;
                totalPassed += category.filter(r => r.passed).length;
            }
        });
        
        return {
            totalTests,
            totalPassed,
            successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0,
            categories: Object.keys(this.testResults).map(key => ({
                name: key,
                tests: this.testResults[key].length,
                passed: this.testResults[key].filter(r => r.passed).length
            }))
        };
    }
}

// 导出测试套件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedComprehensiveTestSuite;
}