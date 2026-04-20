import { state, resetDialogueUi, setRenderCallback } from './state.js';
import { supabase, upsertCaseRow, loadActiveSession, createSession, updateSession, loadChoices, loadSnippets, loadClusters } from './supabase-client.js';
import { getOrCreateAnonId, ensurePlayer } from './player.js';
import { loadCase } from './case-loader.js';
import * as engine from './engine.js';
import { renderMindPalace } from './mind-palace.js';
import { renderNotebook } from './notebook.js';
import * as pwDialogue from './pw-dialogue.js';
import * as clinicRoam from './clinic-roam.js';
import { INTRO_SCRIPT, INTRO_CHARACTERS } from './clinic-intro.js';

const TYPE_SPEED_MS = 22;
const AUTO_ADVANCE_DELAY_MS = 1800;

let typewriterToken = 0;
let currentTypewriterKey = null; // "nodeId:lineIndex" — prevents duplicate starts
let autoAdvanceTimer = null;

// Side systems: Phoenix Wright intro dialogue + Edgeworth-style roam.
let pwActive = false;
let roamActive = false;
let roamPendingStart = null; // { roomId, spawn } — overrides the default 'reception' spawn

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

  syncSideSystems();

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

function syncSideSystems() {
  // Phoenix Wright intro: start once entering clinic-intro.
  if (state.screen === 'clinic-intro' && !pwActive) {
    pwActive = true;
    // Let the screen become visible, then boot the dialogue.
    setTimeout(() => {
      pwDialogue.startDialogue(
        INTRO_SCRIPT,
        INTRO_CHARACTERS,
        '[data-screen="clinic-intro"]',
        () => {
          pwActive = false;
          state.screen = 'clinic-roam';
          render();
        },
      );
    }, 0);
  } else if (state.screen !== 'clinic-intro' && pwActive && !pwDialogue.isActive()) {
    pwActive = false;
  }

  // Clinic roam: start once entering clinic-roam.
  if (state.screen === 'clinic-roam' && !roamActive) {
    roamActive = true;
    const start = roamPendingStart || { roomId: 'reception', spawn: null };
    roamPendingStart = null;
    setTimeout(() => {
      clinicRoam.startRoam(start.roomId, start.spawn, {
        onPatientInteract: () => {
          clinicRoam.stopRoam();
          roamActive = false;
          state.screen = 'game';
          render();
        },
      });
    }, 0);
  } else if (state.screen !== 'clinic-roam' && roamActive) {
    clinicRoam.stopRoam();
    roamActive = false;
  }
}

const DOCTOR = {
  name: 'Dr. Kuroi',
  color: '#3a4456',
  sprite: 'assets/characters/doctor.svg',
};
const PATIENT_SPRITE_MAP = {
  'case-01-gad-tutorial': 'assets/characters/maya.svg',
};

