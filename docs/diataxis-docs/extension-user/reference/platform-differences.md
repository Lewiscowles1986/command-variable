---
audience: extension-user
diataxis: reference
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minutes
# Platform differences

Windows, macOS and Linux write paths differently. A configuration that runs on
all three needs paths in a form that does not depend on the operating system.

## The three differences

| Difference | Windows | macOS and Linux |
| --- | --- | --- |
| directory separator | `\` | `/` |
| environment list separator | `;` | `:` |
| drive letter | `C:\project` | `/c/project` in POSIX form |

## The commands that remove the differences

These commands produce the same text on every operating system:

* `extension.commandvariable.dirSep` : Directory separator for this platform. '\\' on Windows, '/' on other platforms
* `extension.commandvariable.envListSep` : Environment variable list separator for this platform. ';' on Windows, ':' on other platforms

Every command ending in `Posix` produces its non-Posix twin's result with
`/` separators and the drive letter written as `/z/`.

## The runtime separators

`dirSep` and `envListSep` return the separator of the platform the editor
runs on. Use them when you genuinely want the platform's own form, for example
to build a `PATH`-like value.

## POSIX form, stated once

POSIX form means: forward slash as the directory separator and a drive letter
written as a path segment (`/z/` rather than `z:`). The name comes from the
POSIX path convention.
