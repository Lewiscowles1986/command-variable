---
audience: extension-user
diataxis: reference
reading-time: 4 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 4 minutes
# Variables

Many command arguments support variables. VS Code performs variable
substitution in task and launch fields, but not inside the `inputs` block, so
this extension implements a selection of variables for use in command
arguments.

## The variables

Many strings of commands support variables.

If the variable substitution is done with a [`pickFile:transform`](dialogs.md) or [`remember:transform`](remember.md) of a picked file, command or variable, the text "**current opened file**" should be replaced with "**picked file**".

VSC does not perform [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) in the strings of the `inputs` fields, so currently only a selection of variables is replicated here:

* `${selectedText}` : a joined string constructed from the (multi cursor) selections.<br/>You can [overide the used properties by embedding them in the variable](variable-selectedtext.md)
* <code>&dollar;{env:<em>name</em>}</code> : get the value for environment variable <code><em>name</em></code>
* <code>&dollar;{pathSeparator}</code> : the character used by the operating system to separate components in file paths
* <code>&dollar;{userHome}</code> : the path of the user's home folder
* `${workspaceFolder}` : the path of the workspace folder opened in VS Code containing the current file.
* <code>&dollar;{workspaceFolder:<em>name</em>}</code> : the path of the workspace folder with the specified _name_ opened in VS Code
* <code>&dollar;{workspaceFolder:<em>name</em>:nomsg}</code> : same as <code>&dollar;{workspaceFolder:<em>name</em>}</code> but there will be no ErrorMessage shown.
* `${workspaceFolderBasename}` : the name of the workspace folder opened in VS Code containing the current file without any slashes
* `${file}` : the current opened file (the file system path)
* `${relativeFile}` : the current opened file relative to workspaceFolder
* `${relativeFileDirname}` : the current opened file's dirname relative to workspaceFolder
* `${fileBasename}` : the current opened file's basename
* `${fileBasenameNoExtension}` : the current opened file's basename with no file extension
* `${fileExtname}` : the current opened file's extension
* `${fileDirname}` : the current opened file's dirname
* <code>&dollar;{pickStringRemember:<em>name</em>}</code> : use the [`pickStringRemember`](select-remember-commands.md) command as a variable, arguments are part of the [`pickStringRemember` property of the (parent) command](variable-pickstringremember.md)
* <code>&dollar;{promptStringRemember:<em>name</em>}</code> : use the [`promptStringRemember`](select-remember-commands.md) command as a variable, arguments are part of the [`promptStringRemember` property of the (parent) command](variable-pickstringremember.md)
* <code>&dollar;{remember:<em>key</em>}</code> : use the [remember](remember.md) command as a variable,  
  _`key`_ is first tested as a _named argument object property_ (like `pickStringRemember`), arguments are part of the `remember` property of the (parent) command.  
  If not found and _`key`_ has the format <code>number-<em>name</em></code> the _name_ is used to get the last value of a named [number](number-transform.md).  
  If not found _`key`_ is a key in the remeber store. _`key`_ matches:
    * `key` argument of the `pickStringRemember` or `promptStringRemember` variable/command
    * `keyRemember` argument of the `pickFile` or `fileContent` variable/command
    * or a key used in storing multiple values in the `remember` command.

  You can add the [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) property to the _`key`_ name if it is not a _named argument object_ like <code>&dollar;{remember:<em>key</em>__checkEscapedUI}</code>.  
  See a few [examples of the `${remember}` variable](variable-remember.md).
* <code>&dollar;{pickFile:<em>name</em>}</code> : use the [`pickFile`](dialogs.md) command as a variable, arguments are part of the [`pickFile` property of the (parent) command](variable-pickfile.md)
* <code>&dollar;{openDialog:<em>name</em>}</code> : use the [`openDialog`](dialogs.md) command as a variable, arguments are part of the [`openDialog` property of the (parent) command](variable-pickfile.md)
* <code>&dollar;{saveDialog:<em>name</em>}</code> : use the [`saveDialog`](dialogs.md) command as a variable, arguments are part of the [`saveDialog` property of the (parent) command](variable-pickfile.md)
* <code>&dollar;{fileContent:<em>name</em>}</code> : use the [`file.content`](file-content.md) command ([File Content Key Value pairs](file-content.md), [File Content JSON Property](file-content.md) ) as a variable, arguments are part of the `fileContent` property of the (parent) command. (works the same as <code>&dollar;{pickStringRemember:<em>name</em>}</code>)
* <code>&dollar;{config:<em>name</em>}</code> : use the variable <code>&dollar;{configExpression:<em>name</em>}</code> (!!_name_ is not the name of the config variable!!)
* <code>&dollar;{configExpression:<em>name</em>}</code> : use the [`config.expression`](expressions.md) command as a variable, arguments are part of the `configExpression` property of the (parent) command (works the same as <code>&dollar;{pickStringRemember:<em>name</em>}</code>)
* <code>&dollar;{jsExpression:<em>name</em>}</code> : use the [`js.expression`](expressions.md) command as a variable, arguments are part of the `jsExpression` property of the (parent) command (works the same as <code>&dollar;{pickStringRemember:<em>name</em>}</code>)
* <code>&dollar;{command:<em>name</em>}</code> : use the result of a command as a variable. `name` can be a commandID or a _named argument object property_ (like `pickStringRemember`), arguments are part of the [`command` property of the (parent) command](variable-command-transform-remember.md)
* <code>&dollar;{transform:<em>name</em>}</code> : use the result of a transform as a variable. `name` is a _named argument object property_ (like `pickStringRemember`), arguments are part of the [`transform` property of the (parent) command](variable-transform.md). You can transform strings that are the result of a transform.
* <code>&dollar;{result}</code> : a special variable used in:
  * the [`remember:transform:text`](remember.md) property. It contains the string stored for the given `key`.
  * the [`pickFile:transform:text`](dialogs.md) property. It contains the string that is the value of the picked item.
  * the [`openDialog:transform:text`](dialogs.md) property. It contains the string that is the value of the picked item.
  * the [`saveDialog:transform:text`](dialogs.md) property. It contains the string that is the value of the picked item.

  In all other cases it is the empty string.
* <code>&dollar;{index}</code>  
  <code>&dollar;{index:<em>name</em>}</code> : a special variable used in:
  * the [`remember:transform:text`](remember.md) property.
  * the [`pickFile:transform:text`](dialogs.md) property.
  * the [`openDialog:transform:text`](dialogs.md) property.

  Or any variable that is in the `text` property.

  If you have picked multiple files this is the 0-based index of the picked file. You can use it to add a sequence number to the joined result or use it in a JavaScript expression. If using nested transforms you need to name the index variable of the transform using the `indexName` property.

The variables are processed in the order mentioned. This means that if the selected text contains variable descriptions they are handled as if typed in the text.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo first part fileBaseNameNoExtension",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:firstPart}" ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "firstPart",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${fileBasenameNoExtension}",
        "find": "(.*?)-.*",
        "replace": "$1",
      }
    }
  ]
}
```

## Individual variables

- [`${workspaceFolder}` and `${workspaceFolderBasename}`](variable-workspacefolder.md)
- [`${selectedText}`](variable-selectedtext.md)
- [`${pickStringRemember}` and `${promptStringRemember}`](variable-pickstringremember.md)
- [`${pickFile}`, `${openDialog}`, `${saveDialog}`](variable-pickfile.md)
- [`${command}`](variable-command-transform-remember.md)
- [`${transform}`](variable-transform.md)
- [`${remember}`](variable-remember.md)
- [Variable filters](variable-filters.md)
