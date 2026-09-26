import { defineConfig } from '@vscode/test-cli';

/**
 * Integration tests run inside a real VS Code Extension Host.
 *
 * These are deliberately few and focused: they exist to prove the extension
 * activates, registers its full command surface, and survives the packaged
 * entry point (which requires `./out/extension-common`, produced by rollup).
 *
 * All behavioural logic is covered by the much faster unit suite in test/unit.
 */
export default defineConfig({
  files: 'test/integration/**/*.test.js',
  version: 'stable',
  workspaceFolder: 'test/fixtures/workspace',
  mocha: {
    ui: 'bdd',
    timeout: 60000,
    color: true,
  },
  launchArgs: [
    '--disable-extensions',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=.vscode-test/user-data',
  ],
  coverage: {
    include: ['out/**/*.js'],
    exclude: ['out/**/*.test.js', '**/test/**'],
    reporter: ['text-summary', 'lcov'],
    reportsDirectory: 'coverage/integration',
  },
});
