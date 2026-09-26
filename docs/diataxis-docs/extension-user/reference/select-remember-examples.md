---
audience: extension-user
diataxis: reference
reading-time: 7 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 7 minutes
# Selection list examples 1 to 5

The first five worked examples for the `pickStringRemember` command, reused from the README unchanged. The command's arguments are on the [selection list and prompt commands](select-remember-commands.md) page. The later examples are on [examples 6 to 10](select-remember-examples-2.md) and [examples 11 to 15](select-remember-examples-3.md).

**Example 1**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Task 1",
      "type": "shell",
      "command": "dostuff1",
      "args": ["-p", "${input:pickPath}"]
    },
    {
      "label": "Task 2",
      "type": "shell",
      "command": "dostuff2",
      "args": ["-p", "${input:rememberPath}"]
    },
    {
      "label": "Do Task 1 and 2",
      "dependsOrder": "sequence",
      "dependsOn": ["Task 1", "Task 2"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "pickPath",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "key": "path",
        "options": [ "path/to/directory/A", "path/to/Z" ],
        "description": "Choose a path"
      }
    },
    {
      "id": "rememberPath",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path" }
    }
  ]
}
```

**Example 2**

An example of choosing a port number in a launch configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Service1",
      "type": "python",
      "request": "attach",
      "connect": {
        "host": "127.0.0.1",
        "port": "${input:envType}"
      }
    }
  ],
  "inputs": [
    {
      "id": "envType",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which env do you want to debug?",
        "options": [
          ["development", "5000"],
          ["staging", "5100"],
          ["live", "5200"]
        ],
        "default": "5000"
      }
    }
  ]
}
```

**Example 3**

If you have additional options in a file:

* the line is not a comment, does not start with a `#` character
* the separator of _label_ and _value_ is a `=`
* _value_ can be a JSON object

```json
{
  "version": "0.2.0",
  "configurations": [
    // see previous example
  ],
  "inputs": [
    {
      "id": "envType",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which env do you want to debug?",
        "options": [
          ["development", "5000"],
          ["staging", "5100"],
          ["live", "5200"]
        ],
        "default": "5000",
        "fileName": "${workspaceFolder}/dynamic-env.txt",
        "pattern": {
          "regexp": "^\\s*(?!#)([^=]+?)\\s*=\\s*(?:(\\{.+\\})|(.+))$",
          "label": "$1",
          "json": "$2",
          "value": "$3"
        }
      }
    }
  ]
}
```

**Example 4**

An example task that stores multiple values:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Do some project",
      "type": "process",
      "command": "echo",
      "args": [
        "${input:selectProject.path}",
        "${input:selectProject.name}",
        "${input:selectProject.link}",
        "${input:selectProject.anyOther}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "selectProject.path",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "key": "path",
        "options": [
          ["project1", {"path":"p1","name":"n1","link":"lnk1","anyOther":"any1"}],
          ["project2", {"path":"p2","name":"n2","link":"lnk2","anyOther":"any2"}]
         ],
        "description": "Pick a project"
      }
    },
    {
      "id": "selectProject.name",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "name" }
    },
    {
      "id": "selectProject.link",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "link" }
    },
    {
      "id": "selectProject.anyOther",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "anyOther" }
    }
  ]
}
```

**Example 5**

Using a string manipulation object you can modify an existing variable:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build project",
      "type": "process",
      "command": "build ${input:buildArgsConstruct}",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "buildArgsConstruct",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Construct buildArgs:",
        "key": "__undefined",
        "options": [
          { "label": "Current value",
            "description": "${remember:buildArgs}",
            "value": "${remember:buildArgs}"
          },
          { "label": "reset", "value": { "buildArgs": "" } },
          { "label": "append: -c release",
            "value": {
              "buildArgs": {
                "text": "-c release",
                "action": "append",
                "delimiter": " "
              }
            }
          },
          { "label": "prepend: -path ${workspaceFolder}",
            "value": {
              "buildArgs": {
                "text": "-path ${workspaceFolder}",
                "action": "prepend",
                "delimiter": " "
              }
            }
          }
        ]
      }
    }
  ]
}
```

If we use `"key": "__undefined"` any selected option that uses a _key_-_value_ pair(s) object will return `undefined`. This will abort the current task. The remember store is updated.

When you choose the option **Current value** pickStringRemember returns the value for a given _`key`_.

----
