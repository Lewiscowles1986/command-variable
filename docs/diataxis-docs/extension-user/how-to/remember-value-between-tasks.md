---
audience: extension-user
diataxis: how-to
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes

# Remember a value between tasks

One task asks a question or computes a value; a later task needs the same
value. The remember store solves this within one session. This page is the
short version; the [remember commands](../reference/remember.md) reference page
lists every argument.

## Store in the first task

Any command that has a `keyRemember` or `key` argument writes to the store as
a side effect. With `pickStringRemember`:

```json
{
  "id": "pickPath",
  "type": "command",
  "command": "extension.commandvariable.pickStringRemember",
  "args": {
    "description": "Which directory?",
    "key": "buildDir",
    "options": [ "build/debug", "build/release" ]
  }
}
```

## Read in a later task

```json
{
  "id": "usePath",
  "type": "command",
  "command": "extension.commandvariable.remember",
  "args": { "key": "buildDir" }
}
```

Both inputs can live in the same `inputs` block; reference them with
`${input:pickPath}` and `${input:usePath}` in the tasks that need them.

## Read it as a variable

Inside the `args` of another command you can use the
[`${remember:...}` variable](../reference/variable-remember.md) instead of a
separate input:

```json
"args": { "text": "Building in ${remember:buildDir}" }
```

## What resets it

| Event | Effect on the store |
| --- | --- |
| reloading the window | cleared, unless `commandvariable.remember.persistent.file` is set |
| closing and reopening VS Code | cleared, unless the persistent file is set |
| running the storing command again | overwritten with the new value |

The behaviour between sessions, and why the store exists at all, is on
[the remember store](../explanation/the-remember-store.md).

## You have succeeded when

- the first task stores a value and the second task reads the same value
  without asking again.