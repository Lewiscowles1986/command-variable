#!/usr/bin/env bash
# Runs once when the dev container is created.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> toolchain"
node --version
npm --version
git --version

# Prefer a clean, lockfile-pinned install; fall back for the very first run on a
# branch that predates the committed lockfile.
if [ -f package-lock.json ]; then
  echo "==> npm ci"
  npm ci
else
  echo "==> no lockfile yet, running npm install"
  npm install
fi

echo "==> build (development bundle)"
npm run dev

echo
echo "Done. Useful commands:"
echo "  npm test              # lint + unit tests + build gate"
echo "  npm run test:unit     # fast, no VS Code download"
echo "  npm run test:integration  # downloads VS Code, needs xvfb on Linux"
echo
