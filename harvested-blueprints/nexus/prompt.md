# Recreate this site as a single HTML file: Nexus — Next-Gen Autonomous AI Systems

You are an expert creative front-end developer. Produce a **single self-contained `index.html`** that reproduces the project below **exactly** — same layout, visuals, motion, and interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler. Use ES modules with a CDN importmap for Three.js (r0.160 from unpkg, with matching `GLTFLoader` and `DRACOLoader` addons). Hardcode every value given here as a fixed constant. Rebuild each component described below as a section of the one file.

## What it is

An authentic, cinematic AI/Tech landing page titled **"Nexus"** (official flagship template by GetLayers founder Alex Savostianick). A dark, retro-futuristic stage rendered on deep canvas black (`#050505`). A high-precision 3D **floating robot astronaut** (`astronaut.glb`) hovers in the center of the viewport, executing gentle levitation, breathing motion, and interactive mouse-following yaw and pitch. The robot is lit by a dramatic directional sun rig with cool rim highlights. Behind the robot sits a deep, infinite **Pylon Field** with procedural distance fog and a dark radial vignette. In the editorial overlay, giant typography reading **"ne"** and **"xus"** in Google Font **Audiowide** is set with `mix-blend-mode: exclusion`, sitting seamlessly behind the 3D astronaut. A fixed technical header with brand logo "nexus", nav items, horizontal divider rules, and an angular **Contact Us** button frames the stage. Headline: **"THE NEXT EVOLUTION OF COGNITIVE MACHINES"**, followed by an editorial tagline: *"Autonomous, multi-modal systems engineered for critical infrastructure."*

## Page shell & libraries

- `<!DOCTYPE html>`, `lang="en"`, `<title>Nexus — Cognitive Machine Systems</title>`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- Load fonts in CSS:
  `@import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Urbanist:wght@400;500;600;700&family=Outfit:wght@400;600;800&display=swap');`
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
    --bg-dark: #050505;
    --text-white: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.7);
    --text-dim: rgba(255, 255, 255, 0.4);
    --action-surface: rgba(255, 255, 255, 0.08);
    --action-border: rgba(255, 255, 255, 0.16);
    --action-accent: #38bdf8;
    --font-display: 'Audiowide', cursive, sans-serif;
    --font-body: 'Urbanist', -apple-system, sans-serif;
}

html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: var(--bg-dark);
    font-family: var(--font-body);
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
    z-index: 5;
    outline: none;
    display: block;
}
```

## Layout & sections (in order)

The body markup, in order: the `<canvas id="webgl">`, the background giant wordmark layer (`.giant-wordmark`), and the `.cinematic-container` overlay containing the header, headline, tagline, and technical footer.

### Background Giant Wordmark (`.giant-wordmark` behind the 3D robot)
```html
<div class="giant-wordmark-layer">
    <div class="wordmark-part left">ne</div>
    <div class="wordmark-part right">xus</div>
</div>
```

```css
.giant-wordmark-layer {
    position: fixed;
    top: 50%;
    left: 0;
    width: 100vw;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 4vw;
    z-index: 2;
    pointer-events: none;
}

.wordmark-part {
    font-family: var(--font-display);
    font-size: clamp(12rem, 24vw, 22rem);
    line-height: 0.8;
    font-weight: 400;
    color: #ffffff;
    mix-blend-mode: exclusion;
    opacity: 0.85;
    letter-spacing: -0.05em;
}

.wordmark-part.left {
    transform: translateX(-1vw);
}

