// Panorama general de Inicio: KPIs, salud general, puntos clave por área e interpretaciones.
// Lógica pura: recibe las entradas de proforma/index.js (reunirEntradas) y el reporte integrado
// ya construido; no recalcula fórmulas, solo las lee y las explica. Texto plano: la UI lo escapa.
import { ahPctDelta, ahorroMensual, capacidadAhorro, depAcumulada, depAnualLineaRecta, tasaAhorro, valorEnLibros } from '../../utils/calculate.js';
import { totalesPeriodo } from '../../utils/estados-guardados.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { razon } from '../proforma/proforma-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const veces = valor => formatNumberND(valor);
// Mismo umbral que usa la proforma para el margen de seguridad (alertasIntegradas).
const MARGEN_SEGURIDAD_MIN = 0.2;
// Estados de Activos (calcularEstado) que piden reparar o reponer el activo.
const ESTADOS_ATENCION = new Set(['Deteriorado', 'Deficiente', 'Obsoleto', 'Para Reparar']);

function punto(etiqueta, valor, formato) {
  return { etiqueta, valor, formato };
}

function area(id, titulo, ruta, estado, puntos, interpretacion) {
  return { id, titulo, ruta, estado, puntos, interpretacion };
}

// Ventas, utilidad neta y activos de cada periodo guardado, en orden cronológico.
export function tendenciaEstados(estados) {
  if (!estados?.periods?.length) return null;
  const filas = estados.periods.map(p => totalesPeriodo(estados, p)).filter(Boolean);
  if (!filas.length) return null;
  return {
    periodos: filas.map(t => t.periodo),
    ventas: filas.map(t => t.ventas),
    utilidadNeta: filas.map(t => t.utilidadNeta),
    totalActivos: filas.map(t => t.totalActivos)
  };
}

// Variación relativa entre el último periodo y el anterior (null si no hay dos periodos).
function cambio(serie) {
  if (!serie || serie.length < 2) return null;
  const [anterior, actual] = serie.slice(-2);
  return esNumero(anterior) && esNumero(actual) ? ahPctDelta(actual, anterior) : null;
}

// Tarjetas superiores. tono: 'positivo' | 'negativo' | 'neutro' para colorear el valor.
export function kpisPrincipales({ estados, razones, dupont, flujo, presupuesto }) {
  const tendencia = tendenciaEstados(estados);
  const ultimo = tendencia ? totalesPeriodo(estados) : null;
  const kpis = [];
  if (ultimo) {
    kpis.push({ clave: 'ventas', etiqueta: 'Ventas', valor: ultimo.ventas, formato: 'monto', cambio: cambio(tendencia.ventas), tono: 'neutro' });
    kpis.push({
      clave: 'utilidadNeta', etiqueta: 'Utilidad neta', valor: ultimo.utilidadNeta, formato: 'monto', cambio: cambio(tendencia.utilidadNeta),
      tono: esNumero(ultimo.utilidadNeta) ? (ultimo.utilidadNeta >= 0 ? 'positivo' : 'negativo') : 'neutro'
    });
    kpis.push({ clave: 'totalActivos', etiqueta: 'Activos totales', valor: ultimo.totalActivos, formato: 'monto', cambio: cambio(tendencia.totalActivos), tono: 'neutro' });
    kpis.push({ clave: 'patrimonio', etiqueta: 'Patrimonio', valor: ultimo.totalPatrimonio, formato: 'monto', cambio: null, tono: 'neutro' });
  }
  if (razones) {
    kpis.push({ clave: 'liquidez', etiqueta: 'Liquidez corriente', valor: razon(razones, 'RC'), formato: 'veces', cambio: null, tono: 'neutro' });
    kpis.push({ clave: 'endeudamiento', etiqueta: 'Endeudamiento', valor: razon(razones, 'endeudamiento', 'End'), formato: 'pct', cambio: null, tono: 'neutro' });
  }
  if (dupont && esNumero(dupont.ROE)) {
    kpis.push({ clave: 'roe', etiqueta: 'ROE', valor: dupont.ROE, formato: 'pct', cambio: null, tono: dupont.ROE >= 0 ? 'positivo' : 'negativo' });
  }
  // Efectivo: el flujo registrado manda; si no hay, la caja proyectada del presupuesto maestro.
  if (flujo && esNumero(flujo.saldoFinal)) {
    kpis.push({ clave: 'efectivo', etiqueta: 'Saldo de efectivo', valor: flujo.saldoFinal, formato: 'monto', cambio: null, tono: flujo.saldoFinal >= 0 ? 'positivo' : 'negativo' });
  } else if (presupuesto && esNumero(presupuesto.cierre?.efectivo)) {
    kpis.push({ clave: 'efectivo', etiqueta: 'Caja proyectada', valor: presupuesto.cierre.efectivo, formato: 'monto', cambio: null, tono: 'neutro' });
  }
  return kpis;
}

