import { elegirMockCompile } from '../mocks/compile.js';
import { mockHealth } from '../mocks/health.js';
import { elegirMockFeedback } from '../mocks/feedback.js';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

function getApiBase() {
  const url = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

const API_BASE = getApiBase();

/**
 * POST /api/compile
 */
export async function compilar(formula) {
  if (useMock) {
    await delay(400);
    return elegirMockCompile(formula);
  }

  const res = await fetch(`${API_BASE}/api/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formula }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El servidor está iniciando (Cold Start de Render). Por favor espera unos segundos y pulsa "Analizar" nuevamente.');
  }

  validarContrato(data);
  return data;
}

/**
 * GET /api/health
 */
export async function obtenerSalud() {
  if (useMock) {
    await delay(200);
    return mockHealth;
  }

  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) {
      return { status: 'error', ia_disponible: false };
    }
    const text = await res.text();
    const data = JSON.parse(text);
    return {
      status: data.status || 'ok',
      ia_disponible: data.ia_disponible === true,
    };
  } catch {
    return { status: 'error', ia_disponible: false };
  }
}

/**
 * POST /api/feedback
 */
export async function pedirRetroalimentacion(formula) {
  if (useMock) {
    await delay(1200);
    return elegirMockFeedback(formula);
  }

  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formula }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('El servidor está iniciando. Por favor reintenta en unos segundos.');
  }
}

/* ---- Helpers ---- */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validarContrato(data) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Respuesta no válida del servidor.');
  }
  if (typeof data.ok !== 'boolean') {
    throw new Error('Respuesta no válida del servidor.');
  }
}

