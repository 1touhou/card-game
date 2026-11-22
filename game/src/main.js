// Ember Court — bootstrap: reads ?shot= and ?seed=, runs the fixed-step loop,
// and exposes window.__card so a playtest can drive the real game.
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { createGame, update, playCard, holdTurn, startGame, forceWin, forceLoss } from './game.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '1') || 1;
const shot = params.get('shot');

const state = createGame(seed);
state.hoverIndex = -1;
state.now = 0;

if (shot) {
  // A posed screenshot: stage the exact state, then draw it once and stop.
  // The frame is a real render of the game's own code, nothing faked.
  stageShot(shot, state);
  render(ctx, state);
} else {
  attachInput(canvas, state);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(100, now - last);
    last = now;
    update(state, dt);
    render(ctx, state);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// The debug handle the playtest uses: read the board, play cards, force ends.
window.__card = {
  get screen() { return state.screen; },
  get turn() { return state.turn; },
  get phase() { return state.phase; },
  get round() { return state.round; },
  get playerLife() { return state.player.life; },
  get enemyLife() { return state.enemy.life; },
  get playerShield() { return state.player.shield; },
  get enemyShield() { return state.enemy.shield; },
  get playerHand() { return state.player.hand.map((c) => ({ name: c.name, suit: c.suit, kind: c.kind, value: c.value })); },
  get enemyHandSize() { return state.enemy.hand.length; },
  get tell() { return state.tell; },
  get log() { return state.log.slice(); },
  get canvasSize() { return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }; },
  start: () => startGame(state),
  play: (index) => playCard(state, index),
  hold: () => holdTurn(state),
  forceWin: () => forceWin(state),
  forceLoss: () => forceLoss(state),
  state,
};
