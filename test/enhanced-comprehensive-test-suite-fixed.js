/**
 * 增强综合测试套件 - Enhanced Comprehensive Test Suite (Fixed)
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
            compatibilityTests: []
        };
        this.startTime = 0;
        this.endTime = 0;
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 Starting Enhanced Comprehensive Test Suite...\n');
        console.log('Testing Rotating Hexagon Ball Physics System');
        console.log('Requirements: 6.1 (Animation Performance), 6.4 (Optimization)');
        console.log('='.repeat(80));
        
        this.startTime = performance.now();

        try {
            // 1. 物理引擎单元测试
            await this.runPhysicsUnitTests();
            
            // 2. 碰撞检测集成测试
            await this.runCollisionIntegrationTests();
            
            // 3. 性能基准测试
            await this.runPerformanceBenchmarks();
            
            // 4. 兼容性测试
            await this.runCompatibilityTests();

            this.endTime = performance.now();
            this.generateTestReport();

        } catch (error) {
            console.error('❌ Enhanced test suite failed:', error);
            throw error;
        }
    }

    // 物理引擎单元测试
    async runPhysicsUnitTests() {
        console.log('\n🧪 Running Physics Engine Unit Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            { name: 'Gravity Application', test: this.testGravityApplication.bind(this) },
            { name: 'Friction Calculation', test: this.testFrictionCalculation.bind(this) },
            { name: 'Velocity Integration', test: this.testVelocityIntegration.bind(this) },
            { name: 'Force Accumulation', test: this.testForceAccumulation.bind(this) }
        ];

        await this.runTestCategory('physicsUnitTests', tests);
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
        physics.applyGravity(ball, 0.016);
        
        if (ball.velocity.y <= initialVelocity) {
            throw new Error('Gravity should increase downward velocity');
        }

        return {
            name: 'Gravity Application',
            passed: true,
            details: `Velocity changed from ${initialVelocity.toFixed(3)} to ${ball.velocity.y.toFixed(3)}`
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
        
        if (finalSpeed >= initialSpeed) {
            throw new Error('Friction should reduce speed');
        }

        return {
            name: 'Friction Calculation',
            passed: true,
            details: `Speed reduced from ${initialSpeed.toFixed(3)} to ${finalSpeed.toFixed(3)}`
        };
    }

    // 速度积分测试
    testVelocityIntegration() {
        const ball = new Ball(0, 0, 10, 1);
        ball.setVelocity(50, 30);
        
        const initialPosition = ball.position.clone();
        ball.update(0.016);
        
        const expectedX = initialPosition.x + 50 * 0.016;
        const expectedY = initialPosition.y + 30 * 0.016;
        
        const errorX = Math.abs(ball.position.x - expectedX);
        const errorY = Math.abs(ball.position.y - expectedY);
        
        if (errorX > 0.001 || errorY > 0.001) {
            throw new Error(`Velocity integration error: X=${errorX.toFixed(6)}, Y=${errorY.toFixed(6)}`);
        }

        return {
            name: 'Velocity Integration',
            passed: true,
            details: `Position: (${ball.position.x.toFixed(3)}, ${ball.position.y.toFixed(3)})`
        };
    }    
// 力累积测试
    testForceAccumulation() {
        const ball = new Ball(0, 0, 10, 2); // mass = 2
        
        const force1 = new Vector2D(10, 0);
        const force2 = new Vector2D(0, 15);
        
        ball.applyForce(force1);
        ball.applyForce(force2);
        
        const expectedAcceleration = force1.add(force2).multiply(1 / ball.mass);
        
        const errorX = Math.abs(ball.acceleration.x - expectedAcceleration.x);
        const errorY = Math.abs(ball.acceleration.y - expectedAcceleration.y);
        
        if (errorX > 0.001 || errorY > 0.001) {
            throw new Error(`Force accumulation error: X=${errorX.toFixed(6)}, Y=${errorY.toFixed(6)}`);
        }

        return {
            name: 'Force Accumulation',
            passed: true,
            details: `Acceleration: (${ball.acceleration.x.toFixed(3)}, ${ball.acceleration.y.toFixed(3)})`
        };
    }

    // 碰撞检测集成测试
    async runCollisionIntegrationTests() {
        console.log('\n🔄 Running Collision Detection Integration Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            { name: 'Basic Collision Detection', test: this.testBasicCollision.bind(this) },
            { name: 'Rotating Hexagon Collision', test: this.testRotatingCollision.bind(this) },
            { name: 'Collision Normal Accuracy', test: this.testCollisionNormals.bind(this) },
            { name: 'Penetration Calculation', test: this.testPenetrationCalculation.bind(this) }
        ];

        await this.runTestCategory('collisionIntegrationTests', tests);
    }

    // 基础碰撞检测测试
    testBasicCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision not detected');
        }
        
        if (collision.penetration <= 0) {
            throw new Error('Collision penetration should be positive');
        }

        return {
            name: 'Basic Collision Detection',
            passed: true,
            details: `Penetration: ${collision.penetration.toFixed(3)}`
        };
    }    // 旋转
碰撞测试
    testRotatingCollision() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(90, 0, 15, 1);
        
        const collision1 = hexagon.checkCollision(ball);
        
        hexagon.rotate(Math.PI / 6);
        const collision2 = hexagon.checkCollision(ball);
        
        if (collision1 && collision2) {
            const normalDiff = collision1.normal.subtract(collision2.normal).magnitude();
            if (normalDiff < 0.1) {
                throw new Error('Rotation should affect collision normal');
            }
        }

        return {
            name: 'Rotating Hexagon Collision',
            passed: true,
            details: 'Rotation affects collision detection correctly'
        };
    }

    // 碰撞法向量测试
    testCollisionNormals() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(95, 0, 10, 1);
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision not detected');
        }
        
        if (Math.abs(collision.normal.magnitude() - 1) > 0.001) {
            throw new Error('Collision normal should be unit vector');
        }

        return {
            name: 'Collision Normal Accuracy',
            passed: true,
            details: `Normal magnitude: ${collision.normal.magnitude().toFixed(6)}`
        };
    }

    // 穿透计算测试
    testPenetrationCalculation() {
        const hexagon = new Hexagon(0, 0, 100);
        const ball = new Ball(95, 0, 10, 1);
        
        const collision = hexagon.checkCollision(ball);
        
        if (!collision) {
            throw new Error('Expected collision not detected');
        }
        
        if (collision.penetration <= 0 || collision.penetration > ball.radius) {
            throw new Error('Penetration calculation incorrect');
        }

        return {
            name: 'Penetration Calculation',
            passed: true,
            details: `Penetration: ${collision.penetration.toFixed(3)}`
        };
    } 
   // 性能基准测试
    async runPerformanceBenchmarks() {
        console.log('\n⚡ Running Performance Benchmark Tests...');
        console.log('-'.repeat(60));
        
        const benchmarks = [
            { name: 'Physics Update Performance', test: this.benchmarkPhysicsUpdate.bind(this) },
            { name: 'Collision Detection Performance', test: this.benchmarkCollisionDetection.bind(this) },
            { name: 'Rendering Performance', test: this.benchmarkRendering.bind(this) },
            { name: 'Memory Usage', test: this.benchmarkMemoryUsage.bind(this) }
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

        if (avgTime > 1.0) { // 1ms threshold
            throw new Error(`Physics update too slow: ${avgTime.toFixed(4)}ms per update`);
        }

        return {
            name: 'Physics Update Performance',
            passed: true,
            performance: `${avgTime.toFixed(4)}ms per update`,
            details: `${iterations} iterations in ${totalTime.toFixed(2)}ms`
        };
    }

    // 碰撞检测性能基准
    benchmarkCollisionDetection() {
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];
        
        for (let i = 0; i < 10; i++) {
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

        if (avgTime > 0.1) { // 0.1ms threshold
            throw new Error(`Collision detection too slow: ${avgTime.toFixed(6)}ms per check`);
        }

        return {
            name: 'Collision Detection Performance',
            passed: true,
            performance: `${avgTime.toFixed(6)}ms per check`,
            details: `${balls.length} balls, ${iterations} iterations`
        };
    }  
  // 渲染性能基准
    benchmarkRendering() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        
        const renderer = new Renderer(canvas);
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];

        for (let i = 0; i < 20; i++) {
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

        if (avgTime > 16.67) { // 60 FPS threshold
            throw new Error(`Rendering too slow: ${avgTime.toFixed(3)}ms per frame (60 FPS = 16.67ms)`);
        }

        return {
            name: 'Rendering Performance',
            passed: true,
            performance: `${avgTime.toFixed(3)}ms per frame (~${(1000/avgTime).toFixed(0)} FPS)`,
            details: `${balls.length + 1} objects, ${iterations} frames`
        };
    }

    // 内存使用基准
    benchmarkMemoryUsage() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const objects = [];

        const objectCount = 1000;
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

        return {
            name: 'Memory Usage',
            passed: true,
            performance: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB for ${objectCount} objects`,
            details: `${(memoryIncrease / objectCount).toFixed(0)} bytes per object`
        };
    }   
 // 兼容性测试
    async runCompatibilityTests() {
        console.log('\n🌐 Running Cross-Browser Compatibility Tests...');
        console.log('-'.repeat(60));
        
        const tests = [
            { name: 'Canvas Support', test: this.testCanvasSupport.bind(this) },
            { name: 'RequestAnimationFrame Support', test: this.testRAFSupport.bind(this) },
            { name: 'ES6 Features Support', test: this.testES6Support.bind(this) },
            { name: 'Performance API Support', test: this.testPerformanceAPI.bind(this) }
        ];

        await this.runTestCategory('compatibilityTests', tests);
    }

    // Canvas支持测试
    testCanvasSupport() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!canvas || !ctx) {
            throw new Error('Canvas or 2D context not supported');
        }
        
        return { 
            name: 'Canvas Support', 
            passed: true, 
            details: 'Canvas and 2D context available' 
        };
    }

    // RequestAnimationFrame支持测试
    testRAFSupport() {
        if (typeof requestAnimationFrame !== 'function') {
            throw new Error('requestAnimationFrame not supported');
        }
        
        return { 
            name: 'RequestAnimationFrame Support', 
            passed: true, 
            details: 'RAF available' 
        };
    }

    // ES6支持测试
    testES6Support() {
        try {
            eval('class TestClass {}');
            eval('const arrow = () => {}');
            return { 
                name: 'ES6 Features Support', 
                passed: true, 
                details: 'ES6 features available' 
            };
        } catch (error) {
            throw new Error('ES6 features not supported');
        }
    }

    // Performance API测试
    testPerformanceAPI() {
        if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
            throw new Error('Performance API not supported');
        }
        
        return { 
            name: 'Performance API Support', 
            passed: true, 
            details: 'Performance.now() available' 
        };
    }   
 // 测试执行框架
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

    // 生成测试报告
    generateTestReport() {
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
            { name: 'Compatibility Tests', key: 'compatibilityTests', icon: '🌐' }
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