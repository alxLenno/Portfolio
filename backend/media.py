"""Local media storage for files uploaded from the admin page."""

from __future__ import annotations

import uuid
from pathlib import Path

from flask import current_app

MEDIA_URL_PREFIX = '/media/'

FOLDER_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'},
    'videos': {'mp4', 'webm', 'ogg', 'mov'},
    'papers': {'pdf'},
    'books': {'png', 'jpg', 'jpeg', 'webp', 'avif'},
}


def media_root():
    return Path(current_app.config['MEDIA_ROOT'])


def extension_of(filename):
    suffix = Path(filename or '').suffix.lower().lstrip('.')
    return suffix if suffix.isalnum() else ''


def save_upload(file_storage, folder):
    """Validate and store an uploaded file, returning its public URL."""
    if folder not in FOLDER_EXTENSIONS:
        allowed_folders = ', '.join(sorted(FOLDER_EXTENSIONS))
        raise ValueError(f'Unknown media folder. Use one of: {allowed_folders}.')

    extension = extension_of(file_storage.filename)
    if extension not in FOLDER_EXTENSIONS[folder]:
        allowed = ', '.join(sorted(FOLDER_EXTENSIONS[folder]))
        raise ValueError(f'Unsupported file type. Allowed extensions: {allowed}.')

    destination = media_root() / folder
    destination.mkdir(parents=True, exist_ok=True)

    filename = f'{uuid.uuid4().hex}.{extension}'
    file_storage.save(destination / filename)

    return f'{MEDIA_URL_PREFIX}{folder}/{filename}'


def delete_media(url):
    """Delete a file stored under the media root. Returns True when removed."""
    if not isinstance(url, str) or not url.startswith(MEDIA_URL_PREFIX):
        return False

    relative = url[len(MEDIA_URL_PREFIX):].split('?', 1)[0].split('#', 1)[0]
    root = media_root().resolve()
    target = (root / relative).resolve()

    try:
        target.relative_to(root)
    except ValueError:
        # Paths that escape the media root are never touched.
        return False

    if not target.is_file():
        return False

    target.unlink()
    return True
