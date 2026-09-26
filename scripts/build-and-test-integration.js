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
const isWindows = process.platform === 'win32';

/**
 * On Windows, `npm` is `npm.cmd`, and spawning a .cmd shim without a shell fails
 * with EINVAL. Everything else runs shell-free, which keeps arguments safe from
 * shell interpretation.
 */
function run(command, args, options = {}) {
  const needsShell = isWindows;
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
    shell: needsShell,
    ...options,
  });
  if (result.error) {
    console.error(`Failed to launch ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// 1. The integration tests load the extension through package.json "main", which
//    requires ./out/extension-common to exist, so the build must come first.
run(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev']);

// 2. Run @vscode/test-electron, wrapped in a virtual framebuffer on headless
//    Linux CI because the Extension Host needs a display.
const vscodeTest = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  isWindows ? 'vscode-test.cmd' : 'vscode-test'
);

if (isCI && isLinux && !process.env.DISPLAY) {
  run('xvfb-run', ['-a', '-s', '-screen 0 1024x768x24', vscodeTest]);
} else {
  const extra = isLinux && isRoot ? ['--no-sandbox', '--disable-gpu'] : [];
  if (extra.length > 0) {
    process.env.ELECTRON_DISABLE_SANDBOX = '1';
  }
  run(vscodeTest, extra);
}
