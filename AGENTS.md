# AGENTS.md

Instructions for AI coding agents working in this repository. These rules are
bindings, not suggestions, and every one of them is enforced by a tool listed
below — an agent that follows them passes the checks; one that does not fails
them.

## What this repository is

A VS Code extension, `command-variable`, by rioj7. Plain CommonJS JavaScript
(no transpilation), ES5 style, zero runtime dependencies. Two entry points:
`extension.js` (desktop, Node APIs allowed) and `out/extension-common.js`
(rollup bundle for web, where only the `vscode` API exists).

## The rules that are checked automatically

Run `npm run check:docs` before committing anything under `README.md`,
`CONTRIBUTING.md`, `docs/diataxis-docs/`, or `scripts/`:

| Rule | Enforced by |
| --- | --- |
| Documentation follows [Diátaxis](https://diataxis.fr): a page is a tutorial, how-to, explanation or reference, and lives in the folder matching its type | `npm run check:docs-placement` |
| Prose is audience-gated: pages in `extension-user/` never mention build tooling (`rollup`, `vitest`, `mocha`, `npm run`, `out/`, `extension-common`, `require(`) outside code fences | `npm run check:docs-placement` |
| `audience`, `diataxis`, `reading-time` and `minimum-extension-version` front matter is present and truthful; `reading-time` matches the computed figure | `npm run check:docs-budget` |
| A paragraph is ONE physical line. Never insert a newline to wrap prose — the editor soft-wraps it. Newlines exist only where markdown structure requires them (front matter, audience header, headings, fences, tables, blockquotes, list items, blank lines between blocks) | `npm run check:docs-softwrap` |
| Relative links and in-repo anchors resolve; anchors are GitHub-style slugs | `npm run check:docs-links` |

Run `npm run verify` before committing anything under `extension.js`,
`extension-common.js`, `utils.js`, `uuid.js`, `yaml.js`, `test/` or
`scripts/`: lint, unit tests, coverage, build, bundle check and audit.

## Docs conventions (style guide)

The full contract is `docs/diataxis-docs/extension-author/reference/style-guide.md`
and `vocabulary.md`. The rules most often broken by AI-generated text:

- Audience naming is deliberate: `extension-user` (machine form) in front
  matter and paths; "Extension user" (human form) in prose. Never shorten
  either form after first mention.
- One instruction per sentence, active voice, simple present.
- No metaphors, idioms or Latin abbreviations. "Check" not "gate"; "for
  example" not "e.g.".
- One term per item, permanently: a `launch.json` file is never also "the
  config".
- Every page ends with something the reader can verify: a produced result
  (tutorials), a "you have succeeded when" section (how-tos), or nothing
  special (reference/explanation).
- How a page is written is a spec for its test: do not skip steps when
  writing or editing docs pages.

## Editing docs pages

- Edit `README.md`, `CONTRIBUTING.md` and everything under
  `docs/diataxis-docs/` in this repository only; `CHANGELOG.md` records
  user-visible changes under `Unreleased`.
- Reading time in front matter must be re-synced after editing prose
  (`node scripts/_sync-reading-times.js` fixes drift; the budget checker
  names both figures when they disagree).
- Code fences are verbatim: never reformat, reindent or "fix" JSON inside
  fences without checking it still works in a real `tasks.json`/`launch.json`.
- Mermaid diagrams are part of page content; after editing one, render it
  locally to confirm it still parses.
- `scripts/_*.js` are one-off migration generators, kept for provenance. They
  are not part of the toolchain; do not wire them into npm scripts or CI.

## Commit conventions

- Commit messages: `docs: {subject}` for documentation, conventional-commit
  style elsewhere (`fix:`, `chore:`, `test:` ...).
- Never credit an AI assistant by product name; credit the model name if
  credit is due (`Co-authored-by: <Model> <model@...>`).
- Never commit plan or scratch files (`.vscode/chat/`, `.spotcheck/`,
  worktree scratch).

## Environment

- Node version is pinned in `.tool-versions`; use it.
- `npm ci` after cloning; the `vscode` module is a generated local shim, not a
  real dependency.
- Integration tests need a real VS Code download; they run via
  `npm run test:integration` locally and in CI, never as part of `verify`.