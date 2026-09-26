---
audience: extension-author
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minute

# Run one test layer

Each command runs one layer alone. Choose the cheapest layer that can express
the assertion; the full matrix is on
[testing](../reference/testing.md).

| I want to check... | Command |
| --- | --- |
| pure logic, manifest contract, guardrails | `npm run test:unit` |
| coverage against the thresholds | `npm run test:coverage` |
| one unit file while developing | `npx vitest run test/unit/manifest.test.js` |
| watch mode | `npx vitest --watch` |
| real Extension Host, end to end | `npm run test:integration` |
| web bundle safety | `npm run dev && npm run check:bundle` |
| lint only | `npm run lint` |
| shipped dependency vulnerabilities | `npm run check:audit` |
| everything CI runs | `npm run verify` |
| documentation | `npm run check:docs` |

Notes:

- The unit scripts regenerate the `node_modules/vscode` shim first, because
  `npm prune` and `npm audit fix` can delete it.
- `npm run test:integration` builds first; the integration tests load the
  built `browser` entry point.
