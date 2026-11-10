import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND } from '../../utils/format.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { obtenerUtilidadNetaMotor } from '../razones/razones-app-adapter.js';
import { monedaDe } from '../../utils/moneda.js';

// Cuerpo HTML del reporte de Reportes e Integración. Es puro: recibe los KPIs y los estados
// ya normalizados y devuelve texto con todo lo que viene del usuario o de un archivo
// (nombres de cuenta, periodos, empresa) escapado. Lo usan la vista previa y la descarga.

const GRUPOS_BALANCE = [['activos', 'Activos'], ['pasivos', 'Pasivos'], ['patrimonio', 'Patrimonio']];
const ALINEADO_DERECHA = ' style="text-align:right"';

const monto = (valor, moneda) => esc(formatCurrencyND(valor, moneda));
const celdaMonto = (valor, moneda) => `<td${ALINEADO_DERECHA}>${monto(valor, moneda)}</td>`;

function nombresDeCuentas(periodos, leer) {
  const nombres = new Set();
  for (const periodo of periodos) Object.keys(leer(periodo) || {}).forEach(nombre => nombres.add(nombre));
  return [...nombres];
}

// Una columna por periodo; una cuenta sin dato en un periodo se muestra "—", no 0.
function filaCuenta(nombre, periodos, leer, moneda) {
  const celdas = periodos.map(periodo => {
    const valor = leer(periodo)?.[nombre];
    return valor === undefined ? `<td${ALINEADO_DERECHA}>—</td>` : celdaMonto(valor, moneda);
  });
  return `<tr><td>${esc(nombre)}</td>${celdas.join('')}</tr>`;
}

function tabla(titulo, periodos, cuerpo) {
  const cabecera = periodos.map(periodo => `<th${ALINEADO_DERECHA}>${esc(periodo)}</th>`).join('');
  return `<h2>${esc(titulo)}</h2><table><thead><tr><th>Cuenta</th>${cabecera}</tr></thead><tbody>${cuerpo}</tbody></table>`;
}

function seccionGrupo(etiqueta, periodos, nombres, leer, moneda) {
  if (nombres.length === 0) return '';
  const encabezado = `<tr><th scope="rowgroup" colspan="${periodos.length + 1}">${esc(etiqueta)}</th></tr>`;
  return encabezado + nombres.map(nombre => filaCuenta(nombre, periodos, leer, moneda)).join('');
}

function tablaBalance(estados) {
  const { periods } = estados;
  const cuerpo = GRUPOS_BALANCE.map(([grupo, etiqueta]) => {
    const leer = periodo => estados.balanceGeneral[periodo]?.[grupo];
    return seccionGrupo(etiqueta, periods, nombresDeCuentas(periods, leer), leer, monedaDe(estados));
  }).join('');
  return tabla('Balance General', periods, cuerpo);
}

function tablaResultados(estados) {
  const { periods } = estados;
  const leer = periodo => estados.estadoResultados[periodo];
  return tabla('Estado de Resultados', periods,
    nombresDeCuentas(periods, leer).map(nombre => filaCuenta(nombre, periods, leer, monedaDe(estados))).join(''));
}

// Totales que comparten todos los módulos. Si hay cuentas de resultados sin clasificar, la
// utilidad es N/D y se dice por qué.
function tablaTotales(estados) {
  const { periods } = estados;
  const totales = periods.map(periodo => ({
    ...computeFinancialTotals(estados, periodo),
    utilidadNeta: obtenerUtilidadNetaMotor(estados, periodo).valor
  }));
  const filas = [
    ['Total activos', 'totalActivos'], ['Total pasivos', 'totalPasivos'],
    ['Total patrimonio', 'totalPatrimonio'], ['Utilidad bruta', 'utilidadBruta'], ['Utilidad neta', 'utilidadNeta']
  ].map(([etiqueta, clave]) =>
    `<tr><td>${esc(etiqueta)}</td>${totales.map(total => celdaMonto(total[clave], monedaDe(estados))).join('')}</tr>`).join('');
  const sinClasificar = [...new Set(totales.flatMap(total => total.unclassified.map(cuenta => cuenta.name)))];
  const nota = sinClasificar.length
    ? `<p>Cuentas sin clasificar (los totales que dependen de ellas aparecen como N/D): ${sinClasificar.map(esc).join(', ')}.</p>` : '';
  return tabla('Totales por periodo', periods, filas) + nota;
}

