"""Portfolio backend: JSON API, admin media, and the built React app.

Local development:
    flask --app backend run --port 5001 --debug

Production (PythonAnywhere): see deploy/pythonanywhere_wsgi.py and the README.
"""

from __future__ import annotations

import logging
import os
import secrets
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlsplit

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

from . import db
from .api import api_bp, media_bp
from .auth import auth_bp
from .cli import register_cli

BASE_DIR = Path(__file__).resolve().parent.parent


def _env_flag(name, default=False):
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {'1', 'true', 'yes', 'on'}


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


def create_app(overrides=None):
    load_dotenv(BASE_DIR / '.env')

    app = Flask(__name__, static_folder=None)

    secret_key = os.environ.get('SECRET_KEY')
    if not secret_key:
        secret_key = secrets.token_hex(32)
        logging.getLogger(__name__).warning(
            'SECRET_KEY is not set. A temporary key was generated, so admin '
            'sessions will end whenever the app restarts. Set SECRET_KEY in .env.'
        )

    app.config.update(
        SECRET_KEY=secret_key,
        ADMIN_PASSWORD_HASH=(os.environ.get('ADMIN_PASSWORD_HASH') or '').strip(),
        DATABASE_PATH=str(_env_path('DATABASE_PATH', BASE_DIR / 'instance' / 'portfolio.db')),
        MEDIA_ROOT=str(_env_path('MEDIA_ROOT', BASE_DIR / 'instance' / 'media')),
        SPA_DIST=str(_env_path('SPA_DIST', BASE_DIR / 'dist')),
        MAX_CONTENT_LENGTH=int(os.environ.get('MAX_UPLOAD_MB', '50')) * 1024 * 1024,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        SESSION_COOKIE_SECURE=_env_flag('SESSION_COOKIE_SECURE', True),
        PERMANENT_SESSION_LIFETIME=timedelta(hours=12),
    )

    if overrides:
        app.config.update(overrides)

    Path(app.config['DATABASE_PATH']).parent.mkdir(parents=True, exist_ok=True)
    Path(app.config['MEDIA_ROOT']).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    register_cli(app)

    try:
        db.init_schema(app)
    except Exception:  # noqa: BLE001 - keep serving the SPA; /api/health reports it
        app.logger.exception(
            'Could not initialise the SQLite database at %s', app.config['DATABASE_PATH']
        )

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(media_bp, url_prefix='/media')

    @app.before_request
    def reject_cross_origin_writes():
        if request.method not in ('POST', 'PUT', 'PATCH', 'DELETE'):
            return None

        origin = request.headers.get('Origin')
        if not origin:
            return None

        if urlsplit(origin).netloc != request.host:
            return jsonify(error='Cross-origin request rejected.'), 403

        return None

    @app.after_request
    def set_security_headers(response):
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        return response

    @app.get('/')
    @app.get('/<path:path>')
    def serve_spa(path=''):
        if path.startswith(('api/', 'media/')):
            return jsonify(error='Not found.'), 404

        dist = Path(app.config['SPA_DIST'])

        if path and _safe_dist_file(dist, path) is not None:
            return send_from_directory(dist, path, conditional=True, max_age=31536000)

        if (dist / 'index.html').is_file():
            response = send_from_directory(dist, 'index.html', conditional=True, max_age=0)
            response.headers['Cache-Control'] = 'no-cache'
            return response

        return (
            jsonify(
                error='The frontend has not been built yet. Run "npm run build" and reload.'
            ),
            503,
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
