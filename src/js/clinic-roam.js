// Edgeworth-Investigations style side-view roaming. Canvas rendered at a fixed
// world resolution; CSS scales the canvas to fit the viewport.
//
// Movement: click/tap sets a walk target, WASD/arrows drive direct input.
// Collision: AABB vs. each room's obstacle list. Doors transition on overlap.
// Interaction: approach an NPC within INTERACT_RADIUS, press E / Enter / tap
//   the floating "Talk" button to fire the NPC handler.

import { ROOMS, PLAYER, WORLD } from './clinic-rooms.js';

const INTERACT_RADIUS = 110;
const TRANSITION_FADE_MS = 220;
const TRANSITION_HOLD_MS = 140;

let canvas = null;
let ctx = null;
let hudRoomEl = null;
let interactHintEl = null;
let talkBtnEl = null;
let fadeEl = null;

let currentRoom = null;
let player = { x: 160, y: 482, facing: 1 };
let keys = {};
let clickTarget = null;
let waypoints = [];        // queued targets for multi-step walks
let pendingDoor = null;    // door to enter after arrival
let pendingNpc = null;     // npc to auto-interact with after arrival
let nearNpc = null;
let transitioning = false;
let running = false;
let rafId = null;
let lastFrame = 0;

let onPatientInteract = () => {};

// Sprite cache — preloaded character SVGs shared by dialogue and roam.
const SPRITES = {};
const SPRITE_PATHS = {
  doctor: 'assets/characters/doctor.svg',
  'nurse-priya': 'assets/characters/priya.svg',
  'nurse-dev': 'assets/characters/dev.svg',
  'patient-maya': 'assets/characters/maya.svg',
};
function preloadSprites() {
  for (const [id, src] of Object.entries(SPRITE_PATHS)) {
    if (!SPRITES[id]) {
      const img = new Image();
      img.src = src;
      SPRITES[id] = img;
    }
  }
}

let keydownHandler = null;
let keyupHandler = null;
let clickHandler = null;
let talkHandler = null;

// ---------- Public ----------

export function startRoam(roomId, spawn, handlers) {
  handlers = handlers || {};
  onPatientInteract = handlers.onPatientInteract || (() => {});

  const screen = document.querySelector('[data-screen="clinic-roam"]');
  canvas = screen.querySelector('.clinic-canvas');
  ctx = canvas.getContext('2d');
  hudRoomEl = screen.querySelector('[data-bind="clinic-room"]');
  interactHintEl = screen.querySelector('.clinic-interact-hint');
  talkBtnEl = screen.querySelector('.clinic-talk-btn');
  fadeEl = screen.querySelector('.clinic-fade');

  preloadSprites();
  enterRoom(roomId, spawn);
  bindInput();
  running = true;
  lastFrame = performance.now();
  loop();
}

export function stopRoam() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  unbindInput();
  if (talkBtnEl) talkBtnEl.hidden = true;
  if (interactHintEl) interactHintEl.hidden = true;
}

// ---------- Room ----------

function enterRoom(roomId, spawn) {
  const room = ROOMS[roomId];
  if (!room) { console.error('clinic-roam: unknown room', roomId); return; }
  currentRoom = room;
  const sp = spawn || room.spawn;
  player.x = sp.x;
  player.y = sp.y;
  player.facing = 1;
  clickTarget = null;
  waypoints = [];
  pendingDoor = null;
  pendingNpc = null;
  nearNpc = null;
  if (hudRoomEl) hudRoomEl.textContent = room.label;
}

function transitionTo(roomId, spawn) {
  if (transitioning) return;
  transitioning = true;
  if (fadeEl) fadeEl.classList.add('is-active');
  setTimeout(() => {
    enterRoom(roomId, spawn);
    setTimeout(() => {
      if (fadeEl) fadeEl.classList.remove('is-active');
      transitioning = false;
    }, TRANSITION_HOLD_MS);
  }, TRANSITION_FADE_MS);
}

// ---------- Input ----------

