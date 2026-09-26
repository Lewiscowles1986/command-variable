---
audience: extension-user
diataxis: reference
reading-time: 8 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 8 minutes
# Remember commands

The remember store keeps a value from one task so a later task in the same session can use it. The command below reads and writes the store directly; several other commands write into it as a side effect. The store's behaviour between sessions is described in [the remember store](../explanation/the-remember-store.md).

## The remember command

It can be useful to store key-value pairs to be used later. The value of the key is remembered for this session of Visual Studio Code.

Some commands in this extension can store key-value pairs: [`pickStringRemember`](select-remember-commands.md), [`promptStringRemember`](select-remember-commands.md), [`file.content`](file-content.md) (json, key-value, yaml), [`file.pickFile`](dialogs.md).

The stored value is retrieved with a command or a [variable](variables.md). In the same task/launch config or in a different one, or in a keybinding.

The command `extension.commandvariable.remember` is used to retreive a value for a particular key or store _key_-_value_ pair(s).

`text` is not a valid _`key`_. It is a property of a string manipulation object and used to determine if an object is a string manipulation object or an object with _key_-_value_ pair(s).

The `args` property of this command is an object with the properties:

* `store` : (Optional) an object with _key_-_value_ pair(s). Every _key_-_value_ is stored in the `remember` storage. The _value_ can be a string or a **string manipulation object**. With a string manipulation object you can modify the current value that is stored for the given _key_ or remove/forget the given _key_. If the key is not in the store it has a current value of the empty string. The possible properties of this object are:
  * `text`: a string used to modify the current value (default: `""`)
  * `delimiter`: (Optional) if we need to concatenate strings use this as delimiter string, if current value is the empty string `delimiter` is also empty string (default: `""`).
  * `action`: (Optional) what to do with the _`text`_ string (default: `store`). Possible values:
    * `store`: replace current value with _`text`_.
    * `append`: append `text` to current value and use given _`delimiter`_
    * `prepend`: prepend `text` to current value and use given _`delimiter`_
    * `forget`: remove the given _key_ from the remember store
* `key` : (Optional) the name of the key to retreive from the remember store. The `key` can contain [variables](variables.md). (default: `"empty"`) To get the value of a named [number](number-transform.md) use the key format: <code>number-<em>name</em></code>
* [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)
* `default`: (Optional) If the given key is not found in the remember store: if there is a property `default` use this value, otherwise use a string with value `I don't remember`.
* `transform`: (Optional) (**Not in Web**) an object with the same properties as the [`transform`](number-transform.md) command. It allows to find and replace in the string or to extract part of the [`file.pickFile`](dialogs.md) picked file URI by using a [variable](variables.md). The default value of the `text` property is `${result}`. This is the value stored in the remember store for the given `key`.
* `separator`: (Optional) (**Not in Web**) If you have picked multiple files ([`pickFile`](dialogs.md), [openDialog](dialogs.md)) the URI's are transformed and then joined with this string. (default: `" "`)

If you need to construct a new string with the value you can use the [variable](variables.md): <code>&dollar;{remember:<em>key</em>}</code>. This can only be used in `args` properties of commands in this extension. The `inputs` list of `launch.json` and `tasks.json` or in `keybindings` or extensions that call commands with arguments ([Multi Command](https://marketplace.visualstudio.com/items?itemName=ryuta46.multi-command)). You can modify the value with the [`transform`](number-transform.md) command or the `transform` property.

If the stored value contains variables and you want them substituted you have to set the `transform` property. An empty object is enough.

```jsonc
{
  // .....
  "inputs": [
    {
      "id": "remember.path",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path", "transform": { } }
    }
  ]
}
```

The Prompt-only-once was requested by [shato](https://github.com/rioj7/command-variable/issues/113).

If you need a Prompt-only-once or Pick-only-once in this session you can use the `default` property of the `remember` command that specifies a `${promptStringRemember}` or `${pickStringRemember}` variable. Then use the `transform` property of the `remember` command to expand the variable. You have to put the named arguments **in** the `transform` property.

```jsonc
{
  // .....
  "inputs": [
    {
      "id": "prompt-password-once",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": {
        "key": "myPassword",
        "default": "${promptStringRemember:password}",
        "transform": {
          "promptStringRemember": {
            "password": {
              "key": "myPassword",
              "description": "Enter password"
            }
          }
        }
      }
    }
  ]
}
```

The default content of the remember store:

* `empty` : `""`, the empty string, useful if you want to store the value(s) but not return some string in `pickStringRemember`

The command [pickStringRemember](select-remember-commands.md) also supports string manipulation objects.

The example is a bit contrived but it shows how you can store _key_-_value_ pair(s) in a launch config or task without using a stored value, the result of the `${input:rememberConfig}` is the empty string. This enables you to store values in a launch config to be used in a `prelaunchTask` in `tasks.json`.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "DoSomething",
      "type": "shell",
      "command": "${config:python.pythonPath}${input:rememberConfig}",
      "args": [
        "my_script.py",
        "${input:remember.path}",
        "${input:remember.name}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "rememberConfig",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": {
        "store": {"path":"server","name":"boya","user":"Mememe","option":"yeah"}
      }
    },
    {
      "id": "remember.path",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path" }
    },
    {
      "id": "remember.name",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "name" }
    }
  ]
}
```

If you have picked a file, the `key` used is `sourceFile`, and you don't want the full file path you can get certain parts with the `transform` property:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "DoSomething2",
      "type": "shell",
      "command": "${config:python.pythonPath}",
      "args": [
        "my_script2.py",
        "${input:remember.showWorkspace}",
        "${input:remember.showBasename}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "remember.showWorkspace",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "sourceFile", "transform": { "text": "${workspaceFolder}" } }
    },
    {
      "id": "remember.showBasename",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "sourceFile", "transform": { "text": "${fileBasename}" } }
    }
  ]
}
```

An example of a string manipulation object. If you have a remembered _`key`_ `buildArgs` and want to add an argument to get a release build:

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    // .....
  ],
  "inputs": [
    {
      "id": "addReleaseArgument",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": {
        "store": {
          "buildArgs": {
            "text": "-c release",
            "action": "append",
            "delimiter": " "
          }
        }
      }
    }
  ]
}
```

## Related pages

- [Remember a value between tasks](../how-to/remember-value-between-tasks.md)
- [Select and remember a value](../tutorials/select-and-remember-a-value.md)
