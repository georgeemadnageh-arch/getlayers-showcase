document.addEventListener('DOMContentLoaded', () => {
  const data = window.GETLAYERS_DATA || [];
  const cardsGrid = document.getElementById('cardsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryTabs = document.getElementById('categoryTabs');
  const noResults = document.getElementById('noResults');
  const loadingMore = document.getElementById('loadingMore');
  const headerTotalCount = document.getElementById('headerTotalCount');

  // Modal elements
  const detailModal = document.getElementById('detailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalMedia = document.getElementById('modalMedia');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalLikes = document.getElementById('modalLikes');
  const modalDesc = document.getElementById('modalDesc');
  const modalPromptText = document.getElementById('modalPromptText');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const modalAssetLink = document.getElementById('modalAssetLink');
  const toast = document.getElementById('toast');

  let currentCategory = 'all';
  let currentSearch = '';

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
    tools: toolsData.length
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
      
      card.innerHTML = `
        <div class="card-media-wrap tool-media-wrap">
          <span class="card-badge-top">${escapeHtml(item.category)}</span>
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
              <span>${item.id === 'holographic-cloth' ? 'Launch 3D Studio ↗' : 'Inspect Tool Specs'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (item.id === 'holographic-cloth') {
          window.location.href = 'tools/holographic-cloth/index.html';
        } else {
          openModal(item, 195);
        }
      });
      return card;
    }

    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const likes = item.likes !== undefined ? item.likes : (20 + (index * 7) % 80);
    const previewImg = item.previewImage || item.image || '';
    const previewVid = item.posterVideo || item.previewVideo || item.posterVideoPreview || '';
    const isStatic = item.mediaType === 'static' || (!item.posterVideo && !item.previewVideo);
    const hasVideo = !isStatic && !!previewVid;
    const catLabel = item.categoryLabel || item.category || 'Component';
    const tagDisplay = item.tag || (Array.isArray(item.tags) && item.tags[0] ? item.tags[0].toUpperCase() : 'PRO');

    let mediaHtml = `
      <div class="card-media-wrap">
        <span class="card-badge-top">${escapeHtml(catLabel)}</span>
        <span class="card-likes-top">♡ ${likes}</span>
        <div class="media-spinner"></div>`;
    if (previewImg) {
      mediaHtml += `<img class="card-img" src="${escapeHtml(previewImg)}" alt="${escapeHtml(item.title)}" loading="lazy" />`;
    }
    if (hasVideo) {
      mediaHtml += `<video class="card-video" src="${escapeHtml(previewVid)}" loop muted playsinline preload="none"></video>`;
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

    // Zero-Flicker Smooth Video Behavior (GetLayers native feel)
    if (hasVideo) {
      const wrap = card.querySelector('.card-media-wrap');
      const video = card.querySelector('.card-video');
      let isHovered = false;

      video.addEventListener('playing', () => {
        if (isHovered) {
          wrap.classList.remove('is-buffering');
          wrap.classList.add('is-playing');
        }
      });

      video.addEventListener('waiting', () => {
        if (isHovered && !wrap.classList.contains('is-playing')) {
          wrap.classList.add('is-buffering');
        }
      });

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        if (video) {
          if (!wrap.classList.contains('is-playing')) {
            wrap.classList.add('is-buffering');
          }
          const p = video.play();
          if (p !== undefined) {
            p.catch(() => {
              wrap.classList.remove('is-buffering');
            });
          }
        }
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        wrap.classList.remove('is-buffering');
        wrap.classList.remove('is-playing');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });
    }

    // Click to Open Modal
    card.addEventListener('click', () => openModal(item, likes));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(item, likes);
      }
    });

    return card;
  }

  // Open Modal
  function openModal(item, likes) {
    const catLabel = item.categoryLabel || item.category || 'Component';
    const tagDisplay = item.tag || 'AI Ready';
    modalCategory.textContent = `${catLabel} · ${tagDisplay}`;
    modalTitle.textContent = item.title;
    modalLikes.textContent = `♡ ${likes}`;
    modalDesc.textContent = item.description || `A cinematic, ultra-polished ${catLabel.toLowerCase()} engineered with smooth physics, dark-mode elegance, and high visual impact.`;

    // Inject Media
    modalMedia.innerHTML = '';
    const isStaticItem = item.mediaType === 'static' || (!item.posterVideo && !item.previewVideo);
    const videoUrl = !isStaticItem ? (item.posterVideo || item.previewVideo || '') : '';
    const imageUrl = item.image || item.previewImage || '';

    const studioLaunchBtn = document.getElementById('modalStudioLaunchLink');
    if (item.id === 'holographic-cloth') {
      if (studioLaunchBtn) studioLaunchBtn.classList.remove('hidden');
    } else {
      if (studioLaunchBtn) studioLaunchBtn.classList.add('hidden');
    }

    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.controls = true;
      video.playsInline = true;
      modalMedia.appendChild(video);
      modalAssetLink.href = videoUrl;
    } else {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = item.title;
      modalMedia.appendChild(img);
      modalAssetLink.href = imageUrl;
    }

    // Generate Formatted AI Prompt
    const prompt = generatePrompt(item);
    modalPromptText.textContent = prompt;

    detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    detailModal.classList.add('hidden');
    modalMedia.innerHTML = '';
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });

  // Prompt Generator - Authentic Deep Architectural Specification
  function generatePrompt(item) {
    const title = item.title || 'Cinematic Component';
    const catType = item.categoryType || item.category || 'templates';
    const catLabel = item.categoryLabel || item.category || 'Component';
    const tag = item.tag || (Array.isArray(item.tags) && item.tags[0] ? item.tags[0].toUpperCase() : 'PRO');
    const desc = item.description || `High-end cinematic ${catLabel.toLowerCase()} engineered with physical shaders and micro-interactions.`;
    
    // Extract keywords and clean up into choreography narrative
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    const keywordsStr = keywords.join(', ');
    
    // Mood & Tone
    const moodStr = Array.isArray(item.mood) ? item.mood.join(', ') : (item.mood || 'cinematic, minimal, luxury');
    const toneStr = item.tone || 'dark';

    // Performance & Lighthouse Metrics from Real Audit
    const opt = item.optimizationReport || {};
    const desktopPerf = opt.performance && opt.performance.desktop ? opt.performance.desktop : null;
    const desktopSeo = opt.seo && opt.seo.desktop && opt.seo.desktop.scores ? opt.seo.desktop.scores : null;

    let perfSection = '';
    if (desktopPerf || desktopSeo) {
      perfSection = `
## 5. PRODUCTION BENCHMARKS & QUALITY BUDGET
- Frame Budget: 60fps locked (16.6ms frame budget, zero CPU jank)
${desktopPerf ? `- Viewport Measured: ${desktopPerf.viewport.width}x${desktopPerf.viewport.height} | Input: ${desktopPerf.input} | Verdict: ${desktopPerf.verdict.toUpperCase()}` : ''}
${desktopPerf ? `- Frame Metrics: p50: ${desktopPerf.p50}ms | p95: ${desktopPerf.p95}ms | Dropped Frames: ${desktopPerf.droppedPct}% (${desktopPerf.frames} frames measured)` : ''}
${desktopSeo ? `- Target Lighthouse Audit: Performance: ${desktopSeo.performance}/100 | Accessibility: ${desktopSeo.accessibility}/100 | Best Practices: ${desktopSeo.bestPractices}/100 | SEO: ${desktopSeo.seo}/100` : '- Target Lighthouse Audit: Performance: 100 | Accessibility: 100 | Best Practices: 100 | SEO: 100'}`;
    } else {
      perfSection = `
## 5. PRODUCTION BENCHMARKS & QUALITY BUDGET
- Frame Budget: 60fps locked (16.6ms frame budget, zero CPU jank, instanced WebGL rendering)
- Target Lighthouse Audit: Performance: 100/100 | Accessibility: 100/100 | Best Practices: 100/100 | SEO: 100/100
- Scalability: Responsive CSS fluid clamp scaling from mobile (390px) to ultra-wide (2560px)`;
    }

    // Direct Assets
    const videoUrl = item.posterVideo || item.previewVideo || '';
    const imgUrl = item.image || item.previewImage || '';

    // Category 1: Interactive Tools
    if (catType === 'tools' || item.route) {
      const techList = Array.isArray(item.tech) ? item.tech.join(', ') : 'Three.js, WebGL, GLSL, Verlet Physics';
      return `# AI SOFTWARE ARCHITECTURE SPECIFICATION: ${title.toUpperCase()} (3D Web Studio)

## 1. STUDIO ENGINE & 3D CANVAS
- Application Role: Interactive WebGL Design Software & Shader Sandbox
- Technology Stack: Next.js 16, React 19, Three.js r128+, WebGL 2.0, GLSL, Tailwind CSS
- Core Capability: ${desc}
- Stack Technologies: ${techList}

## 2. STUDIO WORKSPACE & DUAL CONTROL PANELS
- Left Panel (Asset Pipeline):
  - Drag & Drop zone supporting PNG, JPG, WebP, SVG file uploads.
  - Live texture remapping onto 3D geometry in real-time.
  - Preset library manager with instant parameter serialization.
- Center Viewport:
  - Full-resolution interactive WebGL viewport with orbit physics (damping ~0.05).
  - Physics-reactive surface with spring wave simulation.
- Right Panel (Live Shader Sliders):
  - Base Color picker (Hex format), Rainbow iridescence intensity, Pattern scale, Hue shift, Glitter noise sparkle.
  - Reset camera position action, Save to favorites, and Prompt generation.

## 3. ASSET & CODE REPRODUCTION DIRECTIVES
- Direct Studio Route: tools/${item.id}/index.html
- Ensure all shaders use floating-point precision, avoid uniform branching in fragment shaders, and maintain 60fps lock.`;
    }

    // Category 2: Procedural WebGL Gradients
    if (catType === 'gradients') {
      return `# AI SHADER SPECIFICATION: ${title.toUpperCase()} (Procedural WebGL Gradient)

## 1. COMPONENT ROLE & RENDERING PIPELINE
- Role: Full-bleed Procedural Ambient Shader Layer (Background / Hero Canvas)
- Stack: WebGL 2.0 Fragment Shader, React Three Fiber (ShaderPass / FullscreenQuad) or Vanilla Canvas
- Atmosphere & Tone: Tone: ${toneStr} | Mood: ${moodStr}

## 2. PROCEDURAL ALGORITHM & GLSL EQUATIONS
- Visual Concept: ${desc}
- Shader Keywords & Harmonic Resonance:
  ${keywordsStr || 'fluid, procedural, ambient, chromatic, organic, webgl, glsl'}
- Uniform Inputs Required:
  \`uniform float uTime;\` // Single shared clock for infinite seamless drift
  \`uniform vec2 uResolution;\` // Viewport dimensions for non-stretched aspect ratio
  \`uniform vec2 uMouse;\` // Normalized cursor coordinates for subtle magnetic distortion

## 3. COLOR PALETTE & DYNAMICS
- Shading Math: Multi-octave Perlin / Simplex 2D noise or Fractal Brownian Motion (FBM).
- Color Blending: Cosine-based smooth spectral palette interpolation, preventing mudding in darker regions.
- Frame Rate Target: Locked 60fps with low GPU wattage and battery preservation.

## 4. GROUND TRUTH ASSET REFERENCES
- Master Video Loop: ${videoUrl || 'Procedural WebGL Shader'}
- Poster Frame: ${imgUrl}
- Reference ID: ${item.id} on getlayers.ai/layer/${item.id}`;
    }

    // Category 3: 3D Scenes
    if (catType === '3d_scenes') {
      return `# AI 3D WEBGL SPECIFICATION: ${title.toUpperCase()} (Interactive Three.js Scene)

## 1. 3D SCENE ARCHITECTURE & ENVIRONMENT
- Component Role: Interactive 3D Model / WebGL Hero Asset
- Stack: React Three Fiber (@react-three/fiber, @react-three/drei) or Vanilla Three.js r128+
- Canvas Setup: Pure black canvas (#050608), ACESFilmicToneMapping, exposure ~1.15
- Controls: Smooth OrbitControls with inertia damping (dampingFactor: 0.05), restricted elevation to prevent scene inversion

## 2. 3D GEOMETRY, LIGHTING & SHADER CHOREOGRAPHY
- Scene Description: ${desc}
- Geometry & Scene Detail Keywords:
  ${keywordsStr || '3d, webgl, model, physical-material, specular-highlights, cinematic'}
- Material Specifications: MeshPhysicalMaterial with transmission: ~0.9, roughness: ~0.15, metalness: ~0.1, and subtle chromatic Fresnel rim.
- Lighting Scheme: 3-point studio setup (Key directional light with soft shadows, cool ambient fill, and sharp rim highlight).

## 3. INTERACTIVE PHYSICS & MOTION
- Cursor Tracking: Spring inertia parallax following mouse pointer across the screen.
- Scroll Scrubbing: Rotational delta bound to user scroll progress via requestAnimationFrame loop.
- Micro-interactions: Click-to-react physics bounce or burst assembly.
${perfSection}

## 6. GROUND TRUTH ASSET REFERENCES
- Master 4K Video Loop: ${videoUrl}
- Poster Frame: ${imgUrl}
- Reference ID: ${item.id} on getlayers.ai/layer/${item.id}`;
    }

    // Category 4: Backgrounds
    if (catType === 'backgrounds') {
      const isStatic = item.mediaType === 'static' || !videoUrl;
      return `# AI COMPONENT SPECIFICATION: ${title.toUpperCase()} (Cinematic Background Layer)

## 1. MEDIA LAYER INTEGRATION
- Media Type: ${isStatic ? 'High-Resolution 4K Static Poster Layer' : 'Seamless 4K Infinite Video Loop'}
- HTML5 Container: Full-bleed relative/fixed aspect-ratio wrapper (\`aspect-[960/684]\` or \`aspect-video\`) with \`overflow: hidden; pointer-events: none;\`
${!isStatic ? `- Video Element Setup: \`<video autoPlay loop muted playsInline preload="auto" class="w-full h-full object-cover">\`` : '- Image Element Setup: `<img src="..." alt="${title}" loading="eager" class="w-full h-full object-cover">`'}

## 2. EDITORIAL OVERLAY & ATMOSPHERIC TREATMENT
- Concept: ${desc}
- Mood & Aesthetic: Tone: ${toneStr} | Mood: ${moodStr}
- Keywords & Visual Texture: ${keywordsStr || 'cinematic, dark, high-res, backdrop'}
- Contrast Protection: Dual vignette overlay with \`radial-gradient(ellipse at center, transparent 35%, rgba(5,6,8,0.75) 100%)\` to guarantee white typography readability.
${perfSection}

## 6. DIRECT ASSET ENDPOINTS
- Media Source: ${videoUrl || imgUrl}
- High-Res Poster Fallback: ${imgUrl}
- Reference ID: ${item.id} on getlayers.ai/layer/${item.id}`;
    }

    // Category 5: Templates (Landing pages, Hero sections, e-commerce)
    return `# AI ENGINEERING SPECIFICATION: ${title.toUpperCase()} (Production Next.js 16 Web Application)

## 1. COMPONENT ROLE & ARCHITECTURAL FOUNDATION
- Component Role: ${catLabel} (${tag})
- Target Framework: Next.js 16 (App Router, React 19 Server Components)
- Core Libraries: Three.js / React Three Fiber (@react-three/fiber, @react-three/drei), GSAP (ScrollTrigger), Tailwind CSS, Lucide Icons
- Mood & Aesthetic: Tone: ${toneStr} | Mood: ${moodStr}
- Responsive Scope: Mobile-first responsive fluid scaling with CSS \`clamp()\` rem values.

## 2. SCENE VISUAL CONCEPT & ART DIRECTION
- Editorial Concept: ${desc}
- Detailed Geometric Choreography & Visual Scene Assets:
  ${keywordsStr || 'hero, cinematic, nextjs, threejs, webgl, dark, landing-page'}

## 3. 3D MESH, SHADERS & LIGHTING SPECIFICATIONS
- Shading Pipeline: MeshPhysicalMaterial with custom roughness map, transmission, and spectral Fresnel rim lighting.
- Lighting Scheme: Balanced 3-point studio lighting (Neutral Key, cool ambient fill, and high-contrast rim light).
- WebGL Optimization: Target 60fps locked, instanced mesh rendering for repeating particles/drifters, frustum culling enabled, zero CPU bottlenecks.

## 4. INTERACTION CHOREOGRAPHY & SPRING PHYSICS
- Cursor Tracking: Spring-interpolated inertia lag (damping ~0.08) reacting to mouse position across canvas.
- Animation Scrubbing: Single shared clock driving synchronized multi-phase scroll triggers via GSAP ScrollTrigger.
- Interactive Feedback: Dynamic state changes on hover and click (zero layout shifts, micro-haptic visual feedback).
${perfSection}

## 6. PRODUCTION ENGINEERING REQUIREMENTS
- TypeScript: 100% strict type safety, zero \`any\` types, well-defined prop interfaces.
- Accessibility: Semantic HTML5 tags (<header>, <main>, <section>, <article>), ARIA live regions for dynamic states.
- Error Boundaries: Graceful WebGL context loss recovery with automatic canvas recreation.

## 7. GROUND TRUTH ASSET REFERENCES
- Master 4K Video Loop: ${videoUrl}
- Poster Frame Still: ${imgUrl}
- Reference ID: ${item.id} on getlayers.ai/layer/${item.id}`;
  }

  // Copy Prompt to Clipboard
  btnCopyPrompt.addEventListener('click', () => {
    const text = modalPromptText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied prompt to clipboard!');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied prompt to clipboard!');
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

});