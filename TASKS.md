# Jeeves task ledger

Every task carries an ID of the form `JEEVES-<n>`. IDs are assigned once, never
reused, and never renumbered.

**Next ID to assign: `JEEVES-8`**

If this file and history ever disagree, history wins:

```sh
git log --oneline | grep -oE 'JEEVES-[0-9]+' | sort -t- -k2 -n | tail -1
```

## How IDs work

- **An ID is claimed when a task is written down, not when it ships.** A new
  `TODO.md` entry gets its ID immediately; the commit that closes it reuses that
  same ID.
- **One ID per task, not per commit.** A feature landed over two commits carries
  the same ID in both subjects. A commit closing two tasks names both.
- Commit subject: `feat(toolbar): Add a reverse-sort toggle (JEEVES-2)` —
  Conventional Commits, with the ID in parentheses at the end. See **Commit
  messages** in `CLAUDE.md`.
- Branch name: `jeeves-2-add-reverse-sort-toggle`. The ID prefix is wanted here;
  the `p1-`/`p2-` priority prefix banned in `CLAUDE.md` is a different thing and
  still banned.

## Open

| ID | Task | Status | Commit |
| --- | --- | --- | --- |
| JEEVES-2 | Verify the full feature set in a real Gmail inbox | open | — |

## Done

| ID | Task | Status | Date | Commit |
| --- | --- | --- | --- | --- |
| JEEVES-1 | Add a toolbar button that sorts loaded inbox rows by sender | done | 2026-10-16 | — |
| JEEVES-3 | Move the sort-by-sender button into Gmail's own toolbar, styled natively | done | 2026-10-17 | — |
| JEEVES-4 | Position the sort button group next to Gmail's own toolbar button group | done | 2026-10-17 | — |
| JEEVES-5 | Make the sender sort persist across Gmail's own re-renders (open/delete/archive) | done | 2026-10-17 | — |
| JEEVES-6 | Group emails by sender with a per-group select-all checkbox | done | 2026-10-17 | — |
| JEEVES-7 | Move the group-select checkbox out of the email row into its own header row | done | 2026-10-17 | — |
