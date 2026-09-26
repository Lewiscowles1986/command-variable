---
audience: extension-user
diataxis: reference
reading-time: 9 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 9 minutes
# Web support matrix

The extension runs on the desktop and in a web workspace (including vscode.dev and remote workspaces that use a browser host). Not every command can run there: a browser host has no Node file system, so anything that reads a file by path or uses a Node-only API is desktop-only.

This page lists every command and whether it works in a web workspace. The [explanation page](../explanation/why-web-supports-less.md) describes why.

## How to read this page

| Mark | Meaning |
| --- | --- |
| Yes | works in a web workspace |
| No | desktop only; it needs something a browser host cannot provide |

## The matrix

| Command | Web |
| --- | --- |
| `file.relativeDirDots` | Yes |
| `file.relativeFileDots` | Yes |
| `file.relativeFileDotsNoExtension` | Yes |
| `file.filePosix` | Yes |
| `file.fileDirnamePosix` | Yes |
| `file.fileDirname1Up` | Yes |
| `file.fileDirname2Up` | Yes |
| `file.fileDirname3Up` | Yes |
| `file.fileDirname4Up` | Yes |
| `file.fileDirname5Up` | Yes |
| `file.fileDirname1UpPosix` | Yes |
| `file.fileDirname2UpPosix` | Yes |
| `file.fileDirname3UpPosix` | Yes |
| `file.fileDirname4UpPosix` | Yes |
| `file.fileDirname5UpPosix` | Yes |
| `file.relativeFileDirname1Up` | Yes |
| `file.relativeFileDirname2Up` | Yes |
| `file.relativeFileDirname3Up` | Yes |
| `file.relativeFileDirname4Up` | Yes |
| `file.relativeFileDirname5Up` | Yes |
| `file.relativeFileDirnamePosix` | Yes |
| `file.relativeFileDirname1UpPosix` | Yes |
| `file.relativeFileDirname2UpPosix` | Yes |
| `file.relativeFileDirname3UpPosix` | Yes |
| `file.relativeFileDirname4UpPosix` | Yes |
| `file.relativeFileDirname5UpPosix` | Yes |
| `file.relativeFilePosix` | Yes |
| `file.fileAsKey` | Yes |
| `file.fileDirBasename` | Yes |
| `file.fileDirBasename1Up` | Yes |
| `file.fileDirBasename2Up` | Yes |
| `file.fileDirBasename3Up` | Yes |
| `file.fileDirBasename4Up` | Yes |
| `file.fileDirBasename5Up` | Yes |
| `file.content` | Yes |
| `config.expression` | Yes |
| `file.contentInEditor` | Yes |
| `file.pickFile` | Yes |
| `workspace.folder` | Yes |
| `workspace.folder1Up` | Yes |
| `workspace.folder2Up` | Yes |
| `workspace.folder3Up` | Yes |
| `workspace.folder4Up` | Yes |
| `workspace.folder5Up` | Yes |
| `workspace.workspaceFolderPosix` | Yes |
| `workspace.folderPosix` | Yes |
| `workspace.folder1UpPosix` | Yes |
| `workspace.folder2UpPosix` | Yes |
| `workspace.folder3UpPosix` | Yes |
| `workspace.folder4UpPosix` | Yes |
| `workspace.folder5UpPosix` | Yes |
| `workspace.folderBasename` | Yes |
| `workspace.folderBasename1Up` | Yes |
| `workspace.folderBasename2Up` | Yes |
| `workspace.folderBasename3Up` | Yes |
| `workspace.folderBasename4Up` | Yes |
| `workspace.folderBasename5Up` | Yes |
| `selectedText` | Yes |
| `selectionStartLineNumber` | Yes |
| `selectionStartColumnNumber` | Yes |
| `selectionEndLineNumber` | Yes |
| `selectionEndColumnNumber` | Yes |
| `currentLineText` | Yes |
| `dirSep` | Yes |
| `envListSep` | Yes |
| `pickStringRemember` | Yes |
| `promptStringRemember` | Yes |
| `remember` | Yes |
| `rememberPick` | Yes |
| `number` | Yes |
| `dateTime` | Yes |
| `dateTimeInEditor` | Yes |
| `transform` | Yes |
| `UUID` | Yes |
| `UUIDInEditor` | Yes |
| `inTerminal` | Yes |
| `getClipboard` | Yes |
| `setClipboard` | Yes |

## Settings

| Setting | Web |
| --- | --- |
| `commandvariable.remember.persistent.file` | No |
| `commandvariable.file.pickFile.labelMaximumLength` | Yes |
| `commandvariable.file.pickFile.labelClipPoint` | Yes |
