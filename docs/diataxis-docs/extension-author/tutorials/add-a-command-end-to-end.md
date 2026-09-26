---
audience: extension-author
diataxis: tutorial
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 2 minutes

# Add a command end to end

In this tutorial you add a new command to the extension: manifest declaration, registration, unit test, integration test and documentation. The `dateTime` family is the worked example this follows; its mapping is on [the dateTime family](../reference/date-time.md).

## The change, in five places

A new command touches exactly these places:

1. `package.json` — an activation event, and a palette entry only if the command should be in the Command Palette.
2. `extension-common.js` or `extension.js` — the registration and the logic.
3. `test/unit/` — the fast assertions.
4. `test/integration/` — the end-to-end proof.
5. `docs/diataxis-docs/` — the reference page for the command family.

The manifest contract tests fail until places 1 and 2 agree, which is the guardrail that makes this list hard to skip.

## Step 1: declare in the manifest

Add the activation event to `package.json`:

```json
"onCommand:extension.commandvariable.myCommand"
```

Add a palette entry only if users should find it in the Command Palette. Only two commands have one (`dateTimeInEditor`, `UUIDInEditor`); everything else is reachable through `${command:...}`.

## Step 2: register the command

In `extension-common.js`, inside `activate`:

```js
context.subscriptions.push(
  vscode.commands.registerCommand('extension.commandvariable.myCommand', args => {
    return myLogic(checkIfArgsIsLaunchConfig(args));
  })
);
```

The wrapper pushes into `subscriptions` so VS Code disposes the registration correctly. `checkIfArgsIsLaunchConfig(args)` normalises the arguments; use `getProperty` and `dblQuest` to read arguments with defaults, so a missing `args` behaves as an empty object rather than throwing.

If the command writes into the active editor, register it with `vscode.commands.registerTextEditorCommand` instead; see how `dateTimeInEditor` does it.

## Step 3: unit test

In `test/unit/extension-common.test.js`:

```js
it('registers the new command', () => {
  activateFresh();
  expect(vscode.__registeredCommands()).toContain('extension.commandvariable.myCommand');
});

it('computes the value', () => {
  activateFresh();
  const value = vscode.__invoke('extension.commandvariable.myCommand', {
    /* fixed inputs */
  });
  expect(value).toBe(/* expected */);
});
```

The test double records every call, so you can assert on what the extension asked VS Code to do with `vscode.__calls('window.showErrorMessage')`. Pin anything time- or platform-dependent (`timeZone: 'UTC'` is the pattern the `dateTime` test uses) so the assertion cannot fail on another machine.

Run: `npm run test:unit`.

## Step 4: integration test

In `test/integration/extension.test.js`, add to the existing suite:

```js
test('command exists at runtime', async () => {
  const commands = await vscode.commands.getCommands();
  assert.ok(commands.includes('extension.commandvariable.myCommand'));
});
```

Run: `npm run test:integration`. This is the layer that proves activation actually registers the command in a real host.

## Step 5: document

Add the command to the right [reference family page](../../extension-user/reference/index.md): a table row describing what it returns, plus its arguments. Update the [web support matrix](../../extension-user/reference/web-support-matrix.md) if the command is desktop-only.

## Step 6: verify

```bash
npm run verify
npm run check:docs
```

## You have succeeded when

- `npm run verify` passes,
- `npm run test:integration` proves the command exists in a real host, and
- the command appears on a reference page with its arguments.
