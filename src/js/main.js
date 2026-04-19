import { state, resetDialogueUi, setRenderCallback } from './state.js';
import { supabase, upsertCaseRow, loadActiveSession, createSession, updateSession, loadChoices, loadSnippets, loadClusters } from './supabase-client.js';
import { getOrCreateAnonId, ensurePlayer } from './player.js';
import { loadCase } from './case-loader.js';
import * as engine from './engine.js';
import { renderMindPalace } from './mind-palace.js';
import { renderNotebook } from './notebook.js';

const TYPE_SPEED_MS = 22;
const AUTO_ADVANCE_DELAY_MS = 1800;

let typewriterToken = 0;
let currentTypewriterKey = null; // "nodeId:lineIndex" — prevents duplicate starts
let autoAdvanceTimer = null;

// ------- Bootstrap -------

async function boot() {
  try {
    state.anonId = getOrCreateAnonId();
    const player = await ensurePlayer(supabase, state.anonId);
    state.playerId = player.id;

    const caseData = await loadCase('case-01-gad-tutorial');
    state.caseData = caseData;
    state.caseId = caseData.id;
    // Mirror case content into Supabase (idempotent upsert).
    try { await upsertCaseRow(caseData); } catch (e) { console.warn('case upsert failed', e); }

    const active = await loadActiveSession(state.playerId, state.caseId);
    if (active) {
      await restoreSession(active);
    } else {
      const created = await createSession(state.playerId, state.caseId, caseData.startNode);
      state.sessionId = created.id;
      state.currentNode = created.current_node;
      state.rapport = created.rapport;
      state.autoAdvance = created.auto_advance;
    }

    resetDialogueUi();
    state.screen = 'title';
    render();
  } catch (err) {
    console.error('boot failed', err);
    document.body.innerHTML = `<pre style="padding:24px;color:#a13e3e">Boot failed: ${err.message}</pre>`;
  }
}

async function restoreSession(session) {
  state.sessionId = session.id;
  state.currentNode = session.current_node;
  state.rapport = session.rapport;
  state.status = session.status;
  state.endingId = session.ending_id;
  state.autoAdvance = session.auto_advance;

  const [choices, snippets, clusters] = await Promise.all([
    loadChoices(session.id),
    loadSnippets(session.id),
    loadClusters(session.id),
  ]);
  state.choices = choices.map((c) => ({
    ordinal: c.ordinal,
    nodeId: c.node_id,
    choiceId: c.choice_id,
    rapportDelta: c.rapport_delta,
    chosenAt: c.chosen_at,
  }));
  state.snippets = {};
  for (const s of snippets) {
    state.snippets[s.snippet_id] = {
      id: s.snippet_id,
      text: state.caseData.snippets[s.snippet_id]?.text || '',
      x: s.x_position,
      y: s.y_position,
      clusterId: s.cluster_id,
    };
  }
  state.clusters = {};
  for (const c of clusters) {
    state.clusters[c.id] = { id: c.id, memberSnippetIds: [] };
  }
  for (const id of Object.keys(state.snippets)) {
    const cid = state.snippets[id].clusterId;
    if (cid && state.clusters[cid]) state.clusters[cid].memberSnippetIds.push(id);
  }
}

// ------- Rendering -------

function render() {
  // Screens
  document.querySelectorAll('.screen').forEach((el) => {
    el.hidden = el.dataset.screen !== state.screen;
  });
  const settingsEl = document.querySelector('[data-screen="settings"]');
  settingsEl.hidden = !state.settingsOpen;

  // Toast
  const toastEl = document.querySelector('[data-bind="toast"]');
  if (state.toast) {
    toastEl.textContent = state.toast;
    toastEl.hidden = false;
  } else {
    toastEl.hidden = true;
  }

  // Title screen: show resume hint if session has progress
  if (state.screen === 'title') {
    const resumeBtn = document.querySelector('[data-action="resume-case"]');
    const hasProgress = state.choices.length > 0 || state.currentNode !== state.caseData?.startNode;
    if (resumeBtn) resumeBtn.hidden = !hasProgress || state.status === 'completed';
  }

  if (state.screen === 'game') renderGame();
  if (state.screen === 'mind-palace') {
    const root = document.querySelector('[data-screen="mind-palace"]');
    renderMindPalace(root);
  }
  if (state.screen === 'notebook') {
    const root = document.querySelector('[data-screen="notebook"]');
    renderNotebook(root);
  }
  if (state.screen === 'debrief') renderDebrief();

  // Settings toggle reflects state
  const toggle = document.querySelector('[data-bind="autoAdvanceToggle"]');
  if (toggle) toggle.checked = !!state.autoAdvance;
}

