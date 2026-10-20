"""JSON API for projects, research papers, books, and admin media uploads."""

from __future__ import annotations

import json
import re
import uuid
from urllib.parse import urlsplit

from flask import Blueprint, current_app, jsonify, request, send_from_directory

from . import db
from .auth import admin_configured, login_required
from .media import delete_media, media_root, save_upload

api_bp = Blueprint('api', __name__)
media_bp = Blueprint('media', __name__)

TEXT_LIMIT = 8000
URL_LIMIT = 2048

RESOURCES = {
    'projects': {
        'table': 'projects',
        'label': 'project',
        'required': ['name', 'description'],
        'media_fields': ['image_url', 'video_url'],
        'fields': {
            'name': {'type': 'text', 'required': True, 'max': 300},
            'description': {'type': 'text', 'required': True, 'max': TEXT_LIMIT},
            'tech': {'type': 'list', 'default': []},
            'live_url': {'type': 'url'},
            'github_url': {'type': 'url'},
            'image_url': {'type': 'url'},
            'video_url': {'type': 'url'},
            'sort_order': {'type': 'int', 'default': 0},
        },
    },
    'papers': {
        'table': 'research_papers',
        'label': 'research paper',
        'required': ['title', 'venue'],
        'media_fields': ['paper_url'],
        'fields': {
            'title': {'type': 'text', 'required': True, 'max': 500},
            'venue': {'type': 'text', 'required': True, 'max': 500},
            'status': {'type': 'text', 'max': 80, 'default': 'Presented'},
            'date_label': {'type': 'text', 'max': 80},
            'authors': {'type': 'text', 'max': 500},
            'abstract': {'type': 'text', 'max': TEXT_LIMIT},
            'paper_url': {'type': 'url'},
            'sort_order': {'type': 'int', 'default': 0},
        },
    },
    'books': {
        'table': 'books',
        'label': 'book',
        'required': ['title'],
        'media_fields': ['cover_url'],
        'fields': {
            'title': {'type': 'text', 'required': True, 'max': 300},
            'description': {'type': 'text', 'max': 4000},
            'authors': {'type': 'text', 'max': 300},
            'status': {'type': 'text', 'max': 60, 'default': 'Published'},
            'year_label': {'type': 'text', 'max': 40},
            'cover_url': {'type': 'url'},
            'link': {'type': 'url'},
            'sort_order': {'type': 'int', 'default': 0},
        },
    },
}

_INVALID = object()


def is_allowed_url(value):
    parsed = urlsplit(value)
    if parsed.scheme in ('http', 'https') and parsed.netloc:
        return True
    return not parsed.scheme and value.startswith('/')


def clean_value(name, raw, field, errors):
    kind = field['type']

    if kind == 'text':
        if raw is None:
            return None
        if not isinstance(raw, str):
            errors.append(f'{name} must be text.')
            return _INVALID
        cleaned = raw.strip()
        limit = field.get('max', TEXT_LIMIT)
        if len(cleaned) > limit:
            errors.append(f'{name} must be at most {limit} characters.')
            return _INVALID
        return cleaned or None

    if kind == 'url':
        if raw is None:
            return None
        if not isinstance(raw, str):
            errors.append(f'{name} must be text.')
            return _INVALID
        cleaned = raw.strip()
        if not cleaned:
            return None
        if len(cleaned) > URL_LIMIT:
            errors.append(f'{name} must be at most {URL_LIMIT} characters.')
            return _INVALID
        if not is_allowed_url(cleaned):
            errors.append(f'{name} must start with http://, https://, or /.')
            return _INVALID
        return cleaned

    if kind == 'list':
        if raw is None:
            return []
        if not isinstance(raw, list):
            errors.append(f'{name} must be a list.')
            return _INVALID
        entries = []
        for entry in raw:
            if not isinstance(entry, str):
                errors.append(f'{name} entries must be text.')
                return _INVALID
            entry = entry.strip()
            if entry:
                entries.append(entry)
        if len(entries) > 40:
            errors.append(f'{name} can hold at most 40 entries.')
            return _INVALID
        if any(len(entry) > 80 for entry in entries):
            errors.append(f'{name} entries must be at most 80 characters.')
            return _INVALID
        return entries

    if kind == 'int':
        if raw is None or raw == '':
            return 0
        if isinstance(raw, bool):
            errors.append(f'{name} must be a whole number.')
            return _INVALID
        if isinstance(raw, int):
            return raw
        if isinstance(raw, str) and re.fullmatch(r'-?\d{1,9}', raw.strip()):
            return int(raw.strip())
        errors.append(f'{name} must be a whole number.')
        return _INVALID

    errors.append(f'{name} has an unsupported type.')
    return _INVALID


def validated_payload(spec, partial):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, ['Send a JSON object.']

    fields = spec['fields']
    errors = []
    unknown = sorted(set(data) - set(fields))
    if unknown:
        errors.append('Unknown field(s): ' + ', '.join(unknown) + '.')

    payload = {}
    if not partial:
        for name, field in fields.items():
            if 'default' in field:
                payload[name] = field['default']

    for name, raw in data.items():
        field = fields.get(name)
        if field is None:
            continue
        value = clean_value(name, raw, field, errors)
        if value is not _INVALID:
            payload[name] = value

    for name in spec.get('required', []):
        if partial and name not in data:
            continue
        value = payload.get(name)
        if value is None or value == '' or value == []:
            errors.append(f'{name} is required.')

    return payload, errors


