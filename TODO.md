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

- **[P1] JEEVES-2** — Verify the sort-by-sender button in a real Gmail inbox.
  JEEVES-1 shipped untested in a browser: it's a port of a script drafted in
  a separate conversation, and the row/sender selectors (`tr.zA`,
  `.yW span[name/email]`) are Gmail's real but undocumented markup, never
  confirmed against a live page. Install the script for real and confirm
  the button appears, sorts correctly, and survives Gmail's own re-renders
  before trusting it.
