import { useState } from 'react';

/* ======================
   Layout del AST en SVG
   ====================== */

function computeLayout(ast) {
  const nodes = [];
  const edges = [];
  const counter = { value: 0 };
  let maxDepth = 0;

  function traverse(node, depth, parentPos) {
    if (!node) return null;

    if (depth > maxDepth) maxDepth = depth;

    // Recorrido in-order
    traverse(node.izquierda, depth + 1, null);

    const x = counter.value * 70 + 40;
    const y = depth * 80 + 40;
    const id = counter.value;
    counter.value++;

    nodes.push({
      id,
      tipo: node.tipo,
      valor: node.valor,
      x,
      y,
      esOperador: node.tipo === 'OPERADOR',
    });

    const currentPos = { x, y, id };

    traverse(node.derecha, depth + 1, null);

    // Generar aristas desde el nodo actual a sus hijos
    // Lo hacemos en una segunda pasada más abajo
    return currentPos;
  }

  // Primera pasada: posicionar nodos
  traverse(ast, 0, null);

  // Segunda pasada: generar aristas recorriendo el árbol de nuevo
  function buildEdges(node, depth) {
    if (!node) return null;

    const leftResult = buildEdges(node.izquierda, depth + 1);

    const idx = edgeCounter.value;
    edgeCounter.value++;
    const currentNode = nodes[idx];

    const rightResult = buildEdges(node.derecha, depth + 1);

    if (leftResult) {
      edges.push({
        fromX: currentNode.x,
        fromY: currentNode.y,
        toX: leftResult.x,
        toY: leftResult.y,
      });
    }
    if (rightResult) {
      edges.push({
        fromX: currentNode.x,
        fromY: currentNode.y,
        toX: rightResult.x,
        toY: rightResult.y,
      });
    }

    return { x: currentNode.x, y: currentNode.y };
  }

  const edgeCounter = { value: 0 };
  buildEdges(ast, 0);

  const width = counter.value * 70 + 40;
  const height = (maxDepth + 1) * 80 + 40;

  return { nodes, edges, width, height };
}

/* ======================
   Componente SVG del AST
   ====================== */

function AstGraphic({ ast }) {
  if (!ast) return null;

  const { nodes, edges, width, height } = computeLayout(ast);

  const RADIO = 22;
  const RECT_W = 48;
  const RECT_H = 32;
  const RECT_R = 8;

  return (
    <div className="ast-grafico">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Árbol de sintaxis abstracta"
      >
        {/* Aristas */}
        {edges.map((e, i) => (
          <line
            key={`edge-${i}`}
            x1={e.fromX}
            y1={e.fromY}
            x2={e.toX}
            y2={e.toY}
            stroke="var(--texto-secundario)"
            strokeWidth="1.5"
            opacity="0.6"
          />
        ))}

        {/* Nodos */}
        {nodes.map((n) =>
          n.esOperador ? (
            <g key={`node-${n.id}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={RADIO}
                fill="var(--operador-suave)"
                stroke="var(--operador)"
                strokeWidth="2"
              />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--operador)"
                fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace"
                fontSize="16"
                fontWeight="700"
              >
                {n.valor}
              </text>
            </g>
          ) : (
            <g key={`node-${n.id}`}>
              <rect
                x={n.x - RECT_W / 2}
                y={n.y - RECT_H / 2}
                width={RECT_W}
                height={RECT_H}
                rx={RECT_R}
                ry={RECT_R}
                fill="var(--superficie-2)"
                stroke="var(--borde)"
                strokeWidth="1.5"
              />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--texto)"
                fontFamily="ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace"
                fontSize="14"
                fontWeight="600"
              >
                {n.valor}
              </text>
            </g>
          )
        )}
      </svg>
    </div>
  );
}

/* ======================
   Pestañas + Texto
   ====================== */

function CopyButton({ texto }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* fallback silencioso */
    }
  };

  return (
    <button
      type="button"
      className={`btn-secundario ${copiado ? 'btn-copiar-ok' : ''}`}
      onClick={copiar}
      aria-label="Copiar al portapapeles"
    >
      {copiado ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

export { CopyButton };

export default function AstView({ ast, astTexto }) {
  const [pestana, setPestana] = useState('grafico');

  if (!ast && !astTexto) return null;

  return (
    <div>
      <div className="pestanas" role="tablist">
        <button
          role="tab"
          className={`pestana ${pestana === 'grafico' ? 'pestana--activa' : ''}`}
          aria-selected={pestana === 'grafico'}
          onClick={() => setPestana('grafico')}
          type="button"
        >
          Gráfico
        </button>
        <button
          role="tab"
          className={`pestana ${pestana === 'texto' ? 'pestana--activa' : ''}`}
          aria-selected={pestana === 'texto'}
          onClick={() => setPestana('texto')}
          type="button"
        >
          Texto
        </button>
      </div>

      {pestana === 'grafico' && ast && (
        <div role="tabpanel">
          <AstGraphic ast={ast} />
        </div>
      )}

      {pestana === 'texto' && astTexto && (
        <div role="tabpanel" className="ast-texto">
          <div className="ast-texto__copiar">
            <CopyButton texto={astTexto} />
          </div>
          <pre>{astTexto}</pre>
        </div>
      )}
    </div>
  );
}

