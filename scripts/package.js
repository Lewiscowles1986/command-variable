'use strict';

/**
 * Builds and packages the extension into dist/.
 *
 * A dedicated script rather than `mkdir -p && vsce package` in package.json,
 * because that shell syntax is not portable to Windows, where npm scripts run
 * under cmd.exe.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const manifest = require(path.join(repoRoot, 'package.json'));
const outDir = path.join(repoRoot, 'dist');
const outFile = path.join(outDir, `${manifest.name}-${manifest.version}.vsix`);

fs.mkdirSync(outDir, { recursive: true });

const vsceBin = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vsce.cmd' : 'vsce'
);

const args = ['package', '--out', outFile];

const result = spawnSync(vsceBin, args, {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const size = fs.statSync(outFile).size;
console.log('');
console.log(`Packaged ${path.relative(repoRoot, outFile)} (${(size / 1024).toFixed(1)} KB)`);
