"""Local media storage for files uploaded from the admin page."""

from __future__ import annotations

import uuid
from pathlib import Path
from urllib.parse import urlsplit

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


def public_media_url(relative_path):
    """Absolute URL when PUBLIC_BASE_URL is set, so the Vercel frontend can load it."""
    base = (current_app.config.get('PUBLIC_BASE_URL') or '').rstrip('/')
    return f'{base}{MEDIA_URL_PREFIX}{relative_path}'


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

    return public_media_url(f'{folder}/{filename}')


def relative_media_path(url):
    """Return the path under the media root for a /media/... URL, else None."""
    if not isinstance(url, str) or not url.strip():
        return None

    path = urlsplit(url).path
    if not path.startswith(MEDIA_URL_PREFIX):
        return None

    relative = path[len(MEDIA_URL_PREFIX):]
    return relative or None


def delete_media(url):
    """Delete a file stored under the media root. Returns True when removed."""
    relative = relative_media_path(url)
    if relative is None:
        return False

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
