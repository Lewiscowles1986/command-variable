---
audience: extension-author
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Cut a release

The machinery behind each step is on [build and release](../reference/build-release.md).

## Steps

1. **Verify.** `npm run verify` — lint, unit tests with coverage, build, bundle check, audit. Everything must pass.
2. **Package.** `npm run package` writes `dist/command-variable-<version>.vsix` and prints its size.
3. **Quick test.** Install the artifact in a scratch profile: `code --install-extension dist/command-variable-*.vsix` and try the changed commands.
4. **Bump the version** in `package.json`.
5. **Changelog.** Add a `## [x.y.z] yyyy-mm-dd` entry to `CHANGELOG.md`. A test asserts the version appears there; the release fails the suite without it.
6. **Commit and tag** the release.
7. **Publish.** `npx vsce publish`. This is deliberately manual: it needs a Marketplace personal access token, and a person should confirm the changelog and the quick test first.

## You have succeeded when

- the tagged commit passes `npm run verify`,
- `dist/` contains the `.vsix` for the new version, and
- `CHANGELOG.md` has a matching entry.
