export default function TokensTable({ tokens }) {
  if (!tokens || tokens.length === 0) return null;

  return (
    <div className="tabla-wrapper">
      <table className="tabla">
        <thead>
          <tr>
            <th>N.º</th>
            <th>Tipo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.n}>
              <td>{token.n}</td>
              <td>
                <span
                  className={`badge ${
                    token.tipo === 'NÚMERO'
                      ? 'badge--numero'
                      : 'badge--operador'
                  }`}
                >
                  {token.tipo}
                </span>
              </td>
              <td>{token.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

