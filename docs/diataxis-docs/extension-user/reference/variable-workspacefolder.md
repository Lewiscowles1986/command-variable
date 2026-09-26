---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# The workspaceFolder variables

`${workspaceFolder}` and `${workspaceFolderBasename}` resolve against the
workspace folder that contains the current file. The exact rules, including
multi-root workspaces, are on this page.

### Variable `workspaceFolder`

The variable `${workspaceFolder}` is only valid in certain cases and depends on the URI of a file:

The URI used is:

| location `${workspaceFolder}` | File Open | URI |
| ---- | ---- | ---- |
| `pickFile:transform` | -- | URI of the picked file |
| `remember:transform` of a picked file | -- | URI of the picked file |
| other | No | `undefined` |
| other | Yes | URI of the open file |

Be aware that "**other**" also refers to the `pickFile:fromFolder` property.

| URI  | Workspace | `${workspaceFolder}` |
| ---- | ---- | ---- |
| --  | No     | `"Unknown"` and Error: `"No Folder"` |
| --  | Folder | Path of the open folder |
| `undefined` | Multi Root | `"Unknown"` and Error: `"Use workspace name"` |
| valid  | Multi Root | Path of the workspace containing URI or first workspace in the list |

An example:

```
${workspaceFolder:server}
```

The variable <code>&dollar;{workspaceFolder:<em>name</em>}</code> is only invalid when there is no folder open.

In most cases the _name_ is the basename of the workspace folder path (last directory name).

If you have 2 workspaces with the same (folder base)name you can't target the second one by name only. You have to use more parts of the directory path to make the name unique. Use the `/` as path separator on all platforms. The _name_ is tested to be at the end of the workspace folder path (using `/` as separator).

An example:

```
${workspaceFolder:/websiteA/server}
```

### Variable `workspaceFolderBasename`

The variable `${workspaceFolderBasename}` uses the same strategy as variable [`${workspaceFolder}`](#variable-workspacefolder) to determine the workspace to use.
