"""Portfolio backend: a JSON API for projects, research papers, books, and media.

The React frontend is hosted separately (Vercel). This app runs on
PythonAnywhere and serves only /api/* and /media/* — if a local `dist/` build is
present it will also serve it, which is handy for offline checks.

Local development:
    flask --app backend run --port 5001 --debug

Production: see deploy/pythonanywhere_wsgi.py and the README.
"""

from __future__ import annotations

import logging
import os
import secrets
from fnmatch import fnmatch
from pathlib import Path
from urllib.parse import urlsplit

from dotenv import load_dotenv
from flask import Flask, current_app, jsonify, request, send_from_directory

from . import db
from .api import api_bp, media_bp
from .auth import auth_bp
from .cli import register_cli

BASE_DIR = Path(__file__).resolve().parent.parent

DEFAULT_ALLOWED_ORIGINS = (
    'http://localhost:5173,'
    'http://127.0.0.1:5173,'
    'https://*.vercel.app'
)


def _env_path(name, default):
    raw = os.environ.get(name)
    return Path(raw).expanduser().resolve() if raw else Path(default).resolve()


def _safe_dist_file(dist, relative):
    try:
        candidate = (dist / relative).resolve()
        candidate.relative_to(dist.resolve())
    except (ValueError, OSError):
        return None

    return candidate if candidate.is_file() else None


def _origin_allowed(origin):
    if not origin:
        return False

    if urlsplit(origin).netloc == request.host:
        return True

    patterns = [
        pattern.strip()
        for pattern in current_app.config.get('ALLOWED_ORIGINS', '').split(',')
        if pattern.strip()
    ]
    return any(fnmatch(origin, pattern) for pattern in patterns)


def _apply_cors(response, origin):
    if not origin or not _origin_allowed(origin):
        return response

    response.headers['Access-Control-Allow-Origin'] = origin
    vary = [part.strip() for part in (response.headers.get('Vary') or '').split(',') if part.strip()]
    if 'Origin' not in vary:
        response.headers['Vary'] = ', '.join(vary + ['Origin'])
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    response.headers['Access-Control-Max-Age'] = '600'
    return response


def create_app(overrides=None):
    load_dotenv(BASE_DIR / '.env')

    app = Flask(__name__, static_folder=None)

    secret_key = os.environ.get('SECRET_KEY')
    if not secret_key:
        secret_key = secrets.token_hex(32)
        logging.getLogger(__name__).warning(
            'SECRET_KEY is not set. A temporary key was generated, so admin '
            'tokens will stop working whenever the app restarts. Set SECRET_KEY in .env.'
        )

    app.config.update(
        SECRET_KEY=secret_key,
        ADMIN_PASSWORD_HASH=(os.environ.get('ADMIN_PASSWORD_HASH') or '').strip(),
        ADMIN_TOKEN_MAX_AGE=int(os.environ.get('ADMIN_TOKEN_MAX_AGE', '43200')),
        PUBLIC_BASE_URL=(os.environ.get('PUBLIC_BASE_URL') or '').strip().rstrip('/'),
        ALLOWED_ORIGINS=os.environ.get('ALLOWED_ORIGINS', DEFAULT_ALLOWED_ORIGINS),
        DATABASE_PATH=str(_env_path('DATABASE_PATH', BASE_DIR / 'instance' / 'portfolio.db')),
        MEDIA_ROOT=str(_env_path('MEDIA_ROOT', BASE_DIR / 'instance' / 'media')),
        SPA_DIST=str(_env_path('SPA_DIST', BASE_DIR / 'dist')),
        MAX_CONTENT_LENGTH=int(os.environ.get('MAX_UPLOAD_MB', '50')) * 1024 * 1024,
    )

    if overrides:
        app.config.update(overrides)

    Path(app.config['DATABASE_PATH']).parent.mkdir(parents=True, exist_ok=True)
    Path(app.config['MEDIA_ROOT']).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    register_cli(app)

    try:
        db.init_schema(app)
    except Exception:  # noqa: BLE001 - keep the API up; /api/health reports it
        app.logger.exception(
            'Could not initialise the SQLite database at %s', app.config['DATABASE_PATH']
        )

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(media_bp, url_prefix='/media')

    @app.before_request
    def enforce_allowed_origins():
        origin = request.headers.get('Origin')

        if request.method == 'OPTIONS':
            if origin and not _origin_allowed(origin):
                return jsonify(error='Origin not allowed.'), 403
            return _apply_cors(app.make_response(('', 204)), origin)

        if origin and not _origin_allowed(origin):
            return jsonify(error='Origin not allowed.'), 403

        return None

    @app.after_request
    def apply_response_headers(response):
        response = _apply_cors(response, request.headers.get('Origin'))
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        return response

    @app.get('/')
    @app.get('/<path:path>')
    def serve_frontend_or_api_index(path=''):
        if path.startswith(('api/', 'media/')):
            return jsonify(error='Not found.'), 404

        dist = Path(app.config['SPA_DIST'])

        if (dist / 'index.html').is_file():
            if path and _safe_dist_file(dist, path) is not None:
                return send_from_directory(dist, path, conditional=True, max_age=31536000)

            response = send_from_directory(dist, 'index.html', conditional=True, max_age=0)
            response.headers['Cache-Control'] = 'no-cache'
            return response

        if path:
            return (
                jsonify(
                    error='Not found. This deployment serves the portfolio API; '
                    'the site itself is hosted separately.'
                ),
                404,
            )

        return jsonify(
            service='portfolio-api',
            status='ok',
            health='/api/health',
            public_endpoints=['/api/projects', '/api/papers', '/api/books'],
        )

    @app.errorhandler(404)
    def handle_not_found(_error):
        return jsonify(error='Not found.'), 404

    @app.errorhandler(413)
    def handle_too_large(_error):
        limit_mb = app.config['MAX_CONTENT_LENGTH'] // (1024 * 1024)
        return jsonify(error=f'That file is too large. The limit is {limit_mb} MB.'), 413

    @app.errorhandler(500)
    def handle_server_error(_error):
        return jsonify(error='Something went wrong on the server.'), 500

    return app
