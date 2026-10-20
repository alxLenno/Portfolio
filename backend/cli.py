"""Flask CLI commands: database setup, seeding, and password hashing."""

from __future__ import annotations

import json
from pathlib import Path

import click
from werkzeug.security import generate_password_hash

from . import db
from .seed import DEFAULT_SEED_PATH, load_seed_file, seed_data


def register_cli(app):
    @app.cli.command('init-db')
    def init_db_command():
        """Create the SQLite tables and indexes if they do not exist."""
        db.init_schema(app)
        click.echo(f'Database ready at {app.config["DATABASE_PATH"]}')

    @app.cli.command('seed')
    @click.option(
        '--file',
        'seed_file',
        type=click.Path(exists=True, dir_okay=False, path_type=Path),
        default=DEFAULT_SEED_PATH,
        show_default=True,
        help='JSON file with starter projects, papers, and books.',
    )
    @click.option(
        '--force',
        is_flag=True,
        help='Insert rows even when an item with the same name/title already exists.',
    )
    def seed_command(seed_file, force):
        """Load starter content from backend/seed.json."""
        payload = load_seed_file(seed_file)
        inserted, skipped = seed_data(payload, force=force)
        click.echo(f'Inserted {inserted} row(s), skipped {skipped} existing row(s).')

    @app.cli.command('hash-password')
    @click.option(
        '--password',
        prompt='Admin password',
        hide_input=True,
        confirmation_prompt=True,
        help='Password to hash (prompted when omitted).',
    )
    def hash_password(password):
        """Print a value for ADMIN_PASSWORD_HASH."""
        # PBKDF2 keeps the hash portable: some Python builds (notably macOS
        # system Python) ship hashlib without scrypt support.
        click.echo(generate_password_hash(password, method='pbkdf2:sha256:600000'))
