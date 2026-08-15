// Force Download Utility
function forceDownload(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    })
    .catch(console.error);
}

// Prevent FOUC: Fade in body when DOM and external assets are fully loaded
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// ============ LOCK SCREEN ============
const lockscreen = document.getElementById('lockscreen');
const lsClock = document.getElementById('lsClock');
const lsDay = document.getElementById('lsDay');

const lsDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const lsMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function updateLsClock() {
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes();
  // macOS lock screen uses 12-hour, no leading zero
  let h12 = h % 12; if (h12 === 0) h12 = 12;
  lsClock.textContent = `${h12}:${m < 10 ? '0' + m : m}`;
  lsDay.textContent = `${lsDays[now.getDay()]} ${lsMonths[now.getMonth()]} ${now.getDate()}`;
}
updateLsClock();
const lsClockInterval = setInterval(updateLsClock, 1000);

let unlocked = false;
function doUnlock() {
  if (unlocked) return;
  unlocked = true;
  clearInterval(lsClockInterval);
  lockscreen.classList.add('unlocking');
  setTimeout(() => lockscreen.classList.add('gone'), 780);
}

// Click anywhere to unlock
lockscreen.addEventListener('click', () => {
  doUnlock();
});

// Touch swipe up can still unlock
let tsY = 0;
lockscreen.addEventListener('touchstart', (e) => { tsY = e.touches[0].clientY; }, { passive: true });
lockscreen.addEventListener('touchend', (e) => {
  if (e.changedTouches[0].clientY - tsY < -50) doUnlock();
}, { passive: true });

