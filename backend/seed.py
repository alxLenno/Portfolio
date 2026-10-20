"""Seed the SQLite database from the starter content in backend/seed.json."""

from __future__ import annotations

import json
import uuid
from pathlib import Path

from . import db

DEFAULT_SEED_PATH = Path(__file__).with_name('seed.json')

RESOURCES = {
    'projects': {
        'table': 'projects',
        'natural_key': 'name',
        'fields': [
            'name',
            'description',
            'tech',
            'live_url',
            'github_url',
            'image_url',
            'video_url',
            'sort_order',
        ],
    },
    'papers': {
        'table': 'research_papers',
        'natural_key': 'title',
        'fields': [
            'title',
            'venue',
            'status',
            'date_label',
            'authors',
            'abstract',
            'paper_url',
            'sort_order',
        ],
    },
    'books': {
        'table': 'books',
        'natural_key': 'title',
        'fields': [
            'title',
            'description',
            'authors',
            'status',
            'year_label',
            'cover_url',
            'link',
            'sort_order',
        ],
    },
}


def load_seed_file(path=DEFAULT_SEED_PATH):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def seed_data(payload, force=False):
    """Insert seed rows, skipping duplicates. Returns (inserted, skipped)."""
    inserted = 0
    skipped = 0

    for resource, entries in payload.items():
        config = RESOURCES.get(resource)
        if config is None or not isinstance(entries, list):
            continue

        table = config['table']
        natural_key = config['natural_key']

        for entry in entries:
            if not isinstance(entry, dict):
                continue

            key_value = entry.get(natural_key)
            if not isinstance(key_value, str) or not key_value.strip():
                continue

            if not force and db.query_one(
                f'SELECT id FROM {table} WHERE {natural_key} = ?', (key_value,)
            ):
                skipped += 1
                continue

            values = {name: entry.get(name) for name in config['fields'] if name in entry}
            if 'tech' in values and isinstance(values['tech'], list):
                values['tech'] = json.dumps(values['tech'])

            record = {'id': str(uuid.uuid4()), **values}
            columns = ', '.join(record)
            placeholders = ', '.join(['?'] * len(record))
            db.execute(
                f'INSERT INTO {table} ({columns}) VALUES ({placeholders})',
                tuple(record.values()),
            )
            inserted += 1

    return inserted, skipped
