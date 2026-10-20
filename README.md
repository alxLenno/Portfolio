# Lennox Kahati — Portfolio

A React + Vite portfolio with a small Flask backend (SQLite) that serves the
built site, the JSON API, the admin area, and uploaded media. It is designed to
run as a single web app on [PythonAnywhere](https://www.pythonanywhere.com).

## How it fits together

| Piece | Where | Notes |
| --- | --- | --- |
| Public pages | `src/` (React) → `dist/` | Home, About, Projects, Research, Books, Contact… |
| API | `backend/` (Flask) | `/api/projects`, `/api/papers`, `/api/books` |
| Admin | `src/admin/` + `/api/auth` | Password login, create/edit/delete content |
| Database | `instance/portfolio.db` (SQLite) | Auto-created on startup, ignored by git |
| Uploads | `instance/media/` | Served at `/media/…`, ignored by git |

Flask serves `dist/index.html` for every non-API route, so React Router works on
refresh, and requests stay same-origin (no CORS, no cross-site cookies).

## Local development

Requirements: Node 20+ and Python 3.10+.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
cp .env.example .env
```

Fill in `.env`:

```bash
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=…

# flask --app backend hash-password   (paste the result in single quotes)
ADMIN_PASSWORD_HASH='pbkdf2:sha256:600000$…'

# Plain-HTTP localhost only; keep 1 (the default) on PythonAnywhere.
SESSION_COOKIE_SECURE=0
```

Then start both processes:

```bash
flask --app backend init-db      # create the tables (also happens on startup)
flask --app backend seed         # optional: load the starter content
npm install
npm run dev:api                  # Flask on http://127.0.0.1:5001
npm run dev                      # Vite on http://127.0.0.1:5173
```

Open <http://127.0.0.1:5173> for the site and
<http://127.0.0.1:5173/admin> for the admin area. Vite proxies `/api` and
`/media` to Flask.

To preview the production setup locally (Flask serving the built site):

```bash
npm run build
flask --app backend run --port 5001
# open http://127.0.0.1:5001
```

Run the backend tests with `pytest backend/tests` (or `npm run test:api` from an
activated virtualenv).

## Content and data

- **Static copy** (profile, experience, skills, education, certifications) lives
  in [`src/data.js`](src/data.js) and is part of the React app.
- **Editable content** (projects, research papers, books) lives in SQLite and is
  managed from `/admin`. Changes show up on the public site within a minute
  (the pages poll the API) or immediately on reload.
- **Seed data** comes from the same project/paper/book fallbacks in
  `src/data.js`, exported to `backend/seed.json`:

  ```bash
  npm run seed:export                 # optional, only if data.js changed
  flask --app backend seed            # idempotent; use --force to re-insert
  ```

- **Uploads** go to `instance/media/{images,videos,papers,books}` with random
  file names and extension allow-lists. The maximum upload size is 50 MB
  (`MAX_UPLOAD_MB`). Replaced files are deleted; deleting an item also removes
  its local media.

### API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Status, database check, admin configuration |
| GET | `/api/{projects,papers,books}` | – | List items, ordered by `sort_order` |
| POST | `/api/{projects,papers,books}` | admin | Create an item |
| PATCH | `/api/{projects,papers,books}/<id>` | admin | Update fields |
| DELETE | `/api/{projects,papers,books}/<id>` | admin | Delete an item and its media |
| POST | `/api/media` | admin | Multipart upload (`file`, `folder`) → `{ url }` |
| DELETE | `/api/media` | admin | `{ url }` → removes a local upload |
| GET | `/media/<path>` | – | Serve uploaded files |
| GET/POST | `/api/auth/session`, `/api/auth/login`, `/api/auth/logout` | – | Admin session |

## Admin login

The admin area is protected by one password, stored as a hash:

```bash
flask --app backend hash-password
```

Put the printed value in `.env` as `ADMIN_PASSWORD_HASH` (single quotes are
safest), restart the app, then sign in at `/admin`. To change the password,
generate a new hash and replace the old one. If `ADMIN_PASSWORD_HASH` is empty,
`/admin` shows a setup message and login returns 503.

Login attempts are throttled (5 failures per IP per 10 minutes), sessions last 12
hours, and state-changing requests from another origin are rejected.

## Deploying to PythonAnywhere

The whole site runs as one PythonAnywhere web app: Flask serves the API, the
uploaded media, and the built React files.

### 1. Build the frontend locally

```bash
npm install
npm run build        # writes dist/
```

`dist/` is gitignored, so a plain `git clone` on PythonAnywhere will not include
it. Either:

- zip `dist/` locally and upload it through the **Files** tab, then unzip it in
  the project root (it must sit next to `backend/`), or
- build on the server (`npm ci && npm run build`) — Node is available in the
  PythonAnywhere consoles, at the cost of extra disk usage.

### 2. Upload the project

Use a Bash console (`git clone` if the repo is on GitHub) or upload a zip; the
folder must end up somewhere like `/home/USERNAME/portfolio` and contain:

```
backend/  dist/  deploy/  public/  src/  package.json  vite.config.js
```

Do **not** upload `node_modules/`, `.venv/`, `instance/`, or `.env`
(`.env` is created in the next step).

### 3. Install the backend

In a Bash console on PythonAnywhere:

```bash
cd ~/portfolio
python3.10 -m venv .venv            # or any Python 3.10+ available in the Web tab
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Configure `.env`

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"   # SECRET_KEY
flask --app backend hash-password                          # ADMIN_PASSWORD_HASH
nano .env
```

```bash
SECRET_KEY=…
ADMIN_PASSWORD_HASH='pbkdf2:sha256:600000$…'
SESSION_COOKIE_SECURE=1
```

Then create the database and load the starter content:

```bash
flask --app backend init-db
flask --app backend seed
```

Both commands create `instance/` and `instance/media/` on first use.

### 5. Create the web app

In the **Web** tab:

- **Add a new web app** → **Manual configuration** → the Python version you used
  for the virtualenv (3.10+).
- **Source code**: `/home/USERNAME/portfolio`
- **Working directory**: `/home/USERNAME/portfolio`
- **Virtualenv**: `/home/USERNAME/portfolio/.venv`
- **WSGI configuration file**: replace its contents with
  [`deploy/pythonanywhere_wsgi.py`](deploy/pythonanywhere_wsgi.py) and set
  `PROJECT_DIR` to your actual path.
- *(Optional, faster)* **Static files**:
  - URL `/media/` → `/home/USERNAME/portfolio/instance/media`
  - URL `/assets/` → `/home/USERNAME/portfolio/dist/assets`

  PythonAnywhere then serves these files directly instead of through Flask.
  URLs and caching stay the same.

- **Security → Force HTTPS**: set it to *Enabled* so the session cookie is only
  ever sent over TLS.

Reload the web app and check:

- `https://USERNAME.pythonanywhere.com/api/health` → `{"status": "ok", …}`
- `https://USERNAME.pythonanywhere.com/` → the portfolio
- `https://USERNAME.pythonanywhere.com/admin` → the sign-in form

### 6. Updating the deployment

```bash
cd ~/portfolio && git pull          # or re-upload changed files
source .venv/bin/activate
pip install -r backend/requirements.txt   # only if dependencies changed
```

Upload a freshly built `dist/` when the frontend changed, then press **Reload**
in the Web tab. Database schema changes are applied automatically on startup
(`backend/schema.sql` is idempotent); for a manual run use
`flask --app backend init-db`.

## Backups

Everything that changes lives under `instance/`:

- `instance/portfolio.db` — download this file to back up all content
- `instance/media/` — uploaded images, videos, PDFs, and book covers

For a consistent database copy, use PythonAnywhere's file browser or:

```bash
sqlite3 ~/portfolio/instance/portfolio.db ".backup ~/portfolio-backup.db"
```

Keep in mind the free-tier disk quota (512 MB) if you upload large videos.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `503` "frontend has not been built" | Run `npm run build` and upload `dist/` |
| `/admin` says "Admin not configured" | `ADMIN_PASSWORD_HASH` missing or empty in `.env`; restart the app |
| `/admin` says "Admin unavailable" | Flask isn't running/reachable; check `npm run dev:api` or the PA error log |
| Login succeeds but you're signed out immediately | On plain HTTP set `SESSION_COOKIE_SECURE=0`; on HTTPS keep it `1` |
| `403` on save/upload | The browser's `Origin` doesn't match the server host (proxy or renamed domain) |
| `/api/health` shows `"database": "error"` | `instance/` isn't writable or the DB file is locked; check permissions/logs |

## Project structure

```
backend/
  __init__.py              app factory: config, security headers, SPA serving
  api.py                   CRUD routes, media upload/delete, /media serving
  auth.py                  password login, session guard, throttling
  db.py                    SQLite connection helpers
  schema.sql               tables and indexes (idempotent)
  seed.py / seed.json      starter content importer + exported seed data
  cli.py                   init-db, seed, hash-password commands
  tests/                   pytest suite for the API, auth, media, and SPA
deploy/
  pythonanywhere_wsgi.py   WSGI entry point for PythonAnywhere
scripts/
  export-seed.mjs          writes backend/seed.json from src/data.js
src/                       React app (pages, admin, API client, hooks)
public/                    static assets copied into dist/ (CV, certs, images)
```
