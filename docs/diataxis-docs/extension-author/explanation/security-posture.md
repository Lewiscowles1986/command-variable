---
audience: extension-author
diataxis: explanation
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Security posture

The extension computes strings. It does not start other programs, talk to the
network, or evaluate dynamic code beyond a small, pinned set. These are not
aspirations: tests assert them, and a violation turns a test red.

## The three assertions

| Assertion | Enforced by | Why it matters |
| --- | --- | --- |
| no `child_process`, no `http(s)`, no `fetch` | unit test | the extension has no reason to start programs or make network requests; a dependency introducing one is a red test |
| the web bundle requires only `vscode` | bundle check | any Node built-in in the bundle breaks the web extension host, and the require set is where an accidental import shows |
| the number of dynamic code evaluation sites is pinned | unit test | the `${...}` expression features need the `Function` constructor; the pin makes each new site a deliberate, reviewable decision |

## Why pinning works here

A pinned count is a tripwire, not a fence. Nothing stops an author from raising
the number — but the change cannot land silently, because the test fails with
the old count and the diff shows the new evaluation site next to it. The same
reasoning pins the bundle's require set.

## What is deliberately allowed

- **Dynamic code evaluation for expressions.** `config.expression` and
  `js.expression` evaluate a JavaScript expression the user wrote in their own
  configuration. That is the feature. The pin exists because the surface must
  stay deliberate.
- **File reads.** `file.content` reads files the user's configuration names.
  Reads are local, user-directed, and never write.
- **Clipboard.** `getClipboard` and `setClipboard` use the VS Code API, which
  asks the user for permission on first use.

## What is deliberately absent

- No telemetry.
- No network access.
- No process execution.
- No persistent state beyond the user-configured remember file.
