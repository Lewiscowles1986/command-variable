---
audience: extension-user
diataxis: reference
reading-time: 12 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 12 minutes
# Selection list examples 10 to 15

Worked examples ten to fifteen for the `pickStringRemember` command, reused
from the README unchanged. The earlier examples are on
[examples 1 to 5](select-remember-examples.md) and
[examples 6 to 9](select-remember-examples-2.md).

**Example 10**

#### Select server from pattern

If you have a configuration file where the pick item properties are specified on multiple lines you can construct a Regular Expression that matches each item. You have to use at least the `g` or `y` flag.

You have a file [**`~/.ssh/config`**](https://www.man7.org/linux/man-pages/man5/ssh_config.5.html) in your home directory where you specify a number of hosts you can use:

```ssh-config
Host server1
    HostName 1.1.1.1
Host server2
    HostName 2.2.2.2
Host server3
    HostName 3.3.3.3
```

Maybe there are other attributes specified for each `Host`.

A totorial for [ssh config files](https://linuxize.com/post/using-the-ssh-config-file/).

In **tasks.json**:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Get server progress",
      "type": "shell",
      "command": "progress --server ${input:selectServer}"
    }
  ],
  "inputs": [
    {
      "id": "selectServer",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which server?",
        "key": "server-ip",
        "fileName": "${env:HOME}/.ssh/config",
        "pattern": {
          "regexp": "Host (\\S+).*?HostName (\\S+)",
          "flags": "gs",
          "match": "find",
          "option": {
            "label": "$1",
            "value": "$2",
            "description": "$2"
          }
        }
      }
    }
  ]
}
```

You can make the `value` property as complex as you want, like in the previous example.

If you have `Host` sections that don't contain a `HostName` property you have to use the `split-regex` to prevent using a `HostName` of a next `Host` section:

```ssh-config
Host server1
    Port 2322
    HostName 1.1.1.1
Host server2
    User daenerys
    HostName 2.2.2.2
Host server3
    HostName 3.3.3.3
Host *
    LogLevel INFO
Host server4
    HostName 4.4.4.4
```

```json
        "pattern": {
          "regexp": "Host (\\S+).*?HostName (\\S+)",
          "flags": "gs",
          "split-regexp": "^Host ",
          "split-flags": "gm",
          "option": {
            "label": "$1",
            "value": "$2",
            "description": "$2"
          }
        }
```

The `match` property is set to `split`.

**Example 11**

If the picked value is an object you can override the key used to get a value from the remember storage.

```json
  "inputs": [
    {
      "id": "pickOptions",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Multi Pick Option Select:",
        "key": "myOptions",
        "multiPick": true,
        "options": [
          {"label": "opt1", "value": "O1"},
          {"label": "opt2", "value": {"keyA": "O2-a", "keyB": "O2-b", "keyC": "O2-c", "__key": "keyC"}},
          {"label": "opt3", "value": "O3"},
          {"label": "opt4", "value": "O4"}
        ]
      }
    }
  ]
```

If `opt2` and `opt3` are selected the remember storage contains

* the key `myOptions` with value: `O2-c O3`
* the key's `keyA`, `keyB` and `keyC` with there values.

**Example 12**

If the picked values are key-value pair objects and you want a result joined by key you have to set the `joinByKey` property.

You use a JSON file to construct some of the pick items.

In the workspaceFolder there is a file: `myconfig.json`

```json
[
  {
    "name": "name1",
    "some": "some1",
    "other": "other1"
  },
  {
    "name": "name2",
    "some": "some2",
    "other": "other2"
  },
  {
    "name": "name3",
    "some": "some3",
    "other": "other3"
  }
]
```

And in `tasks.json`:

```json
  "inputs": [
    {
      "id": "set-v1-v2",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Multi Pick v1 - v2",
        "key": "v2",
        "multiPick": true,
        "joinByKey": true,
        "separator": " ",
        "fileName": "${workspaceFolder}${pathSeparator}myconfig.json",
        "fileFormat": "json",
        "jsonOption": {
          "label": "content[__itemIdx__].name",
          "value": {
            "v1": "content[__itemIdx__].some",
            "v2": "content[__itemIdx__].other"
          }
        }
      }
    }
  ]
