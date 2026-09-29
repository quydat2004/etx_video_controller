/**
 * Universal Video Controller - Content Script
 * Tương thích YouTube, Facebook, Netflix, Bilibili, và mọi web xem phim HTML5.
 */

(() => {
  // Cấu hình mặc định
  let settings = {
    rememberSpeed: false,
    savedSpeed: 1.0,
    seekStep: 5,       // Bước tua mặc định: 5 giây
    speedStep: 0.25,   // Bước chỉnh tốc độ: 0.25x
    showHud: true,     // Hiển thị thanh điều khiển nổi trên video
    fastToggleSpeed: 2.0 // Tốc độ khi bấm phím toggle nhanh [G]
  };

  // Video được tương tác gần nhất
  let lastInteractedVideo = null;
  let toastTimeout = null;

  // 1. Tải cấu hình đã lưu từ chrome.storage
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(settings, (data) => {
        if (data) {
          settings = { ...settings, ...data };
          applySavedSpeedToAllVideos();
          toggleHudVisibilityAll(settings.showHud);
        }
      });
    }
  }

  function saveSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set(newSettings);
    }
  }

  // 2. Tìm kiếm tất cả video trên trang (kể cả trong Shadow DOM)
  function findAllVideos(root = document) {
    let videos = [];
    try {
      const vids = root.querySelectorAll('video');
      videos.push(...Array.from(vids));

      const allElements = root.querySelectorAll('*');
      for (const el of allElements) {
        if (el.shadowRoot) {
          videos.push(...findAllVideos(el.shadowRoot));
        }
      }
    } catch (e) {
      // Bỏ qua lỗi DOM traversal nếu có
    }
    return videos;
  }

  // 3. Xác định video đang phát hoặc đang được người dùng chú ý
  function getActiveVideo() {
    const allVideos = findAllVideos();
    if (allVideos.length === 0) return null;

    // Ưu tiên video chuột đang rê qua
    if (lastInteractedVideo && document.contains(lastInteractedVideo) && lastInteractedVideo.readyState > 0) {
      return lastInteractedVideo;
    }

    // Lọc các video đang hiển thị (có kích thước)
    const visibleVideos = allVideos.filter(v => {
      const rect = v.getBoundingClientRect();
      return rect.width > 50 && rect.height > 50;
    });

    const candidateVideos = visibleVideos.length > 0 ? visibleVideos : allVideos;

    // Ưu tiên video đang phát (không bị pause)
    const playingVideos = candidateVideos.filter(v => !v.paused && !v.ended);
    if (playingVideos.length === 1) return playingVideos[0];

    if (playingVideos.length > 1) {
      // Nếu có nhiều video đang phát, ưu tiên video không bị tắt tiếng (unmuted)
      const audible = playingVideos.find(v => !v.muted && v.volume > 0);
      if (audible) return audible;

      // Hoặc video có diện tích lớn nhất trên màn hình
      return playingVideos.reduce((max, v) => 
        (v.clientWidth * v.clientHeight > max.clientWidth * max.clientHeight) ? v : max
      , playingVideos[0]);
    }

    // Nếu tất cả video đang pause: chọn video có diện tích hiển thị lớn nhất
    return candidateVideos.reduce((max, v) => 
      (v.clientWidth * v.clientHeight > max.clientWidth * max.clientHeight) ? v : max
    , candidateVideos[0]);
  }

  // 4. Định dạng thời gian mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    return `${mm}:${ss}`;
  }

  // 5. Hiển thị thông báo OSD (On-Screen Display Toast)
  function showToast(icon, mainText, subText = '') {
    // Nếu đang ở chế độ Fullscreen, gắn toast vào fullscreenElement để không bị che khuất
    const targetParent = document.fullscreenElement ||
                         document.webkitFullscreenElement ||
                         document.mozFullScreenElement ||
                         document.body;

    if (!targetParent) return;

    let toast = document.getElementById('uvc-osd-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'uvc-osd-toast';
      toast.innerHTML = `
        <span class="uvc-icon"></span>
        <span class="uvc-value"></span>
        <span class="uvc-sub"></span>
      `;
    }

    // Gắn vào đúng container hiện tại (hỗ trợ fullscreen)
    if (toast.parentElement !== targetParent) {
      targetParent.appendChild(toast);
    }

    toast.querySelector('.uvc-icon').textContent = icon;
    toast.querySelector('.uvc-value').textContent = mainText;
    toast.querySelector('.uvc-sub').textContent = subText;

    toast.classList.add('uvc-visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('uvc-visible');
    }, 1000);
  }

  // 6. Áp dụng thay đổi tốc độ
  function setVideoSpeed(video, newSpeed) {
    if (!video) return;
    const clampedSpeed = Math.max(0.1, Math.min(16.0, Math.round(newSpeed * 100) / 100));
    video.playbackRate = clampedSpeed;

    if (settings.rememberSpeed) {
      saveSettings({ savedSpeed: clampedSpeed });
    }

    showToast('⚡', `${clampedSpeed.toFixed(2)}x`, 'Tốc độ phát');
    updateHudSpeed(video);
  }

  // 7. Áp dụng tua thời gian
  function seekVideo(video, deltaSeconds) {
    if (!video) return;
    const duration = video.duration || Infinity;
    const newTime = Math.max(0, Math.min(duration, video.currentTime + deltaSeconds));
    video.currentTime = newTime;

    const icon = deltaSeconds > 0 ? '⏩' : '⏪';
    const sign = deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`;
    const progress = duration && isFinite(duration) ? `${formatTime(newTime)} / ${formatTime(duration)}` : `${formatTime(newTime)}`;
    
    showToast(icon, sign, `(${progress})`);
  }

  // 8. Kiểm tra xem người dùng có đang gõ văn bản không
  function isEditableTarget(el) {
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    if (el.getAttribute && (el.getAttribute('role') === 'textbox' || el.getAttribute('role') === 'combobox')) return true;
    
    // Kiểm tra shadow root nếu có
    if (el.shadowRoot && el.shadowRoot.activeElement) {
      return isEditableTarget(el.shadowRoot.activeElement);
    }
    return false;
  }

  // 9. Lắng nghe phím tắt điều khiển
  document.addEventListener('keydown', (e) => {
    // CỰC KỲ QUAN TRỌNG: Không bắt phím nếu có Ctrl, Alt hoặc Meta (Command)
    // Để không bao giờ làm hỏng Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+X, Ctrl+R, etc.
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Bỏ qua nếu đang gõ chữ vào input, textarea hoặc contenteditable
    const activeEl = document.activeElement;
    if (isEditableTarget(activeEl) || isEditableTarget(e.target)) return;

    const video = getActiveVideo();
    if (!video) return;

    const key = e.key.toLowerCase();
    let handled = false;

    switch (key) {
      case 'z': { // Tua lùi (mặc định 5s, nếu giữ Shift thì 10s)
        const step = e.shiftKey ? settings.seekStep * 2 : settings.seekStep;
        seekVideo(video, -step);
        handled = true;
        break;
      }
      case 'x': { // Tua tới (mặc định 5s, nếu giữ Shift thì 10s)
        const step = e.shiftKey ? settings.seekStep * 2 : settings.seekStep;
        seekVideo(video, step);
        handled = true;
        break;
      }
      case 'c': // Giảm tốc độ (-0.25x)
      case '[': {
        setVideoSpeed(video, video.playbackRate - settings.speedStep);
        handled = true;
        break;
      }
      case 'v': // Tăng tốc độ (+0.25x)
      case ']': {
        setVideoSpeed(video, video.playbackRate + settings.speedStep);
        handled = true;
        break;
      }
      case 'r': { // Reset về tốc độ chuẩn 1.00x
        setVideoSpeed(video, 1.0);
        showToast('🔄', '1.00x', 'Chuẩn');
        handled = true;
        break;
      }
      case 'g': { // Chuyển đổi nhanh giữa 1.0x và tốc độ nhanh (2.0x)
        const target = Math.abs(video.playbackRate - 1.0) < 0.05 ? settings.fastToggleSpeed : 1.0;
        setVideoSpeed(video, target);
        handled = true;
        break;
      }
      case 'b': { // Bật / Tắt thanh HUD nổi trên video
        settings.showHud = !settings.showHud;
        saveSettings({ showHud: settings.showHud });
        toggleHudVisibilityAll(settings.showHud);
        showToast('🎛️', settings.showHud ? 'BẬT' : 'TẮT', 'Thanh công cụ trên video');
        handled = true;
        break;
      }
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true); // Sử dụng Capture phase để ưu tiên xử lý trước

  // 10. Tạo Floating HUD (Thanh công cụ nhỏ gọn nổi trên góc video)
  function attachHudToVideo(video) {
    if (!video || video.__uvcHudAttached) return;
    video.__uvcHudAttached = true;

    // Tìm hoặc chuẩn bị container cha để đặt HUD absolute
    const parent = video.parentElement;
    if (!parent) return;

    const parentPos = window.getComputedStyle(parent).position;
    if (parentPos === 'static') {
      parent.style.position = 'relative';
    }
    parent.classList.add('uvc-video-container');

    const hud = document.createElement('div');
    hud.className = 'uvc-floating-hud';
    if (!settings.showHud) {
      hud.style.display = 'none';
    }

    hud.innerHTML = `
      <button class="uvc-hud-btn uvc-btn-rewind" title="Tua lùi ${settings.seekStep}s (Z)">« ${settings.seekStep}s</button>
      <button class="uvc-hud-btn uvc-btn-slower" title="Giảm tốc độ (C)">-</button>
      <span class="uvc-hud-speed" title="Tốc độ phát (Click để Reset 1x)">${video.playbackRate.toFixed(2)}x</span>
      <button class="uvc-hud-btn uvc-btn-faster" title="Tăng tốc độ (V)">+</button>
      <button class="uvc-hud-btn uvc-btn-forward" title="Tua tới ${settings.seekStep}s (X)">${settings.seekStep}s »</button>
      <button class="uvc-hud-btn uvc-hud-close" title="Ẩn thanh này (Phím B để bật lại)">✕</button>
    `;

    // Sự kiện nút trong HUD
    hud.querySelector('.uvc-btn-rewind').addEventListener('click', (e) => {
      e.stopPropagation();
      seekVideo(video, -settings.seekStep);
    });

    hud.querySelector('.uvc-btn-forward').addEventListener('click', (e) => {
      e.stopPropagation();
      seekVideo(video, settings.seekStep);
    });

    hud.querySelector('.uvc-btn-slower').addEventListener('click', (e) => {
      e.stopPropagation();
      setVideoSpeed(video, video.playbackRate - settings.speedStep);
    });

    hud.querySelector('.uvc-btn-faster').addEventListener('click', (e) => {
      e.stopPropagation();
      setVideoSpeed(video, video.playbackRate + settings.speedStep);
    });

    hud.querySelector('.uvc-hud-speed').addEventListener('click', (e) => {
      e.stopPropagation();
      setVideoSpeed(video, 1.0);
    });

    hud.querySelector('.uvc-hud-close').addEventListener('click', (e) => {
      e.stopPropagation();
      settings.showHud = false;
      saveSettings({ showHud: false });
      toggleHudVisibilityAll(false);
      showToast('🎛️', 'Đã ẩn', 'Bấm phím B để hiện lại');
    });

    parent.appendChild(hud);
    video.__uvcHudElement = hud;

    // Ghi nhớ tương tác khi di chuột vào video
    video.addEventListener('mouseenter', () => {
      lastInteractedVideo = video;
    });

    // Lắng nghe khi video thay đổi tốc độ để cập nhật hiển thị trên HUD
    video.addEventListener('ratechange', () => {
      updateHudSpeed(video);
    });

    // Tự động áp dụng tốc độ đã lưu nếu bật "rememberSpeed"
    if (settings.rememberSpeed && settings.savedSpeed && settings.savedSpeed !== 1.0) {
      if (Math.abs(video.playbackRate - settings.savedSpeed) > 0.01) {
        video.playbackRate = settings.savedSpeed;
        updateHudSpeed(video);
      }
    }
  }

  function updateHudSpeed(video) {
    if (video && video.__uvcHudElement) {
      const speedSpan = video.__uvcHudElement.querySelector('.uvc-hud-speed');
      if (speedSpan) {
        speedSpan.textContent = `${video.playbackRate.toFixed(2)}x`;
      }
    }
  }

  function toggleHudVisibilityAll(show) {
    const huds = document.querySelectorAll('.uvc-floating-hud');
    huds.forEach(hud => {
      hud.style.display = show ? 'flex' : 'none';
    });
  }

  function applySavedSpeedToAllVideos() {
    if (!settings.rememberSpeed || !settings.savedSpeed) return;
    const videos = findAllVideos();
    videos.forEach(v => {
      if (Math.abs(v.playbackRate - settings.savedSpeed) > 0.01) {
        v.playbackRate = settings.savedSpeed;
        updateHudSpeed(v);
      }
    });
  }

  // 11. Theo dõi các video xuất hiện mới trong trang (MutationObserver)
  function scanAndInitVideos() {
    const videos = findAllVideos();
    videos.forEach(v => attachHudToVideo(v));
  }

  const observer = new MutationObserver(() => {
    scanAndInitVideos();
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });

  // 12. Lắng nghe thông điệp gửi từ Popup Extension
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const video = getActiveVideo();

      switch (request.action) {
        case 'GET_STATUS': {
          sendResponse({
            hasVideo: !!video,
            speed: video ? video.playbackRate : settings.savedSpeed || 1.0,
            currentTime: video ? video.currentTime : 0,
            duration: video ? (video.duration || 0) : 0,
            isPaused: video ? video.paused : true,
            settings: settings
          });
          break;
        }

        case 'SET_SPEED': {
          if (video) {
            setVideoSpeed(video, request.speed);
          } else {
            saveSettings({ savedSpeed: request.speed });
          }
          sendResponse({ success: true, speed: request.speed });
          break;
        }

        case 'SEEK': {
          if (video) {
            seekVideo(video, request.delta);
            sendResponse({ success: true, currentTime: video.currentTime });
          } else {
            sendResponse({ success: false });
          }
          break;
        }

        case 'TOGGLE_PLAY': {
          if (video) {
            if (video.paused) {
              video.play();
              showToast('▶️', 'Phát', '');
            } else {
              video.pause();
              showToast('⏸️', 'Tạm dừng', '');
            }
            sendResponse({ success: true, isPaused: video.paused });
          }
          break;
        }

        case 'UPDATE_SETTINGS': {
          saveSettings(request.settings);
          toggleHudVisibilityAll(settings.showHud);
          if (settings.rememberSpeed && video) {
            saveSettings({ savedSpeed: video.playbackRate });
          }
          sendResponse({ success: true, settings });
          break;
        }
      }
      return true; // Cho phép phản hồi async
    });
  }

  // Khởi tạo ban đầu
  loadSettings();
  scanAndInitVideos();
})();