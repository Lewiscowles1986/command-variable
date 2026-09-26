'use strict';

/**
 * Reading-time and front-matter checker for the documentation set.
 *
 * Scope (C16): README.md and everything under docs/diataxis-docs (markdown).
 * Nothing else is read, by rule rather than by accident - see the plan,
 * section 8.4. CONTRIBUTING.md and CHANGELOG.md are permanently out of scope.
 *
 * Reading-time model (plan section 8):
 *   prose 220 words per minute, fenced code 30 lines per minute,
 *   table rows 10 rows per minute, numbered steps 12 steps per minute;
 *   headings, front matter and links are free.
 * Figures are reported in "equivalents" (word-equivalents, minutes x 220).
 *
 * Bands as implemented (reconciliation of the plan's band table with C12):
 *   ideal       <=  250 equivalents (~1 min)    - silent
 *   acceptable  <  1100 equivalents (< 5 min)   - silent
 *   warn        >= 1100 equivalents (5-15 min)  - ::warning annotation
 *   over cap    >  3000 equivalents (~15 min)   - failure
 *
 * Front matter (C5) is required on every page under docs/diataxis-docs:
 *   audience: extension-user | extension-author | shared   (C7, closed enum)
 *   diataxis: tutorial | how-to | reference | explanation | index
 *   reading-time: <n> min
 *   minimum-extension-version: <semver>                    (C18, a floor)
 *
 * Every page also carries a visible header block (C4):
 *   > **Audience:** Extension user · **Reading time:** 3 minutes
 * The checker normalises between the machine and human forms and fails when
 * they disagree (C13). A shared page lists both:
 *   > **Audience:** Extension user and Extension author · **Reading time:** 1 minute
 *
 * `shared` is legal only directly under docs/diataxis-docs/ (C17).
 *
 * README.md is in budget scope only. It has no front matter: it is the
 * Marketplace landing page, not a docs tree page. While it is over the cap
 * this script exits non-zero and prints a REGRESSION: line and a per-section
 * breakdown, so the known overage is the worklist and a genuinely new problem
 * is distinguishable from it (plan section 8.1). The moment the README is
 * under the cap the script exits zero. While over the cap, a growth against
 * the recorded baseline (scripts/docs-budget-baseline.json) is reported with
 * its own REGRESSION: line.
 *
 * Usage:
 *   node scripts/check-docs-budget.js                   check; non-zero on failure
 *   node scripts/check-docs-budget.js --report          print the table; always exit 0
 *   node scripts/check-docs-budget.js --update-baseline record the current README
 *                                                       figure as the baseline; exit 0
 *
 * Run via `npm run check:docs-budget` (or as part of `npm run check:docs`).
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(repoRoot, 'docs', 'diataxis-docs');
const README_PATH = path.join(repoRoot, 'README.md');
const BASELINE_PATH = path.join(__dirname, 'docs-budget-baseline.json');

const WORDS_PER_MINUTE = 220;
const CODE_LINES_PER_MINUTE = 30;
const TABLE_ROWS_PER_MINUTE = 10;
const STEPS_PER_MINUTE = 12;

const EQUIV_PER_CODE_LINE = WORDS_PER_MINUTE / CODE_LINES_PER_MINUTE;
const EQUIV_PER_TABLE_ROW = WORDS_PER_MINUTE / TABLE_ROWS_PER_MINUTE;
const EQUIV_PER_STEP = WORDS_PER_MINUTE / STEPS_PER_MINUTE;

const IDEAL_MAX = 250;
const WARN_MIN = 1100; // 5 minutes
const HARD_CAP = 3000; // ~15 minutes

const AUDIENCES = ['extension-user', 'extension-author', 'shared'];
const DIATAXIS_TYPES = ['tutorial', 'how-to', 'reference', 'explanation', 'index'];

const report = process.argv.includes('--report');
const updateBaseline = process.argv.includes('--update-baseline');

const problems = [];
const warnings = [];
const pages = [];

/* ---------------------------------------------------------------- *
 * Markdown helpers
 * ---------------------------------------------------------------- */

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

/**
 * C13: the visible block uses the human form, front matter the machine form.
 * Normalise "Extension user" / "extension-user" / "Extension user and
 * Extension author" onto the closed enumeration.
 */
function normaliseAudience(text) {
  const tokens = String(text).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (tokens.includes('shared')) {
    return 'shared';
  }
  const hasUser = tokens.includes('user');
  const hasAuthor = tokens.includes('author');
  if (hasUser && hasAuthor) {
    return 'shared';
  }
  if (hasUser) {
    return 'extension-user';
  }
  if (hasAuthor) {
    return 'extension-author';
  }
  return null;
}

