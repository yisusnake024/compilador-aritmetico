"""
Renderizado del AST como árbol ASCII multilínea.

Produce un texto legible con la estructura del árbol usando
caracteres / y \\ para las ramas.
"""


def renderizar_ast(nodo):
    """
    Convierte un AST a una representación ASCII multilínea.

    Args:
        nodo: dict con {tipo, valor, izquierda, derecha}

    Returns:
        str — árbol ASCII multilínea.
    """
    if nodo is None:
        return ""
    lineas, _ancho, _centro = _renderizar(nodo)
    return "\n".join(lineas)


def _renderizar(nodo):
    """
    Construye recursivamente las líneas del árbol.

    Returns:
        (lineas: list[str], ancho: int, centro: int)
        donde centro es la columna del primer carácter del valor raíz.
    """
    if nodo is None:
        return [], 0, 0

    valor = str(nodo["valor"])
    len_val = len(valor)
    izq = nodo.get("izquierda")
    der = nodo.get("derecha")

    # Hoja
    if izq is None and der is None:
        return [valor], len_val, len_val // 2

    # Subárboles
    l_lineas, l_ancho, l_centro = _renderizar(izq) if izq else ([], 0, 0)
    r_lineas, r_ancho, r_centro = _renderizar(der) if der else ([], 0, 0)

    # ---- Ambos hijos ----
    if l_lineas and r_lineas:
        # Calcular posiciones
        barra_izq = l_centro + 1       # columna del /
        raiz_col = barra_izq + 1       # inicio del valor raíz
        barra_der = raiz_col + len_val  # columna del \\
        r_offset = barra_der + 1 - r_centro  # inicio del bloque derecho

        # Asegurar que no se solapen los bloques
        if r_offset < l_ancho + 1:
            r_offset = l_ancho + 1
            barra_der = r_offset + r_centro - 1
            raiz_col = barra_der - len_val
            barra_izq = raiz_col - 1
            # Asegurar que la raíz quede a la derecha del centro izquierdo
            if raiz_col <= l_centro:
                desplazamiento = l_centro - raiz_col + 2
                r_offset += desplazamiento
                barra_der += desplazamiento
                raiz_col += desplazamiento
                barra_izq += desplazamiento

        ancho_total = max(r_offset + r_ancho, barra_der + 1, raiz_col + len_val)

        lineas = []

        # Línea de la raíz
        lineas.append(" " * raiz_col + valor)

        # Línea de ramas
        ramas = [" "] * ancho_total
        if 0 <= barra_izq < ancho_total:
            ramas[barra_izq] = "/"
        if 0 <= barra_der < ancho_total:
            ramas[barra_der] = "\\"
        lineas.append("".join(ramas).rstrip())

        # Fusionar bloques hijos lado a lado
        max_h = max(len(l_lineas), len(r_lineas))
        for i in range(max_h):
            parte_izq = l_lineas[i] if i < len(l_lineas) else ""
            parte_der = r_lineas[i] if i < len(r_lineas) else ""
            linea = parte_izq.ljust(r_offset) + parte_der
            lineas.append(linea.rstrip())

        return lineas, ancho_total, raiz_col

    # ---- Solo hijo izquierdo ----
    if l_lineas:
        raiz_col = l_centro + 2
        barra_col = l_centro + 1
        ancho_total = max(l_ancho, raiz_col + len_val)

        lineas = [" " * raiz_col + valor]
        ramas = [" "] * ancho_total
        ramas[barra_col] = "/"
        lineas.append("".join(ramas).rstrip())
        lineas.extend(l_lineas)

        return lineas, ancho_total, raiz_col

    # ---- Solo hijo derecho ----
    if r_lineas:
        raiz_col = 0
        barra_col = len_val
        r_offset = barra_col + 1
        ancho_total = r_offset + r_ancho

        lineas = [valor]
        ramas = [" "] * ancho_total
        ramas[barra_col] = "\\"
        lineas.append("".join(ramas).rstrip())
        lineas.extend(" " * r_offset + l for l in r_lineas)

        return lineas, ancho_total, raiz_col

    # Caso base de seguridad
    return [valor], len_val, len_val // 2

