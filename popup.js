/**
 * Universal Video Controller - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const statusBadge = document.getElementById('video-status');
  const speedDisplay = document.getElementById('speed-display');
  const speedSlider = document.getElementById('speed-slider');
  const btnDecrease = document.getElementById('btn-decrease');
  const btnIncrease = document.getElementById('btn-increase');
  const presetButtons = document.querySelectorAll('.btn-preset');
  
  const btnSeekBack10 = document.getElementById('btn-seek-back-10');
  const btnSeekBack5 = document.getElementById('btn-seek-back-5');
  const btnTogglePlay = document.getElementById('btn-toggle-play');
  const btnSeekForward5 = document.getElementById('btn-seek-forward-5');
  const btnSeekForward10 = document.getElementById('btn-seek-forward-10');

  const chkRememberSpeed = document.getElementById('chk-remember-speed');
  const chkShowHud = document.getElementById('chk-show-hud');

  let currentTabId = null;
  let currentSpeed = 1.0;

  // Lấy Active Tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentTabId = tab.id;
  }

  // Gửi lệnh an toàn tới tab hiện tại
  function sendTabMessage(message, callback) {
    if (!currentTabId) return;
    chrome.tabs.sendMessage(currentTabId, message, (response) => {
      if (chrome.runtime.lastError) {
        // Tab không có content script (ví dụ chrome:// hoặc tab chưa reload)
        if (callback) callback(null);
      } else {
        if (callback) callback(response);
      }
    });
  }

  // Cập nhật giao diện tốc độ
  function updateSpeedUI(speed) {
    currentSpeed = Math.round(speed * 100) / 100;
    speedDisplay.textContent = currentSpeed.toFixed(2);
    speedSlider.value = currentSpeed;

    // Highlight preset nếu khớp
    presetButtons.forEach(btn => {
      const pSpeed = parseFloat(btn.getAttribute('data-speed'));
      if (Math.abs(pSpeed - currentSpeed) < 0.04) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Thay đổi tốc độ
  function changeSpeed(newSpeed) {
    const clamped = Math.max(0.1, Math.min(16.0, Math.round(newSpeed * 100) / 100));
    updateSpeedUI(clamped);
    sendTabMessage({ action: 'SET_SPEED', speed: clamped });
  }

  // 1. Tải trạng thái ban đầu từ tab hiện tại
  sendTabMessage({ action: 'GET_STATUS' }, (response) => {
    if (response) {
      if (response.hasVideo) {
        statusBadge.textContent = '● Đang phát hiện video';
        statusBadge.className = 'status-badge has-video';
      } else {
        statusBadge.textContent = '○ Chưa phát hiện video';
        statusBadge.className = 'status-badge no-video';
      }

      if (response.speed) {
        updateSpeedUI(response.speed);
      }

      if (response.settings) {
        chkRememberSpeed.checked = !!response.settings.rememberSpeed;
        chkShowHud.checked = response.settings.showHud !== false;
      }
    } else {
      // Fallback: đọc từ chrome.storage nếu trang web không inject được script (trang chrome://...)
      chrome.storage.sync.get(['rememberSpeed', 'savedSpeed', 'showHud'], (data) => {
        if (data) {
          if (data.savedSpeed) updateSpeedUI(data.savedSpeed);
          chkRememberSpeed.checked = !!data.rememberSpeed;
          chkShowHud.checked = data.showHud !== false;
        }
      });
      statusBadge.textContent = '○ Không thể điều khiển tab này';
      statusBadge.className = 'status-badge no-video';
    }
  });

  // 2. Sự kiện nút - và +
  btnDecrease.addEventListener('click', () => {
    changeSpeed(currentSpeed - 0.25);
  });

  btnIncrease.addEventListener('click', () => {
    changeSpeed(currentSpeed + 0.25);
  });

  // 3. Sự kiện kéo thanh trượt Slider
  speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    updateSpeedUI(val);
    sendTabMessage({ action: 'SET_SPEED', speed: val });
  });

  // 4. Sự kiện click nút Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.getAttribute('data-speed'));
      changeSpeed(speed);
    });
  });

  // 5. Sự kiện các nút Tua
  btnSeekBack10.addEventListener('click', () => {
    sendTabMessage({ action: 'SEEK', delta: -10 });
  });

  btnSeekBack5.addEventListener('click', () => {
    sendTabMessage({ action: 'SEEK', delta: -5 });
  });

  btnSeekForward5.addEventListener('click', () => {
    sendTabMessage({ action: 'SEEK', delta: 5 });
  });

  btnSeekForward10.addEventListener('click', () => {
    sendTabMessage({ action: 'SEEK', delta: 10 });
  });

  btnTogglePlay.addEventListener('click', () => {
    sendTabMessage({ action: 'TOGGLE_PLAY' });
  });

  // 6. Sự kiện Settings Switches
  chkRememberSpeed.addEventListener('change', () => {
    const isRemember = chkRememberSpeed.checked;
    chrome.storage.sync.set({ 
      rememberSpeed: isRemember,
      savedSpeed: currentSpeed
    });
    sendTabMessage({ 
      action: 'UPDATE_SETTINGS', 
      settings: { rememberSpeed: isRemember, savedSpeed: currentSpeed }
    });
  });

  chkShowHud.addEventListener('change', () => {
    const isShow = chkShowHud.checked;
    chrome.storage.sync.set({ showHud: isShow });
    sendTabMessage({ 
      action: 'UPDATE_SETTINGS', 
      settings: { showHud: isShow } 
    });
  });
});
