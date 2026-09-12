#!/bin/bash
set -euo pipefail

# systemd doesn't source shell profiles, so nvm has to be loaded explicitly here
# rather than relying on `node` being on PATH.
export NVM_DIR="$HOME/.nvm"
# nvm.sh's internal helpers return non-zero as normal control flow, which
# set -e treats as fatal, so errexit has to be off while it's loaded and
# while nvm commands run.
set +e
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use --silent
NVM_USE_STATUS=$?
set -e
if [ "$NVM_USE_STATUS" -ne 0 ]; then
  echo "nvm use failed" >&2
  exit 1
fi

cd "$(dirname "$0")/../backend"
exec node index.js
