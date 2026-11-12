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

const esNumero = v => typeof v === 'number' && Number.isFinite(v);
const porcentaje = v => (esNumero(v) ? `${(v * 100).toFixed(2)} %` : 'N/D');
const veces = v => (esNumero(v) ? `${v.toFixed(2)} veces` : 'N/D');

// D-113: estado de cada módulo de empresa para el dashboard y el reporte. Puro: recibe las
// entradas de Proforma (reunirEntradas) y el reporte ya construido.
export function resumenModulosEmpresa(entradas, reporte) {
  if (!entradas?.estados) return [];
  const moneda = monedaDe(entradas.estados);
  const fila = (modulo, listo, detalle) => ({ modulo, estado: listo ? 'ok' : 'pendiente', detalle });
  const apal = entradas.apalancamiento?.periodos?.at(-1);
  const m = entradas.mercado, e = entradas.equilibrio, p = entradas.presupuesto, inv = entradas.inventario;
  const b = reporte?.balance;
  return [
    fila('Apalancamiento', esNumero(apal?.grados?.gao),
      apal ? `${apal.periodo}: GAO ${veces(apal.grados.gao)}, GAF ${veces(apal.grados.gaf)}` : 'Sin estados para calcular.'),
    fila('Razones de mercado', esNumero(m?.upa),
      m ? `${m.periodo}: UPA ${monto(m.upa, moneda)}${m.nota ? ' (precio ilustrativo: SUPUESTO)' : ''}` : 'Sin acciones registradas.'),
    fila('Punto de equilibrio', Boolean(e),
      e ? `Ventas de equilibrio ${monto(e.peVentas, monedaDe(e))} · margen de seguridad ${porcentaje(e.msPorcentaje)}` : 'Sin datos de C-V-U.'),
    fila('Flujo de efectivo', Boolean(reporte?.flujo),
      reporte?.flujo ? `${reporte.flujo.periodos.inicial} → ${reporte.flujo.periodos.final}: operación ${monto(reporte.flujo.neto.operacion, monedaDe(reporte.flujo))}`
        : (entradas.flujo?.motivo || 'Sin un EFE utilizable.')),
    fila('Presupuesto maestro', Boolean(p),
      p ? `Utilidad neta ${monto(p.totales.utilidadNeta, moneda)} · caja final ${monto(p.cierre.efectivo, moneda)}` : (entradas.motivoPresupuesto || 'Sin supuestos.')),
    fila('Inventario', Boolean(inv),
      inv ? `${inv.productos.length} producto(s) · valor ${monto(inv.valorTotal, moneda)} · ${inv.porReponer.length} por reponer` : 'Sin productos.'),
    fila('Balance proforma', Boolean(b?.disponible),
      b?.disponible ? `${b.base} → proforma${b.contraste ? ` (contraste ${b.contraste})` : ''}: ${b.cuadra ? 'cuadra' : `financiamiento requerido ${monto(b.financiamientoRequerido, moneda)}`}`
        : (b?.motivo || 'Requiere el presupuesto maestro.'))
  ];
}

function tablaModulos(filas) {
  if (!filas.length) return '';
  return `<h2>Estado de los módulos de empresa</h2><table><thead><tr><th>Módulo</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>${filas
    .map(f => `<tr><td>${esc(f.modulo)}</td><td>${f.estado === 'ok' ? 'Con datos' : 'Pendiente'}</td><td>${esc(f.detalle)}</td></tr>`).join('')}</tbody></table>`;
}

// Estado de resultados: base, proforma y, si existe, el real que la proforma proyecta.
function resultadosProforma(reporte) {
  if (!reporte?.proforma || !reporte.real) return '';
  const { real, proforma, contraste } = reporte;
  const valor = (f, v, moneda) => (f.formato === 'monto' ? monto(v, moneda) : porcentaje(v));
  const cambio = (f, relativo, puntos) => (f.formato === 'monto' ? porcentaje(relativo) : esNumero(puntos) ? `${(puntos * 100).toFixed(2)} pts` : 'N/D');
  const filas = reporte.comparacion.map(f => `<tr><td>${esc(f.concepto)}</td><td${ALINEADO_DERECHA}>${valor(f, f.real, real.moneda)}</td>
    <td${ALINEADO_DERECHA}>${valor(f, f.proforma, proforma.moneda)}</td><td${ALINEADO_DERECHA}>${cambio(f, f.variacion, f.puntos)}</td>${contraste
    ? `<td${ALINEADO_DERECHA}>${valor(f, f.contraste, contraste.moneda)}</td><td${ALINEADO_DERECHA}>${cambio(f, f.desvio, f.desvioPuntos)}</td>` : ''}</tr>`).join('');
  return `<h2>Estado de resultados proforma</h2><table><thead><tr><th>Concepto</th><th>Real ${esc(real.periodo)}${contraste ? ' (base)' : ''}</th>
    <th>Proforma (${esc(proforma.horizonte)})</th><th>Proforma vs base</th>${contraste ? `<th>Real ${esc(contraste.periodo)} (contraste)</th><th>Real vs proforma</th>` : ''}</tr></thead><tbody>${filas}</tbody></table>`;
}

