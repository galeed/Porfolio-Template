import { playBeep } from './audio.js';
import { getZIndex, windows } from './windows.js';

export function initSnake(win) {
  const canvas = win.querySelector('#snakeCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = win.querySelector('#snakeOverlay');
  const scoreEl = win.querySelector('#snakeScore');
  const highEl = win.querySelector('#snakeHigh');
  const finalEl = win.querySelector('#snakeFinalScore');
  const restartBtn = win.querySelector('#snakeRestart');

  const CELL = 20;
  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;

  let snake, dir, nextDir, food, score, running, gameLoop, paused, high;
  high = parseInt(localStorage.getItem('snake-high') || '0');
  highEl.textContent = high;

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0; running = true; paused = false;
    scoreEl.textContent = '0';
    overlay.style.display = 'none';
    spawnFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, 110);
  }

  function spawnFood() {
    do {
      food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function tick() {
    if (!running || paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver(); return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; scoreEl.textContent = score;
      playBeep(880, 0.08);
      spawnFood();
    } else snake.pop();
    draw();
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,255,156,0.05)';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,canvas.height); ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(canvas.width,i*CELL); ctx.stroke();
    }
    ctx.fillStyle = '#ff79c6';
    ctx.shadowBlur = 15; ctx.shadowColor = '#ff79c6';
    ctx.fillRect(food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4);
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#00ff9c' : '#7ee787';
      ctx.shadowBlur = i === 0 ? 15 : 8;
      ctx.shadowColor = '#00ff9c';
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    });
    ctx.shadowBlur = 0;
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffd580';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
    }
  }

  function gameOver() {
    running = false;
    clearInterval(gameLoop);
    if (score > high) {
      high = score;
      localStorage.setItem('snake-high', high);
      highEl.textContent = high;
    }
    finalEl.textContent = score;
    overlay.style.display = 'flex';
    playBeep(220, 0.4);
  }

  const keyHandler = (e) => {
    if (win.style.zIndex != String(getZIndex())) return;
    if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
    else if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
    else if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
    else if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
    else if (e.key === ' ') { paused = !paused; e.preventDefault(); }
    else return;
    e.preventDefault();
  };

  document.addEventListener('keydown', keyHandler);
  restartBtn.addEventListener('click', reset);
  win._cleanup = () => {
    clearInterval(gameLoop);
    document.removeEventListener('keydown', keyHandler);
  };
  reset();
}