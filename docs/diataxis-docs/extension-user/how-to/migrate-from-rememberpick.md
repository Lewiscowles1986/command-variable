---
audience: extension-user
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minute

# Migrate from rememberPick

`extension.commandvariable.rememberPick` is deprecated: it works, but shows a
message and has a replacement. The replacement is
`extension.commandvariable.remember` — identical behaviour, a name that
describes what it does. The deprecation is listed on the
[deprecations page](../reference/deprecations.md).

## Steps

1. Search your workspace's `.vscode` folder for `rememberPick`.
2. In each `inputs` entry, replace the command name:
   `"command": "extension.commandvariable.rememberPick"` becomes
   `"command": "extension.commandvariable.remember"`.
3. Run the task or launch configuration once and confirm it behaves as before.

Nothing else changes: the arguments, the key naming and the store are the same.

## You have succeeded when

- searching for `rememberPick` finds nothing in `.vscode`, and
- the tasks that used it run without the deprecation message.
