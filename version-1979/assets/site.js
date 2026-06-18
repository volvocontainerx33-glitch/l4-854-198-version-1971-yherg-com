(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-search-empty]');

  if (filterInput && filterCards.length) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var visible = 0;

      filterCards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  var hlsLoader;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function prepareVideo(video, source) {
    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = '1';
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var instance = new Hls({ enableWorker: true });
        instance.loadSource(source);
        instance.attachMedia(video);
        video.hlsInstance = instance;
        video.dataset.ready = '1';
      } else {
        video.src = source;
        video.dataset.ready = '1';
      }
    });
  }

  function playVideo(shell) {
    var video = shell.querySelector('video');
    var source = video ? video.dataset.videoSrc : '';
    var message = shell.querySelector('[data-player-message]');

    if (!video || !source) {
      return;
    }

    prepareVideo(video, source)
      .then(function () {
        return video.play();
      })
      .then(function () {
        shell.classList.add('is-playing');
        if (message) {
          message.textContent = '';
        }
      })
      .catch(function () {
        if (message) {
          message.textContent = '暂时无法播放，请稍后再试。';
        }
      });
  }

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        playVideo(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(shell);
        } else {
          video.pause();
          shell.classList.remove('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  });
})();
