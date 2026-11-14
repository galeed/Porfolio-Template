# 🖥️ Quantum-TUI Portfolio v6.0

Portfolio interactivo con estética de terminal retro (TUI), inspirado en Hyprland y con múltiples utilidades: juegos, música, drum machine y multi-ventanas arrastrables con snap.

## ✨ Features

- **Multi-ventana arrastrable** con snap estilo Hyprland
- **Matrix rain** animado de fondo
- **3 juegos**: Snake, Tetris, 2048
- **Reproductor de música** sintetizado con WebAudio
- **Drum machine** de 16 pasos con 4 canales
- **Shell interactiva** con comandos
- **Boot screen** cinematográfico
- **Responsive**: botón toggle móvil/PC
- **Sonido de tecleo** sintetizado (desactivable)
- **Efectos CRT**: scanlines, viñeta, glow neón

## 🎮 Controles

### Ventanas
- **Arrastrar**: barra de título
- **Redimensionar**: esquina inferior derecha
- **Snap**: arrastra a los bordes (izq/der/arriba) para acoplar
- **Cerrar/Minimizar/Maximizar**: botones de la barra
- **Foco**: click en cualquier parte de la ventana

### Juegos
| Juego | Controles |
|-------|-----------|
| Snake | `↑↓←→` mover, `Space` pausa |
| Tetris | `←→` mover, `↑` rotar, `↓` soft drop, `Space` hard drop, `P` pausa |
| 2048 | `↑↓←→` mover, `R` reiniciar |

### Atajos globales
- `Ctrl+K` → Shell
- `ESC` → cerrar overlays
- `Ctrl+M` → toggle modo móvil/PC

## 🛠️ Instalación

```bash
# Clonar o descargar
git clone <repo>
cd portfolio-tui

# Servir localmente (recomendado por módulos ES)
python -m http.server 8000
# o
npx serve