export const mockFeedbackExito = {
  ok: true,
  retroalimentacion:
    'La fórmula "10 + 25 * 10 - 4" se evaluó correctamente.\n\n' +
    'Análisis paso a paso:\n' +
    '1. Se identificaron 7 tokens: 4 números y 3 operadores.\n' +
    '2. El operador * tiene mayor precedencia que + y -, por lo que se evalúa primero: 25 * 10 = 250.\n' +
    '3. Luego se evalúa de izquierda a derecha: 10 + 250 = 260.\n' +
    '4. Finalmente: 260 - 4 = 256.\n\n' +
    'El resultado final es 256.\n\n' +
    'Todos los símbolos son de tipo entero y se asignaron correctamente en la tabla de símbolos.',
  desde_cache: false,
};

export const mockFeedbackFallo = {
  ok: false,
  motivo: 'limite_de_uso',
  mensaje:
    'Se alcanzó el límite de solicitudes de IA. Intenta de nuevo más tarde.',
};

/**
 * Devuelve mock de éxito o fallo.
 * Usa el de fallo si la fórmula contiene "9".
 */
export function elegirMockFeedback(formula) {
  if (formula.includes('9')) {
    return mockFeedbackFallo;
  }
  return mockFeedbackExito;
}

