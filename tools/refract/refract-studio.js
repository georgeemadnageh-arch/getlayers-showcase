/**
 * Refract — Obscure Glass Effect Studio
 * Flagship WebGL 2.0 / 1.0 Photorealistic Optics & Glass Simulation Engine
 * GetLayers Design System Platform Expansion
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. Studio State & Presets
  // ---------------------------------------------------------------------------
  const state = {
    pattern: 'fluted',     // 'fluted' | 'block' | 'frosted' | 'rain' | 'flemish'
    scale: 48,             // 6 - 220
    relief: 1.40,          // 0.0 - 3.0
    thickness: 65,         // 0 - 200px
    dispersion: 0.45,      // 0.0 - 1.0
    specular: 0.70,        // 0.0 - 1.0
    ior: 1.52,             // 1.0 - 2.5
    mediaName: 'Default Editorial Media',
    mediaMeta: 'Architectural Poster · 240 KB',
    isCustomMedia: false
  };

  const PATTERN_INDEX_MAP = {
    fluted: 0,
    block: 1,
    frosted: 2,
    rain: 3,
    flemish: 4
  };

  const PRESETS = {
    ribbedArch: {
      name: 'Ribbed Architecture',
      pattern: 'fluted',
      scale: 48,
      relief: 1.40,
      thickness: 65,
      dispersion: 0.45,
      specular: 0.70,
      ior: 1.52
    },
    frostedPriv: {
      name: 'Frosted Privacy',
      pattern: 'frosted',
      scale: 180,
      relief: 0.80,
      thickness: 40,
      dispersion: 0.20,
      specular: 0.35,
      ior: 1.45
    },
    heavyBlock: {
      name: 'Heavy Block',
      pattern: 'block',
      scale: 24,
      relief: 2.20,
      thickness: 120,
      dispersion: 0.65,
      specular: 0.90,
      ior: 1.65
    },
    rainyPane: {
      name: 'Rainy Pane',
      pattern: 'rain',
      scale: 80,
      relief: 1.80,
      thickness: 50,
      dispersion: 0.55,
      specular: 0.95,
      ior: 1.33
    }
  };

  // ---------------------------------------------------------------------------
  // 2. DOM Elements
  // ---------------------------------------------------------------------------
  const container = document.getElementById('canvasContainer');
  const canvas = document.getElementById('refractCanvas');
  const canvasStatusText = document.getElementById('canvasStatusText');

  // Sliders & Value Labels
  const sliderScale = document.getElementById('sliderScale');
  const valScale = document.getElementById('valScale');
  const sliderRelief = document.getElementById('sliderRelief');
  const valRelief = document.getElementById('valRelief');
  const sliderThickness = document.getElementById('sliderThickness');
  const valThickness = document.getElementById('valThickness');
  const sliderDispersion = document.getElementById('sliderDispersion');
  const valDispersion = document.getElementById('valDispersion');
  const sliderSpecular = document.getElementById('sliderSpecular');
  const valSpecular = document.getElementById('valSpecular');
  const sliderIOR = document.getElementById('sliderIOR');
  const valIOR = document.getElementById('valIOR');

  // Action Buttons
  const btnResetOptics = document.getElementById('btnResetOptics');
  const btnResetPosition = document.getElementById('btnResetPosition');
  const btnSaveFavorite = document.getElementById('btnSaveFavorite');
  const favHeart = document.getElementById('favHeart');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const studioToast = document.getElementById('studioToast');

  // Media Upload & Slot Elements
  const mediaFileInput = document.getElementById('mediaFileInput');
  const mediaDropZone = document.getElementById('mediaDropZone');
  const mediaAssetSlot = document.getElementById('mediaAssetSlot');
  const mediaThumbPreview = document.getElementById('mediaThumbPreview');
  const mediaAssetName = document.getElementById('mediaAssetName');
  const mediaAssetMeta = document.getElementById('mediaAssetMeta');
  const btnRemoveMedia = document.getElementById('btnRemoveMedia');
  const btnClearMedia = document.getElementById('btnClearMedia');

  // Pattern & Preset Containers
  const patternsList = document.getElementById('patternsList');
  const presetsGallery = document.getElementById('presetsGallery');
  const tabPresetAll = document.getElementById('tabPresetAll');
  const tabPresetFav = document.getElementById('tabPresetFav');

  // ---------------------------------------------------------------------------
  // 3. WebGL Initialization & Shaders
  // ---------------------------------------------------------------------------
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    if (canvasStatusText) canvasStatusText.textContent = 'WebGL not supported on this browser';
    return;
  }
  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  if (canvasStatusText) {
    canvasStatusText.textContent = `Refract Engine v2.4 · ${isWebGL2 ? 'WebGL 2.0' : 'WebGL 1.0'} Active`;
  }

  // Vertex Shader: Fullscreen Screen Quad
  const vsSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  // Fragment Shader: High-Precision Snell's Law & Dispersion Refraction
  const fsSource = `
    precision highp float;
    varying vec2 vUv;

    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform int uPatternType;
    uniform float uPatternScale;
    uniform float uReliefDepth;
    uniform float uThickness;
    uniform float uDispersion;
    uniform float uSpecular;
    uniform float uIOR;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uParallax;

    // Simplex Noise 2D for Frosted Glass Micro-roughness
    vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // 2D Hash function for procedural rain droplets
    vec2 hash22(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453123);
    }

    // Procedural Surface Heightmap Calculation
    float getHeight(vec2 uv) {
      float aspect = uResolution.x / uResolution.y;
      vec2 aspUv = vec2(uv.x * aspect, uv.y);

      // Pattern 0: Fluted / Reeded Glass
      if (uPatternType == 0) {
        float x = uv.x * uPatternScale;
        float c = cos(x * 6.2831853);
        // Slightly rounded cylindrical profile
        return sign(c) * pow(abs(c), 0.72) * 0.5 + 0.5;
      }

      // Pattern 1: Glass Block Chamfer Grid
      if (uPatternType == 1) {
        vec2 g = fract(aspUv * (uPatternScale * 0.12));
        vec2 d = abs(g - 0.5) * 2.0;
        float edge = max(d.x, d.y);
        float bevel = smoothstep(0.92, 0.45, edge);
        float dome = (1.0 - length(d * 0.7)) * 0.28;
        float ripple = sin(g.x * 12.0) * cos(g.y * 12.0) * 0.04;
        return bevel * 0.82 + dome + ripple;
      }

      // Pattern 2: Frosted Matte Glass
      if (uPatternType == 2) {
        vec2 nuv = aspUv * (uPatternScale * 3.2);
        float n = snoise(nuv) * 0.5;
        n += snoise(nuv * 2.1) * 0.25;
        n += snoise(nuv * 4.4) * 0.125;
        n += snoise(nuv * 9.1) * 0.0625;
        return n * 0.35;
      }

      // Pattern 3: Rain Drops on Pane
      if (uPatternType == 3) {
        float h = 0.0;
        // Primary drops
        vec2 gridUv = aspUv * (uPatternScale * 0.25);
        vec2 iG = floor(gridUv);
        vec2 fG = fract(gridUv) - 0.5;
        vec2 rnd = hash22(iG);
        vec2 dropPos = (rnd - 0.5) * 0.55;
        float rad = 0.14 + rnd.x * 0.16;
        float dist = length(fG - dropPos);
        if (dist < rad) {
          float normD = dist / rad;
          h += sqrt(max(0.0, 1.0 - normD * normD)) * 1.6;
        }
        // Downward streak / condensation bead trail
        float streak = max(0.0, 1.0 - abs(fG.x - dropPos.x) / (rad * 0.32)) * step(dropPos.y, fG.y) * 0.25;
        h += streak;

        // Fine condensation beads
        vec2 grid2 = aspUv * (uPatternScale * 0.7);
        vec2 iG2 = floor(grid2);
        vec2 fG2 = fract(grid2) - 0.5;
        vec2 rnd2 = hash22(iG2);
        float rad2 = 0.07 + rnd2.y * 0.10;
        float dist2 = length(fG2 - (rnd2 - 0.5) * 0.65);
        if (dist2 < rad2) {
          float normD2 = dist2 / rad2;
          h += sqrt(max(0.0, 1.0 - normD2 * normD2)) * 0.7;
        }
        return h;
      }

      // Pattern 4: Flemish Wave (Antique Rolled Glass)
      if (uPatternType == 4) {
        vec2 fuv = aspUv * (uPatternScale * 0.16);
        float w1 = sin(fuv.x * 3.14 + sin(fuv.y * 2.4 + uTime * 0.22)) * 0.5 + 0.5;
        float w2 = cos(fuv.y * 2.7 + cos(fuv.x * 2.1 - uTime * 0.18)) * 0.5 + 0.5;
        float w3 = sin((fuv.x + fuv.y) * 1.7 + uTime * 0.12) * 0.5 + 0.5;
        return (w1 + w2 + w3) / 3.0;
      }

      return 0.0;
    }

    void main() {
      // 1. Central Differences Normal Generation from Heightmap
      float eps = 1.0 / uResolution.y;
      float hL = getHeight(vUv - vec2(eps, 0.0));
      float hR = getHeight(vUv + vec2(eps, 0.0));
      float hD = getHeight(vUv - vec2(0.0, eps));
      float hU = getHeight(vUv + vec2(0.0, eps));

      float dX = (hR - hL) / (2.0 * eps);
      float dY = (hU - hD) / (2.0 * eps);

      // Construct surface normal with relief depth scaling
      vec3 normal = normalize(vec3(-dX * uReliefDepth * 0.0028, -dY * uReliefDepth * 0.0028, 1.0));

      // 2. Incident Viewing Ray (with mouse tilt parallax)
      vec3 incident = normalize(vec3((vUv - 0.5) * 0.38 + uParallax * 0.5, -1.0));

      // 3. 3-Tap Chromatic Aberration Dispersion via Snell's Law
      float d = uDispersion * 0.12;
      float etaR = 1.0 / max(1.001, uIOR - d);
      float etaG = 1.0 / uIOR;
      float etaB = 1.0 / (uIOR + d);

      vec3 rR = refract(incident, normal, etaR);
      vec3 rG = refract(incident, normal, etaG);
      vec3 rB = refract(incident, normal, etaB);

      // Fallback for total internal reflection
      if (length(rR) == 0.0 || rR.z >= 0.0) rR = reflect(incident, normal);
      if (length(rG) == 0.0 || rG.z >= 0.0) rG = reflect(incident, normal);
      if (length(rB) == 0.0 || rB.z >= 0.0) rB = reflect(incident, normal);

      // Distance offset on background plane
      float tDist = (uThickness / 520.0);
      vec2 bgParallax = uParallax * 0.08;

      vec2 uvR = vUv + (rR.xy / max(0.08, abs(rR.z))) * tDist + bgParallax;
      vec2 uvG = vUv + (rG.xy / max(0.08, abs(rG.z))) * tDist + bgParallax;
      vec2 uvB = vUv + (rB.xy / max(0.08, abs(rB.z))) * tDist + bgParallax;

      // Safe UV clamping
      uvR = clamp(uvR, 0.002, 0.998);
      uvG = clamp(uvG, 0.002, 0.998);
      uvB = clamp(uvB, 0.002, 0.998);

      float colorR = texture2D(uTexture, uvR).r;
      float colorG = texture2D(uTexture, uvG).g;
      float colorB = texture2D(uTexture, uvB).b;
      vec3 refractedColor = vec3(colorR, colorG, colorB);

      // 4. Specular Sheen & Dynamic Highlight
      vec3 lightDir = normalize(vec3(uMouse.x * 2.0 - 1.0, (1.0 - uMouse.y) * 2.0 - 1.0, 1.3));
      vec3 viewDir = -incident;
      vec3 halfDir = normalize(lightDir + viewDir);

      float NdotH = max(dot(normal, halfDir), 0.0);
      float blinnSpec = pow(NdotH, 32.0) * uSpecular * 1.15;

      // Grazing specular sheen based on surface normal angle
      float grazingSheen = pow(max(0.0, 1.0 - normal.z), 4.0) * uSpecular * 0.85;

      // 5. Tone & Composite
      vec3 finalColor = refractedColor + vec3(blinnSpec + grazingSheen);

      // Subtle optical glass tint (neutral starphire with faint depth absorption)
      vec3 glassTint = mix(vec3(1.0), vec3(0.96, 0.99, 1.0), uThickness / 200.0);
      finalColor *= glassTint;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  function createShader(glContext, type, source) {
    const shader = glContext.createShader(type);
    glContext.shaderSource(shader, source);
    glContext.compileShader(shader);
    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
      console.error('Shader compile error:', glContext.getShaderInfoLog(shader));
      glContext.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Fullscreen Quad Buffer [-1, -1] to [1, 1]
  const quadVertices = new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0
  ]);

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Uniform Locations
  const uTextureLoc = gl.getUniformLocation(program, 'uTexture');
  const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
  const uPatternTypeLoc = gl.getUniformLocation(program, 'uPatternType');
  const uPatternScaleLoc = gl.getUniformLocation(program, 'uPatternScale');
  const uReliefDepthLoc = gl.getUniformLocation(program, 'uReliefDepth');
  const uThicknessLoc = gl.getUniformLocation(program, 'uThickness');
  const uDispersionLoc = gl.getUniformLocation(program, 'uDispersion');
  const uSpecularLoc = gl.getUniformLocation(program, 'uSpecular');
  const uIORLoc = gl.getUniformLocation(program, 'uIOR');
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
  const uParallaxLoc = gl.getUniformLocation(program, 'uParallax');

  // ---------------------------------------------------------------------------
  // 4. Texture Management: Default High-Contrast Editorial Backdrop
  // ---------------------------------------------------------------------------
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  let activeVideoElement = null;

  function generateDefaultBackdropCanvas() {
    const cvs = document.createElement('canvas');
    cvs.width = 1920;
    cvs.height = 1080;
    const ctx = cvs.getContext('2d');

    // Deep editorial black & slate background
    const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
    bgGrad.addColorStop(0, '#07090e');
    bgGrad.addColorStop(0.5, '#0e121b');
    bgGrad.addColorStop(1, '#050608');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Subtle background architectural coordinate grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1920; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let y = 0; y < 1080; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }

    // High-impact Chromatic Dispersion Color Strips (to vividly show refraction)
    const vibrantGradients = [
      ['#ff007a', '#7928ca'],
      ['#38bdf8', '#818cf8'],
      ['#10b981', '#06b6d4'],
      ['#f59e0b', '#ef4444'],
      ['#8b5cf6', '#ec4899']
    ];

    const stripW = 220;
    const stripH = 340;
    const startX = 140;
    const startY = 160;

    vibrantGradients.forEach((grads, i) => {
      const grad = ctx.createLinearGradient(startX + i * 260, startY, startX + i * 260 + stripW, startY + stripH);
      grad.addColorStop(0, grads[0]);
      grad.addColorStop(1, grads[1]);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(startX + i * 260, startY, stripW, stripH, 20);
      ctx.fill();

      // Inner glowing geometric circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(startX + i * 260 + stripW / 2, startY + stripH / 2, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(startX + i * 260 + stripW / 2, startY + stripH / 2, 22, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bold Editorial Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 108px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '-0.03em';
    ctx.fillText('REFRACT.', 140, 680);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 108px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STUDIO', 740, 680);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Real-Time Snell\'s Law Dispersion & Obscure Glass', 140, 750);

    // Tech badges
    const tags = ['IOR 1.52', '3-TAP DISPERSION', 'NORMAL HEIGHTMAP', 'SPECTRAL ABERRATION', 'GETLAYERS 2026'];
    let tagX = 140;
    tags.forEach(tag => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(tagX, 810, 200, 44, 10);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 15px "JetBrains Mono", monospace';
      ctx.fillText(tag, tagX + 16, 838);

      tagX += 220;
    });

    // Lower editorial signature
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillText('C:/Users/UG/Downloads/getlayers-showcase/tools/refract/ · WEBGL 2.0 FRAGMENT PIPELINE', 140, 930);

    return cvs;
  }

  function uploadCanvasToTexture(cvs) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cvs);
    if (mediaThumbPreview) {
      mediaThumbPreview.style.backgroundImage = `url(${cvs.toDataURL()})`;
    }
  }

  const defaultBackdropCanvas = generateDefaultBackdropCanvas();
  uploadCanvasToTexture(defaultBackdropCanvas);

  function resetToDefaultMedia() {
    if (activeVideoElement) {
      activeVideoElement.pause();
      activeVideoElement.src = '';
      activeVideoElement = null;
    }
    state.isCustomMedia = false;
    state.mediaName = 'Default Editorial Media';
    state.mediaMeta = 'Architectural Poster · 240 KB';
    if (mediaAssetName) mediaAssetName.textContent = state.mediaName;
    if (mediaAssetMeta) mediaAssetMeta.textContent = state.mediaMeta;
    uploadCanvasToTexture(defaultBackdropCanvas);
    showToast('Reset to default editorial backdrop');
  }

  function handleCustomMedia(file) {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      alert('Please provide a valid image (PNG, JPG, WebP, SVG) or video (MP4, WebM).');
      return;
    }

    const fileSizeStr = (file.size / 1024 > 1024) 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    state.isCustomMedia = true;
    state.mediaName = file.name;
    state.mediaMeta = `${isVideo ? 'Video' : 'Image'} · ${fileSizeStr}`;

    if (mediaAssetName) mediaAssetName.textContent = state.mediaName;
    if (mediaAssetMeta) mediaAssetMeta.textContent = state.mediaMeta;

    if (activeVideoElement) {
      activeVideoElement.pause();
      activeVideoElement = null;
    }

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          if (mediaThumbPreview) {
            mediaThumbPreview.style.backgroundImage = `url(${img.src})`;
          }
          showToast(`Loaded ${file.name} behind glass`);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else if (isVideo) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);
      video.play().then(() => {
        activeVideoElement = video;
        if (mediaThumbPreview) {
          mediaThumbPreview.style.backgroundImage = 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)';
        }
        showToast(`Playing video ${file.name} behind glass`);
      }).catch(err => {
        console.warn('Video autoplay waiting for interaction:', err);
      });
    }
  }

  // File Drop and Input Listeners
  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleCustomMedia(file);
    });
  }

  if (mediaDropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      mediaDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        mediaDropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      mediaDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        mediaDropZone.classList.remove('drag-over');
      });
    });

    mediaDropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) handleCustomMedia(file);
    });
  }

  if (btnRemoveMedia) btnRemoveMedia.addEventListener('click', resetToDefaultMedia);
  if (btnClearMedia) btnClearMedia.addEventListener('click', resetToDefaultMedia);

  // ---------------------------------------------------------------------------
  // 5. Interactive Parallax & Mouse Controls
  // ---------------------------------------------------------------------------
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let targetParallax = { x: 0, y: 0 };
  let currentParallax = { x: 0, y: 0 };
  let mouseNorm = { x: 0.5, y: 0.5 };
  let velX = 0;
  let velY = 0;

  function updateMouseCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    mouseNorm.x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    mouseNorm.y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  }

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    updateMouseCoords(e);
  });

  window.addEventListener('mousemove', (e) => {
    updateMouseCoords(e);
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    targetParallax.x += dx * 0.003;
    targetParallax.y -= dy * 0.003;

    // Bounds limit
    targetParallax.x = Math.max(-1.5, Math.min(1.5, targetParallax.x));
    targetParallax.y = Math.max(-1.5, Math.min(1.5, targetParallax.y));

    velX = dx * 0.002;
    velY = -dy * 0.002;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      updateMouseCoords(e);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      updateMouseCoords(e);
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;

      targetParallax.x += dx * 0.003;
      targetParallax.y -= dy * 0.003;

      targetParallax.x = Math.max(-1.5, Math.min(1.5, targetParallax.x));
      targetParallax.y = Math.max(-1.5, Math.min(1.5, targetParallax.y));
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Mouse Wheel adjusts thickness smoothly
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    state.thickness = Math.max(0, Math.min(200, state.thickness + (e.deltaY > 0 ? 5 : -5)));
    if (sliderThickness) sliderThickness.value = state.thickness;
    if (valThickness) valThickness.textContent = `${state.thickness}px`;
  }, { passive: false });

  // ---------------------------------------------------------------------------
  // 6. UI Synchronization & Preset Binding
  // ---------------------------------------------------------------------------
  function syncUIFromState() {
    if (sliderScale) sliderScale.value = state.scale;
    if (valScale) valScale.textContent = state.scale;

    if (sliderRelief) sliderRelief.value = state.relief;
    if (valRelief) valRelief.textContent = state.relief.toFixed(2);

    if (sliderThickness) sliderThickness.value = state.thickness;
    if (valThickness) valThickness.textContent = `${state.thickness}px`;

    if (sliderDispersion) sliderDispersion.value = state.dispersion;
    if (valDispersion) valDispersion.textContent = state.dispersion.toFixed(2);

    if (sliderSpecular) sliderSpecular.value = state.specular;
    if (valSpecular) valSpecular.textContent = state.specular.toFixed(2);

    if (sliderIOR) sliderIOR.value = state.ior;
    if (valIOR) valIOR.textContent = state.ior.toFixed(2);

    // Update active pattern button
    document.querySelectorAll('.pattern-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pattern === state.pattern);
    });

    // Update active preset card if matched
    document.querySelectorAll('.preset-card').forEach(btn => {
      const pKey = btn.dataset.preset;
      const p = PRESETS[pKey];
      const match = p && p.pattern === state.pattern &&
        Math.abs(p.scale - state.scale) < 2 &&
        Math.abs(p.relief - state.relief) < 0.1 &&
        Math.abs(p.thickness - state.thickness) < 5 &&
        Math.abs(p.dispersion - state.dispersion) < 0.05 &&
        Math.abs(p.ior - state.ior) < 0.05;
      btn.classList.toggle('active', !!match);
    });
  }

  // Slider Listeners
  if (sliderScale) {
    sliderScale.addEventListener('input', (e) => {
      state.scale = parseFloat(e.target.value);
      if (valScale) valScale.textContent = state.scale;
    });
  }

  if (sliderRelief) {
    sliderRelief.addEventListener('input', (e) => {
      state.relief = parseFloat(e.target.value);
      if (valRelief) valRelief.textContent = state.relief.toFixed(2);
    });
  }

  if (sliderThickness) {
    sliderThickness.addEventListener('input', (e) => {
      state.thickness = parseInt(e.target.value, 10);
      if (valThickness) valThickness.textContent = `${state.thickness}px`;
    });
  }

  if (sliderDispersion) {
    sliderDispersion.addEventListener('input', (e) => {
      state.dispersion = parseFloat(e.target.value);
      if (valDispersion) valDispersion.textContent = state.dispersion.toFixed(2);
    });
  }

  if (sliderSpecular) {
    sliderSpecular.addEventListener('input', (e) => {
      state.specular = parseFloat(e.target.value);
      if (valSpecular) valSpecular.textContent = state.specular.toFixed(2);
    });
  }

  if (sliderIOR) {
    sliderIOR.addEventListener('input', (e) => {
      state.ior = parseFloat(e.target.value);
      if (valIOR) valIOR.textContent = state.ior.toFixed(2);
    });
  }

  // Glass Pattern Switcher
  if (patternsList) {
    patternsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.pattern-option-btn');
      if (!btn) return;
      const pat = btn.dataset.pattern;
      if (pat && PATTERN_INDEX_MAP[pat] !== undefined) {
        state.pattern = pat;
        syncUIFromState();
        showToast(`Pattern switched to ${btn.querySelector('.pattern-meta span')?.textContent || pat}`);
      }
    });
  }

  // Presets Gallery
  if (presetsGallery) {
    presetsGallery.addEventListener('click', (e) => {
      const card = e.target.closest('.preset-card');
      if (!card) return;
      const key = card.dataset.preset;
      const p = PRESETS[key];
      if (p) {
        state.pattern = p.pattern;
        state.scale = p.scale;
        state.relief = p.relief;
        state.thickness = p.thickness;
        state.dispersion = p.dispersion;
        state.specular = p.specular;
        state.ior = p.ior;
        syncUIFromState();
        showToast(`Loaded ${p.name} preset`);
      }
    });
  }

  // Reset Optics to active preset defaults
  if (btnResetOptics) {
    btnResetOptics.addEventListener('click', () => {
      const currentPresetKey = Object.keys(PRESETS).find(k => PRESETS[k].pattern === state.pattern) || 'ribbedArch';
      const p = PRESETS[currentPresetKey];
      state.scale = p.scale;
      state.relief = p.relief;
      state.thickness = p.thickness;
      state.dispersion = p.dispersion;
      state.specular = p.specular;
      state.ior = p.ior;
      syncUIFromState();
      showToast('Optics reset to preset values');
    });
  }

  // Reset Position Action
  if (btnResetPosition) {
    btnResetPosition.addEventListener('click', () => {
      targetParallax = { x: 0, y: 0 };
      velX = 0;
      velY = 0;
      showToast('Parallax position reset to center');
    });
  }

  // Favorites Toggle
  let isFav = localStorage.getItem('getlayers_refract_fav') === 'true';
  function updateFavState(fav) {
    isFav = fav;
    localStorage.setItem('getlayers_refract_fav', fav ? 'true' : 'false');
    if (favHeart) {
      favHeart.textContent = fav ? '♥ In favourites' : '♡ Save to favourites';
    }
    if (btnSaveFavorite) {
      btnSaveFavorite.classList.toggle('is-fav', fav);
    }
  }
  updateFavState(isFav);

  if (btnSaveFavorite) {
    btnSaveFavorite.addEventListener('click', () => {
      updateFavState(!isFav);
      showToast(isFav ? 'Saved Refract Studio to favourites' : 'Removed from favourites');
    });
  }

  // Preset Tabs
  if (tabPresetAll && tabPresetFav) {
    tabPresetAll.addEventListener('click', () => {
      tabPresetAll.classList.add('active');
      tabPresetFav.classList.remove('active');
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('hidden'));
    });

    tabPresetFav.addEventListener('click', () => {
      tabPresetFav.classList.add('active');
      tabPresetAll.classList.remove('active');
      document.querySelectorAll('.preset-card').forEach((c, idx) => {
        // Show ribbed and heavy block in favourites demo
        c.classList.toggle('hidden', idx > 1);
      });
    });
  }

  // Copy Link Action
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const params = new URLSearchParams({
        pattern: state.pattern,
        scale: state.scale,
        relief: state.relief,
        thickness: state.thickness,
        dispersion: state.dispersion,
        specular: state.specular,
        ior: state.ior
      });
      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Copied studio share link to clipboard!');
      }).catch(() => {
        showToast('Link copied!');
      });
    });
  }

  // Copy Shader Prompt Action
  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener('click', () => {
      const promptText = `
=== GETLAYERS REFRACT GLASS SHADER SPECIFICATION ===
Architecture: WebGL 2.0 Fragment Shader
Surface Profile: ${state.pattern.toUpperCase()} (Index: ${PATTERN_INDEX_MAP[state.pattern]})
Pattern Scale: ${state.scale}
Relief Normal Depth: ${state.relief.toFixed(2)}
Glass Thickness: ${state.thickness}px
Chromatic Dispersion: ${state.dispersion.toFixed(2)}
Specular Sheen: ${state.specular.toFixed(2)}
Index of Refraction (IOR): ${state.ior.toFixed(2)}

GLSL Snell's Law & Central Differences Implementation:
float eps = 1.0 / uResolution.y;
float hL = getHeight(uv - vec2(eps, 0.0));
float hR = getHeight(uv + vec2(eps, 0.0));
float hD = getHeight(uv - vec2(0.0, eps));
float hU = getHeight(uv + vec2(0.0, eps));
vec3 normal = normalize(vec3(-(hR - hL) / (2.0 * eps) * ${state.relief.toFixed(2)} * 0.0028, -(hU - hD) / (2.0 * eps) * ${state.relief.toFixed(2)} * 0.0028, 1.0));

// 3-Tap Chromatic Dispersion Refraction
float d = ${state.dispersion.toFixed(2)} * 0.12;
vec3 rR = refract(incident, normal, 1.0 / (${state.ior.toFixed(2)} - d));
vec3 rG = refract(incident, normal, 1.0 / ${state.ior.toFixed(2)});
vec3 rB = refract(incident, normal, 1.0 / (${state.ior.toFixed(2)} + d));
vec3 refracted = vec3(texture2D(uTexture, uv + (rR.xy / abs(rR.z)) * (${state.thickness}/520.0)).r,
                      texture2D(uTexture, uv + (rG.xy / abs(rG.z)) * (${state.thickness}/520.0)).g,
                      texture2D(uTexture, uv + (rB.xy / abs(rB.z)) * (${state.thickness}/520.0)).b);
float sheen = pow(max(0.0, 1.0 - normal.z), 4.0) * ${state.specular.toFixed(2)};
vec3 finalColor = refracted + vec3(sheen);
`.trim();

      navigator.clipboard.writeText(promptText).then(() => {
        showToast('Copied Refract shader prompt to clipboard!');
      }).catch(() => {
        showToast('Prompt copied!');
      });
    });
  }

  // Toast Helper
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

  // ---------------------------------------------------------------------------
  // 7. URL Parameters Query Parsing
  // ---------------------------------------------------------------------------
  function parseUrlParams() {
    try {
      const url = new URL(window.location.href);
      const pat = url.searchParams.get('pattern');
      const sc = url.searchParams.get('scale');
      const rel = url.searchParams.get('relief');
      const th = url.searchParams.get('thickness');
      const disp = url.searchParams.get('dispersion');
      const spec = url.searchParams.get('specular');
      const ior = url.searchParams.get('ior');

      if (pat && PATTERN_INDEX_MAP[pat] !== undefined) state.pattern = pat;
      if (sc && !isNaN(parseFloat(sc))) state.scale = parseFloat(sc);
      if (rel && !isNaN(parseFloat(rel))) state.relief = parseFloat(rel);
      if (th && !isNaN(parseInt(th, 10))) state.thickness = parseInt(th, 10);
      if (disp && !isNaN(parseFloat(disp))) state.dispersion = parseFloat(disp);
      if (spec && !isNaN(parseFloat(spec))) state.specular = parseFloat(spec);
      if (ior && !isNaN(parseFloat(ior))) state.ior = parseFloat(ior);
      syncUIFromState();
    } catch (e) {
      console.warn('URL param parse ignored', e);
    }
  }
  parseUrlParams();

  // ---------------------------------------------------------------------------
  // 8. Main Render Loop & Resize Handling
  // ---------------------------------------------------------------------------
  function resizeCanvas() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderW = Math.floor(width * dpr);
    const renderH = Math.floor(height * dpr);

    if (canvas.width !== renderW || canvas.height !== renderH) {
      canvas.width = renderW;
      canvas.height = renderH;
      gl.viewport(0, 0, renderW, renderH);
    }
  }

  let startTime = performance.now();

  function render() {
    resizeCanvas();

    const now = performance.now();
    const elapsedTime = (now - startTime) * 0.001;

    // Apply Parallax Inertia & Friction
    if (!isDragging) {
      targetParallax.x += velX;
      targetParallax.y += velY;
      velX *= 0.90;
      velY *= 0.90;
    }
    currentParallax.x += (targetParallax.x - currentParallax.x) * 0.08;
    currentParallax.y += (targetParallax.y - currentParallax.y) * 0.08;

    // Update active video frame if video background
    if (activeVideoElement && activeVideoElement.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, activeVideoElement);
    }

    // Set Shader Uniforms
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTextureLoc, 0);

    gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
    gl.uniform1i(uPatternTypeLoc, PATTERN_INDEX_MAP[state.pattern] || 0);
    gl.uniform1f(uPatternScaleLoc, state.scale);
    gl.uniform1f(uReliefDepthLoc, state.relief);
    gl.uniform1f(uThicknessLoc, state.thickness);
    gl.uniform1f(uDispersionLoc, state.dispersion);
    gl.uniform1f(uSpecularLoc, state.specular);
    gl.uniform1f(uIORLoc, state.ior);
    gl.uniform1f(uTimeLoc, elapsedTime);
    gl.uniform2f(uMouseLoc, mouseNorm.x, mouseNorm.y);
    gl.uniform2f(uParallaxLoc, currentParallax.x, currentParallax.y);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  // Start WebGL render loop
  requestAnimationFrame(render);
});
