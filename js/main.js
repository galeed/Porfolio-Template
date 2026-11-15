import { initMatrix } from './matrix.js';
import { runBoot } from './boot.js';
import { createWindow, windows, closeWindow, getFocusedId } from './windows.js';
import { initSnap } from './snap.js';
import { getAudioCtx, playBeep, toggleSound } from './audio.js';
import { setupShellInput } from './shell.js';
import {
  PLAYLIST, musicState, updateMusicUI, startMusicViz, toggleMusic, changeTrack
} from './music.js';
import { buildDrumWindow } from './drum.js';
import { initSnake } from './snake.js';
import { initTetris } from './tetris.js';
import { init2048 } from './game2048.js';
import { initMobileMode } from './mobile.js';

/* ============ SKILLS DATA ============ */
const SKILLS = {
  lang: [
    ['TypeScript / JavaScript', '7 yrs', 95, 'EXPERT'],
    ['Rust', '4 yrs', 85, 'ADVANCED'],
    ['Go (Golang)', '3 yrs', 80, 'ADVANCED'],
    ['HTML5 / CSS3 / Tailwind', '7 yrs', 95, 'EXPERT'],
    ['Python', '5 yrs', 88, 'PRO'],
    ['SQL & NoSQL', '6 yrs', 90, 'PRO'],
  ],
  front: [
    ['Astro.js', '3 yrs', 95, 'EXPERT'],
    ['React / Next.js', '6 yrs', 92, 'PRO'],
    ['Tailwind CSS v4', '4 yrs', 95, 'EXPERT'],
    ['Node.js / Hono / Express', '6 yrs', 90, 'PRO'],
    ['Vue / Nuxt', '3 yrs', 80, 'ADVANCED'],
    ['WebAssembly (Wasm)', '2 yrs', 75, 'INTERMEDIATE'],
  ],
  devops: [
    ['Docker / Containerization', '5 yrs', 88, 'PRO'],
    ['Kubernetes & Helm', '3 yrs', 80, 'ADVANCED'],
    ['Linux Admin & Bash', '6 yrs', 92, 'PRO'],
    ['PostgreSQL & Redis', '5 yrs', 90, 'PRO'],
    ['CI/CD GitHub Actions', '5 yrs', 88, 'PRO'],
    ['Cloudflare Edge Workers', '4 yrs', 85, 'ADVANCED'],
  ],
  web3: [
    ['Solidity', '2 yrs', 75, 'INTERMEDIATE'],
    ['EVM', '3 yrs', 80, 'ADVANCED'],
    ['Hardhat', '4 yrs', 85, 'PRO'],
    ['Truffle', '3 yrs', 80, 'ADVANCED'],
    ['Ethers.js', '5 yrs', 90, 'PRO'],
    ['Web3.js', '4 yrs', 85, 'PRO'],
  ],
};

/* ============ BUILDERS ============ */
function buildSkillsHTML() {
  const renderList = (list) => list.map(([name, years, pct, level]) => `
    <div class="skill" data-level="${pct}%">
      <div class="skill-header">
        <span class="skill-name">${name}</span>
        <span class="skill-years">${years}</span>
      </div>
      <div class="skill-bar-css"></div>
      <div class="skill-bar-footer">
        <span class="skill-percent">${pct}%</span>
        <span class="skill-level">${level}</span>
      </div>
    </div>
  `).join('');
  return `
    <div class="skill-category">⚡ Core Languages</div>${renderList(SKILLS.lang)}
    <div class="skill-category">🌐 Frameworks & Frontend</div>${renderList(SKILLS.front)}
    <div class="skill-category">☁️ DevOps, Cloud & Architecture</div>${renderList(SKILLS.devops)}
    <div class="skill-category">🔗 Web3 & Blockchain</div>${renderList(SKILLS.web3)}
  `;
}

let uptimeStart = Date.now() - (42 * 24 * 60 + 13 * 60 + 37) * 60 * 1000;
function updateUptime() {
  const el = document.getElementById('uptimeDisplay');
  if (!el) return;
  const diff = Date.now() - uptimeStart;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  el.textContent = `${d} days, ${h} hours, ${m} mins`;
}

