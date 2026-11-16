# Backend — Simulador de Compilador Aritmético

API REST construida con **FastAPI** para el Simulador de Compilador Aritmético (Teoría de Compiladores).

El backend analiza expresiones aritméticas mediante un pipeline determinista en Python (análisis léxico, sintáctico con árbol AST, renderizado ASCII y análisis semántico con tablas de símbolos y tipos). Además, ofrece un servicio pedagógico opcional de retroalimentación asistida por Inteligencia Artificial (Google Gemini).

---

## 1. Requisitos

- Python ≥ 3.10
- pip

---

## 2. Instalación

Desde la carpeta `compilador-aritmetico/backend`:

```bash
pip install -r requirements.txt
```

---

## 3. Ejecución

### Modo normal (sin IA)

El simulador funciona de manera 100 % completa y determinista sin clave de IA:

```bash
uvicorn app.main:app --port 8000 --reload
```

La documentación interactiva Swagger estará disponible en: [http://localhost:8000/docs](http://localhost:8000/docs).

Al consultar `GET /api/health`, responderá:
```json
{
  "status": "ok",
  "ia_disponible": false
}
```

---

## 4. Retroalimentación con IA

El backend integra retroalimentación pedagógica generada con el modelo **Google Gemini** a través de su SDK oficial `google-genai`.

### Configuración del entorno

1. Copia la plantilla de variables de entorno `.env.example` creando el archivo `.env`:
   ```bash
   # En Windows PowerShell
   Copy-Item .env.example .env

   # En Linux / macOS / Bash
   cp .env.example .env
   ```

2. Abre `.env` y configura cada variable según se indica:
   - `AI_API_KEY`: Tu clave de API obtenida de [Google AI Studio](https://aistudio.google.com/).
   - `AI_MODEL`: Identificador oficial del modelo Gemini (por ejemplo: `gemini-2.5-flash` o `gemini-1.5-flash`).
   - `AI_TIMEOUT_SECONDS`: (Opcional, default `20`) Tiempo máximo de espera en segundos para la respuesta de la IA.
   - `AI_MAX_TOKENS`: (Opcional, default `400`) Número máximo de tokens que puede generar la IA.

Ejemplo de contenido de `.env`:
```env
AI_API_KEY=AIzaSyD-tu-clave-aqui
AI_MODEL=gemini-2.5-flash
AI_TIMEOUT_SECONDS=20
AI_MAX_TOKENS=400
```

> **Seguridad:** El archivo `.env` está registrado en `.gitignore` y **NUNCA** debe comitearse ni compartirse en repositorios públicos.

### Cómo probar `POST /api/feedback` manualmente en Swagger UI (`/docs`)

1. Inicia el servidor con el archivo `.env` configurado:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
2. Abre [http://localhost:8000/docs](http://localhost:8000/docs) en tu navegador.
3. Verifica que en `GET /api/health` el valor de `ia_disponible` sea `true`.
4. Despliega la ruta `POST /api/feedback` y presiona **"Try it out"**.
5. En el cuerpo JSON escribe una fórmula válida o con error:
   ```json
   {
     "formula": "10 + 25 * 10 - 4"
   }
   ```
6. Presiona **"Execute"**. Recibirás una respuesta HTTP 200 con la explicación didáctica generada por la IA:
   ```json
   {
     "ok": true,
     "retroalimentacion": "El compilador procesó la expresión...",
     "desde_cache": false
   }
   ```
7. Si vuelves a presionar **"Execute"** inmediatamente con la misma fórmula, notarás `"desde_cache": true` (obtenida instantáneamente de la memoria LRU sin consumir cuota del proveedor de IA).

---

## 5. Pruebas automatizadas

Ejecutar la suite completa de pruebas unitarias y de integración:

```bash
pytest -q
```
*(Todas las pruebas de IA utilizan simulación/monkeypatching en memoria; no requieren conexión a internet ni consumen cuota de API).*

