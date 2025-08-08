// Animated Orb using Three.js
(function() {
    // Wait for Three.js to load
    if (typeof THREE === 'undefined') {
        setTimeout(arguments.callee, 100);
        return;
    }

    const orbContainer = document.getElementById('hero-orb');
    if (!orbContainer) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    
    // Set renderer size
    const size = orbContainer.clientWidth;
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    orbContainer.appendChild(renderer.domElement);

    // Create the orb shader material
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float time;
        uniform vec2 resolution;
        uniform float hover;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        vec3 colorA = vec3(0.912, 0.431, 0.263); // Orange
        vec3 colorB = vec3(0.996, 0.843, 0.0);   // Gold
        vec3 colorC = vec3(0.6, 0.2, 0.9);       // Purple accent
        
        float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            
            float n = i.x + i.y * 57.0 + 113.0 * i.z;
            return mix(mix(mix(fract(sin(n) * 43758.5453),
                            fract(sin(n + 1.0) * 43758.5453), f.x),
                        mix(fract(sin(n + 57.0) * 43758.5453),
                            fract(sin(n + 58.0) * 43758.5453), f.x), f.y),
                    mix(mix(fract(sin(n + 113.0) * 43758.5453),
                            fract(sin(n + 114.0) * 43758.5453), f.x),
                        mix(fract(sin(n + 170.0) * 43758.5453),
                            fract(sin(n + 171.0) * 43758.5453), f.x), f.y), f.z);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Add time-based distortion
            float n = noise(vec3(uv * 3.0, time * 0.5));
            float n2 = noise(vec3(uv * 5.0, time * 0.3));
            
            // Create gradient
            float gradient = length(uv - 0.5) * 2.0;
            gradient = smoothstep(0.0, 1.0, gradient);
            
            // Mix colors
            vec3 color = mix(colorA, colorB, gradient);
            color = mix(color, colorC, n * 0.3);
            
            // Add glow effect
            float glow = 1.0 - gradient;
            glow = pow(glow, 2.0);
            color += glow * 0.5 * (1.0 + hover * 0.5);
            
            // Fresnel effect
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += fresnel * 0.3 * colorB;
            
            // Alpha based on distance from center
            float alpha = 1.0 - smoothstep(0.4, 0.5, length(uv - 0.5));
            alpha *= 0.9 + n2 * 0.1;
            
            gl_FragColor = vec4(color, alpha);
        }
    `;

    // Create sphere geometry and material
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(size, size) },
            hover: { value: 0 }
        },
        transparent: true,
        side: THREE.DoubleSide
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Position camera
    camera.position.z = 5;

    // Mouse interaction
    let targetHover = 0;
    orbContainer.addEventListener('mouseenter', () => {
        targetHover = 1;
    });
    orbContainer.addEventListener('mouseleave', () => {
        targetHover = 0;
    });

    // Handle resize
    function handleResize() {
        const newSize = orbContainer.clientWidth;
        renderer.setSize(newSize, newSize);
        material.uniforms.resolution.value.set(newSize, newSize);
    }
    window.addEventListener('resize', handleResize);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update time
        material.uniforms.time.value += 0.01;
        
        // Smooth hover transition
        material.uniforms.hover.value += (targetHover - material.uniforms.hover.value) * 0.1;
        
        // Rotate orb
        orb.rotation.x += 0.003;
        orb.rotation.y += 0.005;
        
        // Add hover rotation boost
        if (material.uniforms.hover.value > 0.5) {
            orb.rotation.z += 0.01 * material.uniforms.hover.value;
        }
        
        renderer.render(scene, camera);
    }

    animate();
    console.log('Orb initialized successfully with Three.js!');
})();