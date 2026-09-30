// Proforma y reporte integrado: estado de resultados proforma frente al último periodo real,
// efectivo proyectado, indicadores de todos los módulos y alertas que apoyan decisiones.
// Lógica pura: recibe los resultados ya calculados por cada módulo (index.js los reúne).
import { ahPctDelta, margenBruto, margenNeto, margenOperativo } from '../../utils/calculate.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const num = valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2);
const NIVELES = { alta: 0, media: 1, baja: 2 };

// Razón de Análisis con N/D cuando su denominador es 0 (las funciones legado devuelven 0).
// Exportada para el panorama de Inicio.
export function razon(razones, clave, denominador = clave) {
  if (!razones || !esNumero(razones[clave])) return null;
  return razones.denominadores?.[denominador] === 0 ? null : razones[clave];
}

function margenes(ventas, utilidadBruta, gastosAdmin, gastosVentas, utilidadNeta) {
  return {
    margenBruto: esNumero(utilidadBruta) ? margenBruto(utilidadBruta, ventas) : null,
    margenOperativo: esNumero(utilidadBruta) ? margenOperativo(utilidadBruta, gastosAdmin, gastosVentas, ventas) : null,
    margenNeto: ventas && esNumero(utilidadNeta) ? margenNeto(utilidadNeta, ventas) : null
  };
}

// Estado de resultados del último periodo real, con los mismos conceptos que la proforma.
export function resultadosReales(estados) {
  const periodo = estados?.periods?.[estados.periods.length - 1];
  if (!periodo) return null;
  let t;
  try {
    t = computeFinancialTotals(estados, periodo);
  } catch {
    return null;
  }
  const gastosOperacion = t.gastosAdmin + t.gastosVentas;
  return {
    periodo, ventas: t.ventas, cbv: t.costoVentas, utilidadBruta: t.utilidadBruta, gastosOperacion,
    uaii: esNumero(t.utilidadBruta) ? t.utilidadBruta - gastosOperacion : null,
    otrosNeto: t.otrosIngresos - t.otrosGastos, intereses: t.intereses, ir: t.impuestos, utilidadNeta: t.utilidadNeta,
    ...margenes(t.ventas, t.utilidadBruta, t.gastosAdmin, t.gastosVentas, t.utilidadNeta)
  };
}

// Estado de resultados proforma: el total del horizonte del presupuesto maestro.
export function resultadosProforma(presupuesto) {
  if (!presupuesto) return null;
  const t = presupuesto.totales;
  const s = presupuesto.supuestos;
  return {
    horizonte: `${s.periodos} ${s.tipoPeriodo.toLowerCase()}${s.periodos === 1 ? '' : (s.tipoPeriodo === 'Mes' ? 'es' : 's')}`,
    // Un año: 12 meses o 4 trimestres. Solo así se compara sin ajustar con un periodo anual.
    anual: (s.tipoPeriodo === 'Mes' && s.periodos === 12) || (s.tipoPeriodo === 'Trimestre' && s.periodos === 4),
    ventas: t.ventas, cbv: t.cbv, utilidadBruta: t.utilidadBruta, gastosOperacion: t.gastosOperacion,
    uaii: t.uaii, otrosNeto: null, intereses: t.intereses, ir: t.ir, utilidadNeta: t.utilidadNeta,
    ...margenes(t.ventas, t.utilidadBruta, t.gastosOperacion, 0, t.utilidadNeta)
  };
}

export function compararResultados(real, proforma) {
  const filas = [
    ['Ventas', 'ventas', 'monto'], ['(−) Costo de ventas', 'cbv', 'monto'], ['(=) Utilidad bruta', 'utilidadBruta', 'monto'],
    ['(−) Gastos de operación', 'gastosOperacion', 'monto'], ['(=) UAII', 'uaii', 'monto'],
    ['(+) Otros ingresos − otros gastos', 'otrosNeto', 'monto'], ['(−) Intereses', 'intereses', 'monto'],
    ['(−) Impuesto sobre la renta', 'ir', 'monto'], ['(=) Utilidad neta', 'utilidadNeta', 'monto'],
    ['Margen bruto', 'margenBruto', 'pct'], ['Margen operativo', 'margenOperativo', 'pct'], ['Margen neto', 'margenNeto', 'pct']
  ];
  return filas.map(([concepto, clave, formato]) => {
    const r = real ? real[clave] : null;
    const p = proforma ? proforma[clave] : null;
    // Variación relativa solo para montos; los márgenes se comparan en puntos.
    const variacion = formato === 'monto' && esNumero(r) && esNumero(p) ? ahPctDelta(p, r) : null;
    const puntos = formato === 'pct' && esNumero(r) && esNumero(p) ? p - r : null;
    return { concepto, clave, formato, real: r, proforma: p, variacion, puntos };
  });
}

