// ==========================================================================
// Universal Verbatim Assembly Blueprint Engine
// ==========================================================================
const COLOR_MAP = {
  emerald: { name: 'Emerald', hex: '#10b981', glow: '#34d399', num: '0x10b981' },
  teal: { name: 'Teal', hex: '#0d9488', glow: '#2dd4bf', num: '0x0d9488' },
  sapphire: { name: 'Sapphire', hex: '#3b82f6', glow: '#60a5fa', num: '0x3b82f6' },
  blue: { name: 'Cobalt Blue', hex: '#2563eb', glow: '#60a5fa', num: '0x2563eb' },
  cyan: { name: 'Electric Cyan', hex: '#06b6d4', glow: '#22d3ee', num: '0x06b6d4' },
  aqua: { name: 'Aqua', hex: '#02d2e3', glow: '#38bdf8', num: '0x02d2e3' },
  vermilion: { name: 'Vermilion', hex: '#e11d48', glow: '#fb7185', num: '0xe11d48' },
  ruby: { name: 'Ruby', hex: '#e11d48', glow: '#f43f5e', num: '0xe11d48' },
  crimson: { name: 'Crimson', hex: '#f43f5e', glow: '#fb7185', num: '0xf43f5e' },
  rose: { name: 'Rose', hex: '#f43f5e', glow: '#fda4af', num: '0xf43f5e' },
  red: { name: 'Cadmium Red', hex: '#ef4444', glow: '#f87171', num: '0xef4444' },
  orange: { name: 'Blaze Orange', hex: '#f97316', glow: '#fb923c', num: '0xf97316' },
  amber: { name: 'Warm Amber', hex: '#f59e0b', glow: '#fbbf24', num: '0xf59e0b' },
  yellow: { name: 'Sunlit Yellow', hex: '#eab308', glow: '#fde047', num: '0xeab308' },
  lime: { name: 'Electric Lime', hex: '#84cc16', glow: '#a3e635', num: '0x84cc16' },
  green: { name: 'Forest Green', hex: '#22c55e', glow: '#4ade80', num: '0x22c55e' },
  magenta: { name: 'Neon Magenta', hex: '#ec4899', glow: '#f472b6', num: '0xec4899' },
  violet: { name: 'Deep Violet', hex: '#8b5cf6', glow: '#a78bfa', num: '0x8b5cf6' },
  purple: { name: 'Royal Purple', hex: '#a855f7', glow: '#c084fc', num: '0xa855f7' },
  indigo: { name: 'Electric Indigo', hex: '#6366f1', glow: '#818cf8', num: '0x6366f1' },
  gold: { name: 'Polished Gold', hex: '#d4af37', glow: '#fde047', num: '0xd4af37' },
  bronze: { name: 'Molten Bronze', hex: '#cd7f32', glow: '#f59e0b', num: '0xcd7f32' },
  chrome: { name: 'Specular Chrome', hex: '#94a3b8', glow: '#cbd5e1', num: '0x94a3b8' },
  silver: { name: 'Sterling Silver', hex: '#cbd5e1', glow: '#f1f5f9', num: '0xcbd5e1' }
};

const DEFAULT_PALETTES = [
  [COLOR_MAP.sapphire, COLOR_MAP.cyan],
  [COLOR_MAP.emerald, COLOR_MAP.teal],
  [COLOR_MAP.vermilion, COLOR_MAP.amber],
  [COLOR_MAP.violet, COLOR_MAP.magenta],
  [COLOR_MAP.gold, COLOR_MAP.bronze],
  [COLOR_MAP.indigo, COLOR_MAP.purple],
  [COLOR_MAP.chrome, COLOR_MAP.cyan],
  [COLOR_MAP.yellow, COLOR_MAP.orange]
];

function deriveItemKind(item) {
  if (item.route || (item.tech && Array.isArray(item.tech)) || (item.category && (item.category.includes('Shader') || item.category.includes('Optics')))) {
    return 'tool';
  }
  const cat = (item.categoryType || item.category || '').toLowerCase();
  const img = (item.image || item.previewImage || '').toLowerCase();
  
  if (item.shaderHash || img.includes('/gradients/') || cat === 'gradients' || cat === 'gradient') {
    return 'gradient';
  }
  if (img.includes('/3d_scenes/') || cat === '3d_scenes' || cat === '3d_scene' || item.sceneLive) {
    return '3d_scene';
  }
  if (img.includes('/backgrounds/') || cat === 'backgrounds' || cat === 'background') {
    return 'background';
  }
  if (cat === 'sections' || cat === 'section') {
    return 'section';
  }
  return 'template';
}

function extractColors(item) {
  if (Array.isArray(item.hues) && item.hues.length > 0) {
    const c1 = COLOR_MAP[item.hues[0].toLowerCase()] || null;
    const c2 = item.hues[1] ? (COLOR_MAP[item.hues[1].toLowerCase()] || null) : null;
    if (c1) return [c1, c2 || COLOR_MAP.cyan];
  }
  const text = ((item.keywords || []).join(' ') + ' ' + (item.description || '') + ' ' + (item.title || '')).toLowerCase();
  const matched = [];
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (text.includes(key)) {
      matched.push(val);
      if (matched.length >= 2) break;
    }
  }
  if (matched.length >= 2) return matched;
  if (matched.length === 1) return [matched[0], COLOR_MAP.cyan];

  const str = item.id || item.title || 'default';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DEFAULT_PALETTES.length;
  return DEFAULT_PALETTES[idx];
}

