'use strict';

/**
 * Behaviour tests for extension-common.js.
 *
 * `extension-common.js` keeps a surprising amount of state at module scope
 * (the remember store, the deprecation flags, the ExtensionContext). We reset
 * modules between tests so each case starts from a known state, then re-seed
 * the context by activating, exactly as VS Code would.
 */

const { createContext, createFolder } = require('../helpers/fixtures');

const vscode = require('vscode');

/** Load a fresh copy of the module so module-level state cannot leak. */
function loadCommon() {
  vi.resetModules();
  vi.doMock('vscode', () => require('../helpers/vscode-stub'));
  return require('../../extension-common');
}

/** Activate a fresh module with a fresh context, as the Extension Host would. */
function activateFresh() {
  const common = loadCommon();
  const context = createContext();
  common.activate(context);
  return { common, context };
}

describe('pure helpers', () => {
  let common;
  beforeEach(() => {
    common = loadCommon();
  });

  it('exposes the documented URI postfix sentinel', () => {
    expect(common.PostfixURI).toBe('@URI@');
  });

  describe('checkIfArgsIsLaunchConfig', () => {
    it('ignores undefined args', () => {
      expect(common.checkIfArgsIsLaunchConfig(undefined)).toBeUndefined();
    });

    it('ignores a real launch config (identified by request)', () => {
      expect(common.checkIfArgsIsLaunchConfig({ request: 'launch', name: 'x' })).toBeUndefined();
    });

    it('passes through a genuine args object', () => {
      const args = { name: 'x' };
      expect(common.checkIfArgsIsLaunchConfig(args)).toBe(args);
    });
  });

  describe('getExpressionFunction', () => {
    it('builds a function from an expression', () => {
      const fn = common.getExpressionFunction('content.toUpperCase()', 'cmd');
      expect(fn('ab')).toBe('AB');
    });

    it('exposes contentExt as the second parameter', () => {
      const fn = common.getExpressionFunction('contentExt + content', 'cmd');
      expect(fn('a', 'b')).toBe('ba');
    });

    it('reports incomplete expressions instead of throwing', () => {
      const fn = common.getExpressionFunction('(', 'myCmd');
      expect(fn).toBeUndefined();
      const messages = vscode.__calls('window.showErrorMessage');
      expect(messages).toHaveLength(1);
      expect(messages[0].args[0]).toMatch(/myCmd: Incomplete expression/);
    });
  });

  describe('getNamedWorkspaceFolder', () => {
    const folder = createFolder('one', '/proj/one');

    it('returns the folder when it is the only one and no name is given', () => {
      vscode.__setResponse('workspaceFolders', [folder]);
      expect(common.getNamedWorkspaceFolder('', folder, undefined)).toBe(folder);
    });

    it('requires a name when several folders are open', () => {
      vscode.__setResponse('workspaceFolders', [folder, createFolder('two', '/proj/two')]);
      expect(common.getNamedWorkspaceFolder('', folder, undefined)).toBeUndefined();
      expect(vscode.__calls('window.showErrorMessage')[0].args[0]).toMatch(/Use the name/);
    });

    it('finds a folder by name', () => {
      const two = createFolder('two', '/proj/two');
      vscode.__setResponse('workspaceFolders', [folder, two]);
      expect(common.getNamedWorkspaceFolder('two', folder, undefined)).toBe(two);
    });

    it('reports an unknown folder name', () => {
      vscode.__setResponse('workspaceFolders', [folder]);
      expect(common.getNamedWorkspaceFolder('nope', folder, undefined)).toBeUndefined();
      expect(vscode.__calls('window.showErrorMessage')[0].args[0]).toMatch(/Workspace not found/);
    });
  });
});

