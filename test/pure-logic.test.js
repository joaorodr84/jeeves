const assert = require('node:assert');
const { test } = require('node:test');
const { getSenderKey, isSorted, groupBySender } = require('../jeeves.user.js');

// Minimal stand-in for the DOM element getSenderKey reads from — a row
// with a querySelector that returns a sender span with name/email
// attributes, or null when the row has neither.
function fakeRow({ name, email, text } = {}) {
  return {
    querySelector() {
      if (name === undefined && email === undefined && text === undefined) return null;
      return {
        getAttribute(attr) {
          if (attr === 'name') return name ?? null;
          if (attr === 'email') return email ?? null;
          return null;
        },
        textContent: text ?? '',
      };
    },
  };
}

test('getSenderKey prefers the display name', () => {
  const row = fakeRow({ name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.strictEqual(getSenderKey(row), 'ada lovelace');
});

test('getSenderKey falls back to the email address when there is no name', () => {
  const row = fakeRow({ email: 'ADA@EXAMPLE.COM' });
  assert.strictEqual(getSenderKey(row), 'ada@example.com');
});

test('getSenderKey falls back to visible text when there is no name or email attribute', () => {
  const row = fakeRow({ text: '  Ada  ' });
  assert.strictEqual(getSenderKey(row), 'ada');
});

test('getSenderKey returns an empty string when the row has no sender span at all', () => {
  const row = fakeRow();
  assert.strictEqual(getSenderKey(row), '');
});

// isSorted gates both the manual sort (skip a no-op reorder) and the
// auto-resort triggered by Gmail's own re-renders (skip re-sorting, which
// would otherwise re-trigger the MutationObserver on every pass, forever).
// A regression here breaks that loop guard, not just the no-op skip, so it
// gets its own coverage rather than riding along with getSenderKey's.

test('isSorted is true for rows already in sender order', () => {
  const rows = [fakeRow({ name: 'Ada' }), fakeRow({ name: 'Bob' }), fakeRow({ name: 'Cat' })];
  assert.strictEqual(isSorted(rows), true);
});

test('isSorted is false when a later row sorts before an earlier one', () => {
  const rows = [fakeRow({ name: 'Bob' }), fakeRow({ name: 'Ada' })];
  assert.strictEqual(isSorted(rows), false);
});

test('isSorted is true for fewer than two rows', () => {
  assert.strictEqual(isSorted([]), true);
  assert.strictEqual(isSorted([fakeRow({ name: 'Ada' })]), true);
});

// groupBySender only collapses *consecutive* rows — it's meant to run
// after sortInbox() has already put same-sender rows next to each other,
// not to find every sender's rows wherever they sit in the list.

test('groupBySender collapses consecutive rows from the same sender', () => {
  const ada1 = fakeRow({ name: 'Ada' });
  const ada2 = fakeRow({ name: 'Ada' });
  const bob = fakeRow({ name: 'Bob' });
  const groups = groupBySender([ada1, ada2, bob]);
  assert.strictEqual(groups.length, 2);
  assert.deepStrictEqual(groups[0], { key: 'ada', rows: [ada1, ada2] });
  assert.deepStrictEqual(groups[1], { key: 'bob', rows: [bob] });
});

test('groupBySender treats non-adjacent rows from the same sender as separate groups', () => {
  const ada1 = fakeRow({ name: 'Ada' });
  const bob = fakeRow({ name: 'Bob' });
  const ada2 = fakeRow({ name: 'Ada' });
  const groups = groupBySender([ada1, bob, ada2]);
  assert.strictEqual(groups.length, 3);
});

test('groupBySender returns no groups for an empty row list', () => {
  assert.deepStrictEqual(groupBySender([]), []);
});
