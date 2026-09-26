---
audience: extension-user
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minute

# Use the extension where the web version runs

The extension runs in a web workspace: vscode.dev, or a desktop window
connected to a remote through a browser host. Most commands work; the ones
that need the local file system do not.

## Check what works before you configure

The [web support matrix](../reference/web-support-matrix.md) lists every
command with a yes or no. Read it before writing a configuration that depends
on reading files.

## The rule behind the matrix

A web workspace has no Node file system. Commands that read a file by path
(`file.content` and friends) or use the Node `fs` module
(`commandvariable.remember.persistent.file`) are desktop-only. Everything else,
including the selection lists, prompts, transform, UUID and date and time
commands, works in a web workspace.

The [explanation page](../explanation/why-web-supports-less.md) describes why
in one minute.

## What to do when a command is desktop-only

- Configure the same value another way, for example with a selection list
  instead of a file read.
- Open the workspace on the desktop for the tasks that need file access.

## You have succeeded when

- every command your configuration uses is marked "Yes" on the web support
  matrix, or you have a desktop fallback for the ones that are not.