function areaLiquidez(razones, u) {
  const rc = razon(razones, 'RC');
  const rr = razon(razones, 'RR');
  const puntos = [punto('Liquidez corriente', rc, 'veces'), punto('Prueba ácida', rr, 'veces')];
  const rcMin = u.ratioCorrienteMin ?? 1;
  const rrMin = u.ratioRapidoMin ?? 0.5;
  if (!esNumero(rc)) return area('liquidez', 'Liquidez', '#/analisis', 'info', puntos, 'No hay pasivo corriente o faltan cuentas para medir la liquidez.');
  if (rc < rcMin) {
    return area('liquidez', 'Liquidez', '#/analisis', 'alerta', puntos,
      `Por cada C$ 1 de deuda de corto plazo hay C$ ${veces(rc)} de activo corriente: no alcanza. Priorice cobrar cartera y evite nueva deuda de corto plazo.`);
  }
  if (esNumero(rr) && rr < rrMin) {
    return area('liquidez', 'Liquidez', '#/analisis', 'alerta', puntos,
      `La liquidez corriente (${veces(rc)}) depende del inventario: sin él quedan C$ ${veces(rr)} por cada C$ 1 de deuda de corto plazo.`);
  }
  const holgada = rc >= 2 * rcMin;
  return area('liquidez', 'Liquidez', '#/analisis', 'ok', puntos,
    `${holgada ? 'Liquidez holgada' : 'Liquidez suficiente'}: C$ ${veces(rc)} de activo corriente por cada C$ 1 de deuda de corto plazo${holgada ? '. Vigile que no haya efectivo ocioso.' : '.'}`);
}

function areaRentabilidad(razones, dupont, u) {
  const mn = razon(razones, 'MN');
  const roa = razon(razones, 'ROA');
  const roe = dupont && esNumero(dupont.ROE) ? dupont.ROE : null;
  const puntos = [punto('Margen neto', mn, 'pct'), punto('ROA', roa, 'pct'), punto('ROE', roe, 'pct')];
  if (!esNumero(mn)) return area('rentabilidad', 'Rentabilidad', '#/analisis', 'info', puntos, 'Faltan ventas o una utilidad neta determinable para medir la rentabilidad.');
  if (mn < 0) {
    return area('rentabilidad', 'Rentabilidad', '#/analisis', 'alerta', puntos,
      `La empresa pierde ${pct(-mn)} de cada córdoba vendido. Revise precios, costo de ventas y gastos de operación.`);
  }
  const mnMin = u.margenNetoMin ?? 0.05;
  const roeMin = u.roeMin ?? 0.1;
  const partes = [`Gana C$ ${formatNumberND(mn * 100)} por cada C$ 100 vendidos`];
  if (esNumero(roe)) partes.push(`y rinde ${pct(roe)} sobre el patrimonio`);
  const bueno = mn >= mnMin && (!esNumero(roe) || roe >= roeMin);
  const cierre = bueno ? 'La rentabilidad supera los umbrales educativos.' : 'Está bajo los umbrales educativos: busque mejorar margen o rotación de activos.';
  return area('rentabilidad', 'Rentabilidad', '#/analisis', bueno ? 'ok' : 'alerta', puntos, `${partes.join(' ')}. ${cierre}`);
}

function areaEndeudamiento(razones, u) {
  const end = razon(razones, 'endeudamiento', 'End');
  const dp = razon(razones, 'deudaPatrimonio');
  const cob = razon(razones, 'coberturaIntereses');
  const puntos = [punto('Endeudamiento', end, 'pct'), punto('Deuda / patrimonio', dp, 'veces'), punto('Cobertura de intereses', cob, 'veces')];
  if (!esNumero(end)) return area('endeudamiento', 'Endeudamiento', '#/analisis', 'info', puntos, 'Faltan activos o pasivos para medir el endeudamiento.');
  const endMax = u.endeudamientoMax ?? 0.6;
  const cobMin = u.coberturaInteresesMin ?? 2;
  if (end > endMax) {
    return area('endeudamiento', 'Endeudamiento', '#/analisis', 'alerta', puntos,
      `Los acreedores financian ${pct(end)} de los activos, sobre el umbral de ${pct(endMax)}. Antes de pedir más deuda, evalúe aportes de capital.`);
  }
  if (esNumero(cob) && cob < cobMin) {
    return area('endeudamiento', 'Endeudamiento', '#/analisis', 'alerta', puntos,
      `La utilidad operativa cubre los intereses solo ${veces(cob)} veces: poco margen si bajan las ventas.`);
  }
  return area('endeudamiento', 'Endeudamiento', '#/analisis', 'ok', puntos,
    `Los acreedores financian ${pct(end)} de los activos y los dueños el resto: estructura de deuda moderada.`);
}

