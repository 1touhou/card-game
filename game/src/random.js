// Ember Court — a tiny seeded random source, so a game played from the same
// seed shuffles the same decks and the screenshot poses are reproducible.
export function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle that draws only from the given rng. */
export function shuffle(deck, rng) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const held = deck[i];
    deck[i] = deck[j];
    deck[j] = held;
  }
  return deck;
}

/** Pick one element of a non-empty list with the given rng. */
export function pickOne(list, rng) {
  return list[Math.floor(rng() * list.length)];
}
