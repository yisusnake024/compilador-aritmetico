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

def test_parentesis_son_error_lexico():
    """Los paréntesis se consideran error léxico según el PDF del proyecto."""
    tokens, errores = tokenizar("(10 + 25)")
    # Debe haber 2 errores: '(' en pos 1 y ')' en pos 9
    assert len(errores) == 2
    caracteres_error = {e["caracter"] for e in errores}
    assert "(" in caracteres_error
    assert ")" in caracteres_error

def test_letras_son_error_lexico():
    """Letras también son error léxico."""
    tokens, errores = tokenizar("10 + x")
    assert len(errores) == 1
    assert errores[0]["caracter"] == "x"

def test_punto_decimal_es_error_lexico():
    """El punto decimal es error léxico (solo se aceptan enteros)."""
    tokens, errores = tokenizar("3.14 + 2")
    assert len(errores) >= 1
    assert any(e["caracter"] == "." for e in errores)

