---
audience: extension-user
diataxis: reference
reading-time: 7 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 7 minutes
# File content commands

The command `extension.commandvariable.file.content` reads a file and returns
its content, or one value extracted from it. It works on plain text, key-value
files, JSON and YAML. The plain-content arguments are on this page; the
per-format arguments follow.

If you have a JSON file and you want the value for a given property you can use the command `extension.commandvariable.file.content`.

The supported arguments:

* `fileName` : specifies the file to read, see [File Content](#file-content).
* `json` : specifies a JavaScript expression that gets the property you want from the variable `content`. The variable `content` is the parsed JSON file. The JavaScript expression can contain [variables](#variables) like `${remember:foobar}`
* `default` : (Optional) If the JavaScript expression fails and you have defined `default` that string is returned else `"Unknown"` is returned.
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"fileContent"`)
* `debug` : (Optional) [ `true` | `false` ] Show debug log messages in **Developer Tools Console**. (default: `false`)

The JSON file can be an array and you can address the elements with: `content[3]`

If the property in the JSON file contains non-identifier characters you have to use the string-index method to get the property.

```json
"json": "content['server-root'].port"
```

The JSON file can contain comments and trailing commas

```jsonc
{ // test servers
  "server1": "cloud-251-abc:23000",
  "server2": "cloud-333-xyz:44111",
}
```

Can be used as [variable](#variables) <code>&dollar;{fileContent:<em>name</em>}</code>

### Example

You have a JSON configuration file in your workspace:

**`config.json`**

```json
{
  "log": "foobar.log",
  "server1": {
    "port": 5011
  },
  "server2": {
    "port": 5023
  }
}
```

In your `tasks.json` you want to use the server1 port value.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Server1Port",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServer1Port}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
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
  ]
}
```

If you have a YAML file and you want the value for a given property you can use the command `extension.commandvariable.file.content`.

The supported arguments:

* `fileName` : specifies the file to read, see [File Content](#file-content).
* `yaml` : specifies a JavaScript expression that gets the property you want from the variable `content`. The variable `content` is the parsed YAML file. The JavaScript expression can contain [variables](#variables) like `${remember:foobar}`
* `default` : (Optional) If the JavaScript expression fails and you have defined `default` that string is returned else `"Unknown"` is returned.
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"fileContent"`)
* `debug` : (Optional) [ `true` | `false` ] Show debug log messages in **Developer Tools Console**. (default: `false`)

Can be used as [variable](#variables) <code>&dollar;{fileContent:<em>name</em>}</code>

See [File Content JSON Property](#file-content-json-property) for examples.

If the file contains multiple key-values or properties you want in your task or launch you can remember the picked file and use the same path in another `extension.commandvariable.file.content` use.

You have the following configuration files in your workspace:

**`server1-config.json`**

```json
{
  "log": "foobar1.log",
  "server": {
    "port": 5011,
    "publicCryptKey": "01234abcd"
  }
}
```

**`server2-config.json`**

```json
{
  "log": "foobar2.log",
  "server": {
    "port": 5023,
    "publicCryptKey": "9876zyxw"
  }
}
```

Use it in your `tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo ServerPortAndCryptKey",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServerPort}",
        "${input:configServerCryptKey}",
        "${input:serverURL}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "configServerPort",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${pickFile:config}",
        "json": "content.server.port",
        "default": "4321",
        "keyRemember": "ServerPort",
        "pickFile": {
          "config": {
            "include": "**/*.json",
            "exclude": ".vscode/*.json",
            "keyRemember": "configFile"
          }
        }
      }
    },
    {
      "id": "configServerCryptKey",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${remember:configFile}",
        "json": "content.server.publicCryptKey"
      }
    },
    {
      "id": "serverURL",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": { "text": "https://example.org:${remember:ServerPort}/" }
    }
  ]
}
```

## File content in the editor

If you want the (partial) result of an external program inserted in the editor you can use the command `extension.commandvariable.file.contentInEditor`. This command uses the same arguments as `extension.commandvariable.file.content`.

Most likely you want to call the program first to write the output to a file that you read and extract the parts you want. For this you can use the extension [multi-command](https://marketplace.visualstudio.com/items?itemName=ryuta46.multi-command).

1. Define a task that runs the external command
1. Define a multi-command that calls the task and then `extension.commandvariable.file.contentInEditor`
1. Define a key binding that calls the multi-command

Add to **`.vscode/tasks.json`**

```json
    {
      "label": "get Timestamp",
      "type": "shell",
      "command": "echo timestamp=2021-04-01 12:34 >${workspaceFolder}/timequery.txt",
      "problemMatcher": []
    }
```

Add to **`.vscode/settings.json`**

```json
  "multiCommand.commands": [
    {
      "command": "multiCommand.insertTimestamp",
      "interval": 500,
      "sequence": [
        { "command": "workbench.action.tasks.runTask",
          "args": "get Timestamp"
        },
        { "command": "extension.commandvariable.file.contentInEditor",
          "args": {
            "fileName": "${workspaceFolder}/timequery.txt",
            "key": "timestamp",
            "default": "Query failed"
          }
        }
      ]
    }
  ]
```

Add to **`keybindings.json`**

```json
  {
    "key": "F1", // or any other key combo
    "command": "extension.multiCommand.execute",
    "args": { "command": "multiCommand.insertTimestamp" },
    "when": "editorTextFocus"
  }
```

## Related pages

- [Read one value from a file](../how-to/read-value-from-file.md)