function renderGame() {
  const { caseData } = state;
  if (!caseData) return;

  // Rapport badge (top-left).
  const rapportEl = document.querySelector('[data-bind="rapport"]');
  rapportEl.textContent = String(state.rapport);
  rapportEl.classList.toggle('rapport-positive', state.rapport > 0);
  rapportEl.classList.toggle('rapport-negative', state.rapport < 0);

  // The patient-name-plate top-right is kept hidden — the dialogue name pill
  // already shows the current speaker, no need to duplicate.
  const namePlateEl = document.querySelector('[data-bind="patientName"]');
  if (namePlateEl) {
    namePlateEl.textContent = caseData.patient.name;
    namePlateEl.hidden = true;
  }

  const node = engine.getCurrentNodeData();
  if (!node) return;

  const line = engine.getCurrentLine();
  if (!line) return;

  const lineTextEl = document.querySelector('[data-bind="lineText"]');
  const choicesEl = document.querySelector('[data-bind="choices"]');
  const dialogueBox = document.querySelector('.dialogue-box');
  const speakerEl = document.querySelector('[data-bind="speaker"]');
  const stageEl = document.querySelector('[data-bind="gameStage"]');
  const portraitImg = document.querySelector('[data-bind="gamePortraitImg"]');

  dialogueBox.classList.toggle('line-done', state.lineDone);

  // Determine who is "on stage" for this line/state.
  // Rules:
  //   - narration  → no portrait, italic box, no name tag
  //   - speaker === 'patient'  → patient on right
  //   - speaker === 'doctor'   → doctor on left
  //   - line done + choices pending → doctor on left (player is about to speak)
  //   - otherwise → patient on right (default for unknown speakers in this case)
  const choicesPending =
    state.lineDone && !engine.hasMoreLines() && !engine.isTerminal() &&
    Array.isArray(node.choices) && node.choices.length > 0;

  // Stage portrait matches the line's speaker. Player choices are a menu;
  // they don't change who's on screen (just like Phoenix Wright).
  let stageSpeaker;
  if (node.speaker === 'narration') stageSpeaker = 'narration';
  else if (node.speaker === 'doctor') stageSpeaker = 'doctor';
  else stageSpeaker = 'patient';
  stageEl.dataset.speaker = stageSpeaker;

  if (portraitImg) {
    if (stageSpeaker === 'narration') {
      portraitImg.hidden = true;
    } else {
      const src = stageSpeaker === 'doctor'
        ? DOCTOR.sprite
        : (PATIENT_SPRITE_MAP[caseData.id] || 'assets/characters/maya.svg');
      if (portraitImg.getAttribute('src') !== src) {
        portraitImg.setAttribute('src', src);
      }
      portraitImg.hidden = false;
    }
  }

  // Box styling: italic + centered for narration lines, regardless of who is
  // "on stage" for the pending choices.
  dialogueBox.classList.toggle('is-narration', node.speaker === 'narration');

  // Name tag: reflects the *line's* speaker. Narration hides it.
  if (node.speaker === 'narration') {
    speakerEl.hidden = true;
    speakerEl.textContent = '';
  } else if (node.speaker === 'doctor') {
    speakerEl.hidden = false;
    speakerEl.textContent = DOCTOR.name;
  } else {
    speakerEl.hidden = false;
    speakerEl.textContent = caseData.patient.name;
  }

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
        startNewCaseFlow();
        break;
      case 'resume-case':
        goGame();
        break;
      case 'advance-pw':
        pwDialogue.advanceDialogue();
        break;
      case 'skip-intro':
        pwDialogue.skipDialogue();
        break;
      case 'clinic-interact':
        // The clinic roam module handles this via its own listener; no-op here.
        break;
      case 'exit-to-roam':
        exitCaseToRoam();
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

  // Keyboard: space/enter advance dialogue in game or intro.
  document.addEventListener('keydown', (e) => {
    if (state.screen === 'game') {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onDialogueTap();
      }
    } else if (state.screen === 'clinic-intro') {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        pwDialogue.advanceDialogue();
      }
    }
    // clinic-roam handles its own keys inside that module
  });
}

function exitCaseToRoam() {
  // Leave the interview mid-session. Session state (currentNode, rapport,
  // choices, snippets) is already persisted, so walking back into Maya will
  // resume the case at the current node.
  clearAutoAdvance();
  currentTypewriterKey = null;
  resetDialogueUi();
  // Spawn just inside the interview room, past the door.
  roamPendingStart = { roomId: 'patient-room', spawn: { x: 200, y: 482 } };
  state.screen = 'clinic-roam';
  render();
}

async function startNewCaseFlow() {
  // If the previous session is completed, reset it first so the Case 01 state
  // is fresh when the player eventually walks into the interview room.
  if (state.status === 'completed') {
    await resetSession();
  }
  state.screen = 'clinic-intro';
  render();
}

// Re-render helper exported for state.showToast
export { render };

setRenderCallback(render);
wireActions();
boot();
