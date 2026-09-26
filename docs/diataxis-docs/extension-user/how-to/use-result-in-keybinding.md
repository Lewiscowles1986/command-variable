---
audience: extension-user
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minutes

# Use a result in a keybinding

A keybinding cannot carry an `inputs` block, so the editor variants write their
result into the text you are editing instead of returning it. This page walks
through the timestamp example; the same pattern applies to
`UUIDInEditor` and `file.contentInEditor`.

## Add the keybinding

Open **Keyboard Shortcuts** from the Command Palette, pick
**Open Keyboard Shortcuts (JSON)**, and add:

```json
  {
    "key": "ctrl+shift+alt+f4",
    "when": "editorTextFocus",
    "command": "extension.commandvariable.dateTimeInEditor",
    "args": {
      "locale": "en-US",
      "options": {
        "year": "numeric",
        "month": "2-digit",
        "day": "2-digit",
        "hour12": false,
        "hour": "2-digit",
        "minute": "2-digit",
        "second": "2-digit"
      },
      "template": "${year}/${month}/${day}-${hour}:${minute}:${second}"
    }
  }
```

The arguments are the same as the `dateTime` command's; they are documented on
[date and time commands](../reference/date-time.md).

## Use it

Put the cursor in a text file where you want the timestamp and press the key
combination. The timestamp replaces the current selection, or is inserted at
the cursor if nothing is selected.

## Generate a UUID with a keybinding

```json
  {
    "key": "ctrl+shift+alt+u",
    "when": "editorTextFocus",
    "command": "extension.commandvariable.UUIDInEditor"
  }
```

The output formats (`hexString`, `urn`, and more) are on
[identity and platform commands](../reference/identity.md).

## You have succeeded when

- pressing the key combination inserts the value at the cursor in an editor.
