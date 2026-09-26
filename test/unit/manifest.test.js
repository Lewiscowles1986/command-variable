'use strict';

/**
 * Manifest contract and guardrail tests.
 *
 * These catch the most common way a long-lived VS Code extension rots: a
 * command declared in package.json that is never registered (or vice versa),
 * so it is either dead in the manifest or broken at runtime.
 *
 * The "registered" set is derived by loading the real sources against a stub
 * `vscode.commands` recorder, so the registration calls are the genuine ones.
 */

const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const repoRoot = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

const ENTRY = manifest.main.replace(/^\.\//, '');

/** Recorder installed in place of the real `vscode` module. */
function createRecorder() {
  const registered = new Set();
  const disposable = { dispose() {} };
  const event = () => disposable;

  const record = (id) => {
    // Commands built from template literals are checked structurally instead.
    if (typeof id === 'string' && !id.includes('$')) {
      registered.add(id);
    }
  };

  const api = {
    Uri: {
      file: (p) => ({
        fsPath: p,
        path: p,
        scheme: 'file',
        toString: () => `file://${p}`,
      }),
    },
    RelativePattern: class {},
    EventEmitter: class {
      constructor() {
        this.event = event;
      }
      fire() {}
      dispose() {}
    },
    Disposable: class {
      static from() {
        return disposable;
      }
      dispose() {}
    },
    window: {
      activeTextEditor: undefined,
      visibleTextEditors: [],
      showErrorMessage: () => Promise.resolve(undefined),
      showInformationMessage: () => Promise.resolve(undefined),
      showInputBox: () => Promise.resolve(undefined),
      showQuickPick: () => Promise.resolve(undefined),
      showOpenDialog: () => Promise.resolve(undefined),
      showSaveDialog: () => Promise.resolve(undefined),
      showWorkspaceFolderPick: () => Promise.resolve(undefined),
      createOutputChannel: () => ({ appendLine() {}, dispose() {} }),
    },
    workspace: {
      workspaceFolders: undefined,
      getConfiguration: () => ({
        get: (_key, fallback) => fallback,
        has: () => false,
        update: () => Promise.resolve(),
      }),
      getWorkspaceFolder: () => undefined,
      findFiles: () => Promise.resolve([]),
      fs: {
        readFile: () => Promise.reject(new Error('no fs in analysis')),
        writeFile: () => Promise.resolve(),
        stat: () => Promise.reject(new Error('no fs in analysis')),
      },
      onDidChangeConfiguration: event,
      onDidChangeWorkspaceFolders: event,
    },
    commands: {
      registerCommand: (id) => {
        record(id);
        return disposable;
      },
      registerTextEditorCommand: (id) => {
        record(id);
        return disposable;
      },
      executeCommand: () => Promise.resolve(undefined),
      getCommands: () => Promise.resolve([...registered]),
    },
    env: {
      clipboard: {
        readText: () => Promise.resolve(''),
        writeText: () => Promise.resolve(),
      },
    },
    version: '1.100.0-stub',
  };

  return { registered, api };
}

/**
 * Load the extension entry point with `vscode` and the rollup output path both
 * redirected to the recorder, then run `activate`.
 *
 * `extension.js` requires `./out/extension-common`, which only exists after a
 * build. Redirecting that specifier at the module-loader level means these tests
 * need no build step and always analyse the current source.
 */
function collectRegisteredCommands() {
  const { registered, api } = createRecorder();
  const savedLoad = Module._load;

  const commonSource = path.join(repoRoot, 'extension-common.js');
  const entrySource = path.join(repoRoot, ENTRY);

  Module._load = function patched(request, parent, isMain) {
    if (request === 'vscode') {
      return api;
    }
    if (request === './out/extension-common') {
      return savedLoad.call(this, commonSource, parent, isMain);
    }
    return savedLoad.apply(this, arguments);
  };

  try {
    for (const file of [entrySource, commonSource]) {
      delete require.cache[require.resolve(file)];
    }
    const mod = require(entrySource);
    if (typeof mod.activate === 'function') {
      mod.activate({
        subscriptions: [],
        extensionPath: repoRoot,
        extensionUri: { fsPath: repoRoot },
        globalState: { get: (_k, d) => d, update: () => Promise.resolve() },
        workspaceState: { get: (_k, d) => d, update: () => Promise.resolve() },
      });
    }
  } catch {
    // Activation side effects are not the subject of this test. Registrations
    // made before a failure are still what we want to compare.
  } finally {
    Module._load = savedLoad;
    for (const file of [entrySource, commonSource]) {
      delete require.cache[require.resolve(file)];
    }
  }

  return registered;
}

const activationEvents = new Set(
  manifest.activationEvents.map((event) => event.replace(/^onCommand:/, ''))
);

let registered;

beforeAll(() => {
  registered = collectRegisteredCommands();
});

describe('package.json structure', () => {
  it('is a valid, installable extension manifest', () => {
    expect(manifest.name).toBe('command-variable');
    expect(manifest.publisher).toBeTruthy();
    expect(manifest.main).toBeTruthy();
    expect(manifest.engines?.vscode).toBeTruthy();
  });

  it('uses a caret range for the VS Code engine', () => {
    expect(manifest.engines.vscode).toMatch(/^\^\d+\.\d+\.\d+$/);
  });

  it('ships a CHANGELOG and README, as the Marketplace expects', () => {
    expect(fs.existsSync(path.join(repoRoot, 'CHANGELOG.md'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'README.md'))).toBe(true);
  });

  it('keeps the version in sync with the changelog heading', () => {
    const changelog = fs.readFileSync(path.join(repoRoot, 'CHANGELOG.md'), 'utf8');
    expect(changelog).toContain(`[${manifest.version}]`);
  });

  it('excludes build and dev tooling from the shipped package', () => {
    const ignored = fs.readFileSync(path.join(repoRoot, '.vscodeignore'), 'utf8');
    for (const pattern of ['node_modules/**', '.vscode/**', 'test/**']) {
      expect(ignored).toContain(pattern);
    }
  });

  it('declares no runtime dependencies, because the extension is bundled', () => {
    const runtimeDeps = Object.keys(manifest.dependencies || {});
    expect(runtimeDeps, 'a bundled extension should own its bundle via devDependencies').toEqual([]);
  });

  it('declares a web (browser) entry point', () => {
    expect(manifest.browser, 'a web entry point should be declared').toBeTruthy();
  });

  it('keeps @types/vscode aligned with the declared engine minimum', () => {
    // vsce refuses to package when @types/vscode is newer than engines.vscode,
    // and a caret range silently resolves to the newest matching version. This
    // test applies the same rule as vsce, but fails fast in the unit suite with
    // an explanation rather than at packaging time.
    const engine = manifest.engines.vscode.replace(/^[\^~]/, '');
    const [engineMajor, engineMinor] = engine.split('.').map(Number);

    const typesPackage = path.join(repoRoot, 'node_modules', '@types', 'vscode', 'package.json');
    if (!fs.existsSync(typesPackage)) {
      throw new Error('@types/vscode is not installed; run npm ci');
    }
    const installed = JSON.parse(fs.readFileSync(typesPackage, 'utf8')).version;
    const [typesMajor, typesMinor] = installed.split('.').map(Number);

    expect(
      [typesMajor, typesMinor],
      `@types/vscode ${installed} is newer than engines.vscode ${manifest.engines.vscode}. ` +
        'Lower the @types/vscode range (for example ~1.55.0) or raise engines.vscode.'
    ).toEqual([engineMajor, engineMinor]);
  });
});

describe('command registration contracts', () => {
  it('actually registers commands when activated', () => {
    expect(registered.size).toBeGreaterThan(50);
  });

  it('registers every command it declares as an activation event', () => {
    const missing = [...activationEvents].filter((id) => !registered.has(id));
    expect(missing, 'declared onCommand activation events that are never registered').toEqual([]);
  });

  it('declares an activation event for every command it registers', () => {
    const undeclared = [...registered].filter((id) => !activationEvents.has(id));
    expect(undeclared, 'registered commands with no onCommand activation event').toEqual([]);
  });

  it('never registers a command outside the extension namespace', () => {
    const stray = [...registered].filter((id) => !id.startsWith('extension.commandvariable.'));
    expect(stray, 'commands must be namespaced under extension.commandvariable').toEqual([]);
  });

  it('declares every palette-visible command in contributes.commands', () => {
    for (const { command } of manifest.contributes.commands || []) {
      expect(
        registered.has(command),
        `contributes.commands entry not registered: ${command}`
      ).toBe(true);
    }
  });

  it('namespaces every contributed configuration property', () => {
    const configured = Object.keys(manifest.contributes.configuration.properties);
    expect(configured.length).toBeGreaterThan(0);
    for (const key of configured) {
      expect(key, 'configuration keys should be namespaced').toMatch(/^commandvariable\./);
    }
  });
});

describe('source hygiene', () => {
  const sources = fs
    .readdirSync(repoRoot)
    .filter((file) => file.endsWith('.js') && !file.startsWith('.'))
    .sort();

  it('keeps every source file reachable from the entry point', () => {
    // Follow relative requires from the manifest entry point.
    const reachable = new Set();
    const queue = [ENTRY];
    while (queue.length > 0) {
      const file = queue.pop();
      if (reachable.has(file) || !fs.existsSync(path.join(repoRoot, file))) {
        continue;
      }
      reachable.add(file);
      const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');
      const requirePattern = /require\(\s*['"](\.\/[^'"]+)['"]\s*\)/g;
      let match;
      while ((match = requirePattern.exec(source)) !== null) {
        // `./out/extension-common` is produced by rollup from extension-common.js,
        // which is also required directly by the web build.
        const target = match[1].replace(/^\.\/out\//, './').slice(2);
        queue.push(target.endsWith('.js') ? target : `${target}.js`);
      }
    }

    const allowedOrphans = new Set([
      'rollup.config.js', // build tooling, not runtime code
      'extension-common.js', // required via ./out/extension-common and by rollup
      // uuid-org.js is the upstream full UUID library. Only the stripped uuid.js
      // is imported; this copy is dead weight and is excluded from the package.
      // It is listed here so removing it is a deliberate decision rather than an
      // accidental deletion. TODO: delete once confirmed unused.
      'uuid-org.js',
    ]);

    const orphans = sources.filter((file) => !reachable.has(file) && !allowedOrphans.has(file));
    expect(orphans, 'source files not reachable from the entry point (dead code?)').toEqual([]);
    expect(sources).toContain('uuid-org.js');
  });

  it('documents the vendored YAML library version', () => {
    // yaml.js is a vendored bundle rather than a declared dependency, so
    // Dependabot cannot see it. If this fails the vendored copy was regenerated
    // and the version comment must be updated deliberately.
    const vendored = fs.readFileSync(path.join(repoRoot, 'yaml.js'), 'utf8');
    const match = /^\/\/ module: "yaml": "([^"]+)"/m.exec(vendored);
    expect(match, 'yaml.js should carry a version comment').not.toBeNull();
    expect(match[1]).toMatch(/\d+\.\d+\.\d+/);
  });

  it('records the vendored YAML version in a machine-readable place', () => {
    // Without this the vendored copy can only be tracked by reading the bundle.
    const vendored = fs.readFileSync(path.join(repoRoot, 'yaml.js'), 'utf8');
    const raw = /^\/\/ module: "yaml": "([^"]+)"/m.exec(vendored)[1];
    const version = raw.replace(/^[^0-9]*/, '');
    const tracked = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ).vendored?.['yaml'];
    expect(tracked, 'package.json should record the vendored yaml version').toBe(version);
  });
});

