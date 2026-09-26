---
audience: extension-user
diataxis: reference
reading-time: 4 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 4 minutes

# Date and time commands

Two commands produce a language-sensitive formatting of the current date and time. Both use the same arguments; they differ only in where the result goes.

| Command | Where the result goes | Use it in |
| --- | --- | --- |
| `extension.commandvariable.dateTime` | the variable value | `launch.json`, `tasks.json` |
| `extension.commandvariable.dateTimeInEditor` | the text you are editing | `keybindings.json` |

**Minimum extension version: 1.71.0.** Both commands work in a web workspace. Web support is marked per command in the [web support matrix](web-support-matrix.md).

## Arguments

| Argument | Type | Required | Meaning |
| --- | --- | --- | --- |
| `locale` | string, or array of strings | no | a language tag such as `en-US`, or a list of tags. When omitted, the default locale of the editor is used |
| `options` | object | no | the options for `Intl.DateTimeFormat`, such as `year: "numeric"` or `dateStyle: "full"` |
| `template` | string | no | a template string that places the formatted parts. When omitted, all formatted parts are joined |

`locale` and `options` are passed to [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat), so their allowed values are the ones documented there.

A `template` uses the same `${name}` placeholders as a JavaScript template string. The valid names are the `type` values returned by [`Intl.DateTimeFormat.prototype.formatToParts()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts), for example `year`, `month`, `day`, `hour`, `minute`, `second`, `weekday`. Any other text in the template is copied to the result as written.

## Examples

### A keybinding that inserts a formatted timestamp

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

The result is

```
2020/03/19-18:01:18
```

### A different locale and number system

You can use a different locale and number system and use the long format:

```json
  {
    "key": "ctrl+shift+alt+f5",
    "when": "editorTextFocus",
    "command": "extension.commandvariable.dateTimeInEditor",
    "args": {
      "locale": "fr-FR-u-nu-deva",
      "options": {
        "dateStyle": "full",
        "timeStyle": "full"
      }
    }
  }
```

The result is

```
jeudi १९ mars २०२० à १७:५९:५७ heure normale d’Europe centrale
```

### A task input that produces a short timestamp

For `launch.json` and `tasks.json` use the `inputs` attribute:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo date",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:shortDate}" ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "shortDate",
      "type": "command",
      "command": "extension.commandvariable.dateTime",
      "args": {
        "locale": "es-ES",
        "options": {
          "weekday": "long",
          "year": "numeric",
          "month": "2-digit",
          "day": "2-digit",
          "hour12": false,
          "hour": "2-digit",
          "minute": "2-digit",
          "second": "2-digit"
        },
        "template": "${weekday}__${year}${month}${day}T${hour}${minute}${second}"
      }
    }
  ]
}
```

The result is:

```
jueves__20200319T184634
```

## Related pages

- [How a command variable resolves](../explanation/how-command-variable-resolves.md) explains what VS Code does when it substitutes `${input:shortDate}`.
- [Use a result in a keybinding](../how-to/use-result-in-keybinding.md) walks through the first example step by step.
