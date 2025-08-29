/**
 * 响应式设计测试
 * 测试不同屏幕尺寸下的Canvas适配和物理参数缩放
 */

// 测试配置
const TEST_CONFIGURATIONS = [
    { name: 'Mobile Portrait', width: 375, height: 667, expectedScale: 0.4 },
    { name: 'Mobile Landscape', width: 667, height: 375, expectedScale: 0.4 },
    { name: 'Tablet Portrait', width: 768, height: 1024, expectedScale: 0.7 },
    { name: 'Tablet Landscape', width: 1024, height: 768, expectedScale: 0.8 },
    { name: 'Desktop Small', width: 1200, height: 800, expectedScale: 1.0 },
    { name: 'Desktop Large', width: 1920, height: 1080, expectedScale: 1.2 }
];

/**
 * 运行响应式设计测试
 */
function runResponsiveDesignTests() {
    console.log('=== 响应式设计测试开始 ===');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // 测试1: Canvas尺寸适配测试
    console.log('\n1. Canvas尺寸适配测试');
    testCanvasResizing(results);
    
    // 测试2: 物理参数缩放测试
    console.log('\n2. 物理参数缩放测试');
    testPhysicsScaling(results);
    
    // 测试3: 响应式断点测试
    console.log('\n3. 响应式断点测试');
    testResponsiveBreakpoints(results);
    
    // 测试4: 高DPI屏幕支持测试
    console.log('\n4. 高DPI屏幕支持测试');
    testHighDPISupport(results);
    
    // 测试5: 性能测试
    console.log('\n5. 不同屏幕尺寸性能测试');
    testPerformanceAcrossScreenSizes(results);
    
    // 输出测试结果
    console.log('\n=== 响应式设计测试结果 ===');
    console.log(`通过: ${results.passed}`);
    console.log(`失败: ${results.failed}`);
    console.log(`总计: ${results.passed + results.failed}`);
    
    if (results.failed > 0) {
        console.log('\n失败的测试:');
        results.tests.filter(test => !test.passed).forEach(test => {
            console.log(`- ${test.name}: ${test.error}`);
        });
    }
    
    return results;
}

/**
 * 测试Canvas尺寸适配
 */
function testCanvasResizing(results) {
    try {
        // 创建测试Canvas
        const canvas = document.createElement('canvas');
        const container = document.createElement('div');
        container.appendChild(canvas);
        document.body.appendChild(container);
        
        // 创建Renderer实例
        const renderer = new Renderer(canvas);
        
        TEST_CONFIGURATIONS.forEach(config => {
            try {
                // 模拟不同屏幕尺寸
                container.style.width = config.width + 'px';
                container.style.height = config.height + 'px';
                
                // 更新Canvas尺寸
                renderer.updateCanvasSize();
                
                // 检查Canvas尺寸是否合理
                const dimensions = renderer.getDimensions();
                const scaleFactor = renderer.getScaleFactor();
                
                // 验证尺寸
                const isValidSize = dimensions.width > 0 && dimensions.height > 0 &&
                                  dimensions.width <= config.width &&
                                  dimensions.height <= config.height;
                
                // 验证缩放因子
                const isValidScale = scaleFactor > 0 && scaleFactor <= 2.0;
                
                if (isValidSize && isValidScale) {
                    results.passed++;
                    results.tests.push({
                        name: `Canvas适配 - ${config.name}`,
                        passed: true,
                        details: `尺寸: ${dimensions.width}x${dimensions.height}, 缩放: ${scaleFactor.toFixed(2)}`
                    });
                    console.log(`✓ ${config.name}: 尺寸=${dimensions.width}x${dimensions.height}, 缩放=${scaleFactor.toFixed(2)}`);
                } else {
                    throw new Error(`无效的Canvas尺寸或缩放因子: ${dimensions.width}x${dimensions.height}, 缩放=${scaleFactor}`);
                }
                
            } catch (error) {
                results.failed++;
                results.tests.push({
                    name: `Canvas适配 - ${config.name}`,
                    passed: false,
                    error: error.message
                });
                console.log(`✗ ${config.name}: ${error.message}`);
            }
        });
        
        // 清理
        document.body.removeChild(container);
        
    } catch (error) {
        results.failed++;
        results.tests.push({
            name: 'Canvas尺寸适配测试',
            passed: false,
            error: error.message
        });
        console.log(`✗ Canvas尺寸适配测试失败: ${error.message}`);
    }
}

/**
 * 测试物理参数缩放
 */
