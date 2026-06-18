(function () {
    window.initMoviePlayer = function (url) {
        var video = document.querySelector(".js-video");
        var button = document.querySelector(".js-player-start");
        var cover = document.querySelector(".player-cover");
        var loaded = false;
        var hls = null;

        if (!video || !button || !url) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        button.addEventListener("click", play);
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
