# Simulador de Compilador Aritmético — Frontend

Frontend en React + Vite para el Simulador de Compilador Aritmético (Teoría de Compiladores).

## Requisitos

- Node.js ≥ 18
- npm ≥ 9

## Instalación

```bash
cd compilador-aritmetico/frontend
npm install
```

## Ejecución en modo mock (sin backend)

```bash
# Windows (PowerShell)
$env:VITE_USE_MOCK="true"; npx vite

# Windows (CMD)
set VITE_USE_MOCK=true && npx vite

# Linux / macOS
VITE_USE_MOCK=true npx vite
```

Abre http://localhost:5173 en tu navegador.

En modo mock se simulan las tres rutas de la API con datos de ejemplo:
- **Fórmula válida:** `10 + 25 * 10 - 4` → tokens, AST, tablas
- **Fórmula con error:** `12 + 4 # 3` → error léxico
- **Feedback exitoso:** cualquier fórmula sin el dígito `9`
- **Feedback fallido:** fórmulas que contengan `9` → error "límite de uso"

## Ejecución contra el backend

```bash
# Asegúrate de que el backend esté corriendo en http://localhost:8000
npm run dev
```

El proxy de Vite redirige `/api` a `http://localhost:8000`.

## Build de producción

```bash
npm run build
```

Los archivos se generan en `dist/`.

## Estructura

```
src/
├── main.jsx                  Punto de entrada
├── App.jsx                   Componente principal
├── styles.css                Estilos con variables CSS (temas claro/oscuro)
├── components/
│   ├── FormulaForm.jsx       Formulario de entrada
│   ├── PhaseStepper.jsx      Indicador de fases del compilador
│   ├── TokensTable.jsx       Tabla de tokens (análisis léxico)
│   ├── AstView.jsx           Vista del AST (gráfico SVG + texto)
│   ├── SymbolTables.jsx      Tablas de símbolos y tipos (semántico)
│   ├── ErrorPanel.jsx        Panel de errores con resaltado
│   ├── FeedbackPanel.jsx     Panel de retroalimentación con IA
│   └── ThemeToggle.jsx       Botón para alternar tema claro/oscuro
├── services/
│   └── api.js                Funciones para llamar la API (o mocks)
└── mocks/
    ├── compile.js            Datos mock de compilación
    ├── health.js             Datos mock de salud
    └── feedback.js           Datos mock de retroalimentación IA
```

