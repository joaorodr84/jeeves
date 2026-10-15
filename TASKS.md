# Jeeves task ledger

Every task carries an ID of the form `JEEVES-<n>`. IDs are assigned once, never
reused, and never renumbered.

**Next ID to assign: `JEEVES-1`**

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

## Done

| ID | Task | Status | Date | Commit |
| --- | --- | --- | --- | --- |
