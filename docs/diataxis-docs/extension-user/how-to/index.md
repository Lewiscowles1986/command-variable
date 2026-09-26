---
audience: extension-user
diataxis: index
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minute

# How-to index

One page per task. Each page ends with "you have succeeded when ...", so you
can check the result yourself.

## Working with files and paths

- [Use a POSIX-form file path](posix-form-file-path.md) — pass a path that works across operating systems
- [Read one value from a file](read-value-from-file.md) — JSON, YAML or key-value
- [Select a file inside a task](select-file-in-task.md) — let the person running the task choose

## Working with values over time

- [Remember a value between tasks](remember-value-between-tasks.md) — store in one task, use in another
- [Make a compound task stop on cancelled input](compound-task-cancelled-input.md) — stop cleanly when a prompt is cancelled
- [Migrate from rememberPick](migrate-from-rememberpick.md) — one minute, two edits

## Working with the rest of VS Code

- [Use a result in a keybinding](use-result-in-keybinding.md) — put a command result into `keybindings.json`
- [Use the extension where the web version runs](use-in-browser-workspace.md) — browser and remote workspaces

## When something goes wrong

- [The variable did not resolve](variable-did-not-resolve.md) — the literal `${command:...}` reached the debugger or shell