function minutesFromText(text) {
  const match = String(text).match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

const HEADER_BLOCK_RE = /^>\s*\*\*Audience:\*\*(.+?)\*\*Reading time:\*\*(.+?)\s*$/;

function findHeaderBlock(body) {
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      continue; // blank lines between front matter and the block are allowed
    }
    const match = line.match(HEADER_BLOCK_RE);
    if (!match) {
      return { block: null, problem: `expected the visible header block "> **Audience:** ... · **Reading time:** ..." as the first content after the front matter, found: ${line.slice(0, 80)}` };
    }
    return { block: { audience: match[1].replace(/[·,]\s*$/, '').trim(), reading: match[2].trim() } };
  }
  return { block: null, problem: 'page is empty after the front matter; the visible header block (C4) is missing' };
}

/* ---------------------------------------------------------------- *
 * Reading-time model (plan section 8)
 * ---------------------------------------------------------------- */

function analyseContent(rawBody) {
  const body = rawBody.replace(/<!--[\s\S]*?-->/g, '');
  const lines = body.split(/\r?\n/);
  const result = { codeLines: 0, tableRows: 0, steps: 0, proseWords: 0 };
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue; // fence markers themselves are free
    }
    if (inFence) {
      result.codeLines += 1;
      continue;
    }

    const t = line.trim();
    if (!t) {
      continue;
    }
    if (/^#{1,6}\s/.test(t)) {
      continue; // headings are free
    }
    if (/^>\s*\*\*Audience:\*\*/.test(t)) {
      continue; // the header block is metadata, asserted elsewhere
    }
    if (/^\|/.test(t)) {
      if (!/^[\s|:-]+$/.test(t)) {
        result.tableRows += 1; // separator rows are formatting, not content
      }
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      result.steps += 1; // the step line is the unit; its words are not prose
      continue;
    }

    // Links, images and bare URLs are free; keep the surrounding words.
    const text = t
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/<https?:\/\/[^>]+>/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ');
    result.proseWords += text.split(/\s+/).filter((w) => /[A-Za-z0-9_]/.test(w)).length;
  }

  return result;
}

function equivalentsOf(measure) {
  return Math.round(
    measure.proseWords
    + measure.codeLines * EQUIV_PER_CODE_LINE
    + measure.tableRows * EQUIV_PER_TABLE_ROW
    + measure.steps * EQUIV_PER_STEP
  );
}

function bandOf(equivalents) {
  if (equivalents > HARD_CAP) {
    return 'over cap';
  }
  if (equivalents >= WARN_MIN) {
    return 'warn';
  }
  if (equivalents <= IDEAL_MAX) {
    return 'ideal';
  }
  return 'acceptable';
}

function suggestedMinutes(equivalents) {
  return Math.max(1, Math.round(equivalents / WORDS_PER_MINUTE));
}

/* ---------------------------------------------------------------- *
 * Docs-tree pages: front matter, header block, budget
 * ---------------------------------------------------------------- */

