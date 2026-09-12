#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

SERVICE_NAME="sch-screen-man.service"
PI_CONF_SRC="${PI_CONF_SRC:-$HOME/.config/sch-screen-man/pi-conf.js}"

if [ ! -f "$PI_CONF_SRC" ]; then
  echo "Error: $PI_CONF_SRC not found. Place the real pi-conf.js there once (see deploy/README.md)." >&2
  exit 1
fi
cp "$PI_CONF_SRC" ./pi-conf.js

export NVM_DIR="$HOME/.nvm"
# nvm.sh's internal helpers return non-zero as normal control flow, which
# set -e treats as fatal, so errexit has to be off while it's loaded and
# while nvm commands run.
set +e
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use
NVM_USE_STATUS=$?
set -e
if [ "$NVM_USE_STATUS" -ne 0 ]; then
  echo "nvm use failed" >&2
  exit 1
fi

npm ci

./update-configs.sh
./build-frontend.sh

sudo systemctl restart "$SERVICE_NAME"
sudo systemctl --no-pager --lines=0 status "$SERVICE_NAME"
