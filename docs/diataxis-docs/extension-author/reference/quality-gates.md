---
audience: extension-author
diataxis: reference
reading-time: 3 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 3 minutes

# Quality checks

Every check fails with a message that says what to change. This page maps each check to what it asserts and the first thing to do when it fails.

## The checks

| Check | Command | What it asserts |
| --- | --- | --- |
| Lint | `npm run lint` | no accidental or undefined globals; real-risk rules only |
| Unit tests | `npm run test:unit` | logic and manifest contract, in plain Node with a test double |
| Coverage | `npm run test:coverage` | thresholds: 70 lines / 70 statements / 74 functions / 48 branches |
| Build | `npm run dev` | the web bundle can be produced |
| Bundle check | `npm run check:bundle` | the web bundle requires only `vscode`, stays under its size budget, and is included in the package |
| Supply chain | `npm run check:audit` | no known vulnerabilities in shipped dependencies |
| Docs budget | `npm run check:docs-budget` | reading time and front matter of `README.md` and `docs/diataxis-docs/` |
| Docs placement | `npm run check:docs-placement` | the extension-user tree boundary and page placement |
| Docs links | `npm run check:docs-links` | relative links and anchors resolve |
| Docs soft wrap | `npm run check:docs-softwrap` | no artificial newlines: one physical line per paragraph; structure alone produces line breaks |

`npm run verify` runs lint, coverage, build, bundle check and audit. `npm test` is an alias for `verify`.

## What to change when each fails

| Failing check | First thing to do |
| --- | --- |
| lint | open the reported file; the rule name says which risk was found |
| unit tests | read the assertion message; the test double records what the extension asked VS Code to do |
| coverage | add tests for the paths the report names; raise thresholds only together with new tests |
| build | a source file does not bundle; check for Node built-ins imported into shared code |
| bundle check | the web bundle gained a `require` other than `vscode`; move that code to the desktop entry or bundle the dependency |
| audit | update the dependency, or check whether the advisory affects the shipped code path |
| docs budget | a page is over the cap or its declared reading time disagrees with the computed one; the message states both figures |
| docs placement | a page is in the wrong tree or uses a term the tree forbids; the message names the term and the line |
| docs links | a relative link or anchor does not resolve; the message names the target |
| docs soft wrap | a paragraph was wrapped mid-sentence in the file; join the lines so the paragraph is one physical line |

## The maintenance assertions in unit tests

`test/unit/manifest.test.js` contains assertions that catch the usual ways a lightly-maintained extension becomes obsolete. They are cheap and fail with an explanation:

- **Manifest contract** — every `onCommand` activation event is registered, and every registered command has an activation event.
- **Dynamic eval accounting** — the `${...}` expression features intentionally use the `Function` constructor. The test pins the exact number of dynamic code evaluation sites so a new one is a deliberate, reviewable decision.
- **No shelling out, no network** — asserts the extension never imports `child_process` or `http(s)` and never calls `fetch`.
- **Bundle discipline** — `scripts/check-bundle.js` asserts `out/extension-common.js` requires only `vscode` (any Node built-in would break the web extension host) and stays inside a size budget.
- **Type/engine alignment** — `@types/vscode` must not be newer than `engines.vscode`. The engine floor tracks the declared types, and the two move together. See [raise the minimum VS Code version](../how-to/raise-minimum-vscode-version.md).

## Related pages

- [Testing: the runner matrix](testing.md) — which layer to run for which change
- [Investigate a CI failure](../how-to/investigate-ci-failure.md) — map a failing job to a local command
