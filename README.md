# Lennox Kahati — Portfolio

The React site is hosted on Vercel; the API, admin, database, and uploads live in
a small Flask app that runs on [PythonAnywhere](https://www.pythonanywhere.com).

## How it fits together

| Piece | Where | Notes |
| --- | --- | --- |
| Public pages + admin UI | Vercel (`dist/`) | `VITE_API_BASE_URL` points at the API |
| API | PythonAnywhere (`backend/`) | `/api/projects`, `/api/papers`, `/api/books` |
| Database | `instance/portfolio.db` (SQLite) | Auto-created on startup, ignored by git |
| Uploads | `instance/media/` | Served at `/media/…`, ignored by git |

Because the two origins differ, the API:

- answers CORS requests from the configured origins, and
- authenticates the admin with a signed **bearer token** (12 h) instead of a
  cookie, since cross-site cookies are blocked by several browsers.

Uploaded files are returned as absolute URLs built from `PUBLIC_BASE_URL` so the
Vercel site can display them. If a local `dist/` build happens to exist, Flask
will also serve it (handy for local checks), but PythonAnywhere does not need it.

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

# Leave empty for local work; only needed where the API is public.
PUBLIC_BASE_URL=
```

Then start both processes:

```bash
flask --app backend init-db      # create the tables (also happens on startup)
flask --app backend seed         # optional: load the starter content
npm install
npm run dev:api                  # Flask on http://127.0.0.1:5001
npm run dev                      # Vite on http://localhost:5173
```

Open <http://localhost:5173> and <http://localhost:5173/admin>. Vite proxies
`/api` and `/media` to Flask, so the frontend stays same-origin in development
and no CORS setup is needed.

Run the backend tests with `pytest backend/tests` (or `npm run test:api` from an
activated virtualenv).

## Content and data

- **Static copy** (profile, experience, skills, education, certifications) lives
  in [`src/data.js`](src/data.js) and ships with the React app.
- **Editable content** (projects, research papers, books) lives in SQLite and is
  managed from `/admin`. Public pages poll the API every 45 s, so changes appear
  within a minute or immediately on reload.
- **Seed data** comes from the project/paper/book fallbacks in `src/data.js`,
  exported to `backend/seed.json`:

  ```bash
  npm run seed:export                 # only needed if data.js changed
  flask --app backend seed            # idempotent; --force re-inserts
  ```

- **Uploads** go to `instance/media/{images,videos,papers,books}` with random
  file names and extension allow-lists. The limit is 50 MB (`MAX_UPLOAD_MB`).
  Replaced files are deleted; deleting an item also removes its local media.

### API

Public reads need no auth. Writes require `Authorization: Bearer <token>` from
`POST /api/auth/login`.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Status, database check, admin configuration |
| GET | `/api/{projects,papers,books}` | – | List items, ordered by `sort_order` |
| POST | `/api/{projects,papers,books}` | token | Create an item |
| PATCH | `/api/{projects,papers,books}/<id>` | token | Update fields |
| DELETE | `/api/{projects,papers,books}/<id>` | token | Delete an item and its media |
| POST | `/api/media` | token | Multipart upload (`file`, `folder`) → `{ url }` |
| DELETE | `/api/media` | token | `{ url }` → removes a local upload |
| GET | `/media/<path>` | – | Serve uploaded files |
| GET | `/api/auth/session` | – | `{ authenticated, configured }` for the current token |
| POST | `/api/auth/login` | – | `{ password }` → `{ token }` |
| POST | `/api/auth/logout` | – | Acknowledges sign-out (client drops the token) |

CORS preflight (`OPTIONS`) is answered automatically for allowed origins.

## Admin login

The admin area is protected by one password, stored as a hash:

```bash
flask --app backend hash-password
```

Put the printed value in `.env` as `ADMIN_PASSWORD_HASH` (single quotes are
safest) and restart the backend. Sign in at `/admin`; the returned token is kept
in the browser's `localStorage` for 12 hours (`ADMIN_TOKEN_MAX_AGE`). Logging out
discards it. Changing `SECRET_KEY` invalidates all existing tokens.

If `ADMIN_PASSWORD_HASH` is empty, `/admin` shows a setup message and login
returns 503. Failed attempts are throttled (5 per IP per 10 minutes).

## Media

- `PUBLIC_BASE_URL` must be the public origin of the API on PythonAnywhere, e.g.
  `https://yourusername.pythonanywhere.com` (no trailing slash). Uploads then
  return `https://yourusername.pythonanywhere.com/media/…`.
- Seed images use paths like `/projects/aqmrg.png`, which resolve against the
  **Vercel** site (they live in `public/`), not the API.
- To serve uploads directly from PythonAnywhere instead of through Flask, map
  `/media/` → `/home/USERNAME/Portfolio/instance/media` under **Web → Static
  files**. The URLs stay the same.

## Deploying the backend on PythonAnywhere

### 1. Upload the project

```bash
cd ~
git clone https://github.com/alxLenno/Portfolio.git Portfolio
```

Only the backend is needed on the server; `dist/` and `node_modules/` are not
required.

### 2. Install the backend

```bash
cd ~/Portfolio
mkvirtualenv venv --python=/usr/bin/python3.10   # or: python3 -m venv venv
pip install -r backend/requirements.txt
```

### 3. Configure `.env`

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"   # SECRET_KEY
flask --app backend hash-password                          # ADMIN_PASSWORD_HASH
nano .env
```

```bash
SECRET_KEY=…
ADMIN_PASSWORD_HASH='pbkdf2:sha256:600000$…'
PUBLIC_BASE_URL=https://yourusername.pythonanywhere.com
# Add your custom domain if the Vercel site does not use *.vercel.app:
# ALLOWED_ORIGINS=https://your-site.vercel.app,https://yourdomain.com
```

Then create the database and load the starter content:

```bash
flask --app backend init-db
flask --app backend seed
```

### 4. Create the web app

In the **Web** tab:

- **Add a new web app** → **Manual configuration** → the Python version used for
  the virtualenv.
- **Source code**: `/home/USERNAME/Portfolio`
- **Working directory**: `/home/USERNAME/Portfolio`
- **Virtualenv**: `/home/USERNAME/.virtualenvs/venv` (or
  `/home/USERNAME/Portfolio/venv` if you used `python3 -m venv`)
- **WSGI configuration file**: open the file linked there, **delete the sample
  code** PythonAnywhere puts in it (`from flask_app import app as application`),
  and replace it with [`deploy/pythonanywhere_wsgi.py`](deploy/pythonanywhere_wsgi.py),
  setting `PROJECT_DIR = '/home/USERNAME/Portfolio'` to your username. Save it.
- **Security → Force HTTPS**: *Enabled*.

Reload, then check `https://USERNAME.pythonanywhere.com/api/health` — it should
return `{"status": "ok", …}`. The root URL returns a small JSON index instead of
the website, which is expected: the site lives on Vercel.

### 5. Updating the backend

```bash
cd ~/Portfolio && git pull
pip install -r backend/requirements.txt   # only if dependencies changed
```

Then press **Reload** in the Web tab. Schema changes are idempotent and applied
on startup.

## Deploying the frontend on Vercel

The project is already connected to Vercel; the frontend needs to know where the
API lives. In **Vercel → Project → Settings → Environment Variables**, add for
Production (and Preview):

```bash
VITE_API_BASE_URL=https://yourusername.pythonanywhere.com
```

Remove the old `VITE_SUPABASE_*` variables if they are still there, then
redeploy — Vite bakes env vars in at build time, so a rebuild is required.

After that:

- Site: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/admin`

`vercel.json` keeps the SPA rewrite so deep links (including `/admin`) work.

If you attach a custom domain, add it to `ALLOWED_ORIGINS` on PythonAnywhere and
reload the backend.

## Backups

Everything that changes lives under `instance/` on PythonAnywhere:

- `instance/portfolio.db` — all content
- `instance/media/` — uploaded images, videos, PDFs, and book covers

```bash
sqlite3 ~/Portfolio/instance/portfolio.db ".backup ~/portfolio-backup.db"
```

Keep the free-tier disk quota (512 MB) in mind for video uploads.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ModuleNotFoundError: No module named 'flask_app'` | The WSGI file still contains PythonAnywhere's sample app — replace it with `deploy/pythonanywhere_wsgi.py` |
| Browser console CORS error | Add the exact frontend origin to `ALLOWED_ORIGINS` and reload |
| `401` on admin saves | Token expired (12 h) or `SECRET_KEY` changed — sign in again |
| `/admin` says "Admin not configured" | `ADMIN_PASSWORD_HASH` missing/empty; restart the backend |
| `/admin` says "Admin unavailable" | API unreachable; check `VITE_API_BASE_URL` and the PA error log |
| Uploaded images 404 on Vercel | Set `PUBLIC_BASE_URL` and restart the backend |
| `413` on upload | File is over `MAX_UPLOAD_MB` (default 50) |
| Login works but requests fail | Vercel env var added without redeploying |
| `/api/health` shows `"database": "error"` | `instance/` not writable or DB locked |

## Project structure

```
backend/
  __init__.py              app factory: config, CORS, security headers
  api.py                   CRUD routes, media upload/delete, /media serving
  auth.py                  password login, signed bearer tokens, throttling
  db.py                    SQLite connection helpers
  schema.sql               tables and indexes (idempotent)
  seed.py / seed.json      starter content importer + exported seed data
  cli.py                   init-db, seed, hash-password commands
  tests/                   pytest suite for the API, auth, CORS, media
deploy/
  pythonanywhere_wsgi.py   WSGI entry point for PythonAnywhere
scripts/
  export-seed.mjs          writes backend/seed.json from src/data.js
src/                       React app (pages, admin, API client, hooks)
public/                    static assets copied into dist/ (CV, certs, images)
```
