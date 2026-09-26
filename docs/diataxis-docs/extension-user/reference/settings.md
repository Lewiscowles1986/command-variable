---
audience: extension-user
diataxis: reference
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minutes
# Settings

This extension contributes three settings. One is a general setting; two only work in the User settings scope because they are machine-scoped.

## commandvariable.remember.persistent.file

(**Not in Web**) A string containing a file system path. The extension writes the values of the remember store to this file so they survive closing the editor, and reads them back when the editor starts. Values are stored as JSON.

- A remote workspace is not supported: the file must be on the local file system.
- The path may use these variables: `${workspaceFolder}`, `${workspaceFolder:name}`, `${pathSeparator}`, `${env:name}`, `${userHome}`.
- A file path in the workspace `.vscode` folder could be: `${workspaceFolder}${pathSeparator}.vscode${pathSeparator}remember.json`
- **If you set or change the setting, restart VS Code.** The file path is read once, when the extension starts.

What the file changes about the store's behaviour is described in [the remember store](../explanation/the-remember-store.md).

## User-scope settings

These two settings can only be defined in the User settings:

* `commandvariable.file.pickFile.labelMaximumLength` : number ∈ ℕ (>= 0), the [pickFile](dialogs.md) command can show a list of predefined directories. It can be that the directory path is too large to show in the selection list. VS Code clips the path but only at the end and thus can make it difficult to choose a path when they have the same start. This setting allows to transform the shown label if larger than a maximum number of characters. The transforms to apply are defined in the pickFile command. If this setting is `0` (default value) no transforms are applied. **!!** Be aware that the text shown in the selection list uses a **variable width** font.
* `commandvariable.file.pickFile.labelClipPoint` : number ∈ ℤ (positive and negative), used in the pickFile label transform: `clipMiddle`, determines how many characters to pick from the start (`>=0`) or from the end (`<0`). The characters taken from the other end are calculated using `commandvariable.file.pickFile.labelMaximumLength`
