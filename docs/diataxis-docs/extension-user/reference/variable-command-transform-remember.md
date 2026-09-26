---
audience: extension-user
diataxis: reference
reading-time: 7 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 7 minutes
# The command variable

Run a command and use its result as a variable value. The arguments travel in
a named property of the parent command's `args`.

### Variable `command`

If you want to transform result of a command you use the <code>&dollar;{command:<em>name</em>}</code> variable in the `text` property of the `extension.commandvariable.transform` command.

`name` can be a commandID or a _named argument object property_ (like `pickStringRemember`)

#### CommandID

If the command does not use arguments you place the commandID directly in the variable.

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo relative file no ext with dots - first dir removed",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:relativeNoExtDotsBaseOff}" ]
    }
  ],
  "inputs": [
    {
      "id": "relativeNoExtDotsBaseOff",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${command:extension.commandvariable.file.relativeFileDotsNoExtension}",
        "find": "^[^.]+\\."
      }
    }
  ]
}
```

#### Named Arguments

If the command uses arguments you have to put these in the arguments of the parent command in the property `command`. (Just like with the [<code>&dollar;{pickStringRemember:<em>name</em>}</code> variable](variable-pickstringremember.md))

The named arguments have the following properties:

* `command` : the commandID to execute, can contain variables (see example [Construct commandID](variable-command-transform-remember.md#construct-commandid))
* `args` : the arguments for this commandID
* `variableSubstArgs` : if `true`, [variables](variables.md) will be expanded within the `args` prior to the command being executed (default: `false`)

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo top 2 workspace folder names",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:workspaceTop2Folders}" ]
    }
  ],
  "inputs": [
    {
      "id": "workspaceTop2Folders",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${command:folderPosix}",
        "find": "^.*/([^/]+/[^/]+)$",
        "replace": "$1",
        "command": {
          "folderPosix": {
            "command": "extension.commandvariable.workspace.folderPosix",
            "args": { "name": "server" }
          }
        }
      }
    }
  ]
}
```

Next feature and example by Thomas Moore ([issue 50](https://github.com/rioj7/command-variable/issues/50))

The following example shows how the `variableSubstArgs` option can be used to expand variables in a command used as a named argument. In this case, the [<code>&dollar;{pickStringRemember:pickAnOption}</code>](variable-pickstringremember.md) variable is expanded prior to the argument being passed to the `shellCommand.execute` command (provided by the [Tasks Shell Input](https://marketplace.visualstudio.com/items?itemName=augustocdias.tasks-shell-input) extension).

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Get Option String",
      "type": "shell",
      "command": "echo \"The option string is '${input:getOptionString}' and the selection option is '${input:selectedOption}'\"",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "getOptionString",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "key": "optionString",
        "text": "${command:getOptionString}",
        "command": {
          "getOptionString": {
            "command": "shellCommand.execute",
            "variableSubstArgs": true,
            "args": {
              "command": "echo You selected ${pickStringRemember:pickAnOption}",
              "useSingleResult": true,
            },
            "pickStringRemember": {
              "pickAnOption": {
                "key": "selectedOption",
                "description": "Pick an option",
                "options": [
                  { "label": "Previous option:",
                    "value": "${remember:selectedOption}",
                    "description": "${remember:selectedOption}"
                  },
                  "Option A",
                  "Option B",
                  "Option C",
                  "Option D"
                ]
              }
            }
          }
        }
      }
    },
    {
      "id": "selectedOption",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "selectedOption" }
    }
  ]
}
```

A realistic example is the execution of different bazel targets and option to use the previous target:

```json
"inputs": [
  {
    "id": "bazelTargetPath",
    "type": "command",
    "command": "extension.commandvariable.transform",
    "args": {
      "key": "selectedBazelTargetPath",
      "text": "${command:getBazelTargetPath}",
      "command": {
        "getBazelTargetPath": {
          "command": "shellCommand.execute",
          "variableSubstArgs": true,
          "args": {
            "command": "bazel cquery --config=${command:cpptools.activeConfigName} --compilation_mode=dbg --output=files ${pickStringRemember:pickBazelTarget}",
            "cwd": "${workspaceFolder}"
          },
          "pickStringRemember": {
            "pickBazelTarget" : {
              "description": "Choose a target",
              "key": "selectedBazelTarget",
              "rememberTransformed": true,
              "options": [
                { "label": "Previous Target:",
                  "value": "${remember:selectedBazelTarget}",
                  "description": "${remember:selectedBazelTarget}"
                },
                { "label": "Select target...", "value": "${command:bazelTargets}" },
              ],
              "command": {
                "bazelTargets": {
                  "command": "shellCommand.execute",
                  "args": {
                    "command": "bazel query 'kind(cc_binary*, //...)'",
                    "cwd": "${workspaceFolder}"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
]
```

#### Construct commandID

Sometimes you want to construct the commandID to execute.

Example based on [StackOverflow question](https://stackoverflow.com/q/77335284/9938317).

If you want to launch a particular configuration based on the file name of the current editor you can redefine the `F5` keybinding:

```json
  {
    "key": "f5",
    "command": "extension.commandvariable.transform",
    "when": "debuggersAvailable && debugState == 'inactive'",
    "args": {
      "text": "${command:launchCommand}",
      "command": {
        "launchCommand": {
          "command": "${transform:launchCommand}",
          "transform": {
            "launchCommand": {
              "text": "${command:launchCommand}",
              "command": {
                "launchCommand": {
                  "command": "extension.commandvariable.file.fileAsKey",
                  "args": {
                    "app.py": "launches.Streamlit",
                    "@default": "launches.OtherPython"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
```

The `command` property can't contain a <code>&dollar;{command:<em>name</em>}</code> variable, so we have to insert a <code>&dollar;{transform:<em>name</em>}</code> variable.

This key binding uses the [Launch Configs](https://marketplace.visualstudio.com/items?itemName=ArturoDent.launch-config) extention by ArturoDent.