describe('remember store', () => {
  let common;

  beforeEach(() => {
    common = loadCommon();
  });

  it('starts with the documented sentinel values', () => {
    expect(common.getRememberKey('__not_yet')).toBe("I don't remember");
    expect(common.getRememberKey('empty')).toBe('');
    expect(common.getRememberKey('__zero')).toBe('0');
  });

  it('stores and reads back a value', () => {
    expect(common.storeStringRemember2({ key: 'greeting' }, 'hello')).toBe('hello');
    expect(common.getRememberKey('greeting')).toBe('hello');
  });

  it('falls back to the not-yet default for unknown keys', () => {
    expect(common.getRememberKey('never-set')).toBe("I don't remember");
  });

  it('uses an explicit default when provided', () => {
    expect(common.getRememberKey('never-set', undefined, 'fallback')).toBe('fallback');
  });

  it('appends with the configured delimiter', () => {
    common.storeStringRemember2({ key: 'list' }, 'a');
    common.storeStringRemember2({ key: 'list' }, { action: 'append', text: 'b', delimiter: ',' });
    expect(common.getRememberKey('list')).toBe('a,b');
  });

  it('prepends with the configured delimiter', () => {
    common.storeStringRemember2({ key: 'list' }, 'b');
    common.storeStringRemember2({ key: 'list' }, { action: 'prepend', text: 'a', delimiter: ',' });
    expect(common.getRememberKey('list')).toBe('a,b');
  });

  it('appends without a delimiter when the current value is empty', () => {
    common.storeStringRemember2({ key: 'list' }, '');
    common.storeStringRemember2({ key: 'list' }, { action: 'append', text: 'b', delimiter: ',' });
    expect(common.getRememberKey('list')).toBe('b');
  });

  it('forgets a key on request', () => {
    // `action: 'forget'` is only honoured for the edit-action object form,
    // which requires a `text` property alongside the action.
    common.storeStringRemember2({ key: 'gone' }, 'value');
    common.storeStringRemember2({ key: 'gone' }, { action: 'forget', text: '' });
    expect(common.getRememberKey('gone')).toBe("I don't remember");
  });

  it('refuses to overwrite the reserved built-in keys', () => {
    common.storeStringRemember2({ key: 'empty' }, 'hijacked');
    expect(common.getRememberKey('empty')).toBe('');
  });

  it('stores several keys at once and returns the nominated one', () => {
    common.storeStringRemember2(
      { key: 'unused' },
      { __key: 'chosen', alpha: 'one', beta: 'two' }
    );
    expect(common.getRememberKey('alpha')).toBe('one');
    expect(common.getRememberKey('beta')).toBe('two');
  });

  it('hands the nominated __key back to the caller', () => {
    const result = common.storeStringRemember2(
      { key: 'unused', default: 'unused-default' },
      { __key: 'alpha', alpha: 'one' }
    );
    expect(result).toBe('one');
  });

  it('handles rememberCommand end to end', async () => {
    // Documented form: `store` is a plain key/value map.
    await common.rememberCommand({ store: { path: '/usr/bin' } });
    expect(common.getRememberKey('path')).toBe('/usr/bin');
  });

  it('stores each entry of a map-style store', async () => {
    await common.rememberCommand(
      { store: { path: '/usr/bin', name: 'boya', user: 'Mememe' } },
      async () => 'ignored-by-processor'
    );
    expect(common.getRememberKey('path')).toBe('/usr/bin');
    expect(common.getRememberKey('name')).toBe('boya');
    expect(common.getRememberKey('user')).toBe('Mememe');
  });
});

describe('escaped UI guard', () => {
  let common;

  beforeEach(() => {
    common = loadCommon();
  });

  it('records that the UI was escaped when undefined is stored', () => {
    expect(common.storeEscapedUI(undefined)).toBeUndefined();
    expect(common.checkEscapedUI({ checkEscapedUI: true })).toBe(true);
  });

  it('records that the UI was not escaped for a real result', () => {
    expect(common.storeEscapedUI('value')).toBe('value');
    expect(common.checkEscapedUI({ checkEscapedUI: true })).toBe(false);
  });

  it('is inert unless the checkEscapedUI property is set', () => {
    common.storeEscapedUI(undefined);
    expect(common.checkEscapedUI({})).toBe(false);
    expect(common.checkEscapedUI(undefined)).toBe(false);
  });
});

describe('pickStringRemember', () => {
  it('returns the picked value and remembers it', async () => {
    const { common } = activateFresh();
    vscode.__setResponse('showQuickPick', (items) => items[0]);

    const result = await common.pickStringRemember({ key: 'pick', options: ['alpha', 'beta'] });

    expect(result).toBe('alpha');
    expect(common.getRememberKey('pick')).toBe('alpha');
    expect(vscode.__calls('window.showQuickPick')).toHaveLength(1);
  });

  it('returns the default when the pick is dismissed', async () => {
    const { common } = activateFresh();
    vscode.__setResponse('showQuickPick', undefined);

    const result = await common.pickStringRemember({
      key: 'pick',
      options: ['alpha', 'beta'],
      default: 'beta',
    });

    expect(result).toBe('beta');
  });

  it('marks the quick pick as multi-select when requested', async () => {
    const { common } = activateFresh();
    vscode.__setResponse('showQuickPick', (items) => [items[0], items[1]]);

    await common.pickStringRemember({ key: 'pick', options: ['a', 'b'], multiPick: true });

    const [, options] = vscode.__calls('window.showQuickPick')[0].args;
    expect(options.canPickMany).toBe(true);
  });
});

