'use strict';

/**
 * Minimal in-memory stand-in for the `vscode` module.
 *
 * The extension sources do `const vscode = require('vscode')` at module scope,
 * which normally makes them impossible to load outside the Extension Host. In
 * tests we alias the `vscode` specifier to this file (see `test/unit/test-setup.js`),
 * so pure logic can be exercised in-process, in milliseconds.
 *
 * Only the surface actually used by this extension is implemented. Anything the
 * extension starts using later should be added here deliberately, so the stub
 * doubles as a reviewable record of the extension's API footprint.
 */

const path = require('path');

/* ------------------------------------------------------------------ *
 * Uri
 * ------------------------------------------------------------------ */

class Uri {
  constructor(scheme, authority, fsPath, query, fragment) {
    this.scheme = scheme;
    this.authority = authority || '';
    this.path = fsPath;
    this.fsPath = fsPath;
    this.query = query || '';
    this.fragment = fragment || '';
  }

  static file(p) {
    return new Uri('file', '', path.resolve(p));
  }

  static parse(value) {
    const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?(.*)$/.exec(value);
    if (!match) {
      return Uri.file(value);
    }
    const scheme = match[1];
    const rest = match[3];
    const uri = new Uri(scheme, '', rest);
    uri.path = rest;
    uri.fsPath = scheme === 'file' ? path.resolve(rest) : rest;
    return uri;
  }

  toString() {
    return `${this.scheme}://${this.authority}${this.path}`;
  }

  toJSON() {
    return { scheme: this.scheme, path: this.path };
  }

  with(change) {
    return new Uri(
      change.scheme ?? this.scheme,
      change.authority ?? this.authority,
      change.path ?? this.path,
      change.query ?? this.query,
      change.fragment ?? this.fragment
    );
  }
}

/* ------------------------------------------------------------------ *
 * EventEmitter
 * ------------------------------------------------------------------ */

class EventEmitter {
  constructor() {
    this.listeners = [];
    this.event = (listener) => {
      this.listeners.push(listener);
      return {
        dispose: () => {
          this.listeners = this.listeners.filter((l) => l !== listener);
        },
      };
    };
  }

  fire(value) {
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  dispose() {
    this.listeners = [];
  }
}

/* ------------------------------------------------------------------ *
 * Disposable
 * ------------------------------------------------------------------ */

class Disposable {
  constructor(callOnDispose) {
    this.callOnDispose = callOnDispose;
  }

  static from(...disposables) {
    return new Disposable(() => {
      for (const d of disposables) {
        if (d && typeof d.dispose === 'function') {
          d.dispose();
        }
      }
    });
  }

