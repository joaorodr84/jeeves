# Jeeves

A Tampermonkey userscript that sorts a Gmail inbox by sender. ("Jeeves" — *Just Email Engine, Very
Efficient Script*.) These rules are adapted from [Freecell Plus](https://github.com/joaorodr84/freecell-plus)'s
`CLAUDE.md`, itself adapted from Watchr's — same branching, task-ID, commit and changelog discipline,
minus the pieces that only make sense for a backend with a database (migrations, repair scripts,
ownership checks).

## Branch before you work

Create the branch before the first edit, not after. When a request will change files here (the
script, `TODO.md`, docs), the first action is `git checkout -b <name>` off `main`, so no work lands
in the working tree while `HEAD` is on `main`.

- `<name>` is a plain `kebab-case-summary` of the change, prefixed with the task ID:
  `jeeves-2-add-reverse-sort`. Never use a `p1-`/`p2-` priority prefix.
- Already on a non-`main` branch: stay on it, don't branch off a branch.
- Skip branching for read-only work: answering questions, reading code, testing the script in a
  browser without changing it, investigating a bug without fixing it. Branch the moment an
  investigation becomes a fix.
- Don't ask permission — it's cheap and reversible, and this rule *is* the standing authorization.

The `commit` agent picks up from a feature branch: commit → push → land on `main` → cleanup.
See [.claude/agents/commit.md](.claude/agents/commit.md).

## Task completion workflow

When completing a task:

1. **Make code changes** and commit them (with the task ID in the subject if applicable)
2. **Do bookkeeping before the summary** — update `TASKS.md` (move task to Done, add date) and
   delete the `TODO.md` entry in the closing commit
3. **Then provide the summary** — at this point, the task is truly finished, all work including
   administration is complete

This ensures "finished" is actually finished: feature work, commits, and bookkeeping are all done
in the same flow, not deferred to a follow-up.

## Task IDs

Every task carries an ID `JEEVES-<n>`, registered in [TASKS.md](TASKS.md), which holds the next
free number at the top — take it and increment it in the same commit that uses it.

**Claim the ID when the task is written down, not when it ships.** A new `TODO.md` entry gets one
immediately; the commit that closes it reuses that same ID. One ID per *task*: a feature landed
over two commits repeats the ID in both subjects, and a commit closing two tasks names both —
`(JEEVES-3, JEEVES-4)`.

- Commit subject: `feat: Add a reverse-sort toggle (JEEVES-2)` — ID in parentheses at the end of
  the description, inside the subject line so the recovery grep keeps working. The format around
  it is Conventional Commits (see **Commit messages**).
- Branch name: `jeeves-2-add-reverse-sort-toggle`. The ID prefix is wanted here; the `p1-`/`p2-`
  priority prefix banned below is a different thing and still banned.
- Not every commit needs one. Bookkeeping — a typo fix, a formatting pass, a `TODO.md` tidy —
  goes in unnumbered rather than inflating the counter.
- Never renumber, never reuse, and never rewrite an ID into an existing commit message. History
  is immutable; `TASKS.md` holds the mapping precisely so no rewrite is ever needed.

**When a task ships, its closing commit does the bookkeeping too — in that same commit, not a
follow-up.** Move the task's row from the Open table to the Done table in `TASKS.md` (status
`done`, today's date, Commit column `—`) and delete its `TODO.md` entry. `TODO.md` is the active
backlog and `TASKS.md` the permanent record, so a shipped task leaves `TODO.md` in the commit that
lands it. (A feature landed over several commits removes the entry in the last one, the one that
actually closes it.)

**Before committing work that closes a task**, verify that the commit includes both the feature
changes AND the bookkeeping: the TODO.md deletion and the TASKS.md update. If you've committed
closing work without the bookkeeping, go back and squash or amend it in rather than creating a
follow-up commit.

If `TASKS.md` and history disagree, history wins:

```sh
git log --oneline | grep -oE 'JEEVES-[0-9]+' | sort -t- -k2 -n | tail -1
```

## Commit messages

Jeeves follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>[optional scope][!]: <description> (JEEVES-<n>)

[body]

[footers]
```

- **Type** is required and lowercase. `feat` (a new capability, MINOR) and `fix` (a bug, PATCH)
  are the two the spec defines — reach for them first. Also in use: `docs`, `refactor`, `perf`,
  `test`, `build`, `ci`, `chore`, for changes that genuinely ship no behaviour.
- **Scope** is optional and names the area of the script, never the task: `feat(toolbar):`,
  `fix(sort):`. Leave it off when the change is broad.
- **Description**: plain-language imperative summary, capitalised, no trailing full stop.
- **Task ID** goes last, in parentheses.
- **Body stays substantial**: what was wrong, why this approach, what was decided and rejected,
  how it was verified (in the browser, against Gmail). Governing the subject line is not licence
  to write a one-line commit.
- **Breaking changes** take a `!` before the colon *and* a `BREAKING CHANGE:` footer saying what
  changes for anyone with the script already installed (e.g. a `@grant`/`@match` change, a
  stored-preference change that loses a saved setting).
- **Footers** are `Token: value` with hyphenated tokens; `BREAKING CHANGE` keeps its space.
  `Co-Authored-By:` is a footer like any other.

Worked examples:

```text
feat(toolbar): Add a reverse-sort toggle (JEEVES-2)

fix(sort): Fall back to the email address when the sender has no display name (JEEVES-3)

docs: Note Gmail's row markup is undocumented and can change
```

The last carries no ID on purpose — pure bookkeeping doesn't need one.

## Versions

Jeeves is a single userscript, so the version lives where Tampermonkey reads it: the `@version`
line in the script's own metadata block, not a separate `package.json` or git tag.

- **Bump `@version` in the same commit** that ships the change it describes — a `feat` bumps the
  minor, a `fix`/`perf` bumps the patch, a breaking change (see **Commit messages**) bumps the
  major. Bookkeeping-only commits (`docs`, `chore`, `test`, `ci`) don't touch it.
  Semantic Versioning (`<major>.<minor>.<patch>`) is the scheme — it's just written into the
  script instead of a tag, because that's the field Tampermonkey's update checker actually reads.
- **Tag the commit that bumps it**, `v<version>`, so a version is still one `git describe` away
  from the commit that shipped it: `git tag v0.2.0 <sha>`. Tagging is a manual, deliberate step —
  nothing does it automatically — and never push a tag without deciding to publish that release.
- Jeeves starts at `0.1.0`. There is no `1.0.0` condition yet; revisit once the script has shipped
  enough real changes to know what "stable" means for it.

## Tests

`test/pure-logic.test.js` (Node's built-in `node:test`, run with `npm test`) covers the script's
pure, DOM-free logic: `getSenderKey`, which reads the sort key off a row-like object. The script
is `require()`d directly — a guard at the bottom (`typeof document !== 'undefined'`) skips the
browser bootstrap, and a `module.exports` block at the very end exposes just that function — so
there's no separate copy of the logic to keep in sync.

Everything that touches the DOM (finding rows, reordering them, the toolbar button and its
`MutationObserver`) has no automated coverage and isn't a good near-term candidate — it depends
entirely on Gmail's real, undocumented markup, which is exactly what can't be verified outside a
real browser session.

- **A change to `getSenderKey` gets its test updated in the same commit.**
- **A bug fix to covered logic gets the regression test that would have caught it**, in the same
  commit as the fix.
- **A user-facing or DOM-touching change is still checked in a real Gmail inbox** before it's
  called done — the test suite doesn't substitute for that.
- **A flaky check is a bug in the check**, not something to retry away, the moment there is one.

## Comments

Comments here record *why*, name the alternative that was rejected, and carry the numbers behind
the decision — not what the line below already says.

- **Write the why, not the what.** A comment restating the line below it is noise.
- **Name the alternative that was rejected**, so the next person doesn't spend an afternoon
  rediscovering why it doesn't work — especially anything working around Gmail's own DOM
  structure or re-render behaviour, which won't be obvious from the code alone.
- **Carry the numbers** where there are any.
- **Put it where the decision lives** — above the constant, the selector, the guard — not in a
  document that won't be open when the line is edited.

## Where decisions live

Commit bodies and code comments, and nothing else. No separate decision-record directory: the
commit that made a decision and the comment that guards the line already carry it, and a third
home would fragment the story.

`TODO.md`, `TASKS.md` and `CHANGELOG.md` are the exceptions, and they are not decision records:
what is planned, which ID names it, and what shipped for someone who should not need the repo
open.

## A note on fragility

Gmail's row markup (`tr.zA`, `.yW span[name]`) is undocumented and Google gives no guarantee it
stays stable. When the script silently stops matching anything, that's the first thing to check —
right-click a row → Inspect — before assuming the script logic itself is wrong.
