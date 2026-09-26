---
audience: extension-user
diataxis: tutorial
reading-time: 3 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 3 minutes

# Your first command variable

In this tutorial you add a task that prints a timestamp. By the end you will
have added an `inputs` entry, referenced it from a task, and seen the computed
value appear in the terminal. It takes about five minutes and needs only a
workspace folder with a `.vscode` directory.

## What you build

A task that echoes the current date and time, computed at the moment the task
starts. The value comes from this extension's `dateTime` command, described on
the [date and time commands](../reference/date-time.md) reference page.

## Before you start

- A workspace folder open in VS Code.
- The Command Variable extension installed.
- A `.vscode` folder in the workspace (VS Code creates it the first time you
  add a task).

## Step 1: open the task file

Open the Command Palette and run **Tasks: Configure Task**. Pick
**Create tasks.json file from template**, then **Others**. VS Code opens
`.vscode/tasks.json`.

## Step 2: add the task

Replace the file contents with:

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
  ]
}
```

The task runs `echo` with one argument. That argument is not a literal string:
`${input:shortDate}` asks VS Code to substitute the value of an input named
`shortDate`. You define that input in the next step.

## Step 3: add the input

Add the `inputs` block after the `tasks` block, so the file looks like this:

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

The input named `shortDate` has type `command`: when the task starts, VS Code
runs `extension.commandvariable.dateTime` and uses its result.

## Step 4: run the task

Open the Command Palette and run **Tasks: Run Task**, then pick **echo date**.
The terminal shows a line like:

```
jueves__20200319T184634
```

The exact text depends on the current date, time and locale.

## Step 5: change it

Change the `template` value to `"${weekday} at ${hour}:${minute}"` and run the
task again. The output changes shape. The placeholder names are the parts
`Intl.DateTimeFormat` returns; they are listed on the
[date and time commands](../reference/date-time.md) page.

## What you learned

- A command variable is an `inputs` entry of type `command`.
- `${input:...}` references an input by its `id`.
- Substitution happens when the task starts, so the value is current then.
- The `args` property of the input carries the command's arguments.

## Where to go next

- [Select and remember a value](select-and-remember-a-value.md) — ask a
  question once per session and reuse the answer.
- [How a command variable resolves](../explanation/how-command-variable-resolves.md)
  — what VS Code does with your file when the task starts.