.wordmark-part.right {
    transform: translateX(1vw);
}
```

### `.cinematic-container` (The Overlay UI Layer)
```html
<div class="cinematic-container">
    <!-- Top Site Header -->
    <header class="main-header">
        <div class="brand">
            <span class="logo-text">nexus</span>
            <span class="brand-pill">SYSTEM V2</span>
        </div>

        <nav class="header-nav">
            <a href="#vision" class="nav-link active">Vision</a>
            <a href="#specs" class="nav-link">Specs</a>
            <a href="#protocol" class="nav-link">Protocol</a>
            <a href="#ecosystem" class="nav-link">Ecosystem</a>
        </nav>

        <div class="header-actions">
            <a href="#" class="contact-btn">
                <span>Contact Us</span>
                <span class="action-dash"></span>
            </a>
        </div>
    </header>

    <div class="header-rule"></div>

    <!-- Center Hero Copy (Under / Around the Robot) -->
    <div class="hero-copy-wrapper">
        <h1 class="hero-headline">THE NEXT EVOLUTION OF COGNITIVE MACHINES</h1>
        <p class="hero-tagline">
            Autonomous, multi-modal systems engineered for critical infrastructure and orbital operations.
        </p>
    </div>

    <!-- Bottom Technical Bar -->
    <footer class="tech-footer">
        <div class="footer-meta">
            <span class="meta-dot"></span>
            <span class="meta-label">NODE LATENCY: 0.8ms</span>
            <span class="meta-sep">/</span>
            <span class="meta-label">ORBITAL SYNCHRONIZED</span>
        </div>
        <div class="footer-coords">
            <span>CORE: [37.7749° N, 122.4194° W]</span>
        </div>
    </footer>
</div>
```

```css
.cinematic-container {
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
    padding: 36px 48px;
    box-sizing: border-box;
}

/* Header */
.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    pointer-events: auto;
    z-index: 20;
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-text {
    font-family: var(--font-display);
    font-size: 24px;
    letter-spacing: -0.03em;
    color: var(--text-white);
    text-transform: lowercase;
}

.brand-pill {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 4px 10px;
    border-radius: 20px;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: var(--action-accent);
}

.header-nav {
    display: flex;
    align-items: center;
    gap: 40px;
}

.nav-link {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-link:hover, .nav-link.active {
    color: var(--text-white);
}

.contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 22px;
    background: var(--action-surface);
    border: 1px solid var(--action-border);
    border-radius: 12px;
    color: var(--text-white);
    font-family: var(--font-display);
    font-size: 13px;
    text-decoration: none;
    letter-spacing: 0.5px;
    transition: background 0.3s ease, border-color 0.3s ease, transform 0.25s ease;
}

.contact-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
}

.action-dash {
    width: 8px;
    height: 2px;
    background: var(--action-accent);
    border-radius: 1px;
}

.header-rule {
    position: fixed;
    top: 90px;
    left: 48px;
    right: 48px;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 15;
}

/* Center Hero Copy */
.hero-copy-wrapper {
    position: absolute;
    bottom: 120px;
    left: 48px;
    max-width: 580px;
    pointer-events: auto;
    z-index: 20;
}

.hero-headline {
    font-family: var(--font-display);
    font-size: clamp(28px, 3.5vw, 44px);
    line-height: 1.15;
    letter-spacing: -0.04em;
    color: #ffffff;
    mix-blend-mode: exclusion;
    margin-bottom: 16px;
    text-transform: uppercase;
}

.hero-tagline {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-muted);
    font-weight: 500;
    max-width: 480px;
}

/* Footer */
.tech-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    pointer-events: auto;
    z-index: 20;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    color: var(--text-dim);
}

.footer-meta {
    display: flex;
    align-items: center;
    gap: 12px;
}

.meta-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--action-accent);
    box-shadow: 0 0 10px var(--action-accent);
}

