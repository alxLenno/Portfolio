"""API, media, and frontend-serving behaviour."""

import io
from urllib.parse import urlsplit

import pytest

from .conftest import ALLOWED_ORIGIN

PNG_BYTES = b'\x89PNG\r\n\x1a\n' + b'\x00' * 32
PUBLIC_BASE = 'https://api.example.test'


def upload(client, folder='images', filename='shot.png', content=PNG_BYTES):
    return client.post(
        '/api/media',
        data={'file': (io.BytesIO(content), filename), 'folder': folder},
        content_type='multipart/form-data',
    )


def test_health(client):
    payload = client.get('/api/health').get_json()

    assert payload['status'] == 'ok'
    assert payload['database'] == 'ok'
    assert payload['admin_configured'] is True


@pytest.mark.parametrize('resource', ['projects', 'papers', 'books'])
def test_collections_start_empty(client, resource):
    response = client.get(f'/api/{resource}')

    assert response.status_code == 200
    assert response.get_json() == []


def test_writes_require_authentication(client):
    response = client.post('/api/projects', json={'name': 'x', 'description': 'y'})

    assert response.status_code == 401


def test_an_invalid_token_is_rejected(client):
    response = client.post(
        '/api/projects',
        json={'name': 'x', 'description': 'y'},
        headers={'Authorization': 'Bearer nope'},
    )

    assert response.status_code == 401


def test_project_crud(admin):
    created = admin.post(
        '/api/projects',
        json={
            'name': 'Sensor node',
            'description': 'A test project',
            'tech': ['C', 'MQTT'],
            'live_url': 'https://example.com',
            'sort_order': 3,
        },
    )
    assert created.status_code == 201

    project = created.get_json()
    assert project['name'] == 'Sensor node'
    assert project['tech'] == ['C', 'MQTT']
    assert project['id']

    listing = admin.get('/api/projects').get_json()
    assert [item['name'] for item in listing] == ['Sensor node']

    updated = admin.patch(
        f"/api/projects/{project['id']}", json={'name': 'Renamed', 'tech': []}
    )
    assert updated.status_code == 200
    assert updated.get_json()['name'] == 'Renamed'
    assert updated.get_json()['tech'] == []

    removed = admin.delete(f"/api/projects/{project['id']}")
    assert removed.status_code == 204
    assert admin.get('/api/projects').get_json() == []

    missing = admin.patch(f"/api/projects/{project['id']}", json={'name': 'x'})
    assert missing.status_code == 404


def test_project_validation(admin):
    missing_description = admin.post('/api/projects', json={'name': 'Only a name'})
    assert missing_description.status_code == 400
    assert 'required' in missing_description.get_json()['error']

    unknown_field = admin.post(
        '/api/projects', json={'name': 'x', 'description': 'y', 'bogus': 1}
    )
    assert unknown_field.status_code == 400

    bad_tech = admin.post(
        '/api/projects', json={'name': 'x', 'description': 'y', 'tech': 'C'}
    )
    assert bad_tech.status_code == 400

    bad_url = admin.post(
        '/api/projects',
        json={'name': 'x', 'description': 'y', 'live_url': 'javascript:alert(1)'},
    )
    assert bad_url.status_code == 400


@pytest.mark.parametrize(
    ('resource', 'payload'),
    [
        (
            'papers',
            {
                'title': 'A paper',
                'venue': 'A conference',
                'status': 'Published',
                'authors': 'A. Author',
                'abstract': 'An abstract.',
                'paper_url': 'https://example.com/paper.pdf',
                'sort_order': 1,
            },
        ),
        (
            'books',
            {
                'title': 'A book',
                'status': 'Upcoming',
                'year_label': '2026',
                'description': 'A description.',
                'link': 'https://example.com/book',
                'sort_order': 2,
            },
        ),
    ],
)
def test_papers_and_books_crud(admin, resource, payload):
    created = admin.post(f'/api/{resource}', json=payload)
    assert created.status_code == 201

    item = created.get_json()
    for field, value in payload.items():
        assert item[field] == value

    updated = admin.patch(f'/api/{resource}/{item["id"]}', json={'status': 'Under Review'})
    assert updated.status_code == 200
    assert updated.get_json()['status'] == 'Under Review'

    assert admin.delete(f'/api/{resource}/{item["id"]}').status_code == 204
    assert admin.get(f'/api/{resource}').get_json() == []


