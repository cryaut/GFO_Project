import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construirEOAF } from '../../js/modules/analisis/eoaf-calculations.js';
import { construirReporte, flujoDesdeEFE } from '../../js/modules/proforma/proforma-calculations.js';
import { ejemploFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';
import { element } from './helpers/dom-falso.js';

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

describe('Proforma con el EFE como única fuente (D-070)', () => {
  const a1 = ENTRADA_BLOQUE_A.conjuntos.find(conjunto => conjunto.id === 'A1');
  const datosA1 = parseFinancialJSON(JSON.stringify(a1.entrada));

  it('T2: el adaptador traduce el EFE de A1 2024 → 2025 (operación 116, variación 18, saldo 180)', () => {
    expect(flujoDesdeEFE(datosA1)).toMatchObject({
      disponible: true,
      neto: { operacion: 116 },
      variacionNeta: 18,
      saldoFinal: 180,
      periodos: { inicial: '2024', final: '2025' }
    });
  });

  it('T2: los indicadores del reporte integrado salen del EFE', () => {
    const { indicadores } = construirReporte({ estados: datosA1, flujo: flujoDesdeEFE(datosA1) });
    const valor = nombre => indicadores.find(i => i.nombre === nombre)?.valor;
    expect(valor('Flujo de operación')).toBe(116);
    expect(valor('Variación neta del efectivo')).toBe(18);
    expect(valor('Saldo final de efectivo')).toBe(180);
  });

  it('T2: con un solo periodo de Estados, faltante del EFE y sin indicadores de flujo', () => {
    const unPeriodo = parseFinancialJSON(JSON.stringify({
      periods: ['2025'],
      balanceGeneral: { '2025': { activos: { 'Efectivo': 100 }, pasivos: {}, patrimonio: { 'Capital social': 100 } } },
      estadoResultados: {
        '2025': { 'Ventas': 50, 'Costo de Ventas': 0, 'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0 }
      }
    }));
    const flujo = flujoDesdeEFE(unPeriodo);
    expect(flujo.disponible).toBe(false);
    const r = construirReporte({ estados: unPeriodo, flujo });
    expect(r.indicadores.find(i => i.nombre === 'Flujo de operación')).toBeUndefined();
    const faltante = r.faltantes.find(f => f.modulo === 'Flujo de efectivo');
    expect(faltante).toMatchObject({ ruta: '#/analisis' });
    expect(faltante.texto).toContain('dos periodos');
  });
});

describe('ruta #/proforma con captura manual en #/flujo (D-070)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('la captura manual del flujo directo no alimenta Proforma: manda el EFE', async () => {
    vi.resetModules();
    const storage = new Map();
    vi.stubGlobal('localStorage', { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) });
    const page = element();
    vi.stubGlobal('document', { getElementById: id => (id === 'page-proforma' ? page : null) });
    const { default: store } = await import('../../js/store.js');
    const a1 = ENTRADA_BLOQUE_A.conjuntos.find(conjunto => conjunto.id === 'A1');
    store.setPersisted('estados', parseFinancialJSON(JSON.stringify(a1.entrada)));
    // Captura manual con operación distinta (98,000): Proforma debe ignorarla.
    store.setPersisted('flujo', ejemploFlujo());
    const { initProforma } = await import('../../js/modules/proforma/index.js');
    initProforma();
    expect(page.innerHTML).toContain('C$ 116.00');
    expect(page.innerHTML).not.toContain('C$ 98,000.00');
  });
});
