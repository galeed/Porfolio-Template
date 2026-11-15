const BOOT_LINES = [
  '[ OK ] Initializing Quantum-TUI v6.0...',
  '[ OK ] Loading kernel modules...',
  '[ OK ] Mounting /dev/matrix...',
  '[ OK ] Starting WebAudio subsystem...',
  '[ OK ] Spawning window manager (hyprland-style)...',
  '[ OK ] Loading portfolio data...',
  '[ OK ] Initializing game engines (snake, tetris, 2048)...',
  '[ OK ] Starting drum machine sequencer...',
  '[ OK ] System ready. Welcome, guest.',
];

export function runBoot() {
  const container = document.getElementById('bootLines');
  const progress = document.getElementById('bootProgress');
  const boot = document.getElementById('bootScreen');
  if (!boot) return Promise.resolve();

  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => {
          boot.classList.add('fade-out');
          setTimeout(() => { boot.remove(); resolve(); }, 700);
        }, 400);
        return;
      }
      const line = document.createElement('div');
      line.className = 'boot-line';
      line.innerHTML = BOOT_LINES[i].replace('[ OK ]', '<span class="ok">[ OK ]</span>');
      container.appendChild(line);
      progress.style.width = ((i + 1) / BOOT_LINES.length * 100) + '%';
      i++;
    }, 180);
  });
}
