(function () {
    var menuButton = document.querySelector(".js-menu-button");
    var mobileNav = document.querySelector(".js-mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".js-hero-prev");
    var next = document.querySelector(".js-hero-next");
    var slideIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === slideIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === slideIndex);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(slideIndex - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(slideIndex + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            restartHero();
        });
    });

    startHero();

    var grid = document.querySelector(".js-filter-grid");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".js-movie-card")) : [];
    var keyword = document.querySelector(".js-search-input");
    var category = document.querySelector(".js-filter-category");
    var region = document.querySelector(".js-filter-region");
    var type = document.querySelector(".js-filter-type");
    var year = document.querySelector(".js-filter-year");
    var reset = document.querySelector(".js-reset-filter");
    var empty = document.querySelector(".js-empty-state");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var q = normalize(keyword && keyword.value);
        var selectedCategory = category ? category.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var ok = true;
            if (q && text.indexOf(q) === -1) {
                ok = false;
            }
            if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
                ok = false;
            }
            if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                ok = false;
            }
            if (selectedType && card.getAttribute("data-type") !== selectedType) {
                ok = false;
            }
            if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                ok = false;
            }
            card.classList.toggle("is-hidden", !ok);
            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    [keyword, category, region, type, year].forEach(function (control) {
        if (!control) {
            return;
        }
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
    });

    if (reset) {
        reset.addEventListener("click", function () {
            [keyword, category, region, type, year].forEach(function (control) {
                if (control) {
                    control.value = "";
                }
            });
            applyFilters();
        });
    }

    var backTop = document.querySelector(".js-back-top");

    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("is-visible", window.scrollY > 500);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}());
