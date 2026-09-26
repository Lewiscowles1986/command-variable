'use strict';

/**
 * Builds the extension and runs the integration tests in a real Extension Host.
 *
 * @vscode/test-electron refuses to run as root, and Linux CI needs a display, so
 * this wrapper handles both cases instead of leaving them to the caller.
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const isCI = Boolean(process.env.CI);
const isLinux = process.platform === 'linux';
const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;

function run(command, args, options = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// 1. The integration tests load the extension through package.json "main", which
//    requires ./out/extension-common to exist, so the build must come first.
run('npm', ['run', 'dev']);

// 2. Assemble the vscode-test argument list.
const args = [];

if (isCI && isLinux && !process.env.DISPLAY) {
  // Headless Linux: wrap the run in a virtual framebuffer.
  args.push('xvfb-run', '-a', '-s', '-screen 0 1024x768x24');
}

args.push('vscode-test');

if (isLinux && isRoot) {
  // Electron cannot use its sandbox as root.
  args.push('--no-sandbox', '--disable-gpu');
  process.env.ELECTRON_DISABLE_SANDBOX = '1';
}

const [command, ...commandArgs] = args;
const useLocalBinary = command === 'vscode-test';
run(useLocalBinary ? path.join(repoRoot, 'node_modules', '.bin', command) : command, commandArgs, {
  shell: !useLocalBinary,
});
