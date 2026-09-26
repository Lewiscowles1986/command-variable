---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# Text and selection commands

These commands read the selection and the current line of the editor you are working in. They combine text from more than one cursor.

## Catalogue

* `extension.commandvariable.selectedText` : (**Web**) The selected text in the active editor, empty string if nothing selected. Supports [multicursor](text-selection.md).
* `extension.commandvariable.selectionStartLineNumber` : (**Web**) Line number of the selection start
* `extension.commandvariable.selectionStartColumnNumber` : (**Web**) Column number of the selection start
* `extension.commandvariable.selectionEndLineNumber` : (**Web**) Line number of the selection end
* `extension.commandvariable.selectionEndColumnNumber` : (**Web**) Column number of the selection end
* `extension.commandvariable.currentLineText` : (**Web**) The text of the line in the active editor where the selection starts or where the cursor is. Supports [multicursor](text-selection.md).

## Multicursor behaviour

The commands `extension.commandvariable.selectedText` and `extension.commandvariable.currentLineText` combine the content in case of multi cursors. The default separator used is `"\n"`.

The selections are sorted in the order they appear in the file.

You can change the separator by specifying an argument object for the command with a property `"separator"`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo (selected:currentLine) Text",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:multiCursorText}" ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "multiCursorText",
      "type": "command",
      "command": "extension.commandvariable.selectedText",
      "args": { "separator": "@--@" }
    }
  ]
}
```

## Clipboard

The command `extension.commandvariable.getClipboard` gets the content of the clipboard.

VSC has a task/launch variable `${CLIPBOARD}` but it returns an empty string in my version of VSC.

```json
  {
    "key": "ctrl+i f5",  // or any other combo
    "command": "extension.commandvariable.getClipboard"
  }
```

## setClipboard

The command `extension.commandvariable.setClipboard` sets the content of the clipboard with the string property `text` of the `args` object.

```json
  {
    "key": "ctrl+i f6",  // or any other combo
    "command": "extension.commandvariable.setClipboard",
    "args": { "text": "This is the new clipboard content" }
  }
```
