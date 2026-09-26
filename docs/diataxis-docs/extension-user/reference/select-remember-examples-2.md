---
audience: extension-user
diataxis: reference
reading-time: 11 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 11 minutes
# Selection list examples 6 to 9

Worked examples six to nine for the `pickStringRemember` command, reused from the README unchanged. The earlier examples are on [examples 1 to 5](select-remember-examples.md); the later ones on [examples 10 to 15](select-remember-examples-3.md).

**Example 6**

If you have a `src` directory with a lot of subdirs and you want to run `cpplint` on all or only on a subdir you can add a `pickFile` variable as the value of a `pickString`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "cpp lint",
      "type": "shell",
      "command": "cpplint ${input:selectDir}"
    }
  ],
  "inputs": [
    {
      "id": "selectDir",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which directory to Lint for C++?",
        "options": [
          ["Use previous directory", "${remember:lintPath}"],
          ["All", "all"],
          ["Pick directory", "${pickFile:srcSubDir}"]
        ],
        "rememberTransformed": true,
        "key": "lintPath",
        "pickFile": {
          "srcSubDir": {
            "description": "Which directory?",
            "include": "src/**/*.{cpp,h}",
            "showDirs": true,
            "keyRemember": "srcSubDir"
          }
        }
      }
    }
  ]
}
```

We can also use the object variant of the `options`, this allows us to show resolved variables in the pick list.

Possibilities for the `Use previous directory` are:

* Only show the label text
  ```json
  { "label": "Use previous directory", "value": "${remember:lintPath}" }
  ```
* Only show the label text but variables resolved
  ```json
  { "label": "${remember:lintPath}", "value": "${remember:lintPath}" }
  ```
* Show the resolved variables in the description
  ```json
  { "label": "Use previous directory:",
     "description": "${remember:lintPath}",
     "value": "${remember:lintPath}"
  }
  ```

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "cpp lint",
      "type": "shell",
      "command": "cpplint ${input:selectDir}"
    }
  ],
  "inputs": [
    {
      "id": "selectDir",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which directory to Lint for C++?",
        "options": [
          { "label": "Use previous directory",
            "description": "${remember:lintPath}",
            "value": "${remember:lintPath}" },
          { "label": "All", "value": "all" },
          { "label": "Pick directory", "value": "${pickFile:srcSubDir}" }
        ],
        "rememberTransformed": true,
        "key": "lintPath",
        "pickFile": {
          "srcSubDir": {
            "description": "Which directory?",
            "include": "src/**/*.{cpp,h}",
            "showDirs": true,
            "keyRemember": "srcSubDir"
          }
        }
      }
    }
  ]
}
```

**Example 7**

If you have a list of choices and you want to easy select the previous choice you can use the `addLabelToTop` property:

```json
{
  "version": "2.0.0",
  "tasks": [
    .....
  ],
  "inputs": [
    {
      "id": "robot",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "key": "robot",
        "description": "Robot type:",
        "addLabelToTop": "${remember:robot}",
        "options": [
          "standard",
          "hero",
          "sentry"
        ]
      }
    }
  ]
}
```

If your labels are different from the `value` add an extra remember item:

```json
{
  "version": "2.0.0",
  "tasks": [
    .....
  ],
  "inputs": [
    {
      "id": "robot",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "key": "robot",
        "description": "Robot type:",
        "addLabelToTop": "${remember:robotLabel}",
        "options": [
          {"label": "Option 1", "value": {"robot":"standard", "robotLabel":"Option 1"} },
          {"label": "Option 2", "value": {"robot":"hero", "robotLabel":"Option 2"} },
          {"label": "Option 3", "value": {"robot":"sentry", "robotLabel":"Option 3"} }
        ]
      }
    }
  ]
}
```

**Example 8**

If you have a C++ build task that has many options and you sometimes have to select 1 or more items in a group:

The actual compile task is not shown. It depends on the used compiler. The task uses the variable: `${input:cpp-options-powerAI}`

