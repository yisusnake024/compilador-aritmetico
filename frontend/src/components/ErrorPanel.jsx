export default function ErrorPanel({ errores, formula }) {
  if (!errores || errores.length === 0) return null;

  const posicionesError = new Set(errores.map((e) => e.posicion));

  return (
    <div className="panel-error">
      {/* Lista de errores */}
      <ul className="panel-error__lista">
        {errores.map((err, i) => (
          <li key={i} className="panel-error__item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{err.mensaje}</span>
          </li>
        ))}
      </ul>

      {/* Fórmula carácter por carácter */}
      {formula && (
        <div className="panel-error__formula" aria-label="Fórmula con errores resaltados">
          {formula.split('').map((char, i) => {
            const pos = i + 1;
            const esError = posicionesError.has(pos);
            return (
              <span
                key={i}
                className={`panel-error__char ${esError ? 'panel-error__char--error' : ''}`}
                aria-label={esError ? `Error en posición ${pos}: ${char}` : undefined}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      )}

      <p className="panel-error__nota">Posiciones contadas desde 1.</p>
    </div>
  );
}

