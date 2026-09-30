import { describe, expect, it } from 'vitest';
import { normalizeFinancialData, ordenarPeriodos } from '../../js/modules/estados/estados-normalize.js';

// Estados mínimos válidos con los periodos en el orden dado.
function estados(periods) {
  return {
    periods,
    balanceGeneral: Object.fromEntries(periods.map(p => [p, { activos: {}, pasivos: {}, patrimonio: {} }])),
    estadoResultados: Object.fromEntries(periods.map(p => [p, {}]))
  };
}

describe('orden de los periodos al normalizar', () => {
  it('ordena solos los periodos que empiezan con un año', () => {
    expect(normalizeFinancialData(estados(['2025', '2024'])).periods).toEqual(['2024', '2025']);
    expect(normalizeFinancialData(estados(['2024-T2', '2024-T1', '2023-T4'])).periods).toEqual(['2023-T4', '2024-T1', '2024-T2']);
  });

  it('respeta el orden del usuario con nombres de mes u otros nombres', () => {
    // Ordenar alfabéticamente pondría Abril antes que Marzo.
    expect(normalizeFinancialData(estados(['Marzo', 'Abril'])).periods).toEqual(['Marzo', 'Abril']);
    expect(normalizeFinancialData(estados(['2024', 'Proyección'])).periods).toEqual(['2024', 'Proyección']);
  });

  it('no muta la entrada', () => {
    const periodos = ['2025', '2024'];
    expect(ordenarPeriodos(periodos)).toEqual(['2024', '2025']);
    expect(periodos).toEqual(['2025', '2024']);
    expect(ordenarPeriodos(['20251', '2024'])).toEqual(['20251', '2024']); // 5 dígitos: no es un año
  });
});
