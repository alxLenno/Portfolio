"""Session-based authentication for the single admin account."""

from __future__ import annotations

import time
from functools import wraps
from threading import Lock

from flask import Blueprint, current_app, jsonify, request, session
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

MAX_ATTEMPTS = 5
WINDOW_SECONDS = 10 * 60

_failures = {}
_failures_lock = Lock()


def admin_configured():
    return bool(current_app.config.get('ADMIN_PASSWORD_HASH'))


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get('admin'):
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
    return jsonify(authenticated=bool(session.get('admin')), configured=admin_configured())


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
    session.clear()
    session.permanent = True
    session['admin'] = True
    return jsonify(authenticated=True)


@auth_bp.post('/logout')
def logout():
    session.clear()
    return jsonify(authenticated=False)
