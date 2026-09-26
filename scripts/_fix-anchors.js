'use strict';

/**
 * One-off: rewrite the in-README anchors left inside the extracted sections
 * to point at the docs pages those sections moved to. Not part of the
 * toolchain; the link checker verifies the result.
 */

const fs = require('node:fs');
const path = require('node:path');

const REF = 'docs/diataxis-docs/extension-user/reference/';

// old README anchor -> [new target relative to a reference page, needed heading or '']
const ANCHOR_MAP = {
  commands: ['index.md', ''],
  usage: ['../../tutorials/your-first-command-variable.md', ''],
  settings: ['settings.md', ''],
  fileaskey: ['file-paths.md', ''],
  'file-content': ['file-content.md', ''],
  'file-content-key-value-pairs': ['file-content.md', ''],
  'file-content-json-property': ['file-content.md', ''],
  'file-content-yaml-property': ['file-content.md', ''],
  'file-content-multiple-key-valuesproperties': ['file-content.md', ''],
  'file-content-in-editor': ['file-content.md', ''],
  'config-expression': ['expressions.md', ''],
  'javascript-expression': ['expressions.md', ''],
  'pick-file': ['dialogs.md', ''],
  'open-dialog': ['dialogs.md', ''],
  'save-dialog': ['dialogs.md', ''],
  number: ['number-transform.md', ''],
  remember: ['remember.md', ''],
  pickstringremember: ['select-remember-commands.md', ''],
  promptstringremember: ['select-remember-commands.md', ''],
  'multicursor-and-text': ['text-selection.md', ''],
  interminal: ['expressions.md', ''],
  getclipboard: ['text-selection.md', ''],
  setclipboard: ['text-selection.md', ''],
  transform: ['number-transform.md', ''],
  'save-to-file': ['number-transform.md', ''],
  variables: ['variables.md', ''],
  'variable-filters': ['variable-filters.md', ''],
  'variables-in-javascript-expression': ['variable-filters.md', ''],
  'variable-workspacefolder': ['variable-workspacefolder.md', ''],
  'variable-workspacefolderbasename': ['variable-workspacefolder.md', ''],
  'variable-selectedtext': ['variable-selectedtext.md', ''],
  'variable-pickstringremember': ['variable-pickstringremember.md', ''],
  'variable-promptstringremember': ['variable-pickstringremember.md', ''],
  'variable-pickfile': ['variable-pickfile.md', ''],
  'variable-opendialog': ['variable-pickfile.md', ''],
  'variable-savedialog': ['variable-pickfile.md', ''],
  'variable-command': ['variable-command-transform-remember.md', ''],
  'variable-transform': ['variable-transform.md', ''],
  'variable-remember': ['variable-remember.md', ''],
  checkescapedui: ['../explanation/cancelled-inputs-and-compound-tasks.md', ''],
  'workspace-name-in-argument': ['file-paths.md', 'target-a-specific-workspace-folder'],
  uuid: ['identity.md', ''],
  datetime: ['date-time.md', ''],
  dependson: ['select-remember-commands.md', 'dependson'],
  'select-server-from-json': ['select-remember-examples-2.md', 'select-server-from-json'],
  'select-server-from-pattern': ['select-remember-examples-3.md', 'select-server-from-pattern'],
  'construct-commandid': ['variable-command-transform-remember.md', 'construct-commandid'],
};

const DOCS_DIR = 'docs/diataxis-docs';

function listMarkdownFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      found.push(full);
    }
  }
  return found;
}

let total = 0;
for (const file of listMarkdownFiles(DOCS_DIR)) {
  if (file.endsWith('README.md') || file === 'README.md') {
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let inFence = false;
  let changed = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*(`{3,}|~{3,})/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    lines[i] = lines[i].replace(/\]\(#([a-z0-9-]+)\)/gi, (whole, anchor) => {
      const key = anchor.toLowerCase();
      if (!(key in ANCHOR_MAP)) {
        return whole; // genuine same-page anchor or unknown; checker reports it
      }
      const [target, heading] = ANCHOR_MAP[key];
      const rel = path.relative(path.dirname(file), path.join(REF, target));
      changed += 1;
      return `](${rel}${heading ? '#' + heading : ''})`;
    });
  }
  if (changed > 0) {
    fs.writeFileSync(file, lines.join('\n'));
    total += changed;
  }
}
console.log('rewrote', total, 'anchors');