// ---------- Live clock ----------
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function pad(n) { return n < 10 ? '0' + n : n; }
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  const text = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}  ${h}:${pad(now.getMinutes())} ${ampm}`;
  document.getElementById('clock').textContent = text;
}
updateClock();
setInterval(updateClock, 1000);

// ---------- Dock magnification ----------
const dock = document.getElementById('dock');
const dockIcons = Array.from(dock.querySelectorAll('.dock-icon'));
const MAX_SCALE = 1.6, RANGE = 130;

dock.addEventListener('mousemove', (e) => {
  const mouseX = e.clientX;
  dockIcons.forEach(icon => {
    const ir = icon.getBoundingClientRect();
    const centerX = ir.left + ir.width / 2;
    const dist = Math.abs(mouseX - centerX);
    let scale = 1;
    if (dist < RANGE) {
      scale = 1 + (MAX_SCALE - 1) * (1 - dist / RANGE);
    }
    icon.style.transform = `scale(${scale})`;
    icon.style.zIndex = scale > 1.02 ? 5 : 1;
  });
});
dock.addEventListener('mouseleave', () => {
  dockIcons.forEach(icon => { icon.style.transform = 'scale(1)'; icon.style.zIndex = 1; });
});

// ---------- Bounce on click ----------
dockIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    icon.classList.add('bouncing');
    setTimeout(() => icon.classList.remove('bouncing'), 550);
  });
});

// ---------- Menu bar dropdowns (Apple / File / Edit / View / Go / Window / Help) ----------
const menuRoots = Array.from(document.querySelectorAll('.menu-root'));
let openRoot = null;

function closeAllMenus() {
  menuRoots.forEach(r => {
    r.querySelector('.menu-dropdown').classList.remove('open');
    r.querySelector('.menu-item').classList.remove('active');
  });
  openRoot = null;
}
function openMenu(root) {
  closeAllMenus();
  root.querySelector('.menu-dropdown').classList.add('open');
  root.querySelector('.menu-item').classList.add('active');
  openRoot = root;
}

menuRoots.forEach(root => {
  const trigger = root.querySelector('.menu-item');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (openRoot === root) { closeAllMenus(); }
    else { openMenu(root); }
  });
  root.addEventListener('mouseenter', () => {
    if (openRoot && openRoot !== root) openMenu(root);
  });
  root.querySelectorAll('.mi:not(.disabled)').forEach(mi => {
    mi.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllMenus();
    });
  });
});
document.addEventListener('click', (e) => {
  if (openRoot && !openRoot.contains(e.target)) closeAllMenus();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllMenus();
});

// ---------- Spotlight ----------
document.getElementById('spotlightBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  openOverlay('spotlightOverlay');
  setTimeout(() => document.getElementById('spotlightInput').focus(), 80);
});

// ---------- Overlay helpers ----------
function openOverlay(id) { document.getElementById(id).classList.add('show'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', () => closeOverlay(el.dataset.close + 'Overlay'));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOverlay('spotlightOverlay');
});

// ---------- Control Centre ----------
const ccPanel = document.getElementById('ccPanel');
const ccBtn = document.getElementById('ccBtn');
ccBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  ccPanel.classList.toggle('show');
});
document.addEventListener('click', (e) => {
  if (!ccPanel.contains(e.target) && e.target !== ccBtn && !ccBtn.contains(e.target)) {
    ccPanel.classList.remove('show');
  }
});
['wifiIcon', 'btIcon', 'afIcon'].forEach(id => {
  document.getElementById(id).addEventListener('click', (e) => {
    e.stopPropagation();
    e.currentTarget.classList.toggle('on');
  });
});
// ---------- Wallpaper Picker ----------
const wallpapers = [
  { type: 'image', label: 'Tanjiro', value: 'assets/images/tanjiro-kamado-3840x2160-23027.jpg' },
  { type: 'image', label: 'Itachi', value: 'assets/images/itachi-uchiha-moon-3840x2160-25777.jpg' },
  { type: 'image', label: 'Luffy', value: 'assets/images/monkey-d-luffy-3840x2160-26035.jpg' },
  { type: 'image', label: 'Pain', value: 'assets/images/pain-nagato-black-3840x2160-26691.jpg' },
  { type: 'image', label: 'Tanjiro Red', value: 'assets/images/tanjiro-kamado-red-3840x2160-22577.png' },
];

const wpPicker = document.getElementById('wpPicker');
const wpGrid = document.getElementById('wpGrid');
const wallpaperEl = document.querySelector('.wallpaper');
let activeWpIndex = 0;

// Build thumbnails
wallpapers.forEach((wp, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'wp-thumb' + (i === 0 ? ' active' : '');
  if (wp.type === 'original') {
    // Clone the SVG for the thumb
    thumb.style.background = 'linear-gradient(135deg,#0a0c18,#1a0533 50%,#0a3a36)';
    thumb.innerHTML = `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
        <defs>
          <linearGradient id="tg${i}" x1="15%" y1="0%" x2="85%" y2="100%"><stop offset="0%" stop-color="#0a0c18"/><stop offset="50%" stop-color="#070811"/><stop offset="100%" stop-color="#04050a"/></linearGradient>
          <radialGradient id="pg${i}" cx="80%" cy="8%" r="55%"><stop offset="0%" stop-color="#8855ff" stop-opacity="0.5"/><stop offset="100%" stop-color="#8855ff" stop-opacity="0"/></radialGradient>
          <radialGradient id="cg${i}" cx="10%" cy="100%" r="65%"><stop offset="0%" stop-color="#15d6c4" stop-opacity="0.55"/><stop offset="100%" stop-color="#15d6c4" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="160" height="100" fill="url(#tg${i})"/>
        <rect width="160" height="100" fill="url(#pg${i})"/>
        <rect width="160" height="100" fill="url(#cg${i})"/>
        <path d="M-4,-4 C10,2 15,12 27,14 C40,17 43,10 56,15 C70,20 68,30 82,36 C96,42 104,36 118,43 C133,51 141,47 164,54 L164,73 C141,66 133,70 118,63 C104,55 96,62 82,56 C68,50 70,40 56,35 C43,30 40,37 27,34 C15,31 10,22 -4,15 Z" fill="url(#ribbonGrad)" opacity="0.6"/>
      </svg>`;
  } else if (wp.type === 'image') {
    thumb.style.background = `url(${wp.value}) center/cover`;
  } else {
    thumb.style.background = wp.value;
  }
  thumb.title = wp.label;
  thumb.addEventListener('click', () => applyWallpaper(i));
  wpGrid.appendChild(thumb);
});

function checkBrightness(url, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2];
      }
      const total = data.length / 4;
      const brightness = ((r / total) * 299 + (g / total) * 587 + (b / total) * 114) / 1000;
      callback(brightness > 130);
    } catch (e) { callback(false); }
  };
  img.onerror = () => callback(false);
  img.src = url;
}

function applyWallpaper(index) {
  const wp = wallpapers[index];
  activeWpIndex = index;
  // Update active thumb
  wpGrid.querySelectorAll('.wp-thumb').forEach((t, i) => t.classList.toggle('active', i === index));

  const setLightMode = (isLight) => {
    if (isLight) document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  };

  if (wp.type === 'original') {
    wallpaperEl.style.display = '';
    document.querySelector('.desktop').style.background = '';
    setLightMode(false);
  } else if (wp.type === 'gradient') {
    wallpaperEl.style.display = 'none';
    document.querySelector('.desktop').style.background = wp.value;
    setLightMode(false);
  } else if (wp.type === 'image') {
    wallpaperEl.style.display = 'none';
    document.querySelector('.desktop').style.background = `url(${wp.value}) center/cover no-repeat`;
    checkBrightness(wp.value, setLightMode);
  }
}

// Manual Theme Toggle
document.getElementById('themeToggleBtn').addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
});

// Upload handler
document.getElementById('wpUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const idx = wallpapers.length;
  wallpapers.push({ type: 'image', label: file.name, value: url });
  // Add thumb
  const thumb = document.createElement('div');
  thumb.className = 'wp-thumb';
  thumb.style.backgroundImage = `url(${url})`;
  thumb.style.backgroundSize = 'cover';
  thumb.style.backgroundPosition = 'center';
  thumb.title = file.name;
  thumb.addEventListener('click', () => applyWallpaper(idx));
  wpGrid.appendChild(thumb);
  applyWallpaper(idx);
  e.target.value = '';
});

// Toggle picker from dock
const wallpaperDockBtn = document.getElementById('wallpaperDockBtn');
wallpaperDockBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  wallpaperDockBtn.classList.add('bouncing');
  setTimeout(() => wallpaperDockBtn.classList.remove('bouncing'), 550);
  wpPicker.classList.toggle('show');
});
document.getElementById('wpClose').addEventListener('click', () => wpPicker.classList.remove('show'));
document.addEventListener('click', (e) => {
  if (!wpPicker.contains(e.target) && !wallpaperDockBtn.contains(e.target)) {
    wpPicker.classList.remove('show');
  }
});

// Apply default wallpaper on load
applyWallpaper(0);

// ============ WINDOW MANAGER ============
const openWindows = {};
let highestZIndex = 1000;
const desktop = document.querySelector('.desktop');

let draggingWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.addEventListener('mousemove', (e) => {
  if (!draggingWindow) return;
  draggingWindow.style.left = (e.clientX - dragOffsetX) + 'px';
  draggingWindow.style.top = (e.clientY - dragOffsetY) + 'px';
});

document.addEventListener('mouseup', () => {
  draggingWindow = null;
});

window.bringToFront = function (winId) {
  if (!openWindows[winId]) return;
  highestZIndex++;
  openWindows[winId].element.style.zIndex = highestZIndex;
}

window.closeWindow = function (winId) {
  if (!openWindows[winId]) return;
  openWindows[winId].element.remove();
  delete openWindows[winId];
}

window.minimizeWindow = function (winId) {
  if (!openWindows[winId]) return;
  openWindows[winId].element.style.display = 'none';
  openWindows[winId].minimized = true;
}

window.maximizeWindow = function (winId) {
  if (!openWindows[winId]) return;
  const winEl = openWindows[winId].element;
  winEl.classList.toggle('maximized');
  if (!winEl.classList.contains('maximized')) {
    winEl.style.left = '50%';
    winEl.style.top = '50%';
    winEl.style.transform = 'translate(-50%, -50%)';
  } else {
    winEl.style.transform = 'none';
  }
}

window.openApp = function (name, url) {
  const winId = name.replace(/\s+/g, '-').toLowerCase();

  // If already open, just bring to front and un-minimize
  if (openWindows[winId]) {
    const winEl = openWindows[winId].element;
    winEl.style.display = 'flex';
    openWindows[winId].minimized = false;
    bringToFront(winId);
    return;
  }

  // Create new window
  const winEl = document.createElement('div');
  winEl.className = 'mac-window';
  if (url.includes('retrogames') || url.includes('gettingoverit') || url.includes('freeriderhd')) winEl.classList.add('solid-mode');

  winEl.innerHTML = `
        <div class="window-titlebar">
          <div class="window-controls">
            <div class="win-btn close" onclick="closeWindow('${winId}')"></div>
            <div class="win-btn minimize" onclick="minimizeWindow('${winId}')"></div>
            <div class="win-btn maximize" onclick="maximizeWindow('${winId}')"></div>
          </div>
          <div class="window-title">${name}</div>
        </div>
        <div class="window-content">
          <iframe src="${url}" frameborder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" scrolling="no" allow="cross-origin-isolated"></iframe>
        </div>
      `;

  desktop.appendChild(winEl);
  openWindows[winId] = { element: winEl, minimized: false };

  // Positioning
  winEl.style.left = '50%';
  winEl.style.top = '50%';
  winEl.style.transform = 'translate(-50%, -50%)';
  bringToFront(winId);

  // Dragging logic
  const titlebar = winEl.querySelector('.window-titlebar');
  titlebar.addEventListener('mousedown', (e) => {
    bringToFront(winId);
    if (e.target.classList.contains('win-btn') || winEl.classList.contains('maximized')) return;
    draggingWindow = winEl;
    const rect = winEl.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    winEl.style.transform = 'none';
    winEl.style.left = rect.left + 'px';
    winEl.style.top = rect.top + 'px';
  });

  // Bring to front on click anywhere in window
  winEl.addEventListener('mousedown', () => bringToFront(winId));
}

function showPage(pageId) {
  const isHome = pageId === 'home';
  document.getElementById('home-view').style.display = isHome ? 'flex' : 'none';
  document.body.classList.toggle('page-active', !isHome);
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  if (!isHome) {
    document.getElementById(pageId + '-page').classList.add('active');
  }
  document.querySelectorAll('.mp-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
  // Always reveal the nav on navigation, and scroll the freshly-active
  // page back to its top so the hide/show state starts clean.
  const navEl = document.getElementById('mobilePageNav');
  if (navEl) navEl.classList.remove('mp-nav-hidden');
  if (!isHome) {
    const activePage = document.getElementById(pageId + '-page');
    if (activePage) activePage.scrollTop = 0;
  }
}

// Scroll-aware mobile nav: hide the capsule row while scrolling down
// (more reading room), bring it back the moment the user scrolls up —
// mirrors how Safari/Mail collapse their toolbars on iOS.
(function setupScrollAwareMobileNav() {
  const navEl = document.getElementById('mobilePageNav');
  if (!navEl) return;

  const THRESHOLD = 8;     // px of scroll movement before reacting, avoids jitter
  const TOP_SLACK = 24;    // always show nav near the very top of a page

  document.querySelectorAll('.page-content').forEach(pageEl => {
    let lastScrollTop = 0;
    let accumulated = 0;

    pageEl.addEventListener('scroll', () => {
      const current = pageEl.scrollTop;
      const delta = current - lastScrollTop;

      if (current <= TOP_SLACK) {
        navEl.classList.remove('mp-nav-hidden');
        accumulated = 0;
        lastScrollTop = current;
        return;
      }

      // Only accumulate while moving in one consistent direction so a
      // quick back-and-forth wobble doesn't flip the nav rapidly.
      if ((delta > 0 && accumulated < 0) || (delta < 0 && accumulated > 0)) {
        accumulated = 0;
      }
      accumulated += delta;

      if (accumulated > THRESHOLD) {
        navEl.classList.add('mp-nav-hidden');
        accumulated = 0;
      } else if (accumulated < -THRESHOLD) {
        navEl.classList.remove('mp-nav-hidden');
        accumulated = 0;
      }

      lastScrollTop = current;
    }, { passive: true });
  });
})();

// Music Player Logic
const musicPlayerWidget = document.getElementById('musicPlayerWidget');
const playPauseBtn = document.getElementById('playPauseBtn');
const bgMusic = document.getElementById('bgMusic');

if (musicPlayerWidget && playPauseBtn && bgMusic) {
  playPauseBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicPlayerWidget.classList.add('playing');
      playPauseBtn.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    } else {
      bgMusic.pause();
      musicPlayerWidget.classList.remove('playing');
      playPauseBtn.innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
  });
}