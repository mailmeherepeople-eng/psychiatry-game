// Dialogue engine. Advances nodes, applies rapport, captures snippets, detects endings.

import { state, resetDialogueUi, showToast } from './state.js';
import * as db from './supabase-client.js';

export function getCurrentNodeData() {
  if (!state.caseData || !state.currentNode) return null;
  return state.caseData.nodes[state.currentNode];
}

export function getCurrentLine() {
  const node = getCurrentNodeData();
  if (!node) return null;
  return node.lines[state.lineIndex] || null;
}

export function hasMoreLines() {
  const node = getCurrentNodeData();
  if (!node) return false;
  return state.lineIndex < node.lines.length - 1;
}

export function isTerminal() {
  const node = getCurrentNodeData();
  return !!(node && node.ending);
}

export function getEnding() {
  const node = getCurrentNodeData();
  return node ? node.ending : null;
}

// Called when a line begins displaying. If flagged with a snippet, capture it.
export async function captureSnippetForCurrentLine() {
  const line = getCurrentLine();
  if (!line || !line.snippet) return null;
  const snippetId = line.snippet;
  if (state.snippets[snippetId]) return null; // already captured

  const snippetData = state.caseData.snippets[snippetId];
  if (!snippetData) return null;

  // Initial position: loose 3-column grid with jitter, scaled to canvas later.
  // For persistence we store absolute pixel positions assuming a reference canvas.
  const existingCount = Object.keys(state.snippets).length;
  const col = existingCount % 3;
  const row = Math.floor(existingCount / 3);
  const baseX = 80 + col * 260;
  const baseY = 60 + row * 160;
  const jitterX = (Math.random() - 0.5) * 40;
  const jitterY = (Math.random() - 0.5) * 40;
  const x = baseX + jitterX;
  const y = baseY + jitterY;

  state.snippets[snippetId] = {
    id: snippetId,
    text: snippetData.text,
    x,
    y,
    clusterId: null,
  };

  try {
    await db.upsertSnippet(state.sessionId, snippetId, x, y, null);
  } catch (err) {
    console.error('snippet persist failed', err);
  }

  showToast('Snippet captured');
  return snippetId;
}

export async function makeChoice(choiceId) {
  const fromNode = state.currentNode;
  const node = getCurrentNodeData();
  if (!node || !node.choices) return;
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) return;

  const ordinal = state.choices.length + 1;
  const rapportDelta = choice.rapport || 0;

  state.rapport += rapportDelta;
  state.choices.push({
    ordinal,
    nodeId: fromNode,
    choiceId,
    rapportDelta,
    chosenAt: new Date().toISOString(),
  });

  state.currentNode = choice.next;
  resetDialogueUi();

  try {
    await db.insertChoice(state.sessionId, ordinal, fromNode, choiceId, rapportDelta);
    await db.updateSession(state.sessionId, {
      current_node: state.currentNode,
      rapport: state.rapport,
    });
  } catch (err) {
    console.error('choice persist failed', err);
  }
}

export async function completeSession(endingId) {
  state.status = 'completed';
  state.endingId = endingId;
  try {
    await db.updateSession(state.sessionId, {
      status: 'completed',
      ending_id: endingId,
    });
  } catch (err) {
    console.error('completion persist failed', err);
  }
}

export async function setAutoAdvance(value) {
  state.autoAdvance = !!value;
  try {
    await db.updateSession(state.sessionId, { auto_advance: state.autoAdvance });
  } catch (err) {
    console.error('autoAdvance persist failed', err);
  }
}
