---
audience: extension-user
diataxis: index
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes

# Extension user start page

You edit `launch.json`, `tasks.json`, `keybindings.json` or `settings.json`.
You do not edit this extension's source code. Every page here keeps to that
boundary: nothing on these pages asks you to run a build tool or read this
repository's code.

## Where to go next

| I want to... | Go to |
| --- | --- |
| get one working example from nothing | [Your first command variable](tutorials/your-first-command-variable.md) |
| ask the same question once per session and reuse the answer | [Select and remember a value](tutorials/select-and-remember-a-value.md) |
| pass a file path in a known form | [Use a POSIX-form file path](how-to/posix-form-file-path.md) |
| read a value from a JSON, YAML or key-value file | [Read one value from a file](how-to/read-value-from-file.md) |
| store a value in one task and use it in another | [Remember a value between tasks](how-to/remember-value-between-tasks.md) |
| choose a file while a task runs | [Select a file inside a task](how-to/select-file-in-task.md) |
| put a command result in a keybinding | [Use a result in a keybinding](how-to/use-result-in-keybinding.md) |
| work in a browser or remote workspace | [Use the extension where the web version runs](how-to/use-in-browser-workspace.md) |
| stop a compound task when an input is cancelled | [Make a compound task stop on cancelled input](how-to/compound-task-cancelled-input.md) |
| fix a silent `${command:...}` | [The variable did not resolve](how-to/variable-did-not-resolve.md) |
| replace a deprecated `rememberPick` | [Migrate from rememberPick](how-to/migrate-from-rememberpick.md) |
| look up a command, variable or setting | [Reference index](reference/index.md) |
| understand how `${command:...}` works | [How a command variable resolves](explanation/how-command-variable-resolves.md) |

## The four kinds of page

- **Tutorials** teach you the basics by walking through a first success. Do them once, in order.
- **How-to guides** solve one problem you have right now. Each ends with "you have succeeded when..." so you can check the result.
- **Reference** pages describe what exists: every command, argument and setting, with the minimum extension version it works from.
- **Explanations** show how the extension works, so a behaviour stops being surprising.