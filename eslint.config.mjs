import js from '@eslint/js';
import globals from 'globals';

// The extension is CommonJS, ships untranspiled to VS Code, and must also run in
// a web extension host, so the lint rules focus on real risks (accidental
// globals, shadowing, unreachable code) rather than stylistic preferences.
export default [
  {
    ignores: [
      'node_modules/**',
      'out/**',
      'coverage/**',
      'dist/**',
      '.vscode-test/**',
      'test-results/**',
      // Vendored, third-party bundle. Reviewed as a dependency, not as source.
      'yaml.js',
      // Upstream full copy of the UUID library; unused by the build.
      'uuid-org.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-undef': 'error',
      // The extension sources are deliberately untranspiled CommonJS ES5-style
      // code that must also run in a web extension host. Modernising variable
      // declarations is a separate, behaviour-affecting change, so the style
      // rules stay as warnings rather than being enforced here.
      'no-var': 'off',
      'prefer-const': 'off',
      eqeqeq: ['warn', 'smart'],
      'no-console': 'off',
    },
  },
  {
    // The two intentional empty blocks are documented no-ops in third-party
    // derived algorithms; the surrounding comment explains each. Keep the rule on
    // everywhere else so accidental empty blocks are still caught.
    files: ['utils.js'],
    rules: {
      'no-empty': 'off',
    },
  },
  {
    files: ['rollup.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // The integration test file is ESM-ish and uses the mocha globals that the
    // VS Code test runner injects.
    files: ['test/integration/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
  {
    // Unit tests run under Vitest with globals enabled.
    files: ['test/unit/**/*.js', 'test/helpers/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
  {
    // Config files and scripts are ESM modules.
    files: ['*.mjs', 'scripts/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
