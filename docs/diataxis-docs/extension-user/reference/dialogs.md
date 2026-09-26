---
audience: extension-user
diataxis: reference
reading-time: 13 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 13 minutes
# Dialog and selection commands

These commands ask the person running the task to choose something while the
task starts. All of them can store the choice for reuse in the same session
with the `keyRemember` property. What the store does between sessions is
described in [the remember store](../explanation/the-remember-store.md).

## Pick File

See also:
* [Open Dialog](dialogs.md)
* [Save Dialog](dialogs.md)

If you want to pick a file and use it in your `launch.json` or `tasks.json` you can use the `extension.commandvariable.file.pickFile` command.

This command uses [`vscode.workspace.findFiles`](https://code.visualstudio.com/api/references/vscode-api#workspace.findFiles) to get a list of files to show in a Quick Pick selection box.

Specify the start directory path with the `fromWorkspace` or `fromFolder` property.  
The `include` Glob Pattern can contain a path relative to the start directory.

If you don't specify `fromWorkspace` or `fromFolder` the search will be done over all workspaces.

You can set the following properties to this command:

* `include` : a [Glob Pattern](https://code.visualstudio.com/api/references/vscode-api#GlobPattern) that defines the files to search for (default: `"**/*"`)
* `exclude` : a Glob Pattern that defines files and folders to exclude. (default: `"undefined"`)

    Two special strings are possible to pass special values:
    * `"undefined"` to set the `exclude` argument to `undefined` to use default excludes
    * `"null"` to set the `exclude` argument to `null` to use **no** excludes

    **Known problem**: `exclude` is not working as expected under Windows. Excluded files are put at the end of the list.

* `multiPick` : [ `true` | `false` ] (Optional) If `true` you can pick multiple items. The values of the items are concatenated with the property `separator` string. (default: `false`)
* `separator` : [_string_] (Optional) If multiple items are picked (`multiPick`) the URI's are transformed (`transform`) and then joined with this string. Also the filepaths remembered with `keyRemember` use this separator. (default: `" "`)
* `canPickMany` : alias for `multiPick`
* `keyRemember` : (Optional) If you want to [remember](remember.md) the filepath(s) for later use. (default: `"pickFile"`)
* `description` : (Optional) A text shown in the pick list box. (default: `"Select a file"`, `"Select 1 or more files"`)
* `maxResults` : Limit the number of files to choose from. Must be a number (no `"` characters). (default: no limits)
* `addEmpty` : [ `true` | `false` ] If `true`: add an entry to the list (`*** Empty ***`) that will return an empty string when selected. (default: `false`)
* `addAsk` : [ `true` | `false` ] If `true`: add an entry to the list (`*** Ask ***`) that will open an Input Box where you enter the path to be returned. (default: `false`)
* `acceptIfOneFile` : [ `true` | `false` ] If `true`: if only one file is shown in the pickList accept this file. (default: `false`)
* `display` : How do you want to see the files displayed (default: `"relativePath"`)
    * `"fullpath"` : show the file full path, if path is big it can be clipped by the selection box
    * `"relativePath"` : show the file path relative to the chosen folder (`fromWorkspace`, `fromFolder`) followed by the path of the chosen folder, that is relative to a possible workspace, the Fuzzy Search is now on the relative file path.
    * `"fileName"` : show the file name followed by the directory path of the file, the Fuzzy Search is now only on the file name and file extension.
    * `"transform"` : use the properties `valueTransform`, `labelTransform` and `descriptionTransform` to construct the text for the QuickPickItem properties `value`, `label` and `description`. Only items with unique `value` texts are shown.
* `valueTransform` : (Optional) [ `string` &vert; `object` ] If an object it has the same properties as the [`transform`](number-transform.md) command. It allows to extract part of the picked file URI by using a [variable](variables.md) and perform a find-replace operation. The default value of the `text` property is `${file}`. Only used if `"display": "transform"`. The resulting text is the `value` property of the QuickPickItem.  
If a string it uses the transform with the given name: [`valueTransform` &vert; `labelTransform` &vert; `descriptionTransform`] (max redirections 4)
* `labelTransform` : (Optional) [ `string` | `object` ] see `valueTransform`. The resulting text is the `label` property of the QuickPickItem.
* `descriptionTransform` : (Optional) [ `string` | `object` ] see `valueTransform`. The resulting text is the `description` property of the QuickPickItem.
* `fromWorkspace` : [ <code>"<em>name</em>"</code> | `true` | `false` ] - limit the `include` pattern relative to a workspace (default: `false`)
    * if <code>"<em>name</em>"</code>: find the workspace with that name
    * if `true`: show a Pick List of Workspaces to choose from
* `fromFolder` : (Optional) Object with the properties (Filepaths support [variables](variables.md)):
    * `predefined` : (Optional) An array with file system paths of directories to limit the `include` pattern relative to that directory.  
    Each entry can be a string or an object with properties:

      * `path` : file system path of directory
      * `label` : used in certain transformations
    * `labelTransform` : (Optional) An array of strings of the transformations to apply to the pickList label when it is longer than the setting: [`commandvariable.file.pickFile.labelMaximumLength`](settings.md)  
      Transformations are applied to the pickList label in the order defined as long as it is too large.  
      Possible transformations are:
        * `useLabel` : regardless of the current length use the label property if defined in the entry in the `predefined` property.
        * `hasLabel` : if current length is too large use the label property if defined in the entry in the `predefined` property.
        * `removeWorkspacePath` : if the path can be found in one of the (Multi Root) Workspaces remove the workspace path
        * `clipMiddle` : use the setting [`commandvariable.file.pickFile.labelClipPoint`](settings.md) to determine how many characters to take from the start and from the end.

      An example would be: `"labelTransform": ["useLabel", "removeWorkspacePath", "clipMiddle"]`

    * `fixed` : (Optional) A string with a file system directory path to limit the `include` pattern relative to that directory.

    Show a Pick list of folders specified in the property `predefined` and 2 additional entries

    * `*** Ask ***` : open an Input Box where you enter the path of the folder
    * `*** Workspace ***` : show a Pick List of Workspaces

    ```json
    "fromFolder": {
      "predefined": [
        "C:\\temp\\log",
        "D:\\Data\\GPR\\2021"
      ]
    }
    ```
* `showDirs` : [ `true` | `false` ] If `true`: Show the directories that contain files that are found. The result of the pick is a directory path. (default: `false`)
* [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)
* `transform` : (Optional) an object with the same properties as the [`transform`](number-transform.md) command. It allows to extract part of the picked file URI by using a [variable](variables.md) and perform a find-replace operation. The default value of the `text` property is `${file}`.
* `empty` : (Optional) [ `true` | `false` ] The full file path is saved for the given `keyRemember`. If `true`: result of command is the empty string. Can be used with [`remember:transform`](remember.md) command or variable. This is the last test of the command (it overrules a possible `transform`). (default: `false`)

Example:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo FilePick",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:filePick}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "filePick",
      "type": "command",
      "command": "extension.commandvariable.file.pickFile",
      "args": {
        "include": "**/*.{htm,html,xhtml}",
        "exclude": "**/{scratch,backup}/**"
      }
    }
  ]
}
```

If you want the directory name of the picked file but using forward slash (on Windows, see [issue 47](https://github.com/rioj7/command-variable/issues/47))

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo FilePick Dirname Forward Slash",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:filePickDirnameForwardSlash}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "filePickDirnameForwardSlash",
      "type": "command",
      "command": "extension.commandvariable.file.pickFile",
      "args": {
        "include": "**/*.{htm,html,xhtml}",
        "exclude": "**/{scratch,backup}/**",
        "transform": {
          "text": "${fileDirname}",
          "find": "\\\\",  // Reason for four '\': https://stackoverflow.com/a/4025505/2909854
          "replace": "/",
          "flags": "g"
        }
      }
    }
  ]
}
```