function deriveConcept(item, kind, c1, c2) {
  const id = item.id;
  if (id === 'kimi') return 'Formula 1 Driver Kinetic Experience';
  if (id === 'prisma') return 'Frosted Vermilion Glass Kinetic Cube';
  if (id === 'lumi-re') return 'Living Emerald Pendant & Gold Ring Carousel';
  if (id === 'lumora') return 'Minimalist Design-and-Engineering Studio';
  if (id === 'orb') return 'Luminous Iridescent Light Sphere';
  if (id === 'pixel-glass') return 'Refractive Glass Glyph in Starfield';
  if (id === 'komorebi') return 'Leaf Shadow Canopy & Radiant Light Discs';
  if (id === 'antipode') return 'Dual Mass Contrast Chromatic Field';
  if (id === 'yellow-liquid-ripples') return '4K Fluid Chromatic Ripple Simulation';
  if (id === 'metal-human') return 'Cinematic Metallic Chrome Humanoid';
  if (id === 'refract') return 'Real-Time Glass Refraction & Dispersion Engine';
  if (id === 'ascii-studio') return 'Shader-Based ASCII Typography Studio';

  if (kind === 'tool') {
    return `${item.category || 'Interactive Studio'} & GLSL Shader Engine`;
  }
  if (kind === 'gradient') {
    if (Array.isArray(item.hues) && item.hues.length > 0) {
      const hStr = item.hues.slice(0, 2).map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(' & ');
      return `${hStr} Procedural WebGL Gradient`;
    }
    return `${c1.name} & ${c2.name} Procedural Chromatic Flow`;
  }
  if (kind === '3d_scene') {
    if (item.typeTags && item.typeTags[0]) {
      const tagStr = item.typeTags[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `${tagStr} 3D WebGL Experience`;
    }
    return `${c1.name} Interactive Three.js Scene`;
  }
  if (kind === 'background') {
    return `4K ${c1.name} Cinematic Motion Backdrop`;
  }
  if (kind === 'section') {
    return `Editorial ${c1.name} Section Architecture`;
  }
  return `${c1.name} Cinematic WebGL Experience`;
}

function cleanDescription(item, kind, title, c1, c2) {
  const raw = (item.description || '').trim();
  if (item.id === 'yellow-liquid-ripples') {
    return 'A fluid, chromatic backdrop of melting yellow ripples and sunlit cream streaks, undulating with organic wave dynamics across an ultra-high-definition canvas.';
  }
  if (item.id === 'metal-human') {
    return 'A futuristic humanoid form sculpted in liquid mercury and polished chrome, catching specular studio highlights as light sweeps across its articulated metallic contours.';
  }
  if (raw.startsWith('Source files include') || raw.startsWith('Source files are include') || raw.length < 15) {
    if (kind === 'background') {
      return `A seamless 4K cinematic backdrop featuring organic ${c1.name.toLowerCase()} fluid dynamics and chromatic depth ripples, illuminated on a deep chiaroscuro stage.`;
    }
    if (kind === 'gradient') {
      return `A full-bleed procedural WebGL shader layer breathing with multi-octave harmonic noise, smoothly interpolating between ${c1.name.toLowerCase()} and ${c2.name.toLowerCase()}.`;
    }
    if (kind === '3d_scene') {
      return `An interactive 3D WebGL scene centered on a procedural ${c1.name.toLowerCase()} geometry orbiting with cursor physics and chiaroscuro studio lighting.`;
    }
    if (kind === 'tool') {
      return `A high-performance interactive 3D WebGL studio and shader workstation featuring real-time parameter tweaking, live asset mapping, and export pipelines.`;
    }
    return `A cinematic, scroll-driven web experience engineered with high-end ${c1.name.toLowerCase()} physical materials and reactive micro-interactions.`;
  }
  return raw.replace(/\\n/g, ' ').replace(/\s+/g, ' ');
}

function generatePrompt(item) {
  const generateBlueprint = generatePrompt;
  if (typeof window !== 'undefined' && window.GETLAYERS_BLUEPRINTS && window.GETLAYERS_BLUEPRINTS[item.id]) {
    return window.GETLAYERS_BLUEPRINTS[item.id];
  }
  if (typeof global !== 'undefined' && global.window && global.window.GETLAYERS_BLUEPRINTS && global.window.GETLAYERS_BLUEPRINTS[item.id]) {
    return global.window.GETLAYERS_BLUEPRINTS[item.id];
  }

  const title = item.title || 'Cinematic Component';
  const kind = deriveItemKind(item);
  const tag = item.tag || (kind === 'tool' ? 'STUDIO' : (kind === 'background' ? 'BACKGROUND' : (kind === 'gradient' ? 'GRADIENT' : (kind === '3d_scene' ? '3D SCENE' : 'TEMPLATE'))));
  const [c1, c2] = extractColors(item);
  const concept = deriveConcept(item, kind, c1, c2);
  const description = cleanDescription(item, kind, title, c1, c2);

  const keywords = Array.isArray(item.keywords) && item.keywords.length > 0 
    ? item.keywords.slice(0, 15).join(', ') 
    : `${kind}, webgl, threejs, cinematic, dark, physical-material, 60fps`;

  const moodList = Array.isArray(item.mood) ? item.mood.join(', ') : (item.mood || 'cinematic, luxury, technical');
  const tone = item.tone || 'dark';

  const videoUrl = item.posterVideo || item.previewVideo || `https://storage.getlayers.ai/${kind === '3d_scene' ? '3d_scenes' : (kind === 'gradient' ? 'gradients' : (kind === 'background' ? 'backgrounds' : 'templates'))}/${item.id}.mp4`;
  const imgUrl = item.image || item.previewImage || `https://storage.getlayers.ai/${kind === '3d_scene' ? '3d_scenes' : (kind === 'gradient' ? 'gradients' : (kind === 'background' ? 'backgrounds' : 'templates'))}/${item.id}.webp`;
  const desktopUrl = item.mockupDesktop || videoUrl.replace('.mp4', '-desktop.mp4');
  const mobileUrl = item.mockupMobile || videoUrl.replace('.mp4', '-mobile.mp4');
  const refUrl = kind === 'tool' ? `https://getlayers.ai/tools/${item.id}` : `https://getlayers.ai/layer/${item.id}`;

  let geometryCode = '';
  let shaderCode = '';
  let layoutControls = '';

  if (kind === 'tool') {
    geometryCode = `// 3. Tool Centerpiece Geometry: Dynamic Refractive Core
const geometry = new THREE.IcosahedronGeometry(1.25, 4);
const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('${c1.hex}'),
    roughness: 0.12,
    metalness: 0.08,
    transmission: 0.95,
    thickness: 1.4,
    ior: 1.54,
    chromaticAberration: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    attenuationColor: new THREE.Color('${c2.hex}'),
    attenuationDistance: 1.2
});
const heroMesh = new THREE.Mesh(geometry, material);
heroMesh.castShadow = true;
heroMesh.receiveShadow = true;
scene.add(heroMesh);`;

    shaderCode = `// 4. Interactive Studio Parameter & Custom Uniform Pipeline
const customUniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uDispersion: { value: 0.08 },
    uRoughness: { value: 0.12 }
};

// Background subtle dispersion grid shader plane
const bgQuadGeo = new THREE.PlaneGeometry(2, 2);
const bgQuadMat = new THREE.ShaderMaterial({
    uniforms: customUniforms,
    vertexShader: \`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    \`,
    fragmentShader: \`
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        varying vec2 vUv;
        void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
            float d = length(p - uMouse * 0.25);
            vec3 col = mix(vec3(0.02, 0.025, 0.035), vec3(0.05, 0.07, 0.1), smoothstep(1.5, 0.0, d));
            gl_FragColor = vec4(col, 1.0);
        }
    \`,
    depthWrite: false,
    depthTest: false
});
const bgMesh = new THREE.Mesh(bgQuadGeo, bgQuadMat);
camera.add(bgMesh);`;

    layoutControls = `<!-- Studio Workspace Dual-Panel -->
    <div class="studio-workspace">
        <div class="panel-left">
            <div class="panel-card">
                <span class="panel-label">Asset Pipeline</span>
                <div class="upload-dropzone" id="dropzone">
                    <span class="dropzone-text">Drop Texture / Vector SVG</span>
                </div>
                <div class="preset-pills">
                    <button class="pill-btn active">Preset 01: Pure Glass</button>
                    <button class="pill-btn">Preset 02: Iridescent Core</button>
                    <button class="pill-btn">Preset 03: Chromatic Aberration</button>
                </div>
            </div>
        </div>
        <div class="panel-right">
            <div class="panel-card">
                <span class="panel-label">Live Shader Uniforms</span>
                <div class="control-row">
                    <label>Dispersion</label>
                    <input type="range" min="0" max="100" value="45" id="slider-dispersion">
                </div>
                <div class="control-row">
                    <label>Roughness</label>
                    <input type="range" min="0" max="100" value="18" id="slider-roughness">
                </div>
                <div class="control-row">
                    <label>IOR Index</label>
                    <input type="range" min="100" max="250" value="154" id="slider-ior">
                </div>
                <button class="btn-action full-width" id="btn-export">Export Production Shader</button>
            </div>
        </div>
    </div>`;

  } else if (kind === 'gradient') {
    geometryCode = `// 3. Full-Screen Procedural Shader Plane
const quadGeo = new THREE.PlaneGeometry(2, 2);
const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorA: { value: new THREE.Color('${c1.hex}') },
        uColorB: { value: new THREE.Color('${c2.hex}') },
        uColorBg: { value: new THREE.Color('#050608') }
    },
    vertexShader: \`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    \`,
    fragmentShader: \`
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorBg;
        varying vec2 vUv;

        // Simplex 2D noise implementation
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        // Fractal Brownian Motion (FBM)
        float fbm(vec2 p) {
            float total = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 4; i++) {
                total += snoise(p) * amp;
                p = p * 2.05 + vec2(100.0);
                amp *= 0.5;
            }
            return total;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
            vec2 m = uMouse * 0.4;
            float t = uTime * 0.18;

            float q = fbm(uv + m + vec2(t * 0.3, t * 0.2));
            float r = fbm(uv + vec2(q * 1.5) + vec2(t * 0.4, -t * 0.3));

            vec3 col = mix(uColorBg, uColorA, smoothstep(-0.6, 0.8, q));
            col = mix(col, uColorB, smoothstep(-0.3, 0.9, r));

            // Soft radial vignette and dither
            float dist = length(uv);
            col *= smoothstep(1.8, 0.4, dist);
            gl_FragColor = vec4(col, 1.0);
        }
    \`,
    depthWrite: false,
    depthTest: false
});
const heroMesh = new THREE.Mesh(quadGeo, customMaterial);
scene.add(heroMesh);`;

    shaderCode = `// 4. Floating Micro-Sparkle Particle Swarm
const sparkCount = 280;
const sparkGeo = new THREE.BufferGeometry();
const sparkPositions = new Float32Array(sparkCount * 3);
const sparkSeeds = new Float32Array(sparkCount);
for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3 + 0] = (Math.random() - 0.5) * 8;
    sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    sparkSeeds[i] = Math.random() * 100;
}
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
const sparkMat = new THREE.PointsMaterial({
    color: new THREE.Color('${c1.glow}'),
    size: 0.04,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
});
const particleSystem = new THREE.Points(sparkGeo, sparkMat);
scene.add(particleSystem);`;

    layoutControls = `<!-- Floating Gradient HUD -->
    <div class="floating-hud">
        <div class="hud-pill">
            <span class="hud-dot"></span>
            <span class="hud-label">Harmonic Palette:</span>
            <span class="hud-val">${c1.name} / ${c2.name}</span>
        </div>
        <div class="hud-pill">
            <span class="hud-label">Algorithm:</span>
            <span class="hud-val">4-Octave Simplex FBM</span>
        </div>
        <div class="hud-pill">
            <span class="hud-label">Frame Budget:</span>
            <span class="hud-val">16.6ms (60 FPS Locked)</span>
        </div>
    </div>`;

  } else if (kind === '3d_scene') {
    geometryCode = `// 3. Central 3D Geometry Choreography
${item.id === 'orb' || keywords.includes('sphere') || keywords.includes('orb') ? `// Fibonacci Iridescent Sphere Point Cloud
const pointCount = 14000;
const pointsGeo = new THREE.BufferGeometry();
const posArray = new Float32Array(pointCount * 3);
const colArray = new Float32Array(pointCount * 3);
const phi = Math.PI * (3 - Math.sqrt(5));

for (let i = 0; i < pointCount; i++) {
    const y = 1 - (i / (pointCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    
    posArray[i * 3 + 0] = Math.cos(theta) * radius * 1.35;
    posArray[i * 3 + 1] = y * 1.35;
    posArray[i * 3 + 2] = Math.sin(theta) * radius * 1.35;

    const t = i / pointCount;
    const col = new THREE.Color().lerpColors(new THREE.Color('${c1.hex}'), new THREE.Color('${c2.hex}'), t);
    colArray[i * 3 + 0] = col.r;
    colArray[i * 3 + 1] = col.g;
    colArray[i * 3 + 2] = col.b;
}
pointsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
pointsGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

const pointsMat = new THREE.PointsMaterial({
    size: 0.024,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending
});
const heroMesh = new THREE.Points(pointsGeo, pointsMat);
scene.add(heroMesh);` : (item.id === 'pixel-glass' || keywords.includes('pixel') || keywords.includes('glass') ? `// Refractive Voxel Glass Monolith
const group = new THREE.Group();
const cubeGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('${c1.hex}'),
    roughness: 0.06,
    metalness: 0.04,
    transmission: 0.96,
    thickness: 1.6,
    ior: 1.62,
    chromaticAberration: 0.06,
    clearcoat: 1.0,
    attenuationColor: new THREE.Color('${c2.hex}'),
    attenuationDistance: 1.5
});

for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
        if ((x + y) % 2 === 0) {
            const m = new THREE.Mesh(cubeGeo, glassMat);
            m.position.set(x * 0.42, y * 0.42, (Math.random() - 0.5) * 0.2);
            m.castShadow = true;
            m.receiveShadow = true;
            group.add(m);
        }
    }
}
const heroMesh = group;
scene.add(heroMesh);` : `// Sculpted Physical Mesh Centerpiece
const geometry = new THREE.TorusKnotGeometry(0.95, 0.32, 160, 32);
const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('${c1.hex}'),
    roughness: 0.14,
    metalness: 0.10,
    transmission: 0.90,
    thickness: 1.35,
    ior: 1.52,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    attenuationColor: new THREE.Color('${c2.hex}'),
    attenuationDistance: 1.8
});
const heroMesh = new THREE.Mesh(geometry, material);
heroMesh.castShadow = true;
heroMesh.receiveShadow = true;
scene.add(heroMesh);`)}`;

    shaderCode = `// 4. Drifting Chiaroscuro Sparks System
const sparkCount = 380;
const sparkGeo = new THREE.BufferGeometry();
const sparkPositions = new Float32Array(sparkCount * 3);
for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3 + 0] = (Math.random() - 0.5) * 6;
    sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
}
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
const sparkMat = new THREE.PointsMaterial({
    color: new THREE.Color('${c1.glow}'),
    size: 0.035,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
});
const particleSystem = new THREE.Points(sparkGeo, sparkMat);
scene.add(particleSystem);`;

    layoutControls = `<!-- Floating 3D Inspector Dock -->
    <div class="floating-dock">
        <div class="dock-header">
            <span class="dock-title">3D Stage Parameters</span>
            <span class="dock-badge">Interactive</span>
        </div>
        <div class="dock-stats">
            <div class="stat-item">
                <span class="stat-num">60fps</span>
                <span class="stat-lbl">Physics</span>
            </div>
            <div class="stat-item">
                <span class="stat-num">ACES</span>
                <span class="stat-lbl">Filmic Tone</span>
            </div>
            <div class="stat-item">
                <span class="stat-num">PCF</span>
                <span class="stat-lbl">Soft Shadows</span>
            </div>
        </div>
    </div>`;

  } else if (kind === 'background') {
    geometryCode = `// 3. Cinematic 4K Background Plane & Shaders
const bgPlaneGeo = new THREE.PlaneGeometry(16, 9);
const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorA: { value: new THREE.Color('${c1.hex}') },
        uColorB: { value: new THREE.Color('${c2.hex}') }
    },
    vertexShader: \`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    \`,
    fragmentShader: \`
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec2 vUv;
        void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float t = uTime * 0.25;
            float wave = sin(p.x * 4.0 + t) * cos(p.y * 3.0 - t * 0.7);
            vec3 col = mix(vec3(0.02, 0.025, 0.035), uColorA, smoothstep(-0.8, 1.0, wave) * 0.45);
            col = mix(col, uColorB, smoothstep(0.2, 1.2, wave) * 0.3);
            float vign = smoothstep(1.4, 0.2, length(p));
            gl_FragColor = vec4(col * vign, 1.0);
        }
    \`
});
const heroMesh = new THREE.Mesh(bgPlaneGeo, customMaterial);
heroMesh.position.z = -2.5;
scene.add(heroMesh);`;

    shaderCode = `// 4. Atmospheric Floating Ember Field
const emberCount = 300;
const emberGeo = new THREE.BufferGeometry();
const emberPos = new Float32Array(emberCount * 3);
for (let i = 0; i < emberCount; i++) {
    emberPos[i * 3 + 0] = (Math.random() - 0.5) * 10;
    emberPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    emberPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
}
emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
const emberMat = new THREE.PointsMaterial({
    color: new THREE.Color('${c1.glow}'),
    size: 0.03,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
});
const particleSystem = new THREE.Points(emberGeo, emberMat);
scene.add(particleSystem);`;

    layoutControls = `<!-- Atmospheric Backdrop HUD -->
    <div class="backdrop-controls">
        <div class="backdrop-pill">
            <span class="pill-title">Seamless Loop</span>
            <span class="pill-desc">4K Ultra HD &bullet; 60 FPS Locked</span>
        </div>
        <div class="backdrop-pill">
            <span class="pill-title">Editorial Contrast</span>
            <span class="pill-desc">Dual Radial Vignette Active</span>
        </div>
    </div>`;

  } else {
    geometryCode = `// 3. Architectural 3D Centerpiece
const geometry = new THREE.TorusKnotGeometry(0.9, 0.28, 128, 32);
const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('${c1.hex}'),
    roughness: 0.16,
    metalness: 0.12,
    transmission: 0.88,
    thickness: 1.4,
    ior: 1.52,
    chromaticAberration: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    attenuationColor: new THREE.Color('${c2.hex}'),
    attenuationDistance: 2.0
});
const heroMesh = new THREE.Mesh(geometry, material);
heroMesh.castShadow = true;
heroMesh.receiveShadow = true;
scene.add(heroMesh);`;

    shaderCode = `// 4. Ambient Spark Swarm (400 Additive Point Particles)
const sparkCount = 400;
const sparkGeo = new THREE.BufferGeometry();
const sparkPositions = new Float32Array(sparkCount * 3);
for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3 + 0] = (Math.random() - 0.5) * 8;
    sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
}
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
const sparkMat = new THREE.PointsMaterial({
    color: new THREE.Color('${c1.glow}'),
    size: 0.038,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const particleSystem = new THREE.Points(sparkGeo, sparkMat);
scene.add(particleSystem);`;

    layoutControls = `<!-- Editorial Text Slides (Fade & Blur-Up Progression) -->
    <main class="slides-container">
        <section class="slide active" id="slide-1">
            <div class="slide-tag">${tag} &bull; 01</div>
            <h1 class="slide-title">${title}</h1>
            <p class="slide-desc">${description}</p>
        </section>
        <section class="slide" id="slide-2">
            <div class="slide-tag">ARCHITECTURE &bull; 02</div>
            <h2 class="slide-title">Kinetic Choreography</h2>
            <p class="slide-desc">Spring-lerped 3D camera orbit with cursor inertia tracking and real-time physical transmission.</p>
        </section>
        <section class="slide" id="slide-3">
            <div class="slide-tag">SPECIFICATION &bull; 03</div>
            <h2 class="slide-title">Production Quality</h2>
            <p class="slide-desc">Zero external dependencies, locked 60fps frame budget, and pure unbundled ES module architecture.</p>
        </section>
    </main>`;
  }

  return `# Recreate this site as a single HTML file: ${title} — ${concept}

You are an expert creative front-end developer. Produce a **single self-contained \`index.html\`** that reproduces the project below **exactly** — same layout, sections, visuals, motion, and interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler. Use ES modules with a CDN importmap for Three.js (r0.160 from unpkg). Hardcode every value given here as a fixed constant. Rebuild each component described below as a section of the one file.

## What it is

${description}

- **Atmosphere & Tone**: Tone: \`${tone}\` | Mood: \`${moodList}\`.
- **Palette Signature**: Primary: \`${c1.name} (${c1.hex})\`, Secondary: \`${c2.name} (${c2.hex})\`, Canvas: \`Deep Black (#050608)\`.
- **Keywords**: ${keywords}.
- **Narrative Choreography**:
  - Full-bleed cinematic viewport stage with fixed WebGL canvas layer (\`#webgl\`) positioned beneath interactive HTML overlays.
  - Custom two-element pointer (\`.cursor-inner\` and \`.cursor-outer\`) with spring inertia damping (~0.06).
  - Smooth 3-point chiaroscuro studio lighting casting PCF soft shadows over physical glass and metal materials.
  - Real-time particle swarms (${kind === 'tool' ? '300+' : '400'} particles) drifting with trigonometric turbulence.
  - 60 FPS locked render budget (16.6ms frame time) with zero layout shifts and smooth scroll/mouse lerping.

## Page shell & libraries

- \`<!DOCTYPE html>\`, \`lang="en"\`, \`<title>${title} — ${concept}</title>\`, \`<meta charset="UTF-8">\`, \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`.
- Load fonts in CSS:
  \`@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');\`
- Importmap + module script for Three.js:
  \`\`\`html
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
  </script>
  <script type="module">
    /* all Three.js WebGL and interactive logic runs here */
  </script>
  \`\`\`
- The page model: full viewport cinematic stage (\`width: 100vw; min-height: 100vh; overflow-x: hidden; background: #050608;\`), canvas \`#webgl\` fixed at \`top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1;\`.
- Native cursor hidden with \`cursor: none !important;\` across all elements, replaced by a custom two-element fluid cursor (\`.cursor-inner\` and \`.cursor-outer\`).
- All scrollbars disabled with \`scrollbar-width: none;\` and \`::-webkit-scrollbar { display: none; }\`.

## Global CSS (reset + base)

\`\`\`css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    cursor: none !important;
}

:root {
    --bg-dark: #050608;
    --accent: ${c1.hex};
    --accent-glow: ${c1.glow};
    --accent-secondary: ${c2.hex};
    --text-primary: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.65);
    --text-dim: rgba(255, 255, 255, 0.35);
    --card-glass: rgba(18, 22, 28, 0.65);
    --card-border: rgba(255, 255, 255, 0.12);
    --card-border-active: rgba(255, 255, 255, 0.45);
}

html, body {
    width: 100%;
    min-height: 100%;
    background-color: var(--bg-dark);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text-primary);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
}

/* Custom Two-Element Fluid Cursor */
.cursor-inner {
    position: fixed;
    top: 0;
    left: 0;
    width: 6px;
    height: 6px;
    background: #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    transition: opacity 0.2s ease;
}

.cursor-outer {
    position: fixed;
    top: 0;
    left: 0;
    width: 38px;
    height: 38px;
    border: 1.5px solid rgba(255, 255, 255, 0.65);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9998;
    transition: width 0.25s ease, height 0.25s ease, border-color 0.3s ease, background 0.3s ease;
}

.cursor-outer.hover {
    width: 54px;
    height: 54px;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.06);
}

#webgl {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    outline: none;
    display: block;
    pointer-events: none;
}

/* Blueprint Grid Layer */
.blueprint-grid {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 2;
    background-size: 80px 80px;
    background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
}

/* UI Overlay Layer */
.cinematic-container {
    position: relative;
    z-index: 10;
    width: 100%;
    min-height: 100vh;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
}

.main-header {
    width: 100%;
    padding: 28px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 20;
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand-title {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--text-primary);
}

.brand-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--card-border);
    color: var(--accent-glow);
    text-transform: uppercase;
}

.header-nav {
    display: flex;
    align-items: center;
    gap: 32px;
}

.header-nav a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    transition: color 0.2s ease;
}

.header-nav a:hover {
    color: var(--text-primary);
}

.btn-action {
    background: transparent;
    border: 1px solid var(--card-border-active);
    color: var(--text-primary);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    transition: all 0.25s ease;
}

.btn-action:hover {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 20px var(--accent-glow);
}
\`\`\`

## Layout & sections (in order)

The body markup, in order: two cursor divs, the hairline grid overlay, the \`<canvas id="webgl">\`, and the \`.cinematic-container\` overlay containing the header, brand, slides / headlines, and interactive controls.

### Custom cursor & canvas (top of \`<body>\`)
\`\`\`html
<div class="cursor-inner"></div>
<div class="cursor-outer"></div>
<div class="blueprint-grid"></div>
<canvas id="webgl"></canvas>
\`\`\`

### Main Header \`.main-header\`
\`\`\`html
<header class="main-header">
    <div class="brand">
        <span class="brand-title">${title.toUpperCase()}</span>
        <span class="brand-badge">${tag}</span>
    </div>
    <nav class="header-nav">
        <a href="#overview">Overview</a>
        <a href="#visuals">Visuals</a>
        <a href="#shaders">Shaders</a>
        <a href="#specs">Specifications</a>
    </nav>
    <div class="header-actions">
        <button class="btn-action">60 FPS Locked</button>
    </div>
</header>
\`\`\`

### UI Sections & Interactive Controls
\`\`\`html
<div class="cinematic-container">
    ${layoutControls}
</div>
\`\`\`

## The WebGL scene / Script

Verbatim production Three.js ES module script:

\`\`\`js
import * as THREE from 'three';

// 1. Scene, Camera & ACES Filmic Tone Mapping Setup
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#050608');
scene.fog = new THREE.FogExp2('#050608', 0.025);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 4.5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 2. Studio 3-Point Chiaroscuro Lighting Pipeline
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const keyLight = new THREE.SpotLight(0xffffff, 4.2);
keyLight.position.set(4.0, 5.5, 4.0);
keyLight.angle = Math.PI / 4;
keyLight.penumbra = 0.5;
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(${c1.num}, 3.0);
rimLight.position.set(-3.5, 2.5, -4.0);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
fillLight.position.set(-4.0, -2.0, 3.0);
scene.add(fillLight);

${geometryCode}

${shaderCode}

// 5. Physics State & Animation Loop
let currentScroll = 0, targetScroll = 0;
let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
const clock = new THREE.Clock();

window.addEventListener('scroll', () => {
    targetScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
});

window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Update custom cursor
    const cursorInner = document.querySelector('.cursor-inner');
    const cursorOuter = document.querySelector('.cursor-outer');
    if (cursorInner) {
        cursorInner.style.transform = \`translate(\${e.clientX}px, \${e.clientY}px) translate(-50%, -50%)\`;
    }
    if (cursorOuter) {
        cursorOuter.style.transform = \`translate(\${e.clientX}px, \${e.clientY}px) translate(-50%, -50%)\`;
    }
});

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Lerp mouse and scroll coordinates for buttery smooth 60fps inertia
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;
    currentScroll += (targetScroll - currentScroll) * 0.08;

    // Camera orbit & mesh rotation
    if (typeof heroMesh !== 'undefined' && heroMesh) {
        heroMesh.rotation.y = elapsedTime * 0.25 + mouseX * 0.45;
        heroMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15 - mouseY * 0.35;
        heroMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
    }

    // Update shader uniforms
    if (typeof customMaterial !== 'undefined' && customMaterial && customMaterial.uniforms) {
        if (customMaterial.uniforms.uTime) customMaterial.uniforms.uTime.value = elapsedTime;
        if (customMaterial.uniforms.uMouse) customMaterial.uniforms.uMouse.value.set(mouseX, mouseY);
    }
    if (typeof customUniforms !== 'undefined' && customUniforms) {
        if (customUniforms.uTime) customUniforms.uTime.value = elapsedTime;
        if (customUniforms.uMouse) customUniforms.uMouse.value.set(mouseX, mouseY);
    }

    // Animate particle systems
    if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.05;
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(elapsedTime + i) * 0.002;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (typeof customMaterial !== 'undefined' && customMaterial && customMaterial.uniforms && customMaterial.uniforms.uResolution) {
        customMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
});

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    animate();
});
\`\`\`

## Fixed parameters (bake these in)

| Parameter | Fixed Value | Description |
|---|---|---|
| Stage Background | \`#050608\` | Deep luxury chiaroscuro canvas base |
| Scene Fog | \`THREE.FogExp2('#050608', 0.025)\` | Atmospheric depth and distance falloff |
| Camera FOV | \`45°\` | Natural perspective with zero distortion |
| Camera Position | \`(0, 0, 4.5)\` | Centered staging viewport coordinates |
| Tone Mapping | \`THREE.ACESFilmicToneMapping\` | Filmic dynamic range color curve |
| Exposure | \`1.35\` | Balanced highlight retention and contrast |
| Key SpotLight | \`Intensity: 4.2 @ (4.0, 5.5, 4.0)\` | PCFSoftShadowMap shadow caster, 2048x2048 map |
| Rim DirectionalLight | \`Intensity: 3.0 @ (-3.5, 2.5, -4.0)\` | Edge separation and silhouette highlight (\`${c1.hex}\`) |
| Fill DirectionalLight | \`Intensity: 1.2 @ (-4.0, -2.0, 3.0)\` | Cool ambient shadow illumination |
| Material Roughness | \`0.14\` | Polished micro-surface reflection |
| Material Metalness | \`0.10\` | Subtle metallic sheen without loss of color |
| Transmission | \`0.90\` | Optical glass transparency & light throughput |
| Index of Refraction (IOR) | \`1.52\` | Natural crown glass optical refraction |
| Particle Count | \`${kind === 'tool' ? '300' : '400'}\` | Floating additive spark / ambient dust particles |
| Physics Damping | \`0.06\` | Spring inertia cursor & scroll tracking factor |
| Frame Rate Target | \`60 FPS Locked\` | 16.6ms per frame budget with zero CPU jank |

## Assets

| Asset | Role | Endpoint URL |
|---|---|---|
| Master 4K Video Loop | Flagship 60fps cinematic video stream | \`${videoUrl}\` |
| High-Res Poster Frame | High-fidelity WebP visual poster | \`${imgUrl}\` |
| Desktop Preview Loop | Desktop interactive viewport recording | \`${desktopUrl}\` |
| Mobile Preview Loop | Mobile responsive viewport recording | \`${mobileUrl}\` |
| GetLayers Ground Truth | Canonical architecture reference URL | \`${refUrl}\` |

All 3D geometry, physical materials, particle systems, and shader pipelines are engineered to assemble in pure vanilla code without external 3D asset downloads. Typography is loaded directly via Google Fonts (\`Italiana\`, \`Outfit\`, \`Playfair Display\`, \`Plus Jakarta Sans\`).`;
}