function areaApalancamiento(apalancamiento) {
  const ultimo = apalancamiento?.periodos?.at(-1);
  const { gao = null, gaf = null, gat = null } = ultimo?.grados || {};
  const puntos = [punto('GAO', gao, 'veces'), punto('GAF', gaf, 'veces'), punto('GAT', gat, 'veces')];
  if (!esNumero(gat)) {
    return area('apalancamiento', 'Apalancamiento', '#/apalancamiento', 'info', puntos,
      'Clasifique los costos como fijos o variables para medir el riesgo operativo y total.');
  }
  if (gat < 0) {
    return area('apalancamiento', 'Apalancamiento', '#/apalancamiento', 'alerta', puntos,
      'Grado negativo: la empresa está bajo su punto de equilibrio y cada venta adicional reduce la pérdida.');
  }
  return area('apalancamiento', 'Apalancamiento', '#/apalancamiento', 'info', puntos,
    `Si las ventas suben o bajan 10 %, la utilidad por acción se mueve cerca de ${formatNumberND(gat * 10)} %.`);
}

function areaEquilibrio(equilibrio) {
  const puntos = [punto('Punto de equilibrio', equilibrio.peUnidades, 'unidades'), punto('Ventas de equilibrio', equilibrio.peVentas, 'monto'),
    punto('Margen de seguridad', equilibrio.msPorcentaje, 'pct')];
  const ms = equilibrio.msPorcentaje;
  if (!esNumero(ms)) return area('equilibrio', 'Punto de equilibrio', '#/equilibrio', 'info', puntos, 'Sin margen de contribución positivo no hay punto de equilibrio.');
  if (ms < 0) return area('equilibrio', 'Punto de equilibrio', '#/equilibrio', 'alerta', puntos, 'Las ventas están bajo el punto de equilibrio: la operación pierde dinero.');
  return area('equilibrio', 'Punto de equilibrio', '#/equilibrio', ms >= MARGEN_SEGURIDAD_MIN ? 'ok' : 'alerta', puntos,
    `Las ventas pueden caer ${pct(ms)} antes de tener pérdida${ms >= MARGEN_SEGURIDAD_MIN ? '.' : ': colchón estrecho.'}`);
}

function areaFlujo(flujo) {
  const op = flujo.neto.operacion;
  const puntos = [punto('Flujo de operación', op, 'monto'), punto('Variación neta', flujo.variacionNeta, 'monto'), punto('Saldo final', flujo.saldoFinal, 'monto')];
  if (esNumero(flujo.saldoFinal) && flujo.saldoFinal < 0) {
    return area('flujo', 'Flujo de efectivo', '#/flujo', 'alerta', puntos, 'El efectivo termina en negativo: se necesita financiamiento o recortar salidas.');
  }
  if (op < 0) {
    return area('flujo', 'Flujo de efectivo', '#/flujo', 'alerta', puntos, 'La operación consume efectivo: el negocio se sostiene con inversión o financiamiento.');
  }
  return area('flujo', 'Flujo de efectivo', '#/flujo', 'ok', puntos,
    `La operación genera ${monto(op)} de efectivo${flujo.variacionNeta < 0 ? ', aunque inversiones o pagos de deuda reducen el saldo.' : '.'}`);
}

function areaPresupuesto(presupuesto) {
  const t = presupuesto.totales;
  const puntos = [punto('Ventas presupuestadas', t.ventas, 'monto'), punto('Utilidad neta presupuestada', t.utilidadNeta, 'monto'),
    punto('Financiamiento máximo', presupuesto.financiamientoMaximo, 'monto')];
  if (t.utilidadNeta < 0) return area('presupuesto', 'Presupuesto maestro', '#/planeacion', 'alerta', puntos, 'El presupuesto proyecta pérdida: revise precios, volumen o gastos.');
  if (presupuesto.financiamientoMaximo > 0) {
    return area('presupuesto', 'Presupuesto maestro', '#/planeacion', 'alerta', puntos,
      `Proyecta utilidad, pero la caja necesita hasta ${monto(presupuesto.financiamientoMaximo)} en ${presupuesto.periodoFinanciamiento}. Gestione crédito antes de ese periodo.`);
  }
  return area('presupuesto', 'Presupuesto maestro', '#/planeacion', 'ok', puntos, 'Proyecta utilidad y la caja no baja del saldo mínimo.');
}

