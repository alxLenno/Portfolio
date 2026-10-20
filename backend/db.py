"""SQLite helpers shared by the HTTP API, CLI commands, and tests."""

from __future__ import annotations

import sqlite3
from pathlib import Path

from flask import current_app, g

SCHEMA_PATH = Path(__file__).with_name('schema.sql')


def get_db():
    """Return the request-scoped SQLite connection, opening it on first use."""
    if 'db' not in g:
        database_path = Path(current_app.config['DATABASE_PATH'])
        database_path.parent.mkdir(parents=True, exist_ok=True)

        connection = sqlite3.connect(str(database_path), timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA busy_timeout = 5000')
        connection.execute('PRAGMA foreign_keys = ON')
        g.db = connection

    return g.db


def close_db(_exception=None):
    connection = g.pop('db', None)
    if connection is not None:
        connection.close()


def init_schema(app):
    """Create tables and indexes. Safe to run on every startup."""
    with app.app_context():
        connection = get_db()
        connection.executescript(SCHEMA_PATH.read_text(encoding='utf-8'))
        connection.commit()


def query_all(sql, params=()):
    return get_db().execute(sql, params).fetchall()


def query_one(sql, params=()):
    return get_db().execute(sql, params).fetchone()


def execute(sql, params=()):
    connection = get_db()
    cursor = connection.execute(sql, params)
    connection.commit()
    return cursor


def init_app(app):
    app.teardown_appcontext(close_db)
