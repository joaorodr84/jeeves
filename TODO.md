# Jeeves TODO

## Priorities

Every item below carries a `[P1]`–`[P4]` tag:

- **P1 — do next.** A measured cost or a known-broken thing that is
  already diagnosed; the work is scoped and the payoff is immediate.
- **P2 — queued.** Real value or real risk, but needs a decision made
  or a self-contained chunk of work first.
- **P3 — wanted, not urgent.** Features and cleanups worth building
  when there's room; nothing else depends on them.
- **P4 — parked.** Latent, speculative, or large-and-unscoped. Revisit
  when something forces the question.

Every item also carries a `JEEVES-<n>` ID, registered in [TASKS.md](TASKS.md).
The ID is claimed when the item is written and stays with it through the commit
that closes it; the priority changes, the ID never does.

- **[P1] JEEVES-2** — Verify the full feature set in a real Gmail inbox.
  JEEVES-1, -3, -4, -5, and -6 all shipped untested in a browser — ported
  from scripts drafted and reasoned about outside a live Gmail session,
  resting on selectors (`tr.zA`, `.yW span[name/email]`, `div[gh="tm"]`,
  `div[role="checkbox"]`) that are Gmail's real but undocumented markup,
  never confirmed against a live page. Install the script for real and
  confirm: the button appears in Gmail's own toolbar, next to its
  button group (not off on its own); a click sorts the loaded rows by
  sender; the sort survives Gmail's own re-renders (open/delete/archive
  a message and check it stays sorted); and once sorted, each sender
  with 2+ messages shows a group checkbox that selects/deselects every
  row for that sender and actually works with bulk delete/archive (not
  just a cosmetic checked state) — before trusting any of it.