/* ============ BUILDERS ============ */
const BUILDERS = {
  system: () => {
    const body = `
      <h2 class="command-title">SYSTEM INFO v2.4</h2>
      <pre class="ascii-art small magenta"> _   _ ___ _____ ___ ___  _   _ 
| | | |_ _|_   _/ __| _ \\| | | |
| |_| || |  | || (__|   /| |_| |
 \\___/|___| |_| \\___|_|_\\ \\___/ </pre>
      <dl class="system-info">
        <dt>OS</dt><dd>Arch Linux x86_64 / macOS Darwin</dd>
        <dt>Kernel</dt><dd>6.10.8-zen1-1-zen</dd>
        <dt>Uptime</dt><dd id="uptimeDisplay">calculating...</dd>
        <dt>Shell</dt><dd>zsh 5.9</dd>
        <dt>WM/DE</dt><dd>i3-gaps / yabai</dd>
        <dt>Editor</dt><dd>Neovim (NVChad) / VS Code</dd>
        <dt>CPU</dt><dd>Apple M3 Max (16 cores)</dd>
        <dt>Memory</dt><dd>24.5GiB / 64.0GiB</dd>
        <dt>Palette</dt>
        <dd class="palette-swatches">
          <span class="swatch" style="background:#00ff9c" data-color="#00ff9c"></span>
          <span class="swatch" style="background:#7ee787" data-color="#7ee787"></span>
          <span class="swatch" style="background:#39d0d8" data-color="#39d0d8"></span>
          <span class="swatch" style="background:#ff79c6" data-color="#ff79c6"></span>
          <span class="swatch" style="background:#ffd580" data-color="#ffd580"></span>
          <span class="swatch" style="background:#ffb86c" data-color="#ffb86c"></span>
          <span class="swatch" style="background:#ff5555" data-color="#ff5555"></span>
        </dd>
      </dl>
      <div class="open-badge">OPEN FOR COLLABORATIONS & CONTRACTS</div>
    `;
    const win = createWindow({ id: 'system', title: 'root@quantum-box: ~/system', width: 560, height: 520, body });
    updateUptime();
    return win;
  },

  about: () => createWindow({
    id: 'about', title: 'alex@quantum-box: ~/about', width: 520, height: 380,
    x: 120, y: 100,
    body: `
      <h2 class="command-title">CAT BIO.TXT // ABOUT ME</h2>
      <span class="section-tag active">[READ-ONLY]</span>
      <p class="bio-text" style="margin-top:12px;">
        Passionate systems & web engineer with <strong style="color:var(--text-primary)">7+ years</strong> of experience building high-throughput edge systems, interactive web applications, and developer tools. Active open-source contributor and collaborative team player.
      </p>
      <div class="quote">"Code is like humor. When you have to explain it, it's bad." — Cory House</div>
      <div class="meta-row">
        <div><strong>Focus:</strong> Systems Architecture, Edge Systems & Web Performance</div>
        <div><strong>Location:</strong> 📍 San Francisco, CA // UTC-7</div>
      </div>
      <div class="open-badge">OPEN FOR COLLABORATIONS & CONTRACTS</div>
    `
  }),

  skills: () => {
    const win = createWindow({
      id: 'skills', title: 'alex@quantum-box: ~/skills', width: 520, height: 560, x: 200, y: 80,
      body: `<h2 class="command-title">./SKILLS.SH</h2><span class="section-tag active">[PROFICIENCY METRICS]</span>${buildSkillsHTML()}`
    });
    setTimeout(() => {
      win.querySelectorAll('.skill').forEach(s => {
        s.style.setProperty('--level', s.dataset.level);
        s.classList.add('animate');
      });
    }, 100);
    return win;
  },

  collabs: () => {
    const body = `
      <h2 class="command-title">CAT COLLABS.MD</h2>
      <span class="section-tag active">[PARTNERSHIPS]</span>
      <div class="project-card" style="margin-top:12px;">
        <div class="project-title">🤝 Distributed Edge Cache Protocol (v2.0)</div>
        <div class="project-ascii">+--------------------+
| HYPEREDGE PROTOCOL |
| [STATUS: ACTIVE]   |
+--------------------+</div>
        <div class="project-meta">
          <span>Partner: HyperEdge Foundation</span>
          <span class="role">Lead Protocol Architect</span>
          <span class="date">2024 - PRESENT</span>
        </div>
        <p class="project-description">Open-source ultra-low latency distributed edge cache protocol for multi-region serverless runtimes.</p>
        <ul class="project-list">
          <li>Architected lock-free data structures in Rust, reducing memory 35%.</li>
          <li>Co-authored RFC specs for async P2P buffer sync over QUIC.</li>
          <li>Mentored 12+ open-source contributors.</li>
        </ul>
        <div class="tech-tags">
          <span class="tech-tag">Rust</span><span class="tech-tag">Tokio</span>
          <span class="tech-tag">QUIC</span><span class="tech-tag">WebAssembly</span>
        </div>
      </div>
      <div class="project-card">
        <div class="project-title">🤝 Browser WebAudio DSP Sequencer</div>
        <div class="project-ascii"> /\\_/\\   AETHERIA
( o.o ) [AUDIO LABS]
 > ^ <  ♪ ♫ ♩ ♬</div>
        <div class="project-meta">
          <span>Partner: Aetheria Audio Labs</span>
          <span class="role">Senior Frontend & Audio</span>
          <span class="date">2023 - 2024</span>
        </div>
        <p class="project-description">Browser-based polyphonic synthesizer engine powered by Astro.js and WebAudio Worklets.</p>
        <ul class="project-list">
          <li>Real-time audio wave visualization with HTML5 Canvas & WebGL shaders.</li>
          <li>Optimized audio buffer latency to sub-5ms.</li>
          <li>Responsive TUI modular controls with Tailwind CSS.</li>
        </ul>
        <div class="tech-tags">
          <span class="tech-tag">Astro.js</span><span class="tech-tag">TypeScript</span>
          <span class="tech-tag">WebAudio API</span><span class="tech-tag">Canvas</span>
        </div>
      </div>
      <div class="project-card">
        <div class="project-title">🤝 Context-Aware Terminal AI Co-Pilot</div>
        <div class="project-ascii">[KERNEL-AI COLLAB]
Intent    --> [Local LLM]
Execution --> bash -c</div>
        <div class="project-meta">
          <span>Partner: KernelAI Research</span>
          <span class="role">Core Systems</span>
          <span class="date">2023 - PRESENT</span>
        </div>
        <p class="project-description">Lightweight, privacy-focused CLI co-pilot that translates intent to verified shell commands.</p>
        <ul class="project-list">
          <li>Local LLM token streaming pipeline via IPC sockets.</li>
          <li>Strict command validation sandboxing for dangerous shell commands.</li>
        </ul>
        <div class="tech-tags">
          <span class="tech-tag">Node.js</span><span class="tech-tag">TypeScript</span>
          <span class="tech-tag">Ollama API</span><span class="tech-tag">Inquirer.js</span>
        </div>
      </div>
    `;
    return createWindow({ id: 'collabs', title: 'alex@quantum-box: ~/collabs', width: 560, height: 560, body, x: 280, y: 120 });
  },

  shell: () => {
    const footer = `
      <div class="terminal-input-bar">
        <span class="prompt-static">guest@quantum-box:~$</span>
        <input type="text" id="shellInput" placeholder="type 'help'..." autocomplete="off" spellcheck="false">
      </div>
    `;
    const body = `
      <div class="terminal-output" id="shellOutput">
        <div class="line-out ok">Quantum-TUI Shell v6.0 — type 'help' for commands</div>
      </div>
    `;
    const win = createWindow({ id: 'shell', title: 'shell — guest@quantum-box', width: 600, height: 400, body, footer, x: 340, y: 160 });
    setTimeout(() => {
      const input = document.getElementById('shellInput');
      if (input) {
        input.focus();
        setupShellInput(input, {
          onOpen: (cmd) => {
            if (BUILDERS[cmd]) BUILDERS[cmd]();
          },
          onClose: () => closeWindow('shell'),
          onSound: () => {
            const on = toggleSound();
            const out = document.getElementById('shellOutput');
            const line = document.createElement('div');
            line.className = 'line-out';
            line.textContent = on ? '🔊 Sound enabled' : '🔇 Sound disabled';
            out.appendChild(line);
          }
        });
      }
    }, 50);
    return win;
  },

  music: () => {
    const body = `
      <div class="music-display">
        <div class="music-track-name" id="musicName">Neon Drift</div>
        <div class="music-track-artist" id="musicArtist">Aetheria Audio Labs</div>
        <div class="music-viz" id="musicViz">
          ${Array.from({length: 20}, () => '<span></span>').join('')}
        </div>
        <div class="music-progress"><div class="music-progress-bar" id="musicProgress"></div></div>
        <div class="music-time">
          <span id="musicElapsed">0:00</span>
          <span id="musicDur">0:32</span>
        </div>
      </div>
      <div class="music-controls">
        <button class="music-btn" id="musicPrev">⏮</button>
        <button class="music-btn play" id="musicPlay">▶</button>
        <button class="music-btn" id="musicNext">⏭</button>
      </div>
      <div class="music-playlist" id="musicPlaylist">
        ${PLAYLIST.map((t, i) => `
          <div class="music-track ${i === 0 ? 'active' : ''}" data-index="${i}">
            <span>${t.name}</span>
            <span class="dur">0:${String(t.dur).padStart(2, '0')}</span>
          </div>
        `).join('')}
      </div>
    `;
    const win = createWindow({ id: 'music', title: '🎵 terminal-music-player', width: 380, height: 420, body, x: 420, y: 200, className: 'music-window' });
    win.querySelector('#musicPlay').addEventListener('click', () => toggleMusic(win));
    win.querySelector('#musicPrev').addEventListener('click', () => changeTrack(-1));
    win.querySelector('#musicNext').addEventListener('click', () => changeTrack(1));
    win.querySelectorAll('.music-track').forEach(el => {
      el.addEventListener('click', () => {
        musicState.currentIndex = parseInt(el.dataset.index);
        if (musicState.playing) { stopMusicGlobal(); startMusicGlobal(); }
        else updateMusicUI();
      });
    });
    win._cleanup = () => {
      // no detener música al cerrar, pero desligar viz
      if (musicState.vizInterval) clearInterval(musicState.vizInterval);
    };
    startMusicViz(win);
    updateMusicUI();
    return win;
  },

  drum: () => {
    const body = `
      <h2 class="command-title">🥁 DRUM MACHINE // 16-STEP SEQUENCER</h2>
      <div class="drum-grid" id="drumGrid"></div>
      <div class="drum-controls">
        <div style="display:flex;gap:8px;">
          <button class="drum-btn play" id="drumPlay">▶ PLAY</button>
          <button class="drum-btn" id="drumClear">CLEAR</button>
        </div>
        <div class="drum-tempo">
          <span>BPM</span>
          <input type="range" id="drumBpm" min="60" max="180" value="120">
          <span class="bpm-val" id="drumBpmVal">120</span>
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">
        <button class="drum-preset" data-preset="basic">Basic</button>
        <button class="drum-preset" data-preset="hiphop">Hip-Hop</button>
        <button class="drum-preset" data-preset="techno">Techno</button>
      </div>
    `;
    const win = createWindow({ id: 'drum', title: '🥁 drum-machine-16step', width: 640, height: 400, body, x: 500, y: 100, className: 'drum-window' });
    setTimeout(() => buildDrumWindow(win), 50);
    return win;
  },

  snake: () => {
    const body = `
      <div class="game-header-bar">
        <span>Score: <span class="game-score" id="snakeScore">0</span></span>
        <span>High: <span class="game-highscore" id="snakeHigh">0</span></span>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="snakeCanvas" width="400" height="400"></canvas>
        <div class="game-overlay" id="snakeOverlay" style="display:none;">
          <h3>GAME OVER</h3>
          <p>Score: <span id="snakeFinalScore">0</span></p>
          <button class="btn" id="snakeRestart">Restart</button>
        </div>
      </div>
      <div class="game-controls-info">
        <span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> move</span>
        <span><kbd>Space</kbd> pause</span>
      </div>
    `;
    const win = createWindow({ id: 'snake', title: '🐍 snake.exe', width: 440, height: 520, body, x: 500, y: 60, className: 'game-window' });
    setTimeout(() => initSnake(win), 50);
    return win;
  },

  tetris: () => {
    const body = `
      <div class="game-header-bar">
        <span>Score: <span class="game-score" id="tetrisScore">0</span></span>
        <span>Lines: <span class="game-highscore" id="tetrisLines">0</span></span>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="tetrisCanvas" width="240" height="480"></canvas>
        <div class="game-overlay" id="tetrisOverlay" style="display:none;">
          <h3>GAME OVER</h3>
          <p>Score: <span id="tetrisFinalScore">0</span></p>
          <button class="btn" id="tetrisRestart">Restart</button>
        </div>
      </div>
      <div class="game-controls-info">
        <span><kbd>←</kbd><kbd>→</kbd> move</span>
        <span><kbd>↑</kbd> rotate</span>
        <span><kbd>Space</kbd> drop</span>
      </div>
    `;
    const win = createWindow({ id: 'tetris', title: '🧱 tetris.exe', width: 320, height: 620, body, x: 720, y: 40, className: 'game-window' });
    setTimeout(() => initTetris(win), 50);
    return win;
  },

  '2048': () => {
    const body = `
      <div class="game-header-bar">
        <span>Score: <span class="game-score" id="game2048Score">0</span></span>
        <span>High: <span class="game-highscore" id="game2048High">0</span></span>
      </div>
      <div class="game-canvas-wrap">
        <div class="game2048-grid" id="game2048Grid"></div>
        <div class="game-overlay" id="game2048Overlay" style="display:none;">
          <h3>GAME OVER</h3>
          <p>Score: <span id="game2048FinalScore">0</span></p>
          <button class="btn" id="game2048Restart">Restart</button>
        </div>
      </div>
      <div class="game-controls-info">
        <span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> move</span>
        <span><kbd>R</kbd> restart</span>
      </div>
    `;
    const win = createWindow({ id: '2048', title: '🔢 2048.exe', width: 380, height: 520, body, x: 300, y: 100, className: 'game-window' });
    setTimeout(() => init2048(win), 50);
    return win;
  },
};