// El presupuesto personal también se puede consultar sin estados empresariales.
export function resumenPresupuestoEstudiantil(p) {
  if (!p) return '';
  if (p.error) return `<h2>Presupuesto estudiantil</h2><p>No se pudo leer: ${esc(p.error)}</p>`;
  return `<h2>Presupuesto estudiantil: movimientos realizados</h2><p>Seguimiento de ${esc(p.semanas)} semanas: ${esc(p.desde ?? 'Sin fecha')} a ${esc(p.hasta ?? 'Sin fecha')}.</p>
    <div class="table-wrapper"><table><tbody>${[['Ingresos registrados',p.ingresos], ['Gastos realizados',p.gastos], ['Ahorro para la meta',p.ahorro], ['Reserva acumulada',p.reserva], ['Saldo disponible',p.saldo], ['Costo de la meta',p.metaAhorro]].map(([t,v]) => `<tr><th>${t}</th>${celdaMonto(v, 'C$')}</tr>`).join('')}</tbody></table></div><p>Las asignaciones proyectadas no cuentan como movimientos realizados.</p>`;
}

function resumen(kpis, moneda) {
  if (!kpis) return '';
  const personal = resumenPresupuestoEstudiantil(kpis.presupuestoEstudiantil);
  if (!Object.hasOwn(kpis, 'totalActivos')) return personal;
  return `<h2>Resumen</h2>
<p>Total Activos: ${monto(kpis.totalActivos, moneda)} | Total Pasivos: ${monto(kpis.totalPasivos, moneda)} | Patrimonio: ${monto(kpis.totalPatrimonio, moneda)}</p>
<p>Ventas: ${monto(kpis.ventas, moneda)} | Utilidad Neta: ${monto(kpis.utilidadNeta, moneda)}</p>${personal}`;
}

function proyeccion(reporte) {
  if (!reporte) return '';
  const { proforma, efectivo, motivoPresupuesto, motivoComparacion } = reporte;
  const titulo = '<h2>Proyección del presupuesto guardado</h2>';
  if (!proforma) return `${titulo}<p>${esc(motivoPresupuesto || 'Configure los supuestos en Planeación para obtener la proforma.')}</p>`;
  const { moneda } = proforma;
  return `${titulo}<p>Planeación · ${esc(proforma.horizonte)} · ${esc(moneda)}</p>
    <p>Ventas ${monto(proforma.ventas, moneda)} · UAI ${monto(proforma.uai, moneda)} · Utilidad neta ${monto(proforma.utilidadNeta, moneda)}
    · Efectivo final ${monto(efectivo?.saldoFinal, moneda)}</p>
    ${motivoComparacion ? `<p>${esc(motivoComparacion)}</p>` : ''}`;
}

function flujoSuministrado(flujo) {
  if (!flujo) return '';
  const filas = [['Operación', flujo.neto.operacion], ['Inversión', flujo.neto.inversion],
    ['Financiamiento', flujo.neto.financiamiento], ['Variación neta', flujo.variacionNeta], ['Efectivo final', flujo.saldoFinal]];
  return `<h2>Flujo de efectivo · ${esc(flujo.naturaleza === 'flujo_reportado' ? 'reportado' : flujo.naturaleza === 'flujo_simulado_documentado' ? 'simulado' : 'estimado')}</h2>
    <p>${esc(flujo.periodos.inicial)} → ${esc(flujo.periodos.final)} · ${esc(flujo.fuente ?? 'Estimación desde balances; los movimientos requieren confirmación.')}</p>
    <table><tbody>${filas.map(([titulo, valor]) => `<tr><th>${titulo}</th>${celdaMonto(valor, monedaDe(flujo))}</tr>`).join('')}</tbody></table>`;
}

// kpis: resultado de computeDashboardKPIs (o null). estados: datos normalizados (o null).
// errorEstados: mensaje de D-077 cuando los estados guardados existen pero no se leen.
export function construirReporteHTML({ kpis = null, estados = null, errorEstados = null, reporte = null } = {}) {
  const portada = resumen(kpis, monedaDe(estados));
  const proyectado = flujoSuministrado(reporte?.flujo) + proyeccion(reporte);
  if (errorEstados) {
    return `${portada}<p>No se pudieron leer los estados financieros guardados: ${esc(errorEstados)}. Revise los datos en Estados Financieros.</p>${proyectado}`;
  }
  if (!estados || !estados.periods?.length) {
    return `${portada}<p>No hay estados financieros guardados.${kpis?.presupuestoEstudiantil || reporte?.proforma ? '' : ' Cárguelos en Estados Financieros para generar el reporte.'}</p>${proyectado}`;
  }
  return `<p>Empresa: <strong>${esc(estados.name)}</strong> · ${esc(monedaDe(estados))}</p>${portada}${tablaBalance(estados)}${tablaResultados(estados)}${tablaTotales(estados)}${proyectado}`;
}