If your project contains file paths like:

`testType1/LOG/testName1/src/test.c`

and you only want to show the Type and the Name but return the full path use the following `input` element

```json
    {
      "id": "filePickCTests",
      "type": "command",
      "command": "extension.commandvariable.file.pickFile",
      "args": {
        "display": "transform",
        "description": " Select one test to open",
        "include": "**/test.c",
        "labelTransform": {
          "text": "${relativeFile}",
          "apply": [
            {
              "find": "\\\\",
              "replace": "/",
              "flags": "g"
            },
            {
              "find": "(.*)/LOG/(.*)/src/.*",
              "replace": "$1/$2"
            }
          ]
        }
      }
    }
```

If using the same file paths as the previous example but you want to show and return the test type folders that have a `LOG` subdirectory

```json
    {
      "id": "filePickCTests",
      "type": "command",
      "command": "extension.commandvariable.file.pickFile",
      "args": {
        "display": "transform",
        "description": "[my_tests] Select one test to open it",
        "include": "my_tests/**/test.c",
        "labelTransform": "valueTransform",
        "valueTransform": {
          "text": "${relativeFile}",
          "apply": [
            {
              "find": "\\\\",
              "replace": "/",
              "flags": "g"
            },
            {
              "find": "(.*/LOG)/.*",
              "replace": "$1"
            }
          ]
        }
      }
    }
```

