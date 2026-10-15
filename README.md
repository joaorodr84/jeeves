# Jeeves

*Just Email Engine, Very Efficient Script.*

A small Tampermonkey userscript that adds a "Sort by sender" button to Gmail's
toolbar. Gmail has no built-in way to sort or group the inbox by sender — this
gives you a one-click, local way to do it without an extension.

## What it does

- Adds a button next to Gmail's search bar.
- Clicking it sorts the inbox rows **currently loaded on the page** (one page,
  typically ~50 messages) alphabetically by sender name, falling back to the
  sender's email address when no display name is available.
- Nothing is sent anywhere and nothing is deleted or modified — it only
  reorders rows already rendered in your own browser tab.

## What it doesn't do (yet)

- It doesn't sort your whole inbox history, only what Gmail has already
  rendered on the current page.
- It doesn't persist the sort across a reload or a new page of messages.
- It doesn't offer a reverse order or an "ungroup" button.

See [TODO.md](TODO.md) for what's planned and [CHANGELOG.md](CHANGELOG.md) for
what's shipped.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open Tampermonkey's dashboard → "Create a new script".
3. Delete the placeholder content and paste in [`jeeves.user.js`](jeeves.user.js).
4. Save (Ctrl/Cmd+S) and reload Gmail.

## Why it's fragile by nature

Gmail's inbox markup is not documented or guaranteed stable by Google. This
script reads it as it exists today; if Gmail changes its internal structure,
the script can silently stop finding rows. See the note in
[CLAUDE.md](CLAUDE.md) for what to check when that happens.

## Development

```sh
npm test
```

runs the pure-logic test suite (`test/pure-logic.test.js`) — there is no build
step; the script is used as-is by Tampermonkey. Project conventions (branching,
commits, task IDs, versioning) are in [CLAUDE.md](CLAUDE.md).
