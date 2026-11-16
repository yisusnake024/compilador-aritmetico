export const mockExito = {
  ok: true,
  formula: '10 + 25 * 10 - 4',
  tokens: [
    { n: 1, tipo: 'NÚMERO', valor: '10' },
    { n: 2, tipo: 'OPERADOR', valor: '+' },
    { n: 3, tipo: 'NÚMERO', valor: '25' },
    { n: 4, tipo: 'OPERADOR', valor: '*' },
    { n: 5, tipo: 'NÚMERO', valor: '10' },
    { n: 6, tipo: 'OPERADOR', valor: '-' },
    { n: 7, tipo: 'NÚMERO', valor: '4' },
  ],
  ast: {
    tipo: 'OPERADOR',
    valor: '-',
    izquierda: {
      tipo: 'OPERADOR',
      valor: '+',
      izquierda: {
        tipo: 'NÚMERO',
        valor: '10',
        izquierda: null,
        derecha: null,
      },
      derecha: {
        tipo: 'OPERADOR',
        valor: '*',
        izquierda: {
          tipo: 'NÚMERO',
          valor: '25',
          izquierda: null,
          derecha: null,
        },
        derecha: {
          tipo: 'NÚMERO',
          valor: '10',
          izquierda: null,
          derecha: null,
        },
      },
    },
    derecha: {
      tipo: 'NÚMERO',
      valor: '4',
      izquierda: null,
      derecha: null,
    },
  },
  ast_texto: [
    '            -',
    '           / \\',
    '          +    4',
    '         / \\',
    '       10    *',
    '             / \\',
    '           25   10',
  ].join('\n'),
  tabla_simbolos: [
    { simbolo: '10', direccion: 'dir_1' },
    { simbolo: '25', direccion: 'dir_2' },
    { simbolo: '10', direccion: 'dir_3' },
    { simbolo: '4', direccion: 'dir_4' },
  ],
  tabla_tipos: [
    { simbolo: '10', tipo: 'entero' },
    { simbolo: '25', tipo: 'entero' },
    { simbolo: '10', tipo: 'entero' },
    { simbolo: '4', tipo: 'entero' },
  ],
};

export const mockError = {
  ok: false,
  formula: '12 + 4 # 3',
  fase: 'lexico',
  errores: [
    {
      caracter: '#',
      posicion: 8,
      mensaje: "Error léxico: carácter no válido '#' en la posición 8.",
    },
  ],
};

/**
 * Devuelve el mock de éxito o error según la fórmula.
 * Usa el de error si la fórmula contiene un carácter
 * que no sea dígito, operador (+, -, *, /) o espacio.
 */
export function elegirMockCompile(formula) {
  const invalido = /[^0-9+\-*/(). ]/.test(formula);
  if (invalido) {
    // Encontrar el primer carácter inválido para el mock
    const match = formula.match(/[^0-9+\-*/(). ]/);
    return {
      ...mockError,
      formula,
      errores: [
        {
          caracter: match[0],
          posicion: formula.indexOf(match[0]) + 1,
          mensaje: `Error léxico: carácter no válido '${match[0]}' en la posición ${formula.indexOf(match[0]) + 1}.`,
        },
      ],
    };
  }
  return { ...mockExito, formula };
}

