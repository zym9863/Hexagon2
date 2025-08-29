/**
 * Test runner for Ball class
 * 运行小球类的基础测试
 */

// Mock Vector2D class for Node.js environment
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
    
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }
    
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / mag, this.y / mag);
    }
    
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    
    clone() {
        return new Vector2D(this.x, this.y);
    }
    
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
}

// Load required classes
const fs = require('fs');
const path = require('path');

// Read and evaluate Hexagon.js (needed for Ball.createInsideHexagon)
const hexagonCode = fs.readFileSync(path.join(__dirname, '../js/Hexagon.js'), 'utf8');
eval(hexagonCode);

// Read and evaluate Ball.js
try {
    const ballCode = fs.readFileSync(path.join(__dirname, '../js/Ball.js'), 'utf8');
    eval(ballCode);
    console.log('Ball.js loaded successfully');
} catch (error) {
    console.error('Error loading Ball.js:', error.message);
    process.exit(1);
}

// Test functions
function testBallCreation() {
    console.log('Testing Ball creation...');
    
    const ball = new Ball(10, 20, 5, 2);
    
    console.assert(ball.position.x === 10, 'Position X should be 10');
    console.assert(ball.position.y === 20, 'Position Y should be 20');
    console.assert(ball.radius === 5, 'Radius should be 5');
    console.assert(ball.mass === 2, 'Mass should be 2');
    console.assert(ball.velocity.x === 0, 'Initial velocity X should be 0');
    console.assert(ball.velocity.y === 0, 'Initial velocity Y should be 0');
    console.assert(ball.acceleration.x === 0, 'Initial acceleration X should be 0');
    console.assert(ball.acceleration.y === 0, 'Initial acceleration Y should be 0');
    
    console.log('✓ Ball creation test passed');
}

function testSetPositionAndVelocity() {
    console.log('Testing set position and velocity...');
    
    const ball = new Ball(0, 0, 10, 1);
    
    ball.setPosition(30, 40);
    console.assert(ball.position.x === 30, 'Position X should be updated to 30');
    console.assert(ball.position.y === 40, 'Position Y should be updated to 40');
    
    ball.setVelocity(50, -25);
    console.assert(ball.velocity.x === 50, 'Velocity X should be 50');
    console.assert(ball.velocity.y === -25, 'Velocity Y should be -25');
    
    console.log('✓ Set position and velocity test passed');
}

function testApplyForce() {
    console.log('Testing apply force...');
    
    const ball = new Ball(0, 0, 10, 2); // mass = 2
    const initialAcceleration = ball.acceleration.clone();
    
    const force = new Vector2D(20, 40);
    ball.applyForce(force);
    
    // F = ma, so a = F/m = (20, 40) / 2 = (10, 20)
    const expectedAccX = initialAcceleration.x + 10;
    const expectedAccY = initialAcceleration.y + 20;
    
    console.assert(Math.abs(ball.acceleration.x - expectedAccX) < 0.001, 
        `Acceleration X should be ${expectedAccX}, got ${ball.acceleration.x}`);
    console.assert(Math.abs(ball.acceleration.y - expectedAccY) < 0.001, 
        `Acceleration Y should be ${expectedAccY}, got ${ball.acceleration.y}`);
    
    console.log('✓ Apply force test passed');
}

function testPhysicsUpdate() {
    console.log('Testing physics update...');
    
    const ball = new Ball(0, 0, 10, 1);
    ball.setVelocity(10, 5);
    ball.applyForce(new Vector2D(2, 4)); // acceleration will be (2, 4)
    
    const initialPos = ball.position.clone();
    const initialVel = ball.velocity.clone();
    const deltaTime = 0.1;
    
    ball.update(deltaTime);
    
    // After update, position should change and acceleration should be reset
    console.assert(ball.position.x !== initialPos.x || ball.position.y !== initialPos.y, 
        'Position should change after update');
    console.assert(ball.acceleration.x === 0 && ball.acceleration.y === 0, 
        'Acceleration should be reset after update');
    
    console.log('✓ Physics update test passed');
}

function testKineticEnergy() {
    console.log('Testing kinetic energy calculation...');
    
    const ball = new Ball(0, 0, 10, 2); // mass = 2
    ball.setVelocity(10, 0); // speed = 10
    
    const expectedKE = 0.5 * 2 * 10 * 10; // 0.5 * m * v^2 = 100
    const actualKE = ball.getKineticEnergy();
    
    console.assert(Math.abs(actualKE - expectedKE) < 0.001, 
        `Kinetic energy should be ${expectedKE}, got ${actualKE}`);
    
    console.log('✓ Kinetic energy test passed');
}

