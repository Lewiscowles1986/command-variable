# Integration test workspace

This folder is opened as the workspace folder by the VS Code integration tests
(see `.vscode-test.mjs`). It exists so the extension activates with a real,
known workspace layout, which a few commands depend on.

`sample/` gives the file/workspace path commands something deterministic to
resolve against.
