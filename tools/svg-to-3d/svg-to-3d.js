/**
 * SVG to 3D Extruder Studio — Core 3D WebGL Engine
 * Authentic GetLayers 3D Studio Simulation (Three.js SVGLoader & PBR)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Studio State
  const state = {
    currentPreset: 'cube',
    customSvgContent: null,
    customFileName: null,
    currentMaterial: 'chrome',
    depth: 24,
    bevelSize: 4.0,
    bevelSegments: 4,
    baseColor: '#e2e8f0',
    rimColor: '#38bdf8',
    roughness: 0.08,
    metalness: 0.98,
    glow: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    autoSpin: false,
    wireframe: false,
    viewMode: 'iso'
  };

  // 2. Material Presets (PBR Physical Materials)
  const MATERIAL_PRESETS = {
    chrome: {
      name: 'Liquid Chrome',
      baseColor: '#e2e8f0',
      rimColor: '#38bdf8',
      roughness: 0.08,
      metalness: 0.98,
      glow: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false
    },
    gold: {
      name: 'Molten Gold',
      baseColor: '#fbbf24',
      rimColor: '#f59e0b',
      roughness: 0.18,
      metalness: 0.96,
      glow: 0.20,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false
    },
    glass: {
      name: 'Frosted Glass',
      baseColor: '#ffffff',
      rimColor: '#818cf8',
      roughness: 0.22,
      metalness: 0.05,
      glow: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
      transmission: 0.92,
      ior: 1.52,
      opacity: 0.88,
      transparent: true
    },
    obsidian: {
      name: 'Obsidian Clay',
      baseColor: '#18181b',
      rimColor: '#c084fc',
      roughness: 0.72,
      metalness: 0.12,
      glow: 0.08,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false
    }
  };

  // 3. Built-in Vector Presets (Pure SVG geometry paths)
  const VECTOR_PRESETS = {
    cube: {
      name: 'Geometric Cube',
      sub: 'GetLayers Triple Plate',
      meta: 'Preset SVG · Layered 3D',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 8 L85 24 L50 40 L15 24 Z" />
        <path d="M50 38 L85 54 L50 70 L15 54 Z" />
        <path d="M50 68 L85 84 L50 100 L15 84 Z" />
      </svg>`
    },
    star: {
      name: 'Cyber Star',
      sub: '8-Point Faceted Prism',
      meta: 'Preset SVG · Faceted Star',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 L63 37 L95 50 L63 63 L50 95 L37 63 L5 50 L37 37 Z M50 32 L64 50 L50 68 L36 50 Z" />
      </svg>`
    },
    monogram: {
      name: 'Abstract Monogram',
      sub: 'Typography Intertwine',
      meta: 'Preset SVG · Monogram',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 15 L75 15 C85 15 90 22 90 32 L90 40 L68 40 L68 32 C68 28 66 26 62 26 L38 26 C30 26 26 30 26 38 L26 62 C26 70 30 74 38 74 L65 74 C70 74 74 70 74 65 L74 54 L52 54 L52 42 L86 42 L86 68 C86 80 78 86 65 86 L32 86 C18 86 12 78 12 65 L12 35 C12 22 18 15 25 15 Z" />
      </svg>`
    },
    knot: {
      name: 'Infinite Torus Knot',
      sub: 'Curved Möbius Ribbon',
      meta: 'Preset SVG · Infinite Loop',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 50 C62 30 80 25 90 35 C100 45 100 55 90 65 C80 75 62 70 50 50 C38 30 20 25 10 35 C0 45 0 55 10 65 C20 75 38 70 50 50 Z M50 50 C40 64 26 68 18 60 C10 52 10 48 18 40 C26 32 40 36 50 50 C60 64 74 68 82 60 C90 52 90 48 82 40 C74 32 60 36 50 50 Z" />
      </svg>`
    },
    shield: {
      name: 'Shield Badge',
      sub: 'Cyber Heraldic Emblem',
      meta: 'Preset SVG · Heraldic Crest',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 8 L88 22 L88 54 C88 76 50 94 50 94 C50 94 12 76 12 54 L12 22 Z M50 20 L24 30 L24 52 C24 69 50 82 50 82 C50 82 76 69 76 52 L76 30 Z M50 36 L62 48 L56 64 L50 56 L44 64 L38 48 Z" />
      </svg>`
    }
  };

  // 4. DOM Elements
  const container = document.getElementById('canvasContainer');
  const canvas = document.getElementById('threeCanvas');

  // SVG Source / Upload DOM
  const svgDropZone = document.getElementById('svgDropZone');
  const svgFileInput = document.getElementById('svgFileInput');
  const activeAssetSlot = document.getElementById('activeAssetSlot');
  const assetThumb = document.getElementById('assetThumb');
  const assetName = document.getElementById('assetName');
  const assetMeta = document.getElementById('assetMeta');
  const btnResetAsset = document.getElementById('btnResetAsset');

  // Preset Buttons
  const vectorPresetsList = document.getElementById('vectorPresetsList');
  const materialPresetsList = document.getElementById('materialPresetsList');

  // Toolbar Buttons
  const btnResetCamera = document.getElementById('btnResetCamera');
  const btnAutoSpin = document.getElementById('btnAutoSpin');
  const btnWireframe = document.getElementById('btnWireframe');
  const btnViewFront = document.getElementById('btnViewFront');
  const btnViewTop = document.getElementById('btnViewTop');
  const btnViewIso = document.getElementById('btnViewIso');
  const canvasStatsText = document.getElementById('canvasStatsText');

  // Sliders & Pickers
  const sliderDepth = document.getElementById('sliderDepth');
  const valDepth = document.getElementById('valDepth');
  const sliderBevelSize = document.getElementById('sliderBevelSize');
  const valBevelSize = document.getElementById('valBevelSize');
  const sliderBevelSegments = document.getElementById('sliderBevelSegments');
  const valBevelSegments = document.getElementById('valBevelSegments');
  const btnResetGeometry = document.getElementById('btnResetGeometry');

  const inputBaseColorPicker = document.getElementById('inputBaseColorPicker');
  const inputBaseColorHex = document.getElementById('inputBaseColorHex');
  const inputRimColorPicker = document.getElementById('inputRimColorPicker');
  const inputRimColorHex = document.getElementById('inputRimColorHex');
  const sliderRoughness = document.getElementById('sliderRoughness');
  const valRoughness = document.getElementById('valRoughness');
  const sliderMetalness = document.getElementById('sliderMetalness');
  const valMetalness = document.getElementById('valMetalness');
  const sliderGlow = document.getElementById('sliderGlow');
  const valGlow = document.getElementById('valGlow');
  const btnResetMaterial = document.getElementById('btnResetMaterial');

  // Action Buttons
  const btnResetParams = document.getElementById('btnResetParams');
  const btnSaveFavorite = document.getElementById('btnSaveFavorite');
  const favHeart = document.getElementById('favHeart');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const studioToast = document.getElementById('studioToast');

  // 5. Toast Notification Helper
  let toastTimer = null;
  function showToast(msg) {
    if (!studioToast) return;
    studioToast.textContent = msg;
    studioToast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      studioToast.classList.add('hidden');
    }, 2800);
  }

  // 6. SVG Path Parsing Engine (Robust Dual-Mode: Three.js SVGLoader + Built-in Parser Fallback)
  function parseSvgPathDataFallback(svgString) {
    if (typeof THREE === 'undefined') return [];
    const shapes = [];
    const pathMatches = svgString.matchAll(/d\s*=\s*["']([^"']+)["']/gi);
    
    for (const match of pathMatches) {
      const d = match[1];
      if (!d) continue;

      // Tokenize path commands and numbers
      const tokens = d.match(/([a-df-z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/gi);
      if (!tokens) continue;

      let currentShape = null;
      let cursorX = 0;
      let cursorY = 0;
      let startX = 0;
      let startY = 0;
      let lastCmd = '';
      let i = 0;

      while (i < tokens.length) {
        let token = tokens[i];
        if (/^[a-df-z]$/i.test(token)) {
          lastCmd = token;
          i++;
        }

        const cmd = lastCmd;
        if (!cmd) { i++; continue; }

        switch (cmd) {
          case 'M': {
            const x = parseFloat(tokens[i++]);
            const y = parseFloat(tokens[i++]);
            if (currentShape) {
              shapes.push(currentShape);
            }
            currentShape = new THREE.Shape();
            currentShape.moveTo(x, y);
            cursorX = x;
            cursorY = y;
            startX = x;
            startY = y;
            lastCmd = 'L'; // Subsequent pairs are implicit lineTo
            break;
          }
          case 'm': {
            const dx = parseFloat(tokens[i++]);
            const dy = parseFloat(tokens[i++]);
            cursorX += dx;
            cursorY += dy;
            if (currentShape) {
              shapes.push(currentShape);
            }
            currentShape = new THREE.Shape();
            currentShape.moveTo(cursorX, cursorY);
            startX = cursorX;
            startY = cursorY;
            lastCmd = 'l';
            break;
          }
          case 'L': {
            const x = parseFloat(tokens[i++]);
            const y = parseFloat(tokens[i++]);
            if (currentShape) currentShape.lineTo(x, y);
            cursorX = x;
            cursorY = y;
            break;
          }
          case 'l': {
            const dx = parseFloat(tokens[i++]);
            const dy = parseFloat(tokens[i++]);
            cursorX += dx;
            cursorY += dy;
            if (currentShape) currentShape.lineTo(cursorX, cursorY);
            break;
          }
          case 'H': {
            const x = parseFloat(tokens[i++]);
            cursorX = x;
            if (currentShape) currentShape.lineTo(cursorX, cursorY);
            break;
          }
          case 'h': {
            const dx = parseFloat(tokens[i++]);
            cursorX += dx;
            if (currentShape) currentShape.lineTo(cursorX, cursorY);
            break;
          }
          case 'V': {
            const y = parseFloat(tokens[i++]);
            cursorY = y;
            if (currentShape) currentShape.lineTo(cursorX, cursorY);
            break;
          }
          case 'v': {
            const dy = parseFloat(tokens[i++]);
            cursorY += dy;
            if (currentShape) currentShape.lineTo(cursorX, cursorY);
            break;
          }
          case 'C': {
            const x1 = parseFloat(tokens[i++]);
            const y1 = parseFloat(tokens[i++]);
            const x2 = parseFloat(tokens[i++]);
            const y2 = parseFloat(tokens[i++]);
            const x = parseFloat(tokens[i++]);
            const y = parseFloat(tokens[i++]);
            if (currentShape) currentShape.bezierCurveTo(x1, y1, x2, y2, x, y);
            cursorX = x;
            cursorY = y;
            break;
          }
          case 'c': {
            const x1 = cursorX + parseFloat(tokens[i++]);
            const y1 = cursorY + parseFloat(tokens[i++]);
            const x2 = cursorX + parseFloat(tokens[i++]);
            const y2 = cursorY + parseFloat(tokens[i++]);
            const x = cursorX + parseFloat(tokens[i++]);
            const y = cursorY + parseFloat(tokens[i++]);
            if (currentShape) currentShape.bezierCurveTo(x1, y1, x2, y2, x, y);
            cursorX = x;
            cursorY = y;
            break;
          }
          case 'S':
          case 's': {
            const x2 = (cmd === 'S' ? 0 : cursorX) + parseFloat(tokens[i++]);
            const y2 = (cmd === 'S' ? 0 : cursorY) + parseFloat(tokens[i++]);
            const x = (cmd === 'S' ? 0 : cursorX) + parseFloat(tokens[i++]);
            const y = (cmd === 'S' ? 0 : cursorY) + parseFloat(tokens[i++]);
            if (currentShape) currentShape.quadraticCurveTo(x2, y2, x, y);
            cursorX = x;
            cursorY = y;
            break;
          }
          case 'Q': {
            const x1 = parseFloat(tokens[i++]);
            const y1 = parseFloat(tokens[i++]);
            const x = parseFloat(tokens[i++]);
            const y = parseFloat(tokens[i++]);
            if (currentShape) currentShape.quadraticCurveTo(x1, y1, x, y);
            cursorX = x;
            cursorY = y;
            break;
          }
          case 'q': {
            const x1 = cursorX + parseFloat(tokens[i++]);
            const y1 = cursorY + parseFloat(tokens[i++]);
            const x = cursorX + parseFloat(tokens[i++]);
            const y = cursorY + parseFloat(tokens[i++]);
            if (currentShape) currentShape.quadraticCurveTo(x1, y1, x, y);
            cursorX = x;
            cursorY = y;
            break;
          }
          case 'Z':
          case 'z': {
            if (currentShape) currentShape.closePath();
            cursorX = startX;
            cursorY = startY;
            break;
          }
          default:
            i++;
            break;
        }
      }
      if (currentShape) {
        shapes.push(currentShape);
      }
    }
    return shapes;
  }

  function parseSvgToShapes(svgString) {
    if (typeof THREE === 'undefined') return [];
    if (typeof THREE.SVGLoader !== 'undefined') {
      try {
        const loader = new THREE.SVGLoader();
        const svgData = loader.parse(svgString);
        const shapes = [];
        if (svgData && svgData.paths) {
          svgData.paths.forEach(path => {
            const pathShapes = typeof THREE.SVGLoader.createShapes === 'function'
              ? THREE.SVGLoader.createShapes(path)
              : path.toShapes(true);
            if (pathShapes && pathShapes.length > 0) {
              shapes.push(...pathShapes);
            }
          });
        }
        if (shapes.length > 0) {
          return shapes;
        }
      } catch (err) {
        console.warn('Three.js SVGLoader encountered an issue, invoking built-in path parser:', err);
      }
    }
    return parseSvgPathDataFallback(svgString);
  }

  // 7. Three.js Engine Setup
  let scene, camera, renderer, controls;
  let meshGroup, activeExtrudeMesh, groundPlane, gridHelper;
  let keyLight, rimLight, fillLight, ambientLight, accentPointLight;
  let activeMaterial;

  function initThree() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js library not loaded');
      return;
    }

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050608);
    scene.fog = new THREE.FogExp2(0x050608, 0.012);

    // Camera
    const rect = container.getBoundingClientRect();
    const aspect = (rect.width || window.innerWidth) / (rect.height || window.innerHeight);
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(20, 16, 32);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (renderer.toneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
    }
    if (renderer.outputEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // OrbitControls (with smooth interaction)
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 12;
      controls.maxDistance = 110;
      controls.autoRotate = state.autoSpin;
      controls.autoRotateSpeed = 2.4;
      controls.target.set(0, 0, 0);
    } else {
      // Graceful fallback mouse orbit if addon script was delayed
      setupFallbackControls();
    }

    // Lights
    ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    // Directional Key Light with soft specular shadows
    keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(25, 35, 24);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 120;
    keyLight.shadow.camera.left = -25;
    keyLight.shadow.camera.right = 25;
    keyLight.shadow.camera.top = 25;
    keyLight.shadow.camera.bottom = -25;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    // Directional Rim Light for edge highlights
    rimLight = new THREE.DirectionalLight(new THREE.Color(state.rimColor), 3.8);
    rimLight.position.set(-28, 22, -26);
    scene.add(rimLight);

    // Fill Light
    fillLight = new THREE.PointLight(new THREE.Color(state.rimColor), 1.2, 70);
    fillLight.position.set(0, -15, 20);
    scene.add(fillLight);

    // Accent Glow Light
    accentPointLight = new THREE.PointLight(new THREE.Color(state.rimColor), state.glow * 3.5, 60);
    accentPointLight.position.set(0, 0, -12);
    scene.add(accentPointLight);

    // Ground Plane for specular drop shadows
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.38 });
    groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -13.5;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // Subtle studio grid helper for depth perception
    gridHelper = new THREE.GridHelper(90, 36, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -13.48;
    if (gridHelper.material) {
      gridHelper.material.opacity = 0.16;
      gridHelper.material.transparent = true;
    }
    scene.add(gridHelper);

    // Group for the extruded mesh
    meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // Create Initial Extruded Geometry & Material
    updateMaterial();
    build3DModel();

    // Start Animation Loop
    animate();
  }

  // Fallback manual mouse orbit handler (in case OrbitControls is absent)
  function setupFallbackControls() {
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 36, theta: 0.6, phi: 1.1 };

    function updateCameraFromSpherical() {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    }
    updateCameraFromSpherical();

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY * 0.008));
      updateCameraFromSpherical();
    });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      spherical.radius = Math.max(10, Math.min(100, spherical.radius + e.deltaY * 0.05));
      updateCameraFromSpherical();
    }, { passive: false });

    // Polyfill controls object so toolbar calls do not throw
    controls = {
      autoRotate: state.autoSpin,
      autoRotateSpeed: 2.0,
      target: new THREE.Vector3(0, 0, 0),
      update: function() {
        if (state.autoSpin) {
          spherical.theta += 0.01;
          updateCameraFromSpherical();
        }
      },
      reset: function() {
        spherical = { radius: 36, theta: 0.6, phi: 1.1 };
        updateCameraFromSpherical();
      }
    };
  }

  // 8. PBR Material Builder
  function updateMaterial() {
    const matConfig = MATERIAL_PRESETS[state.currentMaterial] || MATERIAL_PRESETS.chrome;
    
    // Choose MeshPhysicalMaterial for clearcoat and glass transmission, fallback to MeshStandardMaterial
    const MaterialClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

    if (!activeMaterial) {
      activeMaterial = new MaterialClass({
        color: new THREE.Color(state.baseColor),
        roughness: state.roughness,
        metalness: state.metalness,
        wireframe: state.wireframe
      });
    } else {
      activeMaterial.color.set(state.baseColor);
      activeMaterial.roughness = state.roughness;
      activeMaterial.metalness = state.metalness;
      activeMaterial.wireframe = state.wireframe;
    }

    // Material Physical extensions
    if (activeMaterial.clearcoat !== undefined) {
      activeMaterial.clearcoat = state.clearcoat;
      activeMaterial.clearcoatRoughness = state.clearcoatRoughness;
    }

    if (state.currentMaterial === 'glass' && activeMaterial.transmission !== undefined) {
      activeMaterial.transmission = matConfig.transmission;
      activeMaterial.ior = matConfig.ior;
      activeMaterial.transparent = true;
      activeMaterial.opacity = matConfig.opacity;
    } else {
      if (activeMaterial.transmission !== undefined) activeMaterial.transmission = 0.0;
      activeMaterial.transparent = false;
      activeMaterial.opacity = 1.0;
    }

    // Rim specular reflection and emissive sheen
    if (activeMaterial.emissive) {
      activeMaterial.emissive.set(state.rimColor);
      activeMaterial.emissiveIntensity = state.glow;
    }

    // Update real-time scene lighting colors
    if (rimLight) rimLight.color.set(state.rimColor);
    if (fillLight) fillLight.color.set(state.rimColor);
    if (accentPointLight) {
      accentPointLight.color.set(state.rimColor);
      accentPointLight.intensity = state.glow * 3.5;
    }

    if (activeExtrudeMesh) {
      activeExtrudeMesh.material = activeMaterial;
    }
  }

  // 9. 3D Model Extrusion Pipeline
  function build3DModel() {
    // 1. Get SVG source string
    const svgString = state.customSvgContent || (VECTOR_PRESETS[state.currentPreset] ? VECTOR_PRESETS[state.currentPreset].svg : VECTOR_PRESETS.cube.svg);
    
    // 2. Parse into Three.js shapes
    const shapes = parseSvgToShapes(svgString);
    if (!shapes || shapes.length === 0) {
      console.warn('No 2D shapes extracted from SVG');
      return;
    }

    // 3. Compute 2D bounding dimension to normalize coordinate space
    const tempGeo = new THREE.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false, curveSegments: 4 });
    tempGeo.computeBoundingBox();
    const box = tempGeo.boundingBox;
    const width = Math.max(0.001, box.max.x - box.min.x);
    const height = Math.max(0.001, box.max.y - box.min.y);
    tempGeo.dispose();

    const maxDim = Math.max(width, height);
    const targetWorldSize = 22.0;
    const normScale = targetWorldSize / maxDim;

    // 4. Calculate depth and bevel proportional to normalized scale
    // Extrusion depth slider: 1 - 100 -> target depth in 3D world: ~0.15 to 14.0
    const targetWorldDepth = Math.max(0.1, state.depth * 0.12);
    const extrudeDepth = targetWorldDepth / normScale;

    // Bevel size slider: 0 - 12 -> target bevel in 3D world: 0.0 to 1.8
    const targetWorldBevel = state.bevelSize * 0.14;
    const extrudeBevel = targetWorldBevel / normScale;

    const extrudeSettings = {
      steps: 1,
      depth: extrudeDepth,
      bevelEnabled: state.bevelSize > 0,
      bevelThickness: extrudeBevel * 0.8,
      bevelSize: extrudeBevel,
      bevelOffset: 0,
      bevelSegments: Math.max(1, parseInt(state.bevelSegments, 10)),
      curveSegments: 24
    };

    // 5. Generate Extruded Mesh
    const newGeometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    
    // Center at (0, 0, 0) and invert Y so SVG geometry stands upright
    newGeometry.center();
    newGeometry.scale(normScale, -normScale, normScale);
    newGeometry.computeVertexNormals();

    // 6. Replace Mesh in Scene
    if (activeExtrudeMesh) {
      meshGroup.remove(activeExtrudeMesh);
      if (activeExtrudeMesh.geometry) activeExtrudeMesh.geometry.dispose();
    }

    activeExtrudeMesh = new THREE.Mesh(newGeometry, activeMaterial);
    activeExtrudeMesh.castShadow = true;
    activeExtrudeMesh.receiveShadow = true;
    meshGroup.add(activeExtrudeMesh);

    // Update geometry stats badge
    const vertCount = newGeometry.attributes.position ? newGeometry.attributes.position.count : 0;
    if (canvasStatsText) {
      canvasStatsText.textContent = `Three.js SVGLoader · ${vertCount.toLocaleString()} Vertices · PBR ${MATERIAL_PRESETS[state.currentMaterial]?.name || 'Shader'}`;
    }
  }

  // 10. Animation Loop
  let lastTime = 0;
  function animate(time) {
    requestAnimationFrame(animate);

    // Damping and auto-rotation
    if (controls && typeof controls.update === 'function') {
      controls.update();
    }

    // Gentle floating bobbing animation
    if (meshGroup) {
      const t = (time || 0) * 0.0015;
      meshGroup.position.y = Math.sin(t) * 0.45;
    }

    renderer.render(scene, camera);
  }

  // 11. View Angle Switching Toolbar
  function setCameraView(mode) {
    state.viewMode = mode;
    [btnViewFront, btnViewTop, btnViewIso].forEach(btn => btn?.classList.remove('active'));

    const duration = 0.05;
    if (mode === 'front') {
      btnViewFront?.classList.add('active');
      camera.position.set(0, 0, 36);
    } else if (mode === 'top') {
      btnViewTop?.classList.add('active');
      camera.position.set(0, 38, 0.001);
    } else {
      btnViewIso?.classList.add('active');
      camera.position.set(20, 16, 32);
    }
    camera.lookAt(0, 0, 0);
    if (controls && controls.target) controls.target.set(0, 0, 0);
  }

  if (btnViewFront) btnViewFront.addEventListener('click', () => setCameraView('front'));
  if (btnViewTop) btnViewTop.addEventListener('click', () => setCameraView('top'));
  if (btnViewIso) btnViewIso.addEventListener('click', () => setCameraView('iso'));

  if (btnResetCamera) {
    btnResetCamera.addEventListener('click', () => {
      setCameraView('iso');
      showToast('Camera reset to default isometric view');
    });
  }

  if (btnAutoSpin) {
    btnAutoSpin.addEventListener('click', () => {
      state.autoSpin = !state.autoSpin;
      btnAutoSpin.classList.toggle('active', state.autoSpin);
      if (controls) controls.autoRotate = state.autoSpin;
      showToast(state.autoSpin ? 'Auto-spin turntable enabled' : 'Auto-spin paused');
    });
  }

  if (btnWireframe) {
    btnWireframe.addEventListener('click', () => {
      state.wireframe = !state.wireframe;
      btnWireframe.classList.toggle('active', state.wireframe);
      if (activeMaterial) activeMaterial.wireframe = state.wireframe;
      showToast(state.wireframe ? 'Wireframe topology active' : 'Wireframe disabled');
    });
  }

  // 12. Responsive Resize
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', handleResize);

  // 13. Sliders & Parameter Bindings
  function bindSlider(slider, display, key, unit = '', onChange) {
    if (!slider || !display) return;
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state[key] = val;
      display.textContent = unit ? `${val}${unit}` : val;
      if (onChange) onChange(val);
    });
  }

  bindSlider(sliderDepth, valDepth, 'depth', '', () => build3DModel());
  bindSlider(sliderBevelSize, valBevelSize, 'bevelSize', '', () => build3DModel());
  bindSlider(sliderBevelSegments, valBevelSegments, 'bevelSegments', '', () => build3DModel());

  bindSlider(sliderRoughness, valRoughness, 'roughness', '', () => updateMaterial());
  bindSlider(sliderMetalness, valMetalness, 'metalness', '', () => updateMaterial());
  bindSlider(sliderGlow, valGlow, 'glow', '', () => updateMaterial());

  // Dual Color Picker Sync (Base Color)
  function setBaseColor(hex) {
    state.baseColor = hex;
    if (inputBaseColorPicker) inputBaseColorPicker.value = hex;
    if (inputBaseColorHex) inputBaseColorHex.value = hex;
    updateMaterial();
  }

  if (inputBaseColorPicker) {
    inputBaseColorPicker.addEventListener('input', (e) => setBaseColor(e.target.value));
  }
  if (inputBaseColorHex) {
    inputBaseColorHex.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) setBaseColor(val);
    });
  }

  // Dual Color Picker Sync (Rim Color)
  function setRimColor(hex) {
    state.rimColor = hex;
    if (inputRimColorPicker) inputRimColorPicker.value = hex;
    if (inputRimColorHex) inputRimColorHex.value = hex;
    updateMaterial();
  }

  if (inputRimColorPicker) {
    inputRimColorPicker.addEventListener('input', (e) => setRimColor(e.target.value));
  }
  if (inputRimColorHex) {
    inputRimColorHex.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) setRimColor(val);
    });
  }

  // 14. Material Presets Selector
  function applyMaterialPreset(matKey) {
    const preset = MATERIAL_PRESETS[matKey];
    if (!preset) return;

    state.currentMaterial = matKey;
    state.baseColor = preset.baseColor;
    state.rimColor = preset.rimColor;
    state.roughness = preset.roughness;
    state.metalness = preset.metalness;
    state.glow = preset.glow;
    state.clearcoat = preset.clearcoat;
    state.clearcoatRoughness = preset.clearcoatRoughness;

    // Update UI controls
    setBaseColor(preset.baseColor);
    setRimColor(preset.rimColor);
    if (sliderRoughness) sliderRoughness.value = preset.roughness;
    if (valRoughness) valRoughness.textContent = preset.roughness.toFixed(2);
    if (sliderMetalness) sliderMetalness.value = preset.metalness;
    if (valMetalness) valMetalness.textContent = preset.metalness.toFixed(2);
    if (sliderGlow) sliderGlow.value = preset.glow;
    if (valGlow) valGlow.textContent = preset.glow.toFixed(2);

    // Update active preset button highlight
    if (materialPresetsList) {
      materialPresetsList.querySelectorAll('.material-preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.material === matKey);
      });
    }

    updateMaterial();
    showToast(`Applied material: ${preset.name}`);
  }

  if (materialPresetsList) {
    materialPresetsList.querySelectorAll('.material-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mat = btn.dataset.material;
        if (mat) applyMaterialPreset(mat);
      });
    });
  }

  // 15. Vector Presets Selector
  function applyVectorPreset(presetKey) {
    const preset = VECTOR_PRESETS[presetKey];
    if (!preset) return;

    state.currentPreset = presetKey;
    state.customSvgContent = null;
    state.customFileName = null;

    // Update vector presets cards
    if (vectorPresetsList) {
      vectorPresetsList.querySelectorAll('.vector-preset-card').forEach(card => {
        card.classList.toggle('active', card.dataset.preset === presetKey);
      });
    }

    // Update active asset slot
    if (assetName) assetName.textContent = preset.name;
    if (assetMeta) assetMeta.textContent = preset.meta;
    if (assetThumb) assetThumb.innerHTML = preset.svg;

    build3DModel();
    showToast(`Loaded vector preset: ${preset.name}`);
  }

  if (vectorPresetsList) {
    vectorPresetsList.querySelectorAll('.vector-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const pKey = card.dataset.preset;
        if (pKey) applyVectorPreset(pKey);
      });
    });
  }

  // 16. Custom SVG Upload & Drag-and-Drop
  function loadCustomSvg(svgText, filename) {
    state.customSvgContent = svgText;
    state.customFileName = filename;
    state.currentPreset = 'custom';

    // Remove active state from preset cards
    if (vectorPresetsList) {
      vectorPresetsList.querySelectorAll('.vector-preset-card').forEach(card => card.classList.remove('active'));
    }

    // Update asset slot
    if (assetName) assetName.textContent = filename || 'Custom SVG File';
    if (assetMeta) assetMeta.textContent = `Uploaded SVG · ${(svgText.length / 1024).toFixed(1)} KB`;
    if (assetThumb) {
      assetThumb.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    }

    build3DModel();
    showToast(`Extruded custom SVG: ${filename}`);
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast('Please upload a valid .svg vector file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      loadCustomSvg(content, file.name);
    };
    reader.readAsText(file);
  }

  if (svgFileInput) {
    svgFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });
  }

  // Drag and Drop on drop-zone
  if (svgDropZone) {
    svgDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      svgDropZone.classList.add('drag-over');
    });
    svgDropZone.addEventListener('dragleave', () => {
      svgDropZone.classList.remove('drag-over');
    });
    svgDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      svgDropZone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Drag and Drop directly onto 3D viewport canvas
  if (container) {
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Reset to default preset
  if (btnResetAsset) {
    btnResetAsset.addEventListener('click', () => {
      applyVectorPreset('cube');
    });
  }

  // 17. Reset Buttons
  if (btnResetGeometry) {
    btnResetGeometry.addEventListener('click', () => {
      state.depth = 24;
      state.bevelSize = 4.0;
      state.bevelSegments = 4;
      if (sliderDepth) sliderDepth.value = 24;
      if (valDepth) valDepth.textContent = '24';
      if (sliderBevelSize) sliderBevelSize.value = 4.0;
      if (valBevelSize) valBevelSize.textContent = '4.0';
      if (sliderBevelSegments) sliderBevelSegments.value = 4;
      if (valBevelSegments) valBevelSegments.textContent = '4';
      build3DModel();
      showToast('Reset extrusion geometry');
    });
  }

  if (btnResetMaterial) {
    btnResetMaterial.addEventListener('click', () => {
      applyMaterialPreset(state.currentMaterial);
      showToast('Reset material parameters');
    });
  }

  if (btnResetParams) {
    btnResetParams.addEventListener('click', () => {
      state.depth = 24;
      state.bevelSize = 4.0;
      state.bevelSegments = 4;
      if (sliderDepth) sliderDepth.value = 24;
      if (valDepth) valDepth.textContent = '24';
      if (sliderBevelSize) sliderBevelSize.value = 4.0;
      if (valBevelSize) valBevelSize.textContent = '4.0';
      if (sliderBevelSegments) sliderBevelSegments.value = 4;
      if (valBevelSegments) valBevelSegments.textContent = '4';
      applyMaterialPreset('chrome');
      build3DModel();
      showToast('All parameters reset to default');
    });
  }

  // 18. Favourites Persistence
  const FAV_STORAGE_KEY = 'getlayers_favourites';
  function isFavorited() {
    try {
      const favs = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
      return favs.includes('svg-to-3d');
    } catch {
      return false;
    }
  }

  function updateFavBtnState() {
    if (!btnSaveFavorite || !favHeart) return;
    const isFav = isFavorited();
    btnSaveFavorite.classList.toggle('is-fav', isFav);
    favHeart.textContent = isFav ? '♥ Saved to favourites' : '♡ Save to favourites';
  }

  if (btnSaveFavorite) {
    btnSaveFavorite.addEventListener('click', () => {
      try {
        let favs = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
        const idx = favs.indexOf('svg-to-3d');
        if (idx >= 0) {
          favs.splice(idx, 1);
          showToast('Removed from favourites');
        } else {
          favs.push('svg-to-3d');
          showToast('Saved SVG to 3D Extruder to favourites!');
        }
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
        updateFavBtnState();
      } catch (err) {
        console.error('Favourites error:', err);
      }
    });
  }
  updateFavBtnState();

  // 19. Copy Link
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('preset', state.currentPreset);
      url.searchParams.set('material', state.currentMaterial);
      url.searchParams.set('depth', state.depth);
      url.searchParams.set('bevel', state.bevelSize);
      navigator.clipboard.writeText(url.toString()).then(() => {
        showToast('Shareable studio link copied to clipboard!');
      }).catch(() => {
        showToast('Link copied: ' + url.toString());
      });
    });
  }

  // 20. Copy 3D Extrude AI Prompt
  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener('click', () => {
      const currentPresetName = state.customFileName || VECTOR_PRESETS[state.currentPreset]?.name || 'Geometric Vector';
      const matName = MATERIAL_PRESETS[state.currentMaterial]?.name || 'PBR Shader';
      
      const prompt = `Photorealistic 3D extruded vector artwork of "${currentPresetName}", with ${state.depth}mm extrusion depth, smooth bevel curvature (${state.bevelSize}mm bevel, ${state.bevelSegments} segments).
Material: ${matName} (Base Color: ${state.baseColor}, Roughness: ${state.roughness}, Metalness: ${state.metalness}).
Lighting: High-contrast cinematic studio lighting, soft directional drop shadows, and dramatic ${state.rimColor} specular rim glow (intensity: ${state.glow}).
Clean subdivision topology, pristine bevel edges, 8k Raytraced render, Octane / Cycles style studio showcase.`;

      navigator.clipboard.writeText(prompt).then(() => {
        showToast('Copied 3D Extrude AI prompt to clipboard!');
      }).catch(() => {
        showToast('Prompt copied!');
      });
    });
  }

  // 21. Parse Initial URL Parameters
  function initFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const pPreset = params.get('preset');
    const pMaterial = params.get('material');
    const pDepth = params.get('depth');
    const pBevel = params.get('bevel');

    if (pPreset && VECTOR_PRESETS[pPreset]) {
      applyVectorPreset(pPreset);
    }
    if (pMaterial && MATERIAL_PRESETS[pMaterial]) {
      applyMaterialPreset(pMaterial);
    }
    if (pDepth) {
      state.depth = parseInt(pDepth, 10);
      if (sliderDepth) sliderDepth.value = state.depth;
      if (valDepth) valDepth.textContent = state.depth;
    }
    if (pBevel) {
      state.bevelSize = parseFloat(pBevel);
      if (sliderBevelSize) sliderBevelSize.value = state.bevelSize;
      if (valBevelSize) valBevelSize.textContent = state.bevelSize;
    }
  }

  // Initialize
  initThree();
  initFromUrlParams();
});
