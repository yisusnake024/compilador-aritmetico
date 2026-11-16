import { useState } from 'react';

// Información exhaustiva de las 6 fases del compilador (Front-End + Back-End)
const FASES_COMPILADOR = [
  {
    id: 1,
    nombre: 'Análisis Léxico',
    alias: 'Scanner / Tokenizador',
    bloque: 'Front-End (Análisis)',
    estado: 'en-simulador',
    estadoEtiqueta: 'Implementado en este Simulador',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    descripcion:
      'Es la primera fase del compilador. Lee el flujo de caracteres sin formato del código fuente de izquierda a derecha y los agrupa en unidades con significado sintáctico llamadas componentes léxicos o tokens (identificadores, palabras reservadas, números, operadores, delimitadores), descartando espacios en blanco y comentarios.',
    entrada: 'Secuencia de caracteres (cadena de texto cruda): "10 + 25 * 10 - 4"',
    salida: 'Flujo estructurado de tokens etiquetados con tipo, valor y posición en el texto.',
    modeloTeorico: 'Expresiones Regulares (ER) y Autómatas Finitos Deterministas (DFA).',
    transformacionEjemplo: `Entrada cruda:
"10 + 25 * 10 - 4"

Flujo de Tokens generados:
[
  { tipo: "NUMERO",   valor: "10", col_inicio: 1,  col_fin: 2 },
  { tipo: "OPERADOR", valor: "+",  col_inicio: 4,  col_fin: 4 },
  { tipo: "NUMERO",   valor: "25", col_inicio: 6,  col_fin: 7 },
  { tipo: "OPERADOR", valor: "*",  col_inicio: 9,  col_fin: 9 },
  { tipo: "NUMERO",   valor: "10", col_inicio: 11, col_fin: 12 },
  { tipo: "OPERADOR", valor: "-",  col_inicio: 14, col_fin: 14 },
  { tipo: "NUMERO",   valor: "4",  col_inicio: 16, col_fin: 16 }
]`,
    erroresDetectados: 'Caracteres no pertenecientes al alfabeto válido (ej: "@", "#", "$", caracteres no reconocidos).',
    estructurasUsadas: 'Buffer de entrada de dos punteros, tabla de palabras reservadas.'
  },
  {
    id: 2,
    nombre: 'Análisis Sintáctico',
    alias: 'Parser / Analizador Jerárquico',
    bloque: 'Front-End (Análisis)',
    estado: 'en-simulador',
    estadoEtiqueta: 'Implementado en este Simulador',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <circle cx="5" cy="19" r="3" />
        <circle cx="19" cy="19" r="3" />
        <line x1="12" y1="8" x2="5" y2="16" />
        <line x1="12" y1="8" x2="19" y2="16" />
      </svg>
    ),
    descripcion:
      'Recibe la secuencia lineal de tokens del analizador léxico e impone una estructura jerárquica basada en una Gramática Libre de Contexto (CFG). Verifica que la disposición de los tokens cumpla las reglas formales del lenguaje y construye el Árbol de Sintaxis Abstracta (AST), resolviendo la precedencia y la asociatividad.',
    entrada: 'Flujo de tokens generado por el escáner.',
    salida: 'Árbol de Sintaxis Abstracta (AST) binario donde los nodos internos son operadores y las hojas son operandos.',
    modeloTeorico: 'Gramáticas Libres de Contexto (CFG) y Parsers Descendentes LL(k) o Ascendentes LR(k) / LALR.',
    transformacionEjemplo: `Gramática LL(1) sin recursión izquierda:
  expr   → term ( ('+' | '-') term )*
  term   → factor ( ('*' | '/') factor )*
  factor → NUMERO | '(' expr ')'

Árbol de Sintaxis Abstracta (AST) resultante:
          (-) [Raíz: menor precedencia, último en evaluarse]
         /   \\
       (+)    4
      /   \\
    10    (*) [Mayor precedencia: subárbol profundo]
         /   \\
        25   10`,
    erroresDetectados: 'Violaciones gramaticales (ej: operadores consecutivos "10 + * 5", paréntesis sin cerrar "(10 + 2", expresión vacía).',
    estructurasUsadas: 'Pila de parsing, tabla de análisis sintáctico LL(1), nodos de AST.'
  },
  {
    id: 3,
    nombre: 'Análisis Semántico',
    alias: 'Comprobador de Tipos y Coherencia',
    bloque: 'Front-End (Análisis)',
    estado: 'en-simulador',
    estadoEtiqueta: 'Implementado en este Simulador',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    descripcion:
      'Examina el AST para verificar que las construcciones respeten las reglas semánticas y la lógica del lenguaje. Realiza la comprobación de tipos (type checking), resuelve el ámbito (scope) de identificadores y registra metadatos en la Tabla de Símbolos asignando direcciones virtuales.',
    entrada: 'Árbol de Sintaxis Abstracta (AST) y Tabla de Símbolos inicial.',
    salida: 'AST Decorado (anotado con tipos) y Tabla de Símbolos y Tipos con direcciones de memoria asignadas.',
    modeloTeorico: 'Gramáticas con Atributos (Sintetizados e Heredados), Sistemas de Tipos y Reglas de Inferencia.',
    transformacionEjemplo: `Comprobación y Decoración Semántica:
• Operación '25 * 10': Tipo(25) = entero, Tipo(10) = entero → Resultado: entero
• Operación '10 + 250': Tipo(10) = entero, Tipo(250) = entero → Resultado: entero
• Operación '260 - 4':  Tipo(260) = entero, Tipo(4) = entero   → Resultado: entero

Tabla de Símbolos generada:
  dir_1 → Símbolo: "10" | Tipo: entero
  dir_2 → Símbolo: "25" | Tipo: entero
  dir_3 → Símbolo: "10" | Tipo: entero
  dir_4 → Símbolo: "4"  | Tipo: entero`,
    erroresDetectados: 'Incompatibilidad de tipos, uso de variables no declaradas, redefiniciones ilegales, división por cero literal.',
    estructurasUsadas: 'Tabla de Símbolos (Hash table o árbol de alcances), Tabla de Tipos.'
  },
  {
    id: 4,
    nombre: 'Generación de Código Intermedio',
    alias: 'IR (Intermediate Representation)',
    bloque: 'Back-End (Síntesis)',
    estado: 'backend-completo',
    estadoEtiqueta: 'Fase de Compilador Completo / Back-End',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    descripcion:
      'Traduce el AST decorado a una representación intermedia de bajo nivel pero independiente de la máquina real (como Código de Tres Direcciones - TAC, Cuádruplos o Tripletas). Esta fase es crucial porque desacopla el lenguaje fuente de la arquitectura del procesador destino, permitiendo reutilizar el optimizador y generador para múltiples CPUs.',
    entrada: 'AST decorado y Tabla de Símbolos verificada.',
    salida: 'Código lineal de tres direcciones (TAC) con variables temporales virtuales (t1, t2, t3...).',
    modeloTeorico: 'Código de Tres Direcciones (TAC), Cuádruplos (operador, argumento1, argumento2, resultado) y Grafos de Flujo de Control (CFG).',
    transformacionEjemplo: `Traducción del AST a Código de Tres Direcciones (TAC):

// Paso 1: Subárbol más profundo (multiplicación)
t1 = 25 * 10       ; Cuádruplo: (*, 25, 10, t1)

// Paso 2: Subárbol intermedio (suma)
t2 = 10 + t1       ; Cuádruplo: (+, 10, t1, t2)

// Paso 3: Nodo raíz (resta final)
t3 = t2 - 4        ; Cuádruplo: (-, t2,  4, t3)

Resultado listo para optimización independiente de la arquitectura.`,
    erroresDetectados: 'No detecta errores sintácticos ni semánticos (ya verificados); asegura consistencia en el flujo de control.',
    estructurasUsadas: 'Cuádruplos, tripletas, bloques básicos, grafos de flujo de control (CFG).'
  },
  {
    id: 5,
    nombre: 'Optimización de Código',
    alias: 'Optimizador Máquina-Independiente',
    bloque: 'Back-End (Síntesis)',
    estado: 'backend-completo',
    estadoEtiqueta: 'Fase de Compilador Completo / Back-End',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    descripcion:
      'Transforma el código intermedio para que el programa final ejecute más rápido, ocupe menos espacio de memoria o consuma menos energía, preservando estrictamente la semántica original. Aplica técnicas como plegado de constantes, eliminación de subexpresiones comunes, propagación de constantes y eliminación de código inalcanzable.',
    entrada: 'Código intermedio (IR) lineal o estructurado en bloques básicos.',
    salida: 'Código intermedio optimizado y simplificado.',
    modeloTeorico: 'Análisis de Flujo de Datos, Grafos de Dependencia y Transformaciones Semánticamente Neutras.',
    transformacionEjemplo: `Optimización aplicada sobre "10 + 25 * 10 - 4":

1. Plegado de constantes (Constant Folding):
   Calcula en tiempo de compilación las operaciones cuyos operandos son literales fijos:
   • 25 * 10  → 250
   • 10 + 250 → 260
   • 260 - 4  → 256

2. Propagación y Eliminación de temporales:
   El TAC original:
     t1 = 25 * 10
     t2 = 10 + t1
     t3 = t2 - 4
   Se reduce a una sola asignación directa:
     t3 = 256

¡Ahorro de 3 operaciones aritméticas en tiempo de ejecución (0 ciclos de CPU)!`,
    erroresDetectados: 'Advertencias de código muerto o variables calculadas pero nunca leídas.',
    estructurasUsadas: 'Grafos acíclicos dirigidos (DAG), análisis de variables vivas, intervalos de vida.'
  },
  {
    id: 6,
    nombre: 'Generación de Código Objeto / Máquina',
    alias: 'Emisor de Código Destino & Asignador de Registros',
    bloque: 'Back-End (Síntesis)',
    estado: 'backend-completo',
    estadoEtiqueta: 'Fase de Compilador Completo / Back-End',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
    descripcion:
      'Es la fase final del compilador. Mapea la representación intermedia optimizada a las instrucciones reales de la arquitectura de la CPU de destino (x86_64, ARM64, RISC-V o Bytecode JVM). Realiza la selección de instrucciones, la asignación de variables temporales a un número finito de registros de hardware y la planificación de instrucciones.',
    entrada: 'Código intermedio optimizado.',
    salida: 'Código Ensamblador nativo (.s / .asm) o código binario ejecutable en memoria (.o / .exe).',
    modeloTeorico: 'Coloración de Grafos (Algoritmo de Chaitin) para asignación de registros y Planificación por Pipeline.',
    transformacionEjemplo: `Código Ensamblador x86_64 (Sintaxis Intel / NASM):
section .text
global _calcular
_calcular:
    ; Si la expresión no estuviera optimizada:
    ;   mov eax, 25        ; EAX = 25
    ;   imul eax, 10       ; EAX = 25 * 10 = 250
    ;   add eax, 10        ; EAX = 250 + 10 = 260
    ;   sub eax, 4         ; EAX = 260 - 4 = 256
    ; Con la optimización previa (plegado de constantes):
    mov eax, 256           ; Carga directa del resultado constante en el registro EAX
    ret                    ; Retorna el valor al invocador`,
    erroresDetectados: 'Desbordamiento de pila en memoria (spill de registros cuando faltan registros físicos).',
    estructurasUsadas: 'Descriptor de registros, descriptor de direcciones, mapa de memoria física.'
  }
];