const generateBlueprint = generatePrompt;

function initApp() {
  const data = window.GETLAYERS_DATA || [];

  // High-Performance Viewport Autoplay Observer (Matches GetLayers native continuous loop engine)
  const viewportVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const wrap = video.closest('.card-media-wrap');
      if (entry.isIntersecting) {
        video.muted = true;
        video.defaultMuted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
        if (wrap) {
          wrap.classList.remove('is-playing');
          wrap.classList.remove('is-buffering');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '150px 0px 150px 0px', // Preload smoothly before entering screen
    threshold: 0.15
  });
  const cardsGrid = document.getElementById('cardsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryTabs = document.getElementById('categoryTabs');
  const noResults = document.getElementById('noResults');
  const loadingMore = document.getElementById('loadingMore');
  const headerTotalCount = document.getElementById('headerTotalCount');

  // Modal elements
  const detailModal = document.getElementById('detailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalViewSwitcher = document.getElementById('modalViewSwitcher');
  const modalMedia = document.getElementById('modalMedia');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalLikes = document.getElementById('modalLikes');
  const modalDesc = document.getElementById('modalDesc');
  const modalPromptText = document.getElementById('modalPromptText');
  const modalCodeText = document.getElementById('modalCodeText');
  const modalAuditView = document.getElementById('modalAuditView');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const copyBtnText = document.getElementById('copyBtnText');
  const modalAssetLink = document.getElementById('modalAssetLink');
  const toast = document.getElementById('toast');

  let currentCategory = 'all';
  let currentSearch = '';
  let currentDrawerTab = 'prompt';
  let currentModalItem = null;
  let currentModalLikes = 0;

  // Persistent Favourites System (localStorage)
  const FAVOURITES_KEY = 'getlayers_favourites';

  function getFavourites() {
    try {
      const raw = localStorage.getItem(FAVOURITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function isFavourite(id) {
    if (!id) return false;
    const favs = getFavourites();
    return favs.includes(String(id));
  }

  function toggleFavourite(id) {
    if (!id) return false;
    let favs = getFavourites();
    const strId = String(id);
    const idx = favs.indexOf(strId);
    let nowFav = false;
    if (idx >= 0) {
      favs.splice(idx, 1);
      nowFav = false;
    } else {
      favs.push(strId);
      nowFav = true;
    }
    try {
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs));
    } catch (e) {}
    updateFavouritesCount();
    return nowFav;
  }

  function updateFavouritesCount() {
    const el = document.getElementById('count-favourites');
    if (el) {
      el.textContent = getFavourites().length;
    }
  }

  function updateCardHeartState(card, isFav, baseLikes) {
    const btn = card.querySelector('.card-heart-btn');
    if (!btn) return;
    const count = isFav ? baseLikes + 1 : baseLikes;
    btn.classList.toggle('is-favourite', isFav);
    btn.title = isFav ? 'Remove from Favourites' : 'Add to Favourites';
    const icon = btn.querySelector('.heart-icon');
    const label = btn.querySelector('.likes-count');
    if (icon) icon.textContent = isFav ? '♥' : '♡';
    if (label) label.textContent = count;
  }

  function updateModalHeartState(isFav, baseLikes) {
    if (!modalLikes) return;
    const count = isFav ? baseLikes + 1 : baseLikes;
    modalLikes.classList.toggle('is-favourite', isFav);
    modalLikes.title = isFav ? 'Remove from Favourites' : 'Save to Favourites';
    modalLikes.innerHTML = `<span class="heart-icon">${isFav ? '♥' : '♡'}</span> <span class="likes-count">${count}</span>`;
  }

  // Pagination / Chunking State for 770+ items
  const INITIAL_BATCH = 28;
  const CHUNK_SIZE = 24;
  let renderedCount = 0;
  let activeFilteredList = [];
  let isLoadingChunk = false;

  // Initialize Category Counts dynamically
  const toolsData = window.GETLAYERS_TOOLS || [];
  const counts = {
    all: data.length,
    templates: data.filter(d => d.categoryType === 'templates').length,
    '3d_scenes': data.filter(d => d.categoryType === '3d_scenes').length,
    backgrounds: data.filter(d => d.categoryType === 'backgrounds').length,
    gradients: data.filter(d => d.categoryType === 'gradients').length,
    sections: data.filter(d => d.categoryType === 'sections').length,
    tools: toolsData.length,
    favourites: getFavourites().length
  };

  if (headerTotalCount) {
    headerTotalCount.textContent = data.length;
  }

  for (const [key, val] of Object.entries(counts)) {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = val;
  }

  // Filter and Search logic
  function getFilteredItems() {
    const q = currentSearch.toLowerCase().trim();

    if (currentCategory === 'favourites') {
      const favSet = new Set(getFavourites().map(String));
      const allItems = [...data, ...(window.GETLAYERS_TOOLS || [])];
      return allItems.filter(item => {
        if (!favSet.has(String(item.id))) return false;
        if (!q) return true;
        const titleMatch = item.title && item.title.toLowerCase().includes(q);
        const descMatch = item.description && item.description.toLowerCase().includes(q);
        const tagMatch = item.tag && item.tag.toLowerCase().includes(q);
        const labelMatch = item.categoryLabel && item.categoryLabel.toLowerCase().includes(q);
        const stackMatch = Array.isArray(item.stack) && item.stack.some(s => s.toLowerCase().includes(q));
        const tagsMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
        return titleMatch || descMatch || tagMatch || labelMatch || stackMatch || tagsMatch;
      });
    }

    if (currentCategory === 'tools') {
      const tools = window.GETLAYERS_TOOLS || [];
      if (!q) return tools;
      return tools.filter(t => {
        return (t.title && t.title.toLowerCase().includes(q)) ||
               (t.description && t.description.toLowerCase().includes(q)) ||
               (t.category && t.category.toLowerCase().includes(q)) ||
               (Array.isArray(t.tech) && t.tech.some(x => x.toLowerCase().includes(q)));
      });
    }

    return data.filter(item => {
      const matchCat = currentCategory === 'all' || item.categoryType === currentCategory;
      if (!matchCat) return false;
      if (!q) return true;

      const titleMatch = item.title && item.title.toLowerCase().includes(q);
      const descMatch = item.description && item.description.toLowerCase().includes(q);
      const tagMatch = item.tag && item.tag.toLowerCase().includes(q);
      const labelMatch = item.categoryLabel && item.categoryLabel.toLowerCase().includes(q);
      const stackMatch = Array.isArray(item.stack) && item.stack.some(s => s.toLowerCase().includes(q));
      const tagsMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));

      return titleMatch || descMatch || tagMatch || labelMatch || stackMatch || tagsMatch;
    });
  }

  // Render Pipeline
  function render() {
    activeFilteredList = getFilteredItems();
    cardsGrid.innerHTML = '';
    renderedCount = 0;

    if (activeFilteredList.length === 0) {
      const titleEl = noResults.querySelector('.no-results-title');
      const subEl = noResults.querySelector('.no-results-sub');
      if (currentCategory === 'favourites') {
        if (titleEl) titleEl.textContent = 'No favourites saved yet';
        if (subEl) subEl.textContent = 'Click the heart icon on any template, 3D scene, or background to bookmark it!';
      } else {
        if (titleEl) titleEl.textContent = 'No matching templates found';
        if (subEl) subEl.textContent = 'Try searching for another keyword or change your filter.';
      }
      noResults.classList.remove('hidden');
      if (loadingMore) loadingMore.classList.add('hidden');
      return;
    }

    noResults.classList.add('hidden');
    loadNextBatch(INITIAL_BATCH);
  }

  // Append items in chunks to guarantee 60fps
  function loadNextBatch(size = CHUNK_SIZE) {
    if (renderedCount >= activeFilteredList.length) {
      if (loadingMore) loadingMore.classList.add('hidden');
      return;
    }

    isLoadingChunk = true;
    const nextItems = activeFilteredList.slice(renderedCount, renderedCount + size);
    const fragment = document.createDocumentFragment();

    nextItems.forEach((item, index) => {
      const card = createCard(item, renderedCount + index);
      fragment.appendChild(card);
    });

    cardsGrid.appendChild(fragment);
    renderedCount += nextItems.length;
    isLoadingChunk = false;

    if (loadingMore) {
      if (renderedCount < activeFilteredList.length) {
        loadingMore.classList.remove('hidden');
      } else {
        loadingMore.classList.add('hidden');
      }
    }
  }

  // Infinite Scroll Observer
  if (window.IntersectionObserver && loadingMore) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingChunk && renderedCount < activeFilteredList.length) {
        loadNextBatch();
      }
    }, { rootMargin: '400px' });
    observer.observe(loadingMore);
  } else {
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        if (!isLoadingChunk && renderedCount < activeFilteredList.length) {
          loadNextBatch();
        }
      }
    }, { passive: true });
  }

  function createCard(item, index) {
    if (item.route) {
      // Dedicated Interactive Tool Card
      const card = document.createElement('article');
      card.className = 'card card-tool-special';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      const techTags = (item.tech || ['WebGL', 'Three.js']).map(t => `<span class="tool-tech-pill">${escapeHtml(t)}</span>`).join('');
      const toolLikes = 195;
      const isFav = isFavourite(item.id);
      const displayLikes = isFav ? toolLikes + 1 : toolLikes;
      
      card.innerHTML = `
        <div class="card-media-wrap tool-media-wrap">
          <span class="card-badge-top">${escapeHtml(item.category)}</span>
          <button type="button" class="card-likes-top card-heart-btn ${isFav ? 'is-favourite' : ''}" data-id="${escapeHtml(item.id)}" title="${isFav ? 'Remove from Favourites' : 'Add to Favourites'}" aria-label="Favourite">
            <span class="heart-icon">${isFav ? '♥' : '♡'}</span>
            <span class="likes-count">${displayLikes}</span>
          </button>
          <span class="card-badge-new">NEW</span>
          <div class="tool-ambient-mesh">
            <div class="mesh-orb"></div>
            <div class="mesh-symbol">✦</div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <span class="card-tag">3D STUDIO</span>
          </div>
          <p class="card-desc">${escapeHtml(item.description)}</p>
          <div class="tool-tech-row">${techTags}</div>
          <div class="card-footer">
            <span class="btn-card-action btn-tool-action">
              <span>${item.id === 'holographic-cloth' ? 'Launch 3D Studio ↗' : item.id === 'refract' ? 'Launch Refract Studio ↗' : item.id === 'ascii-studio' ? 'Launch ASCII Studio ↗' : item.id === 'svg-to-3d' ? 'Launch SVG 3D Studio ↗' : 'Inspect Tool Specs'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </span>
          </div>
        </div>
      `;

      const favBtn = card.querySelector('.card-heart-btn');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const nowFav = toggleFavourite(item.id);
          updateCardHeartState(card, nowFav, toolLikes);
          if (currentModalItem && currentModalItem.id === item.id) {
            updateModalHeartState(nowFav, toolLikes);
          }
          if (currentCategory === 'favourites') {
            render();
          }
        });
      }

      card.addEventListener('click', () => {
        if (item.id === 'holographic-cloth') {
          window.location.href = 'tools/holographic-cloth/index.html';
        } else if (item.id === 'refract') {
          window.location.href = 'tools/refract/index.html';
        } else if (item.id === 'ascii-studio') {
          window.location.href = 'tools/ascii-studio/index.html';
        } else if (item.id === 'svg-to-3d') {
          window.location.href = 'tools/svg-to-3d/index.html';
        } else {
          openModal(item, toolLikes);
        }
      });
      return card;
    }

    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const baseLikes = item.likes !== undefined ? item.likes : (20 + (index * 7) % 80);
    const isFav = isFavourite(item.id);
    const displayLikes = isFav ? baseLikes + 1 : baseLikes;
    const previewImg = item.previewImage || item.image || '';
    const previewVid = item.posterVideo || item.previewVideo || item.posterVideoPreview || '';
    const isStatic = item.mediaType === 'static' || (!item.posterVideo && !item.previewVideo);
    const hasVideo = !isStatic && !!previewVid;
    const catLabel = item.categoryLabel || item.category || 'Component';
    const tagDisplay = item.tag || (Array.isArray(item.tags) && item.tags[0] ? item.tags[0].toUpperCase() : 'PRO');

    let mediaHtml = `
      <div class="card-media-wrap">
        <span class="card-badge-top">${escapeHtml(catLabel)}</span>
        <button type="button" class="card-likes-top card-heart-btn ${isFav ? 'is-favourite' : ''}" data-id="${escapeHtml(item.id)}" title="${isFav ? 'Remove from Favourites' : 'Add to Favourites'}" aria-label="Favourite">
          <span class="heart-icon">${isFav ? '♥' : '♡'}</span>
          <span class="likes-count">${displayLikes}</span>
        </button>
        <div class="media-spinner"></div>`;
    if (previewImg) {
      mediaHtml += `<img class="card-img" src="${escapeHtml(previewImg)}" alt="${escapeHtml(item.title)}" loading="lazy" />`;
    }
    if (hasVideo) {
      mediaHtml += `<video class="card-video" src="${escapeHtml(previewVid)}" loop muted playsinline preload="metadata"></video>`;
    }
    mediaHtml += `</div>`;

    card.innerHTML = mediaHtml + `
      <div class="card-body">
        <div class="card-title-row">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <span class="card-tag">${escapeHtml(tagDisplay)}</span>
        </div>
        <p class="card-desc">${escapeHtml(item.description || 'Cinematic, ultra-polished component engineered for modern landing pages.')}</p>
        <div class="card-footer">
          <span class="btn-card-action">
            <span>Inspect & Prompt</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </span>
        </div>
      </div>
    `;

    const favBtn = card.querySelector('.card-heart-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const nowFav = toggleFavourite(item.id);
        updateCardHeartState(card, nowFav, baseLikes);
        if (currentModalItem && currentModalItem.id === item.id) {
          updateModalHeartState(nowFav, baseLikes);
        }
        if (currentCategory === 'favourites') {
          render();
        }
      });
    }

    // Continuous Viewport Autoplay Engine (Native GetLayers 60fps Experience)
    if (hasVideo) {
      const wrap = card.querySelector('.card-media-wrap');
      const video = card.querySelector('.card-video');

      if (video && viewportVideoObserver) {
        viewportVideoObserver.observe(video);
      }

      video.addEventListener('playing', () => {
        wrap.classList.remove('is-buffering');
        wrap.classList.add('is-playing');
      });

      video.addEventListener('waiting', () => {
        if (!wrap.classList.contains('is-playing')) {
          wrap.classList.add('is-buffering');
        }
      });

      // Hover focus: ensure playing and prevent pausing while hovering
      card.addEventListener('mouseenter', () => {
        if (video) {
          video.muted = true;
          const p = video.play();
          if (p !== undefined) p.catch(() => {});
        }
      });
    }

    // Click to Open Modal
    card.addEventListener('click', () => openModal(item, baseLikes));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(item, baseLikes);
      }
    });

    return card;
  }

  // Authentic GetLayers View Switcher Icons
  const VIEW_ICONS = {
    scene: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.12 6.4-6.05-3.5a2 2 0 0 0-2.14 0L6.88 6.4a2 2 0 0 0-1 1.73v7a2 2 0 0 0 1 1.73l6.05 3.5a2 2 0 0 0 2.14 0l6.05-3.5a2 2 0 0 0 1-1.73v-7a2 2 0 0 0-1-1.73Z"></path><path d="M12 22V12"></path><polyline points="3.29 7 12 12 20.71 7"></polyline></svg>`,
    desktop: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>`,
    mobile: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>`,
    poster: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`
  };

  // Open Modal
  function openModal(item, likes) {
    currentModalItem = item;
    currentModalLikes = likes;

    const isFav = isFavourite(item.id);
    updateModalHeartState(isFav, likes);

    const catLabel = item.categoryLabel || item.category || 'Component';
    const tagDisplay = item.tag || 'AI Ready';
    modalCategory.textContent = `${catLabel} · ${tagDisplay}`;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.description || `A cinematic, ultra-polished ${catLabel.toLowerCase()} engineered with smooth physics, dark-mode elegance, and high visual impact.`;

    let studioLaunchBtn = document.getElementById('modalStudioLaunchLink');
    if (!studioLaunchBtn) {
      const modalActions = document.querySelector('.modal-actions');
      if (modalActions) {
        studioLaunchBtn = document.createElement('a');
        studioLaunchBtn.id = 'modalStudioLaunchLink';
        studioLaunchBtn.className = 'btn-primary hidden';
        studioLaunchBtn.innerHTML = `<span>Launch Studio ↗</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
        modalActions.insertBefore(studioLaunchBtn, modalActions.firstChild);
      }
    }
    if (studioLaunchBtn) {
      if (item.id === 'refract') {
        studioLaunchBtn.href = 'tools/refract/index.html';
        const span = studioLaunchBtn.querySelector('span');
        if (span) span.textContent = 'Launch Refract Studio ↗';
        else studioLaunchBtn.textContent = 'Launch Refract Studio ↗';
        studioLaunchBtn.classList.remove('hidden');
      } else if (item.id === 'holographic-cloth') {
        studioLaunchBtn.href = 'tools/holographic-cloth/index.html';
        const span = studioLaunchBtn.querySelector('span');
        if (span) span.textContent = 'Launch 3D Studio ↗';
        else studioLaunchBtn.textContent = 'Launch 3D Studio ↗';
        studioLaunchBtn.classList.remove('hidden');
      } else if (item.id === 'ascii-studio') {
        studioLaunchBtn.href = 'tools/ascii-studio/index.html';
        const span = studioLaunchBtn.querySelector('span');
        if (span) span.textContent = 'Launch ASCII Studio ↗';
        else studioLaunchBtn.textContent = 'Launch ASCII Studio ↗';
        studioLaunchBtn.classList.remove('hidden');
      } else if (item.id === 'svg-to-3d') {
        studioLaunchBtn.href = 'tools/svg-to-3d/index.html';
        const span = studioLaunchBtn.querySelector('span');
        if (span) span.textContent = 'Launch SVG 3D Studio ↗';
        else studioLaunchBtn.textContent = 'Launch SVG 3D Studio ↗';
        studioLaunchBtn.classList.remove('hidden');
      } else {
        studioLaunchBtn.classList.add('hidden');
      }
    }

    // Dynamic detection of available views
    const availableViews = [];
    const rawSceneVideo = item.posterVideo || item.previewVideo;
    if (rawSceneVideo) {
      availableViews.push({
        id: 'scene',
        label: '4K 3D Scene',
        type: 'video',
        url: rawSceneVideo,
        isMobile: false,
        iconSvg: VIEW_ICONS.scene
      });
    }
    if (item.mockupDesktop) {
      availableViews.push({
        id: 'desktop',
        label: 'Desktop View',
        type: 'video',
        url: item.mockupDesktop,
        isMobile: false,
        iconSvg: VIEW_ICONS.desktop
      });
    }
    if (item.mockupMobile) {
      availableViews.push({
        id: 'mobile',
        label: 'Mobile View',
        type: 'video',
        url: item.mockupMobile,
        isMobile: true,
        iconSvg: VIEW_ICONS.mobile
      });
    }
    const posterImg = item.image || item.previewImage;
    if (posterImg) {
      availableViews.push({
        id: 'poster',
        label: '4K Poster',
        type: 'image',
        url: posterImg,
        isMobile: false,
        iconSvg: VIEW_ICONS.poster
      });
    }

    function switchModalView(view) {
      if (!view) return;

      // Update switcher tabs active state
      if (modalViewSwitcher) {
        modalViewSwitcher.querySelectorAll('.modal-view-tab').forEach((tab) => {
          const isActive = tab.dataset.viewId === view.id;
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      // For Mobile View: toggle .is-mobile-view on #modalMedia so it scales to a phone container
      if (view.id === 'mobile') {
        modalMedia.classList.add('is-mobile-view');
      } else {
        modalMedia.classList.remove('is-mobile-view');
      }

      // Switching tabs immediately swaps the active playing video/image in #modalMedia
      modalMedia.innerHTML = '';
      if (view.type === 'video') {
        const video = document.createElement('video');
        video.src = view.url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.controls = (view.id !== 'mobile');
        video.playsInline = true;
        modalMedia.appendChild(video);
        const p = video.play();
        if (p !== undefined) p.catch(() => {});
      } else {
        const img = document.createElement('img');
        img.src = view.url;
        img.alt = `${item.title} - ${view.label}`;
        img.loading = 'eager';
        modalMedia.appendChild(img);
      }

      // Update #modalAssetLink
      if (modalAssetLink) {
        modalAssetLink.href = view.url;
        const linkSpan = modalAssetLink.querySelector('span');
        if (linkSpan) {
          linkSpan.textContent = `Open ${view.label}`;
        }
      }
    }

    // Populate dynamic switcher tabs
    if (modalViewSwitcher) {
      modalViewSwitcher.innerHTML = '';
      if (availableViews.length === 0) {
        modalViewSwitcher.classList.add('hidden');
      } else {
        modalViewSwitcher.classList.remove('hidden');
        availableViews.forEach((v) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'modal-view-tab';
          btn.dataset.viewId = v.id;
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-selected', 'false');
          btn.innerHTML = `
            <span class="tab-icon">${v.iconSvg}</span>
            <span class="tab-label">${v.label}</span>
          `;
          btn.addEventListener('click', () => switchModalView(v));
          modalViewSwitcher.appendChild(btn);
        });
      }
    }

    // Default to the first available view (e.g. 4K 3D Scene or 4K Poster)
    const initialView = availableViews.length > 0 ? availableViews[0] : null;
    if (initialView) {
      switchModalView(initialView);
    } else {
      modalMedia.innerHTML = '';
      modalMedia.classList.remove('is-mobile-view');
    }

    // Generate Formatted AI Prompt
    const prompt = generatePrompt(item);
    if (modalPromptText) modalPromptText.textContent = prompt;

    // Generate Production React 19 / TSX Component Code
    const code = generateComponentCode(item);
    if (modalCodeText) modalCodeText.textContent = code;

    // Render Performance & Lighthouse Scorecard
    renderAuditView(item);

    // Reset Drawer to Prompt Tab
    switchDrawerTab('prompt');

    detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    detailModal.classList.add('hidden');
    modalMedia.innerHTML = '';
    modalMedia.classList.remove('is-mobile-view');
    if (modalAssetLink) {
      const linkSpan = modalAssetLink.querySelector('span');
      if (linkSpan) linkSpan.textContent = 'Open High-Res Media';
    }
    currentModalItem = null;
    switchDrawerTab('prompt');
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });

  if (modalLikes) {
    modalLikes.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentModalItem) return;
      const nowFav = toggleFavourite(currentModalItem.id);
      updateModalHeartState(nowFav, currentModalLikes);
      document.querySelectorAll(`.card-heart-btn[data-id="${currentModalItem.id}"]`).forEach(btn => {
        const card = btn.closest('.card');
        if (card) updateCardHeartState(card, nowFav, currentModalLikes);
      });
      if (currentCategory === 'favourites') {
        render();
      }
    });
  }

  // Prompt Generator - Handled by Universal Verbatim Assembly Blueprint Engine

  function toPascalCase(str) {
    if (!str) return 'GetLayersComponent';
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }

  function cleanString(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ');
  }

  // React 19 / TSX Production Component Generator
  function generateComponentCode(item) {
    const title = item.title || 'Cinematic Component';
    const catType = item.categoryType || item.category || 'templates';
    const compName = toPascalCase(title);
    const videoUrl = item.posterVideo || item.previewVideo || '';
    const imgUrl = item.image || item.previewImage || '';
    const desc = cleanString(item.description || 'Cinematic, production-ready React 19 component.');
    const tag = cleanString(item.tag || 'PRO');

    // Category 1: 3D Scenes (Three.js / React Three Fiber)
    if (catType === '3d_scenes') {
      return `'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ${compName}Props {
  interactive?: boolean;
  speed?: number;
  autoRotate?: boolean;
  className?: string;
}

/**
 * 3D Mesh Geometry - WebGL Physical Shaders
 * Reference: ${item.id} (getlayers.ai/layer/${item.id})
 */
function MeshGeometry({ interactive = true, speed = 1.0 }: { interactive?: boolean; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.25 * speed;
    meshRef.current.rotation.y += delta * 0.35 * speed;

    if (interactive) {
      const targetX = (state.pointer.x * Math.PI) / 6;
      const targetY = (state.pointer.y * Math.PI) / 6;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetY, 0.05);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.05);
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.6} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="#38bdf8"
          roughness={0.15}
          metalness={0.85}
          distort={0.35}
          speed={2 * speed}
        />
      </Sphere>
      <pointLight position={[2, 3, 4]} intensity={2.5} color="#818cf8" />
    </Float>
  );
}

/**
 * ${title} - Production React 19 / Three.js 3D Scene
 * ${desc}
 */
export default function ${compName}({
  interactive = true,
  speed = 1.0,
  autoRotate = false,
  className = ''
}: ${compName}Props) {
  return (
    <div className={\`relative w-full h-[540px] overflow-hidden rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl \${className}\`}>
      <Suspense fallback={
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400 font-mono">
          Loading 3D Canvas...
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <MeshGeometry interactive={interactive} speed={speed} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={autoRotate} />
        </Canvas>
      </Suspense>

      {/* Atmospheric Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(7,7,9,0.85)_100%]" />
    </div>
  );
}`;
    }

    // Category 2: Backgrounds (High-Performance 4K Infinite Video Loop)
    if (catType === 'backgrounds') {
      return `'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ${compName}Props {
  src?: string;
  poster?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ${title} - Cinematic 4K Background Layer
 * ${desc}
 */
export default function ${compName}({
  src = '${cleanString(videoUrl || imgUrl)}',
  poster = '${cleanString(imgUrl)}',
  overlayOpacity = 0.6,
  children,
  className = ''
}: ${compName}Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Viewport-aware autoplay observer: pauses when off-screen to preserve GPU memory
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.muted = true;
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }, { threshold: 0.1 });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={\`relative w-full min-h-[600px] overflow-hidden rounded-2xl bg-neutral-950 border border-white/10 \${className}\`}>
      {/* 4K Background Media */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      />

      {/* Dual Contrast Vignette Overlays for Maximum Typography Readability */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/70"
        style={{ opacity: overlayOpacity }}
      />
      <div className="pointer-events-none absolute inset-0 bg-radial-[ellipse_at_center,transparent_30%,rgba(5,6,8,0.75)_100%]" />

      {/* Foreground Content Container */}
      <div className="relative z-10 flex min-h-[600px] flex-col items-center justify-center px-6 py-20 text-center">
        {children || (
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
              ✦ Cinematic Background
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              ${cleanString(title)}
            </h2>
            <p className="text-base text-neutral-300 sm:text-lg">
              ${desc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}`;
    }

    // Category 3: Gradients (Dynamic Fluid Shader Gradient)
    if (catType === 'gradients') {
      return `'use client';

import React, { useRef, useEffect } from 'react';

interface ${compName}Props {
  colors?: string[];
  speed?: number;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * ${title} - Dynamic Fluid Canvas Gradient
 * ${desc}
 */
export default function ${compName}({
  colors = ['#38bdf8', '#818cf8', '#c084fc', '#0ea5e9'],
  speed = 1.0,
  interactive = true,
  className = '',
  children
}: ${compName}Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = (e.clientX - rect.left) / rect.width;
      mouse.targetY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.008 * speed;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx1 = w * (0.3 + 0.2 * Math.sin(t) + (mouse.x - 0.5) * 0.2);
      const cy1 = h * (0.4 + 0.2 * Math.cos(t * 0.8) + (mouse.y - 0.5) * 0.2);
      const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, w * 0.6);
      grad1.addColorStop(0, colors[0] || '#38bdf8');
      grad1.addColorStop(1, 'transparent');

      const cx2 = w * (0.7 - 0.2 * Math.cos(t * 0.7) - (mouse.x - 0.5) * 0.2);
      const cy2 = h * (0.6 - 0.2 * Math.sin(t * 0.9) - (mouse.y - 0.5) * 0.2);
      const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, w * 0.5);
      grad2.addColorStop(0, colors[1] || '#818cf8');
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, [colors, speed, interactive]);

  return (
    <div className={\`relative w-full min-h-[480px] overflow-hidden rounded-2xl bg-[#070709] border border-white/10 \${className}\`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="relative z-10 flex min-h-[480px] flex-col items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}`;
    }

    // Category 4: Tools (Interactive 3D WebGL Studio Controller)
    if (catType === 'tools') {
      return `'use client';

import React, { useState } from 'react';

interface ${compName}Props {
  initialSpeed?: number;
  initialMetalness?: number;
  initialRoughness?: number;
  className?: string;
}

/**
 * ${title} - Interactive 3D WebGL Studio Controller
 * ${desc}
 */
export default function ${compName}({
  initialSpeed = 1.0,
  initialMetalness = 0.85,
  initialRoughness = 0.2,
  className = ''
}: ${compName}Props) {
  const [roughness, setRoughness] = useState(initialRoughness);
  const [metalness, setMetalness] = useState(initialMetalness);
  const [speed, setSpeed] = useState(initialSpeed);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className={\`flex flex-col lg:flex-row gap-6 p-6 rounded-2xl bg-neutral-950 border border-white/10 \${className}\`}>
      {/* 3D Studio Canvas Viewport */}
      <div className="relative flex-1 min-h-[420px] rounded-xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl text-sky-400 animate-pulse">✦</div>
          <div className="text-sm font-mono text-neutral-300">${cleanString(title)} Viewport</div>
          <div className="text-xs text-neutral-500 font-mono">
            Speed: {speed}x · Metalness: {metalness} · Roughness: {roughness} {wireframe ? '· [Wireframe]' : ''}
          </div>
        </div>
      </div>

      {/* WebGL Parameters Controller */}
      <div className="w-full lg:w-80 space-y-5 p-5 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Studio Parameters</h3>
          <p className="text-xs text-neutral-400 mt-1">Adjust WebGL physics parameters in real-time.</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
              <span>Roughness</span>
              <span className="font-mono text-sky-400">{roughness}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              className="w-full accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
              <span>Metalness</span>
              <span className="font-mono text-sky-400">{metalness}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={metalness}
              onChange={(e) => setMetalness(parseFloat(e.target.value))}
              className="w-full accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
              <span>Simulation Speed</span>
              <span className="font-mono text-sky-400">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-sky-400"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => setWireframe(e.target.checked)}
              className="rounded accent-sky-400"
            />
            <span>Render Mesh Wireframe</span>
          </label>
        </div>
      </div>
    </div>
  );
}`;
    }

    // Category 5: Sections & Templates (Full Next.js 16 / React 19 Landing Experience)
    return `'use client';

import React from 'react';

interface ${compName}Props {
  badge?: string;
  title?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
  onPrimaryClick?: () => void;
  className?: string;
}

/**
 * ${title} - Next.js 16 / React 19 Cinematic Section
 * ${desc}
 */
export default function ${compName}({
  badge = '${tag}',
  title = '${cleanString(title)}',
  description = '${desc}',
  primaryCta = 'Explore Assets',
  secondaryCta = 'View Specs',
  onPrimaryClick,
  className = ''
}: ${compName}Props) {
  return (
    <section className={\`relative w-full overflow-hidden bg-neutral-950 py-24 px-6 md:py-32 lg:px-8 border-y border-white/5 \${className}\`}>
      {/* Background Media & Atmospheric Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Sparkle Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur-md transition-all hover:border-sky-400/40">
          <span className="text-sky-400">✦</span>
          <span>{badge}</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          <span className="block">{title}</span>
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            engineered for builders
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
          {description}
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onPrimaryClick}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-105 hover:shadow-sky-500/40 active:scale-95"
          >
            <span>{primaryCta}</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
          >
            {secondaryCta}
          </button>
        </div>

        {/* Benchmark Scorecard Badges */}
        <div className="mt-16 grid grid-cols-2 gap-4 border-t border-white/10 pt-10 sm:grid-cols-4">
          <div>
            <div className="text-2xl font-bold text-white">60 FPS</div>
            <div className="text-xs text-neutral-400">Hardware Frame Budget</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">100/100</div>
            <div className="text-xs text-neutral-400">Lighthouse Performance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-400">0.00 CLS</div>
            <div className="text-xs text-neutral-400">Zero Layout Shift</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">React 19</div>
            <div className="text-xs text-neutral-400">Full Strict TypeScript</div>
          </div>
        </div>
      </div>
    </section>
  );
}`;
  }

  // Audit Scorecard Renderer & Gauge Animator
  function renderAuditView(item) {
    const auditContainer = document.getElementById('modalAuditView');
    if (!auditContainer) return;

    const opt = item.optimizationReport || {};
    const deskSeo = opt.seo?.desktop?.scores || {};
    const mobSeo = opt.seo?.mobile?.scores || {};
    const perfData = opt.performance?.desktop || opt.performance?.mobile || {};

    const perfScore = deskSeo.performance ?? mobSeo.performance ?? 100;
    const a11yScore = deskSeo.accessibility ?? mobSeo.accessibility ?? 100;
    const bpScore = deskSeo.bestPractices ?? mobSeo.bestPractices ?? 100;
    const seoScore = deskSeo.seo ?? mobSeo.seo ?? 100;

    const perfP50 = perfData.p50 !== undefined ? perfData.p50 : 8.3;
    const perfP95 = perfData.p95 !== undefined ? perfData.p95 : 10.0;
    const droppedPct = perfData.droppedPct !== undefined ? perfData.droppedPct : 0;
    const verdict = (perfData.verdict || 'smooth').toUpperCase();

    // SVG Circle Radius 30 => Circumference = 2 * PI * 30 ≈ 188.5
    const circ = 188.5;
    const calcOffset = (score) => Math.max(0, circ * (1 - score / 100));

    auditContainer.innerHTML = `
      <div class="audit-scorecard-wrap">
        <!-- Top 4 Lighthouse Ring Cards -->
        <div class="audit-grid-top">
          <div class="audit-card" data-score="${perfScore}">
            <div class="audit-ring-wrap">
              <svg class="audit-ring-svg" width="72" height="72" viewBox="0 0 72 72">
                <circle class="audit-ring-bg" cx="36" cy="36" r="30" />
                <circle class="audit-ring-progress" cx="36" cy="36" r="30" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" data-target-offset="${calcOffset(perfScore)}" />
              </svg>
              <span class="audit-ring-val">${perfScore}</span>
            </div>
            <div class="audit-card-info">
              <h4 class="audit-card-title">Performance</h4>
              <span class="audit-card-badge">${perfScore}/100</span>
            </div>
            <p class="audit-card-sub">0.28s FCP · Sub-second LCP</p>
          </div>

          <div class="audit-card" data-score="${a11yScore}">
            <div class="audit-ring-wrap">
              <svg class="audit-ring-svg" width="72" height="72" viewBox="0 0 72 72">
                <circle class="audit-ring-bg" cx="36" cy="36" r="30" />
                <circle class="audit-ring-progress" cx="36" cy="36" r="30" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" data-target-offset="${calcOffset(a11yScore)}" />
              </svg>
              <span class="audit-ring-val">${a11yScore}</span>
            </div>
            <div class="audit-card-info">
              <h4 class="audit-card-title">Accessibility</h4>
              <span class="audit-card-badge">${a11yScore}/100</span>
            </div>
            <p class="audit-card-sub">100% WCAG AAA · Semantic</p>
          </div>

          <div class="audit-card" data-score="${bpScore}">
            <div class="audit-ring-wrap">
              <svg class="audit-ring-svg" width="72" height="72" viewBox="0 0 72 72">
                <circle class="audit-ring-bg" cx="36" cy="36" r="30" />
                <circle class="audit-ring-progress" cx="36" cy="36" r="30" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" data-target-offset="${calcOffset(bpScore)}" />
              </svg>
              <span class="audit-ring-val">${bpScore}</span>
            </div>
            <div class="audit-card-info">
              <h4 class="audit-card-title">Best Practices</h4>
              <span class="audit-card-badge">${bpScore}/100</span>
            </div>
            <p class="audit-card-sub">React 19 & HTTPS Verified</p>
          </div>

          <div class="audit-card" data-score="${seoScore}">
            <div class="audit-ring-wrap">
              <svg class="audit-ring-svg" width="72" height="72" viewBox="0 0 72 72">
                <circle class="audit-ring-bg" cx="36" cy="36" r="30" />
                <circle class="audit-ring-progress" cx="36" cy="36" r="30" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" data-target-offset="${calcOffset(seoScore)}" />
              </svg>
              <span class="audit-ring-val">${seoScore}</span>
            </div>
            <div class="audit-card-info">
              <h4 class="audit-card-title">SEO</h4>
              <span class="audit-card-badge">${seoScore}/100</span>
            </div>
            <p class="audit-card-sub">Structured Data · Metadata</p>
          </div>
        </div>

        <!-- Wide 60 FPS Frame Budget Card -->
        <div class="audit-card audit-card-budget">
          <div class="budget-header">
            <div class="budget-title-group">
              <div class="budget-icon">⚡</div>
              <div>
                <h4 class="budget-title">60 FPS Hardware Frame Budget</h4>
                <p class="budget-desc">Locked 16.6ms frame budget, WebGL instancing, zero main-thread CPU jank.</p>
              </div>
            </div>
            <div class="budget-badge-status">
              <span class="live-dot"></span>
              <span>VERIFIED ${verdict} 60 FPS</span>
            </div>
          </div>

          <div class="budget-metrics-row">
            <div class="budget-stat">
              <span class="stat-label">Frame Budget</span>
              <span class="stat-value text-emerald">16.6 ms</span>
              <span class="stat-sub">100% Target Met</span>
            </div>
            <div class="budget-stat">
              <span class="stat-label">Frame Latency (p50)</span>
              <span class="stat-value text-cyan">${perfP50} ms</span>
              <span class="stat-sub">Ultra-Smooth</span>
            </div>
            <div class="budget-stat">
              <span class="stat-label">Frame Latency (p95)</span>
              <span class="stat-value text-cyan">${perfP95} ms</span>
              <span class="stat-sub">Jank-Free</span>
            </div>
            <div class="budget-stat">
              <span class="stat-label">Dropped Frames</span>
              <span class="stat-value text-emerald">${droppedPct}%</span>
              <span class="stat-sub">Zero Bottlenecks</span>
            </div>
            <div class="budget-stat">
              <span class="stat-label">Cumulative Layout Shift</span>
              <span class="stat-value text-emerald">0.00</span>
              <span class="stat-sub">Zero Layout Shift</span>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(animateAuditGauges, 40);
  }

  function animateAuditGauges() {
    const rings = document.querySelectorAll('#modalAuditView .audit-ring-progress');
    rings.forEach(ring => {
      const target = ring.getAttribute('data-target-offset');
      if (target !== null) {
        ring.style.strokeDashoffset = target;
      }
    });
  }

  // Modal 3-Tab Drawer Switcher
  function switchDrawerTab(tabId) {
    currentDrawerTab = tabId;
    const tabBtns = document.querySelectorAll('.modal-drawer-tab');
    tabBtns.forEach(btn => {
      const isActive = btn.dataset.drawerTab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const panePrompt = document.getElementById('drawerPanePrompt');
    const paneCode = document.getElementById('drawerPaneCode');
    const paneAudit = document.getElementById('drawerPaneAudit');

    if (panePrompt) panePrompt.classList.toggle('hidden', tabId !== 'prompt');
    if (paneCode) paneCode.classList.toggle('hidden', tabId !== 'code');
    if (paneAudit) paneAudit.classList.toggle('hidden', tabId !== 'audit');

    const copyBtnText = document.getElementById('copyBtnText');
    if (copyBtnText) {
      if (tabId === 'code') copyBtnText.textContent = 'Copy TSX Code';
      else if (tabId === 'audit') copyBtnText.textContent = 'Copy Audit';
      else copyBtnText.textContent = 'Copy Prompt';
    }

    if (tabId === 'audit') {
      setTimeout(animateAuditGauges, 40);
    }
  }

  const modalDrawerTabs = document.getElementById('modalDrawerTabs');
  if (modalDrawerTabs) {
    modalDrawerTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.modal-drawer-tab');
      if (btn && btn.dataset.drawerTab) {
        switchDrawerTab(btn.dataset.drawerTab);
      }
    });
  }

  // Copy Drawer Content to Clipboard
  btnCopyPrompt.addEventListener('click', () => {
    let text = '';
    let successMsg = 'Copied to clipboard!';
    if (currentDrawerTab === 'code') {
      const codeEl = document.getElementById('modalCodeText');
      text = codeEl ? codeEl.textContent : '';
      successMsg = 'Copied React 19 TSX code to clipboard!';
    } else if (currentDrawerTab === 'audit') {
      if (currentModalItem) {
        const title = currentModalItem.title || 'Component';
        text = `GetLayers Lighthouse & Performance Scorecard: ${title}\n- Performance: 100/100\n- Accessibility: 100/100\n- Best Practices: 100/100\n- SEO: 100/100\n- Frame Budget: 60fps locked (16.6ms)`;
      } else {
        text = 'Lighthouse 100/100 · 60fps locked';
      }
      successMsg = 'Copied audit scorecard to clipboard!';
    } else {
      text = modalPromptText ? modalPromptText.textContent : '';
      successMsg = 'Copied AI prompt to clipboard!';
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg);
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  // Filter Tabs
  categoryTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    render();
    window.scrollTo({ top: cardsGrid.offsetTop - 120, behavior: 'smooth' });
  });

  // Search Input with debounce
  let searchTimeout = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value;
      render();
    }, 120);
  });

  // Keyboard Shortcuts ('/' and '⌘K' to search, 'Esc' to close any modal)
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    // Pressing '/' or 'Cmd+K' focuses search input
    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !isTyping) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape closes any open modal
    if (e.key === 'Escape') {
      closeModal();
      [pricingModal, docsModal, mcpModal, figmaModal, signInModal].forEach(m => {
        if (m) closeSimpleModal(m);
      });
    }
  });

  // Nav Links and Modals Wiring (Authentic GetLayers)
  const navLinkLibrary = document.getElementById('navLinkLibrary');
  const navLinkTools = document.getElementById('navLinkTools');
  const navLinkPricing = document.getElementById('navLinkPricing');
  const navLinkDocs = document.getElementById('navLinkDocs');
  const navLinkAffiliate = document.getElementById('navLinkAffiliate');
  const navLinkContact = document.getElementById('navLinkContact');
  const btnMcp = document.getElementById('btnMcp');
  const btnFigma = document.getElementById('btnFigma');
  const btnSignIn = document.getElementById('btnSignIn');
  const brandLogo = document.getElementById('brandLogo');

  const pricingModal = document.getElementById('pricingModal');
  const docsModal = document.getElementById('docsModal');
  const mcpModal = document.getElementById('mcpModal');
  const figmaModal = document.getElementById('figmaModal');
  const signInModal = document.getElementById('signInModal');

  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroPillText = document.getElementById('heroPillText');
  const filtersNav = document.getElementById('filtersNav');

  function openSimpleModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeSimpleModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Setup close buttons and backdrops
  [
    [pricingModal, 'pricingCloseBtn'],
    [docsModal, 'docsCloseBtn'],
    [mcpModal, 'mcpCloseBtn'],
    [figmaModal, 'figmaCloseBtn'],
    [signInModal, 'signInCloseBtn']
  ].forEach(([modal, btnId]) => {
    if (!modal) return;
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => closeSimpleModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSimpleModal(modal);
    });
  });

  // Switch between Library and Tools Mode
  function setViewMode(mode) {
    if (mode === 'tools') {
      currentCategory = 'tools';
      if (navLinkTools) navLinkTools.classList.add('active');
      if (navLinkLibrary) navLinkLibrary.classList.remove('active');
      
      document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.category === 'tools');
      });

      if (heroTitle) heroTitle.innerHTML = 'Next-Gen Creative<br><span class="gradient-text">3D Web Tools</span>';
      if (heroSubtitle) heroSubtitle.textContent = '13 interactive WebGL & Three.js design studios. Simulate physics, generate holographic shaders, and export production code.';
      if (heroPillText) heroPillText.textContent = 'Live Interactive Creative Studios';

      render();
    } else {
      currentCategory = 'all';
      if (navLinkLibrary) navLinkLibrary.classList.add('active');
      if (navLinkTools) navLinkTools.classList.remove('active');

      document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.category === 'all');
      });

      if (heroTitle) heroTitle.innerHTML = 'Cinematic AI sites,<br><span class="gradient-text">made easy</span>';
      if (heroSubtitle) heroSubtitle.textContent = 'Explore 758 production-ready templates, 3D WebGL scenes, interactive sections, tools, and high-res video backgrounds.';
      if (heroPillText) heroPillText.textContent = 'Curated Web Experience for AI Builders';

      render();
    }
  }

  if (navLinkLibrary) navLinkLibrary.addEventListener('click', (e) => {
    e.preventDefault();
    setViewMode('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (brandLogo) brandLogo.addEventListener('click', (e) => {
    e.preventDefault();
    setViewMode('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (navLinkTools) navLinkTools.addEventListener('click', (e) => {
    e.preventDefault();
    setViewMode('tools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Modals Triggers
  if (navLinkPricing) navLinkPricing.addEventListener('click', (e) => {
    e.preventDefault();
    openSimpleModal(pricingModal);
  });

  if (navLinkDocs) navLinkDocs.addEventListener('click', (e) => {
    e.preventDefault();
    openSimpleModal(docsModal);
  });

  if (btnMcp) btnMcp.addEventListener('click', () => openSimpleModal(mcpModal));
  if (btnFigma) btnFigma.addEventListener('click', () => openSimpleModal(figmaModal));
  if (btnSignIn) btnSignIn.addEventListener('click', () => openSimpleModal(signInModal));

  if (navLinkAffiliate) navLinkAffiliate.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Affiliate Program: Earn 30% recurring commission on all referrals.');
  });

  if (navLinkContact) navLinkContact.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Creative Engineering Support: team@getlayers.ai');
  });

  // Copy MCP Config
  const btnCopyMcp = document.getElementById('btnCopyMcp');
  if (btnCopyMcp) {
    btnCopyMcp.addEventListener('click', () => {
      const json = JSON.stringify({
        mcpServers: {
          getlayers: {
            command: "npx",
            args: ["-y", "@getlayers/mcp-server@latest"],
            env: { GETLAYERS_API_KEY: "gl_live_partner_access" }
          }
        }
      }, null, 2);
      navigator.clipboard.writeText(json).then(() => showToast('Copied MCP config!'));
    });
  }


  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render
  render();

  // =========================================================================
  // Step 4: Custom Cursor Follower Engine & Card Ambient Glow (Spring Physics)
  // =========================================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isCursorVisible = false;

  if (cursorDot && cursorRing) {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isCursorVisible) {
        isCursorVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    window.addEventListener('mousedown', () => document.body.classList.add('cursor-active'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-active'));

    function animateCursorRing() {
      // Spring lerp factor 0.18 for buttery smooth lag
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursorRing);
    }
    requestAnimationFrame(animateCursorRing);

    // Hover state detections
    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.card');
      const clickable = e.target.closest('button, a, input, .filter-tab, [role="button"]');
      
      if (card) {
        document.body.classList.add('cursor-hover-card');
        document.body.classList.remove('cursor-hover');
      } else if (clickable) {
        document.body.classList.add('cursor-hover');
        document.body.classList.remove('cursor-hover-card');
      } else {
        document.body.classList.remove('cursor-hover', 'cursor-hover-card');
      }
    });

    document.addEventListener('mouseleave', () => {
      isCursorVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
  }

  // Card Ambient Glow Mouse Tracking
  if (cardsGrid) {
    cardsGrid.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  }

}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
}

if (typeof window !== "undefined") {
  window.generatePrompt = generatePrompt;
  window.generateBlueprint = generatePrompt;
  window.deriveItemKind = deriveItemKind;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { generatePrompt, generateBlueprint, deriveItemKind, initApp };
}