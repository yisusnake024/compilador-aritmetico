"""
Análisis semántico: tablas de símbolos y de tipos.

Recorre el AST en orden (in-order) y extrae cada nodo numérico
para construir las tablas. Un número repetido se registra una sola vez
(el PDF requiere símbolos únicos), asignando la dirección al primer
encuentro y manteniendo el orden de aparición en la fórmula.
Posiciones contadas desde 1.
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
    vistos = set()       # valores ya registrados (deduplicación)
    contador = [0]

    def recorrer(nodo):
        if nodo is None:
            return

        # Recorrido in-order: izquierda → actual → derecha
        recorrer(nodo.get("izquierda"))

        if nodo["tipo"] == "NÚMERO":
            valor = nodo["valor"]
            if valor not in vistos:          # solo registrar la primera aparición
                vistos.add(valor)
                contador[0] += 1
                tabla_simbolos.append({
                    "simbolo": valor,
                    "direccion": f"dir_{contador[0]}",
                })
                tabla_tipos.append({
                    "simbolo": valor,
                    "tipo": "entero",
                })

        recorrer(nodo.get("derecha"))

    recorrer(ast)
    return tabla_simbolos, tabla_tipos

