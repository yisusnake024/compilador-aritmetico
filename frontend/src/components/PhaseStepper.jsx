const FASES = [
  { clave: 'lexico', nombre: 'Léxico' },
  { clave: 'sintactico', nombre: 'Sintáctico' },
  { clave: 'semantico', nombre: 'Semántico' },
];

function IconoCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconoError() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconoPendiente() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

function IconoSkip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * estados: objeto con { lexico, sintactico, semantico }
 * Cada valor: 'pendiente' | 'correcta' | 'con-error' | 'no-ejecutada'
 */
export default function PhaseStepper({ estados }) {
  return (
    <div className="stepper" role="list" aria-label="Fases del compilador">
      {FASES.map((fase, i) => {
        const estado = estados[fase.clave] || 'pendiente';
        const claseEstado = `stepper__fase--${estado === 'con-error' ? 'error' : estado}`;

        return (
          <div key={fase.clave} style={{ display: 'contents' }}>
            {i > 0 && <div className="stepper__separador" aria-hidden="true" />}
            <div className={`stepper__fase ${claseEstado}`} role="listitem">
              <span className="stepper__icono" aria-hidden="true">
                {estado === 'correcta' && <IconoCheck />}
                {estado === 'con-error' && <IconoError />}
                {estado === 'pendiente' && <IconoPendiente />}
                {estado === 'no-ejecutada' && <IconoSkip />}
              </span>
              <span>
                {fase.nombre}
                {estado === 'con-error' && ' — Error'}
                {estado === 'no-ejecutada' && ' — No ejecutada'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

