---
audience: extension-user
diataxis: reference
reading-time: 5 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 5 minutes
# Expression commands

These commands evaluate a JavaScript expression over a configuration value or
computed text. They are the general tool when a dedicated command is almost
what you need.

## Config Expression

If you have an array or object as configuration variable content (`settings.json`) and you want a particular element of the array or the value for a given object property you can use the command `extension.commandvariable.config.expression`.

Can be used to have a [JavaScript expression containing variables](#variables-in-javascript-expression).

The supported arguments:

* `configVariable` : (Optional) specifies the settings variable to read. Must contain a `section` part (at least 1 `.`) : `sectionX.configY`. Supports [variables](#variables) (default: `"editor.fontSize"`).
* `expression` : specifies a JavaScript expression that has the value of the `configVariable` in the variable `content`. The JavaScript expression can contain [variables](#variables) like <code>&dollar;{remember:<em>foobar</em>}</code> or <code>&dollar;{pickStringRemember:<em>name</em>}</code>
* `default` : (Optional) If the JavaScript expression fails and you have defined `default` that string is returned else `"Unknown"` is returned.
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"configExpression"`)
* `debug` : (Optional) [ `true` | `false` ] Show debug log messages in **Developer Tools Console**. (default: `false`)

If the `configVariable` is an array you can address the elements with: `content[3]`

If the `configVariable` is an object you can address a property with: `content.inputDir`

If the `configVariable` is a single data type (string, number, boolean) **don't set** the `expression` property. Strings are returned without `"` separator characters.

If you want the value of the `configVariable` as a JSON string **don't set** the `expression` property.

Any expression is allowed that does not have a function call. All arithmetic operators, comparison operators, ...

Can be used as [variable](#variables): <code>&dollar;{configExpression:<em>name</em>}</code>

### Example

You have the following variable in `settings.json`:

```json
{
  "someExt.servers": {
    "log": "foobar.log",
    "server1": {
      "port": 5011
    },
    "server2": {
      "port": 5023
    }
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
      "command": "extension.commandvariable.config.expression",
      "args": {
        "configVariable": "someExt.servers",
        "expression": "content.server1.port",
        "default": "4321",
        "keyRemember": "ServerPort"
      }
    }
  ]
}
```

If you want to select the server from a pick list you can change the `inputs` part:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Server1Port",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServerPort}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "configServerPort",
      "type": "command",
      "command": "extension.commandvariable.config.expression",
      "args": {
        "configVariable": "someExt.servers",
        "expression": "content.server${pickStringRemember:serverNr}.port",
        "pickStringRemember": {
          "serverNr": {
            "description": "Which server to use?",
            "options": [
              ["development", "1"],
              ["live", "2"]
            ]
          }
        },
        "default": "4321",
        "keyRemember": "ServerPort"
      }
    }
  ]
}
```

## JavaScript Expression

The command `extension.commandvariable.js.expression` is an alias of [`extension.commandvariable.config.expression`](#config-expression).

You can use it to perform an expression with [variables](#variables).

Can be used as [variable](#variables): <code>&dollar;{jsExpression:<em>name</em>}</code>

## inTerminal

The command `extension.commandvariable.inTerminal` types the string result of a command in the terminal and optional types a Carriage Return.

The command `extension.commandvariable.inTerminal` has an argument that is an object with the following properties:

* `command` : the command to execute
* `args` : (Optional) the argument (string, array or object) for the `command`
* `addCR` : (Optional) boolean: end the text from the `command` with a Carriage Return (`\u000D`) (default: `false`)
* `when` : (Optional) string: only execute the command when the condition is `true`.  
  Possible tests:
  * <code>file.exists <em>path</em></code> : _path_ can contain [variables](#variables).  
    example: `"when": "file.exists ${workspaceFolder}${pathSeparator}package.json"`

If you want to use the value of a standard variable in the terminal you have to use the command `extension.commandvariable.transform` in the `extension.commandvariable.inTerminal` arguments. An example:

```json
  {
    "key": "ctrl+i f5",  // or any other combo
    "command": "extension.commandvariable.inTerminal",
    "args": {
      "command": "extension.commandvariable.transform",
      "args": { "text": "${relativeFile}" }
    }
  }
```
