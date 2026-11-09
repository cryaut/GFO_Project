import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { calcularBalanceDocente, calcularERDocente, calcularERResidualDocente } from '../../js/modules/proforma/proforma-docente-calculations.js';
import { CASOS_PROFORMA_DOCENTE as casos } from '../../js/modules/proforma/proforma-docente-ejemplos.js';
import { proformaUI } from '../../js/modules/proforma/proforma-ui.js';
import { cambiar, element, enviar, llenar } from './helpers/dom-falso.js';

const referencias = JSON.parse(readFileSync(new URL(
  '../../docs/planificacion/proforma-presupuesto-docente/referencias.json', import.meta.url
), 'utf8'));

it('reproduce el ER residual y la actividad proyectada de Electrónicas en USD', () => {
  const r = calcularERResidualDocente(casos.electronicas.supuestos);
  expect(r).toMatchObject({ ventas: 52562500, costo: 37845000, intereses: 658040, ventasCredito: 44678125, comprasCredito: 37962000 });
  expect(r.uai).toBeCloseTo(10391428.57142857, 6);
  expect(r.gastos).toBeCloseTo(3668031.4285714286, 6);
  expect(r.neta).toBeCloseTo(7274000, 6);
  expect(r.actividad.cicloConversion).toBeCloseTo(106.59415930639283, 8);
  const parcial = calcularERResidualDocente({ ...casos.electronicas.supuestos, costoSobreVentas: null });
  expect(parcial.ventas).toBeNull();
  expect(parcial.actividad.RotCxC).toBeNull();
  expect(parcial.actividad.RotInv).toBe(6);
});

