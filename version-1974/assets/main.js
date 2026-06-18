(function () {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const backToTop = document.querySelector('[data-back-to-top]');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const searchInput = panel.querySelector('[data-card-search]');
    const categorySelect = panel.querySelector('[data-card-category]');
    const sortSelect = panel.querySelector('[data-card-sort]');
    const resetButton = panel.querySelector('[data-card-reset]');
    const countOutput = panel.querySelector('[data-filter-count]');
    const container = panel.nextElementSibling;

    if (!container) {
      return;
    }

    const cards = Array.from(container.querySelectorAll('.movie-card'));
    const emptyState = container.parentElement.querySelector('[data-empty-state]');

    function getText(card) {
      return [
        card.dataset.title || '',
        card.dataset.category || '',
        card.dataset.genre || '',
        card.dataset.year || '',
        card.dataset.region || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      const query = (searchInput && searchInput.value || '').trim().toLowerCase();
      const category = categorySelect && categorySelect.value || '';
      let visible = 0;

      cards.forEach(function (card) {
        const matchesQuery = !query || getText(card).includes(query);
        const matchesCategory = !category || card.dataset.category === category;
        const shouldShow = matchesQuery && matchesCategory;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (countOutput) {
        countOutput.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      if (!sortSelect || !container) {
        return;
      }

      const mode = sortSelect.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (mode === 'views') {
          return getNumber(b, 'views') - getNumber(a, 'views');
        }
        if (mode === 'year') {
          return getNumber(b, 'year') - getNumber(a, 'year');
        }
        if (mode === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return getNumber(a, 'order') - getNumber(b, 'order');
      });

      sorted.forEach(function (card) {
        container.appendChild(card);
      });
    }

    function getNumber(card, key) {
      const value = card.dataset[key] || '0';
      const parsed = Number(String(value).replace(/[^0-9.]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    cards.forEach(function (card, index) {
      card.dataset.order = String(index);
      const metaText = card.textContent || '';
      const viewsMatch = metaText.match(/👁\s*([0-9.]+)万?/);
      if (viewsMatch && !card.dataset.views) {
        const raw = Number(viewsMatch[1]);
        card.dataset.views = metaText.includes('万') ? String(raw * 10000) : String(raw);
      }
    });

    [searchInput, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilters();
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (sortSelect) {
          sortSelect.value = 'default';
        }
        applySort();
        applyFilters();
      });
    }

    applyFilters();
  });

  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('q');
  const pageSearchInput = document.querySelector('[data-page-search]');

  if (query && pageSearchInput) {
    pageSearchInput.value = query;
    pageSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
})();
