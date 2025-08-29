/**
 * Collision Detection Test Suite
 * 专门测试六边形碰撞检测系统的功能
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
    
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    
    clone() {
        return new Vector2D(this.x, this.y);
    }
    
    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
}

// Load Hexagon class
const fs = require('fs');
const path = require('path');

try {
    const hexagonCode = fs.readFileSync(path.join(__dirname, '../js/Hexagon.js'), 'utf8');
    eval(hexagonCode);
} catch (error) {
    console.error('Failed to load Hexagon class:', error.message);
    process.exit(1);
}

// Test Suite
class CollisionDetectionTestSuite {
    constructor() {
        this.testCount = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }
    
    assert(condition, message) {
        this.testCount++;
        if (condition) {
            this.passedTests++;
            console.log(`  ✓ ${message}`);
        } else {
            this.failedTests++;
            console.log(`  ❌ ${message}`);
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    
    assertApproxEqual(actual, expected, tolerance, message) {
        const diff = Math.abs(actual - expected);
        this.assert(diff < tolerance, `${message} (expected: ${expected}, actual: ${actual}, diff: ${diff})`);
    }
    
    testPointInsideDetection() {
        console.log('\n🔍 Testing Point Inside Detection...');
        
        const hexagon = new Hexagon(0, 0, 100);
        
        // Test center point
        const centerPoint = new Vector2D(0, 0);
        this.assert(hexagon.isPointInside(centerPoint), 'Center point should be inside hexagon');
        
        // Test points clearly outside
        const outsidePoints = [
            new Vector2D(200, 0),
            new Vector2D(0, 200),
            new Vector2D(-200, 0),
            new Vector2D(0, -200),
            new Vector2D(150, 150)
        ];
        
        outsidePoints.forEach((point, index) => {
            this.assert(!hexagon.isPointInside(point), 
                `Outside point ${index + 1} ${point.toString()} should not be inside`);
        });
        
        // Test points clearly inside
        const insidePoints = [
            new Vector2D(50, 0),
            new Vector2D(0, 50),
            new Vector2D(-50, 0),
            new Vector2D(0, -50),
            new Vector2D(25, 25)
        ];
        
        insidePoints.forEach((point, index) => {
            this.assert(hexagon.isPointInside(point), 
                `Inside point ${index + 1} ${point.toString()} should be inside`);
        });
    }
    
    testBallCollisionDetection() {
        console.log('\n⚽ Testing Ball Collision Detection...');
        
        const hexagon = new Hexagon(0, 0, 100);
        
        // Test 1: Ball clearly outside (no collision)
        const outsideBall = {
            position: new Vector2D(200, 0),
            radius: 10
        };
        const noCollision = hexagon.checkCollision(outsideBall);
        this.assert(noCollision === null, 'Ball far outside should not collide');
        
        // Test 2: Ball inside near edge (collision expected)
        const nearEdgeBall = {
            position: new Vector2D(85, 0), // Close to right edge
            radius: 20
        };
        const edgeCollision = hexagon.checkCollision(nearEdgeBall);
        this.assert(edgeCollision !== null, 'Ball near edge should collide');
        this.assert(edgeCollision.penetration > 0, 'Collision should have positive penetration');
        
        // Test 3: Small ball at center (no collision)
        const centerBall = {
            position: new Vector2D(0, 0),
            radius: 10
        };
        const centerCollision = hexagon.checkCollision(centerBall);
        this.assert(centerCollision === null, 'Small ball at center should not collide');
        
        // Test 4: Large ball at center (collision with all edges)
        const largeBall = {
            position: new Vector2D(0, 0),
            radius: 120
        };
        const largeCollision = hexagon.checkCollision(largeBall);
        this.assert(largeCollision !== null, 'Large ball should collide with edges');
        this.assert(largeCollision.penetration > 0, 'Large ball should have penetration');
        
        // Test 5: Ball just touching edge
        const touchingBall = {
            position: new Vector2D(90, 0),
            radius: 10
        };
        const touchCollision = hexagon.checkCollision(touchingBall);
        this.assert(touchCollision !== null, 'Ball touching edge should collide');
    }
    
    testCollisionNormalVectors() {
        console.log('\n📐 Testing Collision Normal Vectors...');
        
        const hexagon = new Hexagon(0, 0, 100);
        
        // Test collision with right edge
        const rightBall = {
            position: new Vector2D(95, 0),
            radius: 10
        };
        const rightCollision = hexagon.checkCollision(rightBall);
        if (rightCollision) {
            this.assert(rightCollision.normal.x > 0, 'Right edge collision normal should point right');
            this.assertApproxEqual(rightCollision.normal.magnitude(), 1, 0.001, 
                'Normal vector should be unit length');
        }
        
        // Test collision with left edge
        const leftBall = {
            position: new Vector2D(-95, 0),
            radius: 10
        };
        const leftCollision = hexagon.checkCollision(leftBall);
        if (leftCollision) {
            this.assert(leftCollision.normal.x < 0, 'Left edge collision normal should point left');
            this.assertApproxEqual(leftCollision.normal.magnitude(), 1, 0.001, 
                'Normal vector should be unit length');
        }
    }
    
    testDistanceToEdgeCalculation() {
        console.log('\n📏 Testing Distance to Edge Calculation...');
        
        const hexagon = new Hexagon(0, 0, 100);
        
        // Test distance from point to horizontal line
        const point = new Vector2D(0, 0);
        const lineStart = new Vector2D(-50, 10);
        const lineEnd = new Vector2D(50, 10);
        
        const result = hexagon.getDistanceToEdge(point, lineStart, lineEnd);
        
        this.assertApproxEqual(result.distance, 10, 0.001, 'Distance to horizontal line should be 10');
        this.assertApproxEqual(result.normal.x, 0, 0.001, 'Normal X component should be 0');
        this.assertApproxEqual(result.normal.y, -1, 0.001, 'Normal Y component should be -1');
        this.assertApproxEqual(result.closestPoint.x, 0, 0.001, 'Closest point X should be 0');
        this.assertApproxEqual(result.closestPoint.y, 10, 0.001, 'Closest point Y should be 10');
        
        // Test distance to line segment endpoint
        const endPoint = new Vector2D(60, 10);
        const endResult = hexagon.getDistanceToEdge(endPoint, lineStart, lineEnd);
        this.assertApproxEqual(endResult.distance, 10, 0.001, 'Distance to line endpoint should be 10');
    }
    
    testCollisionWithRotation() {
        console.log('\n🔄 Testing Collision with Hexagon Rotation...');
        
        const hexagon = new Hexagon(0, 0, 100);
        
        const ball = {
            position: new Vector2D(90, 0),
            radius: 15
        };
        
        // Test collision at different rotation angles
        const rotationAngles = [0, Math.PI / 6, Math.PI / 3, Math.PI / 2];
        
        rotationAngles.forEach((angle, index) => {
            hexagon.rotate(angle);
            const collision = hexagon.checkCollision(ball);
            
            // The collision result should be consistent (either always colliding or not)
            // but the normal vector should change with rotation
            if (collision) {
                this.assertApproxEqual(collision.normal.magnitude(), 1, 0.001, 
                    `Normal vector should be unit length at rotation ${index}`);
            }
        });
    }
    
    testEdgeCases() {
        console.log('\n🎯 Testing Edge Cases...');
        
        const hexagon = new Hexagon(0, 0, 100);
        
        // Test zero radius ball
        const zeroBall = {
            position: new Vector2D(0, 0),
            radius: 0
        };
        const zeroCollision = hexagon.checkCollision(zeroBall);
        this.assert(zeroCollision === null, 'Zero radius ball should not collide');
        
        // Test ball with very small radius
        const tinyBall = {
            position: new Vector2D(99.5, 0),
            radius: 0.1
        };
        const tinyCollision = hexagon.checkCollision(tinyBall);
        // This might or might not collide depending on exact geometry
        
        // Test ball at exact vertex position
        const vertices = hexagon.getVertices();
        const vertexBall = {
            position: vertices[0],
            radius: 5
        };
        const vertexCollision = hexagon.checkCollision(vertexBall);
        this.assert(vertexCollision !== null, 'Ball at vertex should collide');
    }
    
    testConsistencyAcrossAllEdges() {
        console.log('\n🔄 Testing Consistency Across All Edges...');
        
        const hexagon = new Hexagon(0, 0, 100);
        const ballRadius = 15;
        const testDistance = 80; // Distance from center that should cause collision
        
        // Test collision at 6 different angles (towards each edge)
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const ball = {
                position: new Vector2D(
                    testDistance * Math.cos(angle),
                    testDistance * Math.sin(angle)
                ),
                radius: ballRadius
            };
            
            const collision = hexagon.checkCollision(ball);
            this.assert(collision !== null, `Ball should collide with edge ${i + 1}`);
            this.assert(collision.penetration > 0, `Edge ${i + 1} collision should have penetration`);
            this.assertApproxEqual(collision.normal.magnitude(), 1, 0.001, 
                `Edge ${i + 1} normal should be unit vector`);
        }
    }
    
    runAllTests() {
        console.log('🚀 Starting Collision Detection Test Suite...');
        console.log('=' .repeat(60));
        
        try {
            this.testPointInsideDetection();
            this.testBallCollisionDetection();
            this.testCollisionNormalVectors();
            this.testDistanceToEdgeCalculation();
            this.testCollisionWithRotation();
            this.testEdgeCases();
            this.testConsistencyAcrossAllEdges();
            
            console.log('\n' + '=' .repeat(60));
            console.log(`✅ All collision detection tests passed!`);
            console.log(`📊 Test Results: ${this.passedTests}/${this.testCount} passed`);
            console.log('🎉 Collision detection system is working correctly!');
            
        } catch (error) {
            console.log('\n' + '=' .repeat(60));
            console.error(`❌ Test failed: ${error.message}`);
            console.log(`📊 Test Results: ${this.passedTests}/${this.testCount} passed, ${this.failedTests} failed`);
            process.exit(1);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new CollisionDetectionTestSuite();
    testSuite.runAllTests();
}

module.exports = CollisionDetectionTestSuite;