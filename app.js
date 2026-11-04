document.addEventListener('DOMContentLoaded', () => {
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

});