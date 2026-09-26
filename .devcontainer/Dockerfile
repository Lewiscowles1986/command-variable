# Node dev container for the Command Variable VS Code extension.
# The extra OS packages are what a modern Electron/VS Code build needs in order
# to run the Extension Host headless (integration tests) under Xvfb.
ARG VARIANT="22-bookworm"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libdrm2 \
        libgbm1 \
        libgtk-3-0 \
        libnss3 \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxkbcommon0 \
        libxrandr2 \
        xvfb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Fail fast if someone adds a dependency that needs a compiler we do not have.
USER node
WORKDIR /workspaces
