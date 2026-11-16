from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "ia_disponible" in data

def test_api_compile_ok():
    res = client.post("/api/compile", json={"formula": "10 + 25 * 10 - 4"})
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "ast" in data

def test_api_compile_error():
    res = client.post("/api/compile", json={"formula": "12 + 4 # 3"})
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is False
    assert data["fase"] == "lexico"

