(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));

  searchForms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var list = document.querySelector('[data-search-list]');

    if (!input || !list) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

      cards.forEach(function (card) {
        var value = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', query && value.indexOf(query) === -1);
      });
    });
  });

  function setupVideo(video) {
    var source = video.getAttribute('data-video');
    var wrap = video.closest('.player-wrap');
    var button = wrap ? wrap.querySelector('.player-button') : null;
    var initialized = false;

    function init() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    function playVideo() {
      init();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (wrap) {
            wrap.classList.remove('is-playing');
          }
        });
      }
    }

    init();

    if (button) {
      button.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (wrap) {
        wrap.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (wrap) {
        wrap.classList.remove('is-playing');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.site-video')).forEach(setupVideo);
})();
