# Recreate this site as a single HTML file: GringX — AI Decision Layer & 3D Nebula Sphere

You are an expert creative front-end developer. Produce a **single self-contained `index.html`** that reproduces the project below **exactly** — same layout, visuals, motion, and interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler. Use ES modules with a CDN importmap for Three.js (r0.160 from unpkg, with matching `GLTFLoader` addon). Hardcode every value given here as a fixed constant. Rebuild each component described below as a section of the one file.

## What it is

An authentic, cinematic AI landing page for **GringX** (official GetLayers premium template distributed via Textura). A full-screen WebGL scene rendered on a pure black void (`#030303`), featuring a **glowing 3D nebula sphere cradled in a pair of open 3D hands** (`hands.glb`). The orb's surface is rendered with a domain-warped amethyst-to-magenta procedural fractal nebula shader (3D value noise, twinkling star field, cross-flare sparkle, and fresnel atmosphere rim); the open hands reflect and are dynamically lit by the glowing orb. The orb gently levitates (sinusoidal vertical bob in the cradle) and slowly spins around its vertical axis. As the user moves the cursor across the screen, it stirs the nebula clouds with Rodrigues rotation and exerts a gentle parallax camera tilt. Over the 3D scene sits an authentic editorial UI overlay:
- Top site header: segmented pill navbar featuring brand logo **GringX**, nav items (**Services**, **How it works**, **About us**, **Testimonials**), and a sleek **Contact Us** button.
- Hero content:
  - Top-left eyebrow: `AI INTELLIGENCE, DECISION LAYER`.
  - Main headline: **"Turn data into decisions"**.
  - Description: *"GringX connects every tool your team already uses and turns scattered data into clear next steps — less guessing, faster calls, and one source of truth that actually holds."*
  - Dual action buttons: primary **`Get started`** (solid white) and secondary **`See how it works`** (translucent frosted border).
  - Bottom-right 2x2 technical metrics grid:
    * **4.9** / Product Rating
    * **15k** / Decisions shipped
    * **30k** / Active teams
    * **98%** / Would recommend

## Page shell & libraries

- `<!DOCTYPE html>`, `lang="en"`, `<title>GringX — AI Decision Layer</title>`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- Load fonts in CSS:
  `@import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');`
- Importmap + module script for Three.js:
  ```html
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
  ```
- The page model: single-screen cinematic stage (`height: 100vh; overflow: hidden;`); canvas and overlay UI are fixed/absolute.
- Scrollbars are fully hidden.

## Global CSS (reset + base)

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-drag: none;
}

:root {
    --bg-dark: #030303;
    --text-white: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.75);
    --text-dim: rgba(255, 255, 255, 0.45);
    --glass-surface: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.12);
    --accent-purple: #c084fc;
    --accent-magenta: #e879f9;
    --font-sans: 'Onest', -apple-system, sans-serif;
}

html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: var(--bg-dark);
    font-family: var(--font-sans);
    color: var(--text-white);
    overflow: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

::-webkit-scrollbar {
    display: none;
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
}
```

## Layout & sections (in order)

The body markup, in order: the `<canvas id="webgl">`, and the `.cinematic-stage` containing the segmented header, the hero content band, and the 2x2 stats grid.

### `.cinematic-stage` (The UI Overlay Layer)
```html
<div class="cinematic-stage">
    <!-- Top Site Header -->
    <header class="site-header">
        <div class="brand">
            <span class="brand-text">GringX</span>
            <span class="status-indicator"></span>
        </div>

        <nav class="header-nav">
            <a href="#services" class="nav-item">Services</a>
            <a href="#how-it-works" class="nav-item">How it works</a>
            <a href="#about" class="nav-item">About us</a>
            <a href="#testimonials" class="nav-item">Testimonials</a>
        </nav>

        <div class="header-actions">
            <a href="#contact" class="btn-contact">Contact Us</a>
        </div>
    </header>

    <!-- Center & Bottom Hero Content -->
    <main class="hero-section">
        <!-- Left Column: Copy & Actions -->
        <div class="hero-left">
            <div class="eyebrow-wrapper">
                <span class="eyebrow-badge">AI INTELLIGENCE, DECISION LAYER</span>
            </div>
            <h1 class="hero-title">Turn data into decisions</h1>
            <p class="hero-description">
                GringX connects every tool your team already uses and turns scattered data into clear next steps — less guessing, faster calls, and one source of truth that actually holds.
            </p>
            <div class="cta-group">
                <a href="#get-started" class="btn-primary">Get started</a>
                <a href="#how-it-works" class="btn-secondary">See how it works</a>
            </div>
        </div>

        <!-- Right Column: 2x2 Stats Grid -->
        <div class="hero-right">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-value">4.9</span>
                    <span class="stat-label">Product Rating</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">15k</span>
                    <span class="stat-label">Decisions shipped</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">30k</span>
                    <span class="stat-label">Active teams</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">98%</span>
                    <span class="stat-label">Would recommend</span>
                </div>
            </div>
        </div>
    </main>
