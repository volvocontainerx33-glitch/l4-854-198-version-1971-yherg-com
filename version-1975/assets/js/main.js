(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('.menu-button');
  var navMenu = qs('.nav-menu');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  qsa('[data-hero-carousel]').forEach(function (carousel) {
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('.hero-dot', carousel);
    var prev = qs('.hero-prev', carousel);
    var next = qs('.hero-next', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('.page-filter').forEach(function (input) {
    var scope = qs('.filter-scope');

    if (!scope) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();

      qsa('.movie-card', scope).forEach(function (card) {
        var haystack = card.textContent.toLowerCase();
        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  });

  var searchScope = qs('.search-scope');
  var searchInput = qs('.search-input');
  var yearSelect = qs('.year-select');
  var typeSelect = qs('.type-select');
  var resetButton = qs('.reset-filter');

  function applySearchFilters() {
    if (!searchScope) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';

    qsa('.movie-card', searchScope).forEach(function (card) {
      var text = card.textContent.toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchType = !type || card.getAttribute('data-type') === type;
      card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
    });
  }

  if (searchScope) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearchFilters);
        control.addEventListener('change', applySearchFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applySearchFilters();
      });
    }

    applySearchFilters();
  }

  qsa('[data-player]').forEach(function (player) {
    var video = qs('video', player);
    var overlay = qs('.video-overlay', player);

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');
    var attached = false;

    function attachSource() {
      if (attached || !source) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();

      if (overlay) {
        overlay.classList.add('hidden');
      }

      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      attachSource();
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
  });
})();