function checkDocsPage(filePath) {
  const rel = path.relative(repoRoot, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const { frontMatter, body } = parseFrontMatter(content);

  if (!frontMatter) {
    problems.push(`${rel}: missing front matter (C5). Start the file with --- and declare audience, diataxis, reading-time and minimum-extension-version.`);
    return;
  }

  // --- audience (C7 closed enumeration) ---
  const audience = frontMatter.audience;
  if (!audience) {
    problems.push(`${rel}: front matter has no audience (C5).`);
  } else if (!AUDIENCES.includes(audience)) {
    problems.push(`${rel}: audience "${audience}" is not in the closed enumeration ${AUDIENCES.join(' | ')} (C7). A third role needs a deliberate schema change, not a new page.`);
  }

  // --- diataxis type ---
  const diataxis = frontMatter.diataxis;
  if (!diataxis) {
    problems.push(`${rel}: front matter has no diataxis value (C5).`);
  } else if (!DIATAXIS_TYPES.includes(diataxis)) {
    problems.push(`${rel}: diataxis "${diataxis}" is not one of ${DIATAXIS_TYPES.join(' | ')}.`);
  } else if (diataxis === 'index' && path.basename(filePath) !== 'index.md') {
    problems.push(`${rel}: diataxis "index" is legal only for pages named index.md; use one of tutorial | how-to | reference | explanation.`);
  }

  // --- minimum-extension-version (C18: a floor, not a timestamp) ---
  const minVersion = frontMatter['minimum-extension-version'];
  if (!minVersion) {
    problems.push(`${rel}: front matter has no minimum-extension-version (C18). State the lowest extension version in which everything on this page works.`);
  } else if (!/^\d+\.\d+\.\d+$/.test(minVersion)) {
    problems.push(`${rel}: minimum-extension-version "${minVersion}" is not a semver floor like 1.71.0 (C18).`);
  }

  // --- visible header block (C4) ---
  const header = findHeaderBlock(body);
  if (header.problem) {
    problems.push(`${rel}: ${header.problem}`);
  }

  // --- computed reading time vs declarations (C12, C13) ---
  const equivalents = equivalentsOf(analyseContent(body));
  const computedMinutes = suggestedMinutes(equivalents);

  const declared = frontMatter['reading-time'];
  if (!declared) {
    problems.push(`${rel}: front matter has no reading-time (C5). Computed figure is ${equivalents} equivalents (~${(equivalents / WORDS_PER_MINUTE).toFixed(1)} min); declare "reading-time: ${computedMinutes} min".`);
  } else {
    const declaredMinutes = minutesFromText(declared);
    if (declaredMinutes === null) {
      problems.push(`${rel}: reading-time "${declared}" is not in the form "<n> min".`);
    } else if (declaredMinutes !== computedMinutes) {
      problems.push(`${rel}: reading-time declares ${declaredMinutes} min but the computed figure is ${equivalents} equivalents (~${computedMinutes} min). Update reading-time to "${computedMinutes} min".`);
    }
  }

  if (header.block) {
    const headerAudience = normaliseAudience(header.block.audience);
    if (!headerAudience) {
      problems.push(`${rel}: header block audience "${header.block.audience}" is not recognisable. Use "Extension user", "Extension author", or "Extension user and Extension author" (C3, C13).`);
    } else if (audience && headerAudience !== audience) {
      problems.push(`${rel}: header block says "${headerAudience}" but front matter says "${audience}" (C13). The two must agree after normalisation.`);
    }
    const headerMinutes = minutesFromText(header.block.reading);
    if (headerMinutes === null) {
      problems.push(`${rel}: header block reading time "${header.block.reading}" is not in the form "<n> minutes".`);
    } else if (declared && minutesFromText(declared) !== null && headerMinutes !== minutesFromText(declared)) {
      problems.push(`${rel}: header block says ${headerMinutes} minutes but front matter declares ${minutesFromText(declared)} min (C13).`);
    }
  }

  // --- shared placement (C17) ---
  if (audience === 'shared' && path.dirname(filePath) !== DOCS_ROOT) {
    problems.push(`${rel}: audience "shared" is legal only directly under docs/diataxis-docs/ (C17). A page inside a tree has one audience.`);
  }

  pages.push({ rel, equivalents, band: bandOf(equivalents), declared, computedMinutes });
}

/* ---------------------------------------------------------------- *
 * README.md: budget only, with regression signal and section breakdown
 * ---------------------------------------------------------------- */

function readmeSections(content) {
  const sections = [];
  let current = { title: '(before the first ## heading)', lines: [] };
  for (const line of content.split(/\r?\n/)) {
    if (/^##\s/.test(line)) {
      sections.push(current);
      current = { title: line.replace(/^##\s+/, '').trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

function analyseReadme() {
  const rel = path.relative(repoRoot, README_PATH);
  if (!fs.existsSync(README_PATH)) {
    problems.push(`${rel}: not found, but it is in checker scope (C16).`);
    return null;
  }
  const content = fs.readFileSync(README_PATH, 'utf8');
  const equivalents = equivalentsOf(analyseContent(content));
  const band = bandOf(equivalents);
  pages.push({ rel, equivalents, band, declared: '(none - landing page)', computedMinutes: suggestedMinutes(equivalents) });

  const overCap = equivalents > HARD_CAP;
  const baseline = fs.existsSync(BASELINE_PATH)
    ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
    : null;
  const baselineFigure = baseline ? baseline['README.md'] : null;

  if (overCap) {
    console.log(`REGRESSION: README.md is over the reading-time hard cap: ${equivalents} equivalents (~${(equivalents / WORDS_PER_MINUTE).toFixed(1)} min) > ${HARD_CAP}.`);
    console.log('REGRESSION: this is the known worklist - extract sections into docs/diataxis-docs/ until the cap is met (plan section 8.1). It is not a new failure by itself; growth is.');
    if (baselineFigure !== null && equivalents > baselineFigure) {
      console.log(`REGRESSION: README.md grew from ${baselineFigure} to ${equivalents} equivalents. The latest edit made the README longer instead of extracting from it.`);
    }
    console.log('');
    console.log('Per-section breakdown (the extraction worklist):');
    for (const section of readmeSections(content)) {
      const sectionEquivalents = equivalentsOf(analyseContent(section.lines.join('\n')));
      const marker = sectionEquivalents > HARD_CAP ? ' <-- over cap on its own' : '';
      console.log(`  ${String(sectionEquivalents).padStart(6)}  ${section.title}${marker}`);
    }
    problems.push(`${rel}: over the reading-time hard cap (${equivalents} equivalents > ${HARD_CAP}). See the REGRESSION: lines above; fix by extracting sections into docs/diataxis-docs/, not by trimming content silently.`);
  } else if (baselineFigure !== null && equivalents > baselineFigure) {
    // Under the cap the red-as-step loop is closed; growth is no longer a failure.
    warnings.push(`${rel} is under the cap but grew from ${baselineFigure} to ${equivalents} equivalents since the baseline was recorded.`);
  }

  return equivalents;
}

/* ---------------------------------------------------------------- *
 * Reporting
 * ---------------------------------------------------------------- */

function printTable() {
  console.log('');
  console.log('Reading-time report (scope C16: README.md and docs/diataxis-docs/**/*.md)');
  console.log('  band targets: ideal <= 250, warn >= 1100 (5 min), hard cap > 3000 (~15 min)');
  console.log('');
  const width = Math.max(...pages.map((p) => p.rel.length), 4);
  console.log(`  ${'page'.padEnd(width)}  equiv    min  band        declared`);
  for (const p of pages) {
    const declared = p.declared === undefined ? '-' : p.declared;
    console.log(`  ${p.rel.padEnd(width)}  ${String(p.equivalents).padStart(5)}  ${String(p.computedMinutes).padStart(4)}  ${p.band.padEnd(10)}  ${declared}`);
  }
}

function writeGithubSummary() {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }
  const rows = [
    '| Page | Equivalents | Minutes | Band | Gap to cap |',
    '| --- | ---: | ---: | --- | ---: |',
  ];
  for (const p of pages) {
    rows.push(`| \`${p.rel}\` | ${p.equivalents} | ${(p.equivalents / WORDS_PER_MINUTE).toFixed(1)} | ${p.band} | ${HARD_CAP - p.equivalents} |`);
  }
  rows.push('');
  rows.push('Bands: ideal <= 250 equivalents, warn >= 1100 (5 min), hard cap > 3000 (~15 min). Negative gap means over the cap.');
  fs.appendFileSync(summaryPath, `${rows.join('\n')}\n`);
}

function emitAnnotations() {
  for (const p of pages) {
    if (p.band === 'warn') {
      console.log(`::warning file=${p.rel}::reading time is ${p.computedMinutes} min (${p.equivalents} equivalents), inside the 5-15 minute warn band. Keep reference pages under 5 minutes where possible.`);
    }
  }
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    problems.push(`docs/diataxis-docs/ not found. The documentation tree does not exist yet; every page it should contain is still red (absent).`);
  } else {
    for (const file of listMarkdownFiles(DOCS_ROOT)) {
      checkDocsPage(file);
    }
    if (pages.filter((p) => p.rel.startsWith('docs' + path.sep)).length === 0) {
      problems.push('docs/diataxis-docs/ contains no markdown pages.');
    }
  }

  analyseReadme();

  const sawWarn = pages.some((p) => p.band === 'warn');

  if (report) {
    printTable();
    console.log('');
    console.log(`report only: ${problems.length} problem(s) would fail, ${warnings.length} note(s).`);
    return 0;
  }

  for (const problem of problems) {
    console.error(`FAIL: ${problem}`);
  }
  for (const warning of warnings) {
    console.warn(`NOTE: ${warning}`);
  }

  if (updateBaseline && !report) {
    const readme = pages.find((p) => p.rel === 'README.md');
    if (readme) {
      fs.writeFileSync(BASELINE_PATH, `${JSON.stringify({ 'README.md': readme.equivalents }, null, 2)}\n`);
      console.log(`baseline written: scripts/docs-budget-baseline.json (README.md = ${readme.equivalents} equivalents)`);
    }
    return problems.length > 0 ? 1 : 0;
  }

  printTable();
  writeGithubSummary();
  emitAnnotations();

  if (problems.length > 0) {
    console.error('');
    console.error(`check-docs-budget: ${problems.length} problem(s)`);
    return 1;
  }
  if (sawWarn) {
    console.log('');
    console.log('check-docs-budget: passed, with pages in the warn band');
  } else {
    console.log('');
    console.log('check-docs-budget: passed');
  }
  return 0;
}

process.exit(main());