// Fórmulas didácticas para el simulador interactivo de gramática
const EJEMPLOS_GRAMATICA = [
  {
    formula: '10 + 25 * 10 - 4',
    titulo: 'Precedencia Estándar (* sobre + y -)',
    explicacion:
      'La multiplicación "*" tiene mayor precedencia que "+" y "-", por lo que se resuelve en el nivel "term" antes de ascender al nivel "expr". La resta "-" se ubica en la raíz debido a la asociatividad por la izquierda.',
    pasos: [
      'Nivel expr (inicio): Evalúa la secuencia de sumas y restas de izquierda a derecha.',
      'Nivel term: Encuentra "25 * 10" y lo agrupa como un subárbol cerrado antes de sumar.',
      'Nivel factor: Cada número ("10", "25", "10", "4") es reconocido como terminal directo.'
    ]
  },
  {
    formula: '(10 + 25) * (10 - 4)',
    titulo: 'Alteración mediante Paréntesis',
    explicacion:
      'Los paréntesis "(" y ")" tienen la máxima prioridad formal. Obligan al parser a evaluar las sumas y restas dentro de un nuevo ámbito recursivo de "expr", convirtiendo la multiplicación "*" en el nodo raíz.',
    pasos: [
      'Nivel expr raíz: La operación principal es ahora "*".',
      'Subárbol izquierdo: Evalúa "(10 + 25)" de forma aislada retornando 35.',
      'Subárbol derecho: Evalúa "(10 - 4)" retornando 6. El producto final es 210.'
    ]
  },
  {
    formula: '10 - 4 - 2',
    titulo: 'Asociatividad por la Izquierda',
    explicacion:
      'Operadores con idéntico nivel de precedencia ("-" y "-") se agrupan de izquierda a derecha: (10 - 4) - 2 = 4, y NUNCA 10 - (4 - 2) = 8. Esto se refleja en un AST que crece hacia la rama izquierda.',
    pasos: [
      'Nodo raíz: El último operador "-" (que resta 2 al resultado acumulado).',
      'Hijo izquierdo: El primer operador "-" con operandos 10 y 4.',
      'Hijo derecho: La constante terminal 2.'
    ]
  }
];

