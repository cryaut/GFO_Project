import { afterEach, expect, it, vi } from 'vitest';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { obtenerCuenta } from '../../js/modules/estados/cuentas-identificador.js';

afterEach(() => vi.unstubAllGlobals());

function datosBase(dosPeriodos = true) {
  const periods = dosPeriodos ? ['2024', '2025'] : ['2025'];
  return normalizeFinancialData({ name: 'Prueba N/D', periods,
    balanceGeneral: Object.fromEntries(periods.map(p => [p, {
      activos: { Efectivo: 300, 'Cuentas por Cobrar': 100, Inventario: p === '2024' ? 60 : 100, Terrenos: 500 },
      pasivos: { 'Cuentas por Pagar': p === '2024' ? 40 : 50, 'Prestamo Largo Plazo': 150 },
      patrimonio: { 'Capital Social': 800 }
    }])),
    estadoResultados: Object.fromEntries(periods.map(p => [p, {
      Ventas: 1000, 'Costo de Ventas': 400, 'Gastos de Administracion': 200,
      'Gastos de Ventas': 100, 'Gastos por Intereses': 20, 'Impuesto sobre la Renta': 50
    }]))
  });
}

const DEDUCCIONES = ['is.sales_returns', 'is.sales_discounts', 'is.sales_allowances'];
const COMPONENTES_AF_SIN_MOVIMIENTO = ['bs.ppe_buildings', 'bs.ppe_machinery',
  'bs.ppe_vehicles', 'bs.ppe_furniture', 'bs.ppe_other', 'bs.accumulated_depreciation'];
const GASTOS_SIN_MOVIMIENTO = ['is.operating_depreciation', 'is.operating_amortization',
  'is.other_operating_expenses', 'is.other_operating_income',
  'is.nonoperating_income', 'is.noninterest_nonoperating_expenses'];

// D-055/D-060: el fixture declara expresamente los componentes sin movimiento.
function agregarCeros(datos, ids) {
  return registrarCuenta(datos, ids.flatMap(id => datos.periods.map(periodo => ({
    id, nombre: `Componente sin movimiento ${id}`, grupo: obtenerCuenta(id).grupo,
    periodo, importe: 0, confirmado: true
  }))));
}

async function cargar(datos) {
  vi.resetModules();
  vi.stubGlobal('document', { getElementById: () => null });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', datos);
  const analisis = await import('../../js/modules/analisis/index.js');
  analisis.refreshSavedStates();
  return analisis;
}

it('costo N/D conserva N/D antes de restar márgenes, cobertura y compras', async () => {
  const datos = registrarCuenta(datosBase(), { nombre: 'Rubro X', grupo: 'estadoResultados',
    clasificacion: 'costoVentas', periodo: '2025', importe: 10 });
  expect(datos.accountIdentities.estadoResultados['Rubro X'].estado).not.toBe('reconocida');
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  for (const campo of ['margenBruto', 'margenOperativo', 'coberturaIntereses', 'RotInv', 'rotacionCxP', 'plazoPago']) {
    expect(r[campo], campo).toBeNull();
  }
  expect(r.usaComprasReales).toBe(false);
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'rotacionCxP', periodo: '2025',
    motivo: 'missing_required_account_data', operandos: expect.arrayContaining(['supp.supplier_payments']) }));
  expect(r.RC).toBe(10); // 500 de AC / 50 de PC, independientes del costo.
});

it('gasto administrativo N/D no se convierte en utilidad operativa para cobertura', async () => {
  const datos = registrarCuenta(agregarCeros(datosBase(), DEDUCCIONES), { nombre: 'Gastos de Adminstración', grupo: 'estadoResultados',
    periodo: '2025', importe: 20 });
  expect(datos.accountIdentities.estadoResultados['Gastos de Adminstración'].estado).toBe('sugerida');
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  expect(r.coberturaIntereses).toBeNull();
  expect(r.margenOperativo).toBeNull();
  expect(r.margenBruto).toBe(0.6); // (1000 − 400) / 1000.
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'utilidadOperativa',
    operandos: expect.arrayContaining(['gastosAdmin']) }));
});

