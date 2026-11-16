"""
Parser descendente recursivo para expresiones aritméticas.

Gramática:
    expr   → term (('+' | '-') term)*
    term   → factor (('*' | '/') factor)*
    factor → NÚMERO | '(' expr ')'

Precedencia: * / mayor que + -, asociatividad izquierda.

Cada nodo del AST tiene la forma:
    {"tipo": str, "valor": str, "izquierda": nodo|None, "derecha": nodo|None}
"""


class Parser:
    """Parser descendente recursivo que construye un AST."""

    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.errores = []

    def parse(self):
        """
        Parsea la lista de tokens y devuelve el AST.

        Returns:
            dict|None — el nodo raíz del AST, o None si hay errores.
        """
        if not self.tokens:
            self.errores.append({
                "caracter": None,
                "posicion": 1,
                "mensaje": "Error sintáctico: la expresión está vacía.",
            })
            return None

        ast = self._expr()

        # Si quedan tokens sin consumir, es un error
        if self.pos < len(self.tokens) and not self.errores:
            token = self.tokens[self.pos]
            self.errores.append({
                "caracter": token["valor"],
                "posicion": token["posicion"],
                "mensaje": (
                    f"Error sintáctico: token inesperado "
                    f"'{token['valor']}' en la posición {token['posicion']}."
                ),
            })

        return ast if not self.errores else None

    # ---- Reglas de la gramática ----

    def _expr(self):
        """expr → term (('+' | '-') term)*"""
        nodo = self._term()
        if nodo is None:
            return None

        while self._es_operador("+", "-"):
            op = self._actual()
            self.pos += 1
            derecha = self._term()
            if derecha is None:
                return None
            nodo = {
                "tipo": "OPERADOR",
                "valor": op["valor"],
                "izquierda": nodo,
                "derecha": derecha,
            }
        return nodo

    def _term(self):
        """term → factor (('*' | '/') factor)*"""
        nodo = self._factor()
        if nodo is None:
            return None

        while self._es_operador("*", "/"):
            op = self._actual()
            self.pos += 1
            derecha = self._factor()
            if derecha is None:
                return None
            nodo = {
                "tipo": "OPERADOR",
                "valor": op["valor"],
                "izquierda": nodo,
                "derecha": derecha,
            }
        return nodo

    def _factor(self):
        """factor → NÚMERO | '(' expr ')'"""
        token = self._actual()

        if token is None:
            # Se acabaron los tokens
            ultimo = self.tokens[-1] if self.tokens else None
            pos = (ultimo["posicion"] + len(ultimo["valor"])) if ultimo else 1
            self.errores.append({
                "caracter": None,
                "posicion": pos,
                "mensaje": (
                    "Error sintáctico: se esperaba un número o '(' "
                    "al final de la expresión."
                ),
            })
            return None

        # Número
        if token["tipo"] == "NÚMERO":
            self.pos += 1
            return {
                "tipo": "NÚMERO",
                "valor": token["valor"],
                "izquierda": None,
                "derecha": None,
            }

        # Paréntesis de apertura
        if token["tipo"] == "PARÉNTESIS" and token["valor"] == "(":
            self.pos += 1
            nodo = self._expr()
            if nodo is None:
                return None

            cierre = self._actual()
            if cierre and cierre["tipo"] == "PARÉNTESIS" and cierre["valor"] == ")":
                self.pos += 1
            else:
                self.errores.append({
                    "caracter": None,
                    "posicion": token["posicion"],
                    "mensaje": (
                        f"Error sintáctico: falta el paréntesis de cierre "
                        f"para el '(' en la posición {token['posicion']}."
                    ),
                })
                return None
            return nodo

        # Token inesperado
        self.errores.append({
            "caracter": token["valor"],
            "posicion": token["posicion"],
            "mensaje": (
                f"Error sintáctico: se esperaba un número o '(' "
                f"pero se encontró '{token['valor']}' "
                f"en la posición {token['posicion']}."
            ),
        })
        self.pos += 1
        return None

    # ---- Utilidades ----

    def _actual(self):
        """Devuelve el token en la posición actual o None."""
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def _es_operador(self, *valores):
        """True si el token actual es un OPERADOR con uno de los valores dados."""
        t = self._actual()
        return t is not None and t["tipo"] == "OPERADOR" and t["valor"] in valores


def parsear(tokens):
    """
    Función de conveniencia.

    Returns:
        (ast, errores)
    """
    p = Parser(tokens)
    ast = p.parse()
    return ast, p.errores

