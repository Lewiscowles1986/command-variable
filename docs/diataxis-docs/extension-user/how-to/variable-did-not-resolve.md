---
audience: extension-user
diataxis: how-to
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes

# The variable did not resolve

The symptom: your task or launch configuration runs, but the literal text
`${command:...}` or `${input:...}` reaches the shell or debugger instead of a
computed value. Nothing fails loudly; the extension stays silent.

## Decide which case you are in

| What you see | Cause | Fix |
| --- | --- | --- |
| `${input:...}` in the output | no input with that `id` exists in the same file | add the input, or fix the `id` spelling |
| `${command:...}` in the output | the command id is wrong, or the extension is not installed and started | check the id against the [reference index](../reference/index.md) |
| the value is `Unknown` | the command ran but found nothing, for example a missing key in a file | see the command's reference page for its `default` argument |
| the value is `I don't remember` | the remember store has no value for that key yet | run the task that stores the value first |

## Check the input is in the same file

VS Code resolves `${input:...}` against the `inputs` block of the same file. An
input defined in `tasks.json` is not visible to `launch.json`.

## Check the substitution moment

Substitution happens when the task or launch configuration starts, not when you
save the file. A variable that references a file written by an earlier task in
the same run is resolved before that task writes it; see
[how a command variable resolves](../explanation/how-command-variable-resolves.md).

## See the value VS Code computed

You can print any variable with a small task:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "show variable",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:theOneYouAreDebugging}" ],
      "problemMatcher": []
    }
  ]
}
```

Run it and read the terminal. This is the fastest way to see what a variable
actually produced.

## You have succeeded when

- the task output shows a computed value where the literal `${...}` used to be, or
- you know which of the four cases above applies and the fix is on the page it names.