it('activo corriente pendiente anula RC y la resta del capital de trabajo, sin falsos negativos', async () => {
  const datos = registrarCuenta(agregarCeros(datosBase(), [...DEDUCCIONES, ...COMPONENTES_AF_SIN_MOVIMIENTO]), { nombre: 'Activo corriente extra', grupo: 'activos',
    clasificacion: 'activosCorrientesOtros', periodo: '2025', importe: 5000 });
  expect(datos.accountIdentities.activos['Activo corriente extra'].estado).not.toBe('reconocida');
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  expect(r.RC).toBeNull();
  expect(r.rotacionCapitalTrabajo).toBeNull();
  expect(r.denominadores.rotacionCapitalTrabajo).toBeNull();
  expect(r.rotacionActivosFijos).toBe(2); // 1000 / Terrenos 500.
  expect(r.margenBruto).toBe(0.6);
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'capitalNetoTrabajo',
    operandos: expect.arrayContaining(['activosCorrientes']) }));
});

it('un solo periodo sigue usando saldos finales y CxP requiere pagos declarados (D-059)', async () => {
  const datos = agregarCeros(datosBase(false), [...DEDUCCIONES, ...COMPONENTES_AF_SIN_MOVIMIENTO,
    ...GASTOS_SIN_MOVIMIENTO, 'bs.short_term_investments', 'bs.other_current_receivables',
    'bs.prepaid_expenses', 'bs.other_current_assets', 'bs.intangible_assets',
    'bs.long_term_investments', 'bs.other_noncurrent_assets', 'bs.additional_paid_in_capital',
    'bs.legal_reserve', 'bs.other_reserves', 'bs.retained_earnings',
    'bs.current_year_result_equity', 'bs.other_equity_components']);
  datos.composicionIngresos['2025'] = 'excluye_intereses';
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  expect(r).toMatchObject({ usaPromedios: false, usaComprasReales: false,
    invProm: 100, cxcProm: 100, activoProm: 1000, patrimonioProm: 800, RotInv: 4, rotacionCxP: null });
  expect(r.ROA).toBe(230 / 1000); // UN = 1000−400−200−100−20−50.
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'rotacionCxP',
    motivo: 'missing_required_account_data', operandos: ['supp.supplier_payments'] }));
});

it('dos periodos completos conservan compras e inventario promedio', async () => {
  // D-059/D-060: dato construido para reproducir compras a crédito 440
  // mediante 430 de pagos + (50 final - 40 inicial), sin cambiar el esperado.
  const datos = registrarCuenta(datosBase(), { id: 'supp.supplier_payments',
    nombre: 'Pagos declarados del periodo', grupo: 'suplementario',
    periodo: '2025', importe: 430, confirmado: true });
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  expect(r.invProm).toBe(80); // (60 + 100) / 2.
  expect(r.rotacionCxP).toBeCloseTo((400 + 100 - 60) / ((40 + 50) / 2), 8);
  expect(r.usaComprasReales).toBe(true);
});

it('cero explícito produce margen y cobertura cero, y no N/D', async () => {
  const datos = agregarCeros(datosBase(false), [...DEDUCCIONES, ...GASTOS_SIN_MOVIMIENTO]);
  datos.composicionIngresos['2025'] = 'excluye_intereses';
  Object.assign(datos.estadoResultados['2025'], { 'Costo de Ventas': 1000,
    'Gastos de Administracion': 0, 'Gastos de Ventas': 0 });
  const analisis = await cargar(datos);
  expect(analisis.computeRazones('2025')).toMatchObject({ margenBruto: 0, margenOperativo: 0,
    coberturaIntereses: 0, notAvailableReasons: [] });
});

it('un pendiente cero no cambia las razones ni sus motivos', async () => {
  const base = datosBase();
  const analisisBase = await cargar(base);
  const esperado = analisisBase.computeRazones('2025');
  const datos = registrarCuenta(base, { nombre: 'Activo corriente extra', grupo: 'activos', periodo: '2025', importe: 0 });
  const analisis = await cargar(datos);
  expect(analisis.computeRazones('2025')).toEqual(esperado);
});
