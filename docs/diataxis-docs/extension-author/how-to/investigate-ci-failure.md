---
audience: extension-author
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Investigate a CI failure

The `CI` workflow has three jobs. Map the failing job to the local command that reproduces it, fix, and push. The docs checks run in a separate workflow and never block packaging.

## Job to command

| Failing job | What it runs | Reproduce locally with |
| --- | --- | --- |
| `verify` | lint, unit tests with coverage, build, bundle check, audit | `npm run verify` |
| `integration` (one OS per matrix entry) | integration tests in a real Extension Host | `npm run test:integration` (add `xvfb-run -a` on headless Linux) |
| `package` | produce the VSIX and check its contents | `npm run dev && npx @vscode/vsce ls && npm run package` |

## Reading the failure

1. Open the failed job's log and find the first failing step. The steps run in the order of the table above, so an early failure explains later ones.
2. Run the same command locally. CI runs Ubuntu with the Node version pinned in `.tool-versions`; a local failure that CI does not show usually means a platform difference — run the integration job's exact command if you are on macOS or Windows.
3. The `package` job depends on `verify`: a red `verify` stops the VSIX from being produced at all.

## The docs workflow is separate

`.github/workflows/docs.yml` runs `npm run check:docs` on every push, in its own concurrency group. A red docs check never blocks `verify`, `integration` or `package`. Fix documentation failures in their own change; see the [style guide](../reference/style-guide.md) for the rules the checks enforce.

## You have succeeded when

- the failing job passes locally, and the push turns the job green.
