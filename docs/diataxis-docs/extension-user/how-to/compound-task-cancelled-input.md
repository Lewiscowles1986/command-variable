---
audience: extension-user
diataxis: how-to
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes

# Make a compound task stop on cancelled input

A compound task runs several tasks in order. When one of its inputs shows a
prompt and you press `Escape`, the rest of the compound task should not run.
The `checkEscapedUI` property makes that happen. The behaviour and its design
rationale are on
[cancelled inputs and compound tasks](../explanation/cancelled-inputs-and-compound-tasks.md).

## The configuration

This example uses `echo` tasks to keep it short:

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "Task 1",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 1 using envType: ${input:envType}" ],
      "problemMatcher": []
    },
    {
      "label": "Task 2",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 2 with envMessage: ${input:envMessage}" ],
      "problemMatcher": []
    },
    {
      "label": "Task Sequence",
      "dependsOrder": "sequence",
      "dependsOn": ["Task 1", "Task 2"],
      "problemMatcher": []
    }
  ],
  "inputs": [
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
    },
    {
      "id": "envMessage",
      "type": "command",
      "command": "extension.commandvariable.promptStringRemember",
      "args": {
        "key": "envMessage",
        "description": "Enter message",
        "checkEscapedUI": true
      }
    }
  ]
}
```

## How it behaves

- Run **Task Sequence** and answer both prompts: both tasks run.
- Run it again and press `Escape` at the **Enter message** prompt: Task 2 does
  not run, and Task 1 has already run. The cancellation is recorded, so the
  compound task stops cleanly.
- The first prompt in the sequence has no `checkEscapedUI`: it would check the
  previous run's state, not this run's.

## Which commands accept it

`pickStringRemember`, `promptStringRemember`, `pickFile`, `openDialog` and
`saveDialog` accept `checkEscapedUI`, and so does the `remember` command. The
full list is on each command's reference page.

## You have succeeded when

- cancelling a prompt in the middle of a compound task stops the tasks that
  come after it.