def test_media_upload_returns_an_absolute_url(admin):
    response = upload(admin)
    assert response.status_code == 201

    url = response.get_json()['url']
    assert url.startswith(f'{PUBLIC_BASE}/media/images/')
    assert url.endswith('.png')

    served = admin.get(urlsplit(url).path)
    assert served.status_code == 200
    assert served.data == PNG_BYTES
    assert 'immutable' in served.headers['Cache-Control']


def test_media_can_be_deleted_using_its_absolute_url(admin):
    url = upload(admin).get_json()['url']

    deleted = admin.delete('/api/media', json={'url': url})
    assert deleted.get_json() == {'deleted': True}
    assert admin.get(urlsplit(url).path).status_code == 404


def test_media_upload_requires_authentication(client):
    assert upload(client).status_code == 401


def test_media_upload_rejects_unsupported_files(admin):
    wrong_extension = upload(admin, filename='notes.txt')
    assert wrong_extension.status_code == 400
    assert 'Unsupported' in wrong_extension.get_json()['error']

    unknown_folder = upload(admin, folder='unknown')
    assert unknown_folder.status_code == 400


def test_media_delete_ignores_external_urls(admin):
    response = admin.delete('/api/media', json={'url': 'https://example.com/x.png'})

    assert response.status_code == 200
    assert response.get_json() == {'deleted': False}


def test_deleting_a_project_removes_its_uploaded_media(admin):
    url = upload(admin).get_json()['url']

    project = admin.post(
        '/api/projects',
        json={'name': 'With image', 'description': 'Has a screenshot', 'image_url': url},
    ).get_json()

    assert admin.delete(f"/api/projects/{project['id']}").status_code == 204
    assert admin.get(urlsplit(url).path).status_code == 404


def test_allowed_origin_can_write(admin):
    response = admin.post(
        '/api/projects',
        json={'name': 'From Vercel', 'description': 'Cross-origin write'},
        headers={'Origin': ALLOWED_ORIGIN},
    )

    assert response.status_code == 201
    assert response.headers['Access-Control-Allow-Origin'] == ALLOWED_ORIGIN


def test_cross_origin_writes_are_rejected(admin):
    response = admin.post(
        '/api/projects',
        json={'name': 'x', 'description': 'y'},
        headers={'Origin': 'https://evil.example'},
    )

    assert response.status_code == 403


def test_local_build_is_served_when_present(client):
    for path in ('/', '/about', '/admin'):
        response = client.get(path)
        assert response.status_code == 200
        assert b'spa shell' in response.data
        assert response.headers['Cache-Control'] == 'no-cache'


def test_hashed_assets_are_served(client):
    response = client.get('/assets/app.js')

    assert response.status_code == 200
    assert response.data == b'console.log("ok")\n'
    assert 'max-age=31536000' in response.headers['Cache-Control']


def test_api_only_deployment_returns_a_json_index(app, client, tmp_path):
    app.config['SPA_DIST'] = str(tmp_path / 'not-built')

    root = client.get('/')
    assert root.status_code == 200
    assert root.get_json()['service'] == 'portfolio-api'

    page = client.get('/about')
    assert page.status_code == 404
    assert 'hosted separately' in page.get_json()['error']


def test_unknown_api_and_media_paths_are_json_404(client):
    api_response = client.get('/api/unknown')
    assert api_response.status_code == 404
    assert api_response.is_json

    media_response = client.get('/media/missing.png')
    assert media_response.status_code == 404
    assert media_response.is_json


def test_seed_is_idempotent(app, client):
    from backend.seed import load_seed_file, seed_data

    payload = load_seed_file()
    expected = sum(len(entries) for entries in payload.values())

    with app.app_context():
        assert seed_data(payload) == (expected, 0)

    with app.app_context():
        assert seed_data(payload) == (0, expected)

    for resource, entries in payload.items():
        assert len(client.get(f'/api/{resource}').get_json()) == len(entries)
