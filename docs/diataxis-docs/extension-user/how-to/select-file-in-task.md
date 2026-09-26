---
audience: extension-user
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minutes

# Select a file inside a task

Your task needs a file that you choose at the moment the task starts, for example which test configuration to run. The `pickFile` command shows a selection list of files that match a pattern. The command's full argument list is on [dialog and selection commands](../reference/dialogs.md).

## Basic use

```json
{
  "id": "pickTestConfig",
  "type": "command",
  "command": "extension.commandvariable.file.pickFile",
  "args": {
    "include": "**/*.json",
    "exclude": "**/node_modules/**",
    "description": "Which config?"
  }
}
```

`include` and `exclude` are glob patterns. Without `fromWorkspace` or `fromFolder`, the search covers the whole workspace.

## Limit the search to a directory

```json
"args": {
  "include": "**/*.json",
  "fromFolder": {
    "predefined": [ "${workspaceFolder}/configs" ]
  }
}
```

## Store the choice for later tasks

The `keyRemember` argument writes the picked path to the remember store. A later input reads it back:

```json
{
  "id": "reuseConfig",
  "type": "command",
  "command": "extension.commandvariable.remember",
  "args": { "key": "pickFile" }
}
```

The default key for `pickFile` is `pickFile`; change it with `keyRemember`.

## Show friendlier labels

By default the list shows paths relative to the chosen folder. With `"display": "fileName"` the list shows the file name first, which is quicker to scan. With `"display": "transform"` you control the label completely with the `labelTransform` argument.

## You have succeeded when

- running the task shows a file selection list,
- the picked path reaches the task, and
- a later task can read the same path from the store.
