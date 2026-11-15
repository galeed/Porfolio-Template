import { playKeySound, playBeep } from './audio.js';
import { initSnap, checkSnapDuringDrag, hideSnapPreview, applySnap } from './snap.js';

const desktop = document.getElementById('desktop');
let zIndex = 10;
export const windows = {};

export function createWindow({ id, title, width = 480, height = 400, x, y, body = '', footer = '', className = '' }) {
  if (windows[id]) {
    bringToFront(id);
    return windows[id];
  }

  const win = document.createElement('div');
  win.className = 'window ' + className;
  win.id = 'win-' + id;
  win.style.width = width + 'px';
  win.style.height = height + 'px';
  win.style.left = (x ?? (80 + Math.random() * 200)) + 'px';
  win.style.top = (y ?? (60 + Math.random() * 150)) + 'px';
  win.style.zIndex = ++zIndex;

  win.innerHTML = `
    <div class="window-header">
      <div class="window-dots">
        <span data-act="close" title="Close"></span>
        <span data-act="minimize" title="Minimize"></span>
        <span data-act="maximize" title="Maximize"></span>
      </div>
      <div class="window-title">${title}</div>
    </div>
    <div class="window-body">${body}</div>
    ${footer}
    <div class="resize-handle"></div>
  `;

  desktop.appendChild(win);
  windows[id] = win;

  win.addEventListener('mousedown', () => bringToFront(id));

  const header = win.querySelector('.window-header');
  makeDraggable(win, header, id);

  win.querySelectorAll('.window-dots span').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = dot.dataset.act;
      if (act === 'close') closeWindow(id);
      else if (act === 'minimize') win.classList.toggle('minimized');
      else if (act === 'maximize') {
        win.classList.remove('snap-left', 'snap-right', 'snap-top');
        win.classList.toggle('maximized');
      }
    });
  });

  const resizeHandle = win.querySelector('.resize-handle');
  makeResizable(win, resizeHandle);

  updateDockState();
  return win;
}

export function bringToFront(id) {
  Object.values(windows).forEach(w => w.classList.remove('focused'));
  if (windows[id]) {
    windows[id].style.zIndex = ++zIndex;
    windows[id].classList.add('focused');
    if (windows[id].classList.contains('minimized')) {
      windows[id].classList.remove('minimized');
    }
  }
  updateDockState();
}

export function closeWindow(id) {
  if (!windows[id]) return;
  if (windows[id]._cleanup) windows[id]._cleanup();
  windows[id].remove();
  delete windows[id];
  updateDockState();
  playBeep(440, 0.05);
}

function makeDraggable(win, handle, id) {
  let startX, startY, startLeft, startTop, dragging = false;

  handle.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window-dots')) return;
    if (document.body.classList.contains('mobile-mode')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;
    win.classList.add('dragging');
    if (win.classList.contains('maximized')) win.classList.remove('maximized');
    if (win.classList.contains('snap-left') || win.classList.contains('snap-right') || win.classList.contains('snap-top')) {
      win.classList.remove('snap-left', 'snap-right', 'snap-top');
    }
    bringToFront(id);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    win.style.left = Math.max(-50, Math.min(window.innerWidth - 100, startLeft + dx)) + 'px';
    win.style.top = Math.max(0, Math.min(window.innerHeight - 60, startTop + dy)) + 'px';

    // Snap check
    checkSnapDuringDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    dragging = false;
    win.classList.remove('dragging');
    const zone = checkSnapDuringDrag(e.clientX, e.clientY);
    if (zone) {
      applySnap(win, zone);
      playBeep(600, 0.08);
    }
    hideSnapPreview();
  });

  // Touch support
  let touchStartX, touchStartY, touchStartLeft, touchStartTop, touching = false;

  handle.addEventListener('touchstart', (e) => {
    if (document.body.classList.contains('mobile-mode')) return;
    const touch = e.touches[0];
    touching = true;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartLeft = win.offsetLeft;
    touchStartTop = win.offsetTop;
    win.classList.add('dragging');
    bringToFront(id);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!touching) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    win.style.left = Math.max(-50, Math.min(window.innerWidth - 100, touchStartLeft + dx)) + 'px';
    win.style.top = Math.max(0, Math.min(window.innerHeight - 60, touchStartTop + dy)) + 'px';
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!touching) return;
    touching = false;
    win.classList.remove('dragging');
    const touch = e.changedTouches[0];
    const zone = checkSnapDuringDrag(touch.clientX, touch.clientY);
    if (zone) applySnap(win, zone);
    hideSnapPreview();
  });
}

function makeResizable(win, handle) {
  let startX, startY, startW, startH, resizing = false;

  handle.addEventListener('mousedown', (e) => {
    if (document.body.classList.contains('mobile-mode')) return;
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = win.offsetWidth;
    startH = win.offsetHeight;
    win.classList.add('resizing');
    win.classList.remove('snap-left', 'snap-right', 'snap-top', 'maximized');
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    win.style.width = Math.max(280, startW + (e.clientX - startX)) + 'px';
    win.style.height = Math.max(150, startH + (e.clientY - startY)) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (resizing) {
      resizing = false;
      win.classList.remove('resizing');
    }
  });
}

export function updateDockState() {
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.classList.toggle('active', !!windows[btn.dataset.open]);
  });
}

export function getFocusedId() {
  for (const [id, w] of Object.entries(windows)) {
    if (w.style.zIndex == zIndex) return id;
  }
  return null;
}

export { zIndex };
export function getZIndex() { return zIndex; }