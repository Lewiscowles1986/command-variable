'use strict';

/**
 * Integration tests, executed inside a real VS Code Extension Host.
 *
 * The extension id is derived from package.json so this does not break when the
 * publisher or name changes. Every assertion here is about activation and wiring
 * (the things a unit test with a stubbed host cannot prove); behavioural logic
 * lives in the unit suite.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const vscode = require('vscode');

const manifest = require(path.join(__dirname, '..', '..', 'package.json'));
const extensionId = `${manifest.publisher}.${manifest.name}`;

/** Commands generated in a loop, which are not listed individually in the manifest. */
function generatedCommandIds() {
  const ids = [];
  for (let n = 1; n <= 5; n += 1) {
    for (const suffix of ['', 'Posix']) {
      ids.push(`extension.commandvariable.file.fileDirname${n}Up${suffix}`);
      ids.push(`extension.commandvariable.file.relativeFileDirname${n}Up${suffix}`);
    }
    ids.push(`extension.commandvariable.workspace.folder${n}Up`);
    ids.push(`extension.commandvariable.workspace.folder${n}UpPosix`);
  }
  for (let n = 0; n <= 5; n += 1) {
    const up = n === 0 ? '' : `${n}Up`;
    ids.push(`extension.commandvariable.file.fileDirBasename${up}`);
    ids.push(`extension.commandvariable.workspace.folderBasename${up}`);
  }
  return ids;
}

suite('Command Variable extension (integration)', () => {
  let extension;

  suiteSetup(async () => {
    extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension, `extension ${extensionId} should be discoverable`);
    await extension.activate();
  });

  test('activates without throwing', () => {
    assert.equal(extension.isActive, true);
  });

  test('registers every declared activation event', async () => {
    const available = new Set(await vscode.commands.getCommands(true));
    const declared = manifest.activationEvents
      .map((event) => event.replace(/^onCommand:/, ''))
      .filter((id) => !id.includes('$'));

    const missing = declared.filter((id) => !available.has(id));
    assert.deepEqual(missing, [], 'activation events with no registered command');
  });

  test('registers the generated numbered command families', async () => {
    const available = new Set(await vscode.commands.getCommands(true));
    const missing = generatedCommandIds().filter((id) => !available.has(id));
    assert.deepEqual(missing, [], 'generated commands missing at runtime');
  });

  test('executes a command that needs no editor', async () => {
    const separator = await vscode.commands.executeCommand('extension.commandvariable.dirSep');
    assert.ok(separator === '/' || separator === '\\', `unexpected dir separator: ${separator}`);
  });

  test('generates a v4 UUID through the real command pipeline', async () => {
    const value = await vscode.commands.executeCommand(
      'extension.commandvariable.UUID',
      { output: 'hexString', use: 'new' }
    );
    assert.match(
      value,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      `not a v4 UUID: ${value}`
    );
  });

  test('reports a non-zero number within the requested range', async () => {
    const value = await vscode.commands.executeCommand('extension.commandvariable.number', {
      name: 'integration',
      range: [1, 10],
    });
    const number = Number(value);
    assert.ok(number >= 1 && number <= 10, `number out of range: ${value}`);
  });

  test('contributes its configuration properties', () => {
    const config = vscode.workspace.getConfiguration('commandvariable');
    const declared = Object.keys(manifest.contributes.configuration.properties);
    for (const key of declared) {
      const shortKey = key.replace(/^commandvariable\./, '');
      // Reading must not throw, whatever the value happens to be.
      assert.doesNotThrow(() => config.get(shortKey));
    }
  });
});
