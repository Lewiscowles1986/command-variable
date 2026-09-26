---
audience: extension-user
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minutes

# Use a POSIX-form file path

Your task passes a file path to a tool that expects forward slashes, but the
workspace is on Windows and the built-in `${file}` variable produces
backslashes. This page shows the three ways to get a path in POSIX form.

POSIX form means: `/` as the directory separator and a drive letter written as
a path segment, so `C:\project\src` becomes `/c/project/src`.

## Option 1: use a Posix-suffixed command

Every path command that has a `Posix` twin produces the POSIX form directly:

```json
{
  "id": "theFile",
  "type": "command",
  "command": "extension.commandvariable.file.filePosix",
  "args": {}
}
```

Use this when the whole path must be in POSIX form. The full list of Posix
commands is on [file path commands](../reference/file-paths.md).

## Option 2: transform the built-in variable

If you need a variable this extension does not have a Posix twin for, use
`transform` with a find-replace:

```json
{
  "id": "relativeFilePosix",
  "type": "command",
  "command": "extension.commandvariable.transform",
  "args": {
    "text": "${relativeFile}",
    "find": "\\\\",
    "replace": "/",
    "flags": "g"
  }
}
```

The `find` value is a regular expression that matches a single backslash;
`flags: "g"` replaces every occurrence. This is the pattern used throughout
the README examples.

## Option 3: use `dirSep` when either separator is acceptable

If the tool accepts the platform's own separator, `${dirSep}` produces it and
your configuration stays correct on every operating system. Use the Posix
commands only when the tool genuinely requires forward slashes, for example
many Unix build tools.

## You have succeeded when

- the task output shows the path with `/` separators, or
- the tool receives the path and runs without a path-format error.
