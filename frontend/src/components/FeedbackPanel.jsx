import { useState } from 'react';
import { CopyButton } from './AstView.jsx';

/**
 * Props:
 *  - iaDisponible: boolean
 *  - formula: string (la fórmula actual)
 *  - onPedir: (formula) => Promise<resultado>
 *  - resetKey: any — cambia cada vez que se analiza una fórmula nueva
 */
export default function FeedbackPanel({ iaDisponible, formula, onPedir, resetKey }) {
  const [estado, setEstado] = useState('inactivo'); // inactivo | cargando | exito | fallo
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [ultimoResetKey, setUltimoResetKey] = useState(resetKey);

  // Reiniciar cuando cambia la fórmula analizada
  if (resetKey !== ultimoResetKey) {
    setEstado('inactivo');
    setResultado(null);
    setError(null);
    setUltimoResetKey(resetKey);
  }

  const pedir = async () => {
    setEstado('cargando');
    setError(null);
    try {
      const res = await onPedir(formula);
      if (res.ok) {
        setResultado(res);
        setEstado('exito');
      } else {
        setError(res.mensaje || 'Error al obtener retroalimentación.');
        setEstado('fallo');
      }
    } catch {
      setError('No se pudo conectar con el servicio de IA.');
      setEstado('fallo');
    }
  };

  return (
    <div className="panel-feedback">
      {/* Nota fija */}
      <p className="panel-feedback__nota">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Explicación generada por IA. Las fases anteriores se calculan sin IA.
      </p>

      {/* Botón y acciones */}
      {estado === 'inactivo' && (
        <div className="panel-feedback__acciones">
          <button
            type="button"
            className="btn-secundario"
            onClick={pedir}
            disabled={!iaDisponible || !formula}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1l-3 4-3-4H8a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
            </svg>
            Pedir retroalimentación
          </button>
          {!iaDisponible && (
            <span className="panel-feedback__deshabilitado">
              La IA no está configurada en el backend.
            </span>
          )}
        </div>
      )}

      {/* Cargando: skeleton */}
      {estado === 'cargando' && (
        <div className="skeleton" aria-label="Cargando retroalimentación">
          <div className="skeleton__linea" />
          <div className="skeleton__linea" />
          <div className="skeleton__linea" />
          <div className="skeleton__linea" />
        </div>
      )}

      {/* Éxito */}
      {estado === 'exito' && resultado && (
        <div>
          <div className="panel-feedback__resultado">
            {resultado.retroalimentacion}
          </div>
          <div className="panel-feedback__acciones" style={{ marginTop: 8 }}>
            <CopyButton texto={resultado.retroalimentacion} />
            {resultado.desde_cache && (
              <span className="panel-feedback__cache">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Respuesta guardada
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fallo */}
      {estado === 'fallo' && (
        <div className="panel-feedback__error">
          <span>{error}</span>
          <div>
            <button type="button" className="btn-secundario" onClick={pedir}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

