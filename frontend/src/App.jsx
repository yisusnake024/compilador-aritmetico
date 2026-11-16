import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import FormulaForm from './components/FormulaForm.jsx';
import PhaseStepper from './components/PhaseStepper.jsx';
import TokensTable from './components/TokensTable.jsx';
import AstView from './components/AstView.jsx';
import SymbolTables from './components/SymbolTables.jsx';
import ErrorPanel from './components/ErrorPanel.jsx';
import FeedbackPanel from './components/FeedbackPanel.jsx';
import KpiBar from './components/KpiBar.jsx';
import TheorySection from './components/TheorySection.jsx';
import { compilar, obtenerSalud, pedirRetroalimentacion } from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulador'); // 'simulador' | 'teoria'
  const [iaDisponible, setIaDisponible] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorConexion, setErrorConexion] = useState(null);
  const [formulaActual, setFormulaActual] = useState('');
  const [feedbackKey, setFeedbackKey] = useState(0);

  // Verificar salud al cargar
  useEffect(() => {
    obtenerSalud().then((data) => {
      setIaDisponible(data.ia_disponible === true);
    });
  }, []);

  const handleAnalizar = useCallback(async (formula) => {
    setCargando(true);
    setResultado(null);
    setErrorConexion(null);
    setFormulaActual(formula);
    setFeedbackKey((k) => k + 1);

    try {
      const data = await compilar(formula);
      setResultado(data);
    } catch (err) {
      if (
        err.message &&
        (err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('fetch'))
      ) {
        setErrorConexion(
          'No se pudo conectar con el backend en http://localhost:8000. ¿Está corriendo uvicorn?'
        );
      } else if (err.message && err.message.startsWith('HTTP')) {
        setErrorConexion(
          'El servidor respondió con un error inesperado. Verifica que el backend esté funcionando correctamente.'
        );
      } else {
        setErrorConexion(err.message || 'Respuesta no válida del servidor.');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  // Calcular estados de las fases para el stepper
  const calcularEstadosFases = () => {
    if (!resultado) {
      return { lexico: 'pendiente', sintactico: 'pendiente', semantico: 'pendiente' };
    }
    if (resultado.ok) {
      return { lexico: 'correcta', sintactico: 'correcta', semantico: 'correcta' };
    }
    if (resultado.fase === 'lexico') {
      return { lexico: 'con-error', sintactico: 'no-ejecutada', semantico: 'no-ejecutada' };
    }
    if (resultado.fase === 'sintactico') {
      return { lexico: 'correcta', sintactico: 'con-error', semantico: 'no-ejecutada' };
    }
    return { lexico: 'correcta', sintactico: 'correcta', semantico: 'con-error' };
  };

  return (
    <div className="app-container">
      {/* Header estilo simulador-dos */}
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <div className="app-header__info">
            <div className="app-header__title-row">
              <h1 className="app-header__titulo">Simulador de Compilador Aritmético</h1>
              <span className="app-header__badge-version">Pipeline LL(1)</span>
            </div>
            <p className="app-header__subtitulo">
              Teoría de Compiladores · <strong>Léxico</strong> · <strong>AST</strong> · <strong>Semántica</strong>
            </p>
          </div>
        </div>

        {/* Navegación por pastillas (Pills) + Theme Toggle */}
        <div className="app-header__nav-wrap">
          <nav className="nav-pills" aria-label="Navegación principal">
            <button
              type="button"
              onClick={() => setActiveTab('simulador')}
              className={`nav-pill ${activeTab === 'simulador' ? 'nav-pill--activa' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Simulador & AST
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teoria')}
              className={`nav-pill ${activeTab === 'teoria' ? 'nav-pill--activa' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Fundamento Teórico
            </button>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {/* Barra de Telemetría Rápida (KPI) */}
      <KpiBar resultado={resultado} iaDisponible={iaDisponible} cargando={cargando} />

      {/* CONTENIDO DE PESTAÑA: 1. SIMULADOR, AST, TABLAS & IA */}
      {activeTab === 'simulador' && (
        <div aria-live="polite">
          {/* Tarjeta de Entrada */}
          <div className="tarjeta">
            <FormulaForm onAnalizar={handleAnalizar} cargando={cargando} />
          </div>

          {/* Estado Cargando */}
          {cargando && (
            <div className="tarjeta tarjeta-animada">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', color: 'var(--texto-secundario)' }}>
                <span className="spinner" style={{ borderColor: 'var(--acento)', borderTopColor: 'transparent' }} />
                <span>Ejecutando pipeline léxico, sintáctico y semántico…</span>
              </div>
            </div>
          )}

          {/* Error de Conexión */}
          {errorConexion && (
            <div className="tarjeta tarjeta-animada">
              <div className="estado-error-conexion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p><strong>Error de conexión:</strong> {errorConexion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resultados del Compilador */}
          {resultado && !cargando && (
            <>
              {/* Stepper de Fases */}
              <div className="tarjeta tarjeta-animada">
                <PhaseStepper estados={calcularEstadosFases()} />
              </div>

              {/* Caso de Error Léxico o Sintáctico */}
              {!resultado.ok && (
                <div className="tarjeta tarjeta-animada">
                  <div className="tarjeta__titulo">
                    <span className="tarjeta__titulo-numero" style={{ background: 'var(--error-suave)', color: 'var(--error)' }}>
                      !
                    </span>
                    {resultado.fase === 'lexico'
                      ? 'Error en Análisis Léxico'
                      : 'Error en Análisis Sintáctico'}
                  </div>
                  <ErrorPanel errores={resultado.errores} formula={resultado.formula} />
                </div>
              )}

              {/* Caso Exitoso: AST (Gráfico y Texto) */}
              {resultado.ok && (
                <>
                  <div className="tarjeta tarjeta-animada">
                    <div className="tarjeta__titulo">
                      <span className="tarjeta__titulo-numero">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="5" r="3" />
                          <line x1="12" y1="8" x2="5" y2="16" />
                          <line x1="12" y1="8" x2="19" y2="16" />
                        </svg>
                      </span>
                      Árbol de Sintaxis Abstracta (AST)
                    </div>
                    <AstView ast={resultado.ast} astTexto={resultado.ast_texto} />
                  </div>

                  {/* Tabla de Tokens debajo del AST */}
                  <div className="tarjeta tarjeta-animada">
                    <div className="tarjeta__titulo">
                      <span className="tarjeta__titulo-numero">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </span>
                      Análisis Léxico: Tabla de Tokens Identificados
                    </div>
                    <TokensTable tokens={resultado.tokens} />
                  </div>

                  {/* Tablas Semánticas debajo de Tokens */}
                  <div className="tarjeta tarjeta-animada">
                    <div className="tarjeta__titulo">
                      <span className="tarjeta__titulo-numero">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </span>
                      Análisis Semántico: Tabla de Símbolos y Tipos
                    </div>
                    <SymbolTables
                      tablaSimbolos={resultado.tabla_simbolos}
                      tablaTipos={resultado.tabla_tipos}
                    />
                  </div>
                </>
              )}

              {/* Panel de IA al final de los resultados */}
              <div className="tarjeta tarjeta-animada">
                <div className="tarjeta__titulo">
                  <span className="tarjeta__titulo-numero">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1l-3 4-3-4H8a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
                    </svg>
                  </span>
                  Tutor Inteligente (Retroalimentación con IA)
                </div>
                <FeedbackPanel
                  iaDisponible={iaDisponible}
                  formula={formulaActual}
                  onPedir={pedirRetroalimentacion}
                  resetKey={feedbackKey}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA: 2. FUNDAMENTO TEÓRICO */}
      {activeTab === 'teoria' && <TheorySection />}
    </div>
  );
}
