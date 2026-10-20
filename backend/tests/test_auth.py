"""Authentication behaviour for the admin area."""

from .conftest import ADMIN_PASSWORD


def test_session_starts_signed_out(client):
    response = client.get('/api/auth/session')

    assert response.status_code == 200
    assert response.get_json() == {'authenticated': False, 'configured': True}


def test_login_requires_a_password(client):
    response = client.post('/api/auth/login', json={})

    assert response.status_code == 400
    assert 'password' in response.get_json()['error'].lower()


def test_login_rejects_wrong_password(client):
    response = client.post('/api/auth/login', json={'password': 'nope'})

    assert response.status_code == 401


def test_login_and_logout(client):
    login = client.post('/api/auth/login', json={'password': ADMIN_PASSWORD})
    assert login.status_code == 200
    assert client.get('/api/auth/session').get_json()['authenticated'] is True

    logout = client.post('/api/auth/logout')
    assert logout.status_code == 200
    assert client.get('/api/auth/session').get_json()['authenticated'] is False


def test_repeated_failures_are_throttled(client):
    for _ in range(5):
        assert client.post('/api/auth/login', json={'password': 'nope'}).status_code == 401

    blocked = client.post('/api/auth/login', json={'password': ADMIN_PASSWORD})
    assert blocked.status_code == 429


def test_login_is_disabled_without_a_configured_hash(app, client):
    app.config['ADMIN_PASSWORD_HASH'] = ''

    assert client.get('/api/auth/session').get_json()['configured'] is False
    assert client.post('/api/auth/login', json={'password': 'x'}).status_code == 503


def test_cross_origin_login_is_rejected(client):
    response = client.post(
        '/api/auth/login',
        json={'password': ADMIN_PASSWORD},
        headers={'Origin': 'https://evil.example'},
    )

    assert response.status_code == 403
