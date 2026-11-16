from app.lexer import tokenizar
from app.parser import parsear

def test_parsear_valida():
    tokens, _ = tokenizar("10 + 25 * 10 - 4")
    ast, errores = parsear(tokens)
    assert not errores
    assert ast is not None
    assert ast["tipo"] == "OPERADOR"
    assert ast["valor"] == "-"

def test_parsear_error_sintactico():
    tokens, _ = tokenizar("10 + + 5")
    ast, errores = parsear(tokens)
    assert ast is None
    assert len(errores) > 0
    assert errores[0]["posicion"] == 6