function areaInventario(inventario) {
  const n = inventario.porReponer.length;
  const puntos = [punto('Valor del inventario', inventario.valorTotal, 'monto'), punto('Productos', inventario.productos.length, 'unidades'),
    punto('Por reponer', n, 'unidades')];
  if (n) {
    return area('inventario', 'Inventario', '#/inventario', 'alerta', puntos,
      `${n} producto(s) bajo el stock mínimo. Compra mínima estimada: ${monto(inventario.costoReposicionTotal)}.`);
  }
  return area('inventario', 'Inventario', '#/inventario', 'ok', puntos, 'Todos los productos están sobre el stock mínimo.');
}

// Resumen de la pestaña Activos: mismas fórmulas de depreciación en línea recta.
// Cada activo trae su `estado` de calcularEstado (activos/index.js), asignado por inicio/index.js.
export function resumenActivos(lista) {
  if (!Array.isArray(lista) || !lista.length) return null;
  let costoTotal = 0;
  let valorLibros = 0;
  let requierenAtencion = 0;
  for (const a of lista) {
    const depAc = depAcumulada(depAnualLineaRecta(a.costoOriginal || 0, a.valorResidual || 0, a.vidaUtil || 0), a.aniosConsumidos || 0, a.vidaUtil || 0);
    costoTotal += a.costoOriginal || 0;
    valorLibros += valorEnLibros(a.costoOriginal || 0, depAc);
    if (ESTADOS_ATENCION.has(a.estado)) requierenAtencion += 1;
  }
  return {
    cantidad: lista.length, costoTotal, valorLibros, requierenAtencion,
    pctDepreciado: costoTotal > 0 ? (costoTotal - valorLibros) / costoTotal : null
  };
}

// Puntos clave de la empresa, solo de los módulos con datos. Presupuesto personal y Activos
// del hogar van aparte (finanzasPersonales): no cuentan para la salud de la empresa (D-018).
export function areasClave(entradas) {
  const { razones = null, dupont = null, apalancamiento = null, presupuesto = null, equilibrio = null, flujo = null, inventario = null, umbrales = {} } = entradas;
  const lista = [];
  if (razones) {
    lista.push(areaLiquidez(razones, umbrales), areaRentabilidad(razones, dupont, umbrales), areaEndeudamiento(razones, umbrales));
  }
  if (apalancamiento?.periodos?.length) lista.push(areaApalancamiento(apalancamiento));
  if (equilibrio) lista.push(areaEquilibrio(equilibrio));
  if (flujo) lista.push(areaFlujo(flujo));
  if (presupuesto) lista.push(areaPresupuesto(presupuesto));
  if (inventario) lista.push(areaInventario(inventario));
  return lista;
}

// Presupuesto personal. Recibe los totales ya sumados por presupuestoCalculations
// (inicio/index.js); aquí solo se aplican capacidadAhorro, tasaAhorro y ahorroMensual.
function areaPresupuestoPersonal({ ingresos, gastos, metaAhorro = 0, mesesDisponibles = 12 }) {
  const capacidad = capacidadAhorro(ingresos, gastos);
  const tasa = tasaAhorro(capacidad, ingresos);
  const necesario = metaAhorro > 0 ? ahorroMensual(metaAhorro, mesesDisponibles) : null;
  const puntos = [punto('Ingresos del mes', ingresos, 'monto'), punto('Gastos del mes', gastos, 'monto'),
    punto('Capacidad de ahorro', capacidad, 'monto'), punto('Tasa de ahorro', tasa, 'pct')];
  if (necesario !== null) puntos.push(punto('Ahorro necesario para la meta', necesario, 'monto'));
  const titulo = 'Presupuesto personal';
  if (!esNumero(capacidad)) return area('presupuestoPersonal', titulo, '#/presupuesto', 'info', puntos, 'Registre ingresos y gastos para medir la capacidad de ahorro.');
  if (capacidad < 0) {
    return area('presupuestoPersonal', titulo, '#/presupuesto', 'alerta', puntos,
      `Los gastos superan los ingresos en ${monto(-capacidad)} al mes. Recorte primero los gastos de deseo antes de endeudarse.`);
  }
  if (necesario !== null && capacidad < necesario) {
    return area('presupuestoPersonal', titulo, '#/presupuesto', 'alerta', puntos,
      `Para juntar ${monto(metaAhorro)} en ${mesesDisponibles} meses hay que ahorrar ${monto(necesario)} al mes, pero solo quedan ${monto(capacidad)}. Faltan ${monto(necesario - capacidad)} al mes.`);
  }
  const meta = necesario !== null ? ` Alcanza para la meta de ${monto(metaAhorro)} en ${mesesDisponibles} meses.` : '';
  return area('presupuestoPersonal', titulo, '#/presupuesto', 'ok', puntos,
    `Después de los gastos quedan ${monto(capacidad)} al mes${esNumero(tasa) ? ` (${pct(tasa)} de los ingresos)` : ''}.${meta}`);
}

