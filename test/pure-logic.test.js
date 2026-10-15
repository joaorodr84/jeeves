const assert = require('node:assert');
const { test } = require('node:test');
const { getSenderKey } = require('../jeeves.user.js');

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
