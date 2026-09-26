---
audience: extension-author
diataxis: reference
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minutes

# Manifest contract

The manifest (`package.json`) carries the extension's public surface: commands,
activation events, settings and entry points. The unit tests enforce the rules
below; a violation fails `npm run test:unit` with an explanation.

## The rules

| Rule | What it catches |
| --- | --- |
| every `onCommand:` activation event is registered by `activate` | commands dead in the manifest: declared but never registered |
| every registered command has an activation event | commands broken at runtime: registered but never activatable |
| `@types/vscode` is not newer than `engines.vscode` | the engine floor drifting from the API the code uses; `vsce` enforces the same rule at packaging time |

## Activation events

The manifest declares roughly 80 `onCommand:` events. VS Code starts the
extension the first time one of the named commands runs. Only two commands
appear in the Command Palette (`dateTimeInEditor` and `UUIDInEditor`); every
other command is reachable only through `${command:...}` in a `launch.json`,
`tasks.json` or `keybindings.json`, which is why each needs its own activation
event.

## Settings

Three configuration properties are contributed:

| Property | Scope | Meaning |
| --- | --- | --- |
| `commandvariable.remember.persistent.file` | resource | file path of persistent storage of the remembered values |
| `commandvariable.file.pickFile.labelMaximumLength` | machine | maximum label length before transforms apply |
| `commandvariable.file.pickFile.labelClipPoint` | machine | where the label clipping happens |

## Where the tests live

`test/unit/manifest.test.js`. The full set of maintenance assertions is
described on [quality checks](quality-gates.md).