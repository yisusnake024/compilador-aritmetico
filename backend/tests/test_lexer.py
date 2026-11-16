from app.lexer import tokenizar

def test_tokenizar_valida():
    tokens, errores = tokenizar("10 + 25 * 10 - 4")
    assert not errores
    assert len(tokens) == 7
    assert [t["valor"] for t in tokens] == ["10", "+", "25", "*", "10", "-", "4"]
    assert [t["tipo"] for t in tokens] == [
        "NÚMERO", "OPERADOR", "NÚMERO", "OPERADOR", "NÚMERO", "OPERADOR", "NÚMERO"
    ]

def test_tokenizar_error_lexico():
    tokens, errores = tokenizar("12 + 4 # 3")
    assert len(errores) == 1
    assert errores[0]["caracter"] == "#"
    assert errores[0]["posicion"] == 8
    assert "Error léxico" in errores[0]["mensaje"]