.meta-sep {
    color: rgba(255, 255, 255, 0.2);
}
```

## The WebGL Scene (Pylon Field + 3D Astronaut Robot)

All of the following runs inside `<script type="module">`:

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#webgl');
let scene, camera, renderer;
let robotModel, robotPivot;
let pylonFieldGroup;
const clock = new THREE.Clock();

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

const ASTRONAUT_MODEL_URL = 'https://raw.githubusercontent.com/AlexSavostianick/getlayers-nexus/main/public/assets/hero/astronaut.glb';

function init() {
    // 1. Scene & Camera Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    scene.fog = new THREE.FogExp2('#050505', 0.035);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
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
    renderer.toneMappingExposure = 1.8;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Chiaroscuro Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 4.2);
    sunLight.position.set(4, 6, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.2);
    rimLight.position.set(-4, 2, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x1e293b, 1.2);
    fillLight.position.set(0, -4, 2);
    scene.add(fillLight);

    // 3. Build Background Pylon Field
    buildPylonField();

    // 4. Load 3D Astronaut Model
    loadAstronautModel();

    // 5. Setup Mouse Listeners
    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

// Procedural Pylon Field Grid
function buildPylonField() {
    pylonFieldGroup = new THREE.Group();
    scene.add(pylonFieldGroup);

    const pylonGeo = new THREE.BoxGeometry(0.12, 3.2, 0.12);
    const pylonMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.85,
        roughness: 0.35
    });

    const rows = 14;
    const cols = 14;
    const spacing = 1.8;

    for (let r = -rows / 2; r < rows / 2; r++) {
        for (let c = -cols / 2; c < cols / 2; c++) {
            const mesh = new THREE.Mesh(pylonGeo, pylonMat);
            const x = c * spacing + (Math.random() - 0.5) * 0.4;
            const z = -6.0 - r * spacing;
            const y = -1.8 + Math.sin(r * 0.4 + c * 0.4) * 0.3;
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            pylonFieldGroup.add(mesh);
        }
    }
}

// 3D Astronaut Model Loader
function loadAstronautModel() {
    const loader = new GLTFLoader();

    robotPivot = new THREE.Group();
    scene.add(robotPivot);
    robotPivot.position.set(0, -0.1, 0);

    loader.load(
        ASTRONAUT_MODEL_URL,
        (gltf) => {
            robotModel = gltf.scene;

            robotModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.metalness = 0.88;
                        child.material.roughness = 0.28;
                    }
                }
            });

            // Center and scale model to comfortable viewport dimensions
            const box = new THREE.Box3().setFromObject(robotModel);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.4 / (maxDim || 1);
            robotModel.scale.setScalar(scale);

            robotModel.updateMatrixWorld(true);
            const center = box.getCenter(new THREE.Vector3());
            robotModel.position.sub(center.multiplyScalar(scale));

            robotPivot.add(robotModel);
        },
        undefined,
        (err) => {
            console.error('Error loading astronaut.glb:', err);
        }
    );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Mouse Lerp Damping
    mouseX += (targetMouseX - mouseX) * 0.055;
    mouseY += (targetMouseY - mouseY) * 0.055;

    // Levitation & Mouse Head/Torso Orbit
    if (robotPivot) {
        robotPivot.position.y = -0.1 + Math.sin(time * 1.4) * 0.08 - mouseY * 0.12;
        robotPivot.position.x = mouseX * 0.15;
        robotPivot.rotation.y = mouseX * 0.35 + Math.sin(time * 0.8) * 0.05;
        robotPivot.rotation.x = -mouseY * 0.22;
        robotPivot.rotation.z = -mouseX * 0.12;
    }

    // Pylon Field Subtle Drift
    if (pylonFieldGroup) {
        pylonFieldGroup.position.x = -mouseX * 0.2;
    }

    renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
```

## Fixed parameters (bake these in)

- Stage background: `#050505` with exponential fog `THREE.FogExp2('#050505', 0.035)`.
- Camera: `PerspectiveCamera(45, aspect, 0.1, 100)` at `(0, 0.2, 5.2)`.
- Renderer: antialias on, `ACESFilmicToneMapping` exposure `1.8`, `PCFSoftShadowMap`.
- Fonts: `Audiowide` for brand, headings, and exclusion giant wordmark; `Urbanist` for body and nav.
- Giant Wordmark: `ne` on left and `xus` on right, clamp `12rem` to `22rem`, `mix-blend-mode: exclusion`.
- 3D Model: `astronaut.glb` auto-centered in pivot group, scale normalized to `2.4`.
- Pylon Field: 14x14 grid of dark metallic columns at `z = -6.0` to `-30.0` with elevation offsets.

## Assets

| Asset | Usage | URL |
|---|---|---|
| `astronaut.glb` | Authentic 3D floating astronaut robot model | `https://raw.githubusercontent.com/AlexSavostianick/getlayers-nexus/main/public/assets/hero/astronaut.glb` |
| `nexus.mp4` | Official 4K / 60fps master cinematic reference video | `https://storage.getlayers.ai/templates/nexus-4d86deb149.mp4` |
| `nexus.webp` | High-resolution authentic poster image | `https://storage.getlayers.ai/templates/nexus-4d86deb149.webp` |
| `nexus-desktop.mp4` | Desktop viewport interactive recording | `https://storage.getlayers.ai/templates/nexus-4d86deb149-desktop.mp4` |
| `nexus-mobile.mp4` | Mobile viewport touch interaction recording | `https://storage.getlayers.ai/templates/nexus-4d86deb149-mobile.mp4` |
