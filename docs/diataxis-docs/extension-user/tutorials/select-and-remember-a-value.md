---
audience: extension-user
diataxis: tutorial
reading-time: 3 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 3 minutes

# Select and remember a value

In this tutorial you build two tasks: the first asks which environment to use
and stores the answer, the second reads the stored answer. It takes about five
minutes and continues from the workspace you used in
[your first command variable](your-first-command-variable.md).

## What you build

A selection list that appears once per session, whose answer is reused by later
tasks without asking again. The commands involved are described on the
[selection list and prompt commands](../reference/select-remember-commands.md)
and [remember commands](../reference/remember.md) reference pages.

## Step 1: add a task that asks

Add this task to `.vscode/tasks.json` (keep your existing tasks):

```json
    {
      "label": "Task 1",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 1 using envType: ${input:envType}" ],
      "problemMatcher": []
    }
```

Add its input to the `inputs` block:

```json
    {
      "id": "envType",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which env do you want to debug?",
        "key": "envType",
        "options": [
          ["development", "5000"],
          ["staging", "5100"],
          ["live", "5200"]
        ]
      }
    }
```

The `pickStringRemember` command shows a selection list. The label is what you
see; the second element of each pair is the value that is returned. The `key`
property is the name the answer is stored under.

## Step 2: run it

Run the task. The selection list appears. Pick **development**. The terminal
shows:

```
Task 1 using envType: 5000
```

## Step 3: add a task that remembers

Add a second task that reads the stored answer instead of asking:

```json
    {
      "label": "Task 2",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 2 with envType: ${input:envType}" ],
      "problemMatcher": []
    }
```

Run **Task 2**. No selection list appears; the value you picked for Task 1 is
reused, because both tasks reference the same input `id`.

## Step 4: read the stored value directly

A third task can skip the input entirely and read the store:

```json
    {
      "label": "Task 3",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 3 with envType: ${input:envTypeDirect}" ],
      "problemMatcher": []
    }
```

with input:

```json
    {
      "id": "envTypeDirect",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "envType" }
    }
```

## Step 5: what resets it

The store lives for the session. Reload the window and run Task 2 first: the
selection list appears again, because nothing is stored yet. To keep values
across sessions, see the
[`commandvariable.remember.persistent.file`](../reference/settings.md) setting
and [the remember store](../explanation/the-remember-store.md) explanation.

## What you learned

- `pickStringRemember` asks and stores under a `key`.
- Later tasks referencing the same input `id` reuse the stored answer.
- The `remember` command reads the store directly.
- The store lasts for the session unless a persistent file is configured.

## Where to go next

- [Remember a value between tasks](../how-to/remember-value-between-tasks.md)
  — the condensed how-to version of this tutorial.
- [Variable filters](../reference/variable-filters.md) — post-process a stored
  value, for example to change its case.