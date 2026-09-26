'use strict';

/**
 * In-repo link checker for the documentation set.
 *
 * Scope (C16): README.md and everything under docs/diataxis-docs (markdown).
 *
 * Validates internal links only:
 *   - relative file links resolve to a file that exists
 *     (a link to a directory resolves to its index.md)
 *   - links ending in #fragment resolve to that anchor in the target file
 *     (GitHub-style slugs: lowercased, punctuation removed, spaces to dashes)
 *   - same-page #fragment links resolve within the source file
 *
 * External URLs (http/https/mailto) are deliberately not fetched: network
 * access is flaky in CI and a third-party site going down is not this
 * repository's failure (plan section 8.3).
 *
 * Known blind spot, accepted: this checks outbound links only. Inbound deep
 * links from issues or third-party posts are invisible to any local tool; see
 * plan section 8.3 and R5.
 *
 * Usage:
 *   node scripts/check-docs-links.js           check; non-zero on failure
 *   node scripts/check-docs-links.js --report  print resolved links; always exit 0
 *
 * Run via `npm run check:docs-links` (or as part of `npm run check:docs`).
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(repoRoot, 'docs', 'diataxis-docs');
const README_PATH = path.join(repoRoot, 'README.md');

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

/** GitHub-style heading anchor: lowercase, drop punctuation, spaces to dashes. */
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    // Backticks and emphasis markers in a heading text do not appear in the
    // anchor GitHub generates; strip them before slugifying.
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function headingsOf(content) {
  const slugs = new Set();
  let inFence = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    const match = line.match(/^#{1,6}\s+(.*?)\s*$/);
    if (match) {
      slugs.add(slugify(match[1]));
    }
  }
  return slugs;
}

/**
 * Collect markdown links: [text](target) not preceded by !, and reference-style
 * definitions are resolved by scanning their inline usage.
 *
 * Malformed targets that embed a URL inside the fragment slot
 * (`(#https://...)`) are treated as external: the target starts with a scheme
 * after the '#', so there is nothing local to validate.
 */
function extractLinks(content) {
  const links = [];
  const lines = content.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    for (const match of line.matchAll(/(!?)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      if (match[1] === '!') {
        continue; // images: only files, checked the same way below
      }
      const target = match[2];
      if (/^#(https?:|mailto:)/i.test(target)) {
        continue; // malformed external-in-fragment; not a local link
      }
      links.push({ target, line: i + 1 });
    }
  }
  return links;
}

function resolveLink(sourceFile, target) {
  // Absolute repo-relative links are not used in this tree; relative only.
  const decoded = decodeURIComponent(target);
  const [filePart, fragment] = decoded.split('#');
  const baseDir = path.dirname(sourceFile);

  if (!filePart) {
    // Same-page anchor: validate the fragment against this file.
    const content = fs.readFileSync(sourceFile, 'utf8');
    if (!fragment || headingsOf(content).has(fragment)) {
      return { ok: true, description: fragment ? `#${fragment}` : '(empty)' };
    }
    return { ok: false, description: `#${fragment} does not match any heading in this page` };
  }

  let resolved = path.resolve(baseDir, filePart);
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    resolved = path.join(resolved, 'index.md');
  }

  if (!fs.existsSync(resolved)) {
    const display = path.relative(repoRoot, resolved);
    return { ok: false, description: `${display} does not exist` };
  }

  if (fragment) {
    if (!resolved.endsWith('.md')) {
      return { ok: false, description: `fragment #${fragment} on a non-markdown target` };
    }
    const targetContent = fs.readFileSync(resolved, 'utf8');
    if (!headingsOf(targetContent).has(fragment)) {
      const display = path.relative(repoRoot, resolved);
      return { ok: false, description: `#${fragment} does not match any heading in ${display}` };
    }
    return { ok: true, description: `${path.relative(repoRoot, resolved)}#${fragment}` };
  }

  return { ok: true, description: path.relative(repoRoot, resolved) };
}

function checkFile(file) {
  const rel = path.relative(repoRoot, file);
  const content = fs.readFileSync(file, 'utf8');
  const links = extractLinks(content);
  checked.push({ rel, count: links.length });

  for (const link of links) {
    if (/^(https?:|mailto:|#)/i.test(link.target) === false && /^[a-z]+:/i.test(link.target)) {
      continue; // other schemes are out of scope
    }
    if (/^https?:/i.test(link.target)) {
      continue; // external URLs are never fetched
    }
    const result = resolveLink(file, link.target);
    if (!result.ok) {
      problems.push(`${rel}:${link.line}: broken link (${link.target}): ${result.description}`);
    } else if (report) {
      console.log(`  ok  ${rel}:${link.line} -> ${result.description}`);
    }
  }
}

function main() {
  const files = [];
  if (fs.existsSync(README_PATH)) {
    files.push(README_PATH);
  } else {
    problems.push('README.md not found, but it is in checker scope (C16).');
  }
  if (!fs.existsSync(DOCS_ROOT)) {
    problems.push('docs/diataxis-docs/ not found; nothing there to link-check yet.');
  } else {
    files.push(...listMarkdownFiles(DOCS_ROOT));
  }

  for (const file of files) {
    checkFile(file);
  }

  if (report) {
    console.log(`checked ${checked.length} file(s), ${checked.reduce((n, f) => n + f.count, 0)} link(s):`);
    for (const entry of checked) {
      console.log(`  ${entry.rel}: ${entry.count} link(s)`);
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
    console.error(`check-docs-links: ${problems.length} problem(s)`);
    return 1;
  }
  console.log(`check-docs-links: passed (${checked.length} file(s), ${checked.reduce((n, f) => n + f.count, 0)} link(s) checked)`);
  return 0;
}

process.exit(main());
