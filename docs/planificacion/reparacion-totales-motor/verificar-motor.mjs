import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { DEMO_MUNOMODA } from '../../../js/modules/estados/index.js';
import { normalizeFinancialData } from '../../../js/modules/estados/estados-normalize.js';
import { computarRazonesDesdeDatos, MAPA_RAZONES_APP } from '../../../js/modules/razones/razones-app-adapter.js';
import { estadosResueltos } from '../../../js/modules/estados/estados-presentacion-calculations.js';
import { detalleDuPont } from '../../../js/modules/analisis/analisis-calculations.js';
import { resultadosReales } from '../../../js/modules/proforma/proforma-calculations.js';
import { registrarCuenta } from '../../../js/modules/estados/cuentas-registro.js';

const original = structuredClone(DEMO_MUNOMODA);
const historico = structuredClone(DEMO_MUNOMODA);
delete historico.coberturaEstados; delete historico.composicionIngresos;
const campos = [...Object.keys(MAPA_RAZONES_APP), 'pruebaDefensiva', 'rotacionCapitalTrabajo', 'apalancamiento', 'solvencia'];
const casos = {};
for (const [nombre, doc] of [['archivo_anterior_sin_cobertura', historico], ['demo_con_cobertura_declarada', DEMO_MUNOMODA]]) {
  const datos = normalizeFinancialData(doc);
  casos[nombre] = Object.fromEntries(datos.periods.map(p => {
    const r = computarRazonesDesdeDatos(datos, p), dp = detalleDuPont(datos, p);
    return [p, { disponibles:campos.filter(c => r[c] !== null).length,
      valores:Object.fromEntries(campos.map(c => [c, r[c]])),
      motivos:r.notAvailableReasons,
      estadoResultados:estadosResueltos(datos, p).estadoResultados.filter(f => f.subtotal)
        .map(({ concepto, valor }) => ({ concepto, valor })),
      dupont:Object.fromEntries(['PM', 'AT', 'EM', 'ROA', 'ROE'].map(k => [k, dp[k]])) }];
  }));
}
assert.equal(casos.archivo_anterior_sin_cobertura['2023'].disponibles, 1);
assert.equal(casos.archivo_anterior_sin_cobertura['2024'].disponibles, 3);
assert.equal(casos.demo_con_cobertura_declarada['2023'].disponibles, 13);
assert.equal(casos.demo_con_cobertura_declarada['2024'].disponibles, 19);
const actuales = casos.demo_con_cobertura_declarada['2024'];
assert.ok(Math.abs(actuales.valores.RC - 412000 / 175000) < 1e-12);
assert.ok(Math.abs(actuales.valores.ROA - 104825 / 813500) < 1e-12);
assert.ok(Math.abs(actuales.valores.roe - 104825 / 550027.5) < 1e-12);
assert.ok(Math.abs(actuales.dupont.ROE - actuales.valores.roe) < 1e-12);
const proforma = resultadosReales(normalizeFinancialData(DEMO_MUNOMODA));
assert.equal(proforma.utilidadNeta, 104825);
assert.equal(proforma.uai, 149750);
assert.equal(proforma.otrosOperativos, 0);
const datos = registrarCuenta({ name:'Totales suficientes', periods:['2024'],
  balanceGeneral:{ '2024':{ activos:{}, pasivos:{}, patrimonio:{} } }, estadoResultados:{ '2024':{} } }, [
  ['bs.current_assets_total', 1000], ['bs.current_liabilities_total', 400],
  ['is.net_sales_reported', 1000], ['is.net_income_reported', 100], ['is.nonoperating_income', 20]
].map(([id, importe]) => ({ periodo:'2024', id, importe, nombre:`Dato ${id}`, confirmado:true })));
const r = computarRazonesDesdeDatos(datos, '2024');
assert.equal(r.RC, 2.5); assert.equal(r.MN, 0.1);
assert.ok(r.notAvailableReasons.some(m => m.campo === 'MN' && m.motivo === 'reported_subtotal_unverifiable'));
const cambiosProtegidos = execFileSync('git', ['diff', '0b91ac6', '--name-only', '--',
  'docs/razones_financieras/*.json', 'js/modules/razones/especificacion-razones.js',
  'js/modules/estados/cuentas-catalogo.js', 'js/utils/calculate.js'], { encoding:'utf8' }).trim();
assert.equal(cambiosProtegidos, '');
assert.deepEqual(DEMO_MUNOMODA, original);
const evidencia = { base:'0b91ac6', alcance:'Comparación de datos sin cobertura frente a la demo declarada; cifras originales sin cambios.',
  formulas_y_catalogo_sin_cambios:true, casos, proforma,
  totales_sin_desglose:{ RC:r.RC, MN:r.MN, advertencias:r.notAvailableReasons.filter(m => m.campo === 'MN') } };
writeFileSync(new URL('verificacion-calculos.json', import.meta.url), JSON.stringify(evidencia, null, 2) + '\n');
console.log(JSON.stringify({ disponibles:{ anterior:[1,3], reparada:[13,19] }, RC:actuales.valores.RC,
  ROA:actuales.valores.ROA, ROE:actuales.valores.roe, utilidadNeta:proforma.utilidadNeta,
  totalesSinDesglose:evidencia.totales_sin_desglose, formulas_y_catalogo_sin_cambios:true }, null, 2));
