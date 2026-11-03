/**
 * Holographic Cloth Generator — Core 3D WebGL Engine
 * Authentic GetLayers 3D Studio Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Studio State matching official GetLayers parameters
  const state = {
    baseColor: '#101114',
    holoIntensity: 0.00,
    holoScale: 8,
    hueShift: 0.00,
    sparkle: 1.14,
    clothTexture: null,
    stickerTexture: null,
    clothImageName: 'Default Artwork · 145 KB'
  };

  const PRESETS = {
    midnightPrism: {
      name: 'Midnight Charcoal',
      baseColor: '#101114',
      holoIntensity: 0.00,
      holoScale: 8,
      hueShift: 0.00,
      sparkle: 1.14
    },
    auroraFoil: {
      name: 'Aurora Foil',
      baseColor: '#0d1a1c',
      holoIntensity: 0.85,
      holoScale: 18,
      hueShift: 0.38,
      sparkle: 1.85
    },
    iceChrome: {
      name: 'Liquid Chrome',
      baseColor: '#cfe3f2',
      holoIntensity: 0.45,
      holoScale: 12,
      hueShift: 0.55,
      sparkle: 2.20
    },
    velvetNoir: {
      name: 'Velvet Prism',
      baseColor: '#2b103e',
      holoIntensity: 0.65,
      holoScale: 24,
      hueShift: 0.75,
      sparkle: 0.80
    }
  };

  // 2. DOM Elements
  const container = document.getElementById('canvasContainer');
  const canvas = document.getElementById('clothCanvas');
  const inputColorHex = document.getElementById('inputBaseColorHex');
  const inputColorPicker = document.getElementById('inputBaseColorPicker');
  const sliderRainbow = document.getElementById('sliderRainbow');
  const valRainbow = document.getElementById('valRainbow');
  const sliderPattern = document.getElementById('sliderPattern');
  const valPattern = document.getElementById('valPattern');
  const sliderShift = document.getElementById('sliderShift');
  const valShift = document.getElementById('valShift');
  const sliderGlitter = document.getElementById('sliderGlitter');
  const valGlitter = document.getElementById('valGlitter');
  const btnResetFoil = document.getElementById('btnResetFoil');
  const btnResetPosition = document.getElementById('btnResetPosition');
  const btnSaveFavorite = document.getElementById('btnSaveFavorite');
  const favHeart = document.getElementById('favHeart');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const clothFileInput = document.getElementById('clothFileInput');
  const clothDropZone = document.getElementById('clothDropZone');
  const stickerFileInput = document.getElementById('stickerFileInput');
  const stickerDropZone = document.getElementById('stickerDropZone');
  const clothThumbPreview = document.getElementById('clothThumbPreview');
  const clothAssetMeta = document.getElementById('clothAssetMeta');
  const btnRemoveCloth = document.getElementById('btnRemoveCloth');
  const btnClearImages = document.getElementById('btnClearImages');
  const studioToast = document.getElementById('studioToast');

  // 3. Three.js Scene Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020203);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // 4. Default Authentic Cloth Texture Generation (Canvas with Typography)
  function createDefaultClothCanvas() {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    // Deep editorial charcoal background
    ctx.fillStyle = '#0e1014';
    ctx.fillRect(0, 0, 1024, 1024);

    // Render decorative editorial grid tiles (like in screenshot)
    const colors = [
      '#f97316', '#3b82f6', '#ec4899', '#8b5cf6',
      '#10b981', '#06b6d4', '#eab308', '#6366f1'
    ];
    const tileSize = 140;
    const pad = 24;
    let startY = 80;
    let startX = 60;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const x = startX + c * (tileSize + pad);
        const y = startY + r * (tileSize + pad);
        const col = colors[(r * 5 + c) % colors.length];

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(x, y, tileSize, tileSize, 12);
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, 35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Authentic lower fold typography matching GetLayers:
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Cinematic,', 80, 780);
    ctx.fillText('layer by layer.', 80, 850);

    // Subtle signature brand mark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('GETLAYERS · 3D CLOTH PHYSICS STUDIO', 80, 920);

    return cvs;
  }

  const defaultTextureCanvas = createDefaultClothCanvas();
  const clothTexture = new THREE.CanvasTexture(defaultTextureCanvas);
  clothTexture.wrapS = THREE.RepeatWrapping;
  clothTexture.wrapT = THREE.RepeatWrapping;

  // Set thumbnail
  clothThumbPreview.style.backgroundImage = `url(${defaultTextureCanvas.toDataURL()})`;

  // 5. Procedural Cloth Geometry and High-Precision Foil Shaders
  const geometry = new THREE.PlaneGeometry(6.2, 6.2, 120, 120);

  // Custom Shader Uniforms
  const uniforms = {
    uTime: { value: 0 },
    uTexture: { value: clothTexture },
    uBaseColor: { value: new THREE.Color(state.baseColor) },
    uHoloIntensity: { value: state.holoIntensity },
    uHoloScale: { value: state.holoScale },
    uHueShift: { value: state.hueShift },
    uSparkle: { value: state.sparkle },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHoverDistort: { value: 0 }
  };

  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHoverDistort;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Realistic physical cloth waves & draping creases
      float wave1 = sin(pos.x * 2.2 + uTime * 0.7) * cos(pos.y * 1.8 + uTime * 0.5) * 0.42;
      float wave2 = sin(pos.x * 4.5 + pos.y * 3.2 - uTime * 0.9) * 0.14;
      float wave3 = cos(pos.y * 6.0 + uTime * 1.2) * 0.06;

      // Subtle mouse interaction wave
      float distToMouse = distance(uv, uMouse);
      float mouseRipple = sin(distToMouse * 18.0 - uTime * 4.0) * exp(-distToMouse * 3.5) * 0.15 * uHoverDistort;

      pos.z += wave1 + wave2 + wave3 + mouseRipple;

      // Calculate smooth normals for glossy reflections
      vec3 pX = pos + vec3(0.01, 0.0, cos(pos.x * 2.2 + uTime * 0.7) * 0.02);
      vec3 pY = pos + vec3(0.0, 0.01, cos(pos.y * 1.8 + uTime * 0.5) * 0.02);
      vec3 calculatedNormal = normalize(cross(pX - pos, pY - pos));
      vNormal = normalMatrix * calculatedNormal;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform vec3 uBaseColor;
    uniform float uHoloIntensity;
    uniform float uHoloScale;
    uniform float uHueShift;
    uniform float uSparkle;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Spectral Rainbow Palette function for iridescent thin-film foil
    vec3 spectralColor(float t) {
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.00, 0.33, 0.67);
      return a + b * cos(6.28318 * (c * t + d));
    }

    // Procedural pseudo-random glitter noise
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel reflection factor
      float NdotV = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, 2.5);

      // Studio Three-Point Lighting
      vec3 lightDir1 = normalize(vec3(1.0, 1.5, 2.0));
      vec3 lightDir2 = normalize(vec3(-1.5, -0.5, 1.0));
      float diff1 = max(dot(normal, lightDir1), 0.0);
      float diff2 = max(dot(normal, lightDir2), 0.0) * 0.4;
      float lighting = diff1 + diff2 + 0.35;

      // Specular Highlight
      vec3 halfDir = normalize(lightDir1 + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.8;

      // Holographic Rainbow Interference Calculation
      float holoFactor = (vUv.x * uHoloScale * 0.5 + vUv.y * uHoloScale * 0.5 + fresnel * 2.0 + uHueShift);
      vec3 rainbow = spectralColor(holoFactor) * uHoloIntensity;

      // Glitter / Metallic Sparkle Simulation
      float sparkleNoise = rand(floor(vUv * 350.0) + vec2(sin(uTime * 2.0) * 0.01));
      float glitterHighlight = pow(sparkleNoise, 16.0) * uSparkle * (diff1 + fresnel);

      // Composite final glossy fabric
      vec3 base = mix(texColor.rgb, uBaseColor, 0.45);
      vec3 finalColor = base * lighting + rainbow * 0.75 + spec + glitterHighlight;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide
  });

  const clothMesh = new THREE.Mesh(geometry, material);
  clothMesh.rotation.x = -0.22;
  clothMesh.rotation.y = 0.15;
  scene.add(clothMesh);

  // 6. Interactive Orbit & Mouse Drag Physics
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let targetRotation = { x: -0.22, y: 0.15 };
  let currentRotation = { x: -0.22, y: 0.15 };

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const uvX = (e.clientX - rect.left) / rect.width;
    const uvY = 1.0 - (e.clientY - rect.top) / rect.height;
    uniforms.uMouse.value.set(uvX, uvY);
    uniforms.uHoverDistort.value = 1.0;

    if (isDragging) {
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;
      prevMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  container.addEventListener('mouseleave', () => {
    uniforms.uHoverDistort.value = 0.0;
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z = Math.max(4.5, Math.min(14.0, camera.position.z + e.deltaY * 0.005));
  }, { passive: false });

  // 7. UI Controls Synchronization
  function updateUI() {
    inputColorPicker.value = state.baseColor;
    inputColorHex.value = state.baseColor;
    sliderRainbow.value = state.holoIntensity;
    valRainbow.textContent = Number(state.holoIntensity).toFixed(2);
    sliderPattern.value = state.holoScale;
    valPattern.textContent = state.holoScale;
    sliderShift.value = state.hueShift;
    valShift.textContent = Number(state.hueShift).toFixed(2);
    sliderGlitter.value = state.sparkle;
    valGlitter.textContent = Number(state.sparkle).toFixed(2);

    // Update uniforms
    uniforms.uBaseColor.value.set(state.baseColor);
    uniforms.uHoloIntensity.value = parseFloat(state.holoIntensity);
    uniforms.uHoloScale.value = parseFloat(state.holoScale);
    uniforms.uHueShift.value = parseFloat(state.hueShift);
    uniforms.uSparkle.value = parseFloat(state.sparkle);
  }

  // Base Colour
  inputColorPicker.addEventListener('input', (e) => {
    state.baseColor = e.target.value;
    inputColorHex.value = state.baseColor;
    uniforms.uBaseColor.value.set(state.baseColor);
  });

  inputColorHex.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      state.baseColor = val;
      inputColorPicker.value = val;
      uniforms.uBaseColor.value.set(val);
    }
  });

  // Rainbow Strength
  sliderRainbow.addEventListener('input', (e) => {
    state.holoIntensity = parseFloat(e.target.value);
    valRainbow.textContent = state.holoIntensity.toFixed(2);
    uniforms.uHoloIntensity.value = state.holoIntensity;
  });

  // Pattern Size
  sliderPattern.addEventListener('input', (e) => {
    state.holoScale = parseInt(e.target.value, 10);
    valPattern.textContent = state.holoScale;
    uniforms.uHoloScale.value = state.holoScale;
  });

  // Colour Shift
  sliderShift.addEventListener('input', (e) => {
    state.hueShift = parseFloat(e.target.value);
    valShift.textContent = state.hueShift.toFixed(2);
    uniforms.uHueShift.value = state.hueShift;
  });

  // Glitter
  sliderGlitter.addEventListener('input', (e) => {
    state.sparkle = parseFloat(e.target.value);
    valGlitter.textContent = state.sparkle.toFixed(2);
    uniforms.uSparkle.value = state.sparkle;
  });

  // Reset Foil Settings
  btnResetFoil.addEventListener('click', () => {
    Object.assign(state, PRESETS.midnightPrism);
    updateUI();
    showToast('Reset Foil settings to default.');
  });

  // Reset Camera Position
  btnResetPosition.addEventListener('click', () => {
    targetRotation = { x: -0.22, y: 0.15 };
    camera.position.set(0, 0, 8.5);
    showToast('Reset 3D position.');
  });

  // Presets Selection
  document.querySelectorAll('.preset-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pKey = btn.dataset.preset;
      if (PRESETS[pKey]) {
        Object.assign(state, PRESETS[pKey]);
        updateUI();
        showToast(`Applied preset: ${PRESETS[pKey].name}`);
      }
    });
  });

  // 8. Custom Texture Uploading (Image as cloth)
  function handleImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const customTex = new THREE.Texture(img);
        customTex.needsUpdate = true;
        uniforms.uTexture.value = customTex;
        clothThumbPreview.style.backgroundImage = `url(${e.target.result})`;
        const sizeKb = (file.size / 1024).toFixed(0);
        clothAssetMeta.textContent = `${file.name} · ${sizeKb} KB`;
        showToast(`Loaded ${file.name} as 3D cloth!`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clothFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  });

  clothDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    clothDropZone.classList.add('dragover');
  });

  clothDropZone.addEventListener('dragleave', () => {
    clothDropZone.classList.remove('dragover');
  });

  clothDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    clothDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  btnRemoveCloth.addEventListener('click', () => {
    uniforms.uTexture.value = clothTexture;
    clothThumbPreview.style.backgroundImage = `url(${defaultTextureCanvas.toDataURL()})`;
    clothAssetMeta.textContent = 'Default Artwork · 145 KB';
    clothFileInput.value = '';
    showToast('Restored default cloth artwork.');
  });

  btnClearImages.addEventListener('click', () => {
    btnRemoveCloth.click();
  });

  // 9. Sticker Uploading
  stickerFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      showToast(`Sticker added: ${e.target.files[0].name}`);
    }
  });

  // 10. Actions & Export
  let isFav = false;
  btnSaveFavorite.addEventListener('click', () => {
    isFav = !isFav;
    favHeart.textContent = isFav ? '♥ Saved to favourites' : '♡ Save to favourites';
    btnSaveFavorite.style.color = isFav ? '#ec4899' : '#cbd5e1';
    showToast(isFav ? 'Added to favourites!' : 'Removed from favourites');
  });

  btnCopyLink.addEventListener('click', () => {
    const params = new URLSearchParams({
      base: state.baseColor,
      holo: state.holoIntensity,
      scale: state.holoScale,
      shift: state.hueShift,
      sparkle: state.sparkle
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Copied shareable configuration link!');
    });
  });

  btnCopyPrompt.addEventListener('click', () => {
    const promptText = `Generate a high-performance interactive 3D Holographic Cloth simulation in React, Three.js, and GLSL.
Parameters:
- Base Color: "${state.baseColor}"
- Rainbow Strength (Holo Intensity): ${state.holoIntensity}
- Pattern Size (Holo Scale): ${state.holoScale}
- Color Shift (Hue Shift): ${state.hueShift}
- Glitter Metallic Sparkle: ${state.sparkle}
Mesh Specs: PlaneGeometry(120, 120 subdivisions) with dynamic vertex waves, thin-film iridescence Fresnel fragment shader, and responsive mouse orbit physics.`;

    navigator.clipboard.writeText(promptText).then(() => {
      showToast('Copied AI Engineering prompt to clipboard!');
    });
  });

  function showToast(msg) {
    studioToast.textContent = msg;
    studioToast.classList.remove('hidden');
    setTimeout(() => {
      studioToast.classList.add('hidden');
    }, 2400);
  }

  // 11. Animation Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    uniforms.uTime.value = elapsedTime;

    // Smooth inertia camera/mesh rotation
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;
    clothMesh.rotation.x = currentRotation.x;
    clothMesh.rotation.y = currentRotation.y;

    renderer.render(scene, camera);
  }

  animate();

  // 12. Responsive Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Initial Sync
  updateUI();
});