function renderGame() {
  const { caseData } = state;
  if (!caseData) return;

  document.querySelector('[data-bind="patientName"]').textContent = caseData.patient.name;

  const portrait = document.querySelector('.portrait-silhouette');
  portrait.style.setProperty('--patient-color', caseData.patient.silhouetteColor);

  const rapportEl = document.querySelector('[data-bind="rapport"]');
  rapportEl.textContent = String(state.rapport);
  rapportEl.classList.toggle('rapport-positive', state.rapport > 0);
  rapportEl.classList.toggle('rapport-negative', state.rapport < 0);

  const node = engine.getCurrentNodeData();
  if (!node) return;

  const speakerEl = document.querySelector('[data-bind="speaker"]');
  speakerEl.textContent = node.speaker === 'narration' ? 'Narration' : caseData.patient.name;

  const line = engine.getCurrentLine();
  if (!line) return;

  const lineTextEl = document.querySelector('[data-bind="lineText"]');
  const choicesEl = document.querySelector('[data-bind="choices"]');
  const dialogueBox = document.querySelector('.dialogue-box');

  dialogueBox.classList.toggle('line-done', state.lineDone);

  if (state.lineDone) {
    lineTextEl.textContent = line.text;
    const lastLine = !engine.hasMoreLines();
    if (lastLine) {
      if (engine.isTerminal()) {
        choicesEl.hidden = true;
        setTimeout(() => goToDebrief(), 600);
      } else {
        renderChoices(node.choices);
      }
    } else {
      choicesEl.hidden = true;
    }
  } else {
    choicesEl.hidden = true;
    // Start typewriter only if not already running on this exact line.
    const key = `${state.currentNode}:${state.lineIndex}`;
    if (currentTypewriterKey !== key) {
      currentTypewriterKey = key;
      playTypewriter(lineTextEl, line.text);
    }
  }
}

function renderChoices(choices) {
  const el = document.querySelector('[data-bind="choices"]');
  el.innerHTML = '';
  for (const ch of choices) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = ch.text;
    btn.dataset.choiceId = ch.id;
    btn.addEventListener('click', () => onChoiceClick(ch.id));
    el.appendChild(btn);
  }
  el.hidden = false;
}

function renderDebrief() {
  const ending = engine.getEnding();
  document.querySelector('[data-bind="endingName"]').textContent = ending?.name || 'Ending';
  document.querySelector('[data-bind="finalRapport"]').textContent = String(state.rapport);
  const list = document.querySelector('[data-bind="debriefChoices"]');
  list.innerHTML = '';
  for (const c of state.choices) {
    const node = state.caseData.nodes[c.nodeId];
    const choice = node?.choices?.find((x) => x.id === c.choiceId);
    const li = document.createElement('li');
    const sign = c.rapportDelta > 0 ? `+${c.rapportDelta}` : (c.rapportDelta < 0 ? String(c.rapportDelta) : '0');
    li.textContent = `${choice ? choice.text : c.choiceId} (${sign} rapport)`;
    list.appendChild(li);
  }
}

// ------- Typewriter -------

function playTypewriter(el, text) {
  typewriterToken += 1;
  const myToken = typewriterToken;
  el.innerHTML = '';
  let i = 0;

  // Capture snippet at line start. Toast triggers render via callback.
  engine.captureSnippetForCurrentLine();

  const step = () => {
    if (myToken !== typewriterToken) return; // cancelled by a new line
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i += 1;
      setTimeout(step, TYPE_SPEED_MS);
    } else {
      state.lineDone = true;
      render();
      scheduleAutoAdvance();
    }
  };
  step();
}

function completeTypewriterImmediately() {
  typewriterToken += 1; // cancel running
  const line = engine.getCurrentLine();
  if (!line) return;
  const lineTextEl = document.querySelector('[data-bind="lineText"]');
  lineTextEl.textContent = line.text;
  state.lineDone = true;
  render();
  scheduleAutoAdvance();
}