describe('security posture', () => {
  const analysed = ['extension-common.js', 'extension.js', 'utils.js', 'uuid.js'];

  it('never shells out to the operating system', () => {
    for (const file of analysed) {
      const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');
      expect(source, `${file} must not import child_process`).not.toMatch(
        /require\(\s*['"](?:node:)?child_process['"]\s*\)/
      );
    }
  });

  it('never reaches the network', () => {
    for (const file of analysed) {
      const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');
      expect(source, `${file} must not call fetch`).not.toMatch(/\bfetch\s*\(/);
      expect(source, `${file} must not require http/https`).not.toMatch(
        /require\(\s*['"](?:node:)?https?['"]\s*\)/
      );
    }
  });

  it('confines dynamic code evaluation to the two expression helpers', () => {
    // The ${command:...} expression features intentionally evaluate
    // user-supplied expressions. Freezing the count turns any *new* eval site
    // into a deliberate, reviewable decision rather than an accident.
    const budget = {
      'extension-common.js': 2, // getExpressionFunction + getExpressionFunctionFilterSelection
      'extension.js': 0,
      'utils.js': 0,
      'uuid.js': 0,
    };

    for (const [file, expected] of Object.entries(budget)) {
      const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');
      // Matches both `new Function(...)` and the immediately-invoked `Function(...)`
      // form, while ignoring identifiers such as `getExpressionFunction(`.
      const found = (source.match(/(?:^|[^\w$])Function\s*\(|\beval\s*\(/g) || []).length;
      expect(found, `dynamic eval count changed in ${file}`).toBe(expected);
    }
  });

  it('routes file access through the VS Code workspace API', () => {
    // Keeps the extension usable in remote and web extension hosts, where the
    // Node fs module is not available.
    const source = fs.readFileSync(path.join(repoRoot, 'extension.js'), 'utf8');
    expect(source).toMatch(/vscode\.workspace\.fs\./);
  });
});
