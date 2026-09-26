'use strict';

/**
 * Audience-boundary checker for the documentation set.
 *
 * Enforces the two-tree boundary (plan section 4, decision F3):
 *
 *   docs/diataxis-docs/extension-user/**   may not contain any term from the
 *   forbidden list below, because such a term means the page is answering a
 *   question only an Extension author has.
 *
 *   docs/diataxis-docs/extension-author/** - no forbidden list; anything goes.
 *
 * The starting forbidden-term list (plan section 4):
 *   rollup  vitest  mocha  activate  out/  npm run  require(  extension-common
 * Extend this list when a leak is found; each addition is a deliberate change.
 *
 * Also enforces:
 *   - every page under docs/diataxis-docs declares its audience in front matter (C5)
 *   - the audience enumeration is closed: extension-user | extension-author | shared (C7)
 *   - `shared` is legal only directly under docs/diataxis-docs/ (C17)
 *   - pages live in a folder matching their Diataxis type:
 *       tutorials/ how-to/ reference/ explanation/ (index.md is exempt)
 *     so a reference page cannot drift into how-to/, and vice versa.
 *
 * Usage:
 *   node scripts/check-docs-placement.js           check; non-zero on failure
 *   node scripts/check-docs-placement.js --report  print findings; always exit 0
 *
 * Run via `npm run check:docs-placement` (or as part of `npm run check:docs`).
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(repoRoot, 'docs', 'diataxis-docs');

const USER_TREE = path.join(DOCS_ROOT, 'extension-user');
const AUTHOR_TREE = path.join(DOCS_ROOT, 'extension-author');

// F3 starting list. Extend when a leak is found; the list is a boundary, not a style guide.
const FORBIDDEN_IN_USER_TREE = [
  'rollup',
  'vitest',
  'mocha',
  'activate',
  'out/',
  'npm run',
  'require(',
  'extension-common',
];

const AUDIENCES = ['extension-user', 'extension-author', 'shared'];
const FOLDERS_BY_TYPE = {
  tutorial: 'tutorials',
  'how-to': 'how-to',
  reference: 'reference',
  explanation: 'explanation',
};

const report = process.argv.includes('--report');
const problems = [];
const checked = [];

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      found.push(full);
    }
  }
  return found.sort();
}

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return { frontMatter: null, body: content };
  }
  const frontMatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z-]+):\s*(.*?)\s*$/);
    if (kv) {
      frontMatter[kv[1]] = kv[2];
    }
  }
  return { frontMatter, body: content.slice(match[0].length) };
}

function findForbiddenTerms(body) {
  const hits = [];
  const lines = body.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue; // code fences may quote anything, for example a launch.json snippet
    }
    for (const term of FORBIDDEN_IN_USER_TREE) {
      if (line.toLowerCase().includes(term)) {
        hits.push({ term, line: i + 1, text: line.trim().slice(0, 100) });
      }
    }
  }
  return hits;
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    problems.push('docs/diataxis-docs/ not found; the tree boundary cannot be checked until it exists.');
  } else {
    const files = listMarkdownFiles(DOCS_ROOT);
    if (files.length === 0) {
      problems.push('docs/diataxis-docs/ contains no markdown pages.');
    }
    for (const file of files) {
      const rel = path.relative(repoRoot, file);
      const content = fs.readFileSync(file, 'utf8');
      const { frontMatter } = parseFrontMatter(content);
      checked.push(rel);

      if (!frontMatter) {
        problems.push(`${rel}: no front matter, so no audience is declared (C5).`);
        continue;
      }
      const audience = frontMatter.audience;
      if (!audience || !AUDIENCES.includes(audience)) {
        problems.push(`${rel}: audience "${audience ?? '(missing)'}" is not in the closed enumeration ${AUDIENCES.join(' | ')} (C7).`);
        continue;
      }

      if (audience === 'shared' && path.dirname(file) !== DOCS_ROOT) {
        problems.push(`${rel}: audience "shared" is legal only directly under docs/diataxis-docs/ (C17).`);
      }

      // A page inside a tree must name that tree's audience, not the other one.
      const inUserTree = file.startsWith(USER_TREE + path.sep);
      const inAuthorTree = file.startsWith(AUTHOR_TREE + path.sep);
      if (inUserTree && audience !== 'extension-user') {
        problems.push(`${rel}: sits in the extension-user tree but declares audience "${audience}". Pages inside a tree name that tree's audience (C17).`);
      }
      if (inAuthorTree && audience !== 'extension-author') {
        problems.push(`${rel}: sits in the extension-author tree but declares audience "${audience}". Pages inside a tree name that tree's audience (C17).`);
      }

      // Folder must match the declared Diataxis type (index.md and shared
      // root pages exempt: C17 puts glossary.md directly under the docs root).
      const diataxis = frontMatter.diataxis;
      const base = path.basename(file);
      const isRootSharedPage = path.dirname(file) === DOCS_ROOT;
      if (diataxis && base !== 'index.md' && !isRootSharedPage && FOLDERS_BY_TYPE[diataxis]) {
        const expectedFolder = FOLDERS_BY_TYPE[diataxis];
        const parent = path.basename(path.dirname(file));
        if (parent !== expectedFolder) {
          problems.push(`${rel}: diataxis "${diataxis}" pages belong in ${expectedFolder}/, found in ${parent}/.`);
        }
      }

      if (inUserTree) {
        const hits = findForbiddenTerms(content);
        for (const hit of hits) {
          problems.push(`${rel}:${hit.line}: forbidden term "${hit.term}" in the extension-user tree (F3). This page answers an Extension author question; move it to docs/diataxis-docs/extension-author/. Text: ${hit.text}`);
        }
      }
    }
  }

  if (report) {
    console.log(`checked ${checked.length} page(s):`);
    for (const rel of checked) {
      console.log(`  ${rel}`);
    }
    console.log('');
    console.log(`report only: ${problems.length} problem(s) would fail.`);
    return 0;
  }

  for (const problem of problems) {
    console.error(`FAIL: ${problem}`);
  }
  if (problems.length > 0) {
    console.error('');
    console.error(`check-docs-placement: ${problems.length} problem(s)`);
    return 1;
  }
  console.log(`check-docs-placement: passed (${checked.length} page(s) checked against the tree boundary)`);
  return 0;
}

process.exit(main());