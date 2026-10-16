# Changelog

All notable changes to Jeeves are documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The version each entry shipped in is the userscript's own `@version` header at
the time (see [CLAUDE.md](CLAUDE.md) → Versions) — entries are grouped by that
version, newest first.

## [Unreleased]

Open work is tracked in [TODO.md](TODO.md), and registered by ID in
[TASKS.md](TASKS.md).

## [0.3.0]

### Changed

- The "Sort by sender" button now lives inside Gmail's own list toolbar
  (the row with the select-all checkbox, refresh, and "More"), in its own
  button group, styled to match Gmail's native icon buttons and whichever
  theme — light, dark, or a custom one — is active. It falls back to the
  previous search-bar placement if Gmail's toolbar can't be found.

## [0.2.0]

### Added

- A "Sort by sender" button next to Gmail's search bar, which sorts the
  inbox rows currently loaded on the page alphabetically by sender name,
  falling back to the sender's email address when no display name is
  available.
