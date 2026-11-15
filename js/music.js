import { getAudioCtx } from './audio.js';

export const PLAYLIST = [
  { name: 'Neon Drift', artist: 'Aetheria Audio Labs', dur: 32, freq: 220 },
  { name: 'Quantum Pulse', artist: 'KernelAI Sound', dur: 28, freq: 261.63 },
  { name: 'Edge Runner', artist: 'HyperEdge Records', dur: 36, freq: 329.63 },
  { name: 'Terminal Dreams', artist: 'TUI Collective', dur: 30, freq: 196 },
];

export const musicState = {
  playing: false,
  currentIndex: 0,
  startTime: 0,
  elapsed: 0,
  interval: null,
  ticker: null,
  vizInterval: null,
};

export function updateMusicUI() {
  const t = PLAYLIST[musicState.currentIndex];
  const nameEl = document.getElementById('musicName');
  const artistEl = document.getElementById('musicArtist');
  const durEl = document.getElementById('musicDur');
  const playBtn = document.getElementById('musicPlay');
  if (!nameEl) return;
  nameEl.textContent = t.name;
  artistEl.textContent = t.artist;
  durEl.textContent = '0:' + String(t.dur).padStart(2, '0');
  playBtn.textContent = musicState.playing ? '⏸' : '▶';
  document.querySelectorAll('.music-track').forEach((el, i) => {
    el.classList.toggle('active', i === musicState.currentIndex);
  });
}

export function startMusic() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const t = PLAYLIST[musicState.currentIndex];
    musicState.playing = true;
    musicState.startTime = Date.now();
    musicState.elapsed = 0;

    const base = t.freq;
    const pattern = [1, 1.25, 1.5, 2, 1.5, 1.25, 1, 0.75];
    let noteIndex = 0;

    musicState.interval = setInterval(() => {
      if (!musicState.playing) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base * pattern[noteIndex % pattern.length];
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
      noteIndex++;

      if (noteIndex % 4 === 0) {
        const sub = ctx.createOscillator();
        const sg = ctx.createGain();
        sub.type = 'triangle';
        sub.frequency.value = base / 2;
        sg.gain.setValueAtTime(0.05, ctx.currentTime);
        sg.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        sub.connect(sg); sg.connect(ctx.destination);
        sub.start(); sub.stop(ctx.currentTime + 0.6);
      }
    }, 280);

    musicState.ticker = setInterval(() => {
      if (!musicState.playing) return;
      musicState.elapsed = (Date.now() - musicState.startTime) / 1000;
      const pct = (musicState.elapsed / t.dur) * 100;
      const bar = document.getElementById('musicProgress');
      const elEl = document.getElementById('musicElapsed');
      if (bar) bar.style.width = Math.min(100, pct) + '%';
      if (elEl) {
        const m = Math.floor(musicState.elapsed / 60);
        const s = Math.floor(musicState.elapsed % 60);
        elEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
      }
      if (musicState.elapsed >= t.dur) changeTrack(1);
    }, 100);
  } catch (e) { console.error(e); }
}

export function stopMusic() {
  musicState.playing = false;
  if (musicState.interval) { clearInterval(musicState.interval); musicState.interval = null; }
  if (musicState.ticker) { clearInterval(musicState.ticker); musicState.ticker = null; }
  if (musicState.vizInterval) { clearInterval(musicState.vizInterval); musicState.vizInterval = null; }
  updateMusicUI();
  updateDockMusicState();
}

export function toggleMusic() {
  if (musicState.playing) stopMusic();
  else startMusic();
  updateMusicUI();
  updateDockMusicState();
}

export function changeTrack(dir) {
  musicState.currentIndex = (musicState.currentIndex + dir + PLAYLIST.length) % PLAYLIST.length;
  if (musicState.playing) { stopMusic(); startMusic(); }
  updateMusicUI();
}

export function startMusicViz(win) {
  const bars = win.querySelectorAll('.music-viz span');
  if (!bars.length) return;
  if (musicState.vizInterval) clearInterval(musicState.vizInterval);
  musicState.vizInterval = setInterval(() => {
    bars.forEach(bar => {
      const h = musicState.playing ? 4 + Math.random() * 46 : 4;
      bar.style.height = h + 'px';
    });
  }, 90);
}

export function updateDockMusicState() {
  const btn = document.querySelector('[data-open="music"]');
  if (btn) btn.classList.toggle('music-playing', musicState.playing);
}