import { describe, expect, it } from 'vitest';
import { computeFinancialTotals, validateFinancialData } from '../../js/modules/estados/estados-calculations.js';
import { parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';

// Casos de aceptación de la tabla del encargo (instrucciones_carlos_estados_R1-R2.md):
// lo que "Debe dar" es la columna que se verifica aquí, con su regla D-061 a D-065.
// Los casos 1, 2 y 3a se rechazan en la compuerta; el resto se calcula.

const vacio = () => ({ periods: [], balanceGeneral: {}, estadoResultados: {} });

const conJSON = datos => parseFinancialJSON(JSON.stringify(datos));

const conBalance = (activos, pasivos = {}, patrimonio = {}, resultados = {}) => conJSON({
  periods: ['2024'],
  balanceGeneral: { '2024': { activos, pasivos, patrimonio } },
  estadoResultados: { '2024': resultados }
});

describe('estados robustos: casos de aceptación de la tabla', () => {
  it('Caso 1 (D-061): costo de ventas negativo se rechaza en la fila, con mensaje', () => {
    expect(() => conBalance({}, {}, {}, { 'Costo de Ventas': -400 })).toThrow(
      'Fila 0, cuenta «Costo de Ventas», periodo 2024: esta cuenta se captura en positivo. '
      + 'Quite el signo negativo o los paréntesis. Si es una devolución o un descuento, use su cuenta de deducción.'
    );
    // La misma entrada por la vía de alta de la interfaz conserva su número de fila.
    expect(() => registrarCuenta(vacio(), {
      nombre: 'Costo de Ventas', grupo: 'estadoResultados', periodo: '2024', importe: -400, fila: 7
    })).toThrow('Fila 7, cuenta «Costo de Ventas», periodo 2024:');
  });

  it('Caso 2 (D-061): gasto de administración negativo se rechaza en la fila, con mensaje', () => {
    expect(() => conBalance({}, {}, {}, { 'Gastos de Administracion': -200 })).toThrow(
      'Fila 0, cuenta «Gastos de Administracion», periodo 2024: esta cuenta se captura en positivo. '
      + 'Quite el signo negativo o los paréntesis. Si es una devolución o un descuento, use su cuenta de deducción.'
    );
  });

  it('Caso 3a (D-061): depreciación acumulada positiva se rechaza en la fila, con mensaje', () => {
    expect(() => conBalance({ 'Depreciacion Acumulada': 200 })).toThrow(
      'Fila 0, cuenta «Depreciacion Acumulada», periodo 2024: la depreciación acumulada se captura en negativo.'
    );
  });

  it('Caso 3b (D-061): depreciación acumulada negativa pasa la compuerta y cuadra', () => {
    const datos = conBalance(
      { 'Efectivo': 200, 'Cuentas por Cobrar': 300, 'Edificios': 500, 'Depreciacion Acumulada': -200 },
      { 'Cuentas por Pagar': 300 },
      { 'Capital Social': 500 }
    );
    const t = computeFinancialTotals(datos, '2024');
    expect(t.activosFijos).toBe(300);
    expect(t.totalActivos).toBe(800);
    expect(validateFinancialData(datos)[0]).toMatchObject({ balanced: true, difference: 0 });
    expect(t.notAvailableReasons).toEqual([]);
  });

  it('Caso 4 (D-063): edificio sin depreciación deja activos fijos y total N/D, con motivo', () => {
    const datos = conBalance({ 'Efectivo': 100, 'Edificios': 300 }, {}, { 'Capital Social': 400 });
    const t = computeFinancialTotals(datos, '2024');
    expect(t.activosFijos).toBeNull();
    expect(t.totalActivos).toBeNull();
    expect(t.notAvailableReasons).toContainEqual({
      group: 'activos', name: 'Depreciación acumulada',
      motivo: 'missing_required_account_data', campos: ['activosFijos', 'totalActivos']
    });
  });

  it('Caso 5 (D-062): total "Ventas netas" que cuadra manda sin motivo, desde JSON', () => {
    const datos = conBalance({}, {}, {}, {
      'Ventas de Productos': 800, 'Ingresos por Servicios': 200, 'Ventas netas': 1000
    });
    const t = computeFinancialTotals(datos, '2024');
    expect(t.ventasBrutas).toBe(1000);
    expect(t.ventas).toBe(1000);
    expect(t.notAvailableReasons).toEqual([]);
  });

  it('Caso 6 (D-062): el mismo caso cargado desde la interfaz da la misma cifra', () => {
    const datos = registrarCuenta(vacio(), [
      { nombre: 'Ventas de Productos', grupo: 'estadoResultados', periodo: '2024', importe: 800 },
      { nombre: 'Ingresos por Servicios', grupo: 'estadoResultados', periodo: '2024', importe: 200 },
      { nombre: 'Ventas netas', grupo: 'estadoResultados', periodo: '2024', importe: 1000 }
    ]);
    const t = computeFinancialTotals(datos, '2024');
    expect(t.ventasBrutas).toBe(1000);
    expect(t.ventas).toBe(1000);
    expect(t.notAvailableReasons).toEqual([]);
    // R1-2: la vía de entrada no cambia el resultado.
    const porJSON = conBalance({}, {}, {}, {
      'Ventas de Productos': 800, 'Ingresos por Servicios': 200, 'Ventas netas': 1000
    });
    expect(t.ventas).toBe(computeFinancialTotals(porJSON, '2024').ventas);
  });

  it('Caso 7 (D-062): total de activos corrientes que cuadra se acepta sin motivo', () => {
    const datos = conBalance({
      'Efectivo': 200, 'Cuentas por Cobrar': 180, 'Inventario': 120, 'Total de activos corrientes': 500
    });
    const t = computeFinancialTotals(datos, '2024');
    expect(t.activosCorrientes).toBe(500);
    expect(t.notAvailableReasons).toEqual([]);
  });

  it('Caso 8 (D-062): total de activos corrientes descuadrado manda y avisa la diferencia', () => {
    const datos = conBalance({
      'Efectivo': 200, 'Cuentas por Cobrar': 180, 'Inventario': 120, 'Total de activos corrientes': 480
    });
    const t = computeFinancialTotals(datos, '2024');
    expect(t.activosCorrientes).toBe(480);
    expect(t.notAvailableReasons).toContainEqual(expect.objectContaining({
      motivo: 'reported_subtotal_mismatch', diferencia: -20,
      campos: expect.arrayContaining(['activosCorrientes'])
    }));
  });

  it('Caso 9 (D-062): solo "Total activos" da el total y subtotales N/D, nunca 0', () => {
    const datos = conBalance({ 'Total de activos': 1000 });
    const t = computeFinancialTotals(datos, '2024');
    expect(t.totalActivos).toBe(1000);
    expect(t.activosCorrientes).toBeNull();
    expect(t.activosFijos).toBeNull();
    expect(t.notAvailableReasons).toEqual([]);
  });

  it('Caso 10 (D-063, D-064): ventas netas 950, utilidad bruta 550 y utilidad neta 180', () => {
    const datos = conBalance({}, {}, {}, {
      'Ventas': 1000, 'Devoluciones sobre ventas': 50, 'Descuentos sobre ventas': 0,
      'Rebajas sobre ventas': 0, 'Costo de Ventas': 400, 'Gastos de Administracion': 200,
      'Gastos de Ventas': 100, 'Otros gastos no operativos': 20, 'Impuesto sobre la Renta': 50
    });
    const t = computeFinancialTotals(datos, '2024');
    expect(t.ventas).toBe(950);
    expect(t.utilidadBruta).toBe(550);
    expect(t.utilidadNeta).toBe(180);
    expect(t.notAvailableReasons).toEqual([]);
  });
});
