"""Authentication and CORS behaviour for the admin API."""

from .conftest import ADMIN_PASSWORD, ALLOWED_ORIGIN


def login(client, password=ADMIN_PASSWORD, origin=None):
    headers = {'Origin': origin} if origin else {}
    return client.post('/api/auth/login', json={'password': password}, headers=headers)


def test_session_starts_signed_out(client):
    response = client.get('/api/auth/session')

    assert response.status_code == 200
    assert response.get_json() == {'authenticated': False, 'configured': True}


def test_login_requires_a_password(client):
    response = client.post('/api/auth/login', json={})

    assert response.status_code == 400
    assert 'password' in response.get_json()['error'].lower()


def test_login_rejects_wrong_password(client):
    assert login(client, password='nope').status_code == 401


def test_login_returns_a_token_that_authenticates_requests(client):
    response = login(client)
    assert response.status_code == 200

    token = response.get_json()['token']
    assert token

    session = client.get('/api/auth/session', headers={'Authorization': f'Bearer {token}'})
    assert session.get_json() == {'authenticated': True, 'configured': True}


def test_invalid_token_is_rejected(client):
    response = client.get('/api/auth/session', headers={'Authorization': 'Bearer not-a-token'})

    assert response.get_json()['authenticated'] is False


def test_logout_acknowledges_and_the_client_drops_the_token(client):
    response = client.post('/api/auth/logout')

    assert response.status_code == 200
    assert response.get_json() == {'authenticated': False}


def test_repeated_failures_are_throttled(client):
    for _ in range(5):
        assert login(client, password='nope').status_code == 401

    assert login(client).status_code == 429


def test_login_is_disabled_without_a_configured_hash(app, client):
    app.config['ADMIN_PASSWORD_HASH'] = ''

    assert client.get('/api/auth/session').get_json()['configured'] is False
    assert login(client).status_code == 503


def test_configured_origin_gets_cors_headers(client):
    response = login(client, origin=ALLOWED_ORIGIN)

    assert response.status_code == 200
    assert response.headers['Access-Control-Allow-Origin'] == ALLOWED_ORIGIN
    assert 'Origin' in response.headers['Vary']


def test_vercel_previews_are_allowed_by_default(client):
    origin = 'https://portfolio-git-main-user.vercel.app'
    response = client.get('/api/projects', headers={'Origin': origin})

    assert response.status_code == 200
    assert response.headers['Access-Control-Allow-Origin'] == origin


def test_unknown_origins_are_rejected(client):
    response = login(client, origin='https://evil.example')

    assert response.status_code == 403


def test_preflight_requests_are_answered(client):
    response = client.options(
        '/api/projects',
        headers={
            'Origin': ALLOWED_ORIGIN,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization, content-type',
        },
    )

    assert response.status_code == 204
    assert response.headers['Access-Control-Allow-Origin'] == ALLOWED_ORIGIN
    assert 'POST' in response.headers['Access-Control-Allow-Methods']
    assert 'Authorization' in response.headers['Access-Control-Allow-Headers']
