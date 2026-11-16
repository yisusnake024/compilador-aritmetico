import { useState } from 'react';

/**
 * Renderizador limpio de texto enriquecido / Markdown para la explicación de la IA.
 * Convierte encabezados (###), negritas (**texto**), código (`expr`), listas (*, -, •)
 * en elementos HTML estilizados sin mostrar caracteres crudos como ###, **, etc.
 */
function FormattedFeedback({ texto }) {
  if (!texto) return null;

  const lineas = texto.split('\n');
  const elementos = [];
  let listaActual = [];

  const parseInline = (linea) => {
    const partes = [];
    let restante = linea;
    let idx = 0;

    // Tokens: **bold** o `code`
    const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/;
    while (restante.length > 0) {
      const match = restante.match(regex);
      if (!match) {
        partes.push(restante);
        break;
      }
      const matchIndex = match.index;
      if (matchIndex > 0) {
        partes.push(restante.substring(0, matchIndex));
      }
      if (match[2]) {
        // Bold
        partes.push(<strong key={idx++} className="feedback-bold">{match[2]}</strong>);
      } else if (match[3]) {
        // Inline code
        partes.push(<code key={idx++} className="feedback-code">{match[3]}</code>);
      }
      restante = restante.substring(matchIndex + match[0].length);
    }
    return partes;
  };

  const flushLista = (key) => {
    if (listaActual.length > 0) {
      elementos.push(
        <ul key={`ul-${key}`} className="feedback-lista">
          {listaActual.map((item, i) => (
            <li key={i} className="feedback-lista__item">{parseInline(item)}</li>
          ))}
        </ul>
      );
      listaActual = [];
    }
  };

  lineas.forEach((linea, index) => {
    const trimmed = linea.trim();

    // Separadores (--- o ***)
    if (trimmed === '---' || trimmed === '***') {
      flushLista(index);
      elementos.push(<hr key={`hr-${index}`} className="feedback-hr" />);
      return;
    }

    // Encabezados (###, ##, #)
    if (trimmed.startsWith('#')) {
      flushLista(index);
      const textoHeader = trimmed.replace(/^#+\s*/, '');
      elementos.push(
        <h4 key={`h-${index}`} className="feedback-heading">
          {parseInline(textoHeader)}
        </h4>
      );
      return;
    }

    // Listas (*, -, •)
    if (/^[\*\-•]\s+/.test(trimmed)) {
      const textoItem = trimmed.replace(/^[\*\-•]\s+/, '');
      listaActual.push(textoItem);
      return;
    }

    // Línea vacía
    if (!trimmed) {
      flushLista(index);
      return;
    }

    // Párrafo normal
    flushLista(index);
    elementos.push(
      <p key={`p-${index}`} className="feedback-parrafo">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushLista('final');

  return <div className="feedback-documento">{elementos}</div>;
}

export default function FeedbackPanel({
  iaDisponible,
  formula,
  onPedir,
  resetKey,
}) {
  const [estado, setEstado] = useState('inactivo'); // 'inactivo' | 'cargando' | 'exito' | 'fallo'
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [ultimoResetKey, setUltimoResetKey] = useState(resetKey);

  // Reiniciar cuando la clave de reset cambia
  if (resetKey !== ultimoResetKey) {
    setUltimoResetKey(resetKey);
    setEstado('inactivo');
    setResultado(null);
    setError(null);
  }

  const pedir = async () => {
    if (!iaDisponible || !formula) return;
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
      {/* Nota fija con tamaño controlado */}
      <p className="panel-feedback__nota">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Explicación generada por IA. Las fases anteriores se calculan sin IA.
      </p>

      {/* Botón y acciones iniciales */}
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

      {/* Éxito: Explicación formateada limpiamente sin símbolos crudos */}
      {estado === 'exito' && resultado && (
        <div>
          <div className="panel-feedback__resultado">
            <FormattedFeedback texto={resultado.retroalimentacion} />
          </div>
          <div className="panel-feedback__acciones" style={{ marginTop: 10 }}>
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

function CopyButton({ texto }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  return (
    <button
      type="button"
      className="btn-secundario"
      onClick={copiar}
      aria-label="Copiar retroalimentación al portapapeles"
    >
      {copiado ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar explicación
        </>
      )}
    </button>
  );
}
