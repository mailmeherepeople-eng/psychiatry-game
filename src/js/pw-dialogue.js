// Phoenix Wright-style dialogue module.
// Plays a scripted sequence with portrait stage + typewriter dialogue box.
//
// Script: array of { speaker, text, show?: [id,id], location?: string }
//   - speaker: character id, or 'narration' for box-only
//   - show: which character portraits to display (defaults to [speaker])
// Characters: { [id]: { name, label, color } }

const TYPE_SPEED_MS = 22;

let state = null;
let typewriterToken = 0;
let onComplete = null;

export function startDialogue(script, characters, containerSelector, onDone) {
  const container = document.querySelector(containerSelector);
  if (!container) { console.error('pw-dialogue: container not found', containerSelector); return; }

  onComplete = onDone || (() => {});
  state = {
    script,
    characters,
    container,
    index: 0,
    lineDone: false,
  };
  renderScene();
}

export function advanceDialogue() {
  if (!state) return;
  if (!state.lineDone) {
    completeTypewriterNow();
    return;
  }
  state.index += 1;
  if (state.index >= state.script.length) {
    endDialogue();
    return;
  }
  renderScene();
}

export function skipDialogue() {
  if (!state) return;
  endDialogue();
}

export function isActive() {
  return !!state;
}

// ----- internal -----

function renderScene() {
  if (!state) return;
  const line = state.script[state.index];
  if (!line) { endDialogue(); return; }

  const bg = state.container.querySelector('.pw-background');
  if (line.location && bg) bg.dataset.location = line.location;

  const leftEl = state.container.querySelector('.pw-portrait-left');
  const rightEl = state.container.querySelector('.pw-portrait-right');

  const shown = line.show || (line.speaker !== 'narration' ? [line.speaker] : []);
  renderPortrait(leftEl, shown[0], state.characters, line.speaker);
  renderPortrait(rightEl, shown[1], state.characters, line.speaker);

  const box = state.container.querySelector('.pw-dialogue-box');
  const nameTag = state.container.querySelector('.pw-name-tag');
  const textEl = state.container.querySelector('.pw-line-text');
  const indicator = state.container.querySelector('.pw-advance-indicator');

  if (line.speaker === 'narration') {
    nameTag.textContent = '';
    nameTag.hidden = true;
    box.classList.add('is-narration');
  } else {
    const ch = state.characters[line.speaker];
    nameTag.textContent = (ch && ch.name) ? ch.name : line.speaker;
    nameTag.hidden = false;
    box.classList.remove('is-narration');
  }

  state.lineDone = false;
  indicator.hidden = true;
  playTypewriter(textEl, line.text, indicator);
}

function renderPortrait(el, id, characters, activeSpeakerId) {
  if (!id) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  const ch = characters[id] || {};
  el.hidden = false;
  el.style.setProperty('--character-color', ch.color || '#6b7a99');
  el.classList.toggle('is-active', id === activeSpeakerId);

  if (!el.querySelector('.pw-portrait-inner') || el.dataset.char !== id) {
    el.dataset.char = id;
    const src = ch.sprite || null;
    el.innerHTML = src
      ? `
        <div class="pw-portrait-inner">
          <img class="pw-portrait-image" src="${src}" alt="">
          <div class="pw-portrait-label"></div>
        </div>
      `
      : `
        <div class="pw-portrait-inner">
          <div class="pw-portrait-silhouette">
            <div class="pw-portrait-body"></div>
          </div>
          <div class="pw-portrait-label"></div>
        </div>
      `;
  }
  const labelEl = el.querySelector('.pw-portrait-label');
  labelEl.textContent = ch.label || ch.name || id;
}

function playTypewriter(el, text, indicator) {
  typewriterToken += 1;
  const myToken = typewriterToken;
  el.textContent = '';
  let i = 0;
  const step = () => {
    if (!state || myToken !== typewriterToken) return;
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i += 1;
      setTimeout(step, TYPE_SPEED_MS);
    } else {
      state.lineDone = true;
      indicator.hidden = false;
    }
  };
  step();
}

function completeTypewriterNow() {
  if (!state) return;
  typewriterToken += 1;
  const line = state.script[state.index];
  const textEl = state.container.querySelector('.pw-line-text');
  const indicator = state.container.querySelector('.pw-advance-indicator');
  textEl.textContent = line.text;
  state.lineDone = true;
  indicator.hidden = false;
}

function endDialogue() {
  typewriterToken += 1;
  const cb = onComplete;
  state = null;
  onComplete = null;
  if (cb) cb();
}
