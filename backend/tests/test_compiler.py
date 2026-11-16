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

def test_compilar_error_lexico():
    res = compilar("12 + 4 # 3")
    assert res["ok"] is False
    assert res["fase"] == "lexico"
    assert len(res["errores"]) == 1
    assert res["errores"][0]["caracter"] == "#"
    assert res["errores"][0]["posicion"] == 8

def test_compilar_error_sintactico():
    res = compilar("10 + ")
    assert res["ok"] is False
    assert res["fase"] == "sintactico"
    assert len(res["errores"]) >= 1

