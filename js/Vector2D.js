/**
 * Vector2D - 二维向量数学工具类
 * 用于处理物理模拟中的向量运算
 */
class Vector2D {
    /**
     * 创建一个二维向量
     * @param {number} x - X坐标分量
     * @param {number} y - Y坐标分量
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 向量加法
     * @param {Vector2D} vector - 要相加的向量
     * @returns {Vector2D} 新的向量结果
     */
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    /**
     * 向量减法
     * @param {Vector2D} vector - 要相减的向量
     * @returns {Vector2D} 新的向量结果
     */
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    /**
     * 向量标量乘法
     * @param {number} scalar - 标量值
     * @returns {Vector2D} 新的向量结果
     */
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    /**
     * 计算向量的模长（大小）
     * @returns {number} 向量的模长
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 向量归一化（单位向量）
     * @returns {Vector2D} 归一化后的向量
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2D(0, 0);
        }
        return new Vector2D(this.x / mag, this.y / mag);
    }

    /**
     * 向量点积
     * @param {Vector2D} vector - 另一个向量
     * @returns {number} 点积结果
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * 向量旋转
     * @param {number} angle - 旋转角度（弧度）
     * @returns {Vector2D} 旋转后的向量
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2D(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    /**
     * 复制向量
     * @returns {Vector2D} 向量的副本
     */
    clone() {
        return new Vector2D(this.x, this.y);
    }

    /**
     * 设置向量值
     * @param {number} x - X坐标分量
     * @param {number} y - Y坐标分量
     */
    set(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 向量的字符串表示
     * @returns {string} 向量的字符串形式
     */
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    /**
     * 静态方法：创建零向量
     * @returns {Vector2D} 零向量
     */
    static zero() {
        return new Vector2D(0, 0);
    }

    /**
     * 静态方法：从角度创建单位向量
     * @param {number} angle - 角度（弧度）
     * @returns {Vector2D} 单位向量
     */
    static fromAngle(angle) {
        return new Vector2D(Math.cos(angle), Math.sin(angle));
    }
}

// Node.js module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vector2D;
}