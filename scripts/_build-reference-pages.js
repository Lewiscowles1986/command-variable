'use strict';

/**
 * One-off generator for phase 3: builds the extension-user reference family
 * pages from the README sections extracted to /tmp/sec-*.md. Not part of the
 * repository toolchain; kept here for transparency of the migration step.
 */

const fs = require('node:fs');

const R = '/tmp/sec-';
const D = 'docs/diataxis-docs/extension-user/reference/';

function read(name) {
  return fs.readFileSync(R + name + '.md', 'utf8').trimEnd();
}

// Drop the leading "## X" heading of an extracted README section; the page
// supplies its own structure.
function body(name) {
  return read(name).replace(/^## .*\n/, '').trim();
}

function header(min, shared = false) {
  const audience = shared ? 'Extension user and Extension author' : 'Extension user';
  return [
    '---',
    'audience: ' + (shared ? 'shared' : 'extension-user'),
    'diataxis: reference',
    'reading-time: ' + min + ' min',
    'minimum-extension-version: 1.71.0',
    '---',
    '',
    '> **Audience:** ' + audience + ' · **Reading time:** ' + min + ' minutes',
    '',
  ].join('\n');
}

const allCommands = body('commands');
const fileCommands = allCommands
  .split(/\n(?=\* `extension\.commandvariable\.file\.)/).slice(1)
  .join('\n')
  .split(/\n(?=\* `extension\.commandvariable\.config\.)/)[0].trim();
const workspaceCommands = allCommands
  .split(/\n(?=\* `extension\.commandvariable\.workspace\.)/)[1]
  .split(/\n(?=\* `extension\.commandvariable\.selectedText`)/)[0].trim();
const selectionCommands = allCommands
  .split(/\n(?=\* `extension\.commandvariable\.selectedText`)/)[1]
  .split(/\n(?=\* `extension\.commandvariable\.dirSep`)/)[0].trim();
const platformCommands = allCommands
  .split(/\n(?=\* `extension\.commandvariable\.dirSep`)/)[1]
  .split(/\n(?=\* `extension\.commandvariable\.pickStringRemember`)/)[0].trim();
const psrCommands = allCommands
  .split(/\n(?=\* `extension\.commandvariable\.pickStringRemember`)/)[1]
  .split(/\n(?=\* `extension\.commandvariable\.number`)/)[0].trim();
const numberUuidCommands = allCommands
  .split(/\n(?=\* `extension\.commandvariable\.number`)/)[1]
  .split(/\n(?=\* `extension\.commandvariable\.inTerminal`)/)[0].trim();

const pages = [];

// ---------- file-paths.md ----------
pages.push(['file-paths.md', header(5) + `# File path commands

These commands produce file and directory paths based on the file open in the
editor or the workspace folder. In most cases they need no arguments.

The names follow a pattern: a base name, an optional \`1Up\` to \`5Up\` suffix for
one to five directory levels up, and an optional \`Posix\` suffix for a path with
\`/\` as separator on every operating system. See
[platform differences](platform-differences.md) for when that matters.

## File and directory commands

${fileCommands}

## Workspace folder commands

${workspaceCommands}

## Target a specific workspace folder

${body('wsname')}

## Related pages

- [Platform differences](platform-differences.md)
- [Use a POSIX-form file path](../how-to/posix-form-file-path.md)
`]);

// ---------- file-content.md ----------
pages.push(['file-content.md', header(5) + `# File content commands

The command \`extension.commandvariable.file.content\` reads a file and returns
its content, or one value extracted from it. It works on plain text, key-value
files, JSON and YAML. The plain-content arguments are on this page; the
per-format arguments follow.

${body('json')}

${body('yaml')}

${body('multi')}

## File content in the editor

${body('fcie')}

## Related pages

- [Read one value from a file](../how-to/read-value-from-file.md)
`]);

// ---------- dialogs.md ----------
pages.push(['dialogs.md', header(5) + `# Dialog and selection commands

These commands ask the person running the task to choose something while the
task starts. All of them can store the choice for reuse in the same session
with the \`keyRemember\` property. What the store does between sessions is
described in [the remember store](../explanation/the-remember-store.md).

## Pick File

${body('pickfile')}

## Open Dialog

${body('opendialog')}

## Save Dialog

${body('savedialog')}
`]);

// ---------- remember.md ----------
pages.push(['remember.md', header(5) + `# Remember commands

The remember store keeps a value from one task so a later task in the same
session can use it. The command below reads and writes the store directly;
several other commands write into it as a side effect. The store's behaviour
between sessions is described in
[the remember store](../explanation/the-remember-store.md).

## The remember command

${body('remember')}

## Related pages

- [Remember a value between tasks](../how-to/remember-value-between-tasks.md)
- [Select and remember a value](../tutorials/select-and-remember-a-value.md)
`]);

// ---------- number-transform.md ----------
pages.push(['number-transform.md', header(5) + `# Number and transform commands

## number

${body('number')}

## transform

${body('transform')}
`]);

// ---------- text-selection.md ----------
pages.push(['text-selection.md', header(5) + `# Text and selection commands

These commands read the selection and the current line of the editor you are
working in. They combine text from more than one cursor.

## Catalogue

${selectionCommands}

## Multicursor behaviour

${body('multicursor')}

## Clipboard

${body('clip')}
`]);

// ---------- expressions.md ----------
pages.push(['expressions.md', header(5) + `# Expression commands

These commands evaluate a JavaScript expression over a configuration value or
computed text. They are the general tool when a dedicated command is almost
what you need.

## Config Expression

${body('config')}

## JavaScript Expression

${body('js')}

## inTerminal

${body('interminal')}
`]);

// ---------- identity.md ----------
pages.push(['identity.md', header(5) + `# Identity and platform commands

## UUID

${body('uuid')}

## Platform separators

${platformCommands}

## Related pages

- [Platform differences](platform-differences.md)
`]);

// ---------- select-remember-commands.md ----------
// The pickStringRemember section is the largest in the README (15 worked
// examples). Split: one page for the command arguments, one for the worked
// examples, so neither approaches the hard cap.
const psrRaw = fs.readFileSync(R + 'psr.md', 'utf8');
const examplesIdx = psrRaw.indexOf('### Examples');
const psrArgs = psrRaw.slice(0, examplesIdx).replace(/^## .*\n/, '').trim();
const psrExamplesFull = psrRaw.slice(examplesIdx).replace(/^### Examples\n/, '').trim();
const psrPrompt = read('psr2').replace(/^## .*\n/, '').trim();

pages.push(['select-remember-commands.md', header(5) + `# Selection list and prompt commands

These two commands show an input prompt while the task starts and store the
result in the remember store under a key. They are the commands behind the
[\`rememberPick\` deprecation](deprecations.md).

## pickStringRemember

${psrArgs}

## promptStringRemember

${psrPrompt}

## Worked examples

The fifteen worked examples for \`pickStringRemember\` live on their own page:

[Selection list examples](select-remember-examples.md)
`]);

pages.push(['select-remember-examples.md', header(5) + `# Selection list examples 1 to 5

The first five worked examples for the \`pickStringRemember\` command, reused
from the README unchanged. The command's arguments are on the
[selection list and prompt commands](select-remember-commands.md) page. The
later examples are on [examples 6 to 10](select-remember-examples-2.md) and
[examples 11 to 15](select-remember-examples-3.md).

${(() => {
  const parts = psrExamplesFull.split(/\n(?=\*\*Example 6\*\*)/);
  return parts[0].trim();
})()}
`]);

pages.push(['select-remember-examples-2.md', header(5) + `# Selection list examples 6 to 9

Worked examples six to nine for the \`pickStringRemember\` command, reused from
the README unchanged. The earlier examples are on
[examples 1 to 5](select-remember-examples.md); the later ones on
[examples 10 to 15](select-remember-examples-3.md).

${(() => {
  const parts = psrExamplesFull.split(/\n(?=\*\*Example 6\*\*)/);
  const rest = parts[1];
  return rest.split(/\n(?=\*\*Example 10\*\*)/)[0].trim();
})()}
`]);

pages.push(['select-remember-examples-3.md', header(5) + `# Selection list examples 10 to 15

Worked examples ten to fifteen for the \`pickStringRemember\` command, reused
from the README unchanged. The earlier examples are on
[examples 1 to 5](select-remember-examples.md) and
[examples 6 to 9](select-remember-examples-2.md).

${(() => {
  const parts = psrExamplesFull.split(/\n(?=\*\*Example 10\*\*)/);
  return parts[1].trim();
})()}
`]);

// ---------- variables.md ----------
pages.push(['variables.md', header(5) + `# Variables

Many command arguments support variables. VS Code performs variable
substitution in task and launch fields, but not inside the \`inputs\` block, so
this extension implements a selection of variables for use in command
arguments.

## The variables

${body('variables')}

## Individual variables

- [\`\${workspaceFolder}\` and \`\${workspaceFolderBasename}\`](variable-workspacefolder.md)
- [\`\${selectedText}\`](variable-selectedtext.md)
- [\`\${pickStringRemember}\` and \`\${promptStringRemember}\`](variable-pickstringremember.md)
- [\`\${pickFile}\`, \`\${openDialog}\`, \`\${saveDialog}\`](variable-pickfile.md)
- [\`\${command}\`](variable-command.md)
- [\`\${transform}\`](variable-transform.md)
- [\`\${remember}\`](variable-remember.md)
- [Variable filters](variable-filters.md)
`]);

// ---------- variable sub-pages from the "Variables" long section ----------
const varsub = read('varsub');

function varSubsection(startRe, endRe) {
  const start = varsub.search(startRe);
  const end = endRe ? varsub.slice(start).search(endRe) + start : varsub.length;
  return varsub.slice(start, end).trim();
}

pages.push(['variable-workspacefolder.md', header(3) + `# The workspaceFolder variables

\`\${workspaceFolder}\` and \`\${workspaceFolderBasename}\` resolve against the
workspace folder that contains the current file. The exact rules, including
multi-root workspaces, are on this page.

${varSubsection(/^### Variable `workspaceFolder`/m, /^### Variable `selectedText`/m)}
`]);

pages.push(['variable-selectedtext.md', header(3) + `# The selectedText variable

\`\${selectedText}\` joins the selections of the current editor. With more than
one cursor you can choose the separator and which selections take part.

${varSubsection(/^### Variable `selectedText`/m, /^### Variable `pickStringRemember`/m)}
`]);

pages.push(['variable-pickstringremember.md', header(3) + `# The pickStringRemember and promptStringRemember variables

The input commands can be used as variables. The arguments travel in a named
property of the parent command's \`args\`.

${varSubsection(/^### Variable `pickStringRemember`/m, /^### Variable `pickFile`/m)}
`]);

pages.push(['variable-pickfile.md', header(3) + `# The pickFile, openDialog and saveDialog variables

The dialog commands can be used as variables, with the same named-argument
mechanism.

${varSubsection(/^### Variable `pickFile`/m, /^### Variable `command`/m)}
`]);

pages.push(['variable-command-transform-remember.md', header(5) + `# The command variable

Run a command and use its result as a variable value. The arguments travel in
a named property of the parent command's \`args\`.

${varSubsection(/^### Variable `command`/m, /^### Variable `transform`/m)}
`]);

pages.push(['variable-transform.md', header(5) + `# The transform variable

Build a custom variable: the result is a \`transform\` computation over other
variables. Transforms can be nested and sequenced with \`apply\`.

${varSubsection(/^### Variable `transform`/m, /^### Variable `remember`/m)}
`]);

pages.push(['variable-remember.md', header(3) + `# The remember variable

Read a value from the remember store as a variable. The store's behaviour
between sessions is described in
[the remember store](../explanation/the-remember-store.md).

${varSubsection(/^### Variable `remember`/m, /^## checkEscapedUI/m)}
`]);

// ---------- variable-filters.md ----------
pages.push(['variable-filters.md', header(3) + `# Variable filters

A variable can pass its result through filters, written after the variable
name and separated by \`|\`.

${body('filters')}

${varSubsection(/^### Variables in Javascript expression/m, /^### Variable `workspaceFolder`/m)}
`]);

// ---------- settings.md ----------
// The README settings section contains the word "activate" (an Extension
// author concern). The user page keeps the reader-relevant parts and states
// the restart requirement in Extension user terms.
pages.push(['settings.md', header(3) + `# Settings

This extension contributes three settings. One is a general setting; two only
work in the User settings scope because they are machine-scoped.

## commandvariable.remember.persistent.file

(**Not in Web**) A string containing a file system path. The extension writes
the values of the remember store to this file so they survive closing the
editor, and reads them back when the editor starts. Values are stored as JSON.

- A remote workspace is not supported: the file must be on the local file system.
- The path may use these variables: \`\${workspaceFolder}\`,
  \`\${workspaceFolder:name}\`, \`\${pathSeparator}\`, \`\${env:name}\`, \`\${userHome}\`.
- A file path in the workspace \`.vscode\` folder could be:
  \`\${workspaceFolder}\${pathSeparator}.vscode\${pathSeparator}remember.json\`
- **If you set or change the setting, restart VS Code.** The file path is read
  once, when the extension starts.

What the file changes about the store's behaviour is described in
[the remember store](../explanation/the-remember-store.md).

## User-scope settings

These two settings can only be defined in the User settings:

* \`commandvariable.file.pickFile.labelMaximumLength\` : number ∈ ℕ (>= 0), the
  [pickFile](dialogs.md) command can show a list of predefined directories. It
  can be that the directory path is too large to show in the selection list. VS
  Code clips the path but only at the end and thus can make it difficult to
  choose a path when they have the same start. This setting allows to transform
  the shown label if larger than a maximum number of characters. The transforms
  to apply are defined in the pickFile command. If this setting is \`0\`
  (default value) no transforms are applied.
  **!!** Be aware that the text shown in the selection list uses a **variable
  width** font.
* \`commandvariable.file.pickFile.labelClipPoint\` : number ∈ ℤ (positive and
  negative), used in the pickFile label transform: \`clipMiddle\`, determines how
  many characters to pick from the start (\`>=0\`) or from the end (\`<0\`). The
  characters taken from the other end are calculated using
  \`commandvariable.file.pickFile.labelMaximumLength\`
`]);

// ---------- web-support-matrix.md ----------
pages.push(['web-support-matrix.md', header(3) + `# Web support matrix

The extension runs on the desktop and in a web workspace (including vscode.dev
and remote workspaces that use a browser host). Not every command can run
there: a browser host has no Node file system, so anything that reads a file
by path or uses a Node-only API is desktop-only.

This page lists every command and whether it works in a web workspace. The
[explanation page](../explanation/why-web-supports-less.md) describes why.

## How to read this page

| Mark | Meaning |
| --- | --- |
| Yes | works in a web workspace |
| No | desktop only; it needs something a browser host cannot provide |

## The matrix

| Command | Web |
| --- | --- |
${allCommands.split('\n').filter((l) => l.startsWith('* `extension.commandvariable.')).map((l) => {
  const m = l.match(/^\* `([^`]+)` : (.*)$/);
  const cmd = m[1].replace('extension.commandvariable.', '');
  const rest = m[2];
  const web = rest.includes('(**Not in Web**)') ? 'No' : 'Yes';
  const note = rest.includes('(**Not in Web**)') ? rest.replace('(**Not in Web**) ', '') : rest.replace('(**Web**) ', '');
  return '| `' + cmd + '` | ' + web + ' |';
}).join('\n')}

## Settings

| Setting | Web |
| --- | --- |
| \`commandvariable.remember.persistent.file\` | No |
| \`commandvariable.file.pickFile.labelMaximumLength\` | Yes |
| \`commandvariable.file.pickFile.labelClipPoint\` | Yes |
`]);

// ---------- platform-differences.md ----------
pages.push(['platform-differences.md', header(3) + `# Platform differences

Windows, macOS and Linux write paths differently. A configuration that runs on
all three needs paths in a form that does not depend on the operating system.

## The three differences

| Difference | Windows | macOS and Linux |
| --- | --- | --- |
| directory separator | \`\\\` | \`/\` |
| environment list separator | \`;\` | \`:\` |
| drive letter | \`C:\\project\` | \`/c/project\` in POSIX form |

## The commands that remove the differences

These commands produce the same text on every operating system:

${platformCommands}

Every command ending in \`Posix\` produces its non-Posix twin's result with
\`/\` separators and the drive letter written as \`/z/\`.

## The runtime separators

\`dirSep\` and \`envListSep\` return the separator of the platform the editor
runs on. Use them when you genuinely want the platform's own form, for example
to build a \`PATH\`-like value.

## POSIX form, stated once

POSIX form means: forward slash as the directory separator and a drive letter
written as a path segment (\`/z/\` rather than \`z:\`). The name comes from the
POSIX path convention.
`]);

// ---------- deprecations.md ----------
pages.push(['deprecations.md', header(3) + `# Deprecations

A deprecated command still works but has a replacement. Deprecation exists so
existing configurations keep running while you move to the replacement at your
own pace.

## rememberPick

| | |
| --- | --- |
| Deprecated command | \`extension.commandvariable.rememberPick\` |
| Replacement | \`extension.commandvariable.remember\` |
| Since | 2021-10 |
| Behaviour | identical; only the name changed |

\`rememberPick\` was named when the command only remembered picked values. It
now remembers every kind of value, so the name no longer describes it. The
extension shows a message the first time the deprecated command runs in a
session.

### Migrate in one minute

1. Open the file that uses the \`rememberPick\` command (as
   \`\${command:...}\` or inside an \`inputs\` entry).
2. Replace \`rememberPick\` with \`remember\` in the \`command\` field.
3. Run the task or launch configuration once to confirm it works.

You have succeeded when the task runs and no deprecation message appears.

## workspaceFolderPosix

| | |
| --- | --- |
| Deprecated command | \`extension.commandvariable.workspace.workspaceFolderPosix\` |
| Replacement | \`extension.commandvariable.workspace.folderPosix\` |
| Behaviour | identical |

The old name repeated the word \`workspace\` twice. Replace the command name in
place; no arguments change.
`]);

fs.mkdirSync(D, { recursive: true });
for (const [name, content] of pages) {
  fs.writeFileSync(D + name, content.trimEnd() + '\n');
}
console.log('wrote', pages.length, 'pages');