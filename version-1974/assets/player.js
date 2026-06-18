import { H as Hls } from './hls-vendor.js';

function setStatus(shell, message) {
  const status = shell.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function attachHls(video, source, shell) {
  if (!source) {
    setStatus(shell, '未找到播放源');
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus(shell, '正在使用浏览器原生 HLS 播放');
    video.play().catch(function () {
      setStatus(shell, '播放已就绪，请再次点击播放按钮');
    });
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(shell, 'HLS 播放源加载成功');
      video.play().catch(function () {
        setStatus(shell, '播放已就绪，请再次点击播放按钮');
      });
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus(shell, '播放源加载失败，请检查网络或稍后重试');
        hls.destroy();
      }
    });
    shell.__hlsInstance = hls;
    return;
  }

  setStatus(shell, '当前浏览器不支持 HLS 播放');
}

function setupPlayer(shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-player-button]');
  const source = shell.dataset.videoUrl;

  if (!video || !button) {
    return;
  }

  button.addEventListener('click', function () {
    button.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    attachHls(video, source, shell);
  });
}

document.querySelectorAll('[data-video-url]').forEach(setupPlayer);