function bindInput() {
  keydownHandler = (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === 'e' || k === 'enter') {
      e.preventDefault();
      tryInteract();
    }
  };
  keyupHandler = (e) => { keys[e.key.toLowerCase()] = false; };
  clickHandler = (e) => {
    if (transitioning) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (WORLD.width / rect.width);
    const sy = (e.clientY - rect.top) * (WORLD.height / rect.height);

    // Click on a door → walk along the floor, then up into the door.
    for (const d of currentRoom.doors) {
      if (sx >= d.x && sx <= d.x + d.w && sy >= d.y - 40 && sy <= d.y + d.h) {
        const doorX = d.x + d.w / 2;
        walkViaWaypoints([
          { x: doorX, y: WORLD.walkLane.y2 - 14 },
          { x: doorX, y: WORLD.floor.y1 + 2 },
        ]);
        pendingDoor = d;
        pendingNpc = null;
        return;
      }
    }

    // Click on an NPC → walk alongside them (horizontal first, then in).
    for (const n of currentRoom.npcs) {
      if (sx > n.x - 42 && sx < n.x + 42 && sy > n.y - 100 && sy < n.y + 10) {
        const offset = n.x > player.x ? -60 : 60;
        const stopX = clamp(n.x + offset, 40, WORLD.width - 40);
        walkViaWaypoints([
          { x: stopX, y: WORLD.walkLane.y2 - 14 },
          { x: stopX, y: n.y },
        ]);
        pendingNpc = n;
        pendingDoor = null;
        return;
      }
    }

    // Click on floor → clamp to the safe walking lane at the bottom.
    const cy = clamp(sy, WORLD.walkLane.y1, WORLD.walkLane.y2);
    // Walk horizontally first, then to the final y, to avoid snagging on
    // obstacles whose bottom lip dips slightly into the player's reach.
    walkViaWaypoints([
      { x: sx, y: player.y },
      { x: sx, y: cy },
    ]);
    pendingDoor = null;
    pendingNpc = null;
  };
  talkHandler = () => tryInteract();

  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('keyup', keyupHandler);
  canvas.addEventListener('pointerdown', clickHandler);
  if (talkBtnEl) talkBtnEl.addEventListener('click', talkHandler);
}

function unbindInput() {
  if (keydownHandler) window.removeEventListener('keydown', keydownHandler);
  if (keyupHandler) window.removeEventListener('keyup', keyupHandler);
  if (canvas && clickHandler) canvas.removeEventListener('pointerdown', clickHandler);
  if (talkBtnEl && talkHandler) talkBtnEl.removeEventListener('click', talkHandler);
  keys = {};
}

function tryInteract() {
  if (!nearNpc) return;
  if (nearNpc.triggersCase) {
    onPatientInteract(nearNpc);
  }
}

function walkViaWaypoints(points) {
  waypoints = points.slice();
  const first = waypoints.shift();
  clickTarget = first || null;
}

// ---------- Loop ----------

function loop() {
  if (!running) return;
  const now = performance.now();
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!transitioning) update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}

