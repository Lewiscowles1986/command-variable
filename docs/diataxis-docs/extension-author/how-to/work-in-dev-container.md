---
audience: extension-author
diataxis: how-to
reading-time: 1 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension author · **Reading time:** 1 minute

# Work in the dev container

`.devcontainer/` provides an isolated environment with the OS libraries Electron needs, keeping VS Code downloads and Extension Host processes off your machine.

```bash
# In VS Code: "Dev Containers: Reopen in Container"
# Or with the devcontainer CLI:
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . npm run verify
```

Docker must be running. If you do not have Docker, the repository works fine directly on macOS, Linux or Windows.

## You have succeeded when

- `devcontainer exec --workspace-folder . npm run verify` passes inside the container.