function testMomentum() {
    console.log('Testing momentum calculation...');
    
    const ball = new Ball(0, 0, 10, 3); // mass = 3
    ball.setVelocity(4, 5);
    
    const momentum = ball.getMomentum();
    const expectedMomentumX = 4 * 3; // vx * mass
    const expectedMomentumY = 5 * 3; // vy * mass
    
    console.assert(Math.abs(momentum.x - expectedMomentumX) < 0.001, 
        `Momentum X should be ${expectedMomentumX}, got ${momentum.x}`);
    console.assert(Math.abs(momentum.y - expectedMomentumY) < 0.001, 
        `Momentum Y should be ${expectedMomentumY}, got ${momentum.y}`);
    
    console.log('✓ Momentum test passed');
}

function testBoundingBox() {
    console.log('Testing bounding box...');
    
    const ball = new Ball(100, 200, 15, 1);
    const bbox = ball.getBoundingBox();
    
    console.assert(bbox.minX === 100 - 15, 'Bounding box minX should be position.x - radius');
    console.assert(bbox.minY === 200 - 15, 'Bounding box minY should be position.y - radius');
    console.assert(bbox.maxX === 100 + 15, 'Bounding box maxX should be position.x + radius');
    console.assert(bbox.maxY === 200 + 15, 'Bounding box maxY should be position.y + radius');
    
    console.log('✓ Bounding box test passed');
}

function testClone() {
    console.log('Testing clone...');
    
    const ball = new Ball(10, 20, 5, 2);
    ball.setVelocity(30, 40);
    ball.applyForce(new Vector2D(1, 2));
    
    const clonedBall = ball.clone();
    
    // Check that all properties are copied
    console.assert(clonedBall.position.x === ball.position.x, 'Cloned position X should match');
    console.assert(clonedBall.position.y === ball.position.y, 'Cloned position Y should match');
    console.assert(clonedBall.velocity.x === ball.velocity.x, 'Cloned velocity X should match');
    console.assert(clonedBall.velocity.y === ball.velocity.y, 'Cloned velocity Y should match');
    console.assert(clonedBall.radius === ball.radius, 'Cloned radius should match');
    console.assert(clonedBall.mass === ball.mass, 'Cloned mass should match');
    
    // Check that they are different objects
    console.assert(clonedBall !== ball, 'Clone should be different object');
    console.assert(clonedBall.position !== ball.position, 'Clone position should be different object');
    
    console.log('✓ Clone test passed');
}

function testEdgeCases() {
    console.log('Testing edge cases...');
    
    const ball = new Ball(0, 0, 10, 1);
    ball.setVelocity(10, 5);
    
    // Test invalid deltaTime
    const posBeforeInvalidUpdate = ball.position.clone();
    ball.update(0); // Invalid deltaTime
    console.assert(ball.position.x === posBeforeInvalidUpdate.x && ball.position.y === posBeforeInvalidUpdate.y, 
        'Position should not change with invalid deltaTime');
    
    // Test invalid force
    const accBeforeInvalidForce = ball.acceleration.clone();
    ball.applyForce(new Vector2D(NaN, 10));
    console.assert(ball.acceleration.x === accBeforeInvalidForce.x && ball.acceleration.y === accBeforeInvalidForce.y,
        'Acceleration should not change with invalid force');
    
    // Test invalid position values
    ball.setPosition(NaN, 10);
    console.assert(!isNaN(ball.position.x), 'Position should remain valid after invalid input');
    
    console.log('✓ Edge cases test passed');
}

function testCreateInsideHexagon() {
    console.log('Testing create inside hexagon...');
    
    const hexagon = new Hexagon(0, 0, 100);
    const ball = Ball.createInsideHexagon(hexagon, 10, 1);
    
    console.assert(ball instanceof Ball, 'Should return a Ball instance');
    console.assert(ball.radius === 10, 'Ball should have correct radius');
    console.assert(ball.mass === 1, 'Ball should have correct mass');
    
    // The ball should be inside the hexagon (this is a basic check)
    // More detailed testing would require the hexagon's isPointInside method to work
    console.assert(ball.position.x !== undefined && ball.position.y !== undefined, 
        'Ball should have valid position');
    
    console.log('✓ Create inside hexagon test passed');
}

// Run all tests
function runAllBallTests() {
    console.log('Running Ball class tests...\n');
    
    try {
        testBallCreation();
        testSetPositionAndVelocity();
        testApplyForce();
        testPhysicsUpdate();
        testKineticEnergy();
        testMomentum();
        testBoundingBox();
        testClone();
        testEdgeCases();
        testCreateInsideHexagon();
        
        console.log('\n✅ All Ball tests passed successfully!');
        console.log('Ball class implementation is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllBallTests();
}

module.exports = { runAllBallTests };