function indicador(grupo, nombre, valor, formato, fuente, ruta, lectura = '', estado = 'info') {
  return { grupo, nombre, valor, formato, fuente, ruta, lectura, estado };
}

// Indicadores de todos los módulos en una sola tabla.
export function indicadoresIntegrados({ razones, dupont, mercado, apalancamiento, presupuesto, equilibrio, flujo, inventario, umbrales = {} }, periodoReal) {
  const lista = [];
  if (razones) {
    const grupo = `Análisis financiero (${periodoReal})`;
    const rc = razon(razones, 'RC');
    const rr = razon(razones, 'RR');
    const end = razon(razones, 'endeudamiento', 'End');
    const estado = (valor, ok) => (esNumero(valor) ? (ok ? 'ok' : 'alerta') : 'info');
    lista.push(indicador(grupo, 'Liquidez corriente', rc, 'veces', 'Análisis', '#/analisis',
      esNumero(rc) ? `C$ ${formatNumberND(rc)} de activo corriente por cada C$ 1 de pasivo corriente.` : '',
      estado(rc, rc >= (umbrales.ratioCorrienteMin ?? 1))));
    lista.push(indicador(grupo, 'Prueba ácida', rr, 'veces', 'Análisis', '#/analisis',
      'Liquidez sin contar el inventario.', estado(rr, rr >= (umbrales.ratioRapidoMin ?? 0.5))));
    lista.push(indicador(grupo, 'Endeudamiento', end, 'pct', 'Análisis', '#/analisis',
      esNumero(end) ? `${pct(end)} de los activos se financia con deuda.` : '', estado(end, end <= (umbrales.endeudamientoMax ?? 0.6))));
    lista.push(indicador(grupo, 'Margen neto', razon(razones, 'MN'), 'pct', 'Análisis', '#/analisis', 'Utilidad neta por cada córdoba vendido.'));
    lista.push(indicador(grupo, 'ROA', razon(razones, 'ROA'), 'pct', 'Análisis', '#/analisis', 'Utilidad neta sobre el activo promedio.'));
  }
  if (dupont && esNumero(dupont.ROE)) {
    lista.push(indicador(`Análisis financiero (${periodoReal})`, 'ROE (DuPont)', dupont.ROE, 'pct', 'Análisis', '#/analisis',
      `Margen ${pct(dupont.PM)} × rotación ${formatNumberND(dupont.AT)} × multiplicador ${formatNumberND(dupont.EM)}.`,
      dupont.ROE >= (umbrales.roeMin ?? 0.1) ? 'ok' : 'alerta'));
  }
  if (mercado && [mercado.upa, mercado.pu, mercado.pvl].some(esNumero)) {
    const grupo = `Razones de mercado (${mercado.periodo})`;
    lista.push(indicador(grupo, 'Utilidad por acción (UPA)', mercado.upa, 'monto', 'Análisis', '#/analisis', '(UN − DAP) / acciones comunes.'));
    lista.push(indicador(grupo, 'Precio / utilidad (P/U)', mercado.pu, 'veces', 'Análisis', '#/analisis', 'Veces que el mercado paga la utilidad por acción.'));
    lista.push(indicador(grupo, 'Precio / valor en libros (P/VL)', mercado.pvl, 'veces', 'Análisis', '#/analisis',
      esNumero(mercado.vlpa) ? `Valor en libros de ${monto(mercado.vlpa)} por acción.` : ''));
    if (esNumero(mercado.pago)) {
      lista.push(indicador(grupo, 'Pago de dividendos', mercado.pago, 'pct', 'Análisis', '#/analisis', `DPA de ${monto(mercado.dpa)}.`));
    }
  }
  const ultimoApal = apalancamiento?.periodos?.[apalancamiento.periodos.length - 1];
  if (ultimoApal) {
    const { gao, gaf, gat } = ultimoApal.grados;
    const grupo = `Apalancamiento (${ultimoApal.periodo})`;
    lista.push(indicador(grupo, 'GAO', gao, 'veces', 'Apalancamiento', '#/apalancamiento',
      esNumero(gao) && gao > 0 ? `1 % más de ventas sube la UAII ${formatNumberND(gao)} %.` : 'N/D si faltan clasificar costos fijos y variables.'));
    lista.push(indicador(grupo, 'GAF', gaf, 'veces', 'Apalancamiento', '#/apalancamiento',
      esNumero(gaf) && gaf > 0 ? `1 % más de UAII sube la utilidad para accionistas ${formatNumberND(gaf)} %.` : ''));
    lista.push(indicador(grupo, 'GAT', gat, 'veces', 'Apalancamiento', '#/apalancamiento', 'GAO × GAF: riesgo total de la estructura de costos y deuda.'));
  }
  if (equilibrio) {
    const grupo = 'Punto de equilibrio (C-V-U)';
    lista.push(indicador(grupo, 'Punto de equilibrio', equilibrio.peUnidades, 'unidades', 'Punto de Equilibrio', '#/equilibrio',
      esNumero(equilibrio.peVentas) ? `Equivale a ${monto(equilibrio.peVentas)} de ventas.` : 'Sin margen de contribución positivo.'));
    lista.push(indicador(grupo, 'Margen de seguridad', equilibrio.msPorcentaje, 'pct', 'Punto de Equilibrio', '#/equilibrio',
      esNumero(equilibrio.msPorcentaje) ? `Las ventas pueden caer ${pct(Math.max(0, equilibrio.msPorcentaje))} antes de tener pérdida.` : '',
      esNumero(equilibrio.msPorcentaje) ? (equilibrio.msPorcentaje >= 0.2 ? 'ok' : 'alerta') : 'info'));
  }
  if (flujo) {
    const grupo = 'Flujo de efectivo';
    lista.push(indicador(grupo, 'Flujo de operación', flujo.neto.operacion, 'monto', 'Flujo de Efectivo', '#/flujo',
      flujo.neto.operacion >= 0 ? 'La operación genera efectivo.' : 'La operación consume efectivo.', flujo.neto.operacion >= 0 ? 'ok' : 'alerta'));
    lista.push(indicador(grupo, 'Variación neta del efectivo', flujo.variacionNeta, 'monto', 'Flujo de Efectivo', '#/flujo', 'Operación + inversión + financiamiento.'));
    lista.push(indicador(grupo, 'Saldo final de efectivo', flujo.saldoFinal, 'monto', 'Flujo de Efectivo', '#/flujo', 'Saldo inicial + variación neta.'));
  }
  if (presupuesto) {
    const grupo = 'Presupuesto maestro';
    const t = presupuesto.totales;
    lista.push(indicador(grupo, 'Ventas presupuestadas', t.ventas, 'monto', 'Presupuesto Maestro', '#/planeacion', `${num(t.unidades)} unidades.`));
    lista.push(indicador(grupo, 'Utilidad neta presupuestada', t.utilidadNeta, 'monto', 'Presupuesto Maestro', '#/planeacion', '', t.utilidadNeta >= 0 ? 'ok' : 'alerta'));
    lista.push(indicador(grupo, 'Saldo de caja proyectado', presupuesto.cierre.efectivo, 'monto', 'Presupuesto Maestro', '#/planeacion', 'Saldo final del último periodo.'));
    lista.push(indicador(grupo, 'Financiamiento máximo requerido', presupuesto.financiamientoMaximo, 'monto', 'Presupuesto Maestro', '#/planeacion',
      presupuesto.periodoFinanciamiento ? `En ${presupuesto.periodoFinanciamiento}.` : 'La caja no baja del mínimo.', presupuesto.financiamientoMaximo > 0 ? 'alerta' : 'ok'));
  }
  if (inventario) {
    const grupo = 'Inventario';
    lista.push(indicador(grupo, 'Valor del inventario', inventario.valorTotal, 'monto', 'Inventario', '#/inventario', `${inventario.productos.length} productos.`));
    lista.push(indicador(grupo, 'Productos por reponer', inventario.porReponer.length, 'unidades', 'Inventario', '#/inventario',
      inventario.porReponer.length ? `Compra mínima estimada: ${monto(inventario.costoReposicionTotal)}.` : 'Todos sobre el stock mínimo.',
      inventario.porReponer.length ? 'alerta' : 'ok'));
  }
  return lista;
}

