// ==UserScript==
// @name         Jeeves
// @namespace    https://github.com/joaorodr84/jeeves
// @version      0.2.0
// @description  Adds a toolbar button to Gmail that sorts the currently loaded inbox rows by sender.
// @author       Joao Rodrigues
// @match        https://mail.google.com/mail/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/joaorodr84/jeeves/main/jeeves.user.js
// @downloadURL  https://raw.githubusercontent.com/joaorodr84/jeeves/main/jeeves.user.js
// ==/UserScript==

(function () {
  'use strict';

  const BUTTON_ID = 'jeeves-sort-by-sender-btn';

  // Gmail's thread rows. "zA" has been the row class in Gmail's standard
  // HTML for a long time, but Google doesn't document this and it can
  // change. If the script stops working, that's the first thing to check
  // (right-click a row -> Inspect -> look at the <tr> class).
  function getRows() {
    return Array.from(document.querySelectorAll('tr.zA'));
  }

  // Sender info lives on a <span> inside the row with "name" / "email"
  // attributes (that's how Gmail stores it even though only the name is
  // shown). Fall back to visible text if those attributes are missing.
  function getSenderKey(row) {
    const senderEl = row.querySelector('.yW span[name], .yW span[email]');
    if (senderEl) {
      const name = senderEl.getAttribute('name');
      const email = senderEl.getAttribute('email');
      return (name || email || senderEl.textContent || '').trim().toLowerCase();
    }
    return '';
  }

  function sortInbox() {
    const rows = getRows();
    if (rows.length < 2) return;

    const tbody = rows[0].parentElement;
    const sorted = rows.slice().sort((a, b) => getSenderKey(a).localeCompare(getSenderKey(b)));

    // Re-append in sorted order. Appending an existing node moves it,
    // it doesn't duplicate it.
    const frag = document.createDocumentFragment();
    sorted.forEach(row => frag.appendChild(row));
    tbody.appendChild(frag);
  }

  function addButton() {
    if (document.getElementById(BUTTON_ID)) return;

    // The search bar's row is a reasonably stable place to anchor a
    // custom button without fighting Gmail's own toolbar re-renders.
    const searchBar = document.querySelector('form[role="search"]');
    if (!searchBar || !searchBar.parentElement) return;

    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.textContent = 'Sort by sender';
    btn.title = 'Jeeves: sort the currently loaded inbox rows by sender (one page / ~50 at a time)';
    btn.style.cssText = [
      'margin-left:12px',
      'padding:6px 14px',
      'border:1px solid #dadce0',
      'border-radius:16px',
      'background:#fff',
      'color:#444',
      'font-size:13px',
      'cursor:pointer'
    ].join(';');
    btn.addEventListener('mouseenter', () => btn.style.background = '#f1f3f4');
    btn.addEventListener('mouseleave', () => btn.style.background = '#fff');
    btn.addEventListener('click', sortInbox);

    searchBar.parentElement.appendChild(btn);
  }

  // Gmail is a single-page app that constantly re-renders parts of the
  // DOM, so we keep checking that our button is still there and re-add
  // it if Gmail wiped it out.
  if (typeof document !== 'undefined') {
    const observer = new MutationObserver(() => addButton());
    observer.observe(document.body, { childList: true, subtree: true });
    addButton();
  }

  // Exposes the pure, DOM-call-but-no-page-required function for the
  // Node test suite under test/ — everything else here needs a real
  // Gmail page and is exercised manually per CLAUDE.md's Tests section.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getSenderKey };
  }
})();
