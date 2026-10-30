import { afterEach, expect, it, vi } from 'vitest';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { montoCuenta, consultarMontoCuenta, resumenIdentificacion } from '../../js/modules/estados/cuentas-identificador.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { rowsToFinancialData, tableTextToFinancialData, TABULAR_TEMPLATE_ROWS } from '../../js/modules/estados/estados-import.js';

const vacio = () => ({ name: 'Prueba', periods: [], balanceGeneral: {}, estadoResultados: {} });
afterEach(() => vi.unstubAllGlobals());

it('el registro manual y la importación guardan la misma forma normalizada e id', () => {
  const manual = registrarCuenta(vacio(), { nombre: 'Efectivo', grupo: 'activos', periodo: '2024', importe: 12 });
  const importado = tableTextToFinancialData('Cuenta,Grupo,2024\nEfectivo,activos,12');
  expect(manual.balanceGeneral).toEqual(importado.balanceGeneral);
  expect(manual.accountTypes).toEqual(importado.accountTypes);
  expect(manual.accountIdentities.activos.Efectivo.idCuenta).toBe(importado.accountIdentities.activos.Efectivo.idCuenta);
  expect(normalizeFinancialData(manual)).toEqual(manual);
  expect(montoCuenta(manual, '2024', 'bs.cash_and_equivalents')).toBe(12);
});

it('la plantilla termina con siete cuentas reconocidas', () => {
  const datos = rowsToFinancialData(TABULAR_TEMPLATE_ROWS);
  expect(resumenIdentificacion(datos)).toEqual({ reconocida: 7, sugerida: 0, no_reconocida: 0 });
});

it('continúa con desconocidas y sugerencias, conserva sus montos y explica el N/D', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,2024\nEfectivo,activos,20\nCuenta X,activos,100\nEfetivo,activos,30\nSin grupo,,40');
  expect(resumenIdentificacion(datos)).toEqual({ reconocida: 1, sugerida: 1, no_reconocida: 2 });
  expect(datos.balanceGeneral['2024'].activos['Cuenta X']).toBe(100);
  expect(datos.balanceGeneral['2024'].activos.Efetivo).toBe(30);
  expect(datos.pendingAccounts[0].importes['2024']).toBe(40);
  expect(computeFinancialTotals(datos, '2024').totalActivos).toBeNull();
  expect(consultarMontoCuenta(datos, '2024', 'bs.trade_receivables')).toEqual({ valor: null, motivo: 'unrecognized_imported_account' });
});

it('la sugerencia no confirmada usa ambiguous_account_match y no cero por ausencia', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,2024\nEfetivo,activos,30');
  expect(consultarMontoCuenta(datos, '2024', 'bs.cash_and_equivalents')).toEqual({ valor: null, motivo: 'ambiguous_account_match' });
  expect(datos.accountIdentities.activos.Efetivo.idCuenta).toBeNull();
  const confirmado = registrarCuenta(datos, { nombre: 'Efetivo', grupo: 'activos', periodo: '2024', importe: 30,
    id: 'bs.cash_and_equivalents', confirmado: true, reemplazar: true });
  expect(montoCuenta(confirmado, '2024', 'bs.cash_and_equivalents')).toBe(30);
  expect(confirmado.accountIdentities.activos.Efetivo.metodo).toBe('confirmacion_manual');
});

it('una clasificación contradictoria queda sugerida y conserva el importe', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,Clasificacion,2024\nEfectivo,activos,activosFijos,50');
  expect(datos.accountTypes.activos.Efectivo).toBe('activosFijos');
  expect(datos.accountIdentities.activos.Efectivo.estado).toBe('sugerida');
  expect(computeFinancialTotals(datos, '2024').efectivo).toBeNull();
});

it('los totales reportados se leen directamente y los subtotales sin detalle quedan N/D', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,id,2024\nCaja,activos,bs.cash_and_equivalents,20\nTotal de activos,activos,bs.total_assets,100');
  expect(montoCuenta(datos, '2024', 'bs.total_assets')).toBe(100);
  expect(datos.balanceGeneral['2024'].activos).toEqual({ Caja: 20 });
  expect(datos.reportedTotals['2024']['bs.total_assets'].importe).toBe(100);
  const totales = computeFinancialTotals(datos, '2024');
  expect(totales.totalActivos).toBe(100); // El total reportado manda.
  expect(totales.activosCorrientes).toBe(20);
  expect(totales.activosFijos).toBeNull(); // Sin detalle ni total propio.
  expect(normalizeFinancialData(datos)).toEqual(datos);
});

it('conserva los datos suplementarios requeridos y distingue cero de ausencia', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,id,2024\nVentas a crédito,suplementario,supp.credit_sales,0');
  expect(montoCuenta(datos, '2024', 'supp.credit_sales')).toBe(0);
  expect(montoCuenta(datos, '2024', 'supp.supplier_payments')).toBeNull();
});

