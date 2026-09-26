'use strict';

/**
 * Shared test helpers: a fake ExtensionContext and fake TextEditors.
 *
 * Keeping these in one place means the tests assert on behaviour rather than
 * re-inventing VS Code plumbing in every file.
 */

const { Uri, Position, Range, Selection } = require('vscode');

/**
 * A minimal ExtensionContext with working in-memory Memento stores.
 * `workspaceState` and `globalState` implement get/update the way VS Code does.
 */
function createContext(initial = {}) {
  const makeMemento = (seed = {}) => {
    let store = new Map(Object.entries(seed));
    return {
      get(key, defaultValue) {
        return store.has(key) ? store.get(key) : defaultValue;
      },
      update(key, value) {
        if (value === undefined) {
          store.delete(key);
        } else {
          store.set(key, value);
        }
        return Promise.resolve();
      },
      keys() {
        return [...store.keys()];
      },
      __set(key, value) {
        store.set(key, value);
      },
      __dump() {
        return Object.fromEntries(store);
      },
    };
  };

  return {
    subscriptions: [],
    extensionPath: '/fake/extension',
    extensionUri: Uri.file('/fake/extension'),
    globalState: makeMemento(initial.globalState),
    workspaceState: makeMemento(initial.workspaceState),
    secrets: {
      get: () => Promise.resolve(undefined),
      store: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    },
    extension: { id: 'rioj7.command-variable', packageJSON: {} },
  };
}

/**
 * Build a fake TextEditor around a single-line-per-entry document.
 *
 * @param {string[]} lines document content
 * @param {object}   [opts]
 * @param {string}   [opts.fsPath]
 * @param {(sel: Selection) => any} [opts.offsetAt] optional offset override
 */
function createEditor(lines, opts = {}) {
  const text = lines.join('\n');
  const fsPath = opts.fsPath || '/work/file.txt';
  const uri = Uri.file(fsPath);

  const offsetAt = (position) => {
    let offset = 0;
    for (let index = 0; index < position.line; index += 1) {
      offset += lines[index].length + 1; // + newline
    }
    return offset + position.character;
  };

  const toPosition = (offset) => {
    let remaining = offset;
    for (let line = 0; line < lines.length; line += 1) {
      if (remaining <= lines[line].length) {
        return new Position(line, remaining);
      }
      remaining -= lines[line].length + 1;
    }
    const last = lines.length - 1;
    return new Position(last, lines[last].length);
  };

  const selections = [];
  const editor = {
    document: {
      uri,
      fsPath,
      fileName: fsPath,
      lineCount: lines.length,
      getText(range) {
        if (!range) {
          return text;
        }
        return text.substring(
          offsetAt(range.start),
          offsetAt(range.end)
        );
      },
      lineAt(line) {
        const value = lines[line] ?? '';
        return { text: value, lineNumber: line, range: new Range(new Position(line, 0), new Position(line, value.length)) };
      },
      offsetAt,
      positionAt: toPosition,
      getWordRangeAtPosition() {
        return undefined;
      },
    },
    get selection() {
      return selections[0] ?? new Selection(new Position(0, 0), new Position(0, 0));
    },
    set selection(value) {
      selections.length = 0;
      selections.push(value);
    },
    get selections() {
      return selections;
    },
    set selections(value) {
      selections.length = 0;
      selections.push(...value);
    },
    options: {},
    edit() {
      return Promise.resolve(true);
    },
    // convenience for tests
    __lines: lines,
  };

  return editor;
}

/** Create a workspace folder descriptor for the stub. */
function createFolder(name, fsPath) {
  return { name, index: 0, uri: Uri.file(fsPath) };
}

/** Shorthand for "select this text" selections over a single-line document. */
function selectAll(editor, line = 0) {
  const length = editor.__lines[line].length;
  editor.selection = new Selection(new Position(line, 0), new Position(line, length));
  return editor;
}

module.exports = {
  createContext,
  createEditor,
  createFolder,
  selectAll,
  Uri,
  Position,
  Range,
  Selection,
};