## Open Dialog

See also: [Pick File](dialogs.md)

If you want to select a file or directory/folder you can use the command: `extension.commandvariable.file.openDialog`. It uses the [`vscode.window.showOpenDialog`](https://code.visualstudio.com/api/references/vscode-api#window.showOpenDialog) function of the VSC API.

You can set the following properties to this command:

* `canSelect`: specify if you want to select a file or a directory (default: `files`)  
  Possible values are:  
  * `files`: select a file
  * `folders`: select a directory/folder
* `canSelectMany`: (Optional) can we select multiple files. (default: `false`)
* `defaultUri`: a OS file path where the dialog will open. You can use [variables](variables.md) to construct a file path, like `${workspaceFolder}${pathSeparator}configs`
* `filters`: set of file filters. Use `"` as string separator because this is here specified in a JSON file. See [`vscode.OpenDialogOptions.filters`](https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions.filters)
* `openLabel`: label of the accept button. See [`vscode.OpenDialogOptions.openLabel`](https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions.openLabel)
* `title`: title of the dialog. See [`vscode.OpenDialogOptions.title`](https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions.title)
* `keyRemember` : (Optional) If you want to [remember](remember.md) the filepath for later use. (default: `"openDialog"`)
* [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)
* `transform` : (Optional) an object with the same properties as the [`transform`](number-transform.md) command. It allows to extract part of the picked file URI by using a [variable](variables.md) and perform a find-replace operation. The default value of the `text` property is `${file}`.
* `separator`: (Optional) If you have picked multiple files the URI's are transformed and then joined with this string. (default: `" "`)
* `empty` : (Optional) [ `true` | `false` ] The full file path is saved for the given `keyRemember`. If `true`: result of command is the empty string. Can be used with [`remember:transform`](remember.md) command or variable. This is the last test of the command (it overrules a possible `transform`). (default: `false`)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Open Dialog",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:openDialog}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "openDialog",
      "type": "command",
      "command": "extension.commandvariable.file.openDialog",
      "args": {
        "canSelect": "files",
        "defaultUri": "${workspaceFolder}",
        "filters": {

## Save Dialog

"Images": ["png", "jpg"],
          "TypeScript": ["ts", "tsx"]
        }
      }
    }
  ]
}
```

## Save Dialog

See also: [Pick File](dialogs.md)

If you want to select a file to save some results (it can be a new file name) you can use the command: `extension.commandvariable.file.saveDialog`. It uses the [`vscode.window.showSaveDialog`](https://code.visualstudio.com/api/references/vscode-api#window.showSaveDialog) function of the VSC API.

You can set the following properties to this command:

* `defaultUri`: a OS file path where the dialog will open. You can use [variables](variables.md) to construct a file path, like `${workspaceFolder}${pathSeparator}configs`
* `filters`: set of file filters. Use `"` as string separator because this is here specified in a JSON file. See [`vscode.SaveDialogOptions.filters`](https://code.visualstudio.com/api/references/vscode-api#SaveDialogOptions.filters)
* `saveLabel`: label of the accept button. See [`vscode.SaveDialogOptions.saveLabel`](https://code.visualstudio.com/api/references/vscode-api#SaveDialogOptions.saveLabel)
* `title`: title of the dialog. See [`vscode.SaveDialogOptions.title`](https://code.visualstudio.com/api/references/vscode-api#SaveDialogOptions.title)
* `keyRemember` : (Optional) If you want to [remember](remember.md) the filepath for later use. (default: `"saveDialog"`)
* [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)
* `transform` : (Optional) an object with the same properties as the [`transform`](number-transform.md) command. It allows to extract part of the picked file URI by using a [variable](variables.md) and perform a find-replace operation. The default value of the `text` property is `${file}`.
* `empty` : (Optional) [ `true` | `false` ] The full file path is saved for the given `keyRemember`. If `true`: result of command is the empty string. Can be used with [`remember:transform`](remember.md) command or variable. This is the last test of the command (it overrules a possible `transform`). (default: `false`)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Save Dialog",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:saveDialog}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "saveDialog",
      "type": "command",
      "command": "extension.commandvariable.file.saveDialog",
      "args": {
        "defaultUri": "${workspaceFolder}",
        "saveLabel": "Save",
        "filters": {
          "Images": ["png", "jpg"],
          "TypeScript": ["ts", "tsx"]
        }
      }
    }
  ]
}
```