function update(dt) {
  // WASD / arrow keys
  let ix = 0, iy = 0;
  if (keys['a'] || keys['arrowleft']) ix -= 1;
  if (keys['d'] || keys['arrowright']) ix += 1;
  if (keys['w'] || keys['arrowup']) iy -= 1;
  if (keys['s'] || keys['arrowdown']) iy += 1;
  const hasKey = ix !== 0 || iy !== 0;
  if (hasKey) clickTarget = null;

  let vx = 0, vy = 0;
  if (hasKey) {
    const mag = Math.hypot(ix, iy) || 1;
    vx = (ix / mag) * PLAYER.speed;
    vy = (iy / mag) * PLAYER.speed;
    waypoints = [];
  } else if (clickTarget) {
    const dx = clickTarget.x - player.x;
    const dy = clickTarget.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) {
      // Arrived at this waypoint. Pull the next one if any.
      clickTarget = waypoints.length ? waypoints.shift() : null;
    } else {
      vx = (dx / dist) * PLAYER.speed;
      vy = (dy / dist) * PLAYER.speed;
      // don't overshoot the click target
      if (Math.abs(vx * dt) > Math.abs(dx)) vx = dx / dt;
      if (Math.abs(vy * dt) > Math.abs(dy)) vy = dy / dt;
    }
  }

  if (vx > 0.2) player.facing = 1;
  else if (vx < -0.2) player.facing = -1;

  moveAxis(vx * dt, 0);
  moveAxis(0, vy * dt);

  // Clamp to world + walkable floor
  player.x = clamp(player.x, PLAYER.w / 2 + 10, WORLD.width - PLAYER.w / 2 - 10);
  player.y = clamp(player.y, WORLD.floor.y1, WORLD.floor.y2);

  // Door trigger: only when the player's feet are in the door's floor strip.
  for (const d of currentRoom.doors) {
    const t = rectOfDoor(d);
    if (player.x >= t.x && player.x <= t.x + t.w &&
        player.y >= t.y && player.y <= t.y + t.h) {
      transitionTo(d.to, d.spawn);
      return;
    }
  }

  // Pending NPC interaction after walk arrival.
  if (!clickTarget && pendingNpc) {
    const n = pendingNpc;
    pendingNpc = null;
    if (n.triggersCase) {
      onPatientInteract(n);
      return;
    }
  }

  // NPC proximity (used to show interaction hint + enable E/Talk button)
  nearNpc = null;
  for (const n of currentRoom.npcs) {
    const dx = n.x - player.x;
    const dy = n.y - player.y;
    if (Math.hypot(dx, dy) < INTERACT_RADIUS) {
      nearNpc = n;
      break;
    }
  }
  updateInteractHud();
}

function moveAxis(dx, dy) {
  if (dx === 0 && dy === 0) return;
  const oldX = player.x, oldY = player.y;
  player.x += dx;
  player.y += dy;
  const pRect = playerCollider();
  for (const o of currentRoom.obstacles) {
    const oRect = obstacleCollider(o);
    if (rectOverlap(pRect, oRect)) {
      // Roll back only — don't slide (Edgeworth style: feet stop, head free).
      player.x = oldX;
      player.y = oldY;
      return;
    }
  }
}

function updateInteractHud() {
  if (!interactHintEl) return;
  if (nearNpc) {
    interactHintEl.textContent = `Press E to talk to ${nearNpc.label}`;
    interactHintEl.hidden = false;
    if (talkBtnEl) {
      talkBtnEl.textContent = `Talk to ${nearNpc.label}`;
      talkBtnEl.hidden = false;
    }
  } else {
    interactHintEl.hidden = true;
    if (talkBtnEl) talkBtnEl.hidden = true;
  }
}

// ---------- Geometry ----------