describe('Métodos docentes AFOD en Proforma', () => {
  it.each([
    ['euro', 'porcentaje', 'euro'],
    ['metro', 'porcentaje', 'metro_porcentaje'],
    ['metro', 'fijo-variable', 'metro_fijo_variable']
  ])('contrasta todas las partidas de %s con método %s', (caso, metodo, referencia) => {
    const r = calcularERDocente(casos[caso].supuestos, metodo);
    for (const [cuenta, esperado] of Object.entries(referencias[referencia])) {
      expect(r[cuenta], cuenta).toBeCloseTo(esperado, 2);
    }
    expect(r.retenidas).toBe(r.neta - r.dividendos);
  });

  it('separa la clasificación fija y variable y respeta los operandos de cada variante', () => {
    const metro = casos.metro.supuestos;
    const porcentaje = calcularERDocente(metro, 'porcentaje');
    const fijoVariable = calcularERDocente(metro, 'fijo-variable');
    expect(porcentaje.tasaCosto).toBe(0.65);
    expect(fijoVariable).toMatchObject({ tasaCosto: 0.5, tasaGastos: 0.06, fijoCosto: 210000, fijoGastos: 36000 });
    expect(fijoVariable.costo).toBe(210000 + 1500000 * 0.5);
    expect(fijoVariable.gastos).toBe(36000 + 1500000 * 0.06);
  });

  it('ubica otros ingresos operativos en la UAII y los no operativos en la UAI', () => {
    const s = { ...casos.euro.supuestos, otrosOperativos: 100, otrosNoOperativos: -50, tasaIR: 0 };
    expect(calcularERDocente(s, 'porcentaje')).toMatchObject({
      uaii: 1287100, uai: 962050, ir: 0, neta: 962050, retenidas: 642050
    });
  });

  it('deja N/D los importes dependientes de ventas históricas cero o tasa futura desconocida', () => {
    const s = casos.euro.supuestos;
    expect(calcularERDocente({ ...s, ventasBase: 0 }, 'porcentaje')).toMatchObject({
      ventas: 3900000, tasaCosto: null, costo: null, uai: null, neta: null, dividendos: 320000
    });
    expect(calcularERDocente({ ...s, tasaIR: null }, 'porcentaje')).toMatchObject({
      uai: 962000, ir: null, neta: null, retenidas: null
    });
    expect(calcularERDocente({ ...s, ventasProyectadas: 0 }, 'porcentaje')).toMatchObject({
      uai: -325000, ir: 0, neta: -325000
    });
  });

  it('concilia el balance proyectado de Leonard y verifica el ajuste de dividendos', () => {
    const s = casos.leonard.supuestos;
    const r = calcularBalanceDocente(s);
    const esperado = referencias.leonard;
    expect(r.activos).toEqual({
      efectivo: 50000, valores: 15000, cxc: 300000, inventario: 360000, corrientes: 725000,
      fijosNetos: 658000, total: esperado.activos
    });
    expect(r.pasivos.cxp).toBeCloseTo(420000, 2);
    expect(r.pasivos.corrientes).toBeCloseTo(510000, 2);
    expect(r.pasivos.total).toBeCloseTo(esperado.pasivos, 2);
    expect(r.patrimonio).toEqual({ acciones: 200000, retenidas: 270000, total: esperado.patrimonio });
    expect(r.financiamiento).toBe(esperado.financiamiento);
    expect(r.dividendoSinFaltante).toBe(esperado.dividendo_sin_faltante);
    const ajustado = calcularBalanceDocente({ ...s, dividendos: r.dividendoSinFaltante });
    expect(ajustado.patrimonio.retenidas).toBe(323000);
    expect(ajustado.pasivosPatrimonio).toBe(ajustado.activos.total);
    expect(ajustado.financiamiento).toBe(0);
  });

  it('distingue un faltante inevitable de un balance con premisas incompletas', () => {
    const s = casos.leonard.supuestos;
    expect(calcularBalanceDocente({ ...s, efectivoMinimo: 100000 })).toMatchObject({
      financiamiento: 103000, dividendoSinFaltante: null, faltanteSinDividendos: 33000
    });
    expect(calcularBalanceDocente({ ...s, tasaCxP: null })).toMatchObject({
      activos: { total: 1383000 }, pasivos: { cxp: null, total: null }, patrimonio: { total: 470000 },
      diferencia: null, financiamiento: null, exceso: null, dividendoSinFaltante: null
    });
  });

  it('expone los ejercicios y recalcula el dividendo desde la ruta de Proforma', async () => {
    const page = element();
    proformaUI(page, { reporte: construirReporte({}) });
    const panel = page.querySelector('#proformaAFODContenido');
    expect(panel.innerHTML).toContain('USD 577,200.00');
    await cambiar(page, 'proformaAFODCaso', 'metro');
    expect(panel.innerHTML).toContain('Fijo + variable');
    expect(panel.innerHTML).toContain('USD 216,857.14');
    expect(panel.innerHTML).toContain('USD 227,400.00');
    await cambiar(page, 'proformaAFODCaso', 'leonard');
    expect(panel.innerHTML).toContain('USD 53,000.00');
    expect(panel.innerHTML).toContain('USD 17,000.00');
    const campos = Object.fromEntries(Object.entries(casos.leonard.supuestos)
      .map(([clave, valor]) => ['proformaAFOD-' + clave, clave.startsWith('tasa') ? valor * 100 : valor]));
    llenar(page, { ...campos, 'proformaAFOD-dividendos': 17000 });
    await enviar(page, 'proformaAFODForm');
    const salida = page.querySelector('#proformaAFODResultado');
    expect(salida.innerHTML).toContain('USD 323,000.00');
    expect(salida.innerHTML).not.toContain('USD 53,000.00');
    llenar(page, { 'proformaAFOD-tasaCxP': '', 'proformaAFOD-valoresNegociables': 'C$ 15000' });
    await enviar(page, 'proformaAFODForm');
    expect(salida.innerHTML).toContain('N/D');
    expect(page.querySelector('#proformaAFODAviso').textContent).toContain('Valores negociables de 2012');
  });
});
