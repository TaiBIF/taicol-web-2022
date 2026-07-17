# taicol-web-2022
This is repository for [TaiCOL web](taicol.tw).

## Architecture

Traffic flows through a shared **Traefik** reverse proxy (TLS termination + Let's Encrypt), which routes by hostname to per-service nginx containers:

- `taicol.tw` → `nginx-web` → Django. Pages are a mix: some use React (bundled from `react_src` via webpack), others are plain Django templates with static html/js/css. Either way the assets are served as Django static files.
- `admin.taicol.tw` → `nginx-admin` → React backend (Next.js in `react-backend/`)
- `api.taicol.tw` → `nginx-api` → Django API (separate repo, not in this project)

Each nginx container attaches to Traefik via labels (`traefik.http.routers.*`) on an external `traefik-*` network. There is no host-level nginx install.

## Environment files

Each environment has its own env file. There are **two layers**, each with the same set of files:

Root (Django frontend / webpack):
- `.env`            — local development
- `.env.staging`
- `.env.production`

React backend (`react-backend/app/`):
- `.env`            — local development
- `.env.staging`
- `.env.production`

> **Note** `.env` is for local dev and is read automatically by `npm run watch` / `next dev`. The `.staging` / `.production` files are only selected explicitly at build time (see Deployment) and never overwrite your local `.env`.

## Local development

`make dev-up` brings up the whole local stack in Docker — Django, Postgres, MySQL, Solr, **and** a webpack watch container. One command starts everything; `make dev-down` stops it all.

```
make dev-build     # build images
make dev-up        # start everything (docker compose up -d)
make dev-down      # stop everything
```

The React backend has its own compose file under `react-backend/` (Next.js in `next dev` mode + its own MySQL). Start it separately from that directory when you need it.

During development you do **not** need to rebuild + restart on every change:

### Django frontend (`react_src/`, webpack)

The `webpack` service (in `docker-compose.yml`) runs `npm run watch`, so the bundle in `./static/react_component/` is rebuilt automatically on save. With Django running `DEBUG=True`, the updated static file is served directly — just refresh the browser (no `collectstatic`, no container restart needed).

- Watch its output with `make dev-watch-logs` (or `docker compose logs -f webpack`).
- The container uses its own `node_modules` (an anonymous volume), so it won't clash with a host `node_modules` built on a different OS. The first `dev-up` runs `npm install`, so it takes a little longer.
- `CHOKIDAR_USEPOLLING=true` is set so file changes are detected reliably on macOS/Windows.

### React backend (`react-backend/app/`, Next.js)

`react-backend/docker-compose.yml` already runs `command: npm run dev`, which has Fast Refresh (HMR) built in — edits reflect instantly with no build/restart. `WATCHPACK_POLLING=true` is set for reliable file-change detection inside the container.

> **Note** keep `staging.yml` / `production.yml` on `next start` (production). If `.next` still holds a previous production build, remove it first (`rm -rf react-backend/app/.next`) to avoid cache conflicts.

## Deployment (staging/prod)

`./scripts/build_deploy.sh` handles both **building the frontend assets with the right env** and **rsync-ing them to the matching host**. The target host is derived from the environment argument, so you can't accidentally build one environment and ship it to the other.

### 1. Build + sync from your local machine

```
./scripts/build_deploy.sh staging       # builds with .env.staging, syncs to tcweb-stag
./scripts/build_deploy.sh production     # builds with .env.production, syncs to tcweb-prod
```

What it does:
- Selects `.env.staging` / `.env.production` for **both** layers (root webpack + `react-backend/app`) without touching your local `.env`, so you can go straight back to `npm run watch` afterwards.
- Always removes any previous `.next` and rebuilds a clean production build. A dev build (`next dev`) writes a dev-mode `.next` that crashes under `next start` (e.g. `jsxDEV is not a function`).
- Shows a **dry-run of the `--delete`** for the React backend `.next` and waits for you to confirm before the real sync.
- Syncs the Django frontend bundles (`static/react_component/*.js`) too.

> **Note** `NEXT_PUBLIC_`-prefixed variables are baked into the client bundle at build time. Confirm the bundle carries the intended environment's values before confirming the sync.

### 2. Bring the containers up on the target host

SSH into the target host, then from the project directory:

```
make stag-build && make stag-up        # staging
make prod-build && make prod-up         # production
```

Building images does **not** touch data: the React backend MySQL and Postgres both use host bind-mounts (`react-backend/db`, `tc-web-volumes/pgdata`), so rebuilding or recreating containers keeps the data. (Backing up the DB before a rebuild is still good practice.)

## Traefik reverse proxy

Traefik runs as a **separate** stack (`traefik/`), shared across taicol web / admin / api. It owns ports 80/443, terminates TLS, and auto-issues Let's Encrypt certs via the `myresolver` resolver.

There is one compose file per environment, matching the naming used elsewhere in the repo. Use the Makefile in `traefik/`:

```
cd traefik
make prod-up        # production host
make stag-up        # staging host
```

(`make stag-down` / `prod-down` to stop, `stag-logs` / `prod-logs` to tail logs.)

The staging file also joins the `traefik-nametool` network, used to route `staging.taicol.tw` — the test site for nametool.taicol.tw. That service is the separate `taicol-2021` (nametool) compose project running on the staging box, which attaches to `traefik-nametool` and declares its own Traefik labels.

Key points:
- Services opt in with `traefik.enable=true` plus router labels; `exposedbydefault=false` means anything without labels is ignored.
- Certs and the ACME account live in `traefik/letsencrypt/acme.json` (host-mounted). Keep this file — deleting it forces re-issuance and can hit Let's Encrypt rate limits.
- The external networks must exist before starting the stack. Production needs `traefik-web`, `traefik-admin`, `traefik-api`; staging additionally needs `traefik-nametool` (for the taicol-2021 / nametool project):
  ```
  docker network create traefik-web
  docker network create traefik-admin
  docker network create traefik-api
  docker network create traefik-nametool   # staging only
  ```

## Cronjobs

```
# Daily at 00:00 - Delete user-downloaded .zip files older than 32 days to free up space.
0 0 * * * find /home/ec2-user/tc-web-volumes/media/download/ -name "*.zip" -mtime +32 -delete >> /tmp/clean_download.log 2>&1
0 0 * * * find /home/ec2-user/tc-web-volumes/media/match_result/ -name "*.zip" -mtime +32 -delete >> /tmp/clean_download.log 2>&1
```