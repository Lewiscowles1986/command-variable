---
audience: extension-user
diataxis: explanation
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 1 minute

# Why the web version supports less

VS Code can run extensions in two places: on your machine, and in a browser sandbox (vscode.dev, or a remote connection). The browser sandbox is a real extension host, but it does not offer everything the desktop one does.

## The one thing that differs

The browser host has no Node file system. Any command that needs to read or write a file by path cannot run there. That is the whole difference: no other capability the extension uses is missing.

## What that takes out

| Feature | Why it is out |
| --- | --- |
| `file.content` and friends | they read a file by path |
| `commandvariable.remember.persistent.file` | it writes a file on the local disk |
| anything documenting a Node-only behaviour | there is no Node in the sandbox |

Everything else — selection lists, prompts, transform, UUID, date and time, clipboard, the expression commands — works in a web workspace.

## What you can rely on

The [web support matrix](../reference/web-support-matrix.md) lists every command with a yes or no, derived from the same source the extension is built from. The [how-to page](../how-to/use-in-browser-workspace.md) tells you what to do when a command you need is desktop-only.
