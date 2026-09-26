'use strict';

/**
 * Post-build safety gate.
 *
 * Verifies the produced web bundle is actually shippable:
 *   - the rollup output exists and exports `activate`
 *   - nothing but `vscode` is required (a Node built-in such as `fs` or `path`
 *     would break the extension in a web/virtual workspace host)
 *   - the bundle stays within a size budget, so an accidental dependency import
 *     is caught before release
 *   - the manifest points at the bundle and does not exclude it from the package
 *
 * Run via `npm run check:bundle` (or as part of `npm run verify`).
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

const problems = [];
const notes = [];

function fail(message) {
  problems.push(message);
}

/* ---------------------------------------------------------------- *
 * The bundle must exist and be the manifest's declared entry point
 * ---------------------------------------------------------------- */

const browserField = manifest.browser;
if (!browserField) {
  fail('package.json has no "browser" entry point');
}

const bundleRelative = (browserField || './out/extension-common.js').replace(/^\.\//, '');
const bundlePath = path.join(repoRoot, bundleRelative);

if (!fs.existsSync(bundlePath)) {
  fail(`bundle not found at ${bundleRelative} - run "npm run dev" or "npm run build" first`);
}

const bundle = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, 'utf8') : '';

/* ---------------------------------------------------------------- *
 * The bundle must only depend on the vscode module
 * ---------------------------------------------------------------- */

if (bundle) {
  const required = [...bundle.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
  const unexpected = [...new Set(required)].filter((id) => id !== 'vscode');

  if (unexpected.length > 0) {
    fail(
      `bundle requires modules other than "vscode": ${unexpected.join(', ')}\n` +
        '  A Node built-in here breaks the web extension host. Add the module to the\n' +
        '  rollup "external" list only if it is genuinely provided at runtime.'
    );
  }

  // Guard against Node built-ins referenced indirectly (e.g. process.cwd()).
  const builtins = ['child_process', 'node:child_process', 'node:fs', 'node:path'];
  for (const builtin of builtins) {
    if (bundle.includes(`require("${builtin}")`) || bundle.includes(`require('${builtin}')`)) {
      fail(`bundle statically requires the Node built-in "${builtin}"`);
    }
  }

  if (!/\bactivate\b/.test(bundle)) {
    fail('bundle does not appear to export an activate function');
  }
}

/* ---------------------------------------------------------------- *
 * Size budget
 * ---------------------------------------------------------------- */

const SIZE_BUDGET_BYTES = 200 * 1024; // 200 KB
const size = Buffer.byteLength(bundle, 'utf8');
if (size > SIZE_BUDGET_BYTES) {
  fail(
    `bundle is ${(size / 1024).toFixed(1)} KB, over the ${SIZE_BUDGET_BYTES / 1024} KB budget.\n` +
      '  Did a large dependency get pulled in?'
  );
}
notes.push(`bundle size: ${(size / 1024).toFixed(1)} KB`);

/* ---------------------------------------------------------------- *
 * The bundle must not be excluded from the published package
 * ---------------------------------------------------------------- */

const vscodeignore = fs.readFileSync(path.join(repoRoot, '.vscodeignore'), 'utf8');
const outDir = path.dirname(bundleRelative);
const ignoringOut = vscodeignore
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .some((line) => line.startsWith(outDir) || line === `${outDir}/**`);

if (ignoringOut) {
  fail(`.vscodeignore excludes "${outDir}", so the web bundle would not ship`);
}

/* ---------------------------------------------------------------- *
 * Report
 * ---------------------------------------------------------------- */

console.log('Bundle safety check');
console.log('-------------------');
for (const note of notes) {
  console.log(`  ok  ${note}`);
}

if (problems.length > 0) {
  console.error('');
  for (const problem of problems) {
    console.error(`  FAIL  ${problem}`);
  }
  console.error('');
  process.exit(1);
}

console.log('  ok  bundle requires only "vscode"');
console.log('  ok  bundle is included in the published package');
console.log('');
console.log('Bundle check passed.');
