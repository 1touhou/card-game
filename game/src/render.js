// Ember Court — every pixel the player sees. Canvas 2D, no images, no fonts
// from the network: the table, the cards and the suit shapes are all drawn.
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, SUITS, CARD_WIDTH, CARD_HEIGHT,
  ENEMY_CARD_WIDTH, ENEMY_CARD_HEIGHT,
} from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSS } from './game.js';

const HAND_Y = CANVAS_HEIGHT - CARD_HEIGHT - 24;
const HAND_GAP = 16;
const ENEMY_HAND_Y = 86;

/** Where the player's hand sits: one rect per card, fanned slightly. */
export function playerCardRects(state) {
  const hand = state.player.hand;
  const total = hand.length * CARD_WIDTH + (hand.length - 1) * HAND_GAP;
  const startX = (CANVAS_WIDTH - total) / 2;
  return hand.map((card, index) => {
    const lift = state.hoverIndex === index ? -26 : 0;
    return {
      card,
      index,
      x: startX + index * (CARD_WIDTH + HAND_GAP),
      y: HAND_Y + lift,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      rotation: (index - (hand.length - 1) / 2) * 0.035,
    };
  });
}

function enemyCardRects(state) {
  const count = state.enemy.hand.length;
  const total = count * ENEMY_CARD_WIDTH + (count - 1) * 12;
  const startX = (CANVAS_WIDTH - total) / 2;
  return state.enemy.hand.map((card, index) => ({
    card,
    index,
    x: startX + index * (ENEMY_CARD_WIDTH + 12),
    y: ENEMY_HAND_Y,
    width: ENEMY_CARD_WIDTH,
    height: ENEMY_CARD_HEIGHT,
  }));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** One suit's shape, drawn in its colour. Colour AND shape, never text alone. */
export function drawSuitShape(ctx, suit, cx, cy, size, color) {
  const s = size;
  ctx.fillStyle = color;
  ctx.beginPath();
  if (suit === 'flame') {
    // A teardrop flame: a round belly with a tongue licking upward.
    ctx.moveTo(cx, cy - s);
    ctx.bezierCurveTo(cx + s * 0.55, cy - s * 0.35, cx + s * 0.75, cy + s * 0.15, cx + s * 0.45, cy + s * 0.55);
    ctx.bezierCurveTo(cx + s * 0.2, cy + s * 0.8, cx - s * 0.2, cy + s * 0.8, cx - s * 0.45, cy + s * 0.55);
    ctx.bezierCurveTo(cx - s * 0.75, cy + s * 0.15, cx - s * 0.5, cy - s * 0.35, cx, cy - s);
  } else if (suit === 'stone') {
    // A cut gem: a diamond with a flat top facet.
    ctx.moveTo(cx - s * 0.35, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.35, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.8, cy);
    ctx.lineTo(cx, cy + s * 0.85);
    ctx.lineTo(cx - s * 0.8, cy);
  } else if (suit === 'leaf') {
    // A leaf: two arcs meeting at a tip, with a stem.
    ctx.moveTo(cx, cy - s * 0.85);
    ctx.bezierCurveTo(cx + s * 0.85, cy - s * 0.4, cx + s * 0.7, cy + s * 0.6, cx, cy + s * 0.85);
    ctx.bezierCurveTo(cx - s * 0.7, cy + s * 0.6, cx - s * 0.85, cy - s * 0.4, cx, cy - s * 0.85);
    ctx.moveTo(cx, cy - s * 0.7);
    ctx.lineTo(cx, cy + s * 0.85);
  } else {
    // A droplet: a round belly with a point on top.
    ctx.moveTo(cx, cy - s * 0.9);
    ctx.bezierCurveTo(cx + s * 0.55, cy - s * 0.1, cx + s * 0.7, cy + s * 0.3, cx + s * 0.45, cy + s * 0.6);
    ctx.bezierCurveTo(cx + s * 0.2, cy + s * 0.85, cx - s * 0.2, cy + s * 0.85, cx - s * 0.45, cy + s * 0.6);
    ctx.bezierCurveTo(cx - s * 0.7, cy + s * 0.3, cx - s * 0.55, cy - s * 0.1, cx, cy - s * 0.9);
  }
  ctx.fill();
}

function drawCardFace(ctx, card, x, y, w, h, small) {
  const suit = SUITS[card.suit];
  roundRect(ctx, x, y, w, h, small ? 8 : 12);
  ctx.fillStyle = '#f7f1de';
  ctx.fill();
  ctx.lineWidth = small ? 2 : 3;
  ctx.strokeStyle = suit.dark;
  ctx.stroke();
  // Suit-coloured header band with the card name.
  roundRect(ctx, x + 3, y + 3, w - 6, small ? 22 : 30, small ? 6 : 8);
  ctx.fillStyle = suit.color;
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${small ? 11 : 15}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.name.toUpperCase(), x + w / 2, y + (small ? 14 : 18));
  // The big suit shape in the middle, with the value stamped on it.
  drawSuitShape(ctx, card.suit, x + w / 2, y + h * 0.46, small ? 22 : 42, suit.color);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${small ? 20 : 34}px Georgia, serif`;
  ctx.fillText(String(card.value), x + w / 2, y + h * 0.46 + (small ? 1 : 2));
  // Suit label + rules text at the foot.
  ctx.fillStyle = suit.dark;
  ctx.font = `bold ${small ? 10 : 13}px system-ui, sans-serif`;
  ctx.fillText(suit.label.toUpperCase(), x + w / 2, y + h * 0.68);
  ctx.fillStyle = '#4a4033';
  ctx.font = `${small ? 9 : 12}px system-ui, sans-serif`;
  wrapText(ctx, card.text, x + w / 2, y + h * 0.78, w - 18, small ? 11 : 15);
}

function drawCardBack(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#2c2118';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#c9a86a';
  ctx.stroke();
  roundRect(ctx, x + 7, y + 7, w - 14, h - 14, 7);
  ctx.strokeStyle = '#8a6d3b';
  ctx.stroke();
  drawSuitShape(ctx, 'flame', x + w / 2, y + h / 2, 20, '#c9a86a');
}

function wrapText(ctx, text, cx, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [''];
  for (const word of words) {
    const trial = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && lines[lines.length - 1]) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = trial;
    }
  }
  lines.forEach((line, i) => ctx.fillText(line, cx, y + i * lineHeight));
}

function drawLifeBar(ctx, x, y, w, label, life, maxLife, shield) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(label, x, y - 8);
  roundRect(ctx, x, y, w, 22, 11);
  ctx.fillStyle = '#1a1210';
  ctx.fill();
  const filled = Math.max(0, (life / maxLife) * w);
  roundRect(ctx, x, y, filled, 22, 11);
  ctx.fillStyle = life <= 8 ? '#e2483a' : '#3fae5a';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${life} / ${maxLife}`, x + w / 2, y + 11);
  if (shield > 0) {
    ctx.fillStyle = '#c9a86a';
    ctx.beginPath();
    ctx.moveTo(x + w + 14, y + 2);
    ctx.lineTo(x + w + 30, y + 2);
    ctx.lineTo(x + w + 30, y + 12);
    ctx.lineTo(x + w + 22, y + 22);
    ctx.lineTo(x + w + 14, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1a1210';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(String(shield), x + w + 22, y + 11);
  }
}

