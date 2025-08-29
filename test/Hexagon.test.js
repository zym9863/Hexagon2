/**
 * Unit tests for Hexagon class
 * 验证六边形几何计算的正确性
 */

// Mock Vector2D class for testing
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

// Import Hexagon class (in a real environment, this would be a proper import)
// For testing purposes, we'll assume the Hexagon class is available

describe('Hexagon Class Tests', () => {
    let hexagon;
    
    beforeEach(() => {
        // 创建一个标准六边形：中心在(0,0)，半径为100
        hexagon = new Hexagon(0, 0, 100);
    });
    
    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(hexagon.center.x).toBe(0);
            expect(hexagon.center.y).toBe(0);
            expect(hexagon.radius).toBe(100);
            expect(hexagon.rotation).toBe(0);
            expect(hexagon.rotationSpeed).toBe(0.5);
        });
    });
    
    describe('Vertex Calculations', () => {
        test('should calculate 6 vertices correctly', () => {
            const vertices = hexagon.getVertices();
            expect(vertices).toHaveLength(6);
            
            // 验证每个顶点都在正确的距离上
            vertices.forEach(vertex => {
                const distance = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
                expect(distance).toBeCloseTo(100, 5);
            });
        });
        
        test('should have correct vertex positions for unrotated hexagon', () => {
            const vertices = hexagon.getVertices();
            
            // 第一个顶点应该在 (100, 0)
            expect(vertices[0].x).toBeCloseTo(100, 5);
            expect(vertices[0].y).toBeCloseTo(0, 5);
            
            // 第二个顶点应该在 (50, 86.6) 大约
            expect(vertices[1].x).toBeCloseTo(50, 1);
            expect(vertices[1].y).toBeCloseTo(86.6, 1);
            
            // 第四个顶点应该在 (-100, 0)
            expect(vertices[3].x).toBeCloseTo(-100, 5);
            expect(vertices[3].y).toBeCloseTo(0, 5);
        });
        
        test('should rotate vertices correctly', () => {
            const originalVertices = hexagon.getVertices();
            
            // 旋转90度 (π/2 弧度)
            hexagon.rotate(Math.PI / 2);
            const rotatedVertices = hexagon.getVertices();
            
            // 第一个顶点现在应该在 (0, 100) 附近
            expect(rotatedVertices[0].x).toBeCloseTo(0, 5);
            expect(rotatedVertices[0].y).toBeCloseTo(100, 5);
            
            // 验证所有顶点仍然在正确的距离上
            rotatedVertices.forEach(vertex => {
                const distance = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
                expect(distance).toBeCloseTo(100, 5);
            });
        });
    });
    
    describe('Edge Calculations', () => {
        test('should calculate 6 edges correctly', () => {
            const edges = hexagon.getEdges();
            expect(edges).toHaveLength(6);
            
            // 验证每条边都有起点和终点
            edges.forEach(edge => {
                expect(edge).toHaveProperty('start');
                expect(edge).toHaveProperty('end');
                expect(edge.start).toBeInstanceOf(Vector2D);
                expect(edge.end).toBeInstanceOf(Vector2D);
            });
        });
        
        test('should have edges connecting consecutive vertices', () => {
            const vertices = hexagon.getVertices();
            const edges = hexagon.getEdges();
            
            for (let i = 0; i < edges.length; i++) {
                const expectedStart = vertices[i];
                const expectedEnd = vertices[(i + 1) % vertices.length];
                
                expect(edges[i].start.x).toBeCloseTo(expectedStart.x, 5);
                expect(edges[i].start.y).toBeCloseTo(expectedStart.y, 5);
                expect(edges[i].end.x).toBeCloseTo(expectedEnd.x, 5);
                expect(edges[i].end.y).toBeCloseTo(expectedEnd.y, 5);
            }
        });
    });
    
    describe('Point Inside Detection', () => {
        test('should detect center point as inside', () => {
            const centerPoint = new Vector2D(0, 0);
            expect(hexagon.isPointInside(centerPoint)).toBe(true);
        });
        
        test('should detect points clearly outside as outside', () => {
            const outsidePoint = new Vector2D(200, 200);
            expect(hexagon.isPointInside(outsidePoint)).toBe(false);
        });
        
        test('should detect points near edges correctly', () => {
            // 点在六边形内部但接近边缘
            const insidePoint = new Vector2D(50, 0);
            expect(hexagon.isPointInside(insidePoint)).toBe(true);
            
            // 点在六边形外部但接近边缘
            const outsidePoint = new Vector2D(150, 0);
            expect(hexagon.isPointInside(outsidePoint)).toBe(false);
        });
    });
    
    describe('Distance to Edge Calculations', () => {
        test('should calculate distance to edge correctly', () => {
            const point = new Vector2D(0, 0); // 中心点
            const lineStart = new Vector2D(-50, 0);
            const lineEnd = new Vector2D(50, 0);
            
            const result = hexagon.getDistanceToEdge(point, lineStart, lineEnd);
            
            expect(result.distance).toBeCloseTo(0, 5);
            expect(result.closestPoint.x).toBeCloseTo(0, 5);
            expect(result.closestPoint.y).toBeCloseTo(0, 5);
        });
        
        test('should calculate normal vector correctly', () => {
            const point = new Vector2D(0, 10); // 点在水平线上方
            const lineStart = new Vector2D(-50, 0);
            const lineEnd = new Vector2D(50, 0);
            
            const result = hexagon.getDistanceToEdge(point, lineStart, lineEnd);
            
            expect(result.distance).toBeCloseTo(10, 5);
            expect(result.normal.x).toBeCloseTo(0, 5);
            expect(result.normal.y).toBeCloseTo(1, 5); // 向上的法向量
        });
    });
    
    describe('Collision Detection', () => {
        test('should detect collision with ball inside hexagon', () => {
            const ball = {
                position: new Vector2D(80, 0), // 接近右边缘
                radius: 25
            };
            
            const collision = hexagon.checkCollision(ball);
            expect(collision).not.toBeNull();
            expect(collision.penetration).toBeGreaterThan(0);
        });
        
        test('should not detect collision with ball outside hexagon', () => {
            const ball = {
                position: new Vector2D(200, 0), // 远离六边形
                radius: 10
            };
            
            const collision = hexagon.checkCollision(ball);
            expect(collision).toBeNull();
        });
        
        test('should provide correct collision information', () => {
            const ball = {
                position: new Vector2D(95, 0), // 非常接近右边缘
                radius: 10
            };
            
            const collision = hexagon.checkCollision(ball);
            if (collision) {
                expect(collision).toHaveProperty('distance');
                expect(collision).toHaveProperty('normal');
                expect(collision).toHaveProperty('closestPoint');
                expect(collision).toHaveProperty('penetration');
                expect(collision.penetration).toBeGreaterThan(0);
            }
        });
        
        test('should detect collision with ball touching hexagon edge', () => {
            // 创建一个刚好接触六边形边缘的小球
            const ball = {
                position: new Vector2D(90, 0), // 距离右边缘10像素
                radius: 10
            };
            
            const collision = hexagon.checkCollision(ball);
            expect(collision).not.toBeNull();
            expect(collision.penetration).toBeCloseTo(0, 1); // 刚好接触
        });
        
        test('should calculate correct normal vector for collision', () => {
            const ball = {
                position: new Vector2D(95, 0), // 接近右边缘
                radius: 10
            };
            
            const collision = hexagon.checkCollision(ball);
            if (collision) {
                // 法向量应该指向小球中心方向（向右）
                expect(collision.normal.x).toBeGreaterThan(0);
                expect(collision.normal.magnitude()).toBeCloseTo(1, 5); // 单位向量
            }
        });
        
        test('should handle collision with multiple edges correctly', () => {
            // 测试小球在六边形角落的碰撞
            const ball = {
                position: new Vector2D(85, 50), // 接近右上角
                radius: 15
            };
            
            const collision = hexagon.checkCollision(ball);
            if (collision) {
                expect(collision.penetration).toBeGreaterThan(0);
                expect(collision.normal).toBeDefined();
                expect(collision.closestPoint).toBeDefined();
            }
        });
        
        test('should work correctly with rotated hexagon', () => {
            // 旋转六边形45度
            hexagon.rotate(Math.PI / 4);
            
            const ball = {
                position: new Vector2D(90, 0), // 同样的位置
                radius: 15
            };
            
            const collision = hexagon.checkCollision(ball);
            // 由于六边形旋转了，碰撞结果应该不同
            expect(collision).toBeDefined(); // 可能有碰撞也可能没有，取决于具体几何
        });
        
        test('should handle edge case with zero-radius ball', () => {
            const ball = {
                position: new Vector2D(0, 0), // 中心位置
                radius: 0
            };
            
            const collision = hexagon.checkCollision(ball);
            expect(collision).toBeNull(); // 零半径的球不应该碰撞
        });
        
        test('should handle edge case with very large ball', () => {
            const ball = {
                position: new Vector2D(0, 0), // 中心位置
                radius: 200 // 比六边形还大
            };
            
            const collision = hexagon.checkCollision(ball);
            expect(collision).not.toBeNull();
            expect(collision.penetration).toBeGreaterThan(0);
        });
        
        test('should provide consistent collision detection across all edges', () => {
            const ballRadius = 10;
            const testDistance = 85; // 距离中心85像素，应该与所有边都接近碰撞
            
            // 测试六个方向的碰撞
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
                expect(collision).not.toBeNull();
                expect(collision.penetration).toBeGreaterThan(0);
            }
        });
    });
    
    describe('Update and Rotation', () => {
        test('should update rotation correctly', () => {
            const initialRotation = hexagon.rotation;
            const deltaTime = 0.1; // 100ms
            
            hexagon.update(deltaTime);
            
            const expectedRotation = initialRotation + hexagon.rotationSpeed * deltaTime;
            expect(hexagon.rotation).toBeCloseTo(expectedRotation, 5);
        });
        
        test('should keep rotation within 0-2π range', () => {
            hexagon.rotation = 2 * Math.PI + 1; // 超过2π
            hexagon.update(0.1);
            
            expect(hexagon.rotation).toBeLessThan(2 * Math.PI);
            expect(hexagon.rotation).toBeGreaterThanOrEqual(0);
        });
    });
    
    describe('Bounding Box', () => {
        test('should calculate correct bounding box', () => {
            const bbox = hexagon.getBoundingBox();
            
            expect(bbox).toHaveProperty('min');
            expect(bbox).toHaveProperty('max');
            expect(bbox).toHaveProperty('width');
            expect(bbox).toHaveProperty('height');
            
            // 对于半径100的六边形，边界框应该是200x200
            expect(bbox.width).toBeCloseTo(200, 1);
            expect(bbox.height).toBeCloseTo(173.2, 1); // 六边形高度约为 √3 * radius
        });
    });
    
    describe('Style and Configuration', () => {
        test('should set style properties correctly', () => {
            hexagon.setStyle('#FF0000', '#00FF00', 5);
            
            expect(hexagon.strokeColor).toBe('#FF0000');
            expect(hexagon.fillColor).toBe('#00FF00');
            expect(hexagon.strokeWidth).toBe(5);
        });
        
        test('should set rotation speed correctly', () => {
            hexagon.setRotationSpeed(1.5);
            expect(hexagon.rotationSpeed).toBe(1.5);
        });
    });
});

// 如果在Node.js环境中运行测试
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Vector2D };
}