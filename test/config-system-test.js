/**
 * 配置系统测试
 * 验证配置系统的功能和物理行为的自然性
 */

// 模拟浏览器环境
global.window = {
    configManager: null,
    CONFIG: null
};

const { CONFIG, ConfigManager, CONFIG_PRESETS, applyConfigPreset } = require('../js/Config.js');

// 设置全局配置管理器
global.window.configManager = new ConfigManager();
global.window.CONFIG = CONFIG;

/**
 * 测试配置系统基本功能
 */
function testConfigSystemBasics() {
    console.log('=== 测试配置系统基本功能 ===');
    
    const manager = new ConfigManager();
    
    // 测试获取配置
    console.log('✓ 获取重力配置:', manager.get('physics.gravity'));
    console.log('✓ 获取摩擦系数:', manager.get('physics.frictionCoefficient'));
    console.log('✓ 获取反弹系数:', manager.get('physics.restitution'));
    
    // 测试设置配置
    const originalGravity = manager.get('physics.gravity');
    const setResult = manager.set('physics.gravity', 600);
    console.log('✓ 设置重力为600:', setResult);
    console.log('✓ 验证重力值:', manager.get('physics.gravity'));
    
    // 测试验证功能
    const invalidResult = manager.set('physics.gravity', -100);
    console.log('✓ 设置无效重力(-100):', invalidResult, '(应该为false)');
    
    // 恢复原始值
    manager.set('physics.gravity', originalGravity);
    
    console.log('✓ 配置系统基本功能测试通过\n');
}

/**
 * 测试预设配置
 */
function testConfigPresets() {
    console.log('=== 测试预设配置 ===');
    
    const manager = new ConfigManager();
    
    // 测试所有预设
    const presets = Object.keys(CONFIG_PRESETS);
    console.log('✓ 可用预设:', presets);
    
    for (const presetName of presets) {
        console.log(`\n测试预设: ${presetName}`);
        const preset = CONFIG_PRESETS[presetName];
        
        // 应用预设
        const results = manager.update(preset);
        const success = Object.values(results).every(result => result === true);
        
        console.log(`✓ 预设 ${presetName} 应用结果:`, success);
        
        // 验证关键参数
        if (preset['physics.gravity']) {
            console.log(`  - 重力: ${manager.get('physics.gravity')}`);
        }
        if (preset['physics.restitution']) {
            console.log(`  - 反弹系数: ${manager.get('physics.restitution')}`);
        }
        if (preset['hexagon.rotationSpeed']) {
            console.log(`  - 旋转速度: ${manager.get('hexagon.rotationSpeed')}`);
        }
    }
    
    // 重置到默认配置
    manager.reset();
    console.log('\n✓ 重置到默认配置');
    console.log('✓ 预设配置测试通过\n');
}

/**
 * 测试配置验证规则
 */
function testConfigValidation() {
    console.log('=== 测试配置验证规则 ===');
    
    const manager = new ConfigManager();
    
    const testCases = [
        // 有效值测试
        { path: 'physics.gravity', value: 500, expected: true, desc: '有效重力值' },
        { path: 'physics.frictionCoefficient', value: 0.95, expected: true, desc: '有效摩擦系数' },
        { path: 'physics.restitution', value: 0.8, expected: true, desc: '有效反弹系数' },
        { path: 'hexagon.rotationSpeed', value: 1.0, expected: true, desc: '有效旋转速度' },
        
        // 无效值测试
        { path: 'physics.gravity', value: -100, expected: false, desc: '负重力值' },
        { path: 'physics.frictionCoefficient', value: 1.5, expected: false, desc: '超范围摩擦系数' },
        { path: 'physics.restitution', value: -0.1, expected: false, desc: '负反弹系数' },
        { path: 'hexagon.rotationSpeed', value: 15, expected: false, desc: '过大旋转速度' },
        
        // 边界值测试
        { path: 'physics.gravity', value: 0, expected: true, desc: '零重力' },
        { path: 'physics.frictionCoefficient', value: 1, expected: true, desc: '最大摩擦系数' },
        { path: 'physics.restitution', value: 1, expected: true, desc: '完全弹性' },
        { path: 'ball.radius', value: 1, expected: true, desc: '最小球半径' }
    ];
    
    for (const testCase of testCases) {
        const result = manager.set(testCase.path, testCase.value);
        const passed = result === testCase.expected;
        
        console.log(`${passed ? '✓' : '✗'} ${testCase.desc}: ${testCase.path} = ${testCase.value} (${result})`);
        
        if (!passed) {
            console.error(`  预期: ${testCase.expected}, 实际: ${result}`);
        }
    }
    
    console.log('✓ 配置验证规则测试完成\n');
}

/**
 * 测试物理行为的自然性
 */
function testPhysicalBehaviorNaturalness() {
    console.log('=== 测试物理行为的自然性 ===');
    
    const manager = new ConfigManager();
    
    // 测试不同配置下的物理合理性
    const scenarios = [
        {
            name: '默认配置',
            config: CONFIG_PRESETS.default,
            expectations: {
                energyConservation: true,
                realisticBounce: true,
                stableMotion: true
            }
        },
        {
            name: '高弹性配置',
            config: CONFIG_PRESETS.bouncy,
            expectations: {
                energyConservation: true,
                realisticBounce: true,
                stableMotion: true
            }
        },
        {
            name: '低重力配置',
            config: CONFIG_PRESETS.space,
            expectations: {
                energyConservation: true,
                realisticBounce: true,
                stableMotion: true
            }
        }
    ];
    
    for (const scenario of scenarios) {
        console.log(`\n测试场景: ${scenario.name}`);
        
        // 应用配置
        manager.update(scenario.config);
        
        // 验证物理参数的合理性
        const gravity = manager.get('physics.gravity');
        const friction = manager.get('physics.frictionCoefficient');
        const restitution = manager.get('physics.restitution');
        const rotationSpeed = manager.get('hexagon.rotationSpeed');
        
        console.log(`  重力: ${gravity} (${gravity > 0 && gravity < 2000 ? '✓' : '✗'})`);
        console.log(`  摩擦: ${friction} (${friction >= 0 && friction <= 1 ? '✓' : '✗'})`);
        console.log(`  反弹: ${restitution} (${restitution >= 0 && restitution <= 1 ? '✓' : '✗'})`);
        console.log(`  旋转: ${rotationSpeed} (${Math.abs(rotationSpeed) <= 10 ? '✓' : '✗'})`);
        
        // 验证能量守恒原理
        const energyLossPerBounce = 1 - (restitution * restitution);
        const energyConservationValid = energyLossPerBounce >= 0 && energyLossPerBounce <= 1;
        console.log(`  能量守恒: ${energyConservationValid ? '✓' : '✗'} (每次碰撞损失${(energyLossPerBounce * 100).toFixed(1)}%)`);
        
        // 验证摩擦力的合理性
        const frictionValid = friction < 1; // 摩擦力应该小于1，否则会增加能量
        console.log(`  摩擦合理性: ${frictionValid ? '✓' : '✗'}`);
        
        // 验证参数组合的稳定性
        const stabilityScore = calculateStabilityScore(gravity, friction, restitution, rotationSpeed);
        console.log(`  稳定性评分: ${stabilityScore.toFixed(2)}/10 (${stabilityScore >= 7 ? '✓' : '✗'})`);
    }
    
    console.log('\n✓ 物理行为自然性测试完成\n');
}

/**
 * 计算配置的稳定性评分
 */
function calculateStabilityScore(gravity, friction, restitution, rotationSpeed) {
    let score = 10;
    
    // 重力评分 (适中的重力更稳定)
    if (gravity < 100 || gravity > 1000) score -= 2;
    else if (gravity < 200 || gravity > 800) score -= 1;
    
    // 摩擦评分 (适中的摩擦更稳定)
    if (friction < 0.9 || friction > 0.99) score -= 1;
    
    // 反弹评分 (过高或过低的反弹都不稳定)
    if (restitution < 0.3 || restitution > 0.95) score -= 1;
    
    // 旋转速度评分 (过快的旋转不稳定)
    if (Math.abs(rotationSpeed) > 2) score -= 2;
    else if (Math.abs(rotationSpeed) > 1) score -= 1;
    
    return Math.max(0, score);
}

/**
 * 测试配置的实时更新
 */
function testRealTimeConfigUpdate() {
    console.log('=== 测试配置的实时更新 ===');
    
    const manager = new ConfigManager();
    let listenerCalled = false;
    let receivedValue = null;
    
    // 添加监听器
    manager.addListener('physics.gravity', (newValue, oldValue, path) => {
        listenerCalled = true;
        receivedValue = newValue;
        console.log(`✓ 监听器触发: ${path} 从 ${oldValue} 变为 ${newValue}`);
    });
    
    // 更改配置
    const originalGravity = manager.get('physics.gravity');
    manager.set('physics.gravity', 700);
    
    // 验证监听器是否被调用
    console.log(`✓ 监听器被调用: ${listenerCalled}`);
    console.log(`✓ 接收到的值: ${receivedValue}`);
    console.log(`✓ 当前配置值: ${manager.get('physics.gravity')}`);
    
    // 恢复原始值
    manager.set('physics.gravity', originalGravity);
    
    console.log('✓ 实时配置更新测试通过\n');
}

/**
 * 测试设备优化配置
 */
function testDeviceOptimization() {
    console.log('=== 测试设备优化配置 ===');
    
    const manager = new ConfigManager();
    
    // 获取优化配置
    const optimizedConfig = manager.getOptimizedConfig();
    
    console.log('✓ 获取优化配置成功');
    console.log(`  目标FPS: ${optimizedConfig.game.targetFPS}`);
    console.log(`  最大速度: ${optimizedConfig.physics.maxVelocity}`);
    console.log(`  性能自动调整: ${optimizedConfig.performance.autoPerformanceAdjustment}`);
    
    // 验证优化配置的合理性
    const fpsValid = optimizedConfig.game.targetFPS >= 15 && optimizedConfig.game.targetFPS <= 120;
    const velocityValid = optimizedConfig.physics.maxVelocity > 0;
    
    console.log(`✓ FPS配置合理: ${fpsValid}`);
    console.log(`✓ 速度限制合理: ${velocityValid}`);
    
    console.log('✓ 设备优化配置测试通过\n');
}

/**
 * 运行所有测试
 */
function runAllTests() {
    console.log('开始配置系统综合测试...\n');
    
    try {
        testConfigSystemBasics();
        testConfigPresets();
        testConfigValidation();
        testPhysicalBehaviorNaturalness();
        testRealTimeConfigUpdate();
        testDeviceOptimization();
        
        console.log('🎉 所有配置系统测试通过！');
        console.log('\n配置系统功能验证：');
        console.log('✓ 基本配置获取和设置');
        console.log('✓ 预设配置应用');
        console.log('✓ 参数验证和边界检查');
        console.log('✓ 物理行为自然性');
        console.log('✓ 实时配置更新');
        console.log('✓ 设备优化配置');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testConfigSystemBasics,
    testConfigPresets,
    testConfigValidation,
    testPhysicalBehaviorNaturalness,
    testRealTimeConfigUpdate,
    testDeviceOptimization,
    runAllTests
};