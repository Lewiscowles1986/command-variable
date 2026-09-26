---
audience: extension-user
diataxis: index
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes

# Reference index

Each page lists what exists, with the minimum extension version it works from.
Use these pages while writing a `launch.json` or `tasks.json`, not to learn the
extension.

## Command families

| Page | Contents |
| --- | --- |
| [Date and time commands](date-time.md) | `dateTime`, `dateTimeInEditor` |
| [File path commands](file-paths.md) | `${file}`-style results, directory levels, POSIX forms |
| [File content commands](file-content.md) | read a value from JSON, YAML, key-value files |
| [Dialog and selection commands](dialogs.md) | `pickFile`, `openDialog`, `saveDialog`, `pickStringRemember`, `promptStringRemember` |
| [Remember commands](remember.md) | `remember`, `${remember:...}`, `rememberPick` (deprecated) |
| [Number and transform commands](number-transform.md) | `number`, `transform`, `transform::saveToFile` |
| [Text and selection commands](text-selection.md) | selected text, line and column numbers, current line, clipboard |
| [Expression commands](expressions.md) | `config.expression`, `js.expression`, `inTerminal` |
| [Identity and other commands](identity.md) | `UUID`, `UUIDInEditor`, `dirSep`, `envListSep` |

## Variables and filters

| Page | Contents |
| --- | --- |
| [Variables](variables.md) | the `${...}` variables this extension contributes |
| [Variable filters](variable-filters.md) | post-processing applied to a variable result |

## Configuration

| Page | Contents |
| --- | --- |
| [Settings](settings.md) | the three settings this extension contributes |
| [Web support matrix](web-support-matrix.md) | which commands work in a browser workspace |
| [Platform differences](platform-differences.md) | path separators, drive letters, POSIX forms |
| [Deprecations](deprecations.md) | replaced commands and variables, with migration steps |