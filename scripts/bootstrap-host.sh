#!/bin/bash
# One-time setup for a fresh deploy host. Run from the repo root after cloning:
#   gh repo clone jaohara/sch-screen-man && cd sch-screen-man
#   ./scripts/bootstrap-host.sh
#
# Prerequisites this script assumes are already done (per the project's own setup):
#   - gh is installed and authenticated (`gh auth status`)
#   - you can sudo on this host

if [ -z "${BASH_VERSION:-}" ]; then
  echo "This script needs bash (nvm.sh isn't POSIX sh compatible)." >&2
  echo "Run it as ./scripts/bootstrap-host.sh or 'bash scripts/bootstrap-host.sh', not 'sh scripts/bootstrap-host.sh'." >&2
  exit 1
fi

set -euo pipefail

cd "$(dirname "$0")/.."
REPO_DIR="$(pwd)"
APP_USER="$(whoami)"
REPO_SLUG="jaohara/sch-screen-man"

echo "==> Installing nvm (if needed)"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  # Pinned to a known-good nvm release; check https://github.com/nvm-sh/nvm/releases
  # for something newer if you want it.
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
echo "==> Installing Node version from .nvmrc"
# nvm.sh's internal helpers return non-zero as normal control flow (e.g. "is
# this version installed yet?" -> no), which set -e treats as fatal, so
# errexit has to be off while it's loaded and while nvm commands run.
set +e
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install
NVM_INSTALL_STATUS=$?
nvm alias default "$(cat .nvmrc)"
set -e
if [ "$NVM_INSTALL_STATUS" -ne 0 ]; then
  echo "nvm install failed" >&2
  exit 1
fi

echo "==> Installing systemd unit"
sed -e "s|__APP_USER__|$APP_USER|g" -e "s|__APP_DIR__|$REPO_DIR|g" \
  deploy/sch-screen-man.service | sudo tee /etc/systemd/system/sch-screen-man.service > /dev/null
sudo systemctl daemon-reload
sudo systemctl enable sch-screen-man.service

echo "==> Installing sudoers rule for passwordless service restart"
RENDERED_SUDOERS="$(mktemp)"
sed -e "s|__APP_USER__|$APP_USER|g" deploy/sudoers-sch-screen-man > "$RENDERED_SUDOERS"
sudo visudo -cf "$RENDERED_SUDOERS"
sudo cp "$RENDERED_SUDOERS" /etc/sudoers.d/sch-screen-man
sudo chmod 440 /etc/sudoers.d/sch-screen-man
rm -f "$RENDERED_SUDOERS"

echo "==> Setting up GitHub Actions self-hosted runner"
RUNNER_DIR="$HOME/actions-runner"
if [ ! -f "$RUNNER_DIR/config.sh" ]; then
  mkdir -p "$RUNNER_DIR"
  (
    cd "$RUNNER_DIR"
    gh release download --repo actions/runner --pattern 'actions-runner-linux-arm64-*.tar.gz' --output runner.tar.gz --clobber
    tar xzf runner.tar.gz
    rm runner.tar.gz
    REG_TOKEN="$(gh api --method POST -H "Accept: application/vnd.github+json" \
      "repos/$REPO_SLUG/actions/runners/registration-token" --jq .token)"
    ./config.sh --url "https://github.com/$REPO_SLUG" --token "$REG_TOKEN" \
      --name "$(hostname)" --labels self-hosted,home-pi,arm64 --work _work --unattended --replace
    sudo ./svc.sh install
    sudo ./svc.sh start
  )
else
  echo "Runner already configured in $RUNNER_DIR, skipping."
fi

cat <<EOF

==> Bootstrap done. Remaining manual step:

  Copy the real pi-conf.js onto this host (it's gitignored, never comes through git):

    scp pi-conf.js $APP_USER@$(hostname -I | awk '{print $1}'):$HOME/.config/sch-screen-man/pi-conf.js

  (create ~/.config/sch-screen-man/ first if it doesn't exist)

Once that's in place, push to the 'deploy-test' branch to trigger the first deploy.
EOF
