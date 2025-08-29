/**
 * 性能基准测试 - Performance Benchmark
 * 独立的性能测试工具，用于测量物理引擎和渲染性能
 */

class PerformanceBenchmark {
    constructor() {
        this.results = [];
        this.isRunning = false;
    }

    // 运行所有性能基准测试
    async runAllBenchmarks() {
        console.log('⚡ Starting Performance Benchmarks...\n');
        
        const benchmarks = [
            { name: 'Physics Update', test: this.benchmarkPhysicsUpdate.bind(this) },
            { name: 'Collision Detection', test: this.benchmarkCollisionDetection.bind(this) },
            { name: 'Rendering Performance', test: this.benchmarkRendering.bind(this) },
            { name: 'Memory Usage', test: this.benchmarkMemoryUsage.bind(this) },
            { name: 'Vector Operations', test: this.benchmarkVectorOperations.bind(this) },
            { name: 'Hexagon Rotation', test: this.benchmarkHexagonRotation.bind(this) }
        ];

        for (const benchmark of benchmarks) {
            try {
                console.log(`Running ${benchmark.name}...`);
                const result = await benchmark.test();
                this.results.push(result);
                console.log(`✓ ${result.name}: ${result.performance}`);
            } catch (error) {
                const result = { 
                    name: benchmark.name, 
                    passed: false, 
                    error: error.message,
                    performance: 'Failed'
                };
                this.results.push(result);
                console.log(`❌ ${result.name}: ${error.message}`);
            }
        }

        this.generateReport();
        return this.results;
    }

    // 物理更新性能测试
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
        const fps = 1000 / (avgTime * 60); // 估算FPS

        return {
            name: 'Physics Update Performance',
            passed: avgTime < 1.0,
            performance: `${avgTime.toFixed(4)}ms per update (~${fps.toFixed(0)} FPS capability)`,
            avgTime: avgTime,
            totalTime: totalTime,
            iterations: iterations
        };
    }

    // 碰撞检测性能测试
    benchmarkCollisionDetection() {
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];
        
        // 创建多个小球进行测试
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

        return {
            name: 'Collision Detection Performance',
            passed: avgTime < 0.1,
            performance: `${avgTime.toFixed(4)}ms per check (${balls.length} balls, ${iterations} iterations)`,
            avgTime: avgTime,
            totalTime: totalTime,
            iterations: iterations * balls.length
        };
    }

    // 渲染性能测试
    benchmarkRendering() {
        // 创建虚拟canvas
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        
        const renderer = new Renderer(canvas);
        const hexagon = new Hexagon(0, 0, 100);
        const balls = [];

        // 创建多个小球
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
        const fps = 1000 / avgTime;

        return {
            name: 'Rendering Performance',
            passed: avgTime < 16.67, // 60 FPS target
            performance: `${avgTime.toFixed(3)}ms per frame (~${fps.toFixed(0)} FPS, ${balls.length} objects)`,
            avgTime: avgTime,
            totalTime: totalTime,
            iterations: iterations
        };
    }

    // 内存使用测试
    benchmarkMemoryUsage() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const objects = [];

        // 创建大量对象
        const objectCount = 1000;
        for (let i = 0; i < objectCount; i++) {
            objects.push({
                ball: new Ball(Math.random() * 100, Math.random() * 100, 10, 1),
                hexagon: new Hexagon(Math.random() * 100, Math.random() * 100, 50),
                vectors: Array.from({ length: 10 }, () => 
                    new Vector2D(Math.random() * 100, Math.random() * 100)
                )
            });
        }

        const peakMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = peakMemory - initialMemory;

        // 清理对象
        objects.length = 0;

        // 等待垃圾回收
        return new Promise((resolve) => {
            setTimeout(() => {
                const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                const memoryLeaked = finalMemory - initialMemory;
                const memoryPerObject = memoryIncrease / objectCount;

                resolve({
                    name: 'Memory Usage',
                    passed: memoryLeaked < memoryIncrease * 0.5,
                    performance: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB peak, ${memoryPerObject.toFixed(0)} bytes/object`,
                    memoryIncrease: memoryIncrease,
                    memoryLeaked: memoryLeaked,
                    objectCount: objectCount
                });
            }, 100);
        });
    }

    // Vector操作性能测试
    benchmarkVectorOperations() {
        const vectors = [];
        for (let i = 0; i < 1000; i++) {
            vectors.push(new Vector2D(Math.random() * 100, Math.random() * 100));
        }

        const iterations = 10000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            const v1 = vectors[i % vectors.length];
            const v2 = vectors[(i + 1) % vectors.length];
            
            // 执行各种向量操作
            v1.add(v2);
            v1.subtract(v2);
            v1.multiply(2.5);
            v1.magnitude();
            v1.normalize();
            v1.dot(v2);
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        const opsPerSecond = 1000 / avgTime;

        return {
            name: 'Vector Operations Performance',
            passed: avgTime < 0.01,
            performance: `${avgTime.toFixed(6)}ms per operation (~${opsPerSecond.toFixed(0)} ops/sec)`,
            avgTime: avgTime,
            totalTime: totalTime,
            iterations: iterations
        };
    }

    // 六边形旋转性能测试
    benchmarkHexagonRotation() {
        const hexagon = new Hexagon(0, 0, 100);
        const iterations = 50000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            hexagon.rotate(0.01); // 小角度旋转
            hexagon.getVertices(); // 获取顶点
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        const rotationsPerSecond = 1000 / avgTime;

        return {
            name: 'Hexagon Rotation Performance',
            passed: avgTime < 0.05,
            performance: `${avgTime.toFixed(6)}ms per rotation (~${rotationsPerSecond.toFixed(0)} rotations/sec)`,
            avgTime: avgTime,
            totalTime: totalTime,
            iterations: iterations
        };
    }

    // 生成性能报告
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERFORMANCE BENCHMARK REPORT');
        console.log('='.repeat(60));

        const passedTests = this.results.filter(r => r.passed).length;
        const totalTests = this.results.length;

        console.log(`\n📈 Overall Performance: ${passedTests}/${totalTests} benchmarks passed\n`);

        this.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.name}`);
            console.log(`   Performance: ${result.performance}`);
            if (!result.passed && result.error) {
                console.log(`   Error: ${result.error}`);
            }
            console.log('');
        });

        // 性能建议
        console.log('💡 Performance Recommendations:');
        
        const physicsResult = this.results.find(r => r.name.includes('Physics Update'));
        if (physicsResult && physicsResult.avgTime > 0.5) {
            console.log('   - Consider optimizing physics calculations for better frame rates');
        }

        const collisionResult = this.results.find(r => r.name.includes('Collision Detection'));
        if (collisionResult && collisionResult.avgTime > 0.05) {
            console.log('   - Collision detection could be optimized with spatial partitioning');
        }

        const renderResult = this.results.find(r => r.name.includes('Rendering'));
        if (renderResult && renderResult.avgTime > 16.67) {
            console.log('   - Rendering performance may cause frame drops, consider optimization');
        }

        console.log('='.repeat(60));
    }

    // 获取结果
    getResults() {
        return this.results;
    }

    // 清除结果
    clearResults() {
        this.results = [];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceBenchmark;
}