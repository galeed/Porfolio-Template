export function initMatrix() {
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  let width, height, columns, drops;
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fontSize = 14;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = Array(columns).fill(1);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(10, 14, 20, 0.08)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const r = Math.random();
      if (r > 0.98) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff9c';
      } else if (r > 0.9) {
        ctx.fillStyle = '#7ee787';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00ff9c';
      } else {
        ctx.fillStyle = 'rgba(0, 255, 156, 0.75)';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;
      if (y > height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 50);
}