function areaActivosHogar(r) {
  const puntos = [punto('Bienes registrados', r.cantidad, 'unidades'), punto('Valor en libros', r.valorLibros, 'monto'),
    punto('Depreciado', r.pctDepreciado, 'pct')];
  if (r.requierenAtencion) {
    return area('activos', 'Activos del hogar', '#/activos', 'alerta', puntos,
      `${r.requierenAtencion} bien(es) en estado deteriorado o peor: planifique su reparación o reposición en el presupuesto personal.`);
  }
  return area('activos', 'Activos del hogar', '#/activos', 'ok', puntos,
    esNumero(r.pctDepreciado) ? `Se ha consumido ${pct(r.pctDepreciado)} del costo de los bienes; ninguno está deteriorado.` : 'Ningún bien está deteriorado.');
}

// Bloque "Mis finanzas personales" de Inicio, separado del panorama de la empresa.
// presupuesto: { ingresos, gastos, metaAhorro, mesesDisponibles } o null; activos: lista con `estado`.
export function finanzasPersonales(presupuesto = null, activos = null) {
  const lista = [];
  if (presupuesto && (presupuesto.ingresos > 0 || presupuesto.gastos > 0)) lista.push(areaPresupuestoPersonal(presupuesto));
  const resumen = resumenActivos(activos);
  if (resumen) lista.push(areaActivosHogar(resumen));
  return lista;
}

// Salud general: proporción de áreas evaluadas en buen estado, castigada por alertas altas.
// Heurística educativa (docs/decisiones.md), no una calificación crediticia.
export function saludGeneral(areas, alertas = []) {
  const evaluadas = areas.filter(a => a.estado === 'ok' || a.estado === 'alerta');
  if (!evaluadas.length) return { nivel: 'sin-datos', puntaje: null, ok: 0, alerta: 0, texto: 'Cargue datos en los módulos para ver cómo está la empresa.' };
  const ok = evaluadas.filter(a => a.estado === 'ok').length;
  const puntaje = ok / evaluadas.length;
  const altas = alertas.filter(a => a.nivel === 'alta').length;
  let nivel = 'solida';
  if (puntaje < 0.5 || altas >= 2) nivel = 'atencion';
  else if (puntaje < 0.8 || altas === 1) nivel = 'estable';
  const texto = {
    solida: 'La empresa luce sólida: la mayoría de las áreas están dentro de los umbrales.',
    estable: 'La empresa está estable, con algunos puntos que conviene vigilar.',
    atencion: 'La empresa requiere atención: varias áreas están fuera de los umbrales.'
  }[nivel];
  return { nivel, puntaje, ok, alerta: evaluadas.length - ok, texto };
}

// Todo lo que muestra Inicio. reporte = construirReporte(entradas);
// personal = { presupuesto, activos } para el bloque de finanzas personales.
export function panoramaGeneral(entradas, reporte, personal = {}) {
  const areas = areasClave(entradas);
  const alertas = reporte?.alertas || [];
  return {
    empresa: entradas.estados?.name || null,
    periodo: entradas.estados?.periods?.at(-1) ?? null,
    kpis: kpisPrincipales(entradas),
    tendencia: tendenciaEstados(entradas.estados),
    areas,
    salud: saludGeneral(areas, alertas),
    alertas: alertas.slice(0, 5),
    totalAlertas: alertas.length,
    faltantes: reporte?.faltantes || [],
    personal: finanzasPersonales(personal.presupuesto ?? null, personal.activos ?? null)
  };
}
