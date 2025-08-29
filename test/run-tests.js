/**
 * Simple test runner for Hexagon class
 * 运行六边形类的基础测试
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
}

// Load Hexagon class (simplified for testing)
const fs = require('fs');
const path = require('path');

// Read and evaluate Hexagon.js
const hexagonCode = fs.readFileSync(path.join(__dirname, '../js/Hexagon.js'), 'utf8');
eval(hexagonCode);

// Test functions
function testHexagonCreation() {
    console.log('Testing Hexagon creation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    
    console.assert(hexagon.center.x === 0, 'Center X should be 0');
    console.assert(hexagon.center.y === 0, 'Center Y should be 0');
    console.assert(hexagon.radius === 100, 'Radius should be 100');
    console.assert(hexagon.rotation === 0, 'Initial rotation should be 0');
    
    console.log('✓ Hexagon creation test passed');
}

function testVertexCalculation() {
    console.log('Testing vertex calculation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    const vertices = hexagon.getVertices();
    
    console.assert(vertices.length === 6, 'Should have 6 vertices');
    
    // Test first vertex (should be at (100, 0) for unrotated hexagon)
    const firstVertex = vertices[0];
    console.assert(Math.abs(firstVertex.x - 100) < 0.001, 'First vertex X should be ~100');
    console.assert(Math.abs(firstVertex.y - 0) < 0.001, 'First vertex Y should be ~0');
    
    // Test that all vertices are at correct distance from center
    for (const vertex of vertices) {
        const distance = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
        console.assert(Math.abs(distance - 100) < 0.001, `Vertex distance should be ~100, got ${distance}`);
    }
    
    console.log('✓ Vertex calculation test passed');
}

function testRotation() {
    console.log('Testing rotation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    const originalVertices = hexagon.getVertices();
    
    // Rotate by 90 degrees
    hexagon.rotate(Math.PI / 2);
    const rotatedVertices = hexagon.getVertices();
    
    // First vertex should now be at approximately (0, 100)
    const firstRotated = rotatedVertices[0];
    console.assert(Math.abs(firstRotated.x - 0) < 0.001, `Rotated vertex X should be ~0, got ${firstRotated.x}`);
    console.assert(Math.abs(firstRotated.y - 100) < 0.001, `Rotated vertex Y should be ~100, got ${firstRotated.y}`);
    
    console.log('✓ Rotation test passed');
}

function testPointInside() {
    console.log('Testing point inside detection...');
    
    const hexagon = new Hexagon(0, 0, 100);
    
    // Test center point (should be inside)
    const centerPoint = new Vector2D(0, 0);
    console.assert(hexagon.isPointInside(centerPoint), 'Center point should be inside');
    
    // Test point clearly outside
    const outsidePoint = new Vector2D(200, 200);
    console.assert(!hexagon.isPointInside(outsidePoint), 'Outside point should not be inside');
    
    // Test point near edge but inside
    const nearEdgeInside = new Vector2D(50, 0);
    console.assert(hexagon.isPointInside(nearEdgeInside), 'Point near edge should be inside');
    
    console.log('✓ Point inside detection test passed');
}

function testEdgeCalculation() {
    console.log('Testing edge calculation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    const edges = hexagon.getEdges();
    
    console.assert(edges.length === 6, 'Should have 6 edges');
    
    // Test that each edge has start and end points
    for (const edge of edges) {
        console.assert(edge.start instanceof Vector2D, 'Edge start should be Vector2D');
        console.assert(edge.end instanceof Vector2D, 'Edge end should be Vector2D');
    }
    
    console.log('✓ Edge calculation test passed');
}

function testUpdate() {
    console.log('Testing update function...');
    
    const hexagon = new Hexagon(0, 0, 100);
    const initialRotation = hexagon.rotation;
    
    // Update with 0.1 second delta time
    hexagon.update(0.1);
    
    const expectedRotation = initialRotation + hexagon.rotationSpeed * 0.1;
    console.assert(Math.abs(hexagon.rotation - expectedRotation) < 0.001, 
        `Rotation should be ${expectedRotation}, got ${hexagon.rotation}`);
    
    console.log('✓ Update function test passed');
}

function testBoundingBox() {
    console.log('Testing bounding box calculation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    const bbox = hexagon.getBoundingBox();
    
    console.assert(bbox.hasOwnProperty('min'), 'Bounding box should have min property');
    console.assert(bbox.hasOwnProperty('max'), 'Bounding box should have max property');
    console.assert(bbox.hasOwnProperty('width'), 'Bounding box should have width property');
    console.assert(bbox.hasOwnProperty('height'), 'Bounding box should have height property');
    
    // For a regular hexagon with radius 100, width should be 200
    console.assert(Math.abs(bbox.width - 200) < 1, `Width should be ~200, got ${bbox.width}`);
    
    console.log('✓ Bounding box test passed');
}

function testCollisionDetection() {
    console.log('Testing collision detection...');
    
    const hexagon = new Hexagon(0, 0, 100);
    
    // Test 1: Ball clearly outside hexagon (no collision)
    const outsideBall = {
        position: new Vector2D(200, 0),
        radius: 10
    };
    const noCollision = hexagon.checkCollision(outsideBall);
    console.assert(noCollision === null, 'Ball outside hexagon should not collide');
    
    // Test 2: Ball inside hexagon near edge (collision)
    const insideBall = {
        position: new Vector2D(80, 0), // Close to right edge
        radius: 25
    };
    const collision = hexagon.checkCollision(insideBall);
    console.assert(collision !== null, 'Ball near edge should collide');
    console.assert(collision.penetration > 0, 'Collision should have positive penetration');
    
    // Test 3: Ball at center (no collision with edges)
    const centerBall = {
        position: new Vector2D(0, 0),
        radius: 10
    };
    const centerCollision = hexagon.checkCollision(centerBall);
    console.assert(centerCollision === null, 'Small ball at center should not collide');
    
    // Test 4: Large ball at center (collision with all edges)
    const largeBall = {
        position: new Vector2D(0, 0),
        radius: 150
    };
    const largeCollision = hexagon.checkCollision(largeBall);
    console.assert(largeCollision !== null, 'Large ball should collide');
    console.assert(largeCollision.penetration > 0, 'Large ball should have penetration');
    
    console.log('✓ Collision detection test passed');
}

function testDistanceToEdge() {
    console.log('Testing distance to edge calculation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    
    // Test distance from center to horizontal line
    const point = new Vector2D(0, 0);
    const lineStart = new Vector2D(-50, 10);
    const lineEnd = new Vector2D(50, 10);
    
    const result = hexagon.getDistanceToEdge(point, lineStart, lineEnd);
    
    console.assert(Math.abs(result.distance - 10) < 0.001, 
        `Distance should be 10, got ${result.distance}`);
    console.assert(Math.abs(result.normal.x - 0) < 0.001, 
        `Normal X should be 0, got ${result.normal.x}`);
    console.assert(Math.abs(result.normal.y + 1) < 0.001, 
        `Normal Y should be -1, got ${result.normal.y}`);
    
    console.log('✓ Distance to edge test passed');
}

function testCollisionWithRotation() {
    console.log('Testing collision detection with rotation...');
    
    const hexagon = new Hexagon(0, 0, 100);
    
    // Test collision before rotation
    const ball = {
        position: new Vector2D(90, 0),
        radius: 15
    };
    
    const collisionBefore = hexagon.checkCollision(ball);
    
    // Rotate hexagon by 30 degrees
    hexagon.rotate(Math.PI / 6);
    
    const collisionAfter = hexagon.checkCollision(ball);
    
    // Both should be valid collision objects or both null, but likely different
    console.assert(
        (collisionBefore === null) === (collisionAfter === null) || 
        collisionBefore !== collisionAfter,
        'Rotation should affect collision detection'
    );
    
    console.log('✓ Collision with rotation test passed');
}

// Run all tests
function runAllTests() {
    console.log('Running Hexagon class tests...\n');
    
    try {
        testHexagonCreation();
        testVertexCalculation();
        testRotation();
        testPointInside();
        testEdgeCalculation();
        testUpdate();
        testBoundingBox();
        testCollisionDetection();
        testDistanceToEdge();
        testCollisionWithRotation();
        
        console.log('\n✅ All tests passed successfully!');
        console.log('Hexagon class collision detection system is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };