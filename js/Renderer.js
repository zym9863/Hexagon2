/**
 * Renderer class for handling Canvas 2D rendering
 * Provides high-DPI support and responsive canvas sizing
 */
class Renderer {
    constructor(canvas) {
        try {
            // Validate canvas element
            if (!canvas) {
                throw new Error('Canvas element is required');
            }
            
            if (!(canvas instanceof HTMLCanvasElement)) {
                throw new Error('Provided element is not a canvas');
            }
            
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            if (!this.ctx) {
                throw new Error('2D context not supported by this browser');
            }
            
            // Initialize error tracking
            this.errorCount = 0;
            this.lastError = null;
            this.maxErrors = 10; // Maximum errors before disabling renderer
            this.isDisabled = false;
            
            this.setupCanvas();
            this.setupEventListeners();
            
            console.log('Renderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Renderer:', error);
            this.handleError(error);
            throw error;
        }
    }
    
    /**
     * Initialize canvas with high-DPI support and responsive sizing
     */
    setupCanvas() {
        try {
            this.updateCanvasSize();
            
            // Enable anti-aliasing for smoother rendering
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            
            // Set default styles
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
        } catch (error) {
            console.error('Failed to setup canvas:', error);
            this.handleError(error);
        }
    }
    
    /**
     * Set up event listeners for responsive behavior
     */
    setupEventListeners() {
        try {
            // Debounced resize handler to prevent excessive calls
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    try {
                        this.updateCanvasSize();
                    } catch (error) {
                        console.error('Error during canvas resize:', error);
                        this.handleError(error);
                    }
                }, 100);
            });
            
            // Handle visibility change to pause/resume rendering
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    console.log('Page hidden, renderer may pause');
                } else {
                    console.log('Page visible, renderer resumed');
                }
            });
            
        } catch (error) {
            console.error('Failed to setup event listeners:', error);
            this.handleError(error);
        }
    }
    
    /**
     * Update canvas size with high-DPI support and responsive scaling
     */
    updateCanvasSize() {
        try {
            if (this.isDisabled) {
                console.warn('Renderer is disabled, skipping canvas size update');
                return;
            }
            
            const container = this.canvas.parentElement;
            if (!container) {
                throw new Error('Canvas container not found');
            }
            
            const rect = container.getBoundingClientRect();
            
            // Validate dimensions
            if (rect.width <= 0 || rect.height <= 0) {
                console.warn('Invalid container dimensions:', rect);
                return;
            }
            
            const dpr = window.devicePixelRatio || 1;
            
            // Calculate responsive canvas size based on viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Determine optimal canvas size based on device type
            let canvasWidth, canvasHeight;
            
            if (viewportWidth <= 480) {
                // Mobile phones - smaller canvas for performance
                canvasWidth = Math.min(rect.width, 400);
                canvasHeight = Math.min(rect.height, 400);
            } else if (viewportWidth <= 768) {
                // Tablets - medium canvas size
                canvasWidth = Math.min(rect.width, 600);
                canvasHeight = Math.min(rect.height, 600);
            } else {
                // Desktop - full size canvas
                canvasWidth = Math.min(rect.width, 800);
                canvasHeight = Math.min(rect.height, 600);
            }
            
            // Maintain aspect ratio
            const aspectRatio = canvasWidth / canvasHeight;
            if (aspectRatio > 1.5) {
                canvasHeight = canvasWidth / 1.5;
            } else if (aspectRatio < 0.8) {
                canvasWidth = canvasHeight * 0.8;
            }
            
            // Limit maximum canvas size to prevent memory issues
            const maxSize = 4096;
            const actualWidth = Math.min(canvasWidth * dpr, maxSize);
            const actualHeight = Math.min(canvasHeight * dpr, maxSize);
            
            // Set actual canvas size (accounting for device pixel ratio)
            this.canvas.width = actualWidth;
            this.canvas.height = actualHeight;
            
            // Set CSS size to maintain proper display size
            this.canvas.style.width = canvasWidth + 'px';
            this.canvas.style.height = canvasHeight + 'px';
            
            // Scale context to match device pixel ratio
            this.ctx.scale(dpr, dpr);
            
            // Store logical dimensions for calculations
            this.width = canvasWidth;
            this.height = canvasHeight;
            
            // Store scale factor for physics calculations
            this.scaleFactor = this.calculateScaleFactor();
            
            // Restore canvas settings after resize
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            console.log(`Canvas resized to ${canvasWidth}x${canvasHeight} (logical), scale factor: ${this.scaleFactor.toFixed(2)}`);
            
        } catch (error) {
            console.error('Failed to update canvas size:', error);
            this.handleError(error);
        }
    }
    
    /**
     * Calculate scale factor based on canvas size for physics scaling
     * @returns {number} Scale factor for physics parameters
     */
    calculateScaleFactor() {
        // Base size for reference (800x600)
        const baseWidth = 800;
        const baseHeight = 600;
        
        // Calculate scale based on the smaller dimension to maintain proportions
        const widthScale = this.width / baseWidth;
        const heightScale = this.height / baseHeight;
        
        // Use the smaller scale to ensure everything fits
        const scale = Math.min(widthScale, heightScale);
        
        // Clamp scale factor to reasonable bounds
        return Math.max(0.3, Math.min(2.0, scale));
    }
    
    /**
     * Get current scale factor for physics calculations
     * @returns {number} Current scale factor
     */
    getScaleFactor() {
        return this.scaleFactor || 1.0;
    }  
  
    /**
     * Clear the entire canvas
     */
    clear() {
        return this.safeDrawOperation(() => {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }, 'clear canvas');
    }
    
    /**
     * Set viewport dimensions
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    setViewport(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Draw a circle
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Circle radius
     * @param {string} fillColor - Fill color (optional)
     * @param {string} strokeColor - Stroke color (optional)
     * @param {number} strokeWidth - Stroke width (optional)
     */
    drawCircle(x, y, radius, fillColor = null, strokeColor = null, strokeWidth = 1) {
        return this.safeDrawOperation(() => {
            // Validate parameters
            if (!isFinite(x) || !isFinite(y) || !isFinite(radius)) {
                throw new Error(`Invalid circle parameters: x=${x}, y=${y}, radius=${radius}`);
            }
            
            if (radius <= 0) {
                console.warn('Circle radius must be positive:', radius);
                return;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            
            if (fillColor) {
                this.ctx.fillStyle = fillColor;
                this.ctx.fill();
            }
            
            if (strokeColor) {
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = Math.max(0, strokeWidth);
                this.ctx.stroke();
            }
        }, 'draw circle');
    }
    
    /**
     * Draw a polygon from an array of vertices
     * @param {Array} vertices - Array of {x, y} points
     * @param {string} fillColor - Fill color (optional)
     * @param {string} strokeColor - Stroke color (optional)
     * @param {number} strokeWidth - Stroke width (optional)
     */
    drawPolygon(vertices, fillColor = null, strokeColor = null, strokeWidth = 1) {
        return this.safeDrawOperation(() => {
            // Validate vertices array
            if (!Array.isArray(vertices)) {
                throw new Error('Vertices must be an array');
            }
            
            if (vertices.length < 3) {
                console.warn('Polygon must have at least 3 vertices, got:', vertices.length);
                return;
            }
            
            // Validate each vertex
            for (let i = 0; i < vertices.length; i++) {
                const vertex = vertices[i];
                if (!vertex || !isFinite(vertex.x) || !isFinite(vertex.y)) {
                    throw new Error(`Invalid vertex at index ${i}: ${JSON.stringify(vertex)}`);
                }
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(vertices[0].x, vertices[0].y);
            
            for (let i = 1; i < vertices.length; i++) {
                this.ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            
            this.ctx.closePath();
            
            if (fillColor) {
                this.ctx.fillStyle = fillColor;
                this.ctx.fill();
            }
            
            if (strokeColor) {
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = Math.max(0, strokeWidth);
                this.ctx.stroke();
            }
        }, 'draw polygon');
    }    
    
/**
     * Draw a hexagon (specialized polygon method)
     * @param {Object} hexagon - Hexagon object with getVertices() method
     * @param {string} fillColor - Fill color (optional)
     * @param {string} strokeColor - Stroke color (optional)
     * @param {number} strokeWidth - Stroke width (optional)
     */
    drawHexagon(hexagon, fillColor = null, strokeColor = '#2196F3', strokeWidth = 3) {
        const vertices = hexagon.getVertices();
        this.drawPolygon(vertices, fillColor, strokeColor, strokeWidth);
    }
    
    /**
     * Draw a ball (specialized circle method)
     * @param {Object} ball - Ball object with position and radius properties
     * @param {string} fillColor - Fill color
     * @param {string} strokeColor - Stroke color (optional)
     * @param {number} strokeWidth - Stroke width (optional)
     */
    drawBall(ball, fillColor = '#FF5722', strokeColor = null, strokeWidth = 1) {
        this.drawCircle(
            ball.position.x, 
            ball.position.y, 
            ball.radius, 
            fillColor, 
            strokeColor, 
            strokeWidth
        );
    }
    
    /**
     * Set background color with performance optimization
     * @param {string} color - Background color
     */
    setBackground(color = '#f5f5f5') {
        return this.safeDrawOperation(() => {
            // Performance optimization: only change fillStyle if color changed
            if (this._lastBackgroundColor !== color) {
                this.ctx.fillStyle = color;
                this._lastBackgroundColor = color;
            }
            this.ctx.fillRect(0, 0, this.width, this.height);
        }, 'set background');
    }
    
    /**
     * High-performance clear method
     * Uses clearRect which is more efficient than fillRect for clearing
     */
    clear() {
        return this.safeDrawOperation(() => {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }, 'clear canvas');
    }
    
    /**
     * Begin batch rendering mode for performance optimization
     * Reduces context state changes
     */
    beginBatch() {
        if (!this.isDisabled) {
            this.ctx.save();
            this._batchMode = true;
        }
    }
    
    /**
     * End batch rendering mode
     */
    endBatch() {
        if (this._batchMode && !this.isDisabled) {
            this.ctx.restore();
            this._batchMode = false;
        }
    }
    
    /**
     * Get canvas center coordinates
     * @returns {Object} Center coordinates {x, y}
     */
    getCenter() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }
    
    /**
     * Transform coordinates to canvas center origin
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Transformed coordinates {x, y}
     */
    toCanvasCoords(x, y) {
        const center = this.getCenter();
        return {
            x: center.x + x,
            y: center.y + y
        };
    }
    
    /**
     * Get current canvas dimensions
     * @returns {Object} Dimensions {width, height}
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Handle rendering errors
     * @param {Error} error - The error that occurred
     */
    handleError(error) {
        this.errorCount++;
        this.lastError = {
            message: error.message,
            timestamp: Date.now(),
            stack: error.stack
        };
        
        console.error(`Renderer error #${this.errorCount}:`, error);
        
        // Disable renderer if too many errors occur
        if (this.errorCount >= this.maxErrors) {
            this.isDisabled = true;
            console.error('Renderer disabled due to excessive errors');
            
            // Show error message on canvas
            this.showErrorMessage('渲染器已禁用：错误过多');
        }
    }
    
    /**
     * Show error message on canvas
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        try {
            if (!this.ctx) return;
            
            // Clear canvas
            this.ctx.fillStyle = '#ffebee';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw error message
            this.ctx.fillStyle = '#d32f2f';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            
            this.ctx.fillText('渲染错误', centerX, centerY - 30);
            this.ctx.font = '14px Arial';
            this.ctx.fillText(message, centerX, centerY + 10);
            
            // Reset text alignment
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'alphabetic';
            
        } catch (error) {
            console.error('Failed to show error message:', error);
        }
    }
    
    /**
     * Check if renderer is healthy
     * @returns {boolean} True if renderer is working properly
     */
    isHealthy() {
        return !this.isDisabled && this.errorCount < this.maxErrors;
    }
    
    /**
     * Reset error state
     */
    resetErrors() {
        this.errorCount = 0;
        this.lastError = null;
        this.isDisabled = false;
        console.log('Renderer error state reset');
    }
    
    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        return {
            errorCount: this.errorCount,
            lastError: this.lastError,
            isDisabled: this.isDisabled,
            isHealthy: this.isHealthy()
        };
    }
    
    /**
     * Safe wrapper for drawing operations
     * @param {Function} drawFunction - Drawing function to execute
     * @param {string} operationName - Name of the operation for error reporting
     */
    safeDrawOperation(drawFunction, operationName = 'draw operation') {
        if (this.isDisabled) {
            return false;
        }
        
        try {
            drawFunction();
            return true;
        } catch (error) {
            console.error(`Error in ${operationName}:`, error);
            this.handleError(error);
            return false;
        }
    }
}