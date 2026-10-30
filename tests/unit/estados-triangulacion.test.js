import { describe, expect, it } from 'vitest';
import { computeFinancialTotals, validateFinancialData } from '../../js/modules/estados/estados-calculations.js';
import { parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';
import { crearEntradaRazones, calcularRazon } from '../../js/modules/razones/razones-motor.js';
import { formatearResultadoRazon } from '../../js/modules/razones/razones-presentacion.js';

// R2-3: triangulación con cifras calculadas a mano. Un solo caso con valores
// fijos del encargo; cada expectativa se puede comprobar en papel:
//   corrientes 250 + 50 = 300; fijos netos 300 − 60 = 240; activos 540;
//   pasivos 90 + 100 = 190; patrimonio 200 + 150 = 350; 540 = 190 + 350;
//   ventas netas 500 − 20 = 480; bruta 480 − 200 = 280; neta 280 − 100 − 30 = 150;
//   razón corriente 300 / 90 = 3.33.
// D-063: los descuentos y rebajas se declaran en 0 porque el catálogo los exige.

const TRIANGULACION = () => parseFinancialJSON(JSON.stringify({
  periods: ['2024'],
  // «Préstamo a largo plazo» es un nombre ambiguo del catálogo; como haría la
  // interfaz al confirmar la sugerencia, se declara su identidad reconocida.
  accountIdentities: {
    pasivos: {
      'Pasivo Largo Plazo': { idCuenta: 'bs.long_term_borrowings', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'legado' }
    }
  },
  balanceGeneral: {
    '2024': {
      activos: {
        'Efectivo': 250, 'Cuentas por Cobrar': 50, 'Edificios': 300, 'Depreciacion Acumulada': -60,
        'Total de activos corrientes': 300
      },
      pasivos: { 'Cuentas por Pagar': 90, 'Pasivo Largo Plazo': 100, 'Total de pasivos corrientes': 90 },
      patrimonio: { 'Capital Social': 200, 'Resultado del ejercicio': 150 }
    }
  },
  estadoResultados: {
    '2024': {
      'Ventas': 500, 'Devoluciones sobre ventas': 20, 'Descuentos sobre ventas': 0,
      'Rebajas sobre ventas': 0, 'Costo de Ventas': 200, 'Gastos de Administracion': 100,
      'Impuesto sobre la Renta': 30
    }
  }
}));

describe('triangulación con cifras a mano (R2-3)', () => {
  const datos = TRIANGULACION();
  const t = computeFinancialTotals(datos, '2024');

  it('calcula el balance completo sin motivos pendientes', () => {
    expect(t.activosCorrientes).toBe(300);
    expect(t.activosFijos).toBe(240);
    expect(t.totalActivos).toBe(540);
    expect(t.pasivosCorrientes).toBe(90);
    expect(t.totalPasivos).toBe(190);
    expect(t.totalPatrimonio).toBe(350);
    expect(t.notAvailableReasons).toEqual([]);
  });

  it('calcula el estado de resultados con ventas netas', () => {
    expect(t.ventasBrutas).toBe(500);
    expect(t.ventas).toBe(480);
    expect(t.utilidadBruta).toBe(280);
    expect(t.utilidadNeta).toBe(150);
  });

  it('cuadra exacto y no diagnostica resultado faltante: la utilidad ya está en el patrimonio', () => {
    const [fila] = validateFinancialData(datos);
    expect(fila).toMatchObject({ balanced: true, difference: 0, diagnostico: null });
    expect(t.totalActivos).toBe(t.totalPasivos + t.totalPatrimonio);
  });

  it('la razón corriente del motor da 3.33', () => {
    const entrada = crearEntradaRazones(datos, '2024');
    const resultado = calcularRazon('liquidez_razon_corriente', entrada);
    expect(resultado.valor).toBeCloseTo(300 / 90, 6);
    expect(formatearResultadoRazon('liquidez_razon_corriente', resultado)).toBe('3.33');
  });
});
