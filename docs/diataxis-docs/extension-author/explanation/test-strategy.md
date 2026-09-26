---
audience: extension-author
diataxis: explanation
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 2 minutes

# Test strategy

What each test layer is trusted to prove, what it is not trusted to prove, and
how the layers back each other up. The tool facts are on
[testing](../reference/testing.md); the reasoning for having several runners is
on [why multiple test runners](why-multiple-test-runners.md).

## Trust boundaries

| Layer | Trusted to prove | Not trusted to prove |
| --- | --- | --- |
| Unit | logic branches, argument defaults, manifest agreement, guardrail counts | that VS Code actually calls the extension, that the bundle loads |
| Integration | activation in a real host, command surface existence, a command running end to end | deep logic branches (too slow to enumerate), cross-platform timing |
| Bundle check | the web bundle's require set and size | anything about behaviour |
| Lint | absence of accidental globals and undefined references | behaviour |
| Audit | advisories on shipped dependencies | that code paths are unreachable |

The pattern: each layer proves a claim the cheaper layers cannot make, and no
layer is asked for a claim it cannot afford.

## Why the manifest contract is a test

The manifest declares roughly 80 activation events. Nothing in the runtime
fails loudly if one is missing: the user sees a literal `${command:...}` where
a value should be, or a command that does nothing. The contract test makes the
mismatch loud at `npm run test:unit` time, in milliseconds.

## Why the guardrails are pinned counts

The dynamic-code-evaluation test pins the exact number of evaluation sites. A
pinned count turns "someone added an eval" from a silent risk into a red test
with an explanation, which is the reviewable outcome. The same reasoning pins
the bundle's require set and the absence of shell and network imports; see
[security posture](security-posture.md).

## Coverage

Two outputs, different meanings:

- `coverage/` from unit runs is enforced against thresholds (70 lines /
  70 statements / 74 functions / 48 branches), set just below the current
  level. Raise them when you add tests rather than leaving unused margin.
  Re-measure after upgrading Vitest: the v8 provider counts branches
  differently across majors.
- `coverage/integration/` is diagnostic. Never tune unit thresholds from it.

## What to do when a layer fails

[Quality checks](../reference/quality-gates.md) maps every failure to the first
thing to change. [Investigate a CI failure](../how-to/investigate-ci-failure.md)
maps CI jobs to local commands.