// Verificación actualizada después de D-099; el JSON "antes" conserva el fallo.
// Todos los casos controlados son sintéticos; no se atribuyen al profesor.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { registrarCuenta } from '../../../js/modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../../../js/modules/estados/estados-normalize.js';
import { DEMO_MUNOMODA } from '../../../js/modules/estados/index.js';
import { computarRazonesDesdeDatos } from '../../../js/modules/razones/razones-app-adapter.js';
import { computeFinancialTotals } from '../../../js/modules/estados/estados-calculations.js';

const periodo = '2024';
const vacio = () => ({ name: 'Diagnóstico sintético por totales', periods: [periodo],
  balanceGeneral: { [periodo]: { activos: {}, pasivos: {}, patrimonio: {} } }, estadoResultados: { [periodo]: {} } });
const registrar = (datos, entradas) => registrarCuenta(datos, entradas.map(([id, importe]) =>
  ({ id, nombre: `Rubro acreditado ${id}`, importe, periodo, confirmado: true })));
const consultar = datos => {
  const r = computarRazonesDesdeDatos(datos, periodo);
  return { RC: r.RC, MN: r.MN, motivos: r.notAvailableReasons.filter(m => ['RC', 'MN'].includes(m.campo)) };
};
const casos = {};
const totales = registrar(vacio(), [['bs.current_assets_total', 1000], ['bs.current_liabilities_total', 400]]);
casos.solo_totales = consultar(totales);
assert.equal(casos.solo_totales.RC, 2.5);

const parciales = registrar(totales, [['bs.cash_and_equivalents', 200], ['bs.trade_payables', 100]]);
casos.totales_con_detalle_parcial = consultar(parciales);
assert.equal(casos.totales_con_detalle_parcial.RC, 2.5);

casos.sin_total_PC_ni_detalle_suficiente = consultar(registrar(vacio(), [['bs.current_assets_total', 1000]]));
assert.equal(casos.sin_total_PC_ni_detalle_suficiente.RC, null);
assert.ok(casos.sin_total_PC_ni_detalle_suficiente.motivos.some(m => m.campo === 'RC' && m.motivo === 'missing_required_account_data'));

casos.PC_cero = consultar(registrar(vacio(), [['bs.current_assets_total', 1000], ['bs.current_liabilities_total', 0]]));
assert.equal(casos.PC_cero.RC, null);
assert.ok(casos.PC_cero.motivos.some(m => m.campo === 'RC' && m.motivo === 'zero_denominator'));
casos.AC_cero = consultar(registrar(vacio(), [['bs.current_assets_total', 0], ['bs.current_liabilities_total', 400]]));
assert.equal(casos.AC_cero.RC, 0);

const utilidades = registrar(totales, [['is.net_sales_reported', 1000], ['is.net_income_reported', 100]]);
casos.utilidad_y_ventas_netas_reportadas = consultar(utilidades);
assert.equal(casos.utilidad_y_ventas_netas_reportadas.MN, 0.1);
const ingresoSinComposicion = registrar(utilidades, [['is.nonoperating_income', 20]]);
casos.UN_reportada_con_ingreso_sin_composicion = consultar(ingresoSinComposicion);
assert.equal(casos.UN_reportada_con_ingreso_sin_composicion.MN, 0.1);
assert.ok(casos.UN_reportada_con_ingreso_sin_composicion.motivos.some(m => m.campo === 'MN' && m.motivo === 'reported_subtotal_unverifiable'));
// Al declarar la composición se recupera el mismo margen sin cambiar UN/VN.
ingresoSinComposicion.composicionIngresos = { [periodo]: 'excluye_intereses' };
casos.mismos_totales_con_composicion_declarada = consultar(ingresoSinComposicion);
assert.equal(casos.mismos_totales_con_composicion_declarada.MN, 0.1);

const demo = normalizeFinancialData(DEMO_MUNOMODA);
const origen = structuredClone(demo);
const comparacionDemo = Object.fromEntries(demo.periods.map(p => {
  const t = computeFinancialTotals(demo, p), r = computarRazonesDesdeDatos(demo, p);
  assert.equal(r.RC, t.activosCorrientes / t.pasivosCorrientes);
  return [p, { AC_visible_calculado: t.activosCorrientes, PC_visible_calculado: t.pasivosCorrientes,
    AC_reportado: demo.reportedTotals?.[p]?.['bs.current_assets_total'] ?? null,
    PC_reportado: demo.reportedTotals?.[p]?.['bs.current_liabilities_total'] ?? null,
    RC_motor: r.RC, cociente_si_se_acreditan_ambos_totales: t.activosCorrientes / t.pasivosCorrientes,
    motivos: r.notAvailableReasons.filter(m => m.campo === 'RC') }];
}));
assert.deepEqual(demo, origen);
assert.deepEqual(DEMO_MUNOMODA.balanceGeneral['2024'].activos, origen.balanceGeneral['2024'].activos);
const evidencia = { alcance: 'Solo diagnóstico: no cambia app, motor, JSON, demo ni datos guardados.',
  advertencia: 'Los totales de la demo calculados por otro lector no se convierten automáticamente en reportados.',
  casos, comparacionDemo, casosVerificados: 8 };
writeFileSync(new URL('evidencia-totales.json', import.meta.url), JSON.stringify(evidencia, null, 2) + '\n');
console.log(JSON.stringify({ casos: Object.fromEntries(Object.entries(casos).map(([nombre, r]) => [nombre, { RC: r.RC, MN: r.MN }])),
  comparacionDemo: Object.fromEntries(Object.entries(comparacionDemo).map(([p, r]) => [p, {
    AC: r.AC_visible_calculado, PC: r.PC_visible_calculado, RC_motor: r.RC_motor,
    cociente_condicionado: r.cociente_si_se_acreditan_ambos_totales }])) }, null, 2));
