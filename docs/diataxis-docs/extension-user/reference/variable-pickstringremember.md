---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# The pickStringRemember and promptStringRemember variables

The input commands can be used as variables. The arguments travel in a named
property of the parent command's `args`.

### Variable `pickStringRemember`

If you want to add an entry you pick from a list use the variable: <code>&dollar;{pickStringRemember:<em>name</em>}</code>

_`name`_ is the property name of the `pickStringRemember` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `pickStringRemember` have to be part of the arguments of the command.

See the command [`extension.commandvariable.pickStringRemember`](select-remember-commands.md) for the arguments you can use.

An example shows faster how it is to be used compared to a lot of text.

```json
"inputs": [
  {
    "id": "appSelect",
    "type": "command",
    "command": "extension.commandvariable.transform",
    "args": {
      "text": "We are using ${pickStringRemember:appName} on port ${pickStringRemember:portNum}",
      "pickStringRemember": {
        "appName": {
            "description": "What APP are you running?",
            "options": [ "client", "server", "stresstest", "pentest", "unittest" ],
            "default": "server"
        },
        "portNum": {
          "description": "What protocol?",
          "options": [
            ["http", "80"],
            ["http over proxy", "8080"],
            ["ftp", "21"]
          ],
          "default": "80"
        }
      }
    }
  }
]
```

### Variable `promptStringRemember`

The `promptStringRemember` variable works the same as the [`pickStringRemember` variable](variable-pickstringremember.md).
If you want to add an entry you type on the keyboard use the variable: <code>&dollar;{promptStringRemember:<em>name</em>}</code>

_`name`_ is the property name of the `promptStringRemember` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `promptStringRemember` have to be part of the arguments of the command.

See the command [`extension.commandvariable.promptStringRemember`](select-remember-commands.md) for the arguments you can use.
