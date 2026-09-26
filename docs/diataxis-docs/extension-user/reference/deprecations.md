---
audience: extension-user
diataxis: reference
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minutes
# Deprecations

A deprecated command still works but has a replacement. Deprecation exists so existing configurations keep running while you move to the replacement at your own pace.

## rememberPick

| | |
| --- | --- |
| Deprecated command | `extension.commandvariable.rememberPick` |
| Replacement | `extension.commandvariable.remember` |
| Since | 2021-10 |
| Behaviour | identical; only the name changed |

`rememberPick` was named when the command only remembered picked values. It now remembers every kind of value, so the name no longer describes it. The extension shows a message the first time the deprecated command runs in a session.

### Migrate in one minute

1. Open the file that uses the `rememberPick` command (as `${command:...}` or inside an `inputs` entry).
2. Replace `rememberPick` with `remember` in the `command` field.
3. Run the task or launch configuration once to confirm it works.

You have succeeded when the task runs and no deprecation message appears.

## workspaceFolderPosix

| | |
| --- | --- |
| Deprecated command | `extension.commandvariable.workspace.workspaceFolderPosix` |
| Replacement | `extension.commandvariable.workspace.folderPosix` |
| Behaviour | identical |

The old name repeated the word `workspace` twice. Replace the command name in place; no arguments change.