function balanceProformaHTML(reporte) {
  const b = reporte?.balance;
  if (!b) return '';
  if (!b.disponible) return `<h2>Balance general proforma</h2><p>${esc(b.motivo)}</p>`;
  const moneda = reporte.proforma?.moneda;
  const celdas = (...valores) => valores.filter((_, k) => k < 2 || b.contraste).map(v => celdaMonto(v, moneda)).join('');
  const grupo = (clave, titulo) => `<tr><th colspan="${b.contraste ? 4 : 3}">${titulo}</th></tr>${b.filas.filter(f => f.grupo === clave)
    .map(f => `<tr><td>${esc(f.concepto)} <small>(${esc(f.regla)})</small></td>${celdas(f.apertura, f.proforma, f.real)}</tr>`).join('')}
    <tr><th>Total ${titulo.toLowerCase()}</th>${celdas(b.totales.apertura[clave], b.totales.proforma[clave], b.totales.real?.[clave])}</tr>`;
  return `<h2>Balance general proforma</h2><table><thead><tr><th>Concepto (regla)</th><th>Real ${esc(b.base)} (apertura)</th><th>Proforma</th>${b.contraste ? `<th>Real ${esc(b.contraste)} (contraste)</th>` : ''}</tr></thead>
    <tbody>${grupo('activos', 'Activos')}${grupo('pasivos', 'Pasivos')}${grupo('patrimonio', 'Patrimonio')}</tbody></table>
    <p>${b.cuadra ? 'Cuadra: activos = pasivos + patrimonio, sin financiamiento externo.' : `${b.financiamientoRequerido > 0 ? 'Financiamiento externo requerido' : 'Excedente de fondos'}: ${monto(Math.abs(b.financiamientoRequerido), moneda)}.`}</p>`;
}

function indicadoresHTML(reporte) {
  const lista = reporte?.indicadores || [];
  if (!lista.length) return '';
  const formato = i => (i.formato === 'monto' ? monto(i.valor, i.moneda) : i.formato === 'pct' ? porcentaje(i.valor)
    : i.formato === 'veces' ? veces(i.valor) : esc(esNumero(i.valor) ? i.valor.toLocaleString('en-US', { maximumFractionDigits: 2 }) : 'N/D'));
  return `<h2>Indicadores integrados</h2><table><thead><tr><th>Grupo</th><th>Indicador</th><th>Valor</th><th>Lectura</th></tr></thead><tbody>${lista
    .map(i => `<tr><td>${esc(i.grupo)}</td><td>${esc(i.nombre)}</td><td${ALINEADO_DERECHA}>${formato(i)}</td><td>${esc(i.lectura)}</td></tr>`).join('')}</tbody></table>`;
}

// kpis: resultado de computeDashboardKPIs (o null). estados: datos normalizados (o null).
// errorEstados: mensaje de D-077 cuando los estados guardados existen pero no se leen.
// entradas (opcional, D-113): las de Proforma, para el estado de los módulos de empresa.
export function construirReporteHTML({ kpis = null, estados = null, errorEstados = null, reporte = null, entradas = null } = {}) {
  const portada = resumen(kpis, monedaDe(estados));
  const proyectado = flujoSuministrado(reporte?.flujo) + proyeccion(reporte) + resultadosProforma(reporte)
    + balanceProformaHTML(reporte) + indicadoresHTML(reporte) + tablaModulos(resumenModulosEmpresa(entradas, reporte));
  if (errorEstados) {
    return `${portada}<p>No se pudieron leer los estados financieros guardados: ${esc(errorEstados)}. Revise los datos en Estados Financieros.</p>${proyectado}`;
  }
  if (!estados || !estados.periods?.length) {
    return `${portada}<p>No hay estados financieros guardados.${kpis?.presupuestoEstudiantil || reporte?.proforma ? '' : ' Cárguelos en Estados Financieros para generar el reporte.'}</p>${proyectado}`;
  }
  return `<p>Empresa: <strong>${esc(estados.name)}</strong> · ${esc(monedaDe(estados))}</p>${portada}${tablaBalance(estados)}${tablaResultados(estados)}${tablaTotales(estados)}${proyectado}`;
}
