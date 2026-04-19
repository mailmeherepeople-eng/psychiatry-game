// Single source of truth for runtime state.
// Mutations happen through action functions in other modules; render() reads here.

export const state = {
  playerId: null,
  anonId: null,

  // Loaded case
  caseData: null,
  caseId: null,

  // Session
  sessionId: null,
  currentNode: null,
  rapport: 0,
  status: 'in_progress',
  endingId: null,
  autoAdvance: false,

  // Dialogue UI
  lineIndex: 0,
  lineDone: false,

  // Snippets: { [snippetId]: { id, text, x, y, clusterId } }
  snippets: {},

  // Clusters: { [clusterId]: { id, memberSnippetIds: [] } }
  clusters: {},

  // Choices made so far (ordered). { ordinal, nodeId, choiceId, rapportDelta, chosenAt }
  choices: [],

  // Routing
  screen: 'title', // title | game | mind-palace | notebook | debrief
  settingsOpen: false,

  // Transient
  toast: null,
};

export function resetDialogueUi() {
  state.lineIndex = 0;
  state.lineDone = false;
}

let renderCallback = () => {};
export function setRenderCallback(fn) { renderCallback = fn; }
export function triggerRender() { renderCallback(); }

export function showToast(message, ms = 1800) {
  state.toast = message;
  renderCallback();
  setTimeout(() => {
    if (state.toast === message) {
      state.toast = null;
      renderCallback();
    }
  }, ms);
}
