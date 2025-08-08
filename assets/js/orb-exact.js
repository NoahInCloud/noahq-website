// Exact Orb Implementation from provided React code
// This creates the purple/cyan glowing ring effect

(function() {
    console.log('Starting orb-exact.js initialization...');
    
    // Vertex shader
    const vertexShader = `
        precision highp float;
        attribute vec2 position;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // Fragment shader - exact copy from your code
    const fragmentShader = `
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

    // Create WebGL context and render the orb
    function createOrb() {
        const container = document.getElementById('hero-orb');
        if (!container) {
            console.error('Container #hero-orb not found');
            return;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl', { 
            alpha: true, 
            premultipliedAlpha: false,
            antialias: true 
        });
        
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        container.appendChild(canvas);

        // Set canvas size
        function resize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
        resize();
        window.addEventListener('resize', resize);

        // Create shaders
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

        // Create program
        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Create triangle geometry (covers entire screen)
        const vertices = new Float32Array([
            -1, -1,
            3, -1,
            -1, 3
        ]);

        const uvs = new Float32Array([
            0, 0,
            2, 0,
            0, 2
        ]);

        // Create buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

        // Get attribute locations
        const positionLoc = gl.getAttribLocation(program, 'position');
        const uvLoc = gl.getAttribLocation(program, 'uv');

        // Get uniform locations
        const uniforms = {
            iTime: gl.getUniformLocation(program, 'iTime'),
            iResolution: gl.getUniformLocation(program, 'iResolution'),
            hue: gl.getUniformLocation(program, 'hue'),
            hover: gl.getUniformLocation(program, 'hover'),
            rot: gl.getUniformLocation(program, 'rot'),
            hoverIntensity: gl.getUniformLocation(program, 'hoverIntensity')
        };

        // Animation state
        let targetHover = 0;
        let currentHover = 0;
        let currentRot = 0;
        const rotationSpeed = 0.3;

        // Mouse interaction
        container.addEventListener('mouseenter', () => targetHover = 1);
        container.addEventListener('mouseleave', () => targetHover = 0);

        // Render loop
        let startTime = Date.now();
        function render() {
            const time = (Date.now() - startTime) * 0.001;

            // Clear
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Bind position buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionLoc);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

            // Bind UV buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.enableVertexAttribArray(uvLoc);
            gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

            // Update uniforms
            gl.uniform1f(uniforms.iTime, time);
            gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1);
            gl.uniform1f(uniforms.hue, 0); // Use 0 for original purple/cyan colors
            
            // Smooth hover transition
            currentHover += (targetHover - currentHover) * 0.1;
            gl.uniform1f(uniforms.hover, currentHover);
            
            // Rotation on hover
            if (currentHover > 0.5) {
                currentRot += 0.016 * rotationSpeed; // ~60fps
            }
            gl.uniform1f(uniforms.rot, currentRot);
            gl.uniform1f(uniforms.hoverIntensity, 0.5);

            // Draw
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            requestAnimationFrame(render);
        }

        render();
        console.log('Exact orb created successfully with native WebGL!');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createOrb);
    } else {
        createOrb();
    }
})();