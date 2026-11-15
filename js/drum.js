import { getAudioCtx, playDrum } from './audio.js';

const CHANNELS = ['Kick', 'Snare', 'HiHat', 'Clap'];
const CHANNEL_TYPES = ['kick', 'snare', 'hihat', 'clap'];
const STEPS = 16;

export const drumState = {
  grid: CHANNELS.map(() => Array(STEPS).fill(false)),
  playing: false,
  currentStep: 0,
  bpm: 120,
  timer: null,
};

const PRESETS = {
  basic: [
    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1],
  ],
  hiphop: [
    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
  ],
  techno: [
    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
  ],
};

function renderGrid(win) {
  const gridEl = win.querySelector('#drumGrid');
  if (!gridEl) return;
  gridEl.innerHTML = '';

  // Header de números de paso
  gridEl.appendChild(document.createElement('div'));
  for (let i = 0; i < STEPS; i++) {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:0.6rem;color:var(--text-muted);text-align:center;';
    lbl.textContent = (i % 4 === 0) ? (i / 4 + 1) : '·';
    gridEl.appendChild(lbl);
  }

  CHANNELS.forEach((name, ch) => {
    const label = document.createElement('div');
    label.className = 'drum-label';
    label.textContent = name;
    gridEl.appendChild(label);

    for (let s = 0; s < STEPS; s++) {
      const cell = document.createElement('div');
      cell.className = 'drum-step';
      if (drumState.grid[ch][s]) cell.classList.add('active');
      cell.dataset.ch = ch;
      cell.dataset.st = s;
      cell.addEventListener('click', () => {
        drumState.grid[ch][s] = !drumState.grid[ch][s];
        cell.classList.toggle('active', drumState.grid[ch][s]);
        if (drumState.grid[ch][s]) playDrum(CHANNEL_TYPES[ch]);
      });
      gridEl.appendChild(cell);
    }
  });
}

function highlightStep(win, step) {
  win.querySelectorAll('.drum-step').forEach(el => {
    el.classList.toggle('playing', parseInt(el.dataset.st) === step);
  });
}

function playStep(win) {
  const step = drumState.currentStep;
  highlightStep(win, step);

  CHANNELS.forEach((_, ch) => {
    if (drumState.grid[ch][step]) {
      playDrum(CHANNEL_TYPES[ch]);
    }
  });

  drumState.currentStep = (drumState.currentStep + 1) % STEPS;
}

export function buildDrumWindow(win) {
  drumState.currentStep = 0;

  // Setup UI
  renderGrid(win);

  const playBtn = win.querySelector('#drumPlay');
  const bpmInput = win.querySelector('#drumBpm');
  const bpmVal = win.querySelector('#drumBpmVal');
  const clearBtn = win.querySelector('#drumClear');

  playBtn.addEventListener('click', () => {
    drumState.playing = !drumState.playing;
    playBtn.classList.toggle('playing', drumState.playing);
    playBtn.textContent = drumState.playing ? '⏸ STOP' : '▶ PLAY';

    if (drumState.playing) {
      drumState.currentStep = 0;
      const interval = (60 / drumState.bpm) * 1000 / 4; // 16th notes
      drumState.timer = setInterval(() => playStep(win), interval);
    } else {
      if (drumState.timer) { clearInterval(drumState.timer); drumState.timer = null; }
      win.querySelectorAll('.drum-step').forEach(el => el.classList.remove('playing'));
    }
  });

  bpmInput.addEventListener('input', (e) => {
    drumState.bpm = parseInt(e.target.value);
    bpmVal.textContent = drumState.bpm;
    if (drumState.playing) {
      clearInterval(drumState.timer);
      const interval = (60 / drumState.bpm) * 1000 / 4;
      drumState.timer = setInterval(() => playStep(win), interval);
    }
  });

  clearBtn.addEventListener('click', () => {
    drumState.grid = CHANNELS.map(() => Array(STEPS).fill(false));
    renderGrid(win);
    if (drumState.playing) {
      // mantener highlight
    }
  });

  // Presets
  win.querySelectorAll('.drum-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = PRESETS[btn.dataset.preset];
      if (preset) {
        drumState.grid = preset.map(row => row.map(Boolean));
        renderGrid(win);
      }
    });
  });

  // Cleanup
  win._cleanup = () => {
    if (drumState.timer) clearInterval(drumState.timer);
    drumState.playing = false;
    drumState.timer = null;
  };
}