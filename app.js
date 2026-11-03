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
  const counts = {
    all: data.length,
    templates: data.filter(d => d.categoryType === 'templates').length,
    '3d_scenes': data.filter(d => d.categoryType === '3d_scenes').length,
    backgrounds: data.filter(d => d.categoryType === 'backgrounds').length,
    gradients: data.filter(d => d.categoryType === 'gradients').length,
    sections: data.filter(d => d.categoryType === 'sections').length,
    tools: data.filter(d => d.categoryType === 'tools').length
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
        <span class="card-likes-top">♡ ${likes}</span>`;
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

    // Hover Video Behavior
    if (hasVideo) {
      const video = card.querySelector('.card-video');
      let playPromise = null;
      card.addEventListener('mouseenter', () => {
        if (video) {
          playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }
      });
      card.addEventListener('mouseleave', () => {
        if (video) {
          if (playPromise !== undefined) {
            playPromise.then(() => {
              video.pause();
              video.currentTime = 0;
            }).catch(() => {
              video.pause();
            });
          } else {
            video.pause();
          }
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

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (!detailModal.classList.contains('hidden')) {
        closeModal();
      }
    }
  });

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