// Alertas con una acción sugerida, de mayor a menor urgencia. Texto plano: la pantalla lo escapa.
export function alertasIntegradas({ razones, presupuesto, equilibrio, flujo, inventario, umbrales = {} }) {
  const alertas = [];
  const agregar = (nivel, texto, ruta) => alertas.push({ nivel, texto, ruta });
  if (presupuesto?.financiamientoMaximo > 0) {
    agregar('alta', `El presupuesto de caja requiere hasta ${monto(presupuesto.financiamientoMaximo)} de financiamiento en ${presupuesto.periodoFinanciamiento}. Gestione una línea de crédito antes de ese periodo o aplace desembolsos.`, '#/planeacion');
  }
  if (presupuesto && presupuesto.totales.utilidadNeta < 0) {
    agregar('alta', `El presupuesto proyecta una pérdida neta de ${monto(-presupuesto.totales.utilidadNeta)}. Revise precios, volumen o gastos.`, '#/planeacion');
  }
  if (flujo && flujo.neto.operacion < 0) {
    agregar('alta', `La operación consume ${monto(-flujo.neto.operacion)} de efectivo: revise cobros, precios y gastos antes de invertir o repartir dividendos.`, '#/flujo');
  }
  if (flujo && esNumero(flujo.saldoFinal) && flujo.saldoFinal < 0) {
    agregar('alta', `El flujo de efectivo termina con saldo negativo (${monto(flujo.saldoFinal)}).`, '#/flujo');
  }
  const rc = razon(razones, 'RC');
  if (esNumero(rc) && rc < (umbrales.ratioCorrienteMin ?? 1)) {
    agregar('alta', `Liquidez corriente de ${formatNumberND(rc)}, bajo el umbral de ${umbrales.ratioCorrienteMin ?? 1}: podría haber dificultad para pagar las deudas de corto plazo.`, '#/analisis');
  }
  const end = razon(razones, 'endeudamiento', 'End');
  if (esNumero(end) && end > (umbrales.endeudamientoMax ?? 0.6)) {
    agregar('media', `Endeudamiento de ${pct(end)}, sobre el umbral de ${pct(umbrales.endeudamientoMax ?? 0.6)}: antes de pedir más deuda, evalúe aportes de capital.`, '#/analisis');
  }
  if (equilibrio && esNumero(equilibrio.msPorcentaje)) {
    if (equilibrio.msPorcentaje < 0) {
      agregar('alta', `Las ventas (${num(equilibrio.q)} u) están bajo el punto de equilibrio (${num(equilibrio.peUnidades)} u): la operación pierde dinero.`, '#/equilibrio');
    } else if (equilibrio.msPorcentaje < 0.2) {
      agregar('media', `Margen de seguridad de ${pct(equilibrio.msPorcentaje)}: una caída pequeña de las ventas elimina la utilidad operativa.`, '#/equilibrio');
    }
  }
  if (inventario?.porReponer?.length) {
    agregar('media', `${inventario.porReponer.length} producto(s) por reponer: ${inventario.porReponer.map(p => p.nombre).join(', ')}. Compra mínima estimada de ${monto(inventario.costoReposicionTotal)}; inclúyala en el presupuesto de compras.`, '#/inventario');
  }
  for (const aviso of presupuesto?.avisos || []) {
    if (aviso.codigo === 'bajo-stock-minimo') {
      agregar('media', `${aviso.periodo}: el inventario presupuestado (${num(aviso.inventario)} u) queda bajo el stock mínimo (${num(aviso.stockMinimo)} u). Aumente el inventario final deseado.`, '#/planeacion');
    }
  }
  return alertas.sort((a, b) => NIVELES[a.nivel] - NIVELES[b.nivel]);
}