function scheduleAutoAdvance() {
  clearAutoAdvance();
  if (!state.autoAdvance) return;
  // Don't auto-advance when choices would render next.
  if (!engine.hasMoreLines() && !engine.isTerminal()) return;
  autoAdvanceTimer = setTimeout(() => {
    autoAdvanceTimer = null;
    advanceLine();
  }, AUTO_ADVANCE_DELAY_MS);
}

function clearAutoAdvance() {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

// ------- Dialogue actions -------

function onDialogueTap() {
  if (state.screen !== 'game') return;
  if (!state.lineDone) {
    completeTypewriterImmediately();
    return;
  }
  advanceLine();
}

function advanceLine() {
  clearAutoAdvance();
  if (engine.hasMoreLines()) {
    state.lineIndex += 1;
    state.lineDone = false;
    currentTypewriterKey = null; // allow next line to start typing
    render();
  } else if (engine.isTerminal()) {
    goToDebrief();
  }
  // else: choices are shown; do nothing
}

async function onChoiceClick(choiceId) {
  clearAutoAdvance();
  currentTypewriterKey = null;
  await engine.makeChoice(choiceId);
  render();
}

async function goToDebrief() {
  const ending = engine.getEnding();
  if (ending && state.status !== 'completed') {
    await engine.completeSession(ending.id);
  }
  state.screen = 'debrief';
  render();
}

// ------- Screen routing -------

function goTitle() { state.screen = 'title'; render(); }
function goGame() { state.screen = 'game'; render(); }
function goMindPalace() { state.screen = 'mind-palace'; render(); }
function goNotebook() { state.screen = 'notebook'; render(); }

async function resetSession() {
  clearAutoAdvance();
  // Delete current session and start fresh. Cascade deletes choices/snippets/clusters.
  try {
    await supabase.from('sessions').delete().eq('id', state.sessionId);
  } catch (e) { console.error('reset delete failed', e); }

  const created = await createSession(state.playerId, state.caseId, state.caseData.startNode);
  state.sessionId = created.id;
  state.currentNode = created.current_node;
  state.rapport = created.rapport;
  state.status = 'in_progress';
  state.endingId = null;
  state.autoAdvance = created.auto_advance;
  state.choices = [];
  state.snippets = {};
  state.clusters = {};
  resetDialogueUi();
  state.settingsOpen = false;
  state.screen = 'game';
  render();
}

async function onToggleAutoAdvance(checked) {
  await engine.setAutoAdvance(checked);
  // If turning on while current line is already finished and next step exists,
  // start the auto-advance timer immediately instead of waiting for next line.
  if (checked && state.lineDone && state.screen === 'game') {
    if (engine.hasMoreLines() || engine.isTerminal()) scheduleAutoAdvance();
  } else if (!checked) {
    clearAutoAdvance();
  }
  render();
}

// ------- Event wiring -------

function wireActions() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    switch (action) {
      case 'start-new-case':
      case 'resume-case':
        if (state.status === 'completed') {
          resetSession();
        } else {
          goGame();
        }
        break;
      case 'open-mind-palace': goMindPalace(); break;
      case 'close-mind-palace': goGame(); break;
      case 'open-notebook': goNotebook(); break;
      case 'close-notebook': goGame(); break;
      case 'open-settings':
      case 'open-settings-from-title':
        state.settingsOpen = true; render(); break;
      case 'close-settings':
        state.settingsOpen = false; render(); break;
      case 'advance-line':
        onDialogueTap(); break;
      case 'reset-session':
        resetSession(); break;
      case 'return-to-title':
        resetSession().then(() => { state.screen = 'title'; render(); });
        break;
      case 'present':
        // M1: noop
        break;
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-bind="autoAdvanceToggle"]')) {
      onToggleAutoAdvance(e.target.checked);
    }
  });

  // Keyboard: space/enter advance dialogue
  document.addEventListener('keydown', (e) => {
    if (state.screen !== 'game') return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      onDialogueTap();
    }
  });
}

// Re-render helper exported for state.showToast
export { render };

setRenderCallback(render);
wireActions();
boot();
