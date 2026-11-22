// Ember Court — keyboard and mouse. Clicks a card to play it, keys 1–5 do
// the same, Enter starts, H holds, R restarts after a duel ends.
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { playCard, holdTurn, startGame, SCREEN_TITLE, SCREEN_WIN, SCREEN_LOSS } from './game.js';
import { playerCardRects } from './render.js';

/** Scale a pointer event into the canvas's 1280x800 coordinate space. */
function toCanvas(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

export function attachInput(canvas, state) {
  canvas.addEventListener('mousemove', (event) => {
    const point = toCanvas(canvas, event);
    state.hoverIndex = -1;
    for (const rect of playerCardRects(state)) {
      if (point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) {
        state.hoverIndex = rect.index;
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    state.hoverIndex = -1;
  });

  canvas.addEventListener('click', (event) => {
    if (state.screen === SCREEN_TITLE) {
      startGame(state);
      return;
    }
    if (state.screen === SCREEN_WIN || state.screen === SCREEN_LOSS) {
      startGame(state);
      return;
    }
    const point = toCanvas(canvas, event);
    // The Hold button, bottom right.
    if (point.x >= 1080 && point.x <= 1240 && point.y >= 700 && point.y <= 744) {
      holdTurn(state);
      return;
    }
    // A card in the player's hand, topmost first.
    const rects = playerCardRects(state);
    for (let i = rects.length - 1; i >= 0; i -= 1) {
      const rect = rects[i];
      if (point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) {
        playCard(state, rect.index);
        return;
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (state.screen === SCREEN_TITLE && (event.key === 'Enter' || event.key === ' ')) {
      startGame(state);
      return;
    }
    if ((state.screen === SCREEN_WIN || state.screen === SCREEN_LOSS) && (event.key === 'r' || event.key === 'R' || event.key === 'Enter')) {
      startGame(state);
      return;
    }
    if (state.screen !== 'play') return;
    if (event.key >= '1' && event.key <= '5') {
      playCard(state, Number(event.key) - 1);
    } else if (event.key === 'h' || event.key === 'H') {
      holdTurn(state);
    } else if (event.key === 'r' || event.key === 'R') {
      startGame(state);
    }
  });
}
