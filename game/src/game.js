// Ember Court — the duel itself: state, turns, combos and the win/loss rules.
// Nothing here draws anything; render.js reads this state and draws it.
import {
  START_LIFE, HAND_SIZE, MAX_SHIELD, COMBO_BONUS, COMBO_DRAW_BONUS,
  ENEMY_THINK_MS, TABLE_REST_MS,
} from './config.js';
import { makeRng, shuffle } from './random.js';
import { buildDeck, basePower, describePlay } from './deck.js';
import { chooseCard, planTell } from './ai.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

function makeSide(name, rng) {
  return {
    name,
    life: START_LIFE,
    maxLife: START_LIFE,
    shield: 0,
    hand: [],
    deck: shuffle(buildDeck(), rng),
    discard: [],
    lastSuit: null,
  };
}

export function createGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    rng,
    now: 0,
    screen: SCREEN_TITLE,
    turn: 'player',
    phase: 'awaitPlayer',
    phaseTimer: 0,
    round: 1,
    player: makeSide('You', rng),
    enemy: makeSide('Ash Warden', rng),
    tablePlayerCard: null,
    tableEnemyCard: null,
    log: ['Welcome to the Ember Court. Press Enter to begin.'],
    floaters: [],
    tell: null,
    banner: null,
    bannerTimer: 0,
    shake: 0,
    wins: 0,
    losses: 0,
  };
  return state;
}

/** Draw from the side's deck until its hand holds HAND_SIZE cards. */
function drawUp(state, side) {
  while (side.hand.length < HAND_SIZE) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return;
      side.deck = shuffle(side.discard, state.rng);
      side.discard = [];
    }
    const card = side.deck.pop();
    card.bornAt = state.now;
    side.hand.push(card);
  }
}

function addLog(state, line) {
  state.log.push(line);
  if (state.log.length > 4) state.log.shift();
}

function addFloater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color, age: 0, life: 1100 });
}

function showBanner(state, text, ms) {
  state.banner = text;
  state.bannerTimer = ms;
}

/** The power of a card once the same-suit combo bonus is applied. */
function effectivePower(card, combo) {
  let power = basePower(card);
  if (combo) power += card.kind === 'draw' ? COMBO_DRAW_BONUS : COMBO_BONUS;
  return power;
}

function dealDamage(state, target, amount, x, y) {
  const absorbed = Math.min(target.shield, amount);
  target.shield -= absorbed;
  const through = amount - absorbed;
  target.life = Math.max(0, target.life - through);
  if (absorbed > 0) addFloater(state, x, y, `-${absorbed} shield`, '#c9a86a');
  if (through > 0) {
    addFloater(state, x, y + 26, `-${through}`, '#ff6b5e');
    state.shake = Math.max(state.shake, amount >= 5 ? 9 : 5);
  }
}

/** Resolve one played card against the board. Returns nothing; mutates state. */
function resolveCard(state, side, foe, card, combo, tableX, tableY) {
  const power = effectivePower(card, combo);
  side.lastSuit = card.suit;
  addLog(state, describePlay(side.name, card, power, combo));
  if (combo) showBanner(state, 'COMBO! Same suit twice in a row', 1400);
  if (card.kind === 'attack') {
    // Damage numbers burst beside the victim's life bar.
    const targetIsPlayer = foe === state.player;
    dealDamage(state, foe, power, targetIsPlayer ? 130 : 190, targetIsPlayer ? 660 : 100);
  } else if (card.kind === 'shield') {
    side.shield = Math.min(MAX_SHIELD, side.shield + power);
    addFloater(state, tableX, tableY, `+${power} shield`, '#c9a86a');
  } else if (card.kind === 'heal') {
    const healed = Math.min(side.maxLife - side.life, power);
    side.life += healed;
    addFloater(state, tableX, tableY, `+${healed} life`, '#7be495');
  } else if (card.kind === 'draw') {
    if (card.name === 'Surge') {
      const targetIsPlayer = foe === state.player;
      dealDamage(state, foe, 2, targetIsPlayer ? 130 : 190, targetIsPlayer ? 660 : 100);
    }
    for (let i = 0; i < power; i += 1) {
      if (side.deck.length === 0) {
        if (side.discard.length === 0) break;
        side.deck = shuffle(side.discard, state.rng);
        side.discard = [];
      }
      const drawn = side.deck.pop();
      drawn.bornAt = state.now;
      side.hand.push(drawn);
    }
    addFloater(state, tableX, tableY, `draw ${power}`, '#a8d2f5');
  }
  side.discard.push(card);
  checkEnd(state);
}

function checkEnd(state) {
  if (state.screen !== SCREEN_PLAY) return;
  if (state.enemy.life <= 0) {
    state.screen = SCREEN_WIN;
    state.turn = 'done';
    state.wins += 1;
    addLog(state, 'The Ash Warden falls. The Ember Court is yours!');
  } else if (state.player.life <= 0) {
    state.screen = SCREEN_LOSS;
    state.turn = 'done';
    state.losses += 1;
    addLog(state, 'Your ember gutters out. The Warden keeps the court.');
  }
}

