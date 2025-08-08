// Mini Orb using exact shader from hero orb
(function() {
    // Same vertex shader as hero orb
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

    // Same fragment shader as hero orb - creates the glowing ring effect
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

        // BRIGHTER colors for mini orb
        const vec3 baseColor1 = vec3(0.8, 0.4, 1.0); // Brighter purple
        const vec3 baseColor2 = vec3(0.4, 0.85, 1.0); // Brighter cyan
        const vec3 baseColor3 = vec3(0.1, 0.1, 0.7); // Brighter dark blue
        const float innerRadius = 0.5; // Smaller inner radius for mini orb
        const float noiseScale = 0.8; // More noise variation

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
            float v0 = light1(1.2, 8.0, d0); // Brighter light
            v0 *= smoothstep(r0 * 1.05, r0, len);
            float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
            
            float a = iTime * -1.0;
            vec2 pos = vec2(cos(a), sin(a)) * r0;
            float d = distance(uv, pos);
            float v1 = light2(2.0, 4.0, d); // Much brighter
            v1 *= light1(1.2, 40.0, d0);
            
            float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
            float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
            
            vec3 col = mix(color1, color2, cl);
            col = mix(color3, col, v0);
            col = (col + v1) * v2 * v3;
            col = clamp(col * 1.5, 0.0, 1.0); // Boost brightness
            
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
            
            // Less distortion for mini orb
            uv.x += hover * hoverIntensity * 0.05 * sin(uv.y * 10.0 + iTime);
            uv.y += hover * hoverIntensity * 0.05 * sin(uv.x * 10.0 + iTime);
            
            return draw(uv);
        }

        void main() {
            vec2 fragCoord = vUv * iResolution.xy;
            vec4 col = mainImage(fragCoord);
            gl_FragColor = vec4(col.rgb * col.a, col.a);
        }
    `;

    // Create WebGL mini orbs
    function initMiniOrbs() {
        const canvases = document.querySelectorAll('.mini-orb-canvas');
        
        canvases.forEach((canvas, index) => {
            const gl = canvas.getContext('webgl', { 
                alpha: true, 
                premultipliedAlpha: false,
                antialias: false 
            });
            
            if (!gl) {
                console.error('WebGL not supported for mini orb');
                return;
            }

            // Create shaders
            function createShader(type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error('Mini orb shader error:', gl.getShaderInfoLog(shader));
                    return null;
                }
                return shader;
            }

            const vertShader = createShader(gl.VERTEX_SHADER, vertexShader);
            const fragShader = createShader(gl.FRAGMENT_SHADER, fragmentShader);

            // Create program
            const program = gl.createProgram();
            gl.attachShader(program, vertShader);
            gl.attachShader(program, fragShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Mini orb program error:', gl.getProgramInfoLog(program));
                return;
            }

            gl.useProgram(program);

            // Create geometry
            const vertices = new Float32Array([-1,-1, 3,-1, -1,3]);
            const uvs = new Float32Array([0,0, 2,0, 0,2]);

            // Create buffers
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

            // Get locations
            const positionLoc = gl.getAttribLocation(program, 'position');
            const uvLoc = gl.getAttribLocation(program, 'uv');

            const uniforms = {
                iTime: gl.getUniformLocation(program, 'iTime'),
                iResolution: gl.getUniformLocation(program, 'iResolution'),
                hue: gl.getUniformLocation(program, 'hue'),
                hover: gl.getUniformLocation(program, 'hover'),
                rot: gl.getUniformLocation(program, 'rot'),
                hoverIntensity: gl.getUniformLocation(program, 'hoverIntensity')
            };

            // Animation state
            let currentHover = 0;
            let targetHover = 0;
            let currentRot = index * Math.PI; // Different starting rotation for each

            // Hover detection
            const parentLogo = canvas.closest('.nav-logo, .footer-logo');
            if (parentLogo) {
                parentLogo.addEventListener('mouseenter', () => targetHover = 1);
                parentLogo.addEventListener('mouseleave', () => targetHover = 0);
            }

            // Set viewport
            gl.viewport(0, 0, canvas.width, canvas.height);

            // Render loop
            const startTime = Date.now();
            function render() {
                const time = (Date.now() - startTime) * 0.001;

                // Clear
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                // Bind position
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.enableVertexAttribArray(positionLoc);
                gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

                // Bind UV
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
                gl.enableVertexAttribArray(uvLoc);
                gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

                // Update uniforms
                gl.uniform1f(uniforms.iTime, time);
                gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1);
                gl.uniform1f(uniforms.hue, 0);
                
                // Smooth hover
                currentHover += (targetHover - currentHover) * 0.1;
                gl.uniform1f(uniforms.hover, currentHover);
                
                // Continuous slow rotation
                currentRot += 0.01;
                if (currentHover > 0.5) {
                    currentRot += 0.02; // Faster on hover
                }
                gl.uniform1f(uniforms.rot, currentRot);
                gl.uniform1f(uniforms.hoverIntensity, 0.3);

                // Draw
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                requestAnimationFrame(render);
            }

            render();
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMiniOrbs);
    } else {
        initMiniOrbs();
    }
})();