function drawTable(ctx) {
  const grad = ctx.createRadialGradient(640, 380, 80, 640, 400, 720);
  grad.addColorStop(0, '#2a6b44');
  grad.addColorStop(1, '#12351f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, CANVAS_WIDTH - 28, CANVAS_HEIGHT - 28);
  ctx.strokeStyle = 'rgba(201, 168, 106, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(640, 400, 430, 210, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlayedCard(ctx, slot, x, y, scale) {
  if (!slot) {
    ctx.save();
    ctx.strokeStyle = 'rgba(242, 227, 189, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 12);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const age = Math.min(1, slot.age / 260);
  const ease = 1 - (1 - age) * (1 - age);
  const px = slot.fromX + (x - slot.fromX) * ease;
  const py = slot.fromY + (y - slot.fromY) * ease;
  ctx.save();
  ctx.translate(px + CARD_WIDTH / 2, py + CARD_HEIGHT / 2);
  ctx.scale(0.85 + 0.15 * ease, 0.85 + 0.15 * ease);
  ctx.translate(-CARD_WIDTH / 2, -CARD_HEIGHT / 2);
  drawCardFace(ctx, slot.card, 0, 0, CARD_WIDTH, CARD_HEIGHT, false);
  ctx.restore();
}

function drawLog(ctx, state) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(18, 53, 31, 0.85)';
  roundRect(ctx, 968, 300, 272, 132, 10);
  ctx.fill();
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('THE TABLE TALKS', 982, 312);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#d8e8d0';
  state.log.slice(-4).forEach((line, i) => {
    wrapText(ctx, line, 982, 336 + i * 24, 244, 14);
    ctx.textAlign = 'left';
  });
}

function drawTell(ctx, state) {
  if (!state.tell) return;
  const suit = SUITS[state.tell];
  ctx.fillStyle = 'rgba(18, 53, 31, 0.85)';
  roundRect(ctx, 968, 96, 272, 64, 10);
  ctx.fill();
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText("WARDEN'S TELL", 982, 106);
  drawSuitShape(ctx, state.tell, 1000, 140, 13, suit.color);
  ctx.fillStyle = '#fff';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Favours ${suit.label} next`, 1020, 132);
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(10, 20, 14, 0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9a86a';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('EMBER COURT', 640, 190);
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel of suits and nerve', 640, 240);
  // The four suits, side by side, each in its colour and shape.
  const suits = ['flame', 'stone', 'leaf', 'tide'];
  suits.forEach((suit, i) => {
    drawSuitShape(ctx, suit, 490 + i * 100, 300, 26, SUITS[suit].color);
  });
  ctx.fillStyle = '#e8e0c8';
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillText('You and the Ash Warden hold 30 life each. Play one card a turn.', 640, 370);
  ctx.fillText('Flame wounds · Stone shields · Leaf mends · Tide draws.', 640, 400);
  ctx.fillText('Play the same suit twice in a row and the second card strikes harder.', 640, 430);
  ctx.fillText('Watch the Warden\'s tell — then answer it. First to 0 life loses.', 640, 460);
  ctx.fillStyle = '#ffb199';
  ctx.font = 'bold 24px Georgia, serif';
  const blink = Math.floor((state.now || 0) / 500) % 2 === 0;
  if (blink) ctx.fillText('Click a card or press Enter to begin', 640, 540);
  ctx.fillStyle = '#9db89f';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Keys 1–5 play a card · H holds · R restarts · M mutes nothing, there is no sound', 640, 620);
  ctx.fillText('An original game — no borrowed names, art or music.', 640, 650);
}

function drawEnd(ctx, state, won) {
  ctx.fillStyle = won ? 'rgba(60, 42, 4, 0.82)' : 'rgba(30, 6, 4, 0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd76a' : '#ff8a7a';
  ctx.font = 'bold 96px Georgia, serif';
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 300);
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText(
    won ? 'The Ash Warden falls. The Ember Court is yours!' : 'Your ember gutters out. The Warden keeps the court.',
    640, 360,
  );
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillStyle = '#e8e0c8';
  ctx.fillText(`Duel lasted ${state.round} round${state.round === 1 ? '' : 's'} · Session: ${state.wins} won, ${state.losses} lost`, 640, 420);
  const blink = Math.floor((state.now || 0) / 500) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffb199';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('Press R or click to play again', 640, 500);
  }
}

export function render(ctx, state) {
  ctx.save();
  if (state.shake > 0) {
    const dx = (Math.random() - 0.5) * state.shake;
    const dy = (Math.random() - 0.5) * state.shake;
    ctx.translate(dx, dy);
  }
  drawTable(ctx);
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state);
    ctx.restore();
    return;
  }
  // Opponent's side.
  drawLifeBar(ctx, 40, 44, 300, 'ASH WARDEN', state.enemy.life, state.enemy.maxLife, state.enemy.shield);
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE WARDEN', 640, 66);
  for (const rect of enemyCardRects(state)) drawCardBack(ctx, rect.x, rect.y, rect.width, rect.height);
  drawTell(ctx, state);
  // Round badge.
  ctx.fillStyle = '#c9a86a';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`ROUND ${state.round}`, 640, 268);
  // The two played cards on the table.
  drawPlayedCard(ctx, state.tablePlayerCard, 455, 290, 1);
  drawPlayedCard(ctx, state.tableEnemyCard, 675, 290, 1);
  ctx.fillStyle = '#f2e3bd';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText('YOU', 530, 520);
  ctx.fillText('WARDEN', 750, 520);
  drawLog(ctx, state);
  // The player's side.
  drawLifeBar(ctx, 40, 700, 180, 'YOU', state.player.life, state.player.maxLife, state.player.shield);
  for (const rect of playerCardRects(state)) {
    ctx.save();
    ctx.translate(rect.x + CARD_WIDTH / 2, rect.y + CARD_HEIGHT);
    ctx.rotate(rect.rotation);
    ctx.translate(-CARD_WIDTH / 2, -CARD_HEIGHT);
    drawCardFace(ctx, rect.card, 0, 0, CARD_WIDTH, CARD_HEIGHT, false);
    ctx.restore();
  }
  // Hold button and hints.
  const holding = state.turn === 'player' && state.phase === 'awaitPlayer';
  ctx.fillStyle = holding ? '#c9a86a' : '#5a5142';
  roundRect(ctx, 1080, 700, 160, 44, 10);
  ctx.fill();
  ctx.fillStyle = holding ? '#1a1210' : '#cfc4a8';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('HOLD  (H)', 1160, 723);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d8e8d0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Keys 1–5 play a card', 968, 186);
  ctx.fillText('H hold · R restart', 968, 206);
  if (state.screen === SCREEN_PLAY && state.turn === 'enemy' && state.phase === 'enemyThinking') {
    ctx.fillStyle = '#ffb199';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('The Warden is thinking…', 640, 556);
  } else if (state.screen === SCREEN_PLAY && state.phase === 'awaitPlayer') {
    ctx.fillStyle = '#a9e8b8';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Your move — play a card', 640, 556);
  }
  // Combo banner.
  if (state.banner && state.bannerTimer > 0) {
    ctx.fillStyle = 'rgba(20, 10, 4, 0.8)';
    roundRect(ctx, 440, 110, 400, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(state.banner, 640, 140);
  }
  // Damage floaters.
  for (const floater of state.floaters) {
    const progress = floater.age / floater.life;
    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = floater.color;
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(floater.text, floater.x, floater.y - progress * 46);
  }
  ctx.globalAlpha = 1;
  if (state.screen === SCREEN_WIN) drawEnd(ctx, state, true);
  if (state.screen === SCREEN_LOSS) drawEnd(ctx, state, false);
  ctx.restore();
}