```

If `name1` and `name3` are selected the remember storage contains

* the key `v1` with value: `some1 some3`
* the key `v2` with value: `other1 other3`

and `${input:set-v1-v2}` returns the value for key `v2`: `other1 other3`

**Example 13**

Next feature is by Axel Le Bourhis ([issue 108](https://github.com/rioj7/command-variable/issues/108))

Sometimes you also want to use the items selected in a group. Or have the group selected items saved in individual remember keys and use 1 multipick instead of multiple `pickStringRemember` calls for each group.

You specify for the particular groups a `key`. If you want a particular `separator` you can.  
You can add the property `joinByKey` to a group if the option values are objects with key-value pairs.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Grovery List",
      "type": "shell",
      "command": "echo",
      "args": ["${input:groceryList}"]
    }
  ],
  "inputs": [
    {
      "id": "groceryList",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Select groceries",
        "key": "groceries",
        "multiPick": true,
        "optionGroups": [
          {
            "label": "Fruit",
            "minCount": 1,
            "maxCount": 3,
            "options": ["apple", "orange", "banana", "lychee"],
            "key": "category-fruit",
            "separator": "##"
          },
          {
            "label": "Vegetable",
            "minCount": 1,
            "maxCount": 3,
            "options": ["kousenband", "artichoke", "sopropo", "lettuce"],
            "key": "category-veg",
            "separator": "%%"
          }
        ]
      }
    },
    { "id": "category-fruit", "type": "command", "command": "extension.commandvariable.remember", "args": { "key": "category-fruit" } },
    { "id": "category-veg", "type": "command", "command": "extension.commandvariable.remember", "args": { "key": "category-veg" } }
  ]
}
```

You can use this also for a single pick list. Groups that do not have an item selected are stored in the remember store as an empty string.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Food Item",
      "type": "shell",
      "command": "echo",
      "args": ["${input:fooditem}"]
    }
  ],
  "inputs": [
    {
      "id": "fooditem",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Select a food item",
        "key": "food-item",
        "optionGroups": [
          {
            "label": "Fruit",
            "options": ["apple", "orange", "banana", "lychee"],
            "name": "fruit",
            "key": "category-fruit",
            "dependsOn": "fruit + veg === 1"
          },
          {
            "label": "Vegetable",
            "options": ["kousenband", "artichoke", "sopropo", "lettuce"],
            "name": "veg",
            "key": "category-veg"
          }
        ]
      }
    },
    { "id": "category-fruit", "type": "command", "command": "extension.commandvariable.remember", "args": { "key": "category-fruit" } },
    { "id": "category-veg", "type": "command", "command": "extension.commandvariable.remember", "args": { "key": "category-veg" } }
  ]
}
```

**Example 14**

If there are a lot of options in a group or they are dynamic or the option groups are dynamic you can load them from a file.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build",
      "type": "shell",
      "command": "echo",
      "args": ["${input:extra_options}", "${input:remember_sample}"]
    }
  ],
  "inputs": [
    {
      "id": "extra_options",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Select extra options",
        "key": "extra-options",
        "multiPick": true,
        "optionGroups": [
          {
            "label": "Sample",
            "minCount": 1,
            "maxCount": 1,
            "fileName": "${workspaceFolder}${pathSeparator}samples.json",
            "fileFormat": "json",
            "jsonOption": {
              "label": "content.Samples[__itemIdx__].label",
              "value": "content.Samples[__itemIdx__].value"
            }
          }
        ]
      }
    },
    { "id": "remember_sample", "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "sample-name" }
    }
  ]
}
```

**`samples.json`**

```json
{
  "Samples": [
    {
      "label": "sample1",
      "value": {
        "value": "path/to/sample1",
        "sample-name": "sample1",
        "__key": "value"
      }
    },
    {
      "label": "sample2",
      "value": {
        "value": "path/to/sample2",
        "sample-name": "sample2",
        "__key": "value"
      }
    }
  ]
}
```

**Example 15**

The `jsonOption` property can contain variables to dynamically modify the expression used.

In the root of the workspace you have a file `distros.json` containing different distribution names that are arrays with architecture options for cross compilation.

**`distros.json`**

```json
{
  "bullseye": [
    "armhf",
    "amd64"
  ],
  "trixie": [
    "arm64",
    "amd64"
  ]
}
```

The following `inputs` entry first shows a pick list for **distribution** and then a pick list for the **architectures** that are available.

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    // ....
  ],
  "inputs": [
    {
      "id": "cross-compilation",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which architecture?",
        "key": "architecture",
        "fileName": "${workspaceFolder}/distros.json",
        "fileFormat": "json",
        "jsonOption": {
          "value": "content['${pickStringRemember:distro}'][__itemIdx__]"
        },
        "pickStringRemember": {
          "distro": {
            "description": "Which distribution?",
            "key": "distribution",
            "fileName": "${workspaceFolder}/distros.json",
            "fileFormat": "json",
            "jsonOption": {
              "value": "Object.keys(content)[__itemIdx__]"
            }
          }
        }
      }
    }
  ]
}
```
