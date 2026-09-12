# Deployment

The home test Pi runs a self-hosted GitHub Actions runner. Pushing to the
`deploy-test` branch triggers `.github/workflows/deploy.yml`, which runs
`scripts/deploy.sh` directly on that host.

## Testing a feature branch

```bash
git checkout deploy-test
git merge --no-ff <your-feature-branch>
git push origin deploy-test
```

Watch the run under the repo's Actions tab. `deploy-test` is just a landing
branch for whatever you want tested — merge into it, don't commit to it
directly.

## One-time host setup

On a fresh host (after `gh repo clone jaohara/sch-screen-man`, with `gh`
already authenticated and packages/shell already set up):

```bash
cd sch-screen-man
./scripts/bootstrap-host.sh
```

This installs nvm + the pinned Node version, installs the systemd unit and a
scoped sudoers rule (passwordless restart of only `sch-screen-man.service`),
and registers + installs this host as a GitHub Actions runner (using the
already-authenticated `gh` CLI to fetch a registration token — no manual
token copy/paste).

The one thing it can't do for you: **`pi-conf.js` has real credentials and is
gitignored, so it never comes through git or CI.** Copy it once onto the host
at `~/.config/sch-screen-man/pi-conf.js`:

```bash
scp pi-conf.js <user>@<host>:.config/sch-screen-man/pi-conf.js
```

`scripts/deploy.sh` copies it into the repo root (and from there,
`update-configs.sh` copies it into `frontend/` and `backend/`) on every
deploy, so an update to the real file on your workstation still means an scp,
but the repo checkout itself never touches it.

## Manual service control

```bash
sudo systemctl status sch-screen-man
sudo systemctl restart sch-screen-man
journalctl -u sch-screen-man -f
```
