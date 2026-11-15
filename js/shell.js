import { playKeySound } from './audio.js';

const SHELL_HISTORY = [];
let shellHistIndex = -1;

export function setupShellInput(input, handlers) {
  input.addEventListener('keydown', (e) => {
    playKeySound();
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (cmd) {
        SHELL_HISTORY.push(cmd);
        shellHistIndex = SHELL_HISTORY.length;
        shellExec(cmd, handlers);
      }
      input.value = '';
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (shellHistIndex > 0) { shellHistIndex--; input.value = SHELL_HISTORY[shellHistIndex] || ''; }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (shellHistIndex < SHELL_HISTORY.length - 1) {
        shellHistIndex++;
        input.value = SHELL_HISTORY[shellHistIndex] || '';
      } else {
        shellHistIndex = SHELL_HISTORY.length;
        input.value = '';
      }
    }
  });
}

function shellPrint(text, cls = '') {
  const out = document.getElementById('shellOutput');
  if (!out) return;
  const line = document.createElement('div');
  line.className = 'line-out ' + cls;
  line.textContent = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function shellExec(cmd, handlers) {
  shellPrint('guest@quantum-box:~$ ' + cmd, 'ok');
  const c = cmd.toLowerCase().split(' ')[0];
  const known = ['help','about','skills','collabs','system','shell','music','drum','snake','tetris','2048','clear','whoami','sound','exit','ls'];

  if (c === 'clear') {
    document.getElementById('shellOutput').innerHTML = '';
    return;
  }
  if (c === 'whoami') { shellPrint('guest@quantum-box — a curious visitor'); return; }
  if (c === 'ls') { shellPrint('about  skills  collabs  system  music  drum  snake  tetris  2048'); return; }
  if (c === 'sound') { handlers.onSound && handlers.onSound(); return; }
  if (c === 'exit') { handlers.onClose && handlers.onClose(); return; }
  if (c === 'help') {
    shellPrint('Commands: help, about, skills, collabs, system, shell, music, drum, snake, tetris, 2048, clear, whoami, sound, exit');
    return;
  }
  if (known.includes(c)) {
    handlers.onOpen && handlers.onOpen(c);
    shellPrint(`Launching ${c}...`);
    return;
  }
  shellPrint(`command not found: ${c}`, 'err');
}