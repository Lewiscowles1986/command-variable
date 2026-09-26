---
audience: extension-author
diataxis: reference
reading-time: 4 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 4 minutes

# Vocabulary

A controlled term list plus five structural rules. This is a writing guide for
new documentation, not a cleanup mandate for the repository: these rules apply
to `README.md` and `docs/diataxis-docs/` only. `CONTRIBUTING.md`, `CHANGELOG.md`
and source comments are out of scope, and editing them to satisfy this page is
wrong. The list is guidance for whoever writes or reviews a page; no tool
enforces it.

## Structural rules

1. Sentences of at most 20 words in a how-to or tutorial, at most 25 words elsewhere.
2. Active voice and simple present: "the check fails", not "the check is failed by CI".
3. One instruction per sentence.
4. No metaphors, idioms, slang, contractions or Latin abbreviations.
5. One term per item, permanently: "shim" always means the generated package on disk.

## Term mapping

Use the right-hand term in new pages. Keep the original only in the cases
listed in the last column.

| In the repository today | Why it fails | Use instead | Keep the original when |
| --- | --- | --- | --- |
| "retreive" | misspelling | "get" | never |
| "lauch.json" | misspelling | "`launch.json`" | never |
| "remember" (as a verb) | not an approved verb | "store", "save", "keep for this session" | as the literal command or variable name `remember` |
| "pickStringRemember", "promptStringRemember" | product identifiers | keep as written; defined once in the [glossary](../../glossary.md) | always — they are code |
| "pick" / "Quick Pick" | two terms for one function | "select" / "selection list" | naming the VS Code UI component |
| "Escaped UI" | jargon, ambiguous | "cancelled input"; "the user cancelled the prompt" | as the property name `checkEscapedUI` |
| "1Up", "2Up", "nUp" | not readable | "one level up", "two levels up" | as command names such as `fileDirname1Up` |
| "Posix" | incorrect casing; not searchable | "POSIX (forward slash)" | never |
| "multi-root" | compound jargon | "a workspace with more than one folder" | quoting the VS Code setting name |
| "VSC" | non-standard abbreviation | "VS Code" | never |
| "UI element" | vague | "input prompt", "selection list", "file dialog" | never |
| "shim", "stub", "test double" | three terms for two things | "test double" (the module), "shim" (the generated package on disk) | never |
| "shell out" | idiom | "start another program" | never |
| "rots" | metaphor | "becomes obsolete" | never |
| "green" | metaphor | "passing" | never |
| "gate", "guardrail" | metaphor | "check" | never |
| "headroom", "ratchet up" | metaphor | "unused margin", "increase" | never |
| "artefact" | British spelling | "artifact", "output file" | never |
| "budget" (size) | metaphor | "maximum size" | never |
| "fail fast" | idiom | "stop at the first error" | never |
| "smoke test" | idiom | "quick test" | never |
| "wiring", "surface" | metaphor | "registration", "the set of commands" | never |
| "vendored" | jargon | "copied from another project" | in the manifest field `vendored` |
| "in-process" | jargon | "in the same process" | never |
| "e.g.", "i.e.", "etc.", "vs." | Latin abbreviations | "for example", "that is", "and more", "compared with" | never |
| "roll up" (verb) | phrasal verb | "bundle" | as the tool name Rollup |
| "eval budget" | compound jargon | "the number of dynamic code evaluations" | never |
| "concurrency group" (CI) | jargon | "one run at a time for the same branch" | in the workflow file |
| "user" / "developer" (as a person) | collides with VS Code vocabulary | "Extension user" / "Extension author" | never as a bare name for a person; "User settings" is a VS Code scope name |

## What this list is not

- It is not enforced by a tool. The three `check:docs-*` scripts do not read it.
- It is not a claim of compliance with ASD-STE100. The standard and its
  dictionary are paid, copyrighted material, and certification needs a licensed
  checker. This is an STE-aligned subset: the term table is mechanical, the
  structural rules are not, and automating half would suggest that a passing
  check means compliant prose.
- It is not finished. If a term list entry is wrong for a page you are writing,
  propose a change to this page rather than working around it.

## Banned as names for a person

Bare `user`, `developer`, `end user`, bare `author`, `maintainer`,
`contributor`. The qualified forms "Extension user" and "Extension author" are
the sanctioned names. No abbreviations: `extension-user` does not become `user`,
and "Extension author" does not become "author", after first mention.