  dispose() {
    if (this.callOnDispose) {
      this.callOnDispose();
    }
    this.callOnDispose = undefined;
  }
}

/* ------------------------------------------------------------------ *
 * Mutable test knobs
 * ------------------------------------------------------------------ */

/**
 * Responses returned by the `window.show*` family. Tests set these with
 * `vscodeStub.__setResponse('showQuickPick', value)`.
 */
const responses = {
  showQuickPick: undefined,
  showInputBox: undefined,
  showOpenDialog: undefined,
  showSaveDialog: undefined,
  showWorkspaceFolderPick: undefined,
  showErrorMessage: undefined,
  showInformationMessage: undefined,
  clipboardText: '',
  configuration: {},
  workspaceFolders: undefined,
  findFiles: [],
  activeTextEditor: undefined,
};

/** Ordered record of every call made through the stub. */
const calls = [];

function record(name, args) {
  calls.push({ name, args });
}

function response(pick, fallback) {
  const value = responses[pick];
  return typeof value === 'function' ? value(...fallback) : value;
}

/* ------------------------------------------------------------------ *
 * Window
 * ------------------------------------------------------------------ */

const window = {
  get activeTextEditor() {
    return responses.activeTextEditor;
  },
  showErrorMessage(message) {
    record('window.showErrorMessage', [message]);
    return Promise.resolve(response('showErrorMessage', [message]));
  },
  showInformationMessage(message) {
    record('window.showInformationMessage', [message]);
    return Promise.resolve(response('showInformationMessage', [message]));
  },
  showInputBox(options) {
    record('window.showInputBox', [options]);
    return Promise.resolve(response('showInputBox', [options]));
  },
  showQuickPick(items, options) {
    record('window.showQuickPick', [items, options]);
    return Promise.resolve(response('showQuickPick', [items, options]));
  },
  showOpenDialog(options) {
    record('window.showOpenDialog', [options]);
    return Promise.resolve(response('showOpenDialog', [options]));
  },
  showSaveDialog(options) {
    record('window.showSaveDialog', [options]);
    return Promise.resolve(response('showSaveDialog', [options]));
  },
  showWorkspaceFolderPick(options) {
    record('window.showWorkspaceFolderPick', [options]);
    return Promise.resolve(response('showWorkspaceFolderPick', [options]));
  },
  createOutputChannel(name) {
    record('window.createOutputChannel', [name]);
    return { appendLine() {}, append() {}, show() {}, hide() {}, dispose() {} };
  },
  onDidChangeActiveTextEditor: new EventEmitter().event,
  onDidChangeTextEditorSelection: new EventEmitter().event,
  visibleTextEditors: [],
};

/* ------------------------------------------------------------------ *
 * Workspace
 * ------------------------------------------------------------------ */

const inMemoryFs = new Map();

const workspace = {
  get workspaceFolders() {
    return responses.workspaceFolders;
  },
  get rootPath() {
    const folders = responses.workspaceFolders;
    return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
  },
  getConfiguration(section) {
    record('workspace.getConfiguration', [section]);
    const config = responses.configuration[section] || {};
    return {
      get(key, defaultValue) {
        return Object.prototype.hasOwnProperty.call(config, key) ? config[key] : defaultValue;
      },
      has(key) {
        return Object.prototype.hasOwnProperty.call(config, key);
      },
      update() {
        return Promise.resolve();
      },
      inspect() {
        return undefined;
      },
    };
  },
  getWorkspaceFolder(uri) {
    record('workspace.getWorkspaceFolder', [uri]);
    const folders = responses.workspaceFolders || [];
    const target = uri && uri.fsPath ? uri.fsPath : String(uri);
    return folders.find((folder) => {
      const base = folder.uri.fsPath;
      return target === base || target.startsWith(base + path.sep);
    });
  },
  getWorkspaceFolderForPath(p) {
    return workspace.getWorkspaceFolder(Uri.file(p));
  },
  findFiles(include) {
    record('workspace.findFiles', [include]);
    return Promise.resolve(response('findFiles', [include]) || []);
  },
  openTextDocument() {
    return Promise.resolve({ getText: () => '', uri: Uri.file('/virtual') });
  },
  onDidChangeConfiguration: new EventEmitter().event,
  onDidChangeWorkspaceFolders: new EventEmitter().event,
  onDidSaveTextDocument: new EventEmitter().event,
  fs: {
    readFile(uri) {
      record('workspace.fs.readFile', [uri]);
      if (!inMemoryFs.has(uri.fsPath)) {
        const error = new Error(`ENOENT: ${uri.fsPath}`);
        error.code = 'FileNotFound';
        return Promise.reject(error);
      }
      return Promise.resolve(Buffer.from(inMemoryFs.get(uri.fsPath), 'utf8'));
    },
    writeFile(uri, content) {
      record('workspace.fs.writeFile', [uri, content]);
      inMemoryFs.set(uri.fsPath, Buffer.from(content).toString('utf8'));
      return Promise.resolve();
    },
    stat(uri) {
      record('workspace.fs.stat', [uri]);
      if (!inMemoryFs.has(uri.fsPath)) {
        return Promise.reject(new Error(`ENOENT: ${uri.fsPath}`));
      }
      return Promise.resolve({ size: inMemoryFs.get(uri.fsPath).length });
    },
    delete(uri) {
      inMemoryFs.delete(uri.fsPath);
      return Promise.resolve();
    },
    createDirectory() {
      return Promise.resolve();
    },
  },
};

/* ------------------------------------------------------------------ *
 * Commands
 * ------------------------------------------------------------------ */

const registeredCommands = new Map();

const commands = {
  registerCommand(id, handler) {
    record('commands.registerCommand', [id]);
    registeredCommands.set(id, handler);
    return new Disposable(() => registeredCommands.delete(id));
  },
  registerTextEditorCommand(id, handler) {
    record('commands.registerTextEditorCommand', [id]);
    registeredCommands.set(id, handler);
    return new Disposable(() => registeredCommands.delete(id));
  },
  executeCommand(id, ...args) {
    record('commands.executeCommand', [id, ...args]);
    const handler = registeredCommands.get(id);
    if (!handler) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(handler(...args));
  },
  getCommands() {
    return Promise.resolve([...registeredCommands.keys()]);
  },
};

/* ------------------------------------------------------------------ *
 * Env
 * ------------------------------------------------------------------ */

const env = {
  clipboard: {
    readText() {
      record('env.clipboard.readText', []);
      return Promise.resolve(responses.clipboardText);
    },
    writeText(text) {
      record('env.clipboard.writeText', [text]);
      responses.clipboardText = text;
      return Promise.resolve();
    },
  },
  appName: 'Visual Studio Code',
  machineId: 'stub-machine-id',
  openExternal() {
    return Promise.resolve(true);
  },
};

/* ------------------------------------------------------------------ *
 * Misc
 * ------------------------------------------------------------------ */

class RelativePattern {
  constructor(base, pattern) {
    this.base = base;
    this.pattern = pattern;
  }
}

class Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }

  compareTo(other) {
    if (this.line !== other.line) {
      return this.line < other.line ? -1 : 1;
    }
    if (this.character !== other.character) {
      return this.character < other.character ? -1 : 1;
    }
    return 0;
  }

  isEqual(other) {
    return this.compareTo(other) === 0;
  }

  isBefore(other) {
    return this.compareTo(other) < 0;
  }

  isAfter(other) {
    return this.compareTo(other) > 0;
  }

  translate(lineDelta = 0, characterDelta = 0) {
    return new Position(
      this.line + lineDelta,
      this.character + characterDelta
    );
  }

  with(line, character) {
    return new Position(line ?? this.line, character ?? this.character);
  }
}

