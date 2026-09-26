'use strict';

/**
 * One-off: sync every page's declared reading-time (front matter and visible
 * header block) to the checker's computed figure. Reads the FAIL lines the
 * budget checker prints; reruns until stable. Not part of the toolchain.
 */

const fs = require('node:fs');
const { execSync } = require('node:child_process');

const cwd = '/Users/lewiscowles/Projects/study/command-variable-docs';

for (let pass = 0; pass < 3; pass += 1) {
  const out = execSync('node scripts/check-docs-budget.js 2>&1 || true', { encoding: 'utf8', cwd });
  const lines = out.split('\n');

  // The terminal wraps FAIL records with a hard cut at ~117 characters, so the
  // continuation of a record is the next physical line verbatim (no indent, no
  // lost space). Re-join records by concatenation.
  const records = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith('FAIL:')) {
      if (cur) {
        records.push(cur);
      }
      cur = line.slice(5);
    } else if (cur !== null && line.trim().length > 0 && !line.startsWith('REGRESSION') && !line.startsWith('Per-section')) {
      cur += line;
    } else {
      if (cur) {
        records.push(cur);
      }
      cur = null;
    }
  }
  if (cur) {
    records.push(cur);
  }

  const re = /^\s*(.+?): reading-time declares \d+ min but the computed figure is \d+ equivalents \(~(\d+) min\)/;
  let fixed = 0;
  const seen = new Set();
  for (const record of records) {
    const m = record.match(re);
    if (!m) {
      continue;
    }
    const file = m[1].trim();
    if (seen.has(file) || !fs.existsSync(file)) {
      continue;
    }
    seen.add(file);
    const computed = Number(m[2]);
    let s = fs.readFileSync(file, 'utf8');
    const before = s;
    s = s.replace(/reading-time: \d+ min/, 'reading-time: ' + computed + ' min');
    s = s.replace(/\*\*Reading time:\*\* \d+ minutes?/, '**Reading time:** ' + computed + ' minutes');
    if (s !== before) {
      fs.writeFileSync(file, s);
      fixed += 1;
    }
  }
  console.log('pass', pass, 'fixed', fixed);
  if (fixed === 0) {
    break;
  }
}
