// Diagnóstico local reproducible: nunca escribe en el store ni en los ejercicios.
import { writeFileSync } from 'node:fs';
import { DEMO_MUNOMODA } from '../../../js/modules/estados/index.js';
import { normalizeFinancialData } from '../../../js/modules/estados/estados-normalize.js';
import { registrarCuenta } from '../../../js/modules/estados/cuentas-registro.js';
import { listarCuentas } from '../../../js/modules/estados/cuentas-identificador.js';
import { computarRazonesDesdeDatos, MAPA_RAZONES_APP } from '../../../js/modules/razones/razones-app-adapter.js';
import { estadosResueltos } from '../../../js/modules/estados/estados-presentacion-calculations.js';
import { detalleDuPont, analisisVerticalCompleto } from '../../../js/modules/analisis/analisis-calculations.js';
import { construirEFE } from '../../../js/modules/analisis/efe-calculations.js';
import { construirEOAF } from '../../../js/modules/analisis/eoaf-calculations.js';
import { calcularRazonesMercado } from '../../../js/modules/analisis/mercado-calculations.js';
import { computeFinancialTotals } from '../../../js/modules/estados/estados-calculations.js';

const campos = [...Object.keys(MAPA_RAZONES_APP), 'pruebaDefensiva', 'rotacionCapitalTrabajo', 'apalancamiento', 'solvencia'];
// Conserva el caso histórico sin las declaraciones incorporadas por D-099.
const anterior = structuredClone(DEMO_MUNOMODA);
delete anterior.coberturaEstados; delete anterior.composicionIngresos;
const demo = normalizeFinancialData(anterior);
const escenarios = { demo_normalizada: demo, solo_composicion_declarada: structuredClone(demo) };
escenarios.solo_composicion_declarada.composicionIngresos = Object.fromEntries(demo.periods.map(p => [p, 'excluye_intereses']));
// Contrafactuales sintéticos para aislar bloqueos; NO corrigen el ejemplo.
// Solo se completan los ids realmente bloqueantes, sin añadir componentes
// ficticios debajo de totales reportados de ventas, inventario o costo.
const catalogo = new Map(listarCuentas().map(c => [c.id, c]));
function completarBloqueantes(datos, grupos) {
  const ids = new Set(datos.periods.flatMap(p => computarRazonesDesdeDatos(datos, p).notAvailableReasons
    .filter(m => m.motivo === 'missing_required_account_data').flatMap(m => m.operandos)));
  return registrarCuenta(datos, datos.periods.flatMap(periodo => [...ids]
    .filter(id => grupos.includes(catalogo.get(id)?.grupo) && catalogo.get(id).rol !== 'reported_total')
    .map(id => ({ id, nombre: `CERO SINTÉTICO ${id}`, periodo, importe: 0, confirmado: true }))));
}
escenarios.composicion_y_cuatro_ceros_ER_sinteticos = completarBloqueantes(escenarios.solo_composicion_declarada, ['estadoResultados']);
const completada = completarBloqueantes(escenarios.composicion_y_cuatro_ceros_ER_sinteticos, ['activos', 'pasivos', 'patrimonio']);
escenarios.ceros_bloqueantes_sinteticos_solo_diagnostico = completada;
function agruparMotivos(motivos) {
  const grupos = new Map();
  for (const { campo, ...motivo } of motivos) {
    const clave = JSON.stringify(motivo);
    if (!grupos.has(clave)) grupos.set(clave, { ...motivo, campos: [] });
    grupos.get(clave).campos.push(campo);
  }
  return [...grupos.values()];
}
const efe = construirEFE(demo, '2023', '2024'), eoaf = construirEOAF(demo, '2023', '2024');
const evidencia = { base: '8197215', advertencia: 'Los contrafactuales no son datos docentes ni se aplican al usuario.',
  otrasSeccionesDemo: { efe: { estado: efe.estado, utilidadNeta: efe.utilidadNeta, operacion: efe.operacion.total,
    inversion: efe.inversion.total, financiamiento: efe.financiamiento.total, totalFlujos: efe.totalFlujos,
    advertencias: efe.advertencias }, eoaf: eoaf.resumen, mercado: calcularRazonesMercado(demo, null),
  totalizadorLegado: Object.fromEntries(demo.periods.map(p => {
    const t = computeFinancialTotals(demo, p);
    return [p, { activosCorrientes: t.activosCorrientes, pasivosCorrientes: t.pasivosCorrientes,
      totalActivos: t.totalActivos, totalPasivos: t.totalPasivos, totalPatrimonio: t.totalPatrimonio, utilidadNeta: t.utilidadNeta }];
  })) }, escenarios: {} };
for (const [nombre, datos] of Object.entries(escenarios)) {
  evidencia.escenarios[nombre] = Object.fromEntries(datos.periods.map(periodo => {
    const r = computarRazonesDesdeDatos(datos, periodo), av = analisisVerticalCompleto(datos, periodo);
    const directo = computarRazonesDesdeDatos(datos, periodo, { mostrar_calculo_directo_primer_periodo: true });
    const dp = detalleDuPont(datos, periodo);
    return [periodo, { disponibles: campos.filter(c => r[c] !== null).length, total: campos.length,
      valores: Object.fromEntries(campos.map(c => [c, r[c]])), motivos: agruparMotivos(r.notAvailableReasons),
      er: estadosResueltos(datos, periodo).estadoResultados.filter(f => f.subtotal)
        .map(({ concepto, valor, motivos }) => ({ concepto, valor, motivos })),
      av: { baseBG: av.balanceGeneral.baseValor, baseER: av.estadoResultados.baseValor },
      dupont: Object.fromEntries(['PM', 'AT', 'EM', 'ROA', 'ROE', 'utilidadNeta', 'ventas', 'activoProm', 'patrimonioProm'].map(c => [c, dp[c]])),
      controlDirectoSoloDiagnostico: Object.fromEntries(campos.map(c => [c, directo[c]])) }];
  }));
}
writeFileSync(new URL('evidencias.json', import.meta.url), JSON.stringify(evidencia, null, 2) + '\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(evidencia.escenarios).map(([n, ps]) => [n,
  Object.fromEntries(Object.entries(ps).map(([p, r]) => [p, { disponibles: r.disponibles, total: r.total,
    motivos: [...new Set(r.motivos.map(m => m.motivo))], bloqueantes: [...new Set(r.motivos.flatMap(m => m.operandos))] }]))])), null, 2));
