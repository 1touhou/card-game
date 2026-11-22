// Ember Court — deterministic screenshot poses behind ?shot=title|table|win|loss.
// Each pose plays the real rules forward from a fresh seeded duel, steered by
// a simple autopilot (play the hardest-hitting card in hand), so the frame is
// what a short game really looks like and the same seed always gives it.
import { startGame, playCard, update, forceWin, forceLoss, SCREEN_PLAY } from './game.js';

const STEP_MS = 50;

/** Step the turn machine until the predicate holds or the budget runs out. */
function runUntil(state, predicate, maxMs) {
  let spent = 0;
  while (spent < maxMs) {
    update(state, STEP_MS);
    spent += STEP_MS;
    if (predicate(state)) return true;
  }
  return predicate(state);
}

/** The autopilot's card: the hardest attack, else the highest-value card. */
function autopilotCard(state) {
  let best = 0;
  let bestValue = -1;
  state.player.hand.forEach((card, index) => {
    const value = card.kind === 'attack' ? card.value + 10 : card.value;
    if (value > bestValue) {
      bestValue = value;
      best = index;
    }
  });
  return best;
}

/** Play scripted rounds until the predicate holds (usually a mid-game table). */
function playRounds(state, predicate, maxRounds) {
  for (let round = 0; round < maxRounds; round += 1) {
    runUntil(state, (s) => s.screen === SCREEN_PLAY && s.turn === 'player' && s.phase === 'awaitPlayer', 20000);
    if (state.screen !== SCREEN_PLAY) return;
    playCard(state, autopilotCard(state));
    if (predicate(state)) return;
    runUntil(state, predicate, 20000);
    if (predicate(state)) return;
  }
}

/**
 * Set `state` to the named pose (title, table, win or loss; anything else is
 * the title) and return the screen the renderer should draw over it.
 */
export function stageShot(name, state) {
  if (name === 'table') {
    startGame(state);
    playRounds(state, (s) => s.round >= 4 && s.phase === 'resting' && s.tablePlayerCard && s.tableEnemyCard, 8);
    // A posed frame draws once, with no animation loop running: settle the
    // played cards into their table slots and clear the drifting floaters,
    // so the frame reads as a still of the duel rather than mid-flight.
    if (state.tablePlayerCard) state.tablePlayerCard.age = 1000;
    if (state.tableEnemyCard) state.tableEnemyCard.age = 1000;
    state.floaters = [];
    return;
  }
  if (name === 'win') {
    startGame(state);
    forceWin(state);
    runUntil(state, (s) => s.screen === 'win', 5000);
    return;
  }
  if (name === 'loss') {
    startGame(state);
    forceLoss(state);
    runUntil(state, (s) => s.screen === 'loss', 5000);
    return;
  }
  // Title (and any unknown name): a fresh duel that has not started yet.
}
