/**
 * Game class unit tests
 * 测试Game主控制器的功能
 */

// Mock DOM elements for testing
function setupMockDOM() {
    // Create mock canvas element
    const mockCanvas = {
        id: 'physics-canvas',
        getContext: () => ({
            scale: () => {},
            clearRect: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fillText: () => {},
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        }),
        parentElement: {
            getBoundingClientRect: () => ({
                width: 800,
                height: 600
            })
        },
        style: {},
        width: 800,
        height: 600
    };
    
    // Mock document.getElementById
    global.document = {
        getElementById: (id) => {
            if (id === 'physics-canvas') return mockCanvas;
            if (id === 'reset-btn') return { addEventListener: () => {} };
            if (id === 'pause-btn') return { addEventListener: () => {} };
            return null;
        },
        addEventListener: () => {}
    };
    
    // Mock window
    global.window = {
        devicePixelRatio: 1,
        addEventListener: () => {},
        removeEventListener: () => {},
        requestAnimationFrame: (callback) => {
            setTimeout(() => callback(performance.now()), 16);
            return 1;
        },
        cancelAnimationFrame: () => {}
    };
    
    // Mock performance
    global.performance = {
        now: () => Date.now()
    };
    
    return mockCanvas;
}

describe('Game Class', () => {
    let mockCanvas;
    
    beforeEach(() => {
        mockCanvas = setupMockDOM();
    });
    
    afterEach(() => {
        // Clean up
        delete global.document;
        delete global.window;
        delete global.performance;
    });

    test('should create Game instance successfully', () => {
        expect(() => {
            const game = new Game('physics-canvas');
            expect(game).toBeDefined();
            expect(game.isRunning).toBe(false);
            expect(game.isPaused).toBe(false);
        }).not.toThrow();
    });

    test('should initialize components correctly', () => {
        const game = new Game('physics-canvas');
        
        expect(game.renderer).toBeDefined();
        expect(game.hexagon).toBeDefined();
        expect(game.ball).toBeDefined();
        expect(game.physicsEngine).toBeDefined();
        expect(game.performanceMonitor).toBeDefined();
    });

    test('should handle game state transitions', () => {
        const game = new Game('physics-canvas');
        
        // Initial state
        expect(game.isRunning).toBe(false);
        expect(game.isPaused).toBe(false);
        
        // Start game
        game.start();
        expect(game.isRunning).toBe(true);
        expect(game.isPaused).toBe(false);
        
        // Pause game
        game.togglePause();
        expect(game.isRunning).toBe(true);
        expect(game.isPaused).toBe(true);
        
        // Resume game
        game.togglePause();
        expect(game.isRunning).toBe(true);
        expect(game.isPaused).toBe(false);
        
        // Stop game
        game.stop();
        expect(game.isRunning).toBe(false);
        expect(game.isPaused).toBe(false);
    });

    test('should reset game state correctly', () => {
        const game = new Game('physics-canvas');
        game.start();
        
        // Modify game state
        game.hexagon.rotation = Math.PI / 2;
        game.ball.setVelocity(100, 100);
        
        // Reset
        game.reset();
        
        // Check reset state
        expect(game.hexagon.rotation).toBe(0);
        expect(game.ball.velocity.magnitude()).toBeGreaterThan(0); // Should have initial velocity
    });

    test('should handle configuration updates', () => {
        const game = new Game('physics-canvas', {
            enableDebug: false,
            targetFPS: 30
        });
        
        expect(game.config.enableDebug).toBe(false);
        expect(game.config.targetFPS).toBe(30);
        
        // Update config
        game.setConfig({ enableDebug: true, targetFPS: 60 });
        
        expect(game.config.enableDebug).toBe(true);
        expect(game.config.targetFPS).toBe(60);
    });

    test('should provide game state information', () => {
        const game = new Game('physics-canvas');
        game.start();
        
        const gameState = game.getGameState();
        
        expect(gameState).toHaveProperty('isRunning');
        expect(gameState).toHaveProperty('isPaused');
        expect(gameState).toHaveProperty('fps');
        expect(gameState).toHaveProperty('frameTime');
        expect(gameState).toHaveProperty('ballPosition');
        expect(gameState).toHaveProperty('ballVelocity');
        expect(gameState).toHaveProperty('hexagonRotation');
        expect(gameState).toHaveProperty('totalEnergy');
        
        expect(gameState.isRunning).toBe(true);
        expect(gameState.ballPosition).toBeDefined();
        expect(gameState.ballVelocity).toBeDefined();
    });

    test('should handle errors gracefully', () => {
        const game = new Game('physics-canvas');
        
        // Mock console.error to capture error handling
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Simulate an error in update
        const originalUpdate = game.update;
        game.update = () => {
            throw new Error('Test error');
        };
        
        // This should not crash the game
        expect(() => {
            game.start();
            // Simulate one frame
            game.gameLoop(performance.now());
        }).not.toThrow();
        
        // Restore original method
        game.update = originalUpdate;
        consoleSpy.mockRestore();
    });

    test('should clean up resources on destroy', () => {
        const game = new Game('physics-canvas');
        game.start();
        
        // Destroy game
        game.destroy();
        
        expect(game.renderer).toBeNull();
        expect(game.hexagon).toBeNull();
        expect(game.ball).toBeNull();
        expect(game.physicsEngine).toBeNull();
        expect(game.performanceMonitor).toBeNull();
        expect(game.isRunning).toBe(false);
    });
});

