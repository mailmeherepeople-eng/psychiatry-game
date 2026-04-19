// Notebook screen. M1: empty list, Present button disabled.
// Architected so future cases can push items here via addNotebookItem().

import { state } from './state.js';

export function renderNotebook(rootEl) {
  const list = rootEl.querySelector('[data-bind="notebookList"]');
  const empty = rootEl.querySelector('.nb-empty');
  const presentBtn = rootEl.querySelector('[data-action="present"]');

  const items = state.notebookItems || [];
  list.innerHTML = '';
  if (items.length === 0) {
    empty.hidden = false;
    presentBtn.disabled = true;
    return;
  }
  empty.hidden = true;
  presentBtn.disabled = false;
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item.label;
    list.appendChild(li);
  }
}