function playerRect() {
  // Full body rect — used for NPC click hit-tests only, not collision.
  return {
    x: player.x - PLAYER.w / 2,
    y: player.y - PLAYER.h,
    w: PLAYER.w,
    h: PLAYER.h,
  };
}
function playerCollider() {
  // Feet-only collider — bottom 1/4 of the sprite height. Head/torso/legs
  // visually overlap furniture (Edgeworth-style depth); only the feet stop.
  const feetH = Math.round(ROAM_SPRITE.h / 4);
  return {
    x: player.x - PLAYER.w / 2 + 6,
    y: player.y - feetH,
    w: PLAYER.w - 12,
    h: feetH,
  };
}
function obstacleCollider(o) {
  // Floor footprint of the obstacle. Starts at the back-wall line and extends
  // forward by the obstacle's logical depth. Player's feet can't enter here.
  const depth = o.depth || defaultDepth(o.type);
  return {
    x: o.x + 2,
    y: WORLD.floor.y1 - 6,
    w: o.w - 4,
    h: depth + 6,
  };
}
function defaultDepth(type) {
  switch (type) {
    case 'desk':      return 42;
    case 'sofa':      return 46;
    case 'counter':   return 28;
    case 'table':     return 44;
    case 'chair':     return 32;
    case 'bookshelf': return 26;
    case 'appliance': return 26;
    case 'plant':     return 28;
    default:          return 32;
  }
}
function rectOverlap(a, b) {
  return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h);
}
function rectOfDoor(d) {
  // Narrow strip at the floor line under the door. Player feet (point) must
  // enter this zone to trigger the transition. Keeps passing-by doors safe.
  return { x: d.x + 8, y: WORLD.floor.y1 - 8, w: d.w - 16, h: 22 };
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ---------- Draw ----------

function draw() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  drawRoom(currentRoom);

  // Depth-sorted drawables
  const items = [];
  for (const o of currentRoom.obstacles) items.push({ type: 'obstacle', y: o.y + o.h, data: o });
  for (const n of currentRoom.npcs) items.push({ type: 'npc', y: n.y, data: n });
  items.push({ type: 'player', y: player.y, data: player });
  items.sort((a, b) => a.y - b.y);

  for (const it of items) {
    if (it.type === 'obstacle') drawObstacle(it.data);
    else if (it.type === 'npc') drawNpc(it.data);
    else drawPlayer(it.data);
  }

  if (clickTarget) drawClickMarker(clickTarget);

  // Debug: draw collision rects (toggle with window.__showColliders = true).
  if (typeof window !== 'undefined' && window.__showColliders) {
    ctx.strokeStyle = 'rgba(255, 80, 80, 0.9)';
    ctx.lineWidth = 2;
    for (const o of currentRoom.obstacles) {
      const r = obstacleCollider(o);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    ctx.strokeStyle = 'rgba(80, 255, 120, 0.95)';
    ctx.lineWidth = 2;
    const p = playerCollider();
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }
}

function drawRoom(room) {
  const p = room.palette;
  // Wall gradient (top)
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 380);
  wallGrad.addColorStop(0, p.wallTop);
  wallGrad.addColorStop(1, p.wallMid);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, WORLD.width, 380);

  // Floor gradient
  const floorGrad = ctx.createLinearGradient(0, 380, 0, WORLD.height);
  floorGrad.addColorStop(0, p.floor);
  floorGrad.addColorStop(1, p.floorDark);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 380, WORLD.width, WORLD.height - 380);

  // Skirting line
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 378, WORLD.width, 4);

  // Wallpaper stripes (very subtle)
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let x = 0; x < WORLD.width; x += 120) {
    ctx.fillRect(x, 0, 2, 380);
  }

  // Accent baseboard glow
  ctx.fillStyle = p.accent;
  ctx.globalAlpha = 0.2;
  ctx.fillRect(0, 370, WORLD.width, 8);
  ctx.globalAlpha = 1;

  // Doors
  for (const d of room.doors) drawDoor(d, p);

  // Decor (wall art / signs / plants)
  for (const dec of (room.decor || [])) drawDecor(dec);

  // Subtle vignette
  const vgrad = ctx.createRadialGradient(
    WORLD.width / 2, WORLD.height / 2, WORLD.height * 0.4,
    WORLD.width / 2, WORLD.height / 2, WORLD.height * 0.95
  );
  vgrad.addColorStop(0, 'rgba(0,0,0,0)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
}

function drawDoor(d, palette) {
  // Frame
  ctx.fillStyle = '#2a1d10';
  ctx.fillRect(d.x - 6, d.y - 8, d.w + 12, d.h + 12);
  // Opening
  const doorGrad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.h);
  doorGrad.addColorStop(0, '#1b140a');
  doorGrad.addColorStop(1, '#3b2c18');
  ctx.fillStyle = doorGrad;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  // Door seam
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(d.x + d.w / 2 - 1, d.y, 2, d.h);
  // Handle
  ctx.fillStyle = '#c8b26a';
  ctx.fillRect(d.x + d.w / 2 + 10, d.y + d.h / 2 - 2, 8, 6);
  ctx.fillRect(d.x + d.w / 2 - 18, d.y + d.h / 2 - 2, 8, 6);
  // Sign plate above
  ctx.fillStyle = palette.accent;
  ctx.fillRect(d.x + 8, d.y - 32, d.w - 16, 22);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(d.x + 8, d.y - 32, d.w - 16, 22);
  ctx.font = '700 10px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#2a1d10';
  ctx.textAlign = 'center';
  ctx.fillText(d.label.toUpperCase(), d.x + d.w / 2, d.y - 16);
}

