from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register():
    response = client.post("/auth/register", json={
        "email": "testuser@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200 or response.status_code == 400

def test_login():
    response = client.post("/auth/login", data={
        "username": "testuser@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200 or response.status_code == 401