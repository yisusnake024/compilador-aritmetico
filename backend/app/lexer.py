"""
Analizador léxico para expresiones aritméticas.

Caracteres válidos:
  - Dígitos (0-9)             → tokens tipo NÚMERO
  - Operadores (+, -, *, /)   → tokens tipo OPERADOR
  - Paréntesis (, )           → tokens tipo PARÉNTESIS
  - Espacios                  → se ignoran

Cualquier otro carácter genera un error léxico.
Posiciones contadas desde 1.
"""


def tokenizar(formula):
    """
    Analiza léxicamente la fórmula.

    Returns:
        (tokens, errores)
        tokens:  list[dict] — cada token tiene {n, tipo, valor, posicion}
        errores: list[dict] — cada error tiene {caracter, posicion, mensaje}
    """
    tokens = []
    errores = []
    i = 0
    n = 1

    while i < len(formula):
        c = formula[i]

        # Ignorar espacios
        if c.isspace():
            i += 1
            continue

        # Números (secuencias de dígitos)
        if c.isdigit():
            inicio = i
            while i < len(formula) and formula[i].isdigit():
                i += 1
            valor = formula[inicio:i]
            tokens.append({
                "n": n,
                "tipo": "NÚMERO",
                "valor": valor,
                "posicion": inicio + 1,
            })
            n += 1
            continue

        # Operadores
        if c in "+-*/":
            tokens.append({
                "n": n,
                "tipo": "OPERADOR",
                "valor": c,
                "posicion": i + 1,
            })
            n += 1
            i += 1
            continue

        # Paréntesis
        if c in "()":
            tokens.append({
                "n": n,
                "tipo": "PARÉNTESIS",
                "valor": c,
                "posicion": i + 1,
            })
            n += 1
            i += 1
            continue

        # Carácter no válido
        errores.append({
            "caracter": c,
            "posicion": i + 1,
            "mensaje": f"Error léxico: carácter no válido '{c}' en la posición {i + 1}.",
        })
        i += 1

    return tokens, errores

