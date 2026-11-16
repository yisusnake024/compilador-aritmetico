"""
Orquestador del compilador aritmético.

Ejecuta las tres fases en orden:
    1. Análisis léxico   (lexer)
    2. Análisis sintáctico (parser)
    3. Análisis semántico  (semantic)

Se detiene en la primera fase que produzca errores.
"""

from .lexer import tokenizar
from .parser import parsear
from .ast_render import renderizar_ast
from .semantic import analizar_semantica


def compilar(formula):
    """
    Compila una fórmula aritmética a través de las tres fases.

    Args:
        formula: str — la fórmula a analizar.

    Returns:
        dict con la estructura definida en el contrato de la API.
    """
    # ---- Fase 1: Análisis léxico ----
    tokens, errores_lex = tokenizar(formula)

    if errores_lex:
        return {
            "ok": False,
            "formula": formula,
            "fase": "lexico",
            "errores": errores_lex,
        }

    # Verificar que haya tokens (fórmula no vacía)
    if not tokens:
        return {
            "ok": False,
            "formula": formula,
            "fase": "sintactico",
            "errores": [{
                "caracter": None,
                "posicion": 1,
                "mensaje": "Error sintáctico: la expresión está vacía.",
            }],
        }

    # ---- Fase 2: Análisis sintáctico ----
    ast, errores_sin = parsear(tokens)

    if errores_sin:
        return {
            "ok": False,
            "formula": formula,
            "fase": "sintactico",
            "errores": errores_sin,
        }

    # ---- Fase 3: Renderizado del AST + análisis semántico ----
    ast_texto = renderizar_ast(ast)
    tabla_simbolos, tabla_tipos = analizar_semantica(ast)

    # Eliminar campo interno "posicion" de los tokens para la respuesta
    tokens_api = [
        {"n": t["n"], "tipo": t["tipo"], "valor": t["valor"]}
        for t in tokens
    ]

    return {
        "ok": True,
        "formula": formula,
        "tokens": tokens_api,
        "ast": ast,
        "ast_texto": ast_texto,
        "tabla_simbolos": tabla_simbolos,
        "tabla_tipos": tabla_tipos,
    }

