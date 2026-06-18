(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    var prevButton = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');
    var heroFrame = document.querySelector('[data-hero-frame]');

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(currentSlide - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentSlide + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (heroFrame) {
      heroFrame.addEventListener('mouseenter', stopHero);
      heroFrame.addEventListener('mouseleave', startHero);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var scopeName = panel.getAttribute('data-filter-panel');
    var searchInput = panel.querySelector('[data-search]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var regionFilter = panel.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card][data-scope="' + scopeName + '"]'));
    var empty = document.querySelector('[data-empty="' + scopeName + '"]');

    function applyFilter() {
      var query = normalize(searchInput && searchInput.value);
      var typeValue = normalize(typeFilter && typeFilter.value);
      var yearValue = normalize(yearFilter && yearFilter.value);
      var regionValue = normalize(regionFilter && regionFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, typeFilter, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  playerBlocks.forEach(function (block) {
    var video = block.querySelector('video');
    var cover = block.querySelector('[data-player-cover]');
    var message = block.querySelector('[data-player-message]');
    var stream = block.getAttribute('data-stream');
    var started = false;

    function setMessage(value) {
      if (message) {
        message.textContent = value;
      }
    }

    function begin() {
      if (!video || !stream) {
        setMessage('播放暂时不可用');
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (started) {
        video.play().catch(function () {
          setMessage('点击视频区域继续播放');
        });
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setMessage('点击视频区域继续播放');
          });
        }, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('点击视频区域继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage('播放暂时不可用');
          }
        });
        return;
      }

      setMessage('播放暂时不可用');
    }

    if (cover) {
      cover.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        video.play().catch(function () {
          setMessage('点击视频区域继续播放');
        });
      }
    });
  });
})();
