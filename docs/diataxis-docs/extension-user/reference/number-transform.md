---
audience: extension-user
diataxis: reference
reading-time: 8 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 8 minutes
# Number and transform commands

## number

If you want a different whole number (n ∈ ℤ) in your task or launch config each time you run you can use the command `extension.commandvariable.number`.

The configuration attributes need to be passed to the command in the `args` attribute.

The command has the following configuration attributes:

* `name` : if you have more than 1 number you have to name them to keep track of the previous value(s)
* `range` : an array with 2 numbers, `[min, max]`, both values are inclusive and can be the result returned, `min < max` (default: `[0, 100]`)
* `random` : boolean, do you want a random number from the range (default: `false`)
* `step` : number, if `random` is `false` the number returned is the previous value incremented with `step`, can be negative (default: `1`)
* `uniqueCount` : number, if `random` is `true` the number returned is unique compared to the previous `uniqueCount` numbers (default: `0`)

You can get the last value of a named number with the `remember` [command](remember.md) or [variable](variables.md).  
You must use a special key format: <code>number-<em>name</em></code>

### Sequence of numbers

The value of `step` determines the first value returned.

* if `step >= 0`
  * start with minimum
  * when next value > maximum return minimum
* if `step < 0`
  * start with maximum
  * when next value < minimum return maximum

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Number from sequence",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:numberSeq}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "numberSeq",
      "type": "command",
      "command": "extension.commandvariable.number",
      "args": {
        "name": "sequence",
        "range": [0, 20],
        "step": 3
      }
    }
  ]
}
```

### Random number

If you want a random number but it must be unique compared to the previous `n` numbers you have to set the attribute `uniqueCount`.

The example is for debugging the Nios ii Embedded Design Suite:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "app",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/app/app.elf",
      "stopAtEntry": true,
      "cwd": "${workspaceFolder}",
      "MIMode": "gdb",
      "miDebuggerServerAddress": "localhost:${input:randomPort}",
      "miDebuggerPath": "/home/me/intelFPGA/20.1/nios2eds/bin/gnu/H-x86_64-pc-linux-gnu/bin/nios2-elf-gdb",
      "debugServerPath": "/home/me/intelFPGA/20.1/quartus/bin/nios2-gdb-server",
      "debugServerArgs": "--tcpport ${input:rememberRandomPort} --reset-target --tcptimeout 5",
    }
  ],
  "inputs": [
    {
      "id": "randomPort",
      "type": "command",
      "command": "extension.commandvariable.number",
      "args": {
        "name": "randomPort",
        "range": [1500, 60000],
        "random": true,
        "uniqueCount": 10
      }
    },
    {
      "id": "rememberRandomPort",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "number-randomPort" }
    }
  ]
}
```

## transform

Sometimes you want to modify a variable before you use it. Change the filename of the file in the editor to construct a different filename.

The transform you can apply to fields in snippets is not supported in the variables in the task and launch json files.

With the command `extension.commandvariable.transform` you can find-replace with Regular Expression a selection of variables combined with static text.

The command can be used with the `${input:}` variable and has the following arguments:

* `text` : the string where you want to apply a find-replace. It can contain a selection of [variables](variables.md) and literal text.
* `find` : (Optional) the Regular Expression to search in `text`. Can contain capture groups and [variables](variables.md). If no `find` argument there is no `find-replace` operation.
* `replace` : (Optional) the replace string of what is matched by `find`, can contain group references (`$1`) and [variables](variables.md), variables are only evaluated when `find` is found in `text`, default (`""`)
* `flags` : (Optional) the flags to be used in the Regular Expression, like `gims`, default (`""`)
    * `g` : replace all occurences (global)
    * `i` : find case insensitive
* `apply` : (Optional) defines a sequence of find-replace operations.  
  It is an array of objects, each object can have the properties: `find`, `replace` and `flags`.  
  If `apply` is defined: `find`, `replace` and `flags` sibling properties are ignored.  
  See [`${transform}`](variable-transform.md) variable for an example.
* `key` : (Optional) It is used to [store and retrieve](remember.md) the transformed string. (default: `transform` )
* `separator` : (Optional) the string used to join the (multi cursor) selections for `${selectedText}`, default (`"\n"`)
* `filterSelection` : (Optional) a JavaScript expression that allows which (multi cursor) selections to use for `${selectedText}`, default (`"true"`) all are selected.<br/>The expression can use the following variables:
    * `index` : the 0-base sequence number of the selection
    * `value` : the text of the selection
    * `numSel` : number of selections (or cursors)

    The `index` is 0-based to make (modulo) calculations easier. The first `index` is 0.
* `indexName` : (Optional) the name of the index when used to transform a multi file pick ([`remember`](remember.md), [`pickFile`](dialogs.md), [`openDialog`](dialogs.md)), default (`""`)

  If you want to construct a sequence number with an offset of 31 and a fixed length of 4 digits and separate the individual paths with `***` you can use these properties with the commands that have the `transform` property.

  ```jsonc
  {
    // other properties
    "key": "someKey",
    "separator": "***",
    "transform": {
      "text": "${jsExpression:offset}:${relativeFile}",
      "find": "\\\\",
      "replace": "/",
      "flags": "g",
      "indexName": "open",
      "jsExpression": {
        "offset": {
          "expression": "(${index:open}+31).toString().padStart(4,'0')"
        }
      }
    }
  }
  ```
* `saveToFile` : (Optional) a file path where to store the result of the transform in UTF-8 format. Can contain [variables](variables.md). The string returned is the file path. The file path is also stored under the `key`. (default: undefined )
* `empty` : (Optional) [ `true` | `false` ] valid when `saveToFile` is defined. If `true`: result of command is the empty string. This is the last test of the command. (default: `false`)

Example:

If you want the directory name of the active editor file but using forward slash (on Windows, see [issue 47](https://github.com/rioj7/command-variable/issues/47))

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Current File Dirname Forward Slash",
      "type": "shell",
      "command": "my_program",
      "args": [
        "${input:fileDirnameForwardSlash}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "fileDirnameForwardSlash",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${fileDirname}",
        "find": "\\\\",  // Reason for four '\': https://stackoverflow.com/a/4025505/2909854
        "replace": "/",
        "flags": "g"
      }
    }
  ]
}
```

### Custom variables

We can use this command to construct custom variables by setting the `text` argument and not defining a `find` argument. The `id` of the `inputs` record is the name of the variable.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Node",
      "runtimeArgs": ["user", "${input:TEST_USER}"],
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Chrome",
      "url": "http://localhost:3000?${input:TEST_USER}",
    }
  ],
  "inputs": [
    {
      "id": "TEST_USER",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": { "text": "BobSmith" }
    }
  ]
}
```

### Save to file

If you want to store the result of a `transform`, `pickStringRemember`, `promptStringRemember`, or any other command to a file and pass the path of the file as the result.

You have to wrap the command with a `transform` command that can save to a file.

You can use an `input` like:

```json
    {
      "id": "saveToFile",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "saveToFile": "${workspaceFolder}/.vscode/temp-text.txt",
        "text": "${promptStringRemember:getContent}",
        "key": "tmpfile",
        "promptStringRemember": {
          "getContent": {
              "description": "What to store in the file",
              "key": "fileContent"
          }
        }
      }
    }
```

In the task or launch config you use `${input:saveToFile}`. You can use [`remember`](remember.md) with the keys `tmpfile` for file path, `fileContent` for the file content. Or the [`${remember}`](variables.md) variable.
