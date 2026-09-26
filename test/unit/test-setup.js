'use strict';

/**
 * Shared Vitest setup.
 *
 * The `vscode` specifier is aliased to `test/helpers/vscode-stub.js` in
 * `vitest.config.mjs`, so sources that `require('vscode')` load cleanly here.
 * This file just guarantees each test starts from a clean stub.
 */

const vscode = require('vscode');

if (typeof beforeEach === 'function') {
  beforeEach(() => {
    vscode.__reset();
  });
}
