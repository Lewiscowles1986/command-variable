#!/usr/bin/env node
/**
 * check-docs-softwrap.js
 *
 * Enforces the no-artificial-newline rule (style guide rule "soft wrap"):
 * prose is written one paragraph per physical line. A newline in a docs page
 * exists only because markdown structure requires one:
 *
 *   - YAML front matter delimiters and values
 *   - the visible audience header block right after front matter
 *   - ATX headings (# .. ######)
 *   - fenced code blocks (``` fences; content lines are never touched)
 *   - markdown tables (every row on one physical line)
 *   - blockquotes (each logical line prefixed with >)
 *   - list items (a wrapped continuation line under a list item is a break)
 *   - blank-line paragraph separators
 *
 * Everything else must be a single physical line per paragraph. Editor
 * soft-wrap is responsible for display; the file never hard-codes it.
 *
 * What the checker flags: a non-structural line immediately followed by
 * another non-structural line (a wrapped paragraph), and a list item
 * immediately followed by an indented continuation line that is not itself
 * a nested list item.
 *
 * Usage:
 *   node scripts/check-docs-softwrap.js                   check; non-zero on failure
 *   node scripts/check-docs-softwrap.js --report          print offenders; always exit 0
 *
 * Run via `npm run check:docs-softwrap` (or as part of `npm run check:docs`).
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(repoRoot, 'docs', 'diataxis-docs');
const README_PATH = path.join(repoRoot, 'README.md');

const report = process.argv.includes('--report');

const problems = [];

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listMarkdownFiles(full));
    } else if (entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Classify one physical line of a markdown page (outside fenced blocks).
 * Returns 'fence-toggle' | 'blank' | 'frontmatter' | 'structural' | 'prose'.
 */
function classify(line, state) {
  if (state.inFence) return 'fenced';
  if (/^\s*```/.test(line)) return 'fence-toggle';
  if (line.trim() === '') return 'blank';
  if (state.inFrontMatter) return 'frontmatter';
  if (/^#{1,6} /.test(line)) return 'structural';
  if (/^\s*\|/.test(line)) return 'structural';
  if (/^>/.test(line)) return 'structural';
  if (/^\s*[-*+] /.test(line) || /^\s*\d+\. /.test(line)) return 'list';
  if (/^\s/.test(line)) return 'indented';
  return 'prose';
}

function checkFile(file, rel) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const state = { inFence: false, inFrontMatter: false, fenceChar: null };
  // Front matter: between line 1 (---) and the next (---).
  if (lines[0] !== undefined && lines[0].trim() === '---') {
    state.inFrontMatter = true;
  }
  let fenceCount = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const kind = classify(line, state);

    if (kind === 'frontmatter') {
      if (i > 0 && line.trim() === '---') {
        state.inFrontMatter = false;
      }
      continue;
    }

    if (kind === 'fence-toggle') {
      fenceCount += 1;
      // Odd-numbered fence opens, even closes; handles ``` and indented variants.
      state.inFence = fenceCount % 2 === 1;
      continue;
    }

    if (kind === 'blank') continue;

    // Look ahead ONE line only: a blank line is a paragraph boundary, so a
    // continuation must be the immediately-next physical line. Skipping
    // blanks would falsely join separate paragraphs.
    const j = i + 1;
    if (j >= lines.length) continue;
    const nextLine = lines[j];
    const nextKind = classify(nextLine, state);

    const nextIsContinuation =
      nextKind === 'prose' ||
      (kind === 'list' && nextKind === 'indented' && !isNestedListItem(nextLine)) ||
      (kind === 'indented' && nextKind === 'indented');

    if (nextIsContinuation) {
      problems.push(
        `${rel}:${i + 1}: newline inside prose (soft-wrap must be left to the editor). ` +
          `Line: ${line.trim().slice(0, 60)}`
      );
    }
  }
}

function isNestedListItem(line) {
  return /^\s*([-*+] |\d+\. )/.test(line);
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error(`FAIL: docs tree not found at ${DOCS_ROOT}`);
    return 1;
  }

  const files = [...listMarkdownFiles(DOCS_ROOT)];
  if (fs.existsSync(README_PATH)) {
    files.push(README_PATH);
  }

  for (const file of files) {
    checkFile(file, path.relative(repoRoot, file));
  }

  if (report) {
    console.log(`softwrap report: ${problems.length} offending line(s) in ${files.length} file(s)`);
    for (const p of problems) console.log(`  ${p}`);
    return 0;
  }

  if (problems.length > 0) {
    console.error('');
    console.error(`check-docs-softwrap: ${problems.length} line(s) with artificial newlines`);
    return 1;
  }

  console.log(`check-docs-softwrap: passed (${files.length} file(s), no artificial newlines)`);
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { classify, isNestedListItem };