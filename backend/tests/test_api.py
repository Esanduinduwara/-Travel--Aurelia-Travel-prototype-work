import os
import tempfile

# Must be set before app.main is imported so tests never touch backend/data.
os.environ['AURELIA_DATA_DIR'] = tempfile.mkdtemp(prefix='aurelia-test-')
os.environ['CORS_ORIGINS'] = 'https://aurelia.example.pages.dev'
os.environ.pop('SMTP_HOST', None)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app, DATA  # noqa: E402

client = TestClient(app)


def signup(email='guest@example.com', password='password123'):
    return client.post('/api/auth/signup', json={
        'email': email, 'password': password, 'first_name': 'Test', 'last_name': 'Guest',
    })


def login(email='guest@example.com', password='password123'):
    return client.post('/api/auth/login', json={'email': email, 'password': password})


def auth_header(email='guest@example.com', password='password123'):
    return {'Authorization': f"Bearer {login(email, password).json()['token']}"}


def test_health():
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_destinations_list_and_detail():
    items = client.get('/api/destinations').json()
    assert len(items) == 6
    assert client.get(f"/api/destinations/{items[0]['id']}").status_code == 200
    assert client.get('/api/destinations/9999').status_code == 404


def test_signup_login_me():
    assert signup().status_code == 200
    assert signup().status_code == 400  # duplicate
    r = login()
    assert r.status_code == 200 and r.json()['token']
    assert login(password='wrong-password').status_code == 401
    me = client.get('/api/auth/me', headers=auth_header())
    assert me.status_code == 200 and me.json()['email'] == 'guest@example.com'
    assert client.get('/api/auth/me').status_code == 401


def test_signup_rejects_short_password_and_bad_email():
    r = client.post('/api/auth/signup', json={'email': 'x@example.com', 'password': 'short', 'first_name': 'a', 'last_name': 'b'})
    assert r.status_code == 400
    r = client.post('/api/auth/signup', json={'email': 'not-an-email', 'password': 'password123', 'first_name': 'a', 'last_name': 'b'})
    assert r.status_code == 422


def test_admin_signup_requires_invite_code():
    body = {'email': 'boss@example.com', 'password': 'password123', 'first_name': 'A', 'last_name': 'B', 'invite_code': 'wrong'}
    assert client.post('/api/auth/admin-signup', json=body).status_code == 403


def test_customer_messages_flow():
    signup('msg@example.com')
    h = auth_header('msg@example.com')
    r = client.post('/api/messages', headers=h, json={'subject': 'Japan trip', 'destination': 'japan'})
    assert r.status_code == 200 and r.json()['status'] == 'new'
    assert len(client.get('/api/messages/mine', headers=h).json()) == 1


def test_admin_endpoints_forbid_customers():
    signup('plain@example.com')
    h = auth_header('plain@example.com')
    assert client.get('/api/admin/users', headers=h).status_code == 403
    assert client.get('/api/admin/messages').status_code == 401


def test_enquiry_create_and_validation():
    body = {'first_name': 'Ann', 'last_name': 'Lee', 'email': 'ann@example.com', 'destination': 'japan', 'travellers': '2', 'message': 'Hi'}
    r = client.post('/api/enquiries', json=body)
    assert r.status_code == 200 and r.json()['id']
    assert client.post('/api/enquiries', json={**body, 'email': 'bad'}).status_code == 422


def test_chat_reply_and_empty_message():
    r = client.post('/api/chat', json={'message': 'tell me about japan'})
    assert r.status_code == 200 and 'Japan' in r.json()['reply']
    assert client.post('/api/chat', json={'message': '   '}).status_code == 400


def test_cors_uses_configured_origin_only():
    ok = client.options('/api/chat', headers={
        'Origin': 'https://aurelia.example.pages.dev',
        'Access-Control-Request-Method': 'POST',
    })
    assert ok.headers.get('access-control-allow-origin') == 'https://aurelia.example.pages.dev'
    bad = client.options('/api/chat', headers={
        'Origin': 'https://evil.example.com',
        'Access-Control-Request-Method': 'POST',
    })
    assert 'access-control-allow-origin' not in bad.headers


def test_data_written_to_configured_directory():
    assert (DATA / 'aurelia.db').exists()


def test_password_reset_flow(monkeypatch):
    import app.main as main

    signup('reset@example.com')
    monkeypatch.setenv('SMTP_HOST', 'smtp.example.com')
    monkeypatch.setenv('SMTP_USER', 'sender@example.com')
    monkeypatch.setenv('SMTP_PASSWORD', 'secret')
    sent = {}
    monkeypatch.setattr(main, 'send_password_reset_email', lambda to, url: sent.update(to=to, url=url))

    r = client.post('/api/auth/forgot-password', json={'email': 'RESET@example.com'})
    assert r.status_code == 200
    token = sent['url'].split('token=')[1]
    assert sent['to'] == 'reset@example.com'

    assert client.post('/api/auth/reset-password', json={'token': token, 'password': 'newpassword1'}).status_code == 200
    assert login('reset@example.com', 'newpassword1').status_code == 200
    assert client.post('/api/auth/reset-password', json={'token': token, 'password': 'another123'}).status_code == 400


def test_forgot_password_unconfigured_returns_503(monkeypatch):
    for key in ('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'):
        monkeypatch.delenv(key, raising=False)
    assert client.post('/api/auth/forgot-password', json={'email': 'nobody@example.com'}).status_code == 503
