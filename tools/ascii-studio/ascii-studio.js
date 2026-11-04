/**
 * ASCII Studio — Shader Typography & Matrix Art Engine
 * High-Performance Offscreen Video/Canvas Luminance Processor & CRT Phosphor Renderer
 * GetLayers Design System Platform Expansion
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. Studio State & Definitions
  // ---------------------------------------------------------------------------
  const CHARSETS = {
    classic: ' .:-=+*#%@',
    blocks: ' ░▒▓█',
    binary: ' 01',
    matrix: ' 0123456789ABCDEF',
    dots: ' ·:•●'
  };

  const PRESETS = {
    cyberMatrix: {
      name: 'Cyber Matrix',
      charset: 'matrix',
      cellSize: 10,
      contrast: 1.60,
      brightness: 5,
      bloom: 75,
      invert: false,
      scanlines: true,
      curvature: true,
      colorMode: 'matrixGreen',
      sourceType: 'torus'
    },
    retroTerminal: {
      name: 'Retro Terminal',
      charset: 'classic',
      cellSize: 12,
      contrast: 1.35,
      brightness: 0,
      bloom: 50,
      invert: false,
      scanlines: true,
      curvature: true,
      colorMode: 'retroAmber',
      sourceType: 'matrix'
    },
    minimalMono: {
      name: 'Minimal Mono',
      charset: 'dots',
      cellSize: 8,
      contrast: 1.80,
      brightness: -10,
      bloom: 20,
      invert: true,
      scanlines: false,
      curvature: false,
      colorMode: 'paperWhite',
      sourceType: 'plasma'
    },
    denseDither: {
      name: 'Dense Dither',
      charset: 'blocks',
      cellSize: 6,
      contrast: 1.50,
      brightness: 10,
      bloom: 40,
      invert: false,
      scanlines: false,
      curvature: true,
      colorMode: 'rgbSampling',
      sourceType: 'torus'
    }
  };

  const state = {
    sourceType: 'torus',         // 'torus' | 'matrix' | 'plasma' | 'image' | 'video' | 'webcam'
    mediaName: 'Generative Cyber Torus 3D',
    mediaMeta: 'Real-time Procedural · 60 FPS',
    charsetKey: 'classic',
    customCharset: '',
    preset: 'cyberMatrix',
    cellSize: 10,               // 4 - 28px
    contrast: 1.40,             // 0.5 - 2.5
    brightness: 0,              // -50 to +50
    bloom: 60,                  // 0 - 100%
    invert: false,
    scanlines: true,
    curvature: true,
    ripple: true,
    colorMode: 'matrixGreen',   // 'matrixGreen' | 'retroAmber' | 'rgbSampling' | 'paperWhite' | 'cyberCyan'
    isPlaying: true
  };

  // ---------------------------------------------------------------------------
  // 2. DOM Elements
  // ---------------------------------------------------------------------------
  const canvasContainer = document.getElementById('canvasContainer');
  const mainCanvas = document.getElementById('asciiCanvas');
  const ctx = mainCanvas.getContext('2d', { alpha: false });
  const crtOverlay = document.getElementById('crtOverlay');

  // HUD
  const canvasStatusText = document.getElementById('canvasStatusText');
  const canvasStatusDot = document.getElementById('canvasStatusDot');
  const fpsCounter = document.getElementById('fpsCounter');
  const gridDimensions = document.getElementById('gridDimensions');

  // Media & Sources
  const mediaDropZone = document.getElementById('mediaDropZone');
  const mediaFileInput = document.getElementById('mediaFileInput');
  const btnSourceTorus = document.getElementById('btnSourceTorus');
  const btnSourceMatrix = document.getElementById('btnSourceMatrix');
  const btnSourcePlasma = document.getElementById('btnSourcePlasma');
  const activeAssetSlot = document.getElementById('activeAssetSlot');
  const assetThumbIcon = document.getElementById('assetThumbIcon');
  const assetThumbPreview = document.getElementById('assetThumbPreview');
  const assetName = document.getElementById('assetName');
  const assetMeta = document.getElementById('assetMeta');
  const btnRemoveAsset = document.getElementById('btnRemoveAsset');

  // Toolbar
  const btnTogglePlay = document.getElementById('btnTogglePlay');
  const playIcon = document.getElementById('playIcon');
  const playLabel = document.getElementById('playLabel');
  const btnToolbarScanlines = document.getElementById('btnToolbarScanlines');
  const btnToolbarRipple = document.getElementById('btnToolbarRipple');
  const btnCameraFeed = document.getElementById('btnCameraFeed');

  // Charsets & Custom
  const charsetBtns = document.querySelectorAll('.charset-option-btn');
  const customCharsetInput = document.getElementById('customCharsetInput');
  const btnApplyCustomCharset = document.getElementById('btnApplyCustomCharset');

  // Presets & Tabs
  const presetCards = document.querySelectorAll('.preset-card');
  const tabPresetAll = document.getElementById('tabPresetAll');
  const tabPresetFav = document.getElementById('tabPresetFav');
  const presetsGallery = document.getElementById('presetsGallery');

  // Sliders & Toggles
  const sliderCellSize = document.getElementById('sliderCellSize');
  const valCellSize = document.getElementById('valCellSize');
  const sliderContrast = document.getElementById('sliderContrast');
  const valContrast = document.getElementById('valContrast');
  const sliderBrightness = document.getElementById('sliderBrightness');
  const valBrightness = document.getElementById('valBrightness');
  const sliderBloom = document.getElementById('sliderBloom');
  const valBloom = document.getElementById('valBloom');
  const toggleInvert = document.getElementById('toggleInvert');
  const toggleScanlines = document.getElementById('toggleScanlines');
  const toggleCurvature = document.getElementById('toggleCurvature');
  const toggleRipple = document.getElementById('toggleRipple');
  const btnResetParams = document.getElementById('btnResetParams');

  // Color modes
  const colorCards = document.querySelectorAll('.color-mode-card');

  // Actions
  const btnExportSnapshot = document.getElementById('btnExportSnapshot');
  const btnSaveFavorite = document.getElementById('btnSaveFavorite');
  const favHeart = document.getElementById('favHeart');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const studioToast = document.getElementById('studioToast');

  // ---------------------------------------------------------------------------
  // 3. Offscreen Canvas & Procedural Source Generation
  // ---------------------------------------------------------------------------
  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

  let userImage = null;
  let userVideo = null;
  let webcamStream = null;
  let userObjectUrl = null;

  // Animation & FPS tracking
  let animationFrameId = null;
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fpsTimeAccumulator = 0;
  let currentFps = 60;

  // Interactive mouse ripples & distortion tracking
  const ripples = [];
  const mouse = {
    x: -9999,
    y: -9999,
    isHovering: false,
    lastMove: 0
  };

  // Matrix Rain Generator Data
  const MATRIX_COLS = 64;
  const matrixDrops = new Array(MATRIX_COLS).fill(1).map(() => Math.floor(Math.random() * -50));
  const matrixChars = '0123456789ABCDEF0123456789XYZ';

  // ---------------------------------------------------------------------------
  // 4. Procedural Generator Functions
  // ---------------------------------------------------------------------------
  /**
   * Generates a 3D Cyber Torus Knot on the offscreen canvas with smooth shading & rotation
   */
  function renderCyberTorus(ctxTarget, width, height, time) {
    ctxTarget.fillStyle = '#05070a';
    ctxTarget.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const t = time * 0.001;

    // Torus knot parameters
    const p = 2;
    const q = 3;
    const R = Math.min(width, height) * 0.28;
    const r = Math.min(width, height) * 0.12;

    const rotX = t * 0.6;
    const rotY = t * 0.8;
    const rotZ = t * 0.3;

    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const steps = 180;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2 * q;
      const rVal = R + r * Math.cos(p * theta / q);
      let x = rVal * Math.cos(theta);
      let y = rVal * Math.sin(theta);
      let z = -r * Math.sin(p * theta / q);

      // 3D Rotation
      // Rotate Y
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;
      // Rotate X
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;
      // Rotate Z
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      // Perspective projection
      const distance = 400;
      const fov = distance / (distance + z2 + 100);
      points.push({
        x: cx + x3 * fov,
        y: cy + y3 * fov,
        z: z2,
        fov: fov
      });
    }

    // Draw glowing tube segments with specular luminance
    ctxTarget.lineWidth = Math.max(3, Math.min(width, height) * 0.035);
    ctxTarget.lineCap = 'round';
    ctxTarget.lineJoin = 'round';

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Depth lighting
      const lum = Math.max(0.15, Math.min(1.0, (p1.z + 120) / 240));
      const rColor = Math.floor(60 + lum * 195);
      const gColor = Math.floor(180 + lum * 75);
      const bColor = Math.floor(220 + lum * 35);

      ctxTarget.strokeStyle = `rgb(${rColor}, ${gColor}, ${bColor})`;
      ctxTarget.beginPath();
      ctxTarget.moveTo(p1.x, p1.y);
      ctxTarget.lineTo(p2.x, p2.y);
      ctxTarget.stroke();
    }

    // Add glowing core sphere
    const glow = ctxTarget.createRadialGradient(cx, cy, 5, cx, cy, Math.min(width, height) * 0.35);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    glow.addColorStop(0.5, 'rgba(129, 140, 248, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxTarget.fillStyle = glow;
    ctxTarget.beginPath();
    ctxTarget.arc(cx, cy, Math.min(width, height) * 0.35, 0, Math.PI * 2);
    ctxTarget.fill();
  }

  /**
   * Generates dynamic Matrix Digital Rain
   */
  function renderMatrixRain(ctxTarget, width, height) {
    ctxTarget.fillStyle = 'rgba(2, 8, 4, 0.35)';
    ctxTarget.fillRect(0, 0, width, height);

    ctxTarget.font = 'bold 12px monospace';
    const colWidth = width / MATRIX_COLS;

    for (let i = 0; i < MATRIX_COLS; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * colWidth;
      const y = matrixDrops[i] * 12;

      // Bright leader head
      ctxTarget.fillStyle = '#ffffff';
      ctxTarget.fillText(char, x, y);

      // Phosphor green trailing text
      ctxTarget.fillStyle = '#00ff66';
      ctxTarget.fillText(char, x, y - 12);

      if (y > height && Math.random() > 0.975) {
        matrixDrops[i] = 0;
      }
      matrixDrops[i]++;
    }
  }

  /**
   * Generates swirling Plasma Flow
   */
  function renderPlasmaFlow(ctxTarget, width, height, time) {
    const imgData = ctxTarget.createImageData(width, height);
    const data = imgData.data;
    const t = time * 0.002;

    let idx = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Multi-frequency wave formula
        const v1 = Math.sin(x * 0.05 + t);
        const v2 = Math.sin(y * 0.05 + t * 0.8);
        const v3 = Math.sin((x + y) * 0.04 + t * 0.6);
        const cx = x - width / 2;
        const cy = y - height / 2;
        const v4 = Math.sin(Math.sqrt(cx * cx + cy * cy) * 0.08 - t * 1.2);

        const v = (v1 + v2 + v3 + v4) * 0.25; // range roughly -1 to 1
        const lum = Math.floor((v * 0.5 + 0.5) * 255);

        data[idx] = Math.floor(lum * 0.7);     // R
        data[idx + 1] = Math.floor(lum * 0.9); // G
        data[idx + 2] = lum;                   // B
        data[idx + 3] = 255;                   // A
        idx += 4;
      }
    }
    ctxTarget.putImageData(imgData, 0, 0);
  }

  // ---------------------------------------------------------------------------
  // 5. Main Processing & High-Performance Rendering Loop
  // ---------------------------------------------------------------------------
  function getActiveCharset() {
    if (state.charsetKey === 'custom' && state.customCharset.length > 0) {
      return state.customCharset;
    }
    return CHARSETS[state.charsetKey] || CHARSETS.classic;
  }

  function resizeCanvases() {
    const rect = canvasContainer.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const displayWidth = Math.max(200, Math.floor(rect.width));
    const displayHeight = Math.max(200, Math.floor(rect.height));

    if (mainCanvas.width !== displayWidth || mainCanvas.height !== displayHeight) {
      mainCanvas.width = displayWidth;
      mainCanvas.height = displayHeight;
    }

    // Grid columns & rows based on cell size
    const cols = Math.max(16, Math.floor(displayWidth / state.cellSize));
    const rows = Math.max(12, Math.floor(displayHeight / state.cellSize));

    if (offCanvas.width !== cols || offCanvas.height !== rows) {
      offCanvas.width = cols;
      offCanvas.height = rows;
    }

    gridDimensions.textContent = `${cols} × ${rows}`;
  }

  function updateRipples(delta) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed * delta;
      rip.strength *= 0.95;
      if (rip.radius > rip.maxRadius || rip.strength < 0.02) {
        ripples.splice(i, 1);
      }
    }
  }

  function renderFrame(now) {
    if (!state.isPlaying) {
      animationFrameId = requestAnimationFrame(renderFrame);
      return;
    }

    // Frame Delta & FPS
    const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    frameCount++;
    fpsTimeAccumulator += delta;
    if (fpsTimeAccumulator >= 0.5) {
      currentFps = Math.round(frameCount / fpsTimeAccumulator);
      fpsCounter.textContent = `${currentFps} FPS`;
      frameCount = 0;
      fpsTimeAccumulator = 0;
    }

    resizeCanvases();
    updateRipples(delta);

    const cols = offCanvas.width;
    const rows = offCanvas.height;
    const width = mainCanvas.width;
    const height = mainCanvas.height;
    const cellSize = state.cellSize;

    // 1. Render active media or generator to offscreen canvas
    if (state.sourceType === 'torus') {
      renderCyberTorus(offCtx, cols, rows, now);
    } else if (state.sourceType === 'matrix') {
      renderMatrixRain(offCtx, cols, rows);
    } else if (state.sourceType === 'plasma') {
      renderPlasmaFlow(offCtx, cols, rows, now);
    } else if (state.sourceType === 'image' && userImage) {
      offCtx.drawImage(userImage, 0, 0, cols, rows);
    } else if (state.sourceType === 'video' && userVideo) {
      if (userVideo.readyState >= 2) {
        offCtx.drawImage(userVideo, 0, 0, cols, rows);
      }
    } else if (state.sourceType === 'webcam' && userVideo) {
      if (userVideo.readyState >= 2) {
        // Mirror webcam horizontally
        offCtx.save();
        offCtx.scale(-1, 1);
        offCtx.drawImage(userVideo, -cols, 0, cols, rows);
        offCtx.restore();
      }
    }

    // 2. Read luminance pixel buffer
    let imgData;
    try {
      imgData = offCtx.getImageData(0, 0, cols, rows);
    } catch {
      animationFrameId = requestAnimationFrame(renderFrame);
      return;
    }

    const pixels = imgData.data;
    const charset = getActiveCharset();
    const charsetLen = charset.length;

    // 3. Clear Main Viewport
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, width, height);

    // 4. Configure Font & Baseline
    const fontSize = Math.max(4, Math.round(cellSize * 1.05));
    ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bloom Configuration
    const bloomAmount = state.bloom;
    const hasBloom = bloomAmount > 0;
    ctx.shadowBlur = hasBloom ? Math.max(3, Math.round(cellSize * 0.7 * (bloomAmount / 100))) : 0;

    const contrast = state.contrast;
    const brightnessNorm = state.brightness / 100;
    const invert = state.invert;
    const colorMode = state.colorMode;
    const hasRipple = state.ripple && (ripples.length > 0 || mouse.isHovering);

    // Grid offsets to center the ASCII matrix
    const xOffset = (width - cols * cellSize) / 2 + cellSize / 2;
    const yOffset = (height - rows * cellSize) / 2 + cellSize / 2;

    // 5. Draw ASCII Characters
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sampleC = c;
        let sampleR = r;

        // Apply interactive mouse ripple displacement
        if (hasRipple) {
          const charScreenX = xOffset + c * cellSize;
          const charScreenY = yOffset + r * cellSize;

          let displaceX = 0;
          let displaceY = 0;

          // Continuous cursor proximity warp
          if (mouse.isHovering) {
            const dx = charScreenX - mouse.x;
            const dy = charScreenY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 120;
            if (dist < radius && dist > 1) {
              const factor = (1 - dist / radius) * 2.5;
              displaceX += (dx / dist) * factor;
              displaceY += (dy / dist) * factor;
            }
          }

          // Active pulse ripples
          for (let i = 0; i < ripples.length; i++) {
            const rip = ripples[i];
            const dx = charScreenX - rip.x;
            const dy = charScreenY - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const waveDist = Math.abs(dist - rip.radius);
            if (waveDist < 30) {
              const waveAmp = (1 - waveDist / 30) * rip.strength * 4;
              displaceX += (dx / (dist || 1)) * waveAmp;
              displaceY += (dy / (dist || 1)) * waveAmp;
            }
          }

          sampleC = Math.max(0, Math.min(cols - 1, Math.round(c - displaceX)));
          sampleR = Math.max(0, Math.min(rows - 1, Math.round(r - displaceY)));
        }

        const pixelIndex = (sampleR * cols + sampleC) * 4;
        const red = pixels[pixelIndex];
        const green = pixels[pixelIndex + 1];
        const blue = pixels[pixelIndex + 2];

        // Rec. 709 Luminance Formula
        let lum = 0.299 * red + 0.587 * green + 0.114 * blue;

        // Apply Contrast & Brightness
        lum = ((lum / 255 - 0.5) * contrast + 0.5 + brightnessNorm) * 255;
        lum = Math.max(0, Math.min(255, lum));

        if (invert) {
          lum = 255 - lum;
        }

        const normalizedLum = lum / 255;
        const charIdx = Math.min(charsetLen - 1, Math.floor(normalizedLum * charsetLen));
        const glyph = charset[charIdx];

        // Skip blank/empty space for rendering optimization
        if (glyph === ' ') continue;

        // Color computation
        let fillStyle = '#00ff66';
        let glowColor = '#00ff66';

        if (colorMode === 'matrixGreen') {
          if (normalizedLum > 0.85) {
            fillStyle = '#d1fae5'; // bright highlight head
          } else if (normalizedLum > 0.45) {
            fillStyle = '#00ff66';
          } else {
            fillStyle = '#059669';
          }
          glowColor = '#00ff66';
        } else if (colorMode === 'retroAmber') {
          if (normalizedLum > 0.85) {
            fillStyle = '#fef3c7';
          } else if (normalizedLum > 0.45) {
            fillStyle = '#ffb000';
          } else {
            fillStyle = '#b45309';
          }
          glowColor = '#ffb000';
        } else if (colorMode === 'paperWhite') {
          if (normalizedLum > 0.85) {
            fillStyle = '#ffffff';
          } else if (normalizedLum > 0.45) {
            fillStyle = '#cbd5e1';
          } else {
            fillStyle = '#64748b';
          }
          glowColor = '#ffffff';
        } else if (colorMode === 'cyberCyan') {
          if (normalizedLum > 0.85) {
            fillStyle = '#e0f2fe';
          } else if (normalizedLum > 0.45) {
            fillStyle = '#38bdf8';
          } else {
            fillStyle = '#0284c7';
          }
          glowColor = '#38bdf8';
        } else if (colorMode === 'rgbSampling') {
          // Direct RGB sampling with brightness boost
          const rBoost = Math.min(255, Math.floor(red * (0.8 + normalizedLum * 0.5)));
          const gBoost = Math.min(255, Math.floor(green * (0.8 + normalizedLum * 0.5)));
          const bBoost = Math.min(255, Math.floor(blue * (0.8 + normalizedLum * 0.5)));
          fillStyle = `rgb(${rBoost}, ${gBoost}, ${bBoost})`;
          glowColor = fillStyle;
        }

        ctx.fillStyle = fillStyle;
        if (hasBloom) {
          ctx.shadowColor = glowColor;
        }

        const renderX = xOffset + c * cellSize;
        const renderY = yOffset + r * cellSize;
        ctx.fillText(glyph, renderX, renderY);
      }
    }

    animationFrameId = requestAnimationFrame(renderFrame);
  }

  // ---------------------------------------------------------------------------
  // 6. Interactive Mouse & Gesture Listeners
  // ---------------------------------------------------------------------------
  mainCanvas.addEventListener('mousemove', (e) => {
    const rect = mainCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.isHovering = true;
    mouse.lastMove = performance.now();
  });

  mainCanvas.addEventListener('mouseleave', () => {
    mouse.isHovering = false;
  });

  mainCanvas.addEventListener('click', (e) => {
    const rect = mainCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Trigger expanding pulse ripple
    ripples.push({
      x: clickX,
      y: clickY,
      radius: 5,
      maxRadius: Math.max(mainCanvas.width, mainCanvas.height) * 0.45,
      strength: 1.0,
      speed: 380
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Media Input & File Drag/Drop Handling
  // ---------------------------------------------------------------------------
  function stopWebcam() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
  }

  function cleanupUserMedia() {
    stopWebcam();
    if (userVideo) {
      userVideo.pause();
      userVideo.src = '';
      userVideo = null;
    }
    if (userImage) {
      userImage = null;
    }
    if (userObjectUrl) {
      URL.revokeObjectURL(userObjectUrl);
      userObjectUrl = null;
    }
  }

  function handleFile(file) {
    if (!file) return;

    cleanupUserMedia();
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      showToast('Unsupported format: Please drop PNG, JPG, WebP, or MP4/WebM');
      return;
    }

    userObjectUrl = URL.createObjectURL(file);
    const sizeKB = Math.round(file.size / 1024);

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        userImage = img;
        state.sourceType = 'image';
        state.mediaName = file.name;
        state.mediaMeta = `Image · ${sizeKB} KB · ${img.naturalWidth}×${img.naturalHeight}`;
        updateAssetUI(userObjectUrl, 'img');
        showToast(`Loaded ${file.name}`);
      };
      img.onerror = () => {
        showToast('Failed to load image file');
      };
      img.src = userObjectUrl;
    } else if (isVideo) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.src = userObjectUrl;
      video.onloadeddata = () => {
        video.play().catch(() => {});
        userVideo = video;
        state.sourceType = 'video';
        state.mediaName = file.name;
        state.mediaMeta = `Video · ${sizeKB} KB · ${video.videoWidth}×${video.videoHeight}`;
        updateAssetUI(userObjectUrl, 'video');
        showToast(`Streaming ${file.name}`);
      };
      video.onerror = () => {
        showToast('Failed to stream video file');
      };
    }

    // Clear active state on source generator pills
    document.querySelectorAll('.source-pill-btn').forEach(btn => btn.classList.remove('active'));
  }

  function updateAssetUI(srcUrl, type) {
    assetName.textContent = state.mediaName;
    assetMeta.textContent = state.mediaMeta;
    btnRemoveAsset.classList.remove('hidden');

    if (type === 'img') {
      assetThumbPreview.innerHTML = `<img src="${srcUrl}" alt="Preview" />`;
    } else if (type === 'video') {
      assetThumbPreview.innerHTML = `<video src="${srcUrl}" autoplay muted loop></video>`;
    } else {
      assetThumbPreview.innerHTML = `<span id="assetThumbIcon">3D</span>`;
    }
  }

  function resetToGenerative(type = 'torus') {
    cleanupUserMedia();
    state.sourceType = type;
    btnRemoveAsset.classList.add('hidden');

    document.querySelectorAll('.source-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === type);
    });

    if (type === 'torus') {
      state.mediaName = 'Generative Cyber Torus 3D';
      state.mediaMeta = 'Real-time Procedural · 60 FPS';
      assetThumbPreview.innerHTML = `<span id="assetThumbIcon">🌀</span>`;
    } else if (type === 'matrix') {
      state.mediaName = 'Digital Matrix Rain';
      state.mediaMeta = 'Cascading Symbols · 60 FPS';
      assetThumbPreview.innerHTML = `<span id="assetThumbIcon">⚡</span>`;
    } else if (type === 'plasma') {
      state.mediaName = 'Plasma Nebula Waves';
      state.mediaMeta = 'Mathematical Flow · 60 FPS';
      assetThumbPreview.innerHTML = `<span id="assetThumbIcon">🌌</span>`;
    }

    assetName.textContent = state.mediaName;
    assetMeta.textContent = state.mediaMeta;
  }

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(name => {
    mediaDropZone.addEventListener(name, (e) => {
      e.preventDefault();
      mediaDropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    mediaDropZone.addEventListener(name, (e) => {
      e.preventDefault();
      mediaDropZone.classList.remove('drag-over');
    });
  });

  mediaDropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  mediaFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
  });

  btnRemoveAsset.addEventListener('click', () => {
    resetToGenerative('torus');
    showToast('Restored generative 3D Cyber Torus');
  });

  btnSourceTorus.addEventListener('click', () => resetToGenerative('torus'));
  btnSourceMatrix.addEventListener('click', () => resetToGenerative('matrix'));
  btnSourcePlasma.addEventListener('click', () => resetToGenerative('plasma'));

  // Webcam stream
  btnCameraFeed.addEventListener('click', async () => {
    if (state.sourceType === 'webcam') {
      resetToGenerative('torus');
      btnCameraFeed.classList.remove('active');
      showToast('Camera feed disconnected');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      cleanupUserMedia();
      webcamStream = stream;

      const video = document.createElement('video');
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;
      video.onloadeddata = () => {
        video.play().catch(() => {});
        userVideo = video;
        state.sourceType = 'webcam';
        state.mediaName = 'Live Camera Feed';
        state.mediaMeta = 'Webcam Stream · 30 FPS';
        btnCameraFeed.classList.add('active');
        assetName.textContent = state.mediaName;
        assetMeta.textContent = state.mediaMeta;
        assetThumbPreview.innerHTML = `<span id="assetThumbIcon">📹</span>`;
        btnRemoveAsset.classList.remove('hidden');
        showToast('Connected live camera feed');
      };
    } catch {
      showToast('Camera permission denied or camera unavailable');
    }
  });

  // ---------------------------------------------------------------------------
  // 8. Toolbar Controls
  // ---------------------------------------------------------------------------
  btnTogglePlay.addEventListener('click', () => {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
      playIcon.textContent = '⏸';
      playLabel.textContent = 'Pause';
      btnTogglePlay.classList.add('active');
      canvasStatusDot.className = 'status-dot matrix-green';
      canvasStatusText.textContent = 'ASCII Studio Engine v3.2 · Live 60 FPS';
    } else {
      playIcon.textContent = '▶';
      playLabel.textContent = 'Resume';
      btnTogglePlay.classList.remove('active');
      canvasStatusDot.className = 'status-dot';
      canvasStatusText.textContent = 'ASCII Studio Engine v3.2 · Paused';
    }
  });

  btnToolbarScanlines.addEventListener('click', () => {
    state.scanlines = !state.scanlines;
    toggleScanlines.checked = state.scanlines;
    crtOverlay.classList.toggle('enabled', state.scanlines);
    btnToolbarScanlines.classList.toggle('active', state.scanlines);
  });

  btnToolbarRipple.addEventListener('click', () => {
    state.ripple = !state.ripple;
    toggleRipple.checked = state.ripple;
    btnToolbarRipple.classList.toggle('active', state.ripple);
    showToast(`Mouse ripple ${state.ripple ? 'enabled' : 'disabled'}`);
  });

  // ---------------------------------------------------------------------------
  // 9. Parameters, Sliders & Toggles
  // ---------------------------------------------------------------------------
  function syncUIFromState() {
    sliderCellSize.value = state.cellSize;
    valCellSize.textContent = `${state.cellSize}px`;

    sliderContrast.value = state.contrast;
    valContrast.textContent = Number(state.contrast).toFixed(2);

    sliderBrightness.value = state.brightness;
    valBrightness.textContent = state.brightness > 0 ? `+${state.brightness}` : `${state.brightness}`;

    sliderBloom.value = state.bloom;
    valBloom.textContent = `${state.bloom}%`;

    toggleInvert.checked = state.invert;
    toggleScanlines.checked = state.scanlines;
    toggleCurvature.checked = state.curvature;
    toggleRipple.checked = state.ripple;

    crtOverlay.classList.toggle('enabled', state.scanlines);
    crtOverlay.classList.toggle('crt-curved', state.curvature);
    btnToolbarScanlines.classList.toggle('active', state.scanlines);
    btnToolbarRipple.classList.toggle('active', state.ripple);

    // Sync Charset buttons
    charsetBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.charset === state.charsetKey);
    });

    // Sync Color mode buttons
    colorCards.forEach(card => {
      card.classList.toggle('active', card.dataset.color === state.colorMode);
    });

    // Sync Presets cards
    presetCards.forEach(card => {
      card.classList.toggle('active', card.dataset.preset === state.preset);
    });
  }

  sliderCellSize.addEventListener('input', (e) => {
    state.cellSize = parseInt(e.target.value, 10);
    valCellSize.textContent = `${state.cellSize}px`;
    resizeCanvases();
  });

  sliderContrast.addEventListener('input', (e) => {
    state.contrast = parseFloat(e.target.value);
    valContrast.textContent = state.contrast.toFixed(2);
  });

  sliderBrightness.addEventListener('input', (e) => {
    state.brightness = parseInt(e.target.value, 10);
    valBrightness.textContent = state.brightness > 0 ? `+${state.brightness}` : `${state.brightness}`;
  });

  sliderBloom.addEventListener('input', (e) => {
    state.bloom = parseInt(e.target.value, 10);
    valBloom.textContent = `${state.bloom}%`;
  });

  toggleInvert.addEventListener('change', (e) => {
    state.invert = e.target.checked;
  });

  toggleScanlines.addEventListener('change', (e) => {
    state.scanlines = e.target.checked;
    crtOverlay.classList.toggle('enabled', state.scanlines);
    btnToolbarScanlines.classList.toggle('active', state.scanlines);
  });

  toggleCurvature.addEventListener('change', (e) => {
    state.curvature = e.target.checked;
    crtOverlay.classList.toggle('crt-curved', state.curvature);
  });

  toggleRipple.addEventListener('change', (e) => {
    state.ripple = e.target.checked;
    btnToolbarRipple.classList.toggle('active', state.ripple);
  });

  btnResetParams.addEventListener('click', () => {
    applyPreset('cyberMatrix');
    showToast('Parameters reset to default Cyber Matrix');
  });

  // ---------------------------------------------------------------------------
  // 10. Character Sets & Custom Input
  // ---------------------------------------------------------------------------
  charsetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.charsetKey = btn.dataset.charset;
      charsetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`Selected ${btn.querySelector('span:last-child').textContent} charset`);
    });
  });

  btnApplyCustomCharset.addEventListener('click', () => {
    const val = customCharsetInput.value;
    if (val && val.length > 1) {
      state.charsetKey = 'custom';
      state.customCharset = val;
      charsetBtns.forEach(b => b.classList.remove('active'));
      showToast(`Applied custom charset: "${val}"`);
    } else {
      showToast('Enter at least 2 glyphs for custom ramp');
    }
  });

  customCharsetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnApplyCustomCharset.click();
    }
  });

  // ---------------------------------------------------------------------------
  // 11. Color Modes
  // ---------------------------------------------------------------------------
  colorCards.forEach(card => {
    card.addEventListener('click', () => {
      state.colorMode = card.dataset.color;
      colorCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      showToast(`Palette switched to ${card.querySelector('.color-mode-label').textContent}`);
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Presets Gallery
  // ---------------------------------------------------------------------------
  function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    state.preset = presetKey;
    state.charsetKey = p.charset;
    state.cellSize = p.cellSize;
    state.contrast = p.contrast;
    state.brightness = p.brightness;
    state.bloom = p.bloom;
    state.invert = p.invert;
    state.scanlines = p.scanlines;
    state.curvature = p.curvature;
    state.colorMode = p.colorMode;

    if (p.sourceType && state.sourceType !== 'image' && state.sourceType !== 'video') {
      resetToGenerative(p.sourceType);
    }

    syncUIFromState();
    showToast(`Loaded ${p.name} preset`);
  }

  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.preset;
      applyPreset(key);
    });
  });

  // Presets tabs (All vs Favourites)
  tabPresetAll.addEventListener('click', () => {
    tabPresetAll.classList.add('active');
    tabPresetFav.classList.remove('active');
    presetCards.forEach(card => card.style.display = 'flex');
  });

  tabPresetFav.addEventListener('click', () => {
    tabPresetAll.classList.remove('active');
    tabPresetFav.classList.add('active');
    // Show top curated favorites
    presetCards.forEach(card => {
      const isFav = card.dataset.preset === 'cyberMatrix' || card.dataset.preset === 'retroTerminal';
      card.style.display = isFav ? 'flex' : 'none';
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Export & Action Handlers
  // ---------------------------------------------------------------------------
  // Save to Favourites
  const STORAGE_KEY_FAV = 'getlayers_favorites';
  function isStudioFavorited() {
    try {
      const favs = JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || '[]');
      return favs.includes('ascii-studio');
    } catch {
      return false;
    }
  }

  function toggleStudioFavorite() {
    try {
      let favs = JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || '[]');
      const index = favs.indexOf('ascii-studio');
      let isNowFav = false;
      if (index > -1) {
        favs.splice(index, 1);
        isNowFav = false;
      } else {
        favs.push('ascii-studio');
        isNowFav = true;
      }
      localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify(favs));
      updateFavUI(isNowFav);
      showToast(isNowFav ? 'Saved ASCII Studio to favourites ♡' : 'Removed from favourites');
    } catch {
      showToast('Favourites storage unavailable');
    }
  }

  function updateFavUI(isFav) {
    if (isFav) {
      favHeart.textContent = '♥ Favourited';
      btnSaveFavorite.classList.add('is-fav');
    } else {
      favHeart.textContent = '♡ Save favourite';
      btnSaveFavorite.classList.remove('is-fav');
    }
  }

  btnSaveFavorite.addEventListener('click', toggleStudioFavorite);
  updateFavUI(isStudioFavorited());

  // Copy Link with Query State
  btnCopyLink.addEventListener('click', () => {
    const params = new URLSearchParams({
      preset: state.preset,
      charset: state.charsetKey,
      cellSize: state.cellSize,
      contrast: state.contrast,
      brightness: state.brightness,
      bloom: state.bloom,
      color: state.colorMode
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Copied share link to clipboard!');
    }).catch(() => {
      showToast('Failed to copy link');
    });
  });

  // Copy ASCII Shader Prompt
  btnCopyPrompt.addEventListener('click', () => {
    const prompt = `/* GetLayers ASCII Studio Shader Engine */
// Typography & Optical Simulation Configuration
const asciiConfig = {
  charset: "${getActiveCharset()}",
  cellSize: ${state.cellSize},
  contrast: ${state.contrast.toFixed(2)},
  brightness: ${state.brightness},
  phosphorBloom: ${state.bloom}%,
  colorPalette: "${state.colorMode}",
  scanlines: ${state.scanlines},
  curvature: ${state.curvature},
  rippleDistortion: ${state.ripple}
};

// WebGL GLSL Luminance Fragment Conversion:
// float lum = dot(texture2D(u_media, v_uv).rgb, vec3(0.299, 0.587, 0.114));
// lum = clamp((lum - 0.5) * ${state.contrast.toFixed(2)} + 0.5 + ${state.brightness}/100.0, 0.0, 1.0);
`;
    navigator.clipboard.writeText(prompt).then(() => {
      showToast('Copied ASCII shader prompt to clipboard!');
    }).catch(() => {
      showToast('Failed to copy prompt');
    });
  });

  // Export Snapshot PNG
  btnExportSnapshot.addEventListener('click', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mainCanvas.width;
    tempCanvas.height = mainCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw main canvas
    tempCtx.drawImage(mainCanvas, 0, 0);

    // If scanlines active, bake subtle scanlines into snapshot
    if (state.scanlines) {
      tempCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < tempCanvas.height; y += 2) {
        tempCtx.fillRect(0, y, tempCanvas.width, 1);
      }
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `getlayers-ascii-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    showToast('Exported snapshot PNG image!');
  });

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    studioToast.textContent = msg;
    studioToast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      studioToast.classList.add('hidden');
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // 14. URL Parameters Initialization
  // ---------------------------------------------------------------------------
  function parseUrlParams() {
    const search = new URLSearchParams(window.location.search);
    if (search.has('preset') && PRESETS[search.get('preset')]) {
      applyPreset(search.get('preset'));
    }
    if (search.has('charset') && CHARSETS[search.get('charset')]) {
      state.charsetKey = search.get('charset');
    }
    if (search.has('cellSize')) {
      const cs = parseInt(search.get('cellSize'), 10);
      if (cs >= 4 && cs <= 28) state.cellSize = cs;
    }
    if (search.has('contrast')) {
      const co = parseFloat(search.get('contrast'));
      if (co >= 0.5 && co <= 2.5) state.contrast = co;
    }
    if (search.has('bloom')) {
      const bl = parseInt(search.get('bloom'), 10);
      if (bl >= 0 && bl <= 100) state.bloom = bl;
    }
    if (search.has('color')) {
      const col = search.get('color');
      const valid = ['matrixGreen', 'retroAmber', 'rgbSampling', 'paperWhite', 'cyberCyan'];
      if (valid.includes(col)) state.colorMode = col;
    }
  }

  // Window resize observer
  window.addEventListener('resize', () => {
    resizeCanvases();
  });

  // ---------------------------------------------------------------------------
  // 15. Start Studio Engine
  // ---------------------------------------------------------------------------
  parseUrlParams();
  syncUIFromState();
  resizeCanvases();
  animationFrameId = requestAnimationFrame(renderFrame);
});
