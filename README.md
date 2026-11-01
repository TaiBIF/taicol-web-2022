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

The `.staging` / `.production` files only need the values that are **baked in at build time**. Create them from the templates (all `.env.*` files are git-ignored):

| Layer | Template | Required variables |
|---|---|---|
| Root (webpack) | `dotenv.build.example` | `REACT_API_URL`, `TAICOL_API_URL`, `NEXT_PUBLIC_PAGINATE_LIMIT` |
| `react-backend/app/` (Next.js) | `react-backend/app/dotenv.build.example` | `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_WEB_PUBLIC_DOMAIN`, `NEXT_PUBLIC_PAGINATE_LIMIT` |

Runtime settings (DB, secrets, `RELEASE_PUBLISH_TOKEN`) are **not** part of the build; they stay in the `.env` / `react-backend/app/.env` on each host.

On each host, `react-backend/.env` (next to `staging.yml` / `production.yml`, separate from `app/.env`) holds values that docker compose substitutes into the compose file itself. Template: `react-backend/dotenv.example`.
- `RELEASE_PUBLISH_ALLOW_IP` — source IP(s) allowed to call `/api/publish` (the update service's private IP, e.g. `172.31.37.6/32`; comma-separated for several). Required: compose refuses to start without it.

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

`./build_deploy.sh` handles both **building the frontend assets with the right env** and **rsync-ing them to the matching host**. The target host is derived from the environment argument, so you can't accidentally build one environment and ship it to the other.

### 0. First-time setup (once per checkout)

```
nvm install 16                      # the build runs on Node 16 (.nvmrc)
npm ci                              # root: webpack
(cd react-backend/app && npm ci)    # React backend: next
cp dotenv.build.example .env.staging                                       # then fill in staging values
cp dotenv.build.example .env.production                                    # then fill in production values
cp react-backend/app/dotenv.build.example react-backend/app/.env.staging
cp react-backend/app/dotenv.build.example react-backend/app/.env.production
```

`node_modules` lives in each checkout, so a new clone (or a copy without `node_modules`) needs `npm ci` again — otherwise the build fails with `next: command not found`. Install on the Mac itself: a `node_modules` created inside the dev container holds Linux binaries.

### 1. Build + sync from your local machine

```
./build_deploy.sh staging       # builds with .env.staging, syncs to tcweb-stag
./build_deploy.sh production    # builds with .env.production, syncs to tcweb-prod
```

What it does:
- Switches to the Node version in `.nvmrc` (16) via nvm — no need to run `nvm use` first. If nvm isn't in `~/.nvm`, set `NVM_DIR`.
- Checks that both `.env.<env>` files exist and contain the required variables (see Environment files), and prints the values that will be baked in. A missing variable stops the build instead of silently falling back to `undefined` or to your local `react-backend/app/.env`.
- Selects `.env.staging` / `.env.production` for **both** layers (root webpack via `ENV_FILE`, `react-backend/app` via `dotenv-cli`) without touching your local `.env`, so you can go straight back to `npm run watch` afterwards.
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

`make *-up` does not recreate a running container whose `env_file` content changed. After editing `react-backend/app/.env` or `react-backend/.env`, recreate the React backend explicitly:

```
cd react-backend
docker compose -f staging.yml up -d --force-recreate react_app nginx-admin      # production.yml on prod
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