describe('PerformanceMonitor Class', () => {
    test('should create PerformanceMonitor instance', () => {
        const monitor = new PerformanceMonitor();
        
        expect(monitor).toBeDefined();
        expect(monitor.getFPS()).toBe(0);
        expect(monitor.getAverageFrameTime()).toBe(0);
    });

    test('should track FPS correctly', (done) => {
        const monitor = new PerformanceMonitor();
        let startTime = performance.now();
        
        // Simulate multiple frames
        const simulateFrames = (count) => {
            if (count <= 0) {
                // Check FPS after simulation
                const fps = monitor.getFPS();
                expect(fps).toBeGreaterThanOrEqual(0);
                done();
                return;
            }
            
            setTimeout(() => {
                monitor.update(performance.now());
                simulateFrames(count - 1);
            }, 16); // ~60 FPS
        };
        
        simulateFrames(10);
    });

    test('should calculate frame times correctly', () => {
        const monitor = new PerformanceMonitor();
        
        let time = 1000;
        monitor.update(time);
        
        time += 16.67; // ~60 FPS
        monitor.update(time);
        
        time += 16.67;
        monitor.update(time);
        
        const avgFrameTime = monitor.getAverageFrameTime();
        expect(avgFrameTime).toBeCloseTo(16.67, 1);
    });

    test('should reset correctly', () => {
        const monitor = new PerformanceMonitor();
        
        // Add some data
        monitor.update(1000);
        monitor.update(1016);
        monitor.update(1032);
        
        // Reset
        monitor.reset();
        
        expect(monitor.getFPS()).toBe(0);
        expect(monitor.getAverageFrameTime()).toBe(0);
        expect(monitor.getMaxFrameTime()).toBe(0);
        expect(monitor.getMinFrameTime()).toBe(0);
    });

    test('should detect performance issues', () => {
        const monitor = new PerformanceMonitor();
        
        // Simulate good performance
        let time = 1000;
        for (let i = 0; i < 60; i++) {
            monitor.update(time);
            time += 16.67; // 60 FPS
        }
        
        // Should indicate good performance
        expect(monitor.isPerformanceGood()).toBe(true);
        
        // Reset and simulate poor performance
        monitor.reset();
        time = 1000;
        for (let i = 0; i < 30; i++) {
            monitor.update(time);
            time += 50; // 20 FPS
        }
        
        // Should indicate poor performance
        expect(monitor.isPerformanceGood()).toBe(false);
    });
});

// Run tests if this file is executed directly
if (require.main === module) {
    console.log('Running Game class tests...');
    
    // Simple test runner
    const tests = [
        () => {
            console.log('Testing Game class instantiation...');
            setupMockDOM();
            const game = new Game('physics-canvas');
            console.log('✓ Game class instantiation test passed');
        },
        
        () => {
            console.log('Testing PerformanceMonitor...');
            const monitor = new PerformanceMonitor();
            monitor.update(1000);
            monitor.update(1016);
            console.log('✓ PerformanceMonitor test passed');
        }
    ];
    
    tests.forEach((test, index) => {
        try {
            test();
        } catch (error) {
            console.error(`✗ Test ${index + 1} failed:`, error.message);
        }
    });
    
    console.log('Game class tests completed!');
}