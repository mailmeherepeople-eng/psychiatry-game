// Mind Palace: draggable snippet cards, proximity clustering, persistence.

import { state } from './state.js';
import * as db from './supabase-client.js';

const CLUSTER_THRESHOLD = 180; // center-to-center px
const CARD_W = 220;
const CARD_H_ESTIMATE = 80;

let dragging = null; // { snippetId, startX, startY, offsetX, offsetY, el }
let pointerMoveHandler = null;
let pointerUpHandler = null;

// Serialize cluster DB reconciliation so overlapping drags don't race.
let reconcileInFlight = false;
let reconcilePending = false;

export function renderMindPalace(rootEl) {
  const cardsLayer = rootEl.querySelector('[data-bind="mpCardsLayer"]');
  const clustersLayer = rootEl.querySelector('[data-bind="mpClustersLayer"]');
  const emptyHint = rootEl.querySelector('[data-bind="mpEmptyHint"]');

  const snippetIds = Object.keys(state.snippets);
  emptyHint.hidden = snippetIds.length > 0;

  // Cards
  cardsLayer.innerHTML = '';
  for (const id of snippetIds) {
    const snip = state.snippets[id];
    const card = document.createElement('div');
    card.className = 'mp-card';
    if (snip.clusterId) card.classList.add('in-cluster');
    card.dataset.snippetId = id;
    card.style.left = `${snip.x}px`;
    card.style.top = `${snip.y}px`;
    card.innerHTML = `
      <div class="mp-card-quote">${escapeHtml(snip.text)}</div>
      <div class="mp-card-meta">Snippet</div>
    `;
    card.addEventListener('pointerdown', onPointerDown);
    cardsLayer.appendChild(card);
  }

  // Cluster halos
  clustersLayer.innerHTML = '';
  const clusters = detectClusters();
  for (const group of clusters) {
    const members = group.map((id) => state.snippets[id]);
    const bounds = boundsOf(members);
    const halo = document.createElement('div');
    halo.className = 'mp-cluster';
    const pad = 60;
    halo.style.left = `${bounds.x - pad}px`;
    halo.style.top = `${bounds.y - pad}px`;
    halo.style.width = `${bounds.w + pad * 2}px`;
    halo.style.height = `${bounds.h + pad * 2}px`;
    clustersLayer.appendChild(halo);
  }
}

function onPointerDown(e) {
  const el = e.currentTarget;
  const snippetId = el.dataset.snippetId;
  const snip = state.snippets[snippetId];
  if (!snip) return;

  try { el.setPointerCapture(e.pointerId); } catch (_) { /* non-fatal */ }
  el.classList.add('dragging');

  const parent = el.parentElement;
  const parentRect = parent.getBoundingClientRect();
  dragging = {
    snippetId,
    pointerId: e.pointerId,
    offsetX: e.clientX - (parentRect.left + snip.x),
    offsetY: e.clientY - (parentRect.top + snip.y),
    el,
    parentRect,
  };

  pointerMoveHandler = (ev) => onPointerMove(ev);
  pointerUpHandler = (ev) => onPointerUp(ev);
  window.addEventListener('pointermove', pointerMoveHandler);
  window.addEventListener('pointerup', pointerUpHandler);
  window.addEventListener('pointercancel', pointerUpHandler);
}

function onPointerMove(e) {
  if (!dragging) return;
  const snip = state.snippets[dragging.snippetId];
  const parentRect = dragging.parentRect;
  let x = e.clientX - parentRect.left - dragging.offsetX;
  let y = e.clientY - parentRect.top - dragging.offsetY;

  // Clamp to canvas
  x = Math.max(8, Math.min(parentRect.width - CARD_W - 8, x));
  y = Math.max(8, Math.min(parentRect.height - CARD_H_ESTIMATE - 8, y));

  snip.x = x;
  snip.y = y;
  dragging.el.style.left = `${x}px`;
  dragging.el.style.top = `${y}px`;

  // Live cluster halo refresh (cheap for <20 cards)
  refreshClusterHalos();
}

