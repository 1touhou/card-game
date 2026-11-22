[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/1touhou/card-game/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/1touhou/card-game/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

# Ember Court

An original 2D card duel on a felt table. You are the Ember Knight, and the
Ash Warden holds the court. Both of you start at 30 life, five cards in hand,
and a deck of thirty. Play one card a turn — Flame to wound, Stone to shield,
Leaf to mend, Tide to draw — and if you play the same suit twice in a row,
the second card strikes harder. The Warden answers every move, and after
each of its turns it leaves a tell: the suit it favours next. Read the tell,
answer Flame with Stone, press your attack while it heals, and be the first
to bring the other side to 0 life.

## How to play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and open
http://localhost:8080). No build step, no network requests, no libraries.

- **Click a card / keys 1–5** — play that card from your hand
- **H** — hold: skip your turn, draw a card, let the Warden answer
- **Enter** — begin from the title screen
- **R** — restart after a victory or a defeat

## The duel

1. Each side draws up to 5 cards at the start of a round, from a 30-card
   deck of 9 card types across 4 suits.
2. Suits are told apart by colour **and** shape: Flame is a red teardrop,
   Stone a gold gem, Leaf a green leaf, Tide a blue droplet.
3. A card played right after another card of the same suit gains a combo:
   +2 to damage, shield or healing, +1 card drawn.
4. Shield soaks damage before life does (up to 12 at a time); healing never
   passes 30 life; an empty deck reshuffles its discard pile.
5. The Warden picks its card by a short priority list — finishing blows
   first, mending when hurt, turtling when behind — and its tell shows the
   suit it will favour next, so its choices can be read and countered.

## Layout

- `game/index.html` — page shell, loads the game
- `game/src/main.js` — bootstrap, fixed-step loop, `window.__card` debug handle
- `game/src/config.js` — tuning constants (life, hand size, suits, timings)
- `game/src/random.js` — seeded RNG and shuffle, for reproducible poses
- `game/src/deck.js` — the 30-card deck and every card's rules text
- `game/src/ai.js` — the Warden's priorities and its tell
- `game/src/game.js` — the duel: turns, combos, damage, win and loss
- `game/src/render.js` — all canvas drawing (table, cards, suits, overlays)
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — deterministic demo poses for the screenshots
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `screenshots/` — 4 real renders of the game in a browser

Built for the make.fun best-card-game bounty
(`best-card-game-20261122-1826`). MIT licensed.
