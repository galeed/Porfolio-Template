import { playBeep } from './audio.js';
import { getZIndex } from './windows.js';

export function init2048(win) {
  const gridEl = win.querySelector('#game2048Grid');
  const overlay = win.querySelector('#game2048Overlay');
  const scoreEl = win.querySelector('#game2048Score');
  const highEl = win.querySelector('#game2048High');
  const finalEl = win.querySelector('#game2048FinalScore');
  const restartBtn = win.querySelector('#game2048Restart');

  let grid, score, high, gameOver;

  high = parseInt(localStorage.getItem('2048-high') || '0');
  highEl.textContent = high;

  function reset() {
    grid = Array.from({length: 4}, () => Array(4).fill(0));
    score = 0;
    gameOver = false;
    scoreEl.textContent = '0';
    overlay.style.display = 'none';
    spawnTile();
    spawnTile();
    draw();
  }

  function spawnTile() {
    const empty = [];
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        if (grid[r][c] === 0) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function draw() {
    gridEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement('div');
        cell.className = 'game2048-cell';
        const v = grid[r][c];
        if (v) {
          cell.textContent = v;
          cell.dataset.v = v;
        }
        gridEl.appendChild(cell);
      }
    }
  }

  function slide(row) {
    let arr = row.filter(v => v);
    let merged = [];
    let i = 0;
    while (i < arr.length) {
      if (arr[i] === arr[i + 1]) {
        merged.push(arr[i] * 2);
        score += arr[i] * 2;
        i += 2;
      } else {
        merged.push(arr[i]);
        i++;
      }
    }
    while (merged.length < 4) merged.push(0);
    return merged;
  }

  function move(dir) {
    if (gameOver) return;
    const before = JSON.stringify(grid);

    if (dir === 'left') {
      for (let r = 0; r < 4; r++) grid[r] = slide(grid[r]);
    } else if (dir === 'right') {
      for (let r = 0; r < 4; r++) grid[r] = slide(grid[r].slice().reverse()).reverse();
    } else if (dir === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
        const sl = slide(col);
        for (let r = 0; r < 4; r++) grid[r][c] = sl[r];
      }
    } else if (dir === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
        const sl = slide(col);
        for (let r = 0; r < 4; r++) grid[3 - r][c] = sl[r];
      }
    }

    if (JSON.stringify(grid) !== before) {
      spawnTile();
      scoreEl.textContent = score;
      draw();
      playBeep(600 + Math.random() * 400, 0.04);
      checkGameOver();
    }
  }

  function checkGameOver() {
    // ¿Alguna celda vacía?
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        if (grid[r][c] === 0) return;

    // ¿Algún movimiento posible?
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        if (c < 3 && grid[r][c] === grid[r][c+1]) return;
        if (r < 3 && grid[r][c] === grid[r+1][c]) return;
      }

    // GAME OVER
    gameOver = true;
    if (score > high) {
      high = score;
      localStorage.setItem('2048-high', high);
      highEl.textContent = high;
    }
    finalEl.textContent = score;
    overlay.style.display = 'flex';
    playBeep(220, 0.5);
  }

  const keyHandler = (e) => {
    if (win.style.zIndex != String(getZIndex())) return;
    if (e.key === 'ArrowLeft') { move('left'); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move('right'); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { move('up'); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { move('down'); e.preventDefault(); }
    else if (e.key === 'r' || e.key === 'R') { reset(); e.preventDefault(); }
  };

  document.addEventListener('keydown', keyHandler);
  restartBtn.addEventListener('click', reset);
  win._cleanup = () => document.removeEventListener('keydown', keyHandler);

  reset();
}