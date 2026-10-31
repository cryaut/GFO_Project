import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { construirEOAF } from '../../js/modules/analisis/eoaf-calculations.js';
import { parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';

// Ronda 2 del EFE: totales reportados en el código compartido (D-072), Proforma
// con el EFE como única fuente (D-070) y tolerancia única del flujo directo
// (D-071). Bloque R (estados reales): pendiente por falta de datos.

const ENTRADA_BLOQUE_A = JSON.parse(
  readFileSync(new URL('./fixtures/estados_ronda2_bloque_A.json', import.meta.url), 'utf8')
);

describe('EOAF del bloque A con totales reportados excluidos (D-072)', () => {
  for (const conjunto of ENTRADA_BLOQUE_A.conjuntos) {
    const datos = parseFinancialJSON(JSON.stringify(conjunto.entrada));
    const periodos = datos.periods;
    for (let i = 1; i < periodos.length; i++) {
      const p0 = periodos[i - 1];
      const p1 = periodos[i];
      it(`${conjunto.id} ${p0} → ${p1}: cuadra con diferencia 0 y sin avisos de balance`, () => {
        const r = construirEOAF(datos, p0, p1);
        expect(r.resumen.estado).toBe('cuadra');
        expect(r.resumen.diferencia).toBe(0);
        expect(r.advertencias.join(' ')).not.toContain('no cumple A = P + O');
        expect(r.resumen.motivos).toEqual([]);
      });
    }
  }

  it('el par A3 2024 → 2025 ya no menciona totales sin clasificación ni avisos de balance', () => {
    const a3 = ENTRADA_BLOQUE_A.conjuntos.find(conjunto => conjunto.id === 'A3');
    const datos = parseFinancialJSON(JSON.stringify(a3.entrada));
    const r = construirEOAF(datos, '2024', '2025');
    expect(r.resumen.estado).toBe('cuadra');
    expect(r.resumen.motivos.join(' ')).not.toContain('Total de activos corrientes');
    expect(r.advertencias.join(' ')).not.toContain('no cumple A = P + O');
  });
});