def encode_payload(spec, payload):
    encoded = dict(payload)
    for name, field in spec['fields'].items():
        if field['type'] == 'list' and name in encoded:
            encoded[name] = json.dumps(encoded[name])
    return encoded


def decode_list(raw):
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return []
    if not isinstance(parsed, list):
        return []
    return [entry for entry in parsed if isinstance(entry, str)]


def serialize(spec, row):
    data = dict(row)
    for name, field in spec['fields'].items():
        if field['type'] == 'list':
            data[name] = decode_list(data.get(name))
        elif name not in data:
            data[name] = None
    return data


def register_resource(resource, spec):
    table = spec['table']
    label = spec['label']

    def list_items():
        rows = db.query_all(
            f'SELECT * FROM {table} ORDER BY sort_order ASC, created_at ASC'
        )
        return jsonify([serialize(spec, row) for row in rows])

    def create_item():
        payload, errors = validated_payload(spec, partial=False)
        if errors:
            return jsonify(error=' '.join(errors)), 400

        record = encode_payload(spec, payload)
        record['id'] = str(uuid.uuid4())

        columns = ', '.join(record.keys())
        placeholders = ', '.join(['?'] * len(record))
        db.execute(
            f'INSERT INTO {table} ({columns}) VALUES ({placeholders})',
            tuple(record.values()),
        )

        row = db.query_one(f'SELECT * FROM {table} WHERE id = ?', (record['id'],))
        return jsonify(serialize(spec, row)), 201

    def update_item(item_id):
        row = db.query_one(f'SELECT * FROM {table} WHERE id = ?', (item_id,))
        if row is None:
            return jsonify(error=f'That {label} no longer exists.'), 404

        payload, errors = validated_payload(spec, partial=True)
        if errors:
            return jsonify(error=' '.join(errors)), 400
        if not payload:
            return jsonify(error='No changes were provided.'), 400

        record = encode_payload(spec, payload)
        assignments = ', '.join(f'{name} = ?' for name in record)
        db.execute(
            f'UPDATE {table} SET {assignments} WHERE id = ?',
            tuple(record.values()) + (item_id,),
        )

        updated = db.query_one(f'SELECT * FROM {table} WHERE id = ?', (item_id,))
        return jsonify(serialize(spec, updated))

    def delete_item(item_id):
        row = db.query_one(f'SELECT * FROM {table} WHERE id = ?', (item_id,))
        if row is None:
            return jsonify(error=f'That {label} no longer exists.'), 404

        db.execute(f'DELETE FROM {table} WHERE id = ?', (item_id,))
        for field in spec.get('media_fields', ()):
            delete_media(row[field])

        return '', 204

    api_bp.add_url_rule(
        f'/{resource}', endpoint=f'{resource}_list', view_func=list_items, methods=['GET']
    )
    api_bp.add_url_rule(
        f'/{resource}',
        endpoint=f'{resource}_create',
        view_func=login_required(create_item),
        methods=['POST'],
    )
    api_bp.add_url_rule(
        f'/{resource}/<item_id>',
        endpoint=f'{resource}_update',
        view_func=login_required(update_item),
        methods=['PATCH', 'PUT'],
    )
    api_bp.add_url_rule(
        f'/{resource}/<item_id>',
        endpoint=f'{resource}_delete',
        view_func=login_required(delete_item),
        methods=['DELETE'],
    )


for _resource, _spec in RESOURCES.items():
    register_resource(_resource, _spec)


@api_bp.get('/health')
def health():
    try:
        db.query_one('SELECT 1 AS ok')
        database = 'ok'
    except Exception:  # noqa: BLE001 - reported, not raised, so /api/health stays useful
        current_app.logger.exception('Database health check failed.')
        database = 'error'

    return jsonify(
        status='ok' if database == 'ok' else 'degraded',
        database=database,
        admin_configured=admin_configured(),
    )


@api_bp.post('/media')
@login_required
def upload_media():
    uploaded = request.files.get('file')
    if uploaded is None or not uploaded.filename:
        return jsonify(error='No file was uploaded.'), 400

    folder = request.form.get('folder', 'images')
    try:
        url = save_upload(uploaded, folder)
    except ValueError as error:
        return jsonify(error=str(error)), 400

    return jsonify(url=url), 201


@api_bp.delete('/media')
@login_required
def remove_media():
    payload = request.get_json(silent=True)
    url = payload.get('url') if isinstance(payload, dict) else None
    if not isinstance(url, str) or not url:
        return jsonify(error='A media URL is required.'), 400

    return jsonify(deleted=delete_media(url))


@media_bp.get('/<path:filename>')
def serve_media(filename):
    response = send_from_directory(
        media_root(), filename, conditional=True, max_age=31536000
    )
    response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response
