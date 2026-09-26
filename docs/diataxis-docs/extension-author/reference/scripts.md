---
audience: extension-author
diataxis: reference
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minute

# Scripts

Maintenance scripts live in `scripts/`. Their purpose also sits in the file-header comment of each script; this page is the map.

| Script | npm script | What it does |
| --- | --- | --- |
| `check-bundle.js` | `check:bundle` | Verifies the produced web bundle is shippable: it exists, exports `activate`, requires nothing but `vscode`, stays inside a size budget, and is the manifest's declared `browser` entry point |
| `package.js` | `package` | Builds and packages the extension into `dist/` as a `.vsix`, pinning `--baseContentUrl` so README relative links render on the Marketplace |
| `install-vscode-stub.js` | `vscode:stub` (also `postinstall`) | Writes the git-ignored `node_modules/vscode` shim so `require('vscode')` resolves outside the Extension Host |
| `build-and-test-integration.js` | `test:integration` | Builds the extension, then runs the integration tests inside a downloaded VS Code; adds `xvfb-run` automatically on CI Linux |
| `check-docs-budget.js` | `check:docs-budget` | Computes reading time for `README.md` and `docs/diataxis-docs/`, asserts front matter and audience agreement, prints the per-section README breakdown when over cap |
| `check-docs-placement.js` | `check:docs-placement` | Enforces the extension-user tree boundary (forbidden terms), audience placement and folder/type agreement |
| `check-docs-links.js` | `check:docs-links` | Validates relative links and in-repo anchors in `README.md` and `docs/diataxis-docs/` |
| `check-docs-softwrap.js` | `check:docs-softwrap` | Asserts no artificial newlines: one physical line per paragraph, breaks only where markdown structure requires them |

`check:docs` runs the four docs checks in sequence. The docs checks run in their own GitHub workflow and never gate packaging. Scripts prefixed with `_` (for example `_build-reference-pages.js`) were one-off migration generators used when the docs tree was extracted from the README; they are not part of the toolchain.

## Two scripts worth knowing in detail

**`install-vscode-stub.js`** regenerates a disposable shim. `npm prune` and `npm audit fix` can delete it, which is why every test script regenerates it defensively before running. It is never committed.

**`package.js`** exists as a script rather than a raw `vsce` call because the shell syntax (`mkdir -p && ...`) is not portable to Windows, where npm scripts run under cmd.exe.
