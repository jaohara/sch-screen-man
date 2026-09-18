# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A web dashboard for managing the Raspberry Pi-powered menu displays at Stoup Brewing's Capitol Hill location. Staff use it to check the status of screen hosts and trigger remote reboots without needing SSH access or physical access to the device. See `README.md` for the full problem/solution writeup.

## Commands

Npm workspaces monorepo (`frontend` and `backend`). Requires Node >=24 (see `.nvmrc`).

```bash
npm install          # from repo root, installs both workspaces
```

- `./start-frontend.sh` — Vite dev server with `--host` (reachable on the LAN)
- `./start-server.sh` — Express backend, listens on :3000
- `./build-frontend.sh` — builds the frontend directly into `backend/public/` (see `vite.config.js`) — this is a cross-package side effect, not a self-contained build
- `./update-configs.sh` — copies the root `pi-conf.js` into `frontend/pi-conf.js` and `backend/pi-conf.js`. **Run this after editing `pi-conf.js`**, or the two workspace copies drift.

Standard `lint` scripts exist in both workspaces (`eslint . --report-unused-disable-directives --max-warnings 0`). No test suite currently.

## Deployment

Pushing to the `deploy-test` branch triggers `.github/workflows/deploy.yml` on a
self-hosted runner (currently a home-network Pi used for testing feature
branches before they go to the production venue Pi). See `deploy/README.md`
for the one-time host bootstrap (`scripts/bootstrap-host.sh`) and the deploy
runbook — `scripts/deploy.sh` is what actually runs on push.

## Architecture

**Two workspaces, one shared config file.** `frontend/` and `backend/` each hold their own copy of `pi-conf.js` — these are *not* symlinks, `update-configs.sh` copies between them, so edit the root copy and re-run that script.

**`pi-conf.js` is gitignored and contains real credentials** (SSH passwords for the Pi hosts). Never commit it or print its contents into anything that gets committed.

- **A Pi's id throughout the app is its index in the `piConfig` array** — routes and components pass this index around as `screenId`/`piId`, not a stable identifier, so array order matters. This isn't visible from any single file — it's a convention spanning frontend and backend.
- A `USE_PRODUCTION_PIS` flag switches the whole app between the real venue's Pi list and a local-dev config for testing against non-Pi hosts.

**Backend (`./backend`)** — Express app (`index.js`) serving the built frontend as static files from `./public`. CORS is restricted to an explicit allowlist in `index.js` (`corsOriginArray`) for LAN dev origins — add new local test IPs there, not a wildcard.

Route handlers always ping a host before attempting an SSH-based reboot/uptime check, because the SSH error codes distinguish "host unreachable" (power/network failure) from "connection refused" (host up but rejecting SSH). This ordering is intentional — it's what lets the frontend distinguish "unreachable" from "crashed" rather than collapsing both into one offline state. Don't simplify it away.

**Frontend (`./frontend/src`)** — `Screen.jsx` is the stateful core: it independently pings its own host on an interval, tracks online/offline/loading/rebooting state, and issues reboot requests. `PING_TIMEOUT` and `REBOOT_TIMEOUT` (in `constants.js`) intentionally differ — a reboot is expected to make the host briefly unreachable, so the timeout is loosened during a reboot. Don't merge these into a single timeout.

`BACKEND_BASE_URL` is derived from `window.location.hostname`, not hardcoded — the frontend assumes the Express backend is always reachable at the same host, port 3000.

Components colocate styles as CSS Modules (`Component.module.scss`).

## Context

Recently migrated off older Node/React/Vite versions to current majors — expect modern APIs and ESLint flat config, not legacy patterns.
