#!/bin/bash
set -euo pipefail

# systemd doesn't source shell profiles, so nvm has to be loaded explicitly here
# rather than relying on `node` being on PATH.
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use --silent

cd "$(dirname "$0")/../backend"
exec node index.js
