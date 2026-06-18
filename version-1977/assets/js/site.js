(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
      var current = slides[index];
      var title = current.getAttribute("data-title") || "";
      var desc = current.getAttribute("data-desc") || "";
      var href = current.getAttribute("data-href") || "./index.html";
      var year = current.getAttribute("data-year") || "";
      var region = current.getAttribute("data-region") || "";
      var type = current.getAttribute("data-type") || "";
      var panelImage = hero.querySelector("[data-hero-panel-image]");
      var panelTitle = hero.querySelector("[data-hero-panel-title]");
      var panelDesc = hero.querySelector("[data-hero-panel-desc]");
      var panelLink = hero.querySelector("[data-hero-panel-link]");
      var heroTitle = hero.querySelector("[data-hero-title]");
      var heroDesc = hero.querySelector("[data-hero-desc]");
      var heroLink = hero.querySelector("[data-hero-link]");
      var heroMeta = hero.querySelector("[data-hero-meta]");
      if (panelImage) {
        panelImage.src = current.querySelector("img").getAttribute("src");
        panelImage.alt = title;
      }
      if (panelTitle) {
        panelTitle.textContent = title;
      }
      if (panelDesc) {
        panelDesc.textContent = desc;
      }
      if (panelLink) {
        panelLink.href = href;
      }
      if (heroTitle) {
        heroTitle.textContent = title;
      }
      if (heroDesc) {
        heroDesc.textContent = desc;
      }
      if (heroLink) {
        heroLink.href = href;
      }
      if (heroMeta) {
        heroMeta.innerHTML = "";
        [year, region, type].forEach(function (value) {
          if (value) {
            var span = document.createElement("span");
            span.textContent = value;
            heroMeta.appendChild(span);
          }
        });
      }
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
      var scope = root.getAttribute("data-scope") || "default";
      var list = document.querySelector('[data-card-list="' + scope + '"]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var input = root.querySelector("[data-search-input]");
      var region = root.querySelector("[data-region-filter]");
      var type = root.querySelector("[data-type-filter]");
      var year = root.querySelector("[data-year-filter]");
      var category = root.querySelector("[data-category-filter]");
      var count = root.querySelector("[data-result-count]");

      function apply() {
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
            matched = false;
          }
          if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
            matched = false;
          }
          if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
            matched = false;
          }
          if (categoryValue && normalize(card.getAttribute("data-site-category")) !== categoryValue) {
            matched = false;
          }
          card.classList.toggle("hidden-by-filter", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " 部，共 " + cards.length + " 部";
        }
      }

      [input, region, type, year, category].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !source) {
    return;
  }
  var loaded = false;
  var hls = null;

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function play() {
    loadSource();
    button.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
