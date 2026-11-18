import { useState, useRef } from 'react';

// Escenarios rápidos organizados según la teoría de compiladores
const CATEGORIAS = [
  { id: 'todos', nombre: 'Todos' },
  { id: 'precedencia', nombre: 'Precedencia (*, /)' },
  { id: 'asociatividad', nombre: 'Asociatividad Izq.' },
  { id: 'lexico', nombre: 'Errores Léxicos' },
  { id: 'sintactico', nombre: 'Errores Sintácticos' },
];

const ESCENARIOS = [
  // 1. Precedencia
  {
    formula: '10 + 25 * 10 - 4',
    tag: 'Precedencia (* sobre + -)',
    categoria: 'precedencia',
    tipo: 'exito',
    desc: 'La multiplicación (*) forma un subárbol profundo y se evalúa antes de la suma y la resta.',
  },
  {
    formula: '15 * 3 + 40 / 5',
    tag: 'Mult. y División combinada',
    categoria: 'precedencia',
    tipo: 'exito',
    desc: 'Dos ramas independientes de alta precedencia (*) y (/) que convergen en una raíz de suma (+).',
  },
  {
    formula: '100 - 20 * 2 + 50',
    tag: 'Operador intermedio prioritario',
    categoria: 'precedencia',
    tipo: 'exito',
    desc: 'La multiplicación central se evalúa primero; luego se procesa la resta y suma de izquierda a derecha.',
  },

  // 2. Asociatividad
  {
    formula: '10 - 4 - 2',
    tag: 'Asociatividad Resta Izq.',
    categoria: 'asociatividad',
    tipo: 'exito',
    desc: 'El AST crece hacia la izquierda: evalúa (10 - 4) = 6, y luego 6 - 2 = 4 (nunca 10 - 2 = 8).',
  },
  {
    formula: '100 / 5 / 2',
    tag: 'Asociatividad División Izq.',
    categoria: 'asociatividad',
    tipo: 'exito',
    desc: 'División sucesiva de izquierda a derecha: (100 / 5) = 20, luego 20 / 2 = 10.',
  },
  {
    formula: '50 - 20 - 10 - 5',
    tag: 'Cadena de Asociatividad',
    categoria: 'asociatividad',
    tipo: 'exito',
    desc: 'Cadena profunda de 4 operandos con asociatividad hacia la rama izquierda.',
  },

  // 3. Paréntesis → error léxico (el PDF los clasifica explícitamente como caracteres inválidos)
  {
    formula: '(10 + 25) * 2',
    tag: 'Paréntesis = Error Léxico',
    categoria: 'parentesis',
    tipo: 'error',
    desc: 'Según el PDF del proyecto, los paréntesis son caracteres no válidos. El lexer los reporta como error léxico en su posición.',
  },
  {
    formula: '((5 + 3) * 2)',
    tag: 'Paréntesis Anidados = Error',
    categoria: 'parentesis',
    tipo: 'error',
    desc: 'Los paréntesis anidados también generan error léxico. El compilador detecta cada "(" y ")" inválido con su posición exacta.',
  },
  {
    formula: '12 * (8 - 3)',
    tag: 'Paréntesis en Subexpresión',
    categoria: 'parentesis',
    tipo: 'error',
    desc: 'El alcance del lenguaje solo admite enteros, operadores (+,-,*,/) y espacios. Cualquier otro símbolo, incluido "(", genera error.',
  },

  // 4. Errores Léxicos
  {
    formula: '12 + 4 # 3',
    tag: 'Carácter ilegal "#"',
    categoria: 'lexico',
    tipo: 'error',
    desc: 'Error en Análisis Léxico: el escáner se detiene al encontrar un símbolo ajeno al alfabeto del lenguaje.',
  },
  {
    formula: '50 * 2 @ 10',
    tag: 'Carácter ilegal "@"',
    categoria: 'lexico',
    tipo: 'error',
    desc: 'Error en Análisis Léxico: detecta el carácter no reconocido en la columna 8.',
  },
  {
    formula: '10 + $valor',
    tag: 'Carácter ilegal "$"',
    categoria: 'lexico',
    tipo: 'error',
    desc: 'Error en Análisis Léxico: este lenguaje solo soporta literales numéricos, no identificadores con "$".',
  },

  // 5. Errores Sintácticos
  {
    formula: '10 + + 5',
    tag: 'Operadores consecutivos',
    categoria: 'sintactico',
    tipo: 'error',
    desc: 'Error en Análisis Sintáctico: la gramática LL(1) esperaba un número tras el operador "+" pero encontró otro "+".',
  },
  {
    formula: '8 * 4 -',
    tag: 'Operador sin operando final',
    categoria: 'sintactico',
    tipo: 'error',
    desc: 'Error en Análisis Sintáctico: terminación prematura de la fórmula con operador pendiente sin operando derecho.',
  },
  {
    formula: '100 + * 50',
    tag: 'Operador donde se espera número',
    categoria: 'sintactico',
    tipo: 'error',
    desc: 'Error en Análisis Sintáctico: se encontró un operador "*" en una posición donde la gramática esperaba un número entero.',
  },
];

export default function FormulaForm({ onAnalizar, cargando }) {
  const [formula, setFormula] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const inputRef = useRef(null);

  const enviar = (valor) => {
    const f = valor !== undefined ? valor : formula;
    if (f.trim() && !cargando) {
      onAnalizar(f.trim());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviar();
  };

  const handleChip = (f) => {
    setFormula(f);
    enviar(f);
    inputRef.current?.focus();
  };

  const escenariosFiltrados =
    filtroCategoria === 'todos'
      ? ESCENARIOS
      : ESCENARIOS.filter((e) => e.categoria === filtroCategoria);

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <div className="formulario__label">
        <span>Fórmula aritmética para simular:</span>
        <span className="formulario__helper">Máximo 100 caracteres</span>
      </div>

      <div className="formulario__input-wrapper">
        <input
          ref={inputRef}
          id="formula-input"
          type="text"
          className="formulario__input"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="Ej: 10 + 25 * 10 - 4"
          maxLength={100}
          autoComplete="off"
          spellCheck="false"
          disabled={cargando}
        />
        <button
          type="submit"
          className="btn-primario"
          disabled={!formula.trim() || cargando}
        >
          {cargando ? (
            <>
              <span className="spinner" />
              Analizando…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Analizar Pipeline
            </>
          )}
        </button>
      </div>

      {/* Escenarios Rápidos con Filtro por Categorías Teóricas */}
      <div className="escenarios-wrap">
        <div className="escenarios-header">
          <span className="escenarios-header__titulo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Escenarios Rápidos basados en la Teoría:
          </span>

          {/* Filtros de Categoría */}
          <div className="escenarios-filtros">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`escenarios-filtro-btn ${filtroCategoria === cat.id ? 'escenarios-filtro-btn--activo' : ''}`}
                onClick={() => setFiltroCategoria(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Chips Filtrados */}
        <div className="formulario__chips">
          {escenariosFiltrados.map((ej) => (
            <button
              key={ej.formula}
              type="button"
              className={`chip ${ej.tipo === 'error' ? 'chip--error' : 'chip--exito'}`}
              onClick={() => handleChip(ej.formula)}
              disabled={cargando}
              title={ej.desc}
            >
              <span className="chip__formula">{ej.formula}</span>
              <span className="chip__tag">{ej.tag}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