/** Begin a fresh duel from the title screen. */
export function startGame(state) {
  const seed = state.seed;
  const fresh = createGame(seed);
  // Keep the running totals across duels in one session.
  fresh.wins = state.wins;
  fresh.losses = state.losses;
  Object.assign(state, fresh);
  drawUp(state, state.player);
  drawUp(state, state.enemy);
  state.screen = SCREEN_PLAY;
  state.log = ['The duel begins. Play a card — same suit twice in a row for a combo.'];
}

/** The player plays the card at handIndex. Ignored outside the player's turn. */
export function playCard(state, handIndex) {
  if (state.screen !== SCREEN_PLAY || state.turn !== 'player' || state.phase !== 'awaitPlayer') return false;
  if (handIndex < 0 || handIndex >= state.player.hand.length) return false;
  const card = state.player.hand.splice(handIndex, 1)[0];
  const combo = card.suit === state.player.lastSuit;
  state.tablePlayerCard = { card, age: 0, fromX: 640, fromY: 720 };
  resolveCard(state, state.player, state.enemy, card, combo, 520, 400);
  if (state.screen !== SCREEN_PLAY) return true;
  state.turn = 'enemy';
  state.phase = 'enemyThinking';
  state.phaseTimer = ENEMY_THINK_MS;
  return true;
}

/** The player holds: skip the turn, draw one card, let the Warden answer. */
export function holdTurn(state) {
  if (state.screen !== SCREEN_PLAY || state.turn !== 'player' || state.phase !== 'awaitPlayer') return false;
  state.player.lastSuit = null;
  addLog(state, 'You hold, drawing a card.');
  if (state.player.deck.length === 0 && state.player.discard.length > 0) {
    state.player.deck = shuffle(state.player.discard, state.rng);
    state.player.discard = [];
  }
  if (state.player.deck.length > 0) {
    const drawn = state.player.deck.pop();
    drawn.bornAt = state.now;
    state.player.hand.push(drawn);
  }
  state.turn = 'enemy';
  state.phase = 'enemyThinking';
  state.phaseTimer = ENEMY_THINK_MS;
  return true;
}

/** The Warden answers with its best-scored card, then leaves its tell. */
function enemyPlay(state) {
  const card = chooseCard(state.enemy, state.player);
  if (!card) {
    state.phase = 'resting';
    state.phaseTimer = TABLE_REST_MS;
    return;
  }
  const index = state.enemy.hand.indexOf(card);
  state.enemy.hand.splice(index, 1);
  const combo = card.suit === state.enemy.lastSuit;
  state.tableEnemyCard = { card, age: 0, fromX: 640, fromY: 90 };
  resolveCard(state, state.enemy, state.player, card, combo, 760, 400);
  if (state.screen !== SCREEN_PLAY) return;
  state.tell = planTell(state.enemy, state.player);
  state.phase = 'resting';
  state.phaseTimer = TABLE_REST_MS;
}

/** Advance timers, floaters and the turn machine. dtMs is real elapsed time. */
export function update(state, dtMs) {
  state.now = (state.now || 0) + dtMs;
  if (state.bannerTimer > 0) state.bannerTimer -= dtMs;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dtMs / 40);
  for (const floater of state.floaters) floater.age += dtMs;
  state.floaters = state.floaters.filter((f) => f.age < f.life);
  if (state.tablePlayerCard) state.tablePlayerCard.age += dtMs;
  if (state.tableEnemyCard) state.tableEnemyCard.age += dtMs;
  if (state.screen !== SCREEN_PLAY) return;
  if (state.phase === 'enemyThinking') {
    state.phaseTimer -= dtMs;
    if (state.phaseTimer <= 0) enemyPlay(state);
  } else if (state.phase === 'resting') {
    state.phaseTimer -= dtMs;
    if (state.phaseTimer <= 0) {
      state.tablePlayerCard = null;
      state.tableEnemyCard = null;
      state.round += 1;
      drawUp(state, state.player);
      drawUp(state, state.enemy);
      state.turn = 'player';
      state.phase = 'awaitPlayer';
    }
  }
}

/** Debug helpers for the playtest: force an ending without playing it out. */
export function forceWin(state) {
  if (state.screen === SCREEN_TITLE) startGame(state);
  state.enemy.life = 1;
  state.enemy.shield = 0;
  const strike = state.player.hand.find((c) => c.kind === 'attack') || state.player.hand[0];
  const index = state.player.hand.indexOf(strike);
  playCard(state, index);
}

export function forceLoss(state) {
  if (state.screen === SCREEN_TITLE) startGame(state);
  state.player.life = 1;
  state.player.shield = 0;
  state.enemy.hand = [{ id: 9001, suit: 'flame', kind: 'attack', name: 'Ember Strike', value: 5, text: 'Deal 5 damage.' }];
  state.turn = 'enemy';
  state.phase = 'enemyThinking';
  state.phaseTimer = 1;
}
