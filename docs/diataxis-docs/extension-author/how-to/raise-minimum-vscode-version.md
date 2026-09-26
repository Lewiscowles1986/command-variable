---
audience: extension-author
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Raise the minimum VS Code version

`engines.vscode` is the minimum VS Code version the extension declares. It is
tied to `@types/vscode` by a test, and `vsce` enforces the same rule at
packaging time. The two move together, in one change.

## Steps

1. **Update both fields together.** When the `@types/vscode` range is bumped
   (for example by a grouped Dependabot PR), raise `engines.vscode` to the same
   minor in the same change.
2. **Re-run `npm run verify`.** The type/engine alignment test fails if the
   types are newer than the engine.
3. **Check for new API usage.** A higher engine floor means newer APIs are
   allowed, not required; do not use them unless needed.
4. **Package.** `vsce` applies the same rule; a passing verify means packaging
   will pass.

## What not to change

- `docs/diataxis-docs/**` front matter carries `minimum-extension-version`,
  which means "the lowest extension version in which everything on the page
  works". It is a floor about this extension's releases, not about
  `engines.vscode`, and it does not change when the engine floor moves.
- Do not raise the engine floor without the matching types change; the tests
  fail by design.

## You have succeeded when

- `engines.vscode` and the `@types/vscode` range agree, and `npm run verify`
  passes.
