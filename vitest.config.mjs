import { defineConfig } from 'vitest/config';

// `vscode` is resolved from the generated shim at node_modules/vscode, created
// by scripts/install-vscode-stub.js (wired into the postinstall script). That is
// preferred over a resolve.alias here because Vitest externalises CommonJS
// dependencies, so the untransformed require('vscode') calls inside the sources
// would bypass an alias.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/unit/**/*.test.js'],
    setupFiles: ['test/unit/test-setup.js'],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: {
      junit: 'test-results/unit.xml',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text-summary', 'lcov', 'json-summary'],
      include: ['utils.js', 'extension-common.js', 'uuid.js'],
      exclude: ['test/**', 'yaml.js', 'node_modules/**'],
      // Set just below the level reached when the suite was introduced, so
      // coverage can be ratcheted up but never silently regresses. Re-measure
      // with `npm run test:coverage` after upgrading Vitest: the v8 provider
      // counts branches differently between major versions.
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 74,
        branches: 48,
      },
    },
  },
});
