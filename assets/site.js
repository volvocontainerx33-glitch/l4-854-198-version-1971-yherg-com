(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSliders() {
    document.querySelectorAll('[data-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
      var prev = slider.querySelector('[data-slide-prev]');
      var next = slider.querySelector('[data-slide-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
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
          show(Number(dot.getAttribute('data-slide-dot')) || 0);
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
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var typeSelect = panel.querySelector('[data-type-filter]');
      var container = panel.parentElement.querySelector('[data-card-list]');
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.children);

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var q = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchedText = !q || haystack.indexOf(q) !== -1;
          var matchedType = !type || cardType.indexOf(type) !== -1;
          card.classList.toggle('is-hidden', !(matchedText && matchedType));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll('.movie-player[data-stream]').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('.play-layer');
      var stream = wrap.getAttribute('data-stream');
      var hls = null;
      var loaded = false;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        wrap.classList.add('is-playing');
        var started = video.play();
        if (started && typeof started.catch === 'function') {
          started.catch(function () {
            wrap.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          wrap.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initSliders();
    initFilters();
    initPlayers();
  });
})();