// Reporte completo. Cada entrada puede ser null si el módulo no tiene datos.
export function construirReporte(entradas) {
  const { estados = null, apalancamiento = null, presupuesto = null, equilibrio = null, flujo = null, inventario = null } = entradas;
  const real = resultadosReales(estados);
  const proforma = resultadosProforma(presupuesto);
  const faltantes = [];
  if (!estados) faltantes.push({ modulo: 'Estados financieros', ruta: '#/estados', texto: 'Cargue la demo o importe estados para comparar con datos reales.' });
  const ultimoApal = apalancamiento?.periodos?.[apalancamiento.periodos.length - 1];
  if (estados && ultimoApal && ultimoApal.grados.gao === null) {
    faltantes.push({ modulo: 'Apalancamiento', ruta: '#/apalancamiento', texto: 'Clasifique los costos como fijos o variables para obtener el GAO y el GAT.' });
  }
  if (!presupuesto) faltantes.push({ modulo: 'Presupuesto maestro', ruta: '#/planeacion', texto: 'Configure los supuestos para obtener la proforma y la caja proyectada.' });
  if (!equilibrio) faltantes.push({ modulo: 'Punto de equilibrio', ruta: '#/equilibrio', texto: 'Ingrese precio, costos y unidades.' });
  if (!flujo) faltantes.push({ modulo: 'Flujo de efectivo', ruta: '#/flujo', texto: 'Registre las entradas y salidas de efectivo.' });
  if (!inventario) faltantes.push({ modulo: 'Inventario', ruta: '#/inventario', texto: 'Registre productos y movimientos.' });
  return {
    real, proforma,
    comparacion: real || proforma ? compararResultados(real, proforma) : [],
    efectivo: presupuesto ? {
      saldoInicial: presupuesto.caja.saldoInicial[0], flujoNeto: presupuesto.totales.flujoNeto,
      saldoFinal: presupuesto.cierre.efectivo, saldoMinimo: presupuesto.caja.saldoMinimo,
      financiamientoMaximo: presupuesto.financiamientoMaximo, periodoFinanciamiento: presupuesto.periodoFinanciamiento,
      cierre: presupuesto.cierre
    } : null,
    indicadores: indicadoresIntegrados(entradas, real?.periodo ?? '—'),
    alertas: alertasIntegradas(entradas),
    faltantes
  };
}
