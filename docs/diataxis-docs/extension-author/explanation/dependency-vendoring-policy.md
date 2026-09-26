---
audience: extension-author
diataxis: explanation
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Dependency and vendoring policy

The extension ships with **no runtime dependencies**. Everything is either authored in this repository or copied in as a bundle. This page explains why, and what the copied files owe the rest of the repository.

## The decision

| Choice | Consequence |
| --- | --- |
| bundle everything into the shipped files | no `node_modules` in the `.vsix`; the package is small and its contents are fully visible |
| declare no runtime dependencies | Dependabot tracks only dev tooling; the supply chain surface is the lockfile |
| copy `yaml` as `yaml.js` | the manifest's `browser` bundle can include it; the version is recorded manually |

The cost of "no runtime dependencies" is that upgrades are manual for the copied files. That cost is accepted because the surface is small: two copied libraries, both stable.

## The three places that move together

`yaml.js` is a copy of the `yaml` package. Its version lives in:

1. the header comment of `yaml.js` (`// module: "yaml": "x.y.z"`),
2. the `vendored` field of `package.json`,
3. the test that asserts 1 and 2 agree.

Updating the library means changing all three in one commit; the test fails otherwise. The procedure is on [update a vendored library](../how-to/update-vendored-library.md).

## The exception: uuid-org.js

`uuid-org.js` is a full upstream copy of the UUID library that the build does not consume — `uuid.js` is the copy in use. It is excluded from lint and from the package and is a deletion candidate. Deleting it means a deletion commit, a `CHANGELOG.md` entry and an edit to `CONTRIBUTING.md`; that resolution is deliberately deferred, and the [repository layout](../reference/repository-layout.md) records the position without resolving it.

## What Dependabot covers

Grouped monthly PRs for npm and GitHub Actions. The copied files are invisible to it, which is exactly why the vendored-version test exists.
