const STORAGE_KEY = 'tui-mobile-mode';

export function initMobileMode() {
  const btn = document.getElementById('modeToggle');
  const saved = localStorage.getItem(STORAGE_KEY);

  // Detección automática inicial (solo si no hay preferencia guardada)
  let isMobile;
  if (saved !== null) {
    isMobile = saved === 'true';
  } else {
    isMobile = window.matchMedia('(max-width: 768px)').matches;
  }

  document.body.classList.toggle('mobile-mode', isMobile);
  updateToggleBtn(isMobile);

  btn.addEventListener('click', () => {
    isMobile = !document.body.classList.contains('mobile-mode');
    document.body.classList.toggle('mobile-mode', isMobile);
    localStorage.setItem(STORAGE_KEY, String(isMobile));
    updateToggleBtn(isMobile);
  });

  // Escape para PC mode desde overlay
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      btn.click();
    }
  });
}

function updateToggleBtn(isMobile) {
  const btn = document.getElementById('modeToggle');
  btn.textContent = isMobile ? '🖥' : '📱';
  btn.title = isMobile ? 'Cambiar a modo PC' : 'Cambiar a modo móvil';
}