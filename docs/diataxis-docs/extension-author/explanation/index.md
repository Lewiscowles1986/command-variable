---
audience: extension-author
diataxis: index
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minute

# Explanation index

These pages explain why the repository is the way it is. Read them before
changing structure, and when a design choice looks wrong.

- [Desktop and web architecture](desktop-web-architecture.md) — two entry points, one shared source, what rollup does
- [Why multiple test runners](why-multiple-test-runners.md) — the decision rule and the table behind the three runners
- [Test strategy](test-strategy.md) — what each layer is trusted to prove, and what it is not
- [Security posture](security-posture.md) — no shell, no network, and the tests that keep it that way
- [Dependency and vendoring policy](dependency-vendoring-policy.md) — why `yaml.js` is a copy and how it moves
- [Maintenance model](maintenance-model.md) — how the repository stays maintainable with little time