it('ingresos por intereses se suman y gastos por intereses se restan con las fórmulas vigentes', () => {
  const datos = tableTextToFinancialData('Cuenta,Estado,2024\nVentas,Resultados,100\nCosto de Ventas,Resultados,0\nIngresos por intereses,Resultados,20\nGastos por intereses,Resultados,5');
  expect(datos.accountTypes.estadoResultados['Ingresos por intereses']).toBe('otrosIngresos');
  // 100 + 20 - 5 = 115; antes el ingreso 20 se restaba y daba 75.
  expect(computeFinancialTotals(datos, '2024')).toMatchObject({ otrosIngresos: 20, intereses: 5, utilidadNeta: 115 });
});

it('los metadatos del respaldo se conservan y los ids falsos se rechazan', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,2024\nEfectivo,activos,20');
  expect(normalizeFinancialData(JSON.parse(JSON.stringify(datos)))).toEqual(datos);
  datos.accountIdentities.activos.Efectivo.idCuenta = 'bs.falso';
  expect(() => normalizeFinancialData(datos)).toThrow(/Identificador/);
});

it.each([false, null, 0, 'intangible'])('no debilita la validación de tipos JSON con %s', tipo => {
  const datos = registrarCuenta(vacio(), { nombre: 'Efectivo', grupo: 'activos', periodo: '2024', importe: 1 });
  datos.accountTypes.activos.Efectivo = tipo;
  expect(() => normalizeFinancialData(datos)).toThrow(/clasificación/);
});

it.each([null, false, { estado: 'reconocida', idCuenta: 'bs.cash_and_equivalents', metodo: 'similitud', candidatos: [], origen: 'importacion' }])('rechaza metadatos inválidos o reconocimiento difuso automático: %j', identidad => {
  const datos = registrarCuenta(vacio(), { nombre: 'Efectivo', grupo: 'activos', periodo: '2024', importe: 1 });
  datos.accountIdentities.activos.Efectivo = identidad;
  expect(() => normalizeFinancialData(datos)).toThrow();
});

it('otros ingresos y gastos genéricos requieren confirmación aun con su tipo transitorio', () => {
  const datos = tableTextToFinancialData('Cuenta,Estado,Clasificacion,2024\nOtros Ingresos,Resultados,otrosIngresos,20\nOtros Gastos,Resultados,otrosGastos,5');
  expect(resumenIdentificacion(datos)).toMatchObject({ sugerida: 2 });
  expect(computeFinancialTotals(datos, '2024').utilidadNeta).toBeNull();
});

it('un total reportado y sus detalles no se suman: manda el total y se avisa el descuadre', () => {
  const datos = tableTextToFinancialData('Cuenta,Grupo,2024\nInventario,activos,100\nInventario de mercaderías,activos,60');
  expect(montoCuenta(datos, '2024', 'bs.inventory_total')).toBe(100);
  const totales = computeFinancialTotals(datos, '2024');
  expect(totales.inventario).toBe(100);
  expect(totales.notAvailableReasons).toContainEqual(expect.objectContaining({
    motivo: 'reported_subtotal_mismatch', diferencia: 40
  }));
});

it('rechaza claves peligrosas, duplicados, grupos y periodos malformados sin perder el borrador original', () => {
  const datos = vacio();
  expect(() => registrarCuenta(datos, { nombre: '__proto__', grupo: 'activos', periodo: '2024', importe: 1 })).toThrow(/Nombre/);
  expect(datos).toEqual(vacio());
  expect(() => tableTextToFinancialData('Cuenta,Grupo,2024\nEfectivo,activos,1\nEfectivo,activos,2')).toThrow(/duplicada/);
  expect(() => tableTextToFinancialData('Cuenta,Grupo,2024\nEfectivo,inventado,1')).toThrow(/grupo inválido/);
  expect(() => tableTextToFinancialData('Cuenta,__proto__\nEfectivo,1')).toThrow(/periodo/);
});

it('conserva las cifras exigidas de la demostración actual, sin confirmar dividendos', async () => {
  vi.stubGlobal('document', { getElementById: () => null });
  const { DEMO_MUNOMODA } = await import('../../js/modules/estados/index.js');
  const datos = normalizeFinancialData(DEMO_MUNOMODA);
  const antes = JSON.stringify(DEMO_MUNOMODA);
  expect(computeFinancialTotals(datos, '2023')).toMatchObject({ activosCorrientes: 370000, activosFijos: 431475,
    totalActivos: 801475, totalPasivos: 283860, totalPatrimonio: 517615, utilidadNeta: 89180 });
  expect(computeFinancialTotals(datos, '2024')).toMatchObject({ activosCorrientes: 412000, activosFijos: 413525,
    totalActivos: 825525, totalPasivos: 243085, totalPatrimonio: 582440, utilidadNeta: 104825 });
  expect(JSON.stringify(DEMO_MUNOMODA)).toBe(antes);
  expect(datos).not.toHaveProperty('dividendos');
});