function drawDecor(dec) {
  if (dec.kind === 'entry-door') {
    // Visual-only entry door (arrival point). Darker recess with "ENTRY" plate.
    ctx.fillStyle = '#1b1108';
    ctx.fillRect(dec.x - 50, dec.y - 10, 100, 180);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dec.x - 50, dec.y - 10, 100, 180);
    // Door split
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(dec.x - 1, dec.y - 10, 2, 180);
    // Outside light panel at top
    ctx.fillStyle = 'rgba(240,220,170,0.6)';
    ctx.fillRect(dec.x - 42, dec.y - 2, 84, 24);
    // Plate
    ctx.fillStyle = '#d9c99a';
    ctx.fillRect(dec.x - 46, dec.y - 42, 92, 22);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(dec.x - 46, dec.y - 42, 92, 22);
    ctx.fillStyle = '#2a1d10';
    ctx.font = '700 10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRY', dec.x, dec.y - 27);
    return;
  }
  if (dec.kind === 'wall-art') {
    ctx.fillStyle = '#c8b78a';
    ctx.fillRect(dec.x - 40, dec.y - 28, 80, 56);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(dec.x - 40, dec.y - 28, 80, 56);
    // Abstract swipes
    ctx.fillStyle = '#3a5a7a';
    ctx.fillRect(dec.x - 32, dec.y - 20, 20, 40);
    ctx.fillStyle = '#a14a4a';
    ctx.fillRect(dec.x - 8, dec.y - 14, 30, 28);
    return;
  }
  if (dec.kind === 'plant') {
    // pot
    ctx.fillStyle = '#7a5a3e';
    ctx.fillRect(dec.x - 14, dec.y, 28, 28);
    // leaves
    ctx.fillStyle = '#3a6b3a';
    ctx.beginPath();
    ctx.ellipse(dec.x, dec.y - 12, 22, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f5a2f';
    ctx.beginPath();
    ctx.ellipse(dec.x - 10, dec.y - 20, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.kind === 'sign') {
    ctx.fillStyle = '#f1e5c4';
    ctx.fillRect(dec.x - 70, dec.y - 24, 140, 48);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dec.x - 70, dec.y - 24, 140, 48);
    ctx.fillStyle = '#2a2014';
    ctx.font = '600 14px "Iowan Old Style", "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText(dec.text, dec.x, dec.y + 4);
  } else if (dec.kind === 'poster') {
    ctx.fillStyle = '#f0efe3';
    ctx.fillRect(dec.x - 50, dec.y - 30, 100, 70);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeRect(dec.x - 50, dec.y - 30, 100, 70);
    ctx.fillStyle = '#2a2014';
    ctx.font = '600 11px "Inter", sans-serif';
    ctx.textAlign = 'center';
    const lines = (dec.text || '').split('\n');
    lines.forEach((ln, i) => ctx.fillText(ln, dec.x, dec.y - 6 + i * 14));
  } else if (dec.kind === 'clock') {
    ctx.fillStyle = '#e9e4d1';
    ctx.beginPath();
    ctx.arc(dec.x, dec.y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a2014';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = '#2a2014';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(dec.x, dec.y); ctx.lineTo(dec.x, dec.y - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dec.x, dec.y); ctx.lineTo(dec.x + 10, dec.y + 4); ctx.stroke();
  }
}

function drawObstacle(o) {
  const c = obstacleColor(o.type);
  const skewX = o.skewX != null ? o.skewX : 8;
  const skewY = o.skewY != null ? o.skewY : 5;
  const onFloor = o.y + o.h >= WORLD.floor.y1 - 16;

  // Floor shadow — ellipse under the object where it meets the floor.
  if (onFloor) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2 + 3, o.y + o.h + 6, o.w * 0.48, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top face — parallelogram tilted up-and-left (camera slightly above/right).
  ctx.fillStyle = c.top;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(o.x - skewX, o.y - skewY);
  ctx.lineTo(o.x + o.w - skewX, o.y - skewY);
  ctx.lineTo(o.x + o.w, o.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Top face highlight sheen (catch light along back edge)
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(o.x - skewX + 2, o.y - skewY + 1);
  ctx.lineTo(o.x + o.w - skewX - 2, o.y - skewY + 1);
  ctx.lineTo(o.x + o.w - skewX - 4, o.y - skewY + 2.5);
  ctx.lineTo(o.x - skewX + 4, o.y - skewY + 2.5);
  ctx.closePath();
  ctx.fill();

  // Left side face (visible because top tilts left) — narrow parallelogram.
  ctx.fillStyle = c.side;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(o.x - skewX, o.y - skewY);
  ctx.lineTo(o.x - skewX, o.y + o.h - skewY);
  ctx.lineTo(o.x, o.y + o.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front face — gradient.
  const grad = ctx.createLinearGradient(0, o.y, 0, o.y + o.h);
  grad.addColorStop(0, c.top);
  grad.addColorStop(0.55, c.base);
  grad.addColorStop(1, c.shadow);
  ctx.fillStyle = grad;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  // Bottom deep-shadow line (meets floor)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(o.x, o.y + o.h - 2, o.w, 2);
  // Outline on front face
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(o.x + 0.5, o.y + 0.5, o.w - 1, o.h - 1);

  // Type-specific detailing (drawers, cushions, books, etc.)
  detailObstacle(o, c);
}

function detailObstacle(o, c) {
  if (o.type === 'sofa') {
    // cushions
    ctx.fillStyle = c.top;
    const cushW = (o.w - 18) / 3;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(o.x + 6 + i * (cushW + 3), o.y + 8, cushW, o.h * 0.55);
    }
  } else if (o.type === 'desk') {
    // drawer lines
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.moveTo(o.x + o.w * 0.55, o.y + 14);
    ctx.lineTo(o.x + o.w * 0.55, o.y + o.h - 6);
    ctx.stroke();
    // handle
    ctx.fillStyle = '#d4c088';
    ctx.fillRect(o.x + o.w * 0.75, o.y + o.h * 0.45, 18, 4);
  } else if (o.type === 'counter') {
    // joint lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    for (let i = 1; i < 6; i++) {
      const x = o.x + (o.w / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, o.y);
      ctx.lineTo(x, o.y + o.h);
      ctx.stroke();
    }
  } else if (o.type === 'bookshelf') {
    // shelves
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    const shelves = 4;
    for (let i = 1; i < shelves; i++) {
      const y = o.y + (o.h / shelves) * i;
      ctx.beginPath();
      ctx.moveTo(o.x, y);
      ctx.lineTo(o.x + o.w, y);
      ctx.stroke();
    }
    // books
    const palette = ['#7a3a3a', '#3a5a7a', '#7a6a3a', '#3a7a5a', '#7a3a6a'];
    for (let s = 0; s < shelves; s++) {
      const shelfY = o.y + (o.h / shelves) * s + 4;
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = palette[(s * 3 + i) % palette.length];
        ctx.fillRect(o.x + 4 + i * (o.w - 8) / 8, shelfY, (o.w - 8) / 8 - 2, (o.h / shelves) - 10);
      }
    }
  } else if (o.type === 'chair') {
    ctx.fillStyle = '#222';
    ctx.fillRect(o.x + 4, o.y - 30, o.w - 8, 30);
  } else if (o.type === 'appliance') {
    ctx.fillStyle = '#222';
    ctx.fillRect(o.x + 8, o.y + 8, o.w - 16, o.h * 0.45);
    ctx.fillStyle = '#6fa';
    ctx.fillRect(o.x + 14, o.y + 14, 8, 6);
  } else if (o.type === 'table') {
    // legs
    ctx.fillStyle = c.base;
    ctx.fillRect(o.x + 4, o.y + o.h, 6, 10);
    ctx.fillRect(o.x + o.w - 10, o.y + o.h, 6, 10);
  } else if (o.type === 'plant') {
    ctx.fillStyle = '#3a6b3a';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + 6, o.w / 2 - 4, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function obstacleColor(type) {
  switch (type) {
    case 'desk':       return { base: '#6e4a24', top: '#96683a', side: '#4c301a', shadow: '#331e0e' };
    case 'sofa':       return { base: '#3f5076', top: '#627a9f', side: '#2a3a5a', shadow: '#1e2a46' };
    case 'table':      return { base: '#5a3e24', top: '#7b5432', side: '#3a2816', shadow: '#261806' };
    case 'counter':    return { base: '#a8996e', top: '#cdbe8a', side: '#7a6d4c', shadow: '#564b30' };
    case 'appliance':  return { base: '#3a3e46', top: '#5e6370', side: '#24272d', shadow: '#0f1216' };
    case 'chair':      return { base: '#2a2a2a', top: '#4a4a4a', side: '#1a1a1a', shadow: '#0a0a0a' };
    case 'bookshelf':  return { base: '#3a2618', top: '#5a3d28', side: '#24150c', shadow: '#120805' };
    case 'plant':      return { base: '#6b4a2a', top: '#8a6338', side: '#452c14', shadow: '#281806' };
    default:           return { base: '#777', top: '#999', side: '#555', shadow: '#333' };
  }
}

// Roam sprite size. Full-body SVGs at 200:500 aspect (≈0.4). Matching sprite
// dimensions keeps proportions correct and shows legs + feet on the floor.
const ROAM_SPRITE = { w: 76, h: 190 };

function drawSpriteCharacter(cx, feetY, spriteId, facing) {
  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(cx, feetY + 4, ROAM_SPRITE.w * 0.32, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = SPRITES[spriteId];
  if (img && img.complete && img.naturalWidth > 0) {
    const w = ROAM_SPRITE.w;
    const h = ROAM_SPRITE.h;
    ctx.save();
    if (facing < 0) {
      // Mirror for left-facing
      ctx.translate(cx, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, feetY - h, w, h);
    } else {
      ctx.drawImage(img, cx - w / 2, feetY - h, w, h);
    }
    ctx.restore();
  } else {
    // Fallback: simple colored rect while the SVG loads.
    ctx.fillStyle = '#6b7a99';
    ctx.fillRect(cx - 20, feetY - 70, 40, 70);
  }
}

function drawNpc(n) {
  drawSpriteCharacter(n.x, n.y, n.id, -1); // NPCs face left (toward player)
  if (n.label) {
    const ty = n.y - ROAM_SPRITE.h - 12;
    ctx.font = '700 10px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    const labelText = n.label.toUpperCase();
    const tw = ctx.measureText(labelText).width + 14;
    ctx.fillStyle = 'rgba(20,30,50,0.85)';
    ctx.fillRect(n.x - tw / 2, ty - 10, tw, 16);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.strokeRect(n.x - tw / 2, ty - 10, tw, 16);
    ctx.fillStyle = '#fff';
    ctx.fillText(labelText, n.x, ty + 2);
  }
}

function drawPlayer(p) {
  drawSpriteCharacter(p.x, p.y, 'doctor', p.facing);
  // YOU tag
  ctx.font = '700 10px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  const labelText = 'YOU';
  const tw = ctx.measureText(labelText).width + 14;
  const ty = p.y - ROAM_SPRITE.h - 12;
  ctx.fillStyle = 'rgba(58,123,123,0.95)';
  ctx.fillRect(p.x - tw / 2, ty - 10, tw, 16);
  ctx.fillStyle = '#fff';
  ctx.fillText(labelText, p.x, ty + 2);
}

function drawClickMarker(t) {
  ctx.strokeStyle = 'rgba(90,180,180,0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(90,180,180,0.9)';
  ctx.beginPath();
  ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- Color helpers ----------

function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(clampByte(r + 255 * amt), clampByte(g + 255 * amt), clampByte(b + 255 * amt));
}
function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(clampByte(r - 255 * amt), clampByte(g - 255 * amt), clampByte(b - 255 * amt));
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function clampByte(v) { return Math.max(0, Math.min(255, v)); }
