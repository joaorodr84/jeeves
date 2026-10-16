// ==UserScript==
// @name         Jeeves
// @namespace    https://github.com/joaorodr84/jeeves
// @version      0.4.0
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
  const GROUP_ID = 'jeeves-button-group';

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

  // True once every row is already in sender order. Used both to skip a
  // no-op reorder on manual clicks and, more importantly, to stop the
  // auto-resort (below) from looping: re-appending nodes via a
  // DocumentFragment moves them even when the end order is unchanged,
  // which would otherwise re-trigger the MutationObserver on every
  // automatic resort, forever.
  function isSorted(rows) {
    for (let i = 1; i < rows.length; i++) {
      if (getSenderKey(rows[i - 1]).localeCompare(getSenderKey(rows[i])) > 0) return false;
    }
    return true;
  }

  function sortInbox() {
    const rows = getRows();
    if (rows.length < 2 || isSorted(rows)) return;

    const tbody = rows[0].parentElement;
    const sorted = rows.slice().sort((a, b) => getSenderKey(a).localeCompare(getSenderKey(b)));

    // Re-append in sorted order. Appending an existing node moves it,
    // it doesn't duplicate it.
    const frag = document.createDocumentFragment();
    sorted.forEach(row => frag.appendChild(row));
    tbody.appendChild(frag);
  }

  // Set once the user has asked for a sort, so the auto-resort (below)
  // only kicks in after that — otherwise every inbox would get
  // force-sorted on load whether or not sorting was ever requested.
  let sortEnabled = false;

  // Gmail marks its main list toolbar (the row with the select-all
  // checkbox, refresh, and the "More" overflow menu) with gh="tm". Unlike
  // class names, which Gmail rewrites across visual refreshes, this
  // attribute has stayed put for years and is what other Gmail
  // userscripts anchor on for the same reason.
  function findToolbar() {
    return document.querySelector('div[gh="tm"]');
  }

  // A plain up/down sort glyph, drawn inline so no icon font or sprite
  // sheet is needed. currentColor picks up whatever color Gmail's own
  // button classes set for the active theme (light, dark, or a custom
  // one), once those classes are copied onto the button below.
  function buildSortIcon() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.style.fill = 'currentColor';
    svg.style.pointerEvents = 'none';
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z');
    svg.appendChild(path);
    return svg;
  }

  function addButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const toolbar = findToolbar();
    // Fall back to the old search-bar anchor if gh="tm" ever stops
    // matching (Gmail markup is undocumented, see CLAUDE.md) so the
    // button degrades instead of silently disappearing.
    const fallbackParent = !toolbar && document.querySelector('form[role="search"]');
    if (!toolbar && !(fallbackParent && fallbackParent.parentElement)) return;

    const btn = document.createElement('div');
    btn.id = BUTTON_ID;
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.title = 'Jeeves: sort the currently loaded inbox rows by sender (one page / ~50 at a time)';
    btn.setAttribute('aria-label', 'Sort by sender');
    btn.appendChild(buildSortIcon());

    if (toolbar) {
      // Gmail's own icon buttons (refresh, more) carry classes that
      // drive their hover circle and theme colors; Gmail's CSS targets
      // those classes, not element identity. Copying just the class
      // list (not cloning the node) gets pixel-matching, theme-aware
      // styling for free, without carrying over the template's
      // `jsaction` attribute, which would otherwise make Gmail's own
      // click delegation fire the template's action (e.g. refresh) on
      // top of ours.
      const template = toolbar.querySelector('[role="button"]');
      if (template) btn.className = template.className;
      btn.removeAttribute('jsaction');

      const group = document.createElement('div');
      group.id = GROUP_ID;
      group.setAttribute('role', 'group');
      group.style.cssText = [
        'display:flex',
        'align-items:center',
        'margin-left:8px',
        'padding-left:8px',
        // A hairline divider like the ones between Gmail's own toolbar
        // groups, in a translucent currentColor so it reads correctly
        // on light and dark themes alike without a hardcoded grey.
        'border-left:1px solid color-mix(in srgb, currentColor 24%, transparent)'
      ].join(';');
      group.appendChild(btn);

      // toolbar (div[gh="tm"]) lays out its own button group and the
      // "1-50 of 1,234" pagination controls as side-by-side top-level
      // children (flex, space-between). Appending straight to toolbar
      // put our group after whichever of those happened to be last in
      // the DOM — in practice, past the pagination controls, not next
      // to the buttons. Instead, walk up from the template button to
      // the toolbar's direct child that contains it, and insert right
      // after that child, so our group sits immediately next to
      // Gmail's own button group regardless of what else shares the row.
      let anchor = template;
      while (anchor && anchor.parentElement !== toolbar) {
        anchor = anchor.parentElement;
      }
      if (anchor) {
        anchor.after(group);
      } else {
        toolbar.appendChild(group);
      }
    } else {
      // Fallback styling approximates Gmail's light-theme pill buttons;
      // there's no native template to copy from outside the toolbar.
      btn.style.cssText = [
        'margin-left:12px',
        'padding:6px 14px',
        'border:1px solid #dadce0',
        'border-radius:16px',
        'background:#fff',
        'color:#444',
        'font-size:13px',
        'cursor:pointer',
        'display:inline-flex'
      ].join(';');
      fallbackParent.parentElement.appendChild(btn);
    }

    const triggerSort = () => {
      sortEnabled = true;
      sortInbox();
    };
    btn.addEventListener('click', triggerSort);
    btn.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerSort();
      }
    });
  }

  // Gmail is a single-page app that constantly re-renders parts of the
  // DOM, so we keep checking that our button is still there and re-add
  // it if Gmail wiped it out. Once sorting has been requested, the same
  // observer also re-applies the sort: opening, deleting, or archiving a
  // message makes Gmail redraw the row list from its own (date-ordered)
  // model, which would otherwise silently undo the sort. sortInbox()'s
  // own isSorted() check keeps this from looping on the mutations the
  // resort itself causes.
  if (typeof document !== 'undefined') {
    const observer = new MutationObserver(() => {
      addButton();
      if (sortEnabled) sortInbox();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    addButton();
  }

  // Exposes the pure, DOM-call-but-no-page-required function for the
  // Node test suite under test/ — everything else here needs a real
  // Gmail page and is exercised manually per CLAUDE.md's Tests section.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getSenderKey, isSorted };
  }
})();
