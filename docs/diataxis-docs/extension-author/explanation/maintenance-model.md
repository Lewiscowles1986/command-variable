---
audience: extension-author
diataxis: explanation
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 2 minutes

# Maintenance model

This page is written for the maintainer six months from now, who is a
stranger to the code they are reading. It records how the repository is
designed to stay maintainable with little time.

## The principles

1. **The tests carry the context.** Every guardrail fails with an explanation,
   not just a diff. The manifest contract, the pinned evaluation count, the
   bundle require set: each test says what breaking it would do to users.
2. **Cheap signals stay cheap.** `npm run verify` runs in well under a minute
   and is the state every commit should leave. A signal that is expensive to
   check gets ignored; none of these are.
3. **One command per intent.** `verify` before any commit, `test:integration`
   when activation changes, `package` before a release. The
   [scripts reference](../reference/scripts.md) lists them all.

## The recurring tasks

| Task | Frequency | Where it is written down |
| --- | --- | --- |
| grouped dependency PRs (npm, GitHub Actions) | monthly, automatic | Dependabot |
| raise `engines.vscode` with `@types/vscode` | with the Dependabot PR | [raise the minimum VS Code version](../how-to/raise-minimum-vscode-version.md) |
| update the copied `yaml` bundle | occasionally, manual | [update a vendored library](../how-to/update-vendored-library.md) |
| re-measure coverage thresholds | after Vitest majors | [test strategy](test-strategy.md) |
| release | when there is something to release | [cut a release](../how-to/cut-a-release.md) |

## Known deferred items

- `uuid-org.js` is a deletion candidate. The
  [repository layout](../reference/repository-layout.md) records the position;
  resolving it means a deletion commit, a `CHANGELOG.md` entry and an edit to
  `CONTRIBUTING.md`.
- The vocabulary rules in the docs are guidance without tooling; the
  [vocabulary page](../reference/vocabulary.md) states what that leaves
  unenforced.

## What to read first when returning

1. [Why multiple test runners](why-multiple-test-runners.md) — the testing
   philosophy in three minutes.
2. [Desktop and web architecture](desktop-web-architecture.md) — why there are
   two entry points and one bundle.
3. [Quality checks](../reference/quality-gates.md) — what each check asserts
   and what to change when it fails.
