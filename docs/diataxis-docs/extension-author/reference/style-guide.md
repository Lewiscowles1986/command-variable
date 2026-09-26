---
audience: extension-author
diataxis: reference
reading-time: 5 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 5 minutes

# Style guide

This page states the conventions every page in `docs/diataxis-docs/` follows.
The three checks in `npm run check:docs` assert most of them, so a page that
breaks a convention fails a check rather than a review comment.

## Scope of these rules

These rules apply to `README.md` and to every page under `docs/diataxis-docs/`.
They do **not** apply to `CONTRIBUTING.md`, `CHANGELOG.md`, source comments or
test fixtures, and editing those files to satisfy this guide is out of scope.
The checks read exactly the two in-scope locations and nothing else.

## Page anatomy

A page has this shape, in this order:

```markdown
---
audience: extension-user
diataxis: how-to
reading-time: 3 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 3 minutes

# Title

(one opening paragraph: what this page is for)

(body)

(you have succeeded when ... — how-to pages only)
```

## Front matter

| Field | Values | Notes |
| --- | --- | --- |
| `audience` | `extension-user`, `extension-author`, `shared` | closed list. A fourth value is a schema change, not a new page |
| `diataxis` | `tutorial`, `how-to`, `reference`, `explanation` | `index` only for pages named `index.md` |
| `reading-time` | `<n> min` | the computed figure, not an estimate. The check fails while they disagree |
| `minimum-extension-version` | a version like `1.71.0` | the lowest extension version in which everything on the page works. A floor, not a date, and not the `engines.vscode` value |

The machine form (`extension-user`) appears in front matter and paths; the human
form ("Extension user") appears in prose and in the header block. Both spellings
are deliberate: one is written for a parser, one for a reader. Never shorten
either form after first mention.

## Placement rules

- A page inside `extension-user/` or `extension-author/` declares that tree's audience.
- `audience: shared` is legal only directly under `docs/diataxis-docs/`.
- A page sits in the folder matching its type: `tutorials/`, `how-to/`,
  `reference/` or `explanation/` (except `index.md`).

## The extension-user boundary

A page in `docs/diataxis-docs/extension-user/` must not contain these strings:

```
rollup  vitest  mocha  activate  out/  npm run  require(  extension-common
```

Each names a build or test concern an Extension user never touches. If a page
needs one, the page belongs in the `extension-author` tree. Code fences are
exempt, because a `launch.json` example may legitimately contain any text.

Extend the list when a leak is found. Each addition is a deliberate change to
the boundary, made in the checker and reflected here.

## Reading time

The budget is a measurement, not an opinion:

| Content | Rate |
| --- | --- |
| prose | 220 words per minute |
| fenced code | 30 lines per minute |
| table rows | 10 rows per minute |
| numbered steps | 12 steps per minute |
| headings, front matter, links | free |

Targets: an index or single-command page lands near or below 250 equivalents
(~1 minute); a tutorial, how-to or explanation lands in the 600–1,250 band;
nothing exceeds 3,000 equivalents (~15 minutes). Between 5 and 15 minutes a
warning is printed; above 3,000 the check fails. `README.md` is over the cap
during the migration by design; the failing number is the worklist, and the
`REGRESSION:` line in the check output separates growth from the known overage.

## Audience naming

The sanctioned names for people are **Extension user** and **Extension
author**. As a bare name for a person, never write: `user`, `developer`,
`end user`, `author`, `maintainer`, `contributor`. Two exceptions are
vocabulary, not people: "User settings" is a VS Code scope name, and
"maintainer" may describe a lifecycle (as in the maintenance model page).

## Writing rules

The [vocabulary page](vocabulary.md) carries the full term list and the
structural rules. The short version:

1. One instruction per sentence, in active voice and simple present.
2. No metaphors, idioms or Latin abbreviations: "check" not "gate", "passing"
   not "green", "for example" not "e.g.".
3. One term per item, permanently: a `launch.json` file is never also "the config".

## How-to pages end with a success check

Every how-to ends with a "you have succeeded when ..." section that a reader
can verify without contacting the author. A tutorial ends with a result the
reader produced themselves. This converts each page into something testable.

## Diagrams

Use a Mermaid diagram when a page needs to show structure: which module
requires which, or how the test layers relate. Two diagrams replace roughly six
hundred words. Keep diagrams labelled with terms from the
[glossary](../../glossary.md).

## The checks

| Check | What it reads | What it asserts |
| --- | --- | --- |
| `check:docs-budget` | `README.md`, `docs/diataxis-docs/` | reading time, front matter, audience agreement, `shared` placement |
| `check:docs-placement` | `docs/diataxis-docs/` | the forbidden-term boundary, tree membership, folder matches type |
| `check:docs-links` | `README.md`, `docs/diataxis-docs/` | relative links and in-repo anchors resolve |

Run all three with `npm run check:docs`. They run on every push in a separate
workflow, not as part of the PR pipeline or the packaging job, so a red docs
check never blocks a release.