// Vanilla JavaScript implementation of ShapeBlur using Three.js
// Converted from React component to work with Process cards

const vertexShader = /* glsl */ `
varying vec2 v_texcoord;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_texcoord = uv;
}
`;

const fragmentShader = /* glsl */ `
varying vec2 v_texcoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform float u_shapeSize;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;

#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif

#ifndef VAR
#define VAR 0
#endif

#ifndef FNC_COORD
#define FNC_COORD
vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
}
#endif

#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse * u_pixelRatio)

float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}
float sdCircle(in vec2 st, in vec2 center) {
    return length(st - center) * 2.0;
}
float sdPoly(in vec2 p, in float w, in int sides) {
    float a = atan(p.x, p.y) + PI;
    float r = TWO_PI / float(sides);
    float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));
    return d * 2.0 - w;
}

float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
float fill(in float x) { return 1.0 - aastep(0.0, x); }
float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
}
float stroke(in float d, in float t) { return (1.0 - aastep(t, abs(d))); }
float stroke(float x, float size, float w, float edge) {
    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float strokeAA(float x, float size, float w, float edge) {
    float afwidth = length(vec2(dFdx(x), dFdy(x))) * 0.70710678;
    float d = smoothstep(size - edge - afwidth, size + edge + afwidth, x + w * 0.5)
            - smoothstep(size - edge - afwidth, size + edge + afwidth, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

void main() {
    vec2 st = st0 + 0.5;
    vec2 posMouse = mx * vec2(1., -1.) + 0.5;

    float size = u_shapeSize;
    float roundness = u_roundness;
    float borderSize = u_borderSize;
    float circleSize = u_circleSize;
    float circleEdge = u_circleEdge;

    // Mouse distance for blur effect
    float mouseDist = length(st - posMouse);
    float mouseInfluence = smoothstep(0.0, circleSize, mouseDist);
    
    // Create blur falloff based on mouse distance
    float blurRadius = mix(0.3, 0.05, mouseInfluence);
    
    float sdf;
    if (VAR == 0) {
        // Rounded rectangle with animated blur
        sdf = sdRoundRect(st, vec2(size), roundness);
        sdf = smoothstep(blurRadius + 0.02, blurRadius, abs(sdf));
        
        // Add mouse-following glow
        float glow = 1.0 - smoothstep(0.0, circleSize * 2.0, mouseDist);
        sdf = max(sdf, glow * 0.3);
        
    } else if (VAR == 1) {
        // Filled circle with blur
        sdf = sdCircle(st, vec2(0.5));
        sdf = smoothstep(0.7 + blurRadius, 0.7 - blurRadius, sdf);
        
    } else if (VAR == 2) {
        // Circle stroke with blur
        sdf = abs(sdCircle(st, vec2(0.5)) - 0.58);
        sdf = smoothstep(0.02 + blurRadius, 0.02 - blurRadius, sdf);
        
    } else if (VAR == 3) {
        // Triangle with blur
        sdf = sdPoly(st - vec2(0.5, 0.45), 0.3, 3);
        sdf = smoothstep(0.05 + blurRadius, 0.05 - blurRadius, sdf);
    }

    // Create color with alpha blend
    vec3 color = vec3(1.0);
    float alpha = clamp(sdf, 0.0, 1.0);
    
    // Smooth falloff at edges to prevent hard borders
    alpha *= smoothstep(0.0, 0.02, alpha);
    
    gl_FragColor = vec4(color.rgb, alpha);
}
`;

class ShapeBlur {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            variation: options.variation || 0,
            pixelRatio: options.pixelRatio || 2,
            shapeSize: options.shapeSize || 1.8,
            roundness: options.roundness || 0.12,
            borderSize: options.borderSize || 0.02,
            circleSize: options.circleSize || 0.6,
            circleEdge: options.circleEdge || 0.9,
            color: options.color || '#ffffff'
        };
        
        this.init();
    }
    
    init() {
        // Create container for Three.js canvas
        this.container = document.createElement('div');
        this.container.className = 'shape-blur-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '1';
        this.container.style.opacity = '0';
        this.container.style.transition = 'opacity 0.3s ease';
        this.container.style.borderRadius = 'inherit';
        this.container.style.overflow = 'hidden';
        this.element.appendChild(this.container);
        
        // Initialize Three.js
        this.initThree();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
    }
    
    initThree() {
        // Mouse vectors
        this.vMouse = new THREE.Vector2();
        this.vMouseDamp = new THREE.Vector2();
        this.vResolution = new THREE.Vector2();
        
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.OrthographicCamera();
        this.camera.position.z = 1;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: false
        });
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Debug: Check WebGL context
        if (!this.renderer.getContext()) {
            console.warn('ShapeBlur: Failed to get WebGL context');
            return;
        }
        
        // Geometry and material
        const geo = new THREE.PlaneGeometry(1, 1);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                u_mouse: { value: this.vMouseDamp },
                u_resolution: { value: this.vResolution },
                u_pixelRatio: { value: this.options.pixelRatio },
                u_shapeSize: { value: this.options.shapeSize },
                u_roundness: { value: this.options.roundness },
                u_borderSize: { value: this.options.borderSize },
                u_circleSize: { value: this.options.circleSize },
                u_circleEdge: { value: this.options.circleEdge }
            },
            defines: { VAR: this.options.variation },
            transparent: true
        });
        
        // Mesh
        this.quad = new THREE.Mesh(geo, this.material);
        this.scene.add(this.quad);
        
        // Set color based on options
        this.setColor(this.options.color);
        
        // Initial resize
        this.resize();
    }
    
    setColor(color) {
        // Apply color filter to the canvas
        this.renderer.domElement.style.filter = `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color})`;
        this.renderer.domElement.style.mixBlendMode = 'screen';
    }
    
    setupEventListeners() {
        // Mouse move handler
        this.onPointerMove = (e) => {
            const rect = this.element.getBoundingClientRect();
            this.vMouse.set(e.clientX - rect.left, e.clientY - rect.top);
        };
        
        // Mouse enter/leave handlers
        this.onMouseEnter = () => {
            this.container.style.opacity = '0.9';  // More visible effect
        };
        
        this.onMouseLeave = () => {
            this.container.style.opacity = '0';
            // Reset mouse position to center
            const rect = this.element.getBoundingClientRect();
            this.vMouse.set(rect.width / 2, rect.height / 2);
        };
        
        // Add event listeners
        this.element.addEventListener('mousemove', this.onPointerMove);
        this.element.addEventListener('mouseenter', this.onMouseEnter);
        this.element.addEventListener('mouseleave', this.onMouseLeave);
        
        // Resize handler
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
        
        // ResizeObserver for element size changes
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.element);
        
        // Set initial mouse position to center
        const rect = this.element.getBoundingClientRect();
        this.vMouse.set(rect.width / 2, rect.height / 2);
        this.vMouseDamp.set(rect.width / 2, rect.height / 2);
    }
    
    resize() {
        const w = this.element.clientWidth;
        const h = this.element.clientHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);
        
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(dpr);
        
        this.camera.left = -w / 2;
        this.camera.right = w / 2;
        this.camera.top = h / 2;
        this.camera.bottom = -h / 2;
        this.camera.updateProjectionMatrix();
        
        this.quad.scale.set(w, h, 1);
        this.vResolution.set(w, h).multiplyScalar(dpr);
        this.material.uniforms.u_pixelRatio.value = dpr;
    }
    
    animate() {
        if (!this.renderer) return;
        
        const time = performance.now() * 0.001;
        const dt = this.lastTime ? time - this.lastTime : 0.016;
        this.lastTime = time;
        
        // Smooth mouse movement
        ['x', 'y'].forEach(k => {
            this.vMouseDamp[k] = THREE.MathUtils.damp(this.vMouseDamp[k], this.vMouse[k], 8, dt);
        });
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        // Clean up event listeners
        this.element.removeEventListener('mousemove', this.onPointerMove);
        this.element.removeEventListener('mouseenter', this.onMouseEnter);
        this.element.removeEventListener('mouseleave', this.onMouseLeave);
        window.removeEventListener('resize', this.resizeHandler);
        
        // Clean up ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
        
        // Remove container
        this.element.removeChild(this.container);
    }
}

// Initialize ShapeBlur for process steps when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load Three.js if not already loaded
    if (typeof THREE === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js';
        script.onload = () => {
            initializeShapeBlurs();
        };
        document.head.appendChild(script);
    } else {
        initializeShapeBlurs();
    }
});

function initializeShapeBlurs() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        const processSteps = document.querySelectorAll('.process-step');
        
        if (processSteps.length === 0) {
            console.log('ShapeBlur: No process steps found');
            return;
        }
        
        console.log('ShapeBlur: Initializing for', processSteps.length, 'process steps');
        
        // Define colors and variations for each step - matching brand colors
        const configs = [
            { color: '#ff6b35', variation: 0 }, // Orange for Build - matches CSS
            { color: '#f7931e', variation: 0 }, // Orange-yellow for Integrate - matches CSS  
            { color: '#ffd700', variation: 0 }  // Gold for Tune - matches CSS
        ];
        
        processSteps.forEach((step, index) => {
            // Make sure the step has proper positioning
            if (!step.style.position) {
                step.style.position = 'relative';
            }
            
            const config = configs[index % configs.length];
            try {
                new ShapeBlur(step, {
                    variation: config.variation,
                    color: config.color,
                    pixelRatio: Math.min(window.devicePixelRatio, 2),
                    shapeSize: 1.8,      // Adjusted for better shape
                    roundness: 0.12,     // Better rounded corners
                    borderSize: 0.02,    // Slightly thicker for visibility
                    circleSize: 0.6,     // Larger mouse influence area
                    circleEdge: 0.9      // Smoother edge transition
                });
                console.log(`ShapeBlur: Initialized for step ${index + 1} with color ${config.color}`);
            } catch (error) {
                console.error(`ShapeBlur: Failed to initialize step ${index + 1}:`, error);
            }
        });
    }, 100);
}

// Export for manual initialization if needed
window.ShapeBlur = ShapeBlur;
window.initializeShapeBlurs = initializeShapeBlurs;