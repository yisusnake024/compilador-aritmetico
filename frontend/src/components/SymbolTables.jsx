export default function SymbolTables({ tablaSimbolos, tablaTipos }) {
  if ((!tablaSimbolos || tablaSimbolos.length === 0) &&
    (!tablaTipos || tablaTipos.length === 0)) {
    return null;
  }

  return (
    <div className="tablas-semanticas">
      {/* Tabla de símbolos */}
      <div className="tablas-semanticas__grupo">
        <h4>Tabla de símbolos</h4>
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>Símbolo</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {(tablaSimbolos || []).map((fila, i) => (
                <tr key={i}>
                  <td>{fila.simbolo}</td>
                  <td>{fila.direccion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de tipos */}
      <div className="tablas-semanticas__grupo">
        <h4>Tabla de tipos</h4>
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>Símbolo</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {(tablaTipos || []).map((fila, i) => (
                <tr key={i}>
                  <td>{fila.simbolo}</td>
                  <td>{fila.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