function testPhysicsScaling(results) {
    try {
        const physicsEngine = PhysicsEngine.createDefault();
        
        TEST_CONFIGURATIONS.forEach(config => {
            try {
                // 设置缩放因子
                const expectedScale = config.expectedScale;
                physicsEngine.setScaleFactor(expectedScale);
                
                // 验证缩放因子设置
                const actualScale = physicsEngine.getScaleFactor();
                
                if (Math.abs(actualScale - expectedScale) < 0.01) {
                    results.passed++;
                    results.tests.push({
                        name: `物理缩放 - ${config.name}`,
                        passed: true,
                        details: `预期缩放: ${expectedScale}, 实际缩放: ${actualScale.toFixed(2)}`
                    });
                    console.log(`✓ ${config.name}: 物理缩放因子正确 (${actualScale.toFixed(2)})`);
                } else {
                    throw new Error(`缩放因子不匹配: 预期=${expectedScale}, 实际=${actualScale}`);
                }
                
            } catch (error) {
                results.failed++;
                results.tests.push({
                    name: `物理缩放 - ${config.name}`,
                    passed: false,
                    error: error.message
                });
                console.log(`✗ ${config.name}: ${error.message}`);
            }
        });
        
    } catch (error) {
        results.failed++;
        results.tests.push({
            name: '物理参数缩放测试',
            passed: false,
            error: error.message
        });
        console.log(`✗ 物理参数缩放测试失败: ${error.message}`);
    }
}

/**
 * 测试响应式断点
 */
function testResponsiveBreakpoints(results) {
    try {
        const breakpoints = [
            { name: 'Mobile', maxWidth: 480, expectedBehavior: 'mobile-optimized' },
            { name: 'Tablet', maxWidth: 768, expectedBehavior: 'tablet-optimized' },
            { name: 'Desktop', maxWidth: 1200, expectedBehavior: 'desktop-optimized' },
            { name: 'Large Desktop', maxWidth: 9999, expectedBehavior: 'large-desktop-optimized' }
        ];
        
        breakpoints.forEach(breakpoint => {
            try {
                // 模拟窗口宽度
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: breakpoint.maxWidth - 50
                });
                
                // 创建测试Canvas和Renderer
                const canvas = document.createElement('canvas');
                const container = document.createElement('div');
                container.style.width = (breakpoint.maxWidth - 50) + 'px';
                container.style.height = '600px';
                container.appendChild(canvas);
                document.body.appendChild(container);
                
                const renderer = new Renderer(canvas);
                renderer.updateCanvasSize();
                
                const dimensions = renderer.getDimensions();
                const scaleFactor = renderer.getScaleFactor();
                
                // 验证断点行为
                let isCorrectBehavior = false;
                
                if (breakpoint.name === 'Mobile' && dimensions.width <= 400) {
                    isCorrectBehavior = true;
                } else if (breakpoint.name === 'Tablet' && dimensions.width <= 600) {
                    isCorrectBehavior = true;
                } else if (breakpoint.name === 'Desktop' && dimensions.width <= 800) {
                    isCorrectBehavior = true;
                } else if (breakpoint.name === 'Large Desktop') {
                    isCorrectBehavior = true;
                }
                
                if (isCorrectBehavior) {
                    results.passed++;
                    results.tests.push({
                        name: `响应式断点 - ${breakpoint.name}`,
                        passed: true,
                        details: `Canvas尺寸: ${dimensions.width}x${dimensions.height}`
                    });
                    console.log(`✓ ${breakpoint.name}: 断点行为正确`);
                } else {
                    throw new Error(`断点行为不正确: Canvas尺寸=${dimensions.width}x${dimensions.height}`);
                }
                
                // 清理
                document.body.removeChild(container);
                
            } catch (error) {
                results.failed++;
                results.tests.push({
                    name: `响应式断点 - ${breakpoint.name}`,
                    passed: false,
                    error: error.message
                });
                console.log(`✗ ${breakpoint.name}: ${error.message}`);
            }
        });
        
    } catch (error) {
        results.failed++;
        results.tests.push({
            name: '响应式断点测试',
            passed: false,
            error: error.message
        });
        console.log(`✗ 响应式断点测试失败: ${error.message}`);
    }
}

/**
 * 测试高DPI屏幕支持
 */
function testHighDPISupport(results) {
    try {
        const dprValues = [1, 1.5, 2, 3];
        
        dprValues.forEach(dpr => {
            try {
                // 模拟不同的设备像素比
                Object.defineProperty(window, 'devicePixelRatio', {
                    writable: true,
                    configurable: true,
                    value: dpr
                });
                
                // 创建测试Canvas
                const canvas = document.createElement('canvas');
                const container = document.createElement('div');
                container.style.width = '400px';
                container.style.height = '400px';
                container.appendChild(canvas);
                document.body.appendChild(container);
                
                const renderer = new Renderer(canvas);
                renderer.updateCanvasSize();
                
                // 验证Canvas实际尺寸考虑了DPR
                const expectedWidth = 400 * dpr;
                const expectedHeight = 400 * dpr;
                
                const actualWidth = canvas.width;
                const actualHeight = canvas.height;
                
                // 允许一定的误差
                const widthMatch = Math.abs(actualWidth - expectedWidth) <= Math.max(1, expectedWidth * 0.1);
                const heightMatch = Math.abs(actualHeight - expectedHeight) <= Math.max(1, expectedHeight * 0.1);
                
                if (widthMatch && heightMatch) {
                    results.passed++;
                    results.tests.push({
                        name: `高DPI支持 - DPR ${dpr}`,
                        passed: true,
                        details: `Canvas实际尺寸: ${actualWidth}x${actualHeight}`
                    });
                    console.log(`✓ DPR ${dpr}: 高DPI支持正确 (${actualWidth}x${actualHeight})`);
                } else {
                    throw new Error(`高DPI尺寸不正确: 预期=${expectedWidth}x${expectedHeight}, 实际=${actualWidth}x${actualHeight}`);
                }
                
                // 清理
                document.body.removeChild(container);
                
            } catch (error) {
                results.failed++;
                results.tests.push({
                    name: `高DPI支持 - DPR ${dpr}`,
                    passed: false,
                    error: error.message
                });
                console.log(`✗ DPR ${dpr}: ${error.message}`);
            }
        });
        
    } catch (error) {
        results.failed++;
        results.tests.push({
            name: '高DPI屏幕支持测试',
            passed: false,
            error: error.message
        });
        console.log(`✗ 高DPI屏幕支持测试失败: ${error.message}`);
    }
}

/**
 * 测试不同屏幕尺寸下的性能
 */
function testPerformanceAcrossScreenSizes(results) {
    try {
        const performanceResults = [];
        
        TEST_CONFIGURATIONS.forEach(config => {
            try {
                // 创建测试环境
                const canvas = document.createElement('canvas');
                const container = document.createElement('div');
                container.style.width = config.width + 'px';
                container.style.height = config.height + 'px';
                container.appendChild(canvas);
                document.body.appendChild(container);
                
                // 创建游戏组件
                const renderer = new Renderer(canvas);
                const center = renderer.getCenter();
                const scaleFactor = renderer.getScaleFactor();
                
                const hexagon = new Hexagon(center.x, center.y, 100 * scaleFactor);
                const ball = Ball.createInsideHexagon(hexagon);
                const physicsEngine = PhysicsEngine.createDefault();
                physicsEngine.setScaleFactor(scaleFactor);
                
                // 性能测试
                const startTime = performance.now();
                const iterations = 100;
                
                for (let i = 0; i < iterations; i++) {
                    // 模拟游戏循环
                    physicsEngine.update(ball, hexagon, 0.016);
                    renderer.clear();
                    hexagon.render(renderer);
                    ball.render(renderer);
                }
                
                const endTime = performance.now();
                const totalTime = endTime - startTime;
                const avgFrameTime = totalTime / iterations;
                const estimatedFPS = 1000 / avgFrameTime;
                
                performanceResults.push({
                    config: config.name,
                    avgFrameTime: avgFrameTime,
                    estimatedFPS: estimatedFPS,
                    scaleFactor: scaleFactor
                });
                
                // 验证性能是否可接受
                const isAcceptablePerformance = estimatedFPS >= 30 && avgFrameTime <= 33.33;
                
                if (isAcceptablePerformance) {
                    results.passed++;
                    results.tests.push({
                        name: `性能测试 - ${config.name}`,
                        passed: true,
                        details: `FPS: ${estimatedFPS.toFixed(1)}, 帧时间: ${avgFrameTime.toFixed(2)}ms`
                    });
                    console.log(`✓ ${config.name}: 性能良好 (${estimatedFPS.toFixed(1)} FPS)`);
                } else {
                    throw new Error(`性能不足: FPS=${estimatedFPS.toFixed(1)}, 帧时间=${avgFrameTime.toFixed(2)}ms`);
                }
                
                // 清理
                document.body.removeChild(container);
                
            } catch (error) {
                results.failed++;
                results.tests.push({
                    name: `性能测试 - ${config.name}`,
                    passed: false,
                    error: error.message
                });
                console.log(`✗ ${config.name}: ${error.message}`);
            }
        });
        
        // 输出性能对比
        console.log('\n性能对比结果:');
        performanceResults.forEach(result => {
            console.log(`${result.config}: ${result.estimatedFPS.toFixed(1)} FPS (${result.avgFrameTime.toFixed(2)}ms, 缩放=${result.scaleFactor.toFixed(2)})`);
        });
        
    } catch (error) {
        results.failed++;
        results.tests.push({
            name: '性能测试',
            passed: false,
            error: error.message
        });
        console.log(`✗ 性能测试失败: ${error.message}`);
    }
}

/**
 * 验证响应式CSS规则
 */
function validateResponsiveCSS() {
    console.log('\n=== CSS响应式规则验证 ===');
    
    const breakpoints = [
        { name: 'Mobile', width: 480 },
        { name: 'Tablet', width: 768 },
        { name: 'Desktop', width: 1200 }
    ];
    
    breakpoints.forEach(breakpoint => {
        // 模拟媒体查询
        const mediaQuery = `(max-width: ${breakpoint.width}px)`;
        const matches = window.matchMedia(mediaQuery).matches;
        
        console.log(`${breakpoint.name} (${breakpoint.width}px): ${matches ? '匹配' : '不匹配'}`);
    });
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runResponsiveDesignTests,
        validateResponsiveCSS,
        TEST_CONFIGURATIONS
    };
}

// 浏览器环境下的全局函数
if (typeof window !== 'undefined') {
    window.runResponsiveDesignTests = runResponsiveDesignTests;
    window.validateResponsiveCSS = validateResponsiveCSS;
}