export default function TheorySection() {
  const [seccionActiva, setSeccionActiva] = useState('pipeline'); // 'pipeline' | 'arquitectura' | 'gramatica' | 'transversales'
  const [faseIndice, setFaseIndice] = useState(0);
  const [ejemploIndice, setEjemploIndice] = useState(0);

  const faseActual = FASES_COMPILADOR[faseIndice];
  const ejemploActual = EJEMPLOS_GRAMATICA[ejemploIndice];

  const siguienteFase = () => {
    setFaseIndice((prev) => (prev < FASES_COMPILADOR.length - 1 ? prev + 1 : 0));
  };

  const anteriorFase = () => {
    setFaseIndice((prev) => (prev > 0 ? prev - 1 : FASES_COMPILADOR.length - 1));
  };

  return (
    <div className="teoria-seccion tarjeta tarjeta-animada">
      {/* Encabezado */}
      <div className="tarjeta__titulo" style={{ marginBottom: 16 }}>
        <span className="tarjeta__titulo-numero">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </span>
        Fundamento Teórico & Arquitectura Completa de Compiladores
      </div>

      {/* Pestañas de Nivel Superior */}
      <div className="teoria-tabs">
        <button
          type="button"
          onClick={() => setSeccionActiva('pipeline')}
          className={`teoria-tab-btn ${seccionActiva === 'pipeline' ? 'teoria-tab-btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Las 6 Fases (Interactivo)
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('arquitectura')}
          className={`teoria-tab-btn ${seccionActiva === 'arquitectura' ? 'teoria-tab-btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
          Front-End vs Back-End
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('gramatica')}
          className={`teoria-tab-btn ${seccionActiva === 'gramatica' ? 'teoria-tab-btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
          </svg>
          Gramática LL(1) & Precedencia
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('transversales')}
          className={`teoria-tab-btn ${seccionActiva === 'transversales' ? 'teoria-tab-btn--activo' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Estructuras Transversales
        </button>
      </div>

      {/* ---------------- 1. LAS 6 FASES DEL COMPILADOR (INTERACTIVO) ---------------- */}
      {seccionActiva === 'pipeline' && (
        <div className="teoria-pipeline-wrap">
          {/* Barra de progreso de fases interactiva */}
          <div className="teoria-pipeline-nav" aria-label="Selector de fase">
            {FASES_COMPILADOR.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFaseIndice(idx)}
                className={`teoria-pipeline-step ${faseIndice === idx ? 'teoria-pipeline-step--activo' : ''} ${f.estado === 'en-simulador' ? 'teoria-pipeline-step--simulado' : 'teoria-pipeline-step--backend'}`}
              >
                <span className="teoria-pipeline-step__num">{f.id}</span>
                <span className="teoria-pipeline-step__txt">{f.nombre}</span>
              </button>
            ))}
          </div>

          {/* Tarjeta de Detalle Dinámico de la Fase Seleccionada */}
          <div className="teoria-fase-card">
            {/* Header de la tarjeta */}
            <div className="teoria-fase-card__header">
              <div className="teoria-fase-card__title-row">
                <div className="teoria-fase-card__icono">{faseActual.icono}</div>
                <div>
                  <h3 className="teoria-fase-card__titulo">
                    Fase {faseActual.id}: {faseActual.nombre}
                  </h3>
                  <span className="teoria-fase-card__alias">({faseActual.alias})</span>
                </div>
              </div>

              {/* Badges de clasificación */}
              <div className="teoria-fase-card__badges">
                <span className="teoria-badge-bloque">{faseActual.bloque}</span>
                <span
                  className={
                    faseActual.estado === 'en-simulador'
                      ? 'teoria-badge-estado teoria-badge-estado--activo'
                      : 'teoria-badge-estado teoria-badge-estado--backend'
                  }
                >
                  <span className="teoria-badge-punto" />
                  {faseActual.estadoEtiqueta}
                </span>
              </div>
            </div>

            {/* Descripción principal */}
            <p className="teoria-fase-card__desc">{faseActual.descripcion}</p>

            {/* Grilla de Entradas y Salidas */}
            <div className="teoria-io-grid">
              <div className="teoria-io-box">
                <span className="teoria-io-box__label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  Datos de Entrada (Input)
                </span>
                <p className="teoria-io-box__val">{faseActual.entrada}</p>
              </div>

              <div className="teoria-io-box">
                <span className="teoria-io-box__label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Datos Producidos (Output)
                </span>
                <p className="teoria-io-box__val">{faseActual.salida}</p>
              </div>
            </div>

            {/* Transformación con Ejemplo Real en Vivo */}
            <div className="teoria-transformacion">
              <div className="teoria-transformacion__label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Transformación en esta Fase para la expresión "10 + 25 * 10 - 4":
              </div>
              <pre className="teoria-code-block">{faseActual.transformacionEjemplo}</pre>
            </div>

            {/* Metadatos Teóricos Adicionales */}
            <div className="teoria-meta-grid">
              <div className="teoria-meta-item">
                <strong>Modelo Matemático / Teórico:</strong> {faseActual.modeloTeorico}
              </div>
              <div className="teoria-meta-item">
                <strong>Errores que detecta / previene:</strong> {faseActual.erroresDetectados}
              </div>
              <div className="teoria-meta-item">
                <strong>Estructuras de datos clave:</strong> {faseActual.estructurasUsadas}
              </div>
            </div>

            {/* Controles de Navegación Anterior / Siguiente */}
            <div className="teoria-fase-card__footer">
              <button type="button" onClick={anteriorFase} className="btn-secundario">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Fase Anterior
              </button>

              <span className="teoria-fase-card__contador">
                Fase {faseIndice + 1} de {FASES_COMPILADOR.length}
              </span>

              <button type="button" onClick={siguienteFase} className="btn-secundario">
                Fase Siguiente
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 2. FRONT-END VS BACK-END ---------------- */}
      {seccionActiva === 'arquitectura' && (
        <div className="teoria-arquitectura-wrap">
          <div className="teoria-card" style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--texto)' }}>
              La Arquitectura Clásica del Compilador: Separación en Dos Extremos
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--texto-secundario)', lineHeight: 1.6 }}>
              Un compilador moderno se divide conceptualmente en dos mitades conectadas por la{' '}
              <strong>Representación Intermedia (IR)</strong>. Esta separación permite que un solo compilador
              pueda compilar múltiples lenguajes (C, Rust, Swift) hacia múltiples procesadores (x86_64, ARM, WebAssembly)
              sin tener que programar un compilador completo para cada combinación.
            </p>
          </div>

          <div className="teoria-grid">
            {/* Front-End */}
            <div className="teoria-card" style={{ borderLeft: '4px solid var(--acento)' }}>
              <div className="teoria-card__header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Front-End (Fases de Análisis)
              </div>
              <p>
                <strong>Propósito:</strong> Comprender el código fuente, verificar su validez léxica, sintáctica y
                semántica, y abstraerlo en una estructura independiente de la máquina destino.
              </p>
              <ul className="teoria-lista">
                <li>
                  <strong>1. Análisis Léxico:</strong> Flujo de caracteres $\rightarrow$ Tokens.
                </li>
                <li>
                  <strong>2. Análisis Sintáctico:</strong> Tokens $\rightarrow$ Árbol AST.
                </li>
                <li>
                  <strong>3. Análisis Semántico:</strong> AST $\rightarrow$ AST Decorado + Tipos.
                </li>
              </ul>
              <div className="teoria-badge-status" style={{ background: 'var(--acento-suave)', color: 'var(--acento)' }}>
                ✓ Implementado en nuestro Simulador
              </div>
            </div>

            {/* Back-End */}
            <div className="teoria-card" style={{ borderLeft: '4px solid var(--alerta)' }}>
              <div className="teoria-card__header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Back-End (Fases de Síntesis)
              </div>
              <p>
                <strong>Propósito:</strong> Transformar la Representación Intermedia (IR) en código ejecutable altamente
                eficiente adaptado a las características de la CPU de destino.
              </p>
              <ul className="teoria-lista">
                <li>
                  <strong>4. Generación de Código Intermedio:</strong> AST $\rightarrow$ Código de Tres Direcciones (TAC).
                </li>
                <li>
                  <strong>5. Optimización de Código:</strong> Eliminación de redundancias y plegado de constantes.
                </li>
                <li>
                  <strong>6. Generación de Código Objeto:</strong> Asignación de registros y emisión en Ensamblador / Binario.
                </li>
              </ul>
              <div className="teoria-badge-status" style={{ background: 'var(--alerta-suave)', color: 'var(--alerta)' }}>
                ⚙ Fases de Compiladores Industriales (LLVM / GCC)
              </div>
            </div>
          </div>

          {/* Diagrama Textual del Puente IR */}
          <div className="teoria-puente-ir">
            <div className="teoria-puente-ir__bloque">Código Fuente (.calc)</div>
            <span className="teoria-puente-ir__flecha">→ [Front-End] →</span>
            <div className="teoria-puente-ir__bloque teoria-puente-ir__bloque--centro">
              Representación Intermedia (IR / TAC)
            </div>
            <span className="teoria-puente-ir__flecha">→ [Back-End] →</span>
            <div className="teoria-puente-ir__bloque">Código Objeto (x86_64 / ARM)</div>
          </div>
        </div>
      )}

      {/* ---------------- 3. GRAMÁTICA LL(1) & PRECEDENCIA INTERACTIVA ---------------- */}
      {seccionActiva === 'gramatica' && (
        <div className="teoria-gramatica-wrap">
          {/* Reglas formales */}
          <div className="teoria-card" style={{ marginBottom: 16 }}>
            <div className="teoria-card__header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Gramática Libre de Contexto LL(1) del Simulador
            </div>
            <p>
              Para evitar bucles infinitos en el Parser Descendente Recursivo, se eliminó la recursión por la izquierda
              estratificando la gramática en tres niveles de precedencia:
            </p>
            <div className="teoria-code-block">
              <strong>expr</strong>   → term ( ('+' | '-') term )*     <span style={{ color: 'var(--texto-secundario)' }}>// Nivel 1: Menor precedencia (Suma / Resta)</span><br />
              <strong>term</strong>   → factor ( ('*' | '/') factor )* <span style={{ color: 'var(--texto-secundario)' }}>// Nivel 2: Mayor precedencia (Multiplicación / División)</span><br />
              <strong>factor</strong> → NUMERO | '(' expr ')'          <span style={{ color: 'var(--texto-secundario)' }}>// Nivel 3: Máxima prioridad (Paréntesis o Terminal)</span>
            </div>
          </div>

          {/* Selector de Ejemplos Didácticos Interactivos */}
          <div className="teoria-card">
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--texto)' }}>
              Prueba Interactiva: ¿Cómo decide el Parser la forma del AST?
            </h4>
            <div className="teoria-tabs" style={{ marginBottom: 14 }}>
              {EJEMPLOS_GRAMATICA.map((ej, idx) => (
                <button
                  key={ej.formula}
                  type="button"
                  onClick={() => setEjemploIndice(idx)}
                  className={`teoria-tab-btn ${ejemploIndice === idx ? 'teoria-tab-btn--activo' : ''}`}
                >
                  <code>{ej.formula}</code>
                </button>
              ))}
            </div>

            <div className="teoria-ejemplo-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--texto)' }}>{ejemploActual.titulo}</strong>
                <span className="badge badge--operador">{ejemploActual.formula}</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.86rem', color: 'var(--texto-secundario)' }}>
                {ejemploActual.explicacion}
              </p>
              <div className="teoria-ejemplo-pasos">
                {ejemploActual.pasos.map((p, pIdx) => (
                  <div key={pIdx} className="teoria-ejemplo-paso">
                    <span className="teoria-ejemplo-paso__num">{pIdx + 1}</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 4. ESTRUCTURAS TRANSVERSALES ---------------- */}
      {seccionActiva === 'transversales' && (
        <div className="teoria-grid">
          {/* Tabla de Símbolos */}
          <div className="teoria-card">
            <div className="teoria-card__header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Tabla de Símbolos Transversal
            </div>
            <p>
              La Tabla de Símbolos es la estructura de datos neurálgica del compilador. Es consultada y modificada por{' '}
              <strong>todas las fases</strong>:
            </p>
            <ul className="teoria-lista">
              <li><strong>Léxico:</strong> Inserta nuevos identificadores y literales encontrados.</li>
              <li><strong>Sintáctico:</strong> Registra la jerarquía de declaraciones y scopes.</li>
              <li><strong>Semántico:</strong> Valida concordancia de tipos y detecta variables no declaradas.</li>
              <li><strong>Código Intermedio:</strong> Asigna nombres temporales y direcciones virtuales (<code>dir_1</code>, <code>dir_2</code>).</li>
              <li><strong>Código Objeto:</strong> Mapea símbolos a desplazamientos en el marco de pila (Stack Frame).</li>
            </ul>
          </div>

          {/* Gestor de Errores */}
          <div className="teoria-card">
            <div className="teoria-card__header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Gestor y Recuperación de Errores
            </div>
            <p>
              Supervisa todo el pipeline y decide cómo reaccionar ante anomalías sin colapsar el proceso prematuramente:
            </p>
            <ul className="teoria-lista">
              <li>
                <strong>Errores Léxicos:</strong> Caracteres inválidos ignorados o reemplazados.
              </li>
              <li>
                <strong>Errores Sintácticos:</strong> Recuperación en <em>Modo Pánico</em> (descartando tokens hasta encontrar un delimitador seguro como <code>;</code> o salto de línea) o por <em>Inserción de Token</em>.
              </li>
              <li>
                <strong>Errores Semánticos:</strong> Discrepancia de tipos asignando un tipo comodín <code>TIPO_ERROR</code> para continuar la inspección del resto del archivo.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
