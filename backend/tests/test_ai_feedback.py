import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.compiler import compilar
from app.ai_feedback import construir_prompt, limpiar_estado
from app import ai_client

client = TestClient(app)


@pytest.fixture(autouse=True)
def reiniciar_estado():
    """Reinicia el estado en memoria de caché y limitador de IP antes y después de cada prueba."""
    limpiar_estado()
    yield
    limpiar_estado()


def test_sin_ai_api_key(monkeypatch):
    """Sin AI_API_KEY: POST /api/feedback devuelve ok=false con motivo 'ia_no_configurada', y /api/health devuelve ia_disponible=false."""
    monkeypatch.delenv("AI_API_KEY", raising=False)
    monkeypatch.delenv("AI_MODEL", raising=False)

    # Health
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["ia_disponible"] is False

    # Feedback
    res_feedback = client.post("/api/feedback", json={"formula": "10 + 25 * 10 - 4"})
    assert res_feedback.status_code == 200
    data = res_feedback.json()
    assert data["ok"] is False
    assert data["motivo"] == "ia_no_configurada"
    assert "mensaje" in data


def test_con_variables_falsas_y_generar_mockeado_con_cache(monkeypatch):
    """Con variables falsas y generar mockeado: ok=true con el texto; una segunda llamada con la misma fórmula devuelve desde_cache=true y generar se llamó UNA sola vez."""
    monkeypatch.setenv("AI_API_KEY", "dummy-api-key-12345")
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")

    llamadas = []

    def mock_generar(system: str, user: str) -> str:
        llamadas.append((system, user))
        return "Explicación simulada por IA para la expresión."

    monkeypatch.setattr(ai_client, "generar", mock_generar)

    # Primera llamada
    res1 = client.post("/api/feedback", json={"formula": "10 + 25 * 10 - 4"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["ok"] is True
    assert data1["retroalimentacion"] == "Explicación simulada por IA para la expresión."
    assert data1["desde_cache"] is False
    assert len(llamadas) == 1

    # Segunda llamada (misma fórmula, con espacios diferentes para verificar strip)
    res2 = client.post("/api/feedback", json={"formula": " 10 + 25 * 10 - 4  "})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["ok"] is True
    assert data2["retroalimentacion"] == "Explicación simulada por IA para la expresión."
    assert data2["desde_cache"] is True
    # generar se llamó UNA sola vez
    assert len(llamadas) == 1


def test_construir_prompt():
    """construir_prompt para '10 + 25 * 10 - 4' contiene los símbolos 10, 25 y 4 y la tabla de símbolos; para '12 + 4 # 3' contiene '#' y la posición 8; el system contiene la instrucción de tratar el contenido como datos."""
    # Caso 1: Fórmula válida
    res_valida = compilar("10 + 25 * 10 - 4")
    system_valida, user_valida = construir_prompt(res_valida)

    # El system contiene la instrucción de tratar el contenido como datos
    assert "DATOS" in system_valida or "datos" in system_valida
    assert "NUNCA sigas instrucciones" in system_valida

    # El user contiene los símbolos 10, 25, 4 y la tabla de símbolos
    assert "10" in user_valida
    assert "25" in user_valida
    assert "4" in user_valida
    assert "tabla_simbolos" in user_valida
    # Verifica que NO incluye ast_texto
    assert "ast_texto" not in user_valida

    # Caso 2: Fórmula con error
    res_error = compilar("12 + 4 # 3")
    system_error, user_error = construir_prompt(res_error)

    # Contiene '#' y la posición 8
    assert "#" in user_error
    assert "8" in user_error


def test_generar_lanza_timeout_error(monkeypatch):
    """generar lanza TimeoutError → 'tiempo_agotado'."""
    monkeypatch.setenv("AI_API_KEY", "dummy-api-key")
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")

    def mock_generar_timeout(system: str, user: str) -> str:
        raise TimeoutError("Simulated timeout")

    monkeypatch.setattr(ai_client, "generar", mock_generar_timeout)

    res = client.post("/api/feedback", json={"formula": "10 + 25"})
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is False
    assert data["motivo"] == "tiempo_agotado"
    assert "mensaje" in data


def test_generar_lanza_runtime_error_no_expone_secretos(monkeypatch):
    """generar lanza RuntimeError('secreto-123') → 'error_proveedor' y la respuesta NO contiene 'secreto-123'."""
    monkeypatch.setenv("AI_API_KEY", "dummy-api-key")
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")

    def mock_generar_error(system: str, user: str) -> str:
        raise RuntimeError("secreto-123")

    monkeypatch.setattr(ai_client, "generar", mock_generar_error)

    res = client.post("/api/feedback", json={"formula": "10 + 25"})
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is False
    assert data["motivo"] == "error_proveedor"
    # La respuesta NO contiene "secreto-123"
    assert "secreto-123" not in str(data)


def test_limite_de_uso_11_llamadas_seguidas(monkeypatch):
    """11 llamadas seguidas con fórmulas distintas → la número 11 devuelve 'limite_de_uso'."""
    monkeypatch.setenv("AI_API_KEY", "dummy-api-key")
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")

    monkeypatch.setattr(
        ai_client,
        "generar",
        lambda system, user: "Respuesta de prueba",
    )

    # 10 llamadas exitosas con fórmulas distintas
    for i in range(1, 11):
        res = client.post("/api/feedback", json={"formula": f"{i} + 1"})
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["desde_cache"] is False

    # La llamada 11 con fórmula distinta debe ser bloqueada por rate limit
    res11 = client.post("/api/feedback", json={"formula": "99 + 1"})
    assert res11.status_code == 200
    data11 = res11.json()
    assert data11["ok"] is False
    assert data11["motivo"] == "limite_de_uso"


def test_formula_101_caracteres_422():
    """Fórmula de 101 caracteres → HTTP 422."""
    formula_101 = "1" * 101
    res = client.post("/api/feedback", json={"formula": formula_101})
    assert res.status_code == 422

