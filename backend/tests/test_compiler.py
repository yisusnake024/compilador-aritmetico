from app.compiler import compilar

def test_compilar_exito():
    res = compilar("10 + 25 * 10 - 4")
    assert res["ok"] is True
    assert res["formula"] == "10 + 25 * 10 - 4"
    assert len(res["tokens"]) == 7
    assert res["ast"]["valor"] == "-"
    assert "tabla_simbolos" in res
    assert "tabla_tipos" in res
    assert res["ast_texto"] != ""

def test_compilar_exito_deduplicacion():
    """El 10 aparece dos veces pero la tabla de símbolos lo registra una sola vez."""
    res = compilar("10 + 25 * 10 - 4")
    assert res["ok"] is True
    simbolos = [s["simbolo"] for s in res["tabla_simbolos"]]
    assert simbolos.count("10") == 1  # deduplicado
    assert len(res["tabla_simbolos"]) == 3  # 10, 25, 4

def test_compilar_error_lexico():
    res = compilar("12 + 4 # 3")
    assert res["ok"] is False
    assert res["fase"] == "lexico"
    assert len(res["errores"]) == 1
    assert res["errores"][0]["caracter"] == "#"
    assert res["errores"][0]["posicion"] == 8

def test_compilar_parentesis_es_error_lexico():
    """Paréntesis debe generar error léxico según el PDF."""
    res = compilar("(10 + 25)")
    assert res["ok"] is False
    assert res["fase"] == "lexico"

def test_compilar_error_sintactico():
    res = compilar("10 + ")
    assert res["ok"] is False
    assert res["fase"] == "sintactico"
    assert len(res["errores"]) >= 1