async function onPointerUp(e) {
  if (!dragging) return;
  const { snippetId, el } = dragging;
  el.classList.remove('dragging');
  try { el.releasePointerCapture(dragging.pointerId); } catch (_) {}
  window.removeEventListener('pointermove', pointerMoveHandler);
  window.removeEventListener('pointerup', pointerUpHandler);
  window.removeEventListener('pointercancel', pointerUpHandler);
  pointerMoveHandler = null;
  pointerUpHandler = null;

  const snip = state.snippets[snippetId];
  dragging = null;

  // Persist position + reconcile clusters in DB.
  try {
    await db.updateSnippetPosition(state.sessionId, snippetId, snip.x, snip.y);
    await runReconcileQueued();
  } catch (err) {
    console.error('mp persist failed', err);
  }

  // Re-render to apply in-cluster class etc.
  const root = document.querySelector('[data-screen="mind-palace"]');
  if (root && !root.hidden) renderMindPalace(root);
}

function refreshClusterHalos() {
  const root = document.querySelector('[data-screen="mind-palace"]');
  if (!root) return;
  const clustersLayer = root.querySelector('[data-bind="mpClustersLayer"]');
  clustersLayer.innerHTML = '';
  const clusters = detectClusters();
  for (const group of clusters) {
    const members = group.map((id) => state.snippets[id]);
    const bounds = boundsOf(members);
    const halo = document.createElement('div');
    halo.className = 'mp-cluster';
    const pad = 60;
    halo.style.left = `${bounds.x - pad}px`;
    halo.style.top = `${bounds.y - pad}px`;
    halo.style.width = `${bounds.w + pad * 2}px`;
    halo.style.height = `${bounds.h + pad * 2}px`;
    clustersLayer.appendChild(halo);
  }
}

export function detectClusters() {
  const ids = Object.keys(state.snippets);
  if (ids.length < 2) return [];
  const parent = {};
  for (const id of ids) parent[id] = id;
  const find = (a) => {
    while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; }
    return a;
  };
  const union = (a, b) => { parent[find(a)] = find(b); };

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = state.snippets[ids[i]];
      const b = state.snippets[ids[j]];
      const ax = a.x + CARD_W / 2, ay = a.y + CARD_H_ESTIMATE / 2;
      const bx = b.x + CARD_W / 2, by = b.y + CARD_H_ESTIMATE / 2;
      const dist = Math.hypot(ax - bx, ay - by);
      if (dist < CLUSTER_THRESHOLD) union(ids[i], ids[j]);
    }
  }

  const groups = {};
  for (const id of ids) {
    const root = find(id);
    if (!groups[root]) groups[root] = [];
    groups[root].push(id);
  }
  return Object.values(groups).filter((g) => g.length >= 2);
}

function boundsOf(snippets) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of snippets) {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + CARD_W);
    maxY = Math.max(maxY, s.y + CARD_H_ESTIMATE);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Serialized reconcile: one in flight, at most one pending queued.
async function runReconcileQueued() {
  if (reconcileInFlight) {
    reconcilePending = true;
    return;
  }
  reconcileInFlight = true;
  try {
    await reconcileClustersInDb();
  } finally {
    reconcileInFlight = false;
    if (reconcilePending) {
      reconcilePending = false;
      runReconcileQueued();
    }
  }
}

// Wipe-and-recreate cluster rows to match detected state.
async function reconcileClustersInDb() {
  const groups = detectClusters();

  await db.deleteClusters(state.sessionId);
  state.clusters = {};
  for (const id of Object.keys(state.snippets)) {
    state.snippets[id].clusterId = null;
  }

  for (const group of groups) {
    const clusterId = await db.insertCluster(state.sessionId);
    state.clusters[clusterId] = { id: clusterId, memberSnippetIds: group };
    for (const snippetId of group) {
      state.snippets[snippetId].clusterId = clusterId;
      await db.updateSnippetCluster(state.sessionId, snippetId, clusterId);
    }
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}
