---
audience: extension-author
diataxis: tutorial
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Set up and run the tests

In this tutorial you get a verified working environment: dependencies installed,
the test double generated, and every test layer run once. About five minutes.

## Before you start

- Node 22 (pinned in `.tool-versions`; any Node 22 install works without asdf).
- The repository cloned.

## Step 1: install

```bash
npm ci
```

This installs dependencies and runs `postinstall`, which generates the
`node_modules/vscode` shim. The shim makes `require('vscode')` resolve to a
test double outside the Extension Host; it is git-ignored and disposable.

## Step 2: run the fast layer

```bash
npm run test:unit
```

Around 90 tests in a few hundred milliseconds. If this fails before any test
runs, the shim is probably missing: run `node scripts/install-vscode-stub.js`
and try again.

## Step 3: run the full verify

```bash
npm run verify
```

This runs lint, unit tests with coverage, the build, the bundle check and the
audit. It is what CI runs, and what `npm test` aliases.

## Step 4: run the integration layer

```bash
npm run test:integration
```

The wrapper builds the extension, downloads a VS Code, opens the fixture
workspace in `test/fixtures/workspace`, and activates the extension for real.
On Linux it adds `xvfb-run` automatically when `CI` is set; run
`xvfb-run -a npm run test:integration` yourself on a headless Linux machine.

## What you have

- a green `verify`, which is the state every commit should leave,
- the two coverage outputs (`coverage/` and `coverage/integration/`) if you ran
  coverage, which measure different things and are not comparable, and
- the ability to run any layer alone (see
  [run one test layer](../how-to/run-one-test-layer.md)).

## Where to go next

- [Add a command end to end](add-a-command-end-to-end.md) — the full change
  cycle for one new command.
- [Testing: the runner matrix](../reference/testing.md) — which layer proves what.