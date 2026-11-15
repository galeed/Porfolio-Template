import { playBeep } from './audio.js';
import { getZIndex } from './windows.js';

export function initTetris(win) {
  const canvas = win.querySelector('#tetrisCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = win.querySelector('#tetrisOverlay');
  const scoreEl = win.querySelector('#tetrisScore');
  const linesEl = win.querySelector('#tetrisLines');
  const finalEl = win.querySelector('#tetrisFinalScore');
  const restartBtn = win.querySelector('#tetrisRestart');

  const COLS = 12, ROWS = 24;
  const CELL = canvas.width / COLS;

  const SHAPES = [
    { shape: [[1,1,1,1]], color: '#00ff9c' },
    { shape: [[1,1],[1,1]], color: '#ffd580' },
    { shape: [[0,1,0],[1,1,1]], color: '#ff79c6' },
    { shape: [[1,0,0],[1,1,1]], color: '#39d0d8' },
    { shape: [[0,0,1],[1,1,1]], color: '#ffb86c' },
    { shape: [[0,1,1],[1,1,0]], color: '#7ee787' },
    { shape: [[1,1,0],[0,1,1]], color: '#ff5555' },
  ];

  let board, current, pos, gameLoop, paused, score, lines;

  function reset() {
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    score = 0; lines = 0;
    scoreEl.textContent = '0';
    linesEl.textContent = '0';
    overlay.style.display = 'none';
    paused = false;
    spawnPiece();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, 500);
  }

  function spawnPiece() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    current = SHAPES[idx];
    pos = { x: Math.floor(COLS/2) - Math.ceil(current.shape[0].length/2), y: 0 };
    if (collides(pos.x, pos.y, current.shape)) gameOver();
  }

  function collides(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = x + c, ny = y + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
    return false;
  }

  function merge() {
    current.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val && pos.y + r >= 0) board[pos.y + r][pos.x + c] = current.color;
      });
    });
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        cleared++; r++;
      }
    }
    if (cleared) {
      lines += cleared;
      score += cleared * 100;
      scoreEl.textContent = score;
      linesEl.textContent = lines;
      playBeep(660 + cleared * 100, 0.15);
    }
  }

  function tick() {
    if (paused) return;
    if (!collides(pos.x, pos.y + 1, current.shape)) pos.y++;
    else { merge(); clearLines(); spawnPiece(); }
    draw();
  }

  function rotate() {
    const rotated = current.shape[0].map((_, i) => current.shape.map(row => row[i]).reverse());
    if (!collides(pos.x, pos.y, rotated)) current.shape = rotated;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,255,156,0.05)';
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,canvas.height); ctx.stroke(); }
    for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(canvas.width,i*CELL); ctx.stroke(); }
    board.forEach((row, r) => row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = cell;
        ctx.shadowBlur = 8; ctx.shadowColor = cell;
        ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
      }
    }));
    current.shape.forEach((row, r) => row.forEach((val, c) => {
      if (val) {
        ctx.fillStyle = current.color;
        ctx.shadowBlur = 10; ctx.shadowColor = current.color;
        ctx.fillRect((pos.x+c)*CELL+1, (pos.y+r)*CELL+1, CELL-2, CELL-2);
      }
    }));
    ctx.shadowBlur = 0;
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffd580';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
    }
  }

  function gameOver() {
    clearInterval(gameLoop);
    finalEl.textContent = score;
    overlay.style.display = 'flex';
    playBeep(220, 0.4);
  }

  const keyHandler = (e) => {
    if (win.style.zIndex != String(getZIndex())) return;
    if (e.key === 'ArrowLeft' && !collides(pos.x-1, pos.y, current.shape)) { pos.x--; draw(); e.preventDefault(); }
    else if (e.key === 'ArrowRight' && !collides(pos.x+1, pos.y, current.shape)) { pos.x++; draw(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { tick(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { rotate(); draw(); e.preventDefault(); }
    else if (e.key === ' ') {
      while (!collides(pos.x, pos.y+1, current.shape)) pos.y++;
      tick(); e.preventDefault();
    }
    else if (e.key === 'p' || e.key === 'P') { paused = !paused; draw(); e.preventDefault(); }
  };

  document.addEventListener('keydown', keyHandler);
  restartBtn.addEventListener('click', reset);
  win._cleanup = () => {
    clearInterval(gameLoop);
    document.removeEventListener('keydown', keyHandler);
  };
  reset();
}