document.addEventListener('DOMContentLoaded', () => {
  const data = window.GETLAYERS_DATA || [];
  const cardsGrid = document.getElementById('cardsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryTabs = document.getElementById('categoryTabs');
  const noResults = document.getElementById('noResults');

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

  // Initialize Category Counts
  const counts = {
    all: data.length,
    templates: data.filter(d => d.categoryType === 'templates').length,
    '3d_scenes': data.filter(d => d.categoryType === '3d_scenes').length,
    sections: data.filter(d => d.categoryType === 'sections').length,
    backgrounds: data.filter(d => d.categoryType === 'backgrounds').length,
    gradients: data.filter(d => d.categoryType === 'gradients').length
  };

  for (const [key, val] of Object.entries(counts)) {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = val;
  }

  // Render Cards
  function render() {
    const filtered = data.filter(item => {
      const matchCat = currentCategory === 'all' || item.categoryType === currentCategory;
      const q = currentSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tag && item.tag.toLowerCase().includes(q)) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    cardsGrid.innerHTML = '';

    if (filtered.length === 0) {
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
      filtered.forEach((item, index) => {
        const card = createCard(item, index);
        cardsGrid.appendChild(card);
      });
    }
  }

  function createCard(item, index) {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const likes = item.likes !== undefined ? item.likes : (20 + (index * 7) % 80);
    const mediaUrl = item.previewVideo || item.previewImage;
    const hasVideo = !!item.previewVideo;

    card.innerHTML = `
      <div class="card-media-wrap">
        <span class="card-badge-top">${escapeHtml(item.categoryLabel)}</span>
        <span class="card-likes-top">♡ ${likes}</span>
        <img class="card-img" src="${escapeHtml(item.previewImage)}" alt="${escapeHtml(item.title)}" loading="lazy" />
        ${hasVideo ? `<video class="card-video" src="${escapeHtml(item.previewVideo)}" loop muted playsinline preload="none"></video>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <span class="card-tag">${escapeHtml(item.tag || 'PRO')}</span>
        </div>
        <p class="card-desc">${escapeHtml(item.description || 'Modern cinematic web experience crafted for high-conversion landing pages.')}</p>
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
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
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
    modalCategory.textContent = item.categoryLabel + ' · ' + (item.tag || 'AI Ready');
    modalTitle.textContent = item.title;
    modalLikes.textContent = `♡ ${likes}`;
    modalDesc.textContent = item.description || `A cinematic, ultra-polished ${item.categoryLabel.toLowerCase()} engineered with smooth physics, dark-mode elegance, and high visual impact.`;

    // Inject Media
    modalMedia.innerHTML = '';
    if (item.previewVideo) {
      const video = document.createElement('video');
      video.src = item.previewVideo;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.controls = true;
      video.playsInline = true;
      modalMedia.appendChild(video);
      modalAssetLink.href = item.previewVideo;
    } else {
      const img = document.createElement('img');
      img.src = item.previewImage;
      img.alt = item.title;
      modalMedia.appendChild(img);
      modalAssetLink.href = item.previewImage;
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
    return `Create a high-end cinematic web component inspired by "${item.title}".
Style: Ultra-modern Dark Theme, minimal pure black canvas (#070709), crisp borders (rgba(255,255,255,0.08)), subtle ambient glows.
Component Role: ${item.categoryLabel} (${item.tag || 'General'})
Core Concept: ${item.description || item.title}
Key Requirements:
- Use React with Tailwind CSS and smooth spring-based physics.
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
      // Fallback
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
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    render();
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
