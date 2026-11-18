import { useMemo, useState } from 'react';

export default function SymbolTables({ tablaSimbolos, tablaTipos, formula, tokens }) {
  const [tabActiva, setTabActiva] = useState('traza'); // 'traza' | 'formulas' | 'tablas'

  if ((!tablaSimbolos || tablaSimbolos.length === 0) &&
    (!tablaTipos || tablaTipos.length === 0)) {
    return null;
  }

  // Analizar paso a paso todos los números de la fórmula
  const trazaOperaciones = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    const tokensNumeros = tokens.filter((t) => t.tipo === 'NÚMERO');
    const simbolosVistos = new Map(); // valor -> direccion
    const pasos = [];
    let contadorDir = 0;

    tokensNumeros.forEach((tok, index) => {
      const val = tok.valor;
      const yaExiste = simbolosVistos.has(val);

      if (!yaExiste) {
        contadorDir += 1;
        const dir = `dir_${contadorDir}`;
        simbolosVistos.set(val, dir);
        pasos.push({
          paso: index + 1,
          token: tok,
          valor: val,
          posicion: tok.posicion,
          esDuplicado: false,
          direccion: dir,
          tipo: 'entero',
          explicacion: `Primera aparición de '${val}'. Se le asigna la nueva dirección secuencial ${dir} y se declara de tipo 'entero'.`,
        });
      } else {
        const dirPrevia = simbolosVistos.get(val);
        pasos.push({
          paso: index + 1,
          token: tok,
          valor: val,
          posicion: tok.posicion,
          esDuplicado: true,
          direccion: dirPrevia,
          tipo: 'entero',
          explicacion: `El valor '${val}' ya fue registrado previamente en ${dirPrevia}. Por regla del proyecto (símbolos únicos), se omite crear una nueva dirección.`,
        });
      }
    });

    return pasos;
  }, [tokens]);

  const totalUnicos = tablaSimbolos?.length || 0;
  const totalEncontrados = trazaOperaciones.length;
  const totalDuplicados = totalEncontrados - totalUnicos;

  return (
    <div className="semantica-container">
      {/* Resumen superior */}
      <div className="semantica-banner">
        <div className="semantica-banner__item">
          <span className="semantica-banner__label">Fórmula evaluada</span>
          <code className="semantica-banner__code">{formula || 'Fórmula activa'}</code>
        </div>
        <div className="semantica-banner__item">
          <span className="semantica-banner__label">Operandos numéricos</span>
          <span className="semantica-banner__val">{totalEncontrados} total ({totalUnicos} únicos{totalDuplicados > 0 ? `, ${totalDuplicados} repetido${totalDuplicados > 1 ? 's' : ''}` : ''})</span>
        </div>
        <div className="semantica-banner__item">
          <span className="semantica-banner__label">Dominio semántico</span>
          <span className="semantica-banner__val badge badge--numero">ℤ (Números Enteros)</span>
        </div>
      </div>

      {/* Selector de vistas */}
      <div className="semantica-nav">
        <button
          type="button"
          onClick={() => setTabActiva('traza')}
          className={`semantica-nav__btn ${tabActiva === 'traza' ? 'semantica-nav__btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Paso a Paso de la Fórmula ({trazaOperaciones.length} pasos)
        </button>
        <button
          type="button"
          onClick={() => setTabActiva('formulas')}
          className={`semantica-nav__btn ${tabActiva === 'formulas' ? 'semantica-nav__btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Fundamento Teórico & Fórmulas Formales
        </button>
        <button
          type="button"
          onClick={() => setTabActiva('tablas')}
          className={`semantica-nav__btn ${tabActiva === 'tablas' ? 'semantica-nav__btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          Tablas Resultantes (Símbolos y Tipos)
        </button>
      </div>

      {/* VISTA 1: PASO A PASO DETALLADO */}
      {tabActiva === 'traza' && (
        <div className="semantica-traza-wrap">
          <div className="semantica-guia-contextual">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              El analizador semántico examina cada operando según aparece en el recorrido de la fórmula. Observa cómo se aplica la regla de deduplicación y la asignación secuencial:
            </span>
          </div>

          <div className="semantica-timeline">
            {trazaOperaciones.map((op, idx) => (
              <div
                key={idx}
                className={`semantica-card-paso ${op.esDuplicado ? 'semantica-card-paso--duplicado' : 'semantica-card-paso--nuevo'}`}
              >
                <div className="semantica-card-paso__header">
                  <div className="semantica-card-paso__meta">
                    <span className="semantica-card-paso__badge-indice">Operando #{op.paso}</span>
                    <span className="semantica-card-paso__valor-badge">Valor: <strong>{op.valor}</strong></span>
                  </div>
                  {op.esDuplicado ? (
                    <span className="semantica-tag semantica-tag--warning">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Duplicado (Omitido)
                    </span>
                  ) : (
                    <span className="semantica-tag semantica-tag--success">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Nuevo Símbolo Registrado
                    </span>
                  )}
                </div>

                <p className="semantica-card-paso__desc">{op.explicacion}</p>

                <div className="semantica-card-paso__detalles">
                  <div className="semantica-card-paso__col">
                    <span className="semantica-sublabel">Acción en Tabla de Símbolos:</span>
                    {op.esDuplicado ? (
                      <span className="semantica-accion-desc semantica-accion-desc--omitir">
                        Referencia existente: <code>{op.direccion}</code> (no genera dir nueva)
                      </span>
                    ) : (
                      <span className="semantica-accion-desc semantica-accion-desc--asignar">
                        Asignación: <code>{op.valor}</code> &rarr; <strong className="semantica-dir-pill">{op.direccion}</strong>
                      </span>
                    )}
                  </div>

                  <div className="semantica-card-paso__col">
                    <span className="semantica-sublabel">Acción en Tabla de Tipos:</span>
                    <span className="semantica-accion-desc">
                      Inferencia: <code>Tipo({op.valor})</code> = <span className="badge badge--exito">entero</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: FUNDAMENTO TEÓRICO Y FÓRMULAS FORMALES */}
      {tabActiva === 'formulas' && (
        <div className="semantica-formulas-grid">
          {/* Bloque Tabla de Símbolos */}
          <div className="semantica-formula-card">
            <div className="semantica-formula-card__header">
              <div className="semantica-formula-card__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                </svg>
              </div>
              <div>
                <h4 className="semantica-formula-card__titulo">1. Construcción de la Tabla de Símbolos</h4>
                <span className="semantica-formula-card__sub">Asignación simbólica de direcciones en memoria</span>
              </div>
            </div>

            <div className="semantica-formula-card__body">
              <p>
                La <strong>Tabla de Símbolos</strong> registra los identificadores o constantes únicos del programa fuente. En este simulador, cada operando numérico representa un valor constante que necesita una dirección de memoria simulada.
              </p>

              <div className="semantica-formula-box">
                <div className="semantica-formula-box__title">Regla matemática de inserción y asignación:</div>
                <div className="semantica-formula-math">
                  <code>
                    Dirección(s<sub>i</sub>) = &quot;dir_&quot; + k &emsp; donde k = |Tabla_Símbolos| + 1
                  </code>
                </div>
                <div className="semantica-formula-box__cond">
                  <strong>Condición de Unicidad:</strong> Si <em>s<sub>i</sub> &isin; Tabla_Símbolos</em>, entonces no se crea una nueva entrada (se ignora para no duplicar espacio de memoria).
                </div>
              </div>

              <div className="semantica-algoritmo-pasos">
                <h5>Algoritmo de ejecución:</h5>
                <ol>
                  <li>Inicializar <code>contador = 0</code> y un conjunto de visitados <code>vistos = &empty;</code>.</li>
                  <li>Recorrer los nodos del Árbol de Sintaxis Abstracta (AST) en orden <em>in-order</em>.</li>
                  <li>Al visitar un nodo numérico con valor <code>v</code>:
                    <ul>
                      <li>Si <code>v &notin; vistos</code>: <code>contador = contador + 1</code>, registrar <code>(v, &quot;dir_&quot; + contador)</code> y añadir <code>v</code> a <code>vistos</code>.</li>
                      <li>Si <code>v &isin; vistos</code>: Continuar el recorrido sin modificar la tabla.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Bloque Tabla de Tipos */}
          <div className="semantica-formula-card">
            <div className="semantica-formula-card__header">
              <div className="semantica-formula-card__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <h4 className="semantica-formula-card__titulo">2. Construcción de la Tabla de Tipos</h4>
                <span className="semantica-formula-card__sub">Comprobación de tipos y coherencia semántica</span>
              </div>
            </div>

            <div className="semantica-formula-card__body">
              <p>
                La <strong>Tabla de Tipos</strong> vincula cada símbolo de la tabla anterior con su tipo de dato correspondiente, permitiendo al compilador verificar la compatibilidad de las operaciones y reservar el ancho de palabra adecuado en memoria.
              </p>

              <div className="semantica-formula-box">
                <div className="semantica-formula-box__title">Regla de inferencia estática de tipos:</div>
                <div className="semantica-formula-math">
                  <code>
                    &forall; s &isin; Símbolos_Únicos, &emsp; Tipo(s) = &quot;entero&quot;
                  </code>
                </div>
                <div className="semantica-formula-box__cond">
                  <strong>Regla Semántica de Clausura:</strong> Dados dos operandos enteros <em>a, b: entero</em> y cualquier operador <em>op &isin; &#123;+, -, *, /&#125;</em>, el resultado preserva el tipo:
                  <div style={{ marginTop: 4 }}><code>(a op b) : entero</code></div>
                </div>
              </div>

              <div className="semantica-algoritmo-pasos">
                <h5>¿Por qué es crucial en compiladores reales?</h5>
                <ul>
                  <li><strong>Chequeo Estático:</strong> Garantiza que ningún operador reciba operandos de tipos incompatibles (evita mezclar cadenas con enteros o punteros inválidos).</li>
                  <li><strong>Selección de Instrucciones:</strong> Permite al backend emitir instrucciones de procesador óptimas (como <code>imul</code> para enteros en vez de <code>mulsd</code> para punto flotante IEEE 754).</li>
                  <li><strong>Tamaño en Memoria:</strong> Define si el operando ocupa 1 byte (char), 4 bytes (int32) u 8 bytes (int64).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: TABLAS RESULTANTES (FORMAL DEL PDF) */}
      {tabActiva === 'tablas' && (
        <div className="tablas-semanticas">
          {/* Tabla de símbolos */}
          <div className="tablas-semanticas__grupo">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
              </svg>
              Tabla de Símbolos ({totalUnicos} registros)
            </h4>
            <div className="tabla-wrapper">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Símbolo</th>
                    <th>Dirección</th>
                    <th>Estado de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {(tablaSimbolos || []).map((fila, i) => (
                    <tr key={i}>
                      <td>
                        <span className="badge badge--numero" style={{ fontSize: '0.88rem' }}>
                          {fila.simbolo}
                        </span>
                      </td>
                      <td>
                        <code className="semantica-dir-pill">{fila.direccion}</code>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                          Asignado en paso #{i + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tablas-semanticas__nota">
              Cada número repetido se almacena una sola vez. Las direcciones se asignan consecutivamente (<code>dir_1</code>, <code>dir_2</code>, etc.).
            </p>
          </div>

          {/* Tabla de tipos */}
          <div className="tablas-semanticas__grupo">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Tabla de Tipos ({totalUnicos} registros)
            </h4>
            <div className="tabla-wrapper">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Símbolo</th>
                    <th>Tipo</th>
                    <th>Representación</th>
                  </tr>
                </thead>
                <tbody>
                  {(tablaTipos || []).map((fila, i) => (
                    <tr key={i}>
                      <td>
                        <span className="badge badge--numero" style={{ fontSize: '0.88rem' }}>
                          {fila.simbolo}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge--exito">
                          {fila.tipo}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                          Integer 32/64 bits (sin decimal)
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tablas-semanticas__nota">
              Todos los operandos se validan como <code>entero</code>, garantizando operaciones aritméticas homogéneas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
