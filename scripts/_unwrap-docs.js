#!/usr/bin/env node
/**
 * _unwrap-docs.js  (one-off migration script, NOT part of the check toolchain)
 *
 * Joins hard-wrapped prose in the docs tree so that a paragraph
 * occupies a single physical line. New newlines are produced only by
 * markdown structure:
 *
 *   - fenced code blocks are left byte-for-byte intact (including mermaid)
 *   - tables (| rows) are left as-is
 *   - blockquotes are left as-is (each > line stays its own line)
 *   - headings, front matter, blank lines are left as-is
 *   - list items: an immediately-following indented non-list, non-fence,
 *     non-nested-list line is joined into the item (repeatedly)
 *   - indented prose following an indented prose line (deeper continuation)
 *     is joined the same way
 *   - two trailing spaces (hard-break marker) are stripped when the line is
 *     being joined into a previous paragraph/item; a trailing two-space is
 *     kept only when the next line is a fence directly under a list item
 *     (structural example layout)
 *
 * After running, `node scripts/check-docs-softwrap.js` must pass.
 *
 * Usage: node scripts/_unwrap-docs.js [--dry-run]
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(repoRoot, 'docs', 'diataxis-docs');

const dryRun = process.argv.includes('--dry-run');

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function unwrap(content) {
  const lines = content.split('\n');
  const out = [];
  let inFence = false;
  let inFrontMatter = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (inFrontMatter) {
      out.push(line);
      if (i > 0 && line.trim() === '---') inFrontMatter = false;
      continue;
    }
    if (i === 0 && line.trim() === '---') {
      inFrontMatter = true;
      out.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (line === '') {
      out.push(line);
      continue;
    }

    // Structural lines pass through untouched: headings, tables, blockquotes.
    if (/^#{1,6} /.test(line) || /^>/.test(line) || /^\s*\|/.test(line)) {
      out.push(line);
      continue;
    }

    // List item: absorb following indented non-structural, non-fence,
    // non-nested-list lines into one physical line.
    if (/^\s*[-*+] /.test(line) || /^\s*\d+\. /.test(line)) {
      let current = line.replace(/ {2}$/, '');
      let j = i + 1;
      while (j < lines.length) {
        const nxt = lines[j];
        if (nxt.trim() === '') break;
        // A fence (or anything fence-related) stops joining: the example
        // layout under a list item is structural.
        if (nxt.trim().startsWith('```')) break;
        // A nested list item is structural, never joined.
        if (/^\s*([-*+] |\d+\. )/.test(nxt)) break;
        // An indented line is a continuation of this item only when it is
        // not itself a fence line; deeper indentation after the break
        // marker (three+ spaces) is also a continuation.
        if (!/^\s/.test(nxt)) break;
        if (/^\s*\|/.test(nxt)) break;
        current += ' ' + nxt.replace(/\s+$/, '').trimStart();
        j += 1;
      }
      out.push(current);
      i = j - 1;
      continue;
    }

    // Plain prose (starts at column 0, not structural): absorb any following
    // non-blank line that is prose (no marker) or an indented continuation
    // that is NOT a fence/nested list/table.
    let current = line.replace(/ {2}$/, '');
    let j = i + 1;
    while (j < lines.length) {
      const nxt = lines[j];
      if (nxt.trim() === '') break;
      if (nxt.trim().startsWith('```')) break;
      if (/^#{1,6} /.test(nxt) || /^>/.test(nxt) || /^\s*\|/.test(nxt)) break;
      if (/^\s*([-*+] |\d+\. )/.test(nxt)) break;
      if (/^ /.test(nxt)) {
        // Indented line after column-0 prose: only continue when this file's
        // author used wrapped continuation (two-space indented prose). A
        // deeper-indented block after prose at col 0 would be code (4-space
        // fence-less), which we never merge.
        const indent = nxt.length - nxt.trimStart().length;
        if (indent >= 4) break;
      }
      current += ' ' + nxt.replace(/ {2}$/, '').trimStart();
      j += 1;
    }
    out.push(current);
    i = j - 1;
  }

  return out.join('\n');
}

function main() {
  const files = listMarkdownFiles(DOCS_ROOT);
  let changed = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    const after = unwrap(before);
    if (before !== after) {
      changed += 1;
      if (!dryRun) fs.writeFileSync(file, after);
      console.log(`unwrapped: ${path.relative(repoRoot, file)}`);
    }
  }
  console.log(`${changed} of ${files.length} file(s) changed${dryRun ? ' (dry run)' : ''}`);
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { unwrap };