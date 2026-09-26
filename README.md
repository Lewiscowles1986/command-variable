# Command Variable

Visual Studio Code provides [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) to be used in `launch.json` and `tasks.json`.

One of the variables allows the [result of a command](https://code.visualstudio.com/docs/editor/variables-reference#_command-variables) to be used with the following syntax: **`${command:commandID}`**

If a command or variable is almost what you need you can use the `transform` command to perform a regular expression find-replace of the result.

Not all commands are supported yet in the web extension version. The full documentation says which: see the [web support matrix](docs/diataxis-docs/extension-user/reference/web-support-matrix.md).

Some commands can store the result to be retrieved later in the session. If you want persistent storage have a look at the [`commandvariable.remember.persistent.file`](docs/diataxis-docs/extension-user/reference/settings.md) setting.

## Where did a README section go?

The command-by-command reference moved to one page per command family. Everything is still here; only the location changed. Use this table to find the old section:

| Was in the README under | Now at |
| --- | --- |
| Commands (catalogue) | [File path commands](docs/diataxis-docs/extension-user/reference/file-paths.md), [Text and selection commands](docs/diataxis-docs/extension-user/reference/text-selection.md), [Identity and platform commands](docs/diataxis-docs/extension-user/reference/identity.md), and the family pages linked from the [reference index](docs/diataxis-docs/extension-user/reference/index.md) |
| Usage | [Your first command variable](docs/diataxis-docs/extension-user/tutorials/your-first-command-variable.md) and the example below |
| Configuration / Settings | [Settings](docs/diataxis-docs/extension-user/reference/settings.md) |
| FileAsKey | [File path commands](docs/diataxis-docs/extension-user/reference/file-paths.md) |
| File Content (all subsections) | [File content commands](docs/diataxis-docs/extension-user/reference/file-content.md) |
| File Content in Editor | [File content commands](docs/diataxis-docs/extension-user/reference/file-content.md) |
| Config Expression | [Expression commands](docs/diataxis-docs/extension-user/reference/expressions.md) |
| JavaScript Expression | [Expression commands](docs/diataxis-docs/extension-user/reference/expressions.md) |
| Pick File / Open Dialog / Save Dialog | [Dialog and selection commands](docs/diataxis-docs/extension-user/reference/dialogs.md) |
| number | [Number and transform commands](docs/diataxis-docs/extension-user/reference/number-transform.md) |
| remember | [Remember commands](docs/diataxis-docs/extension-user/reference/remember.md) |
| pickStringRemember | [Selection list and prompt commands](docs/diataxis-docs/extension-user/reference/select-remember-commands.md) and its three example pages |
| promptStringRemember | [Selection list and prompt commands](docs/diataxis-docs/extension-user/reference/select-remember-commands.md) |
| Multicursor and text | [Text and selection commands](docs/diataxis-docs/extension-user/reference/text-selection.md) |
| inTerminal | [Expression commands](docs/diataxis-docs/extension-user/reference/expressions.md) |
| getClipboard / setClipboard | [Text and selection commands](docs/diataxis-docs/extension-user/reference/text-selection.md) |
| Transform (and saveToFile) | [Number and transform commands](docs/diataxis-docs/extension-user/reference/number-transform.md) and [the transform variable](docs/diataxis-docs/extension-user/reference/variable-transform.md) |
| Variables (all subsections) | [Variables](docs/diataxis-docs/extension-user/reference/variables.md) and the pages it links to |
| Variable Filters | [Variable filters](docs/diataxis-docs/extension-user/reference/variable-filters.md) |
| `checkEscapedUI` | [Cancelled inputs and compound tasks](docs/diataxis-docs/extension-user/explanation/cancelled-inputs-and-compound-tasks.md) |
| Workspace name in `argument` | [File path commands](docs/diataxis-docs/extension-user/reference/file-paths.md) |
| UUID | [Identity and platform commands](docs/diataxis-docs/extension-user/reference/identity.md) |
| dateTime | [Date and time commands](docs/diataxis-docs/extension-user/reference/date-time.md) |

## A one-minute tour

A command variable is an entry in the `inputs` block of a `launch.json` or `tasks.json` file. When the task starts, VS Code runs the command and uses its result as the value.

1. Pick a task that needs a computed value, for example a file path.
2. Add an `inputs` entry with `"type": "command"` and the command to run.
3. Reference the input with `${input:...}` where you need the value.
4. Run the task. The value is computed at that moment.

The [reference index](docs/diataxis-docs/extension-user/reference/index.md) lists every command by family; the [how-to index](docs/diataxis-docs/extension-user/how-to/index.md) lists one-page solutions; [how a command variable resolves](docs/diataxis-docs/extension-user/explanation/how-command-variable-resolves.md) explains the mechanism.

## First example, complete

This example uses `extension.commandvariable.file.fileAsKey` to select task arguments based on the file you are running. The keys of the `args` object are searched for in the path of the active file (directory separator is `/`).

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "args" : ["${input:chooseArgs}"]
    }
  ],
  "inputs": [
    {
      "id": "chooseArgs",
      "type": "command",
      "command": "extension.commandvariable.file.fileAsKey",
      "args": {
        "calculation.py": "-n 4224",
        "client.py": "-i calc-out.yaml"
      }
    }
  ]
}
```

With `calculation.py` open the task runs with `-n 4224`; with `client.py` open it runs with `-i calc-out.yaml`. The full description is on [file path commands](docs/diataxis-docs/extension-user/reference/file-paths.md).

If files with the same name exist in different directories, use part of the full path to select the correct one, like `"/dir1/main.py"` and `"/dir2/main.py"`.

The `args` property can contain a few special keys:

* `@useCommand` : the value is a command variable that describes the command to execute to get the file path to use. Example for CMake build projects: `"@useCommand": "${command:cmake.launchTargetPath}"`
* `@default` : the string to return when none of the keys is found in the file path (default: `Unknown`)

The value strings may contain [variables](docs/diataxis-docs/extension-user/reference/variables.md).

## Credits

* uses [UUID node module by LiosK](https://www.npmjs.com/package/uuidjs)