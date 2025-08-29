/**
 * 跨浏览器兼容性测试 - Cross-Browser Compatibility Test
 * 检测不同浏览器环境下的功能支持和性能表现
 */

class BrowserCompatibilityTest {
    constructor() {
        this.results = [];
        this.browserInfo = this.detectBrowser();
        this.deviceInfo = this.detectDevice();
    }

    // 检测浏览器信息
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const browserInfo = {
            userAgent: userAgent,
            name: 'Unknown',
            version: 'Unknown',
            engine: 'Unknown'
        };

        // 检测浏览器类型
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browserInfo.name = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            browserInfo.version = match ? match[1] : 'Unknown';
            browserInfo.engine = 'Blink';
        } else if (userAgent.includes('Firefox')) {
            browserInfo.name = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            browserInfo.version = match ? match[1] : 'Unknown';
            browserInfo.engine = 'Gecko';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserInfo.name = 'Safari';
            const match = userAgent.match(/Version\/(\d+)/);
            browserInfo.version = match ? match[1] : 'Unknown';
            browserInfo.engine = 'WebKit';
        } else if (userAgent.includes('Edg')) {
            browserInfo.name = 'Edge';
            const match = userAgent.match(/Edg\/(\d+)/);
            browserInfo.version = match ? match[1] : 'Unknown';
            browserInfo.engine = 'Blink';
        } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
            browserInfo.name = 'Opera';
            const match = userAgent.match(/(?:Opera|OPR)\/(\d+)/);
            browserInfo.version = match ? match[1] : 'Unknown';
            browserInfo.engine = 'Blink';
        }

        return browserInfo;
    }

    // 检测设备信息
    detectDevice() {
        return {
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
            deviceMemory: navigator.deviceMemory || 'Unknown',
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            }
        };
    }

    // 运行所有兼容性测试
    async runAllTests() {
        console.log('🌐 Starting Cross-Browser Compatibility Tests...\n');
        
        // 显示浏览器和设备信息
        this.displayEnvironmentInfo();
        
        const tests = [
            { name: 'HTML5 Canvas Support', test: this.testCanvasSupport.bind(this) },
            { name: 'Canvas 2D Context Features', test: this.testCanvas2DFeatures.bind(this) },
            { name: 'RequestAnimationFrame Support', test: this.testAnimationFrameSupport.bind(this) },
            { name: 'Performance API Support', test: this.testPerformanceAPI.bind(this) },
            { name: 'ES6+ Features Support', test: this.testES6Features.bind(this) },
            { name: 'Math Functions Accuracy', test: this.testMathFunctions.bind(this) },
            { name: 'Event Handling Support', test: this.testEventHandling.bind(this) },
            { name: 'Local Storage Support', test: this.testLocalStorage.bind(this) },
            { name: 'WebGL Support', test: this.testWebGLSupport.bind(this) },
            { name: 'High DPI Display Support', test: this.testHighDPISupport.bind(this) },
            { name: 'Touch Events Support', test: this.testTouchSupport.bind(this) },
            { name: 'Viewport Meta Tag Support', test: this.testViewportSupport.bind(this) }
        ];

        for (const test of tests) {
            try {
                console.log(`Testing ${test.name}...`);
                const result = await test.test();
                this.results.push(result);
                const status = result.passed ? '✓' : '❌';
                console.log(`  ${status} ${result.name}: ${result.message || 'OK'}`);
                
                if (result.details) {
                    console.log(`    Details: ${result.details}`);
                }
            } catch (error) {
                const result = { 
                    name: test.name, 
                    passed: false, 
                    error: error.message,
                    message: 'Test execution failed'
                };
                this.results.push(result);
                console.log(`  ❌ ${result.name}: ${error.message}`);
            }
        }

        this.generateCompatibilityReport();
        return this.results;
    }

    // 显示环境信息
    displayEnvironmentInfo() {
        console.log('📱 Environment Information:');
        console.log(`   Browser: ${this.browserInfo.name} ${this.browserInfo.version} (${this.browserInfo.engine})`);
        console.log(`   Platform: ${this.deviceInfo.platform}`);
        console.log(`   Language: ${this.deviceInfo.language}`);
        console.log(`   Screen: ${this.deviceInfo.screen.width}x${this.deviceInfo.screen.height} (${this.deviceInfo.screen.colorDepth}-bit)`);
        console.log(`   Viewport: ${this.deviceInfo.viewport.width}x${this.deviceInfo.viewport.height} (DPR: ${this.deviceInfo.viewport.devicePixelRatio})`);
        console.log(`   CPU Cores: ${this.deviceInfo.hardwareConcurrency}`);
        console.log(`   Device Memory: ${this.deviceInfo.deviceMemory}GB`);
        console.log('');
    }

    // Canvas支持测试
    testCanvasSupport() {
        const canvas = document.createElement('canvas');
        
        if (!canvas) {
            throw new Error('Cannot create canvas element');
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('2D context not supported');
        }

        // 测试基本绘制功能
        canvas.width = 100;
        canvas.height = 100;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(10, 10, 50, 50);
        
        ctx.strokeStyle = '#0000FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 30, 30);

        return {
            name: 'HTML5 Canvas Support',
            passed: true,
            message: 'Canvas and 2D context fully supported',
            details: `Canvas size: ${canvas.width}x${canvas.height}`
        };
    }

    // Canvas 2D功能测试
    testCanvas2DFeatures() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const features = [];
        const missingFeatures = [];

        // 测试各种2D功能
        const testFeatures = [
            { name: 'Path2D', test: () => typeof Path2D !== 'undefined' },
            { name: 'ImageData', test: () => typeof ImageData !== 'undefined' },
            { name: 'Gradients', test: () => typeof ctx.createLinearGradient === 'function' },
            { name: 'Patterns', test: () => typeof ctx.createPattern === 'function' },
            { name: 'Shadows', test: () => 'shadowColor' in ctx },
            { name: 'Compositing', test: () => 'globalCompositeOperation' in ctx },
            { name: 'Text Metrics', test: () => typeof ctx.measureText === 'function' },
            { name: 'Image Smoothing', test: () => 'imageSmoothingEnabled' in ctx },
            { name: 'Hit Regions', test: () => typeof ctx.addHitRegion === 'function' },
            { name: 'Focus Management', test: () => typeof ctx.drawFocusIfNeeded === 'function' }
        ];

        testFeatures.forEach(feature => {
            try {
                if (feature.test()) {
                    features.push(feature.name);
                } else {
                    missingFeatures.push(feature.name);
                }
            } catch (error) {
                missingFeatures.push(feature.name);
            }
        });

        return {
            name: 'Canvas 2D Context Features',
            passed: features.length >= 6, // 至少支持6个基本功能
            message: `${features.length}/${testFeatures.length} features supported`,
            details: `Supported: ${features.join(', ')}${missingFeatures.length > 0 ? ` | Missing: ${missingFeatures.join(', ')}` : ''}`
        };
    }

    // RequestAnimationFrame支持测试
    testAnimationFrameSupport() {
        const hasRAF = typeof requestAnimationFrame === 'function';
        const hasCAF = typeof cancelAnimationFrame === 'function';
        
        if (!hasRAF) {
            throw new Error('requestAnimationFrame not supported');
        }
        
        if (!hasCAF) {
            throw new Error('cancelAnimationFrame not supported');
        }

        // 测试RAF的实际工作
        return new Promise((resolve) => {
            const startTime = performance.now();
            requestAnimationFrame((timestamp) => {
                const endTime = performance.now();
                const frameDuration = endTime - startTime;
                
                resolve({
                    name: 'RequestAnimationFrame Support',
                    passed: true,
                    message: 'RAF and CAF fully supported',
                    details: `Frame callback delay: ${frameDuration.toFixed(2)}ms`
                });
            });
        });
    }

    // Performance API测试
    testPerformanceAPI() {
        const features = [];
        const missingFeatures = [];

        const testFeatures = [
            { name: 'performance.now()', test: () => typeof performance.now === 'function' },
            { name: 'performance.mark()', test: () => typeof performance.mark === 'function' },
            { name: 'performance.measure()', test: () => typeof performance.measure === 'function' },
            { name: 'performance.memory', test: () => 'memory' in performance },
            { name: 'performance.navigation', test: () => 'navigation' in performance },
            { name: 'performance.timing', test: () => 'timing' in performance },
            { name: 'PerformanceObserver', test: () => typeof PerformanceObserver !== 'undefined' }
        ];

        testFeatures.forEach(feature => {
            try {
                if (feature.test()) {
                    features.push(feature.name);
                } else {
                    missingFeatures.push(feature.name);
                }
            } catch (error) {
                missingFeatures.push(feature.name);
            }
        });

        // 测试performance.now()的精度
        let precision = 'Unknown';
        if (typeof performance.now === 'function') {
            const start = performance.now();
            const end = performance.now();
            precision = `${(end - start).toFixed(6)}ms resolution`;
        }

        return {
            name: 'Performance API Support',
            passed: features.length >= 3, // 至少支持基本功能
            message: `${features.length}/${testFeatures.length} features supported`,
            details: `${features.join(', ')} | Precision: ${precision}`
        };
    }

    // ES6+特性测试
    testES6Features() {
        const features = [];
        const missingFeatures = [];

        const testFeatures = [
            { 
                name: 'Classes', 
                test: () => {
                    try {
                        eval('class TestClass {}');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            { 
                name: 'Arrow Functions', 
                test: () => {
                    try {
                        eval('(() => {})');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            { 
                name: 'Template Literals', 
                test: () => {
                    try {
                        eval('`template`');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            { 
                name: 'Destructuring', 
                test: () => {
                    try {
                        eval('const {a} = {a: 1}');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            { 
                name: 'Promises', 
                test: () => typeof Promise !== 'undefined'
            },
            { 
                name: 'Async/Await', 
                test: () => {
                    try {
                        eval('async function test() { await Promise.resolve(); }');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            { 
                name: 'Modules', 
                test: () => {
                    try {
                        return 'import' in window || typeof module !== 'undefined';
                    } catch (e) {
                        return false;
                    }
                }
            },
            { 
                name: 'Map/Set', 
                test: () => typeof Map !== 'undefined' && typeof Set !== 'undefined'
            }
        ];

        testFeatures.forEach(feature => {
            try {
                if (feature.test()) {
                    features.push(feature.name);
                } else {
                    missingFeatures.push(feature.name);
                }
            } catch (error) {
                missingFeatures.push(feature.name);
            }
        });

        return {
            name: 'ES6+ Features Support',
            passed: features.length >= 6, // 至少支持大部分ES6特性
            message: `${features.length}/${testFeatures.length} features supported`,
            details: `Supported: ${features.join(', ')}${missingFeatures.length > 0 ? ` | Missing: ${missingFeatures.join(', ')}` : ''}`
        };
    }

    // 数学函数精度测试
    testMathFunctions() {
        const tests = [
            { name: 'Math.sin', func: Math.sin, input: Math.PI / 2, expected: 1, tolerance: 1e-10 },
            { name: 'Math.cos', func: Math.cos, input: 0, expected: 1, tolerance: 1e-10 },
            { name: 'Math.tan', func: Math.tan, input: Math.PI / 4, expected: 1, tolerance: 1e-10 },
            { name: 'Math.sqrt', func: Math.sqrt, input: 16, expected: 4, tolerance: 1e-10 },
            { name: 'Math.pow', func: Math.pow, input: [2, 3], expected: 8, tolerance: 1e-10 },
            { name: 'Math.abs', func: Math.abs, input: -5, expected: 5, tolerance: 0 }
        ];

        const results = [];
        let passed = 0;

        tests.forEach(test => {
            try {
                const input = Array.isArray(test.input) ? test.input : [test.input];
                const result = test.func.apply(Math, input);
                const diff = Math.abs(result - test.expected);
                
                if (diff <= test.tolerance) {
                    results.push(`${test.name}: OK`);
                    passed++;
                } else {
                    results.push(`${test.name}: FAIL (${result} vs ${test.expected})`);
                }
            } catch (error) {
                results.push(`${test.name}: ERROR (${error.message})`);
            }
        });

        return {
            name: 'Math Functions Accuracy',
            passed: passed === tests.length,
            message: `${passed}/${tests.length} functions accurate`,
            details: results.join(', ')
        };
    }

    // 事件处理测试
    testEventHandling() {
        const features = [];
        const testElement = document.createElement('div');

        // 测试各种事件支持
        const eventTests = [
            'click', 'mousedown', 'mouseup', 'mousemove',
            'touchstart', 'touchmove', 'touchend',
            'keydown', 'keyup', 'resize', 'scroll'
        ];

        eventTests.forEach(eventType => {
            try {
                const event = new Event(eventType);
                if (event.type === eventType) {
                    features.push(eventType);
                }
            } catch (error) {
                // Event type not supported
            }
        });

        // 测试addEventListener
        const hasAddEventListener = typeof testElement.addEventListener === 'function';
        const hasRemoveEventListener = typeof testElement.removeEventListener === 'function';

        return {
            name: 'Event Handling Support',
            passed: hasAddEventListener && hasRemoveEventListener && features.length >= 8,
            message: `Event system functional, ${features.length} event types supported`,
            details: `addEventListener: ${hasAddEventListener}, removeEventListener: ${hasRemoveEventListener}`
        };
    }

    // Local Storage测试
    testLocalStorage() {
        try {
            const testKey = 'browserCompatibilityTest';
            const testValue = 'testValue123';
            
            // 测试写入
            localStorage.setItem(testKey, testValue);
            
            // 测试读取
            const retrievedValue = localStorage.getItem(testKey);
            
            // 测试删除
            localStorage.removeItem(testKey);
            
            const isWorking = retrievedValue === testValue;
            
            return {
                name: 'Local Storage Support',
                passed: isWorking,
                message: isWorking ? 'Local Storage fully functional' : 'Local Storage not working correctly',
                details: `Read/Write test: ${isWorking ? 'PASS' : 'FAIL'}`
            };
        } catch (error) {
            return {
                name: 'Local Storage Support',
                passed: false,
                message: 'Local Storage not available',
                details: error.message
            };
        }
    }

    // WebGL支持测试
    testWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                throw new Error('WebGL not supported');
            }

            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            const version = gl.getParameter(gl.VERSION);

            return {
                name: 'WebGL Support',
                passed: true,
                message: 'WebGL supported',
                details: `${vendor} ${renderer}, ${version}`
            };
        } catch (error) {
            return {
                name: 'WebGL Support',
                passed: false,
                message: 'WebGL not available',
                details: error.message
            };
        }
    }

    // 高DPI显示支持测试
    testHighDPISupport() {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 测试Canvas高DPI支持
        canvas.width = 100 * dpr;
        canvas.height = 100 * dpr;
        canvas.style.width = '100px';
        canvas.style.height = '100px';
        
        ctx.scale(dpr, dpr);
        
        const isHighDPI = dpr > 1;
        const supportsScaling = typeof ctx.scale === 'function';

        return {
            name: 'High DPI Display Support',
            passed: supportsScaling,
            message: `Device Pixel Ratio: ${dpr}${isHighDPI ? ' (High DPI)' : ' (Standard DPI)'}`,
            details: `Canvas scaling: ${supportsScaling ? 'Supported' : 'Not supported'}`
        };
    }

    // 触摸事件支持测试
    testTouchSupport() {
        const hasTouchEvents = 'ontouchstart' in window;
        const hasPointerEvents = 'onpointerdown' in window;
        const hasTouchAPI = 'TouchEvent' in window;
        
        const touchFeatures = [];
        if (hasTouchEvents) touchFeatures.push('Touch Events');
        if (hasPointerEvents) touchFeatures.push('Pointer Events');
        if (hasTouchAPI) touchFeatures.push('Touch API');

        return {
            name: 'Touch Events Support',
            passed: hasTouchEvents || hasPointerEvents,
            message: touchFeatures.length > 0 ? `${touchFeatures.join(', ')} supported` : 'No touch support detected',
            details: `Touch Events: ${hasTouchEvents}, Pointer Events: ${hasPointerEvents}, Touch API: ${hasTouchAPI}`
        };
    }

    // Viewport支持测试
    testViewportSupport() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const hasViewportMeta = !!viewportMeta;
        
        const visualViewport = 'visualViewport' in window;
        const innerWidth = typeof window.innerWidth === 'number';
        const innerHeight = typeof window.innerHeight === 'number';

        return {
            name: 'Viewport Meta Tag Support',
            passed: innerWidth && innerHeight,
            message: `Viewport dimensions available: ${window.innerWidth}x${window.innerHeight}`,
            details: `Meta tag: ${hasViewportMeta}, Visual Viewport API: ${visualViewport}`
        };
    }

    // 生成兼容性报告
    generateCompatibilityReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🌐 BROWSER COMPATIBILITY REPORT');
        console.log('='.repeat(60));

        const passedTests = this.results.filter(r => r.passed).length;
        const totalTests = this.results.length;
        const compatibilityScore = ((passedTests / totalTests) * 100).toFixed(1);

        console.log(`\n📊 Compatibility Score: ${compatibilityScore}% (${passedTests}/${totalTests} tests passed)\n`);

        // 按类别分组显示结果
        const categories = {
            'Core Features': ['HTML5 Canvas Support', 'Canvas 2D Context Features', 'RequestAnimationFrame Support'],
            'JavaScript Support': ['ES6+ Features Support', 'Math Functions Accuracy', 'Performance API Support'],
            'Device Features': ['High DPI Display Support', 'Touch Events Support', 'Viewport Meta Tag Support'],
            'Storage & Events': ['Local Storage Support', 'Event Handling Support'],
            'Graphics': ['WebGL Support']
        };

        Object.entries(categories).forEach(([category, testNames]) => {
            console.log(`📋 ${category}:`);
            testNames.forEach(testName => {
                const result = this.results.find(r => r.name === testName);
                if (result) {
                    const status = result.passed ? '✅' : '❌';
                    console.log(`   ${status} ${result.name}`);
                    if (result.details) {
                        console.log(`      ${result.details}`);
                    }
                }
            });
            console.log('');
        });

        // 兼容性建议
        console.log('💡 Compatibility Recommendations:');
        
        if (compatibilityScore >= 90) {
            console.log('   ✅ Excellent browser compatibility! All major features supported.');
        } else if (compatibilityScore >= 75) {
            console.log('   ⚠️  Good compatibility with minor limitations.');
        } else if (compatibilityScore >= 50) {
            console.log('   ⚠️  Moderate compatibility. Some features may not work optimally.');
        } else {
            console.log('   ❌ Poor compatibility. Consider using a modern browser.');
        }

        // 特定建议
        const failedTests = this.results.filter(r => !r.passed);
        if (failedTests.length > 0) {
            console.log('\n🔧 Specific Issues:');
            failedTests.forEach(test => {
                console.log(`   • ${test.name}: ${test.message || test.error}`);
            });
        }

        console.log('='.repeat(60));
    }

    // 获取测试结果
    getResults() {
        return {
            browserInfo: this.browserInfo,
            deviceInfo: this.deviceInfo,
            testResults: this.results,
            compatibilityScore: (this.results.filter(r => r.passed).length / this.results.length * 100).toFixed(1)
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibilityTest;
}