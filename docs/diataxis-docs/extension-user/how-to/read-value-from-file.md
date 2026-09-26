---
audience: extension-user
diataxis: how-to
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes

# Read one value from a file

A script or tool writes a value to a file; your task needs that one value. This page covers the three file shapes: key-value, JSON and YAML. All use the `extension.commandvariable.file.content` command, described in full on [file content commands](../reference/file-content.md).

## A key-value file

The file contains lines like `PLUGIN=cool-plugin`. Read the value for one key:

```json
{
  "id": "fileContentKey",
  "type": "command",
  "command": "extension.commandvariable.file.content",
  "args": {
    "fileName": "${workspaceFolder}/key-values.txt",
    "key": "PLUGIN",
    "default": "special-plugin"
  }
}
```

Comments start with `#` or `//`; the separator can be `:` or `=`; the value may contain more separator characters.

## A JSON file

Read a property with a JavaScript expression over the parsed content:

```json
{
  "id": "configServer1Port",
  "type": "command",
  "command": "extension.commandvariable.file.content",
  "args": {
    "fileName": "${workspaceFolder}/config.json",
    "json": "content.server1.port",
    "default": "4321",
    "keyRemember": "ServerPort"
  }
}
```

`content` is the parsed JSON file. Use `content['server-root'].port` when a property name is not a valid JavaScript identifier. The file may contain comments and trailing commas.

## A YAML file

The same as JSON, with the `yaml` argument instead:

```json
{
  "id": "yamlValue",
  "type": "command",
  "command": "extension.commandvariable.file.content",
  "args": {
    "fileName": "${workspaceFolder}/deploy.yaml",
    "yaml": "content.spec.replicas",
    "default": "1"
  }
}
```

## When it does not work

- The result is `Unknown` and no `default` was defined: the key or property does not exist. Add a `default` or fix the expression.
- The file cannot be read: check the path. `${workspaceFolder}` is the folder containing the current file; in a workspace with more than one folder, see [the workspaceFolder variables](../reference/variable-workspacefolder.md).

## You have succeeded when

- the task output shows the value from the file, or
- the `default` value when the file does not contain the key.