describe('promptStringRemember', () => {
  it('stores the typed value', async () => {
    const { common } = activateFresh();
    vscode.__setResponse('showInputBox', 'typed');

    const result = await common.promptStringRemember({ key: 'prompt' });

    expect(result).toBe('typed');
    expect(common.getRememberKey('prompt')).toBe('typed');
  });

  it('pre-fills the box with the previously remembered value', async () => {
    const { common } = activateFresh();
    common.storeStringRemember2({ key: 'prompt' }, 'previous');
    vscode.__setResponse('showInputBox', 'next');

    await common.promptStringRemember({ key: 'prompt' });

    const [options] = vscode.__calls('window.showInputBox')[0].args;
    expect(options.value).toBe('previous');
  });
});

describe('activate (shared/web commands)', () => {
  it('registers the shared command surface', () => {
    activateFresh();
    const registered = vscode.__registeredCommands();
    expect(registered).toContain('extension.commandvariable.selectedText');
    expect(registered).toContain('extension.commandvariable.dateTime');
    expect(registered).toContain('extension.commandvariable.UUID');
    expect(registered).toContain('extension.commandvariable.getClipboard');
    expect(registered).toContain('extension.commandvariable.number');
  });

  it('generates a UUID v4 in hex form', () => {
    activateFresh();
    const uuid = vscode.__invoke('extension.commandvariable.UUID', { output: 'hexString' });
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('exposes the same UUID in the other documented formats', () => {
    activateFresh();
    const hex = vscode.__invoke('extension.commandvariable.UUID', { output: 'hexString', use: 'new' });
    const noDelim = vscode.__invoke('extension.commandvariable.UUID', { output: 'hexNoDelim', use: 'last' });
    const urn = vscode.__invoke('extension.commandvariable.UUID', { output: 'urn', use: 'last' });
    expect(noDelim).toBe(hex.replace(/-/g, ''));
    expect(urn).toBe(`urn:uuid:${hex}`);
  });

  it('formats the date using a template', () => {
    activateFresh();
    const value = vscode.__invoke('extension.commandvariable.dateTime', {
      locale: 'en-GB',
      options: { year: 'numeric', timeZone: 'UTC' },
      template: 'Y${year}',
    });
    expect(value).toMatch(/^Y\d{4}$/);
  });

  it('steps a counter through its range and wraps', () => {
    activateFresh();
    const next = () => vscode.__invoke('extension.commandvariable.number', { name: 'n', range: [1, 3] });
    expect([next(), next(), next(), next()]).toEqual(['1', '2', '3', '1']);
  });

  it('writes and reads the clipboard', async () => {
    activateFresh();
    await vscode.__invoke('extension.commandvariable.setClipboard', { text: 'copied' });
    await expect(vscode.__invoke('extension.commandvariable.getClipboard')).resolves.toBe('copied');
    expect(vscode.__calls('env.clipboard.writeText')[0].args[0]).toBe('copied');
  });

  it('reports the selection position as 1-based line/column', () => {
    activateFresh();
    const { createEditor, Position, Selection } = require('../helpers/fixtures');
    const editor = createEditor(['hello', 'world']);
    editor.selection = new Selection(new Position(1, 2), new Position(1, 4));
    vscode.__setResponse('activeTextEditor', editor);

    expect(vscode.__invoke('extension.commandvariable.selectionStartLineNumber')).toBe('2');
    expect(vscode.__invoke('extension.commandvariable.selectionStartColumnNumber')).toBe('3');
    expect(vscode.__invoke('extension.commandvariable.selectionEndLineNumber')).toBe('2');
    expect(vscode.__invoke('extension.commandvariable.selectionEndColumnNumber')).toBe('5');
  });

  it('returns "1" and warns when there is no active editor', () => {
    activateFresh();
    vscode.__setResponse('activeTextEditor', undefined);
    expect(vscode.__invoke('extension.commandvariable.selectionStartLineNumber')).toBe('1');
    expect(vscode.__calls('window.showErrorMessage')[0].args[0]).toMatch(/No editor/);
  });

  it('joins selected text from multiple selections with a separator', () => {
    activateFresh();
    const { createEditor, Position, Selection } = require('../helpers/fixtures');
    const editor = createEditor(['alpha', 'beta', 'gamma']);
    editor.selections = [
      new Selection(new Position(0, 0), new Position(0, 5)),
      new Selection(new Position(2, 0), new Position(2, 5)),
    ];
    vscode.__setResponse('activeTextEditor', editor);

    expect(vscode.__invoke('extension.commandvariable.selectedText', { separator: '|' })).toBe('alpha|gamma');
  });
});
