// Ember Court — the Ash Warden's mind. Deliberately readable: it follows a
// short priority list, and after every move it leaves a "tell" — the suit it
// favours next — so the player can read the coming turn and counter it.
import { COMBO_BONUS } from './config.js';

/** Score one card in the Warden's hand for the current board. Higher wins. */
function scoreCard(card, warden, player) {
  let score = 0;
  if (card.kind === 'attack') {
    score = 10 + card.value;
    if (player.life <= card.value + COMBO_BONUS) score += 50; // a killing blow
    if (player.shield > 0) score -= 3; // shield blunts the hit
  } else if (card.kind === 'shield') {
    score = 6 + card.value;
    if (warden.life < player.life) score += 6; // behind, so it turtles
    if (warden.shield >= 8) score -= 8; // already well armoured
  } else if (card.kind === 'heal') {
    score = 4 + card.value;
    if (warden.life <= 12) score += 30; // hurt, so it mends
    if (warden.life >= 26) score -= 10; // nearly full, healing is wasted
  } else if (card.kind === 'draw') {
    score = 5 + card.value * 2;
    if (warden.hand.length <= 2) score += 8; // a thin hand needs cards
  }
  // Same suit twice in a row is worth chasing, just as it is for the player.
  if (card.suit === warden.lastSuit) score += 4;
  return score;
}

/** Choose the Warden's card: the best-scored card in its hand. */
export function chooseCard(warden, player) {
  let best = null;
  let bestScore = -Infinity;
  for (const card of warden.hand) {
    const score = scoreCard(card, warden, player);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}

/**
 * The tell: the suit the Warden will favour on its next turn, worked out by
 * scoring its hand as if it were choosing now. Shown beside its hand so the
 * player can answer Flame with Stone, or press an attack while it heals.
 */
export function planTell(warden, player) {
  if (warden.hand.length === 0) return null;
  const planned = chooseCard(warden, player);
  return planned ? planned.suit : null;
}
