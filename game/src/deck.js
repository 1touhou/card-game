// Ember Court — the cards. Every card is plain data: a suit, a kind, a value
// and the line printed on it. The rules in game.js read only these fields,
// so new cards are data, never new code.
//
// Kinds: attack deals damage, shield banks armour, heal restores life,
// draw pulls fresh cards. A card played right after another card of the same
// suit gains the combo bonus (see game.js).
export const CARD_KINDS = ['attack', 'shield', 'heal', 'draw'];

const CARD_DEFS = [
  // Flame — attack. The suit that ends games.
  { suit: 'flame', kind: 'attack', name: 'Ember Strike', value: 5, text: 'Deal 5 damage.', copies: 4 },
  { suit: 'flame', kind: 'attack', name: 'Wildfire', value: 3, text: 'Deal 3 damage. Burns twice on a combo.', copies: 3 },
  { suit: 'flame', kind: 'attack', name: 'Cinder Slash', value: 4, text: 'Deal 4 damage.', copies: 3 },
  // Stone — shield. Armour soaks damage before life does.
  { suit: 'stone', kind: 'shield', name: 'Bulwark', value: 7, text: 'Gain 7 shield.', copies: 4 },
  { suit: 'stone', kind: 'shield', name: 'Rampart', value: 4, text: 'Gain 4 shield, draw 1 card.', copies: 3 },
  // Leaf — heal. Life back, never above the starting total.
  { suit: 'leaf', kind: 'heal', name: 'Mend', value: 6, text: 'Restore 6 life.', copies: 4 },
  { suit: 'leaf', kind: 'heal', name: 'Bloom', value: 3, text: 'Restore 3 life, draw 1 card.', copies: 3 },
  // Tide — draw. Fresh options, and the Surge that bites while it draws.
  { suit: 'tide', kind: 'draw', name: 'Insight', value: 2, text: 'Draw 2 cards.', copies: 3 },
  { suit: 'tide', kind: 'draw', name: 'Surge', value: 1, text: 'Deal 2 damage, draw 1 card.', copies: 3 },
];

/** Build one fresh 30-card deck. Each card gets a unique id for the table. */
export function buildDeck() {
  const deck = [];
  let nextId = 1;
  for (const def of CARD_DEFS) {
    for (let copy = 0; copy < def.copies; copy += 1) {
      deck.push({
        id: nextId,
        suit: def.suit,
        kind: def.kind,
        name: def.name,
        value: def.value,
        text: def.text,
      });
      nextId += 1;
    }
  }
  return deck;
}

/** The number a card is worth when played, before any combo bonus. */
export function basePower(card) {
  if (card.kind === 'attack') return card.value;
  if (card.kind === 'shield') return card.value;
  if (card.kind === 'heal') return card.value;
  if (card.name === 'Surge') return 2;
  return card.value;
}

/** Human-readable line for the log when a card resolves. */
export function describePlay(ownerName, card, power, combo) {
  const comboText = combo ? ' (combo!)' : '';
  if (card.kind === 'attack') return `${ownerName} plays ${card.name} — ${power} damage${comboText}`;
  if (card.kind === 'shield') return `${ownerName} plays ${card.name} — +${power} shield${comboText}`;
  if (card.kind === 'heal') return `${ownerName} plays ${card.name} — +${power} life${comboText}`;
  if (card.name === 'Surge') return `${ownerName} plays ${card.name} — 2 damage, draws ${power}${comboText}`;
  return `${ownerName} plays ${card.name} — draws ${power}${comboText}`;
}