class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  get isEmpty() {
    return this.start.isEqual(this.end);
  }

  contains(position) {
    return !position.isBefore(this.start) && !position.isAfter(this.end);
  }
}

class Selection extends Range {
  constructor(anchor, active) {
    super(anchor, active);
    this.anchor = anchor;
    this.active = active;
  }

  get isReversed() {
    return this.anchor.line > this.active.line;
  }
}

const StatusBarAlignment = { Left: 1, Right: 2 };
const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 };
const ExtensionMode = { Production: 1, Development: 2, Test: 3 };
const ViewColumn = { Active: -1, One: 1, Two: 2 };
const ProgressLocation = { SourceControl: 1, Window: 10, Notification: 15 };

/* ------------------------------------------------------------------ *
 * Test control surface
 * ------------------------------------------------------------------ */

const api = {
  Uri,
  EventEmitter,
  Disposable,
  RelativePattern,
  Position,
  Range,
  Selection,
  StatusBarAlignment,
  ConfigurationTarget,
  ExtensionMode,
  ViewColumn,
  ProgressLocation,
  window,
  workspace,
  commands,
  env,
  version: '1.100.0-stub',

  /* --- helpers used only by tests --- */

  /** Direct access to the mutable knob bag. */
  __responses: responses,

  /** Set one response knob, e.g. `__setResponse('clipboardText', 'hi')`. */
  __setResponse(name, value) {
    if (!Object.prototype.hasOwnProperty.call(responses, name)) {
      throw new Error(`Unknown vscode stub response: ${name}`);
    }
    responses[name] = value;
  },

  /** All recorded calls, optionally filtered by name. */
  __calls(name) {
    return name ? calls.filter((call) => call.name === name) : calls.slice();
  },

  /** Command ids most recently registered through the stub. */
  __registeredCommands() {
    return [...registeredCommands.keys()];
  },

  /** Invoke a registered command handler directly. */
  __invoke(id, ...args) {
    const handler = registeredCommands.get(id);
    if (!handler) {
      throw new Error(`Command not registered: ${id}`);
    }
    return handler(...args);
  },

  /** Seed the in-memory workspace.fs backing store. */
  __writeFile(fsPath, content) {
    inMemoryFs.set(fsPath, content);
  },

  /** Return everything to a pristine state between tests. */
  __reset() {
    calls.length = 0;
    registeredCommands.clear();
    inMemoryFs.clear();
    responses.showQuickPick = undefined;
    responses.showInputBox = undefined;
    responses.showOpenDialog = undefined;
    responses.showSaveDialog = undefined;
    responses.showWorkspaceFolderPick = undefined;
    responses.showErrorMessage = undefined;
    responses.showInformationMessage = undefined;
    responses.clipboardText = '';
    responses.configuration = {};
    responses.workspaceFolders = undefined;
    responses.findFiles = [];
    responses.activeTextEditor = undefined;
  },
};

module.exports = api;
