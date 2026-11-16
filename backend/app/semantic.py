"""
Análisis semántico: tablas de símbolos y de tipos.

Recorre el AST en orden (in-order) y extrae cada nodo numérico
para construir las tablas. Cada ocurrencia obtiene su propia
dirección de memoria simulada.
"""


def analizar_semantica(ast):
    """
    Construye las tablas de símbolos y de tipos a partir del AST.

    Args:
        ast: nodo raíz del AST.

    Returns:
        (tabla_simbolos, tabla_tipos)
        tabla_simbolos: list[dict] con {simbolo, direccion}
        tabla_tipos:    list[dict] con {simbolo, tipo}
    """
    tabla_simbolos = []
    tabla_tipos = []
    contador = [0]

    def recorrer(nodo):
        if nodo is None:
            return

        # Recorrido in-order: izquierda → actual → derecha
        recorrer(nodo.get("izquierda"))

        if nodo["tipo"] == "NÚMERO":
            contador[0] += 1
            tabla_simbolos.append({
                "simbolo": nodo["valor"],
                "direccion": f"dir_{contador[0]}",
            })
            tabla_tipos.append({
                "simbolo": nodo["valor"],
                "tipo": "entero",
            })

        recorrer(nodo.get("derecha"))

    recorrer(ast)
    return tabla_simbolos, tabla_tipos

