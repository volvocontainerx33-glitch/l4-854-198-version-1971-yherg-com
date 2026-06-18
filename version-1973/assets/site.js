const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

const normalize = (value) => {
    return (value || "").toString().trim().toLowerCase();
};

const initMobileNav = () => {
    const button = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        const expanded = nav.classList.contains("is-open");
        button.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
};

const initBackTop = () => {
    document.querySelectorAll("[data-back-top]").forEach((button) => {
        button.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });
};

const initHero = () => {
    const root = document.querySelector("[data-hero]");

    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const prev = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 6000);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            show(current + 1);
            start();
        });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
};

const initFilters = () => {
    const scope = document.querySelector("[data-filter-scope]");

    if (!scope) {
        return;
    }

    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const textInput = scope.querySelector("[data-filter-input]");
    const count = scope.querySelector("[data-visible-count]");
    const empty = document.querySelector("[data-empty-state]");
    const selects = Array.from(scope.querySelectorAll("[data-filter-select]"));
    const query = new URLSearchParams(window.location.search).get("q") || "";

    if (query && textInput) {
        textInput.value = query;
    }

    const apply = () => {
        const keyword = normalize(textInput ? textInput.value : "");
        const conditions = selects.map((select) => {
            return {
                key: select.dataset.filterSelect,
                value: normalize(select.value)
            };
        });
        let visible = 0;

        cards.forEach((card) => {
            const searchText = normalize(card.dataset.search);
            const matchesKeyword = !keyword || searchText.includes(keyword);
            const matchesSelects = conditions.every((condition) => {
                if (!condition.value) {
                    return true;
                }

                return normalize(card.dataset[condition.key]).includes(condition.value);
            });
            const shouldShow = matchesKeyword && matchesSelects;

            card.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    };

    if (textInput) {
        textInput.addEventListener("input", apply);
    }

    selects.forEach((select) => {
        select.addEventListener("change", apply);
    });

    apply();
};

const initPlayer = () => {
    const player = document.querySelector("[data-player]");

    if (!player) {
        return;
    }

    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");
    const message = player.querySelector("[data-player-message]");
    const source = player.dataset.videoUrl;
    let hlsInstance = null;
    let initialized = false;

    const setMessage = (text) => {
        if (message) {
            message.textContent = text || "";
        }
    };

    const loadSource = async () => {
        if (!video || !source || initialized) {
            return;
        }

        initialized = true;
        setMessage("正在加载播放源...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            setMessage("");
            return;
        }

        try {
            const module = await import("./hls-vendor-dru42stk.js");
            const Hls = module.H;

            if (!Hls || !Hls.isSupported()) {
                setMessage("当前浏览器不支持 HLS 播放，请更换现代浏览器访问。");
                return;
            }

            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                setMessage("");
                video.play().catch(() => {
                    setMessage("播放已准备好，请再次点击播放器开始观看。");
                });
            });

            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    setMessage("播放源加载失败，请刷新页面后重试。");
                }
            });
        } catch (error) {
            setMessage("播放器加载失败，请刷新页面后重试。");
        }
    };

    if (button && video) {
        button.addEventListener("click", async () => {
            button.classList.add("is-hidden");
            await loadSource();

            if (video.src || hlsInstance) {
                video.play().catch(() => {
                    setMessage("播放已准备好，请再次点击播放器开始观看。");
                });
            }
        });

        video.addEventListener("play", () => {
            button.classList.add("is-hidden");
        });
    }
};

ready(() => {
    initMobileNav();
    initBackTop();
    initHero();
    initFilters();
    initPlayer();
});
