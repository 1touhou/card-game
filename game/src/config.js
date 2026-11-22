// Ember Court — tuning constants. One place for every number the rules use,
// so a balance change never means hunting through the game logic.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

export const START_LIFE = 30;
export const HAND_SIZE = 5;
export const MAX_SHIELD = 12;
export const COMBO_BONUS = 2;
export const COMBO_DRAW_BONUS = 1;

// The four suits. Colour AND shape tell them apart, never text alone.
export const SUITS = {
  flame: { label: 'Flame', color: '#e2483a', dark: '#8f1d14', light: '#ffb199' },
  stone: { label: 'Stone', color: '#c9a86a', dark: '#7a5f31', light: '#f2e3bd' },
  leaf: { label: 'Leaf', color: '#3fae5a', dark: '#145c28', light: '#a9e8b8' },
  tide: { label: 'Tide', color: '#3a8fd9', dark: '#144a7d', light: '#a8d2f5' },
};
export const SUIT_ORDER = ['flame', 'stone', 'leaf', 'tide'];

// Card geometry on the table.
export const CARD_WIDTH = 150;
export const CARD_HEIGHT = 212;
export const ENEMY_CARD_WIDTH = 104;
export const ENEMY_CARD_HEIGHT = 146;

// How long the opponent waits before answering a played card, in ms.
export const ENEMY_THINK_MS = 850;
// How long a played card rests on the table before the next turn, in ms.
export const TABLE_REST_MS = 650;
