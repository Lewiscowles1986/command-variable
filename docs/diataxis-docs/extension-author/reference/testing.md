---
audience: extension-author
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 2 minutes

# Testing: the runner matrix

Pick the cheapest layer that can express the assertion. This page is the
factual matrix behind that rule; the reasoning is on
[why multiple test runners](../explanation/why-multiple-test-runners.md) and
the trust boundaries on [test strategy](../explanation/test-strategy.md).

## The matrix

| Layer | Tool | Config | Files | Environment | What it proves | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | Vitest 5 | `vitest.config.mjs` | `test/unit/**/*.test.js` | plain Node, `vscode` replaced by a test double | pure logic, manifest contracts, guardrail assertions | milliseconds |
| Integration | Mocha via `@vscode/test-cli` + `@vscode/test-electron` | `.vscode-test.mjs` | `test/integration/**/*.test.js` | downloaded VS Code Extension Host, fixture workspace | activation, the whole command surface existing at runtime, commands running end to end | ~1 minute plus a download |
| Bundle check | custom Node script | `scripts/check-bundle.js` | `out/extension-common.js` | plain Node | the web bundle requires only `vscode`, stays under its size budget, is included in the package | milliseconds |
| Static | ESLint 10 | `eslint.config.mjs` | `*.js` | plain Node | no accidental or undefined globals | seconds |
| Supply chain | `npm audit` | — | lockfile | — | no known vulnerabilities in shipped dependencies | seconds |
| Packaging | `vsce` | `scripts/package.js` | manifest | plain Node | the artifact users install can be produced | seconds |

## Commands

```bash
npm run test:unit        # no coverage, fastest
npm run test:coverage    # with coverage thresholds enforced
npx vitest --watch       # watch mode while developing
npm run test:integration # real Extension Host
```

## Coverage outputs

Two separate coverage outputs exist and are not comparable:

| Output | Measures | Thresholds |
| --- | --- | --- |
| `coverage/` | unit runs | 70 lines / 70 statements / 74 functions / 48 branches |
| `coverage/integration/` | integration runs | none; diagnostic only |

## The three traps

1. **Two coverage reports.** Same tooling, different meaning. Never set unit
   thresholds from integration numbers or the reverse.
2. **The generated shim is disposable.** `node_modules/vscode` is git-ignored
   and can be deleted by `npm prune` or `npm audit fix`, which is why every
   test script regenerates it before running.
3. **The integration runner uses Mocha's `tdd` UI.** `.vscode-test.mjs` spreads
   over it. Overriding `ui` to `bdd` removes the `suite` and `test` globals the
   test files rely on.

## Integration tests load the built bundle

The integration tests load the extension through the `browser` entry point, so
a build (`npm run dev`) must run first. That is why `npm run test:integration`
is a wrapper script and not a direct runner call.

## Related pages

- [Run one test layer](../how-to/run-one-test-layer.md)
- [Quality checks](quality-gates.md)
