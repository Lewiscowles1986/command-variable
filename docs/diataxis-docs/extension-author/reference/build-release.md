---
audience: extension-author
diataxis: reference
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Build and release

How the extension is built, packaged and released. The release checklist is on [cut a release](../how-to/cut-a-release.md); this page is the machinery.

## Two entry points, one source

| Field | Value | Produced by |
| --- | --- | --- |
| `main` | `./extension.js` | authored directly (desktop, uses Node APIs) |
| `browser` | `./out/extension-common.js` | rollup, from `extension-common.js` |

`extension-common.js` is shared logic written to run in both hosts. Rollup bundles it with `external: ['vscode']`, so the bundle contains the extension code and its libraries but expects `vscode` to be provided by the host. The full reasoning is on [desktop and web architecture](../explanation/desktop-web-architecture.md).

## Build commands

```bash
npm run build   # production bundle
npm run dev     # development bundle (what the integration tests load)
npm run watch   # development bundle, rebuilt on change
```

## Packaging

```bash
npm run package  # writes dist/command-variable-<version>.vsix
```

`scripts/package.js` pins `--baseContentUrl` to the repository URL so relative links in `README.md` resolve on the Marketplace. `docs/**` is excluded from the package by `.vscodeignore`; the README is the Marketplace landing page and stays self-sufficient.

## Release checklist

1. `npm run verify` — everything must pass.
2. `npm run package` — produces the artifact and prints its size.
3. Install the artifact locally and try it.
4. Bump `version` in `package.json`.
5. Add a matching `## [x.y.z] yyyy-mm-dd` entry to `CHANGELOG.md` (a test asserts the version appears in the changelog).
6. Tag the release.
7. `npx vsce publish` — deliberately manual: it needs a Marketplace token, and a person should confirm the changelog and quick test first.