/* Importar funciones de música que necesito exponer */
import { stopMusic as stopMusicGlobal, startMusic as startMusicGlobal } from './music.js';

/* ============ DOCK & GLOBAL ============ */
function initDock() {
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.open;
      playBeep(700, 0.05);
      if (windows[type]) {
        if (windows[type].classList.contains('minimized')) {
          windows[type].classList.remove('minimized');
        }
        import('./windows.js').then(m => m.bringToFront(type));
      } else if (BUILDERS[type]) {
        BUILDERS[type]();
      }
    });
  });
}

/* ============ HELP ============ */
window.openHelp = () => document.getElementById('helpOverlay').classList.add('open');
window.closeHelp = () => document.getElementById('helpOverlay').classList.remove('open');

/* ============ BOOT ============ */
async function init() {
  initMatrix();
  initSnap();
  initMobileMode();

  await runBoot();

  // Ventanas iniciales
  BUILDERS.system();
  setTimeout(() => BUILDERS.about(), 200);
  setTimeout(() => BUILDERS.skills(), 400);

  initDock();

  // Desbloqueo audio
  document.addEventListener('click', () => { getAudioCtx().resume(); }, { once: true });

  // Atajos
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') { e.preventDefault(); BUILDERS.shell(); }
    if (e.key === 'Escape') window.closeHelp();
  });

  // Uptime
  setInterval(updateUptime, 30000);
}

init();