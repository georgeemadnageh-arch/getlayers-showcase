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
    const previewVid = item.previewVideo || item.posterVideoPreview || item.posterVideo || '';
    const hasVideo = !!previewVid;
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
    const videoUrl = item.posterVideo || item.previewVideo || '';
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

  // Prompt Generator
  function generatePrompt(item) {
    const catLabel = item.categoryLabel || item.category || 'Component';
    const stackStr = Array.isArray(item.stack) ? item.stack.join(', ') : 'Next.js, Three.js, Tailwind CSS';
    const tagsStr = Array.isArray(item.tags) ? item.tags.join(', ') : 'interactive, webgl, dark';

    return `Create a high-end cinematic web component inspired by "${item.title}".
Style: Ultra-modern Dark Theme, minimal pure black canvas (#070709), crisp borders (rgba(255,255,255,0.08)), subtle ambient glows.
Component Role: ${catLabel} (${item.tag || 'General'})
Tech Stack: ${stackStr}
Tags: ${tagsStr}
Core Concept: ${item.description || item.title}
Key Requirements:
- Use React / Next.js with Tailwind CSS and smooth spring-based physics.
- Responsive across desktop, tablet, and mobile with fluid rem scaling.
- Semantic HTML tags, zero TypeScript 'any' types, accessible colors and contrast.
- Visual elements should convey depth, elegance, and premium editorial polish.`;
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
});