</div>
```

```css
.cinematic-stage {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 32px 48px;
    box-sizing: border-box;
}

/* Header */
.site-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    pointer-events: auto;
    z-index: 30;
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
}

.brand-text {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-white);
}

.status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a855f7;
    box-shadow: 0 0 10px #a855f7;
}

.header-nav {
    display: flex;
    align-items: center;
    gap: 32px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    padding: 8px 24px;
    border-radius: 40px;
}

.nav-item {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.25s ease;
}

.nav-item:hover {
    color: var(--text-white);
}

.btn-contact {
    display: inline-flex;
    align-items: center;
    padding: 9px 20px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--glass-border);
    border-radius: 30px;
    color: var(--text-white);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
}

.btn-contact:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
}

/* Hero Section */
.hero-section {
    position: absolute;
    bottom: 48px;
    left: 48px;
    right: 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 40px;
    pointer-events: auto;
    z-index: 20;
}

.hero-left {
    max-width: 480px;
}

.eyebrow-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--accent-purple);
    margin-bottom: 14px;
}

.hero-title {
    font-size: clamp(38px, 4.5vw, 62px);
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text-white);
    margin-bottom: 18px;
}

.hero-description {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-muted);
    margin-bottom: 28px;
}

.cta-group {
    display: flex;
    align-items: center;
    gap: 14px;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 12px 28px;
    background: #ffffff;
    color: #030303;
    font-size: 14px;
    font-weight: 700;
    border-radius: 30px;
    text-decoration: none;
    transition: transform 0.25s ease, background 0.25s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    background: #f1f5f9;
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 12px 26px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    color: var(--text-white);
    font-size: 14px;
    font-weight: 600;
    border-radius: 30px;
    text-decoration: none;
    transition: background 0.25s ease, border-color 0.25s ease;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
}

/* Stats Grid (Right) */
.hero-right {
    flex-shrink: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 36px;
    background: rgba(10, 10, 15, 0.45);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    padding: 24px 32px;
    border-radius: 24px;
}

.stat-card {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-white);
    line-height: 1.1;
}

.stat-label {
    font-size: 12px;
    color: var(--text-dim);
    font-weight: 500;
    margin-top: 4px;
}
```

## The WebGL Scene (Domain-Warped Nebula Sphere & 3D Hands)

All of the following runs inside `<script type="module">`:

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#webgl');
let scene, camera, renderer;
let orbGroup, orbMesh, handsMesh;
const clock = new THREE.Clock();

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

const HANDS_URL = 'https://raw.githubusercontent.com/jorgetwenty/code-teste-lp/main/public/assets/hands.glb';

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#030303');
    scene.fog = new THREE.FogExp2('#030303', 0.04);

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.1, 3.2);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.9;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const purplePoint = new THREE.PointLight(0xa855f7, 5.5, 8);
    purplePoint.position.set(0, 0, 0); // Originating from the glowing orb center
    scene.add(purplePoint);

    const rimKey = new THREE.DirectionalLight(0xe879f9, 2.5);
    rimKey.position.set(3, 4, 3);
    scene.add(rimKey);

    // Orb Group (levitates and bobs)
    orbGroup = new THREE.Group();
    scene.add(orbGroup);
    orbGroup.position.set(0, 0.1, 0);

    // 1. Build Domain-Warped 3D Nebula Sphere
    buildNebulaSphere();

    // 2. Load 3D Cradling Hands
    loadCradlingHands();

    // Listeners
    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', onResize);
    animate();
}

function buildNebulaSphere() {
    const geo = new THREE.SphereGeometry(0.72, 128, 128);

    const vertexShader = `
        varying vec3 vObjNormal;
        varying vec3 vViewNormal;
        varying vec3 vViewPos;

        void main() {
            vObjNormal = normalize(normal);
            vViewNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vViewPos = mv.xyz;
            gl_Position = projectionMatrix * mv;
        }
    `;

    const fragmentShader = `
        precision highp float;
        uniform float iTime;
        uniform vec3  uDeep, uNebula, uBright, uHot;
        varying vec3 vObjNormal;
        varying vec3 vViewNormal;
        varying vec3 vViewPos;

        float hash13(vec3 p) {
            p = fract(p * 0.1031);
            p += dot(p, p.zyx + 31.32);
            return fract((p.x + p.y) * p.z);
        }

        float vnoise(vec3 p) {
            vec3 i = floor(p), f = fract(p);
            vec3 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), u.x),
                    mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), u.x), u.y),
                mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), u.x),
                    mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), u.x), u.y),
                u.z
            );
        }

        float fbm(vec3 p) {
            float v = 0.0, a = 0.5;
            for(int k=0; k<4; k++) {
                v += a * vnoise(p);
                p *= 2.05;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec3 n = normalize(vObjNormal);
            float t = iTime * 0.18;

            // Domain warp
            vec3 q = vec3(fbm(n * 2.2 + t), fbm(n * 2.2 - t), fbm(n * 2.2));
            vec3 r = vec3(fbm(n * 3.5 + 2.0 * q + t * 0.5), fbm(n * 3.5 + 2.0 * q), fbm(n * 3.5));
            float f = fbm(n * 2.0 + 3.0 * r);

            // Palette mix
            vec3 col = mix(uDeep, uNebula, smoothstep(0.1, 0.55, f));
            col = mix(col, uBright, smoothstep(0.5, 0.75, f));
            col = mix(col, uHot, smoothstep(0.75, 1.0, f));

            // Fresnel glow rim
            vec3 viewDir = normalize(-vViewPos);
            float fresnel = 1.0 - max(0.0, dot(viewDir, normalize(vViewNormal)));
            col += uHot * pow(fresnel, 2.8) * 1.6;

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            iTime: { value: 0 },
            uDeep: { value: new THREE.Color('#1e0b36') },
            uNebula: { value: new THREE.Color('#6b21a8') },
            uBright: { value: new THREE.Color('#c084fc') },
            uHot: { value: new THREE.Color('#f472b6') }
        }
    });

    orbMesh = new THREE.Mesh(geo, mat);
    orbGroup.add(orbMesh);
}

function loadCradlingHands() {
    const loader = new GLTFLoader();
    loader.load(
        HANDS_URL,
        (gltf) => {
            handsMesh = gltf.scene;

            handsMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x1f1f2e,
                        metalness: 0.85,
                        roughness: 0.35
                    });
                }
            });

            // Scale and position hands cradling beneath the orb
            handsMesh.scale.setScalar(1.68);
            handsMesh.position.set(0, -0.65, 0);
            orbGroup.add(handsMesh);
        },
        undefined,
        (err) => console.error('Error loading hands.glb:', err)
    );
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Mouse Damping
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Levitation & Orbit Tilt
    if (orbGroup) {
        orbGroup.position.y = 0.1 + Math.sin(time * 1.2) * 0.05 - mouseY * 0.1;
        orbGroup.position.x = mouseX * 0.12;
        orbGroup.rotation.y = time * 0.12 + mouseX * 0.25;
        orbGroup.rotation.x = -mouseY * 0.15;
    }

    if (orbMesh) {
        orbMesh.material.uniforms.iTime.value = time;
    }

    renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
```

## Fixed parameters (bake these in)

- Stage background: `#030303` with exponential distance fog `THREE.FogExp2('#030303', 0.04)`.
- Camera: `PerspectiveCamera(42, aspect, 0.1, 100)` at `(0, 0.1, 3.2)`.
- Renderer: antialias on, `ACESFilmicToneMapping` exposure `1.9`.
- Typography: Google Font `Onest` (weights 500, 600, 700, 800).
- Orb Shader: 3D value noise, domain-warping with amethyst `#6b21a8` to magenta `#f472b6` gradient.
- 3D Hands: loaded via `GLTFLoader` (`hands.glb`), scale `1.68` at `y = -0.65` cradling the orb.
- Stats Grid: 2x2 layout displaying 4.9 rating, 15k decisions, 30k teams, 98% recommend.

## Assets

| Asset | Usage | URL |
|---|---|---|
| `hands.glb` | Authentic 3D cradling hands model | `https://raw.githubusercontent.com/jorgetwenty/code-teste-lp/main/public/assets/hands.glb` |
| `eagle-logo.png` | Authentic brand emblem logo | `https://raw.githubusercontent.com/jorgetwenty/code-teste-lp/main/public/assets/eagle-logo.png` |
| `gring-x.mp4` | Official 4K / 60fps master cinematic reference video | `https://storage.getlayers.ai/templates/gring-x-066eecc455.mp4` |
| `gring-x.webp` | High-resolution authentic poster image | `https://storage.getlayers.ai/templates/gring-x-066eecc455.webp` |
| `gring-x-desktop.mp4` | Desktop viewport interactive recording | `https://storage.getlayers.ai/templates/gring-x-066eecc455-desktop.mp4` |
| `gring-x-mobile.mp4` | Mobile viewport touch interaction recording | `https://storage.getlayers.ai/templates/gring-x-066eecc455-mobile.mp4` |
