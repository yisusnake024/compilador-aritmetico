export default function KpiBar({ resultado, iaDisponible, cargando }) {
  // Calcular métricas
  const totalTokens = resultado?.tokens?.length ?? 0;
  const totalSimbolos = resultado?.tabla_simbolos?.length ?? 0;

  // Profundidad del AST
  const calcularProfundidad = (nodo) => {
    if (!nodo) return 0;
    return 1 + Math.max(calcularProfundidad(nodo.izquierda), calcularProfundidad(nodo.derecha));
  };

  const profundidadAst = resultado?.ast ? calcularProfundidad(resultado.ast) : 0;

  // Estado del Pipeline
  let estadoPipeline = 'En espera';
  let clasePipeline = 'kpi-status-badge--pending';

  if (cargando) {
    estadoPipeline = 'Analizando…';
  } else if (resultado) {
    if (resultado.ok) {
      estadoPipeline = '3 Fases Completadas';
      clasePipeline = 'kpi-status-badge--success';
    } else {
      estadoPipeline = `Error ${resultado.fase === 'lexico' ? 'Léxico' : 'Sintáctico'}`;
      clasePipeline = 'kpi-status-badge--error';
    }
  }

  return (
    <div className="kpi-strip" aria-label="Telemetría rápida de compilación">
      <div className="kpi-strip__metrics">
        <div className="kpi-item">
          <span className="kpi-item__label">Tokens:</span>
          <strong className="kpi-item__value kpi-item__value--acento">
            {resultado ? totalTokens : '—'}
          </strong>
        </div>

        <div className="kpi-item">
          <span className="kpi-item__label">Profundidad AST:</span>
          <strong className="kpi-item__value">
            {profundidadAst > 0 ? `Nivel ${profundidadAst}` : '—'}
          </strong>
        </div>

        <div className="kpi-item">
          <span className="kpi-item__label">Direcciones Semánticas:</span>
          <strong className="kpi-item__value kpi-item__value--operador">
            {resultado ? totalSimbolos : '—'}
          </strong>
        </div>
      </div>

      <div className="kpi-strip__badges">
        {/* Badge Estado Compilador */}
        <span className={`kpi-status-badge ${clasePipeline}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
          {estadoPipeline}
        </span>

        {/* Badge Estado IA */}
        <span
          className={`kpi-status-badge ${
            iaDisponible ? 'kpi-status-badge--success' : 'kpi-status-badge--pending'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1l-3 4-3-4H8a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
          </svg>
          {iaDisponible ? 'Gemini 3.1 Activo' : 'IA Desconectada'}
        </span>
      </div>
    </div>
  );
}