```json
{
  "version": "2.0.0",
  "tasks": [
    .....
  ],
  "inputs": [
    {
      "id": "cpp-options-powerAI",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "C++ build options",
        "key": "cpp-build-powerAI",
        "multiPick": true,
        "optionGroups": [
          {
            "label": "Debug / Release",
            "minCount": 1,
            "maxCount": 1,
            "options": [
              ["debug", "-g"],
              ["release", "-O2"]
            ]
          },
          {
            "label": "C++ standard",
            "minCount": 1,
            "maxCount": 1,
            "options": [
              ["C++11", "-std=c++11"],
              ["C++14", "-std=c++14"],
              ["C++17", "-std=c++17"],
              ["C++20", "-std=c++20"]
            ]
          },
          {
            "label": "Log Options",
            "options": [
              ["Input", "-log=input"],
              ["Output", "-log=output"]
            ]
          }
        ]
      }
    }
  ]
}
```

An example of using `dependsOn` to select the arguments for an application:

```json
{
  "version": "2.0.0",
  "tasks": [
    .....
  ],
  "inputs": [
    {
      "id": "powerAI",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Execution arguments",
        "key": "run-powerAI",
        "multiPick": true,
        "optionGroups": [
          {
            "label": "Debug / Release",
            "minCount": 1,
            "maxCount": 1,
            "options": [
              {"label": "debug", "value": "--debugg", "name": "debug"},
              {"label": "release", "value": "--release", "name": "release"}
            ]
          },
          {
            "label": "Port Number",
            "minCount": 1,
            "maxCount": 2,
            "dependsOn": "release",
            "options": [
              ["development", "5000"],
              ["staging", "5100"],
              ["live", "5200"]
            ]
          },
          {
            "label": "Logging",
            "name": "logging",
            "dependsOn": "debug",
            "options": [
              ["Logging", "--logging"]
            ]
          },
          {
            "label": "Training",
            "name": "training",
            "options": [
              ["Training", "--training"]
            ]
          },
          {
            "label": "Log Options",
            "minCount": 1,
            "dependsOn": "debug && logging",
            "options": [
              ["Log Input", "--log=input"],
              ["Log Output", "--log=output"],
              {"label": "Log Training", "value": "--log=training", "dependsOn": "training"}
            ]
          }
        ]
      }
    }
  ]
}
```

**Example 9**

#### Select server from JSON

When you have a JSON file that specifies a list of servers you can use and you want to pick one of the servers and pass some attributes to a task.

The servers are specified in **servers.json** that is in the root of the workspace:

```json
{
  "Servers": [
    {
      "name": "S1T",
      "description": "Server Test 1",
      "hostname": "st001.test.mycomp.com",
      "port": "1234"
    },
    {
      "name": "S2T",
      "description": "Server Test 2",
      "hostname": "sq003.test.mycomp.com",
      "port": "1235"
    },
    {
      "name": "S1P",
      "description": "Server Prod 1",
      "hostname": "spab.mycomp.com",
      "port": "1236"
    },
    {
      "name": "S2P",
      "description": "Server Prod 2",
      "hostname": "sdef01.cs.mycomp.com",
      "port": "1237"
    }
  ]
}
```

In **tasks.json**:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Get server progress",
      "type": "shell",
      "command": "progress --server ${input:selectServer} --host ${input:server-hostname} --port ${input:server-port}"
    }
  ],
  "inputs": [
    {
      "id": "selectServer",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which server?",
        "key": "server-name",
        "fileName": "${workspaceFolder}/servers.json",
        "fileFormat": "json",
        "jsonOption": {
          "label": "content.Servers[__itemIdx__].name",
          "description": "content.Servers[__itemIdx__].description",
          "value": {
            "server-name": "content.Servers[__itemIdx__].name",
            "server-hostname": "content.Servers[__itemIdx__].hostname",
            "server-port": "content.Servers[__itemIdx__].port"
          }
        }
      }
    },
    {
      "id": "server-hostname",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "server-hostname" }
    },
    {
      "id": "server-port",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "server-port" }
    }
  ]
}
```
