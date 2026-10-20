"""Token-based authentication for the single admin account.

The React app is hosted separately (Vercel), so admin auth uses a signed bearer
token instead of a cookie — third-party cookies are blocked by several browsers.
"""

from __future__ import annotations

import time
from functools import wraps
from threading import Lock

from flask import Blueprint, current_app, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

MAX_ATTEMPTS = 5
WINDOW_SECONDS = 10 * 60
TOKEN_SALT = 'portfolio-admin'

_failures = {}
_failures_lock = Lock()


def _serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt=TOKEN_SALT)


def issue_token():
    return _serializer().dumps({'admin': True})


def token_is_valid(token):
    if not isinstance(token, str) or not token:
        return False

    try:
        payload = _serializer().loads(
            token, max_age=current_app.config['ADMIN_TOKEN_MAX_AGE']
        )
    except (SignatureExpired, BadSignature, TypeError, ValueError):
        return False

    return isinstance(payload, dict) and payload.get('admin') is True


def bearer_token():
    header = request.headers.get('Authorization', '')
    scheme, _, value = header.partition(' ')
    if scheme.lower() != 'bearer':
        return None
    return value.strip() or None


def is_authenticated():
    return token_is_valid(bearer_token())


def admin_configured():
    return bool(current_app.config.get('ADMIN_PASSWORD_HASH'))


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not is_authenticated():
            return jsonify(error='Authentication required.'), 401
        return view(*args, **kwargs)

    return wrapped


def reset_login_throttle():
    """Test helper: forget recorded failed attempts."""
    with _failures_lock:
        _failures.clear()


def _attempt_key():
    return request.remote_addr or 'unknown'


def _recent_failures(key):
    now = time.monotonic()
    with _failures_lock:
        attempts = [stamp for stamp in _failures.get(key, []) if now - stamp < WINDOW_SECONDS]
        _failures[key] = attempts
        return attempts


def _record_failure(key):
    with _failures_lock:
        _failures.setdefault(key, []).append(time.monotonic())


def _clear_failures(key):
    with _failures_lock:
        _failures.pop(key, None)


@auth_bp.get('/session')
def session_state():
    return jsonify(authenticated=is_authenticated(), configured=admin_configured())


@auth_bp.post('/login')
def login():
    if not admin_configured():
        return jsonify(error='Admin login is not configured on this server.'), 503

    payload = request.get_json(silent=True)
    password = payload.get('password') if isinstance(payload, dict) else None
    if not isinstance(password, str) or not password:
        return jsonify(error='Enter the admin password.'), 400

    key = _attempt_key()
    if len(_recent_failures(key)) >= MAX_ATTEMPTS:
        return jsonify(error='Too many attempts. Try again in a few minutes.'), 429

    try:
        valid = check_password_hash(current_app.config['ADMIN_PASSWORD_HASH'], password)
    except (TypeError, ValueError):
        current_app.logger.exception('ADMIN_PASSWORD_HASH is not a valid password hash.')
        return jsonify(error='Admin login is misconfigured on this server.'), 503

    if not valid:
        _record_failure(key)
        return jsonify(error='Incorrect password.'), 401

    _clear_failures(key)
    return jsonify(authenticated=True, token=issue_token())


@auth_bp.post('/logout')
def logout():
    # Tokens are stateless; the client discards its copy. Expiry bounds abuse.
    return jsonify(authenticated=False)
