---
audience: extension-user
diataxis: reference
reading-time: 3 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 3 minutes
# File path commands

These commands produce file and directory paths based on the file open in the
editor or the workspace folder. In most cases they need no arguments.

The names follow a pattern: a base name, an optional `1Up` to `5Up` suffix for
one to five directory levels up, and an optional `Posix` suffix for a path with
`/` as separator on every operating system. See
[platform differences](platform-differences.md) for when that matters.

## File and directory commands

* `extension.commandvariable.file.relativeDirDots` : The directory of the current file relative to the workspace root directory with dots as separator. Can be used to specify a Python module.
* `extension.commandvariable.file.relativeFileDots` : The same result as `${relativeFile}` but with dots as separator.
* `extension.commandvariable.file.relativeFileDotsNoExtension` : The same result as `${relativeFile}` but with dots as separator and no file extension. Can be used to specify a Python module.
* `extension.commandvariable.file.filePosix` : The same result as `${file}` but in Posix form. Directory separator '`/`', and drive designation as '`/z/project/`'
* `extension.commandvariable.file.fileDirnamePosix` : The same result as `${fileDirname}` but in Posix form.
* `extension.commandvariable.file.fileDirname1Up` : The directory path 1 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname2Up` : The directory path 2 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname3Up` : The directory path 3 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname4Up` : The directory path 4 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname5Up` : The directory path 5 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname1UpPosix` : The same result as `${extension.commandvariable.file.fileDirname1Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname2UpPosix` : The same result as `${extension.commandvariable.file.fileDirname2Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname3UpPosix` : The same result as `${extension.commandvariable.file.fileDirname3Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname4UpPosix` : The same result as `${extension.commandvariable.file.fileDirname4Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname5UpPosix` : The same result as `${extension.commandvariable.file.fileDirname5Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname1Up` : The directory path 1 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname2Up` : The directory path 2 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname3Up` : The directory path 3 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname4Up` : The directory path 4 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname5Up` : The directory path 5 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirnamePosix` : The same result as `${relativeFileDirname}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname1UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname1Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname2UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname2Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname3UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname3Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname4UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname4Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname5UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname5Up}` but in Posix form.
* `extension.commandvariable.file.relativeFilePosix` : The same result as `${relativeFile}` but in Posix form.
* `extension.commandvariable.file.fileAsKey` : Use part of the file path as a key in a map lookup. Can be used in `lauch.json` to select arguments based on filename, see [example](#fileaskey).
* `extension.commandvariable.file.fileDirBasename` : (**Web**) The basename of the `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename1Up` : (**Web**) The directory name 1 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename2Up` : (**Web**) The directory name 2 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename3Up` : (**Web**) The directory name 3 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename4Up` : (**Web**) The directory name 4 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename5Up` : (**Web**) The directory name 5 Up of `${fileDirname}`
* `extension.commandvariable.file.content` : The content of the given file name. Use "inputs", see [example](#file-content). Or the value of a Key-Value pair, see [example](#file-content-key-value-pairs). Or the value of a JSON file property, see [example](#file-content-json-property).

## Workspace folder commands

* `extension.commandvariable.workspace.folder` : The path of the workspace root directory of the current file. `${workspaceFolder}` does not give this path in Multi Root workspaces. You can target a particular workspace by [supplying a `name` in the arguments](#workspace-name-in-argument).

## Target a specific workspace folder

The commands

* `extension.commandvariable.workspace.folder`
* `extension.commandvariable.workspace.folderPosix`
* <code>extension.commandvariable.workspace.folder<em>N</em>Up</code>
* <code>extension.commandvariable.workspace.folder<em>N</em>UpPosix</code>
* <code>extension.commandvariable.workspace.folderBasename</code>
* <code>extension.commandvariable.workspace.folderBasename<em>N</em>Up</code>

allow to get the information from a different workspace by specifying the name or last parts of the file path of the workspace directory. This can also be done when there is no editor active.

You supply the name in the arguments of the command. You have to use an `${input}` variable.

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo server name",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:server1Up}" ]
    }
  ],
  "inputs": [
    {
      "id": "server1Up",
      "type": "command",
      "command": "extension.commandvariable.workspace.folderBasename1Up",
      "args": { "name": "server" }
    }
  ]
}
```

If you have 2 workspaces with the same (folder base)name you can't target the second one by name only. You have to use more parts of the directory path to make the name unique. Use the `/` as path separator on all platforms. The `name` argument is tested to be at the end of the workspace folder path (using `/` as separator). An example of an `args` property is:

```json
"args": { "name": "/websiteA/server" }
```

## Related pages

- [Platform differences](platform-differences.md)
- [Use a POSIX-form file path](../how-to/posix-form-file-path.md)
