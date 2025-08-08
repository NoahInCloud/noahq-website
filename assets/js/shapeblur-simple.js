// Simple ShapeBlur effect using CSS and JavaScript
// Creates mouse-following blur effects without complex WebGL shaders

class SimpleShapeBlur {
    constructor(element, color) {
        this.element = element;
        this.color = color;
        this.blurElements = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isActive = false;
        
        this.init();
    }
    
    init() {
        // Create multiple blur layers for depth
        for (let i = 0; i < 3; i++) {
            const blur = document.createElement('div');
            blur.className = `shape-blur-layer shape-blur-layer-${i}`;
            blur.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: -1;
            `;
            
            // Create inner glow element
            const glow = document.createElement('div');
            glow.style.cssText = `
                position: absolute;
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: radial-gradient(circle, ${this.color} 0%, transparent 70%);
                filter: blur(${30 + i * 10}px);
                transform: translate(-50%, -50%);
                top: 50%;
                left: 50%;
            `;
            
            blur.appendChild(glow);
            this.element.appendChild(blur);
            this.blurElements.push({ container: blur, glow: glow });
        }
        
        // Add border glow
        const borderGlow = document.createElement('div');
        borderGlow.className = 'shape-blur-border';
        borderGlow.style.cssText = `
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(45deg, transparent, ${this.color}, transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(10px);
        `;
        this.element.appendChild(borderGlow);
        this.borderGlow = borderGlow;
        
        // Setup events
        this.setupEvents();
    }
    
    setupEvents() {
        this.element.addEventListener('mouseenter', () => {
            this.isActive = true;
            this.blurElements.forEach(el => {
                el.container.style.opacity = '0.3';
            });
            this.borderGlow.style.opacity = '0.5';
            this.animate();
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.blurElements.forEach(el => {
                el.container.style.opacity = '0';
            });
            this.borderGlow.style.opacity = '0';
            
            // Reset to center
            const rect = this.element.getBoundingClientRect();
            this.mouseX = rect.width / 2;
            this.mouseY = rect.height / 2;
        });
        
        this.element.addEventListener('mousemove', (e) => {
            const rect = this.element.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // Initialize at center
        const rect = this.element.getBoundingClientRect();
        this.mouseX = rect.width / 2;
        this.mouseY = rect.height / 2;
        this.currentX = this.mouseX;
        this.currentY = this.mouseY;
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Smooth interpolation
        this.currentX += (this.mouseX - this.currentX) * 0.1;
        this.currentY += (this.mouseY - this.currentY) * 0.1;
        
        // Update blur positions with slight offset for each layer
        this.blurElements.forEach((el, i) => {
            const offset = i * 5;
            el.glow.style.left = `${this.currentX}px`;
            el.glow.style.top = `${this.currentY}px`;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Remove old ShapeBlur initialization if it exists
    const oldContainers = document.querySelectorAll('.shape-blur-container');
    oldContainers.forEach(container => container.remove());
    
    const processSteps = document.querySelectorAll('.process-step');
    
    if (processSteps.length === 0) {
        console.log('SimpleShapeBlur: No process steps found');
        return;
    }
    
    console.log('SimpleShapeBlur: Initializing for', processSteps.length, 'process steps');
    
    // Colors for each step
    const colors = [
        'rgba(59, 130, 246, 0.8)',  // Blue for Build
        'rgba(255, 107, 53, 0.8)',  // Orange for Integrate  
        'rgba(255, 215, 0, 0.8)'     // Gold for Tune
    ];
    
    processSteps.forEach((step, index) => {
        step.style.position = 'relative';
        step.style.overflow = 'visible';
        new SimpleShapeBlur(step, colors[index % colors.length]);
        console.log(`SimpleShapeBlur: Initialized step ${index + 1}`);
    });
});

// Export for manual use
window.SimpleShapeBlur = SimpleShapeBlur;