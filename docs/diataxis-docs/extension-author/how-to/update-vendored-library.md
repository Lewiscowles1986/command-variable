---
audience: extension-author
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Update a vendored library

`yaml.js` is a copied bundle of the `yaml` package rather than a declared
dependency, so Dependabot cannot see it. The version it was built from is
recorded in the `vendored` field of `package.json` and asserted by a test.
Three places move together, and a test checks all three.

## Steps

1. **Replace `yaml.js`** with a bundle of the new `yaml` version, built the way
   the current file was built (rollup, web-compatible output).
2. **Update the header comment** at the top of `yaml.js`:
   `// module: "yaml": "x.y.z"`.
3. **Update `vendored.yaml`** in `package.json` to the same version.
4. **Run the tests**: `npm run test:unit`. The vendored-version test fails if
   any of the three places disagrees.
5. **Run `npm run verify`** and check the web bundle still passes the bundle
   check.

## Why the version is recorded

The copied file has no entry in the lockfile, so nothing would otherwise know
which upstream version it came from. The `vendored` field plus the header
comment plus the test close that gap. The policy behind this is on
[dependency and vendoring policy](../explanation/dependency-vendoring-policy.md).

## Note on uuid-org.js

`uuid-org.js` is an upstream copy of the UUID library that the build does not
consume. It is excluded from lint and from the package and is a deletion
candidate; its resolution is deliberately deferred and is not part of updating
the vendored `yaml` bundle.

## You have succeeded when

- `npm run verify` passes with the three places naming the same version.
