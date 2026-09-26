---
audience: shared
diataxis: index
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user and Extension author · **Reading time:** 1 minute

# Command Variable documentation

This extension lets a `launch.json`, `tasks.json`, `keybindings.json` or
`settings.json` file use the result of a VS Code command as a variable, with
syntax such as `${command:extension.commandvariable.dateTime}`.

Start with one question: **which of these describes you?**

## You edit launch or task files, not this repository

You are an **Extension user**. Go to the
[Extension user start page](extension-user/index.md). There you find:

- tutorials: a first working example, then remembering a value
- how-to guides: one page per task, such as passing a file path or reading a value from a JSON file
- reference: every command, variable, filter and setting, with the version each needs
- explanations: how `${command:...}` resolves and what the remember store does

## You edit this repository

You are an **Extension author**. Go to the
[Extension author start page](extension-author/index.md). There you find:

- tutorials: run the tests, add a command from start to finish
- how-to guides: run one test layer, cut a release, update a copied library
- reference: the test runner matrix, scripts, repository layout, quality checks
- explanations: desktop and web architecture, why there are several test runners

## Common ground

- [Glossary](glossary.md) — every term used in this documentation, defined once
