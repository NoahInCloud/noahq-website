// Orb WebGL Animation
class Orb {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            hue: options.hue || 0,
            hoverIntensity: options.hoverIntensity || 0.5,
            rotateOnHover: options.rotateOnHover !== undefined ? options.rotateOnHover : true,
            forceHoverState: options.forceHoverState || false
        };
        
        this.targetHover = 0;
        this.currentRot = 0;
        this.lastTime = 0;
        this.rotationSpeed = 0.3;
        
        this.init();
    }
    
    init() {
        // Wait for OGL to be available
        if (!window.OGL) {
            console.error('OGL library not loaded');
            return;
        }
        
        const { Renderer, Program, Mesh, Triangle, Vec3 } = window.OGL;
        
        this.renderer = new Renderer({ 
            alpha: true, 
            premultipliedAlpha: false,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio, 2)
        });
        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0);
        this.container.appendChild(this.gl.canvas);
        
        this.setupShaders();
        this.setupGeometry();
        this.setupEventListeners();
        this.resize();
        this.animate();
    }
    
    setupShaders() {
        const { Program, Vec3 } = window.OGL;
        
        const vertex = /* glsl */ `
            attribute vec2 position;
            attribute vec2 uv;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
        
        const fragment = /* glsl */ `
            precision highp float;

            uniform float iTime;
            uniform vec3 iResolution;
            uniform float hue;
            uniform float hover;
            uniform float rot;
            uniform float hoverIntensity;
            varying vec2 vUv;

            vec3 rgb2yiq(vec3 c) {
                float y = dot(c, vec3(0.299, 0.587, 0.114));
                float i = dot(c, vec3(0.596, -0.274, -0.322));
                float q = dot(c, vec3(0.211, -0.523, 0.312));
                return vec3(y, i, q);
            }
            
            vec3 yiq2rgb(vec3 c) {
                float r = c.x + 0.956 * c.y + 0.621 * c.z;
                float g = c.x - 0.272 * c.y - 0.647 * c.z;
                float b = c.x - 1.106 * c.y + 1.703 * c.z;
                return vec3(r, g, b);
            }
            
            vec3 adjustHue(vec3 color, float hueDeg) {
                float hueRad = hueDeg * 3.14159265 / 180.0;
                vec3 yiq = rgb2yiq(color);
                float cosA = cos(hueRad);
                float sinA = sin(hueRad);
                float i = yiq.y * cosA - yiq.z * sinA;
                float q = yiq.y * sinA + yiq.z * cosA;
                yiq.y = i;
                yiq.z = q;
                return yiq2rgb(yiq);
            }

            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3(
                    p3.x + p3.y,
                    p3.x + p3.z,
                    p3.y + p3.z
                ) * p3.zyx);
            }

            float snoise3(vec3 p) {
                const float K1 = 0.333333333;
                const float K2 = 0.166666667;
                vec3 i = floor(p + (p.x + p.y + p.z) * K1);
                vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
                vec3 e = step(vec3(0.0), d0 - d0.yzx);
                vec3 i1 = e * (1.0 - e.zxy);
                vec3 i2 = 1.0 - e.zxy * (1.0 - e);
                vec3 d1 = d0 - (i1 - K2);
                vec3 d2 = d0 - (i2 - K1);
                vec3 d3 = d0 - 0.5;
                vec4 h = max(0.6 - vec4(
                    dot(d0, d0),
                    dot(d1, d1),
                    dot(d2, d2),
                    dot(d3, d3)
                ), 0.0);
                vec4 n = h * h * h * h * vec4(
                    dot(d0, hash33(i)),
                    dot(d1, hash33(i + i1)),
                    dot(d2, hash33(i + i2)),
                    dot(d3, hash33(i + 1.0))
                );
                return dot(vec4(31.316), n);
            }

            vec4 extractAlpha(vec3 colorIn) {
                float a = max(max(colorIn.r, colorIn.g), colorIn.b);
                return vec4(colorIn.rgb / (a + 1e-5), a);
            }

            const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
            const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
            const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
            const float innerRadius = 0.6;
            const float noiseScale = 0.65;

            float light1(float intensity, float attenuation, float dist) {
                return intensity / (1.0 + dist * attenuation);
            }
            float light2(float intensity, float attenuation, float dist) {
                return intensity / (1.0 + dist * dist * attenuation);
            }

            vec4 draw(vec2 uv) {
                vec3 color1 = adjustHue(baseColor1, hue);
                vec3 color2 = adjustHue(baseColor2, hue);
                vec3 color3 = adjustHue(baseColor3, hue);
                
                float ang = atan(uv.y, uv.x);
                float len = length(uv);
                float invLen = len > 0.0 ? 1.0 / len : 0.0;
                
                float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
                float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
                float d0 = distance(uv, (r0 * invLen) * uv);
                float v0 = light1(1.0, 10.0, d0);
                v0 *= smoothstep(r0 * 1.05, r0, len);
                float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
                
                float a = iTime * -1.0;
                vec2 pos = vec2(cos(a), sin(a)) * r0;
                float d = distance(uv, pos);
                float v1 = light2(1.5, 5.0, d);
                v1 *= light1(1.0, 50.0, d0);
                
                float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
                float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
                
                vec3 col = mix(color1, color2, cl);
                col = mix(color3, col, v0);
                col = (col + v1) * v2 * v3;
                col = clamp(col, 0.0, 1.0);
                
                return extractAlpha(col);
            }

            vec4 mainImage(vec2 fragCoord) {
                vec2 center = iResolution.xy * 0.5;
                float size = min(iResolution.x, iResolution.y);
                vec2 uv = (fragCoord - center) / size * 2.0;
                
                float angle = rot;
                float s = sin(angle);
                float c = cos(angle);
                uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
                
                uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
                uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
                
                return draw(uv);
            }

            void main() {
                vec2 fragCoord = vUv * iResolution.xy;
                vec4 col = mainImage(fragCoord);
                gl_FragColor = vec4(col.rgb * col.a, col.a);
            }
        `;
        
        this.program = new Program(this.gl, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {
                iTime: { value: 0 },
                iResolution: {
                    value: new Vec3(
                        this.gl.canvas.width,
                        this.gl.canvas.height,
                        this.gl.canvas.width / this.gl.canvas.height
                    ),
                },
                hue: { value: this.options.hue },
                hover: { value: 0 },
                rot: { value: 0 },
                hoverIntensity: { value: this.options.hoverIntensity },
            },
        });
    }
    
    setupGeometry() {
        const { Triangle, Mesh } = window.OGL;
        const geometry = new Triangle(this.gl);
        this.mesh = new Mesh(this.gl, { geometry, program: this.program });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;
            const size = Math.min(width, height);
            const centerX = width / 2;
            const centerY = height / 2;
            const uvX = ((x - centerX) / size) * 2.0;
            const uvY = ((y - centerY) / size) * 2.0;

            if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
                this.targetHover = 1;
            } else {
                this.targetHover = 0;
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.targetHover = 0;
        });
    }
    
    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.renderer.setSize(width * dpr, height * dpr);
        this.gl.canvas.style.width = width + 'px';
        this.gl.canvas.style.height = height + 'px';
        
        const { Vec3 } = window.OGL;
        this.program.uniforms.iResolution.value = new Vec3(
            this.gl.canvas.width,
            this.gl.canvas.height,
            this.gl.canvas.width / this.gl.canvas.height
        );
    }
    
    animate(t = 0) {
        requestAnimationFrame((t) => this.animate(t));
        
        const dt = (t - this.lastTime) * 0.001;
        this.lastTime = t;
        
        this.program.uniforms.iTime.value = t * 0.001;
        this.program.uniforms.hue.value = this.options.hue;
        this.program.uniforms.hoverIntensity.value = this.options.hoverIntensity;
        
        const effectiveHover = this.options.forceHoverState ? 1 : this.targetHover;
        this.program.uniforms.hover.value += (effectiveHover - this.program.uniforms.hover.value) * 0.1;
        
        if (this.options.rotateOnHover && effectiveHover > 0.5) {
            this.currentRot += dt * this.rotationSpeed;
        }
        this.program.uniforms.rot.value = this.currentRot;
        
        this.renderer.render({ scene: this.mesh });
    }
    
    destroy() {
        this.container.removeChild(this.gl.canvas);
        this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
}

// Initialize the orb when DOM and OGL are ready
function initOrb() {
    const orbContainer = document.getElementById('hero-orb');
    console.log('Initializing orb...', { orbContainer, OGL: window.OGL, OGLLoaded: window.OGLLoaded });
    
    if (orbContainer && window.OGL && window.OGLLoaded) {
        console.log('Creating orb instance...');
        // Use hue 0 for the original purple/cyan colors
        const orb = new Orb(orbContainer, {
            hue: 0,
            hoverIntensity: 0.5,
            rotateOnHover: true,
            forceHoverState: false
        });
        console.log('Orb created successfully!', orb);
    } else if (!window.OGL || !window.OGLLoaded) {
        console.log('OGL not ready, retrying...');
        // If OGL is not ready yet, wait a bit and try again
        setTimeout(initOrb, 100);
    }
}

// Wait for both DOM and OGL to be ready
window.addEventListener('load', () => {
    // Give OGL module time to load
    setTimeout(initOrb, 200);
});