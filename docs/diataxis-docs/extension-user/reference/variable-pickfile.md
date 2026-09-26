---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# The pickFile, openDialog and saveDialog variables

The dialog commands can be used as variables, with the same named-argument
mechanism.

### Variable `pickFile`

The `pickFile` variable works the same as the [`pickStringRemember` variable](#variable-pickstringremember).
If you want a file path use the variable: <code>&dollar;{pickFile:<em>name</em>}</code>

_`name`_ is the property name of the `pickFile` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `pickFile` have to be part of the arguments of the command.

See the command [`extension.commandvariable.pickFile`](#pick-file) for the arguments you can use.

An example: you have a number of key-value files and you want to select which environment to use 

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo theme name",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:themeName}" ]
    }
  ],
  "inputs": [
    {
      "id": "themeName",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${pickFile:environ}",
        "key": "THEME",
        "pickFile": {
          "environ": {
            "description": "Which environment?",
            "include": "**/*environ*",
            "display": "fileName"
          }
        }
      }
    }
  ]
}
```

### Variable `openDialog`

The `openDialog` variable works the same as the [`pickStringRemember` variable](#variable-pickstringremember).
If you want a file path use the variable: <code>&dollar;{openDialog:<em>name</em>}</code>

_`name`_ is the property name of the `openDialog` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `openDialog` have to be part of the arguments of the command.

See the command [`extension.commandvariable.openDialog`](#open-dialog) for the arguments you can use.

### Variable `saveDialog`

The `saveDialog` variable works the same as the [`pickStringRemember` variable](#variable-pickstringremember).
If you want a file path use the variable: <code>&dollar;{saveDialog:<em>name</em>}</code>

_`name`_ is the property name of the `saveDialog` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `saveDialog` have to be part of the arguments of the command.

See the command [`extension.commandvariable.saveDialog`](#save-dialog) for the arguments you can use.
