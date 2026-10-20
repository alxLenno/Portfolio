"""Shared pytest fixtures for the Flask backend."""

import sys
from pathlib import Path

import pytest
from werkzeug.security import generate_password_hash

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.auth import reset_login_throttle  # noqa: E402

ADMIN_PASSWORD = 'correct horse battery staple'
ALLOWED_ORIGIN = 'https://portfolio.example.test'


@pytest.fixture(autouse=True)
def _reset_throttle():
    reset_login_throttle()
    yield
    reset_login_throttle()


@pytest.fixture
def app(tmp_path, monkeypatch):
    dist = tmp_path / 'dist'
    dist.mkdir()
    (dist / 'index.html').write_text(
        '<!doctype html><html><body>spa shell</body></html>', encoding='utf-8'
    )
    (dist / 'assets').mkdir()
    (dist / 'assets' / 'app.js').write_text('console.log("ok")\n', encoding='utf-8')

    monkeypatch.setenv('SECRET_KEY', 'test-secret')
    monkeypatch.setenv(
        'ADMIN_PASSWORD_HASH',
        generate_password_hash(ADMIN_PASSWORD, method='pbkdf2:sha256:600000'),
    )
    monkeypatch.setenv('ADMIN_TOKEN_MAX_AGE', '43200')
    monkeypatch.setenv('PUBLIC_BASE_URL', 'https://api.example.test')
    monkeypatch.setenv('ALLOWED_ORIGINS', f'{ALLOWED_ORIGIN},https://*.vercel.app')
    monkeypatch.setenv('DATABASE_PATH', str(tmp_path / 'portfolio.db'))
    monkeypatch.setenv('MEDIA_ROOT', str(tmp_path / 'media'))
    monkeypatch.setenv('SPA_DIST', str(dist))

    from backend import create_app

    application = create_app({'TESTING': True})
    yield application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_token(client):
    response = client.post('/api/auth/login', json={'password': ADMIN_PASSWORD})
    assert response.status_code == 200
    return response.get_json()['token']


@pytest.fixture
def admin(client, admin_token):
    client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {admin_token}'
    return client
