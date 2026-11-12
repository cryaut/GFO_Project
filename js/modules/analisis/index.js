import { monedaDe } from '../../utils/moneda.js';
import { etiquetaFilaEstado, origenFilaEstado, separarCuentasOpcionales, desplegableCuentasOpcionales } from '../estados/estados-presentacion-ui.js';
import { disponibilidadRazones } from './analisis-disponibilidad-ui.js';
import store from '../../store.js';
import { mercadoUI } from './mercado-ui.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { formatCurrencyND as formatearMoneda, formatPercent, formatNumber } from '../../utils/format.js';
import { analisisHorizontalCompleto, analisisVerticalCompleto, detalleDuPont, filasAnalisis } from './analisis-calculations.js';
import { computarRazonesDesdeDatos } from '../razones/razones-app-adapter.js';
import {
  capitalNetoTrabajo, capitalNetoOperativo, DIAS_ANIO
} from '../../utils/calculate.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { sortPeriods } from '../estados/estados-normalize.js';
import { escapeHTML } from '../../utils/html.js';
import { construirEOAF } from './eoaf-calculations.js';
import { construirEFE } from './efe-calculations.js';
import { seleccionarPeriodoPar, TOLERANCIA_COMPROBACION } from './comprobacion-calculations.js';
import { leerEstados } from '../../utils/estados-guardados.js';
import { etiquetaSupuesto, supuestosActivos } from '../../utils/casos.js';

export const UMBRALES = {
  ratioCorrienteMin: 1,
  ratioRapidoMin: 0.5,
  endeudamientoMax: 0.6,
  margenNetoMin: 0.05,
  roaMin: 0.05,
  deudaPatrimonioMax: 1,
  coberturaInteresesMin: 2,
  margenBrutoMin: 0.3,
  margenOperativoMin: 0.1,
  roeMin: 0.1,
  cicloConversionMaxDias: 60
};

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);

let savedCache = null;
const formatCurrency = v => formatearMoneda(v, monedaDe(savedCache));
const formatCurrencyND = formatCurrency;
let savedPeriods = [];
let savedError = null;
let selectedAnalysisPeriod = null;
let activeAnalysisTab = 'ah';
// Exportada: Reportes refresca la caché antes de reutilizar computeRazones para
// que el dashboard no lea estados guardados de una navegación anterior.
// D-078: sin respaldo por nombres — si los estados no se pueden leer, la
// caché queda null, el error se guarda y los periodos crudos siguen visibles
// para que las pestañas muestren N/D con el motivo.
export function refreshSavedStates() {
  const { estados, error } = leerEstados(store.get('estados'));
  savedCache = estados;
  savedError = error;
  savedPeriods = estados
    ? estados.periods
    : (Array.isArray(store.get('estados.periods')) ? sortPeriods(store.get('estados.periods')) : []);
  return savedCache;
}

// D-078: texto del aviso cuando los estados guardados no se pueden leer, o null
// si no hay error. Las pantallas lo muestran escapado (regla 7).
export function avisoEstadosGuardados() {
  if (!savedCache && !refreshSavedStates() && savedError) {
    return `No se pudieron leer los estados guardados: ${savedError}`;
  }
  return null;
}

function totalsFor(period) {
  const states = savedCache || refreshSavedStates();
  if (!states || !states.periods.includes(period)) return null;
  return computeFinancialTotals(states, period);
}


// D-078: sin estados legibles, cada campo sale N/D (null) — nunca 0 ni una
// lectura por nombres fijos. El motivo del N/D lo explican las razones
// (estados_no_legibles) y el aviso de la pantalla.
const BG_ND = () => ({
  efectivo: null, cxC: null, inventario: null, activosCorrientesOtros: null,
  activosCorrientes: null, cuentasPorPagar: null, pasivoCortoPlazo: null,
  provisiones: null, pasivosCorrientes: null, totalActivos: null,
  totalPasivos: null, totalPatrimonio: null, activosFijos: null
});

function getBGData(period) {
  const shared = totalsFor(period);
  if (!shared) return BG_ND();
  return {
    efectivo: shared.efectivo, cxC: shared.cxC, inventario: shared.inventario,
    activosCorrientesOtros: shared.activosCorrientesOtros,
    activosCorrientes: shared.activosCorrientes,
    cuentasPorPagar: shared.cuentasPorPagar, pasivoCortoPlazo: shared.pasivoCortoPlazo,
    provisiones: shared.provisiones, pasivosCorrientes: shared.pasivosCorrientes,
    totalActivos: shared.totalActivos, totalPasivos: shared.totalPasivos,
    totalPatrimonio: shared.totalPatrimonio, activosFijos: shared.activosFijos
  };
}

function getPeriods() {
  if (!savedCache) refreshSavedStates();
  if (savedPeriods.length) return savedPeriods;
  const raw = store.get('estados.periods');
  return Array.isArray(raw) ? sortPeriods(raw) : [];
}

export function computeAVBalanceGeneral(period) {
  return analisisVerticalCompleto(savedCache || refreshSavedStates(), period).balanceGeneral;
}

export function computeAVEstadoResultados(period) {
  return analisisVerticalCompleto(savedCache || refreshSavedStates(), period).estadoResultados;
}

// Public AV aggregate: the `av.js` shell re-exports this name.
export function computeAV(period) {
  return {
    balanceGeneral: computeAVBalanceGeneral(period),
    estadoResultados: computeAVEstadoResultados(period)
  };
}

export function computeRazones(period, opciones = {}) {
  // Una sola lectura del documento completo; el bridge conserva identidades,
  // composición y ambos periodos. La app mantiene el control apagado por defecto.
  const datos = store.get('estados');
  const { error } = leerEstados(datos);
  const resultado = computarRazonesDesdeDatos(datos, period, opciones);
  if (error) resultado.notAvailableReasons.push({
    motivo: 'estados_no_legibles', mensaje: `No se pudieron leer los estados guardados: ${error}`
  });
  return resultado;

}

export function computeDuPont(period) {
  return detalleDuPont(store.get('estados'), period);
}

export function computeCNTCNO(period) {
  const bg = getBGData(period);
  const sumaND = (a, b) => (esNumero(a) && esNumero(b) ? a + b : null);
  const CNT = capitalNetoTrabajo(bg.activosCorrientes, bg.pasivosCorrientes);
  const activosCorrientesOps = sumaND(bg.cxC, bg.inventario);
  const pasivosCorrientesOps = sumaND(bg.cuentasPorPagar, bg.provisiones);
  const CNO = capitalNetoOperativo(activosCorrientesOps, pasivosCorrientesOps);
  return {
    CNT, CNO, activosCorrientesOps, pasivosCorrientesOps,
    excluidosAC: sumaND(bg.efectivo, bg.activosCorrientesOtros),
    excluidosPC: bg.pasivoCortoPlazo
  };
}

// El EFE es un estado de dos periodos: `period` es el cierre (la pestaña pasa el
// último periodo) y se compara contra el inmediatamente anterior, con el mismo
// criterio que el EOAF. Devuelve el estado completo o `incompleto` si falta un
// periodo.
export function computeEFE(period) {
  const estados = estadosParaComprobacion();
  const documentado = estados?.flujosDocumentados?.find(f => f.periodoFinal === period);
  if (documentado) return construirEFE(estados, documentado.periodoInicial, period);
  const par = seleccionarPeriodoPar(getPeriods(), period);
  if (par.incompleto) {
    return {
      periodos: { inicial: null, final: period },
      incompleto: par.incompleto,
      utilidadNeta: null, operacion: null, inversion: null, financiamiento: null,
      totalFlujos: null, efectivoInicial: null, efectivoFinal: null,
      variacionEfectivo: null, diferencia: null, estado: 'incompleta',
      motivos: [], advertencias: [], interpretacion: ''
    };
  }
  return construirEFE(estadosParaComprobacion(), par.periodoInicial, par.periodoFinal);
}

function interpretacion(razones) {
  const hallazgos = [];
  const notaUmbral = 'Se recomienda analizar su evolución histórica y compararlo con el sector antes de concluir que existe un problema financiero.';
  // Las razones N/D (null) no generan hallazgos: null < umbral sería true en JS.
  const hayDato = v => typeof v === 'number' && Number.isFinite(v);
  if (hayDato(razones.RC) && razones.RC < UMBRALES.ratioCorrienteMin) {
    hallazgos.push({ hallazgo: `Ratio Corriente por debajo del umbral configurado (${UMBRALES.ratioCorrienteMin})`, causa: 'Posible dificultad para cubrir obligaciones a corto plazo', riesgo: 'Posible riesgo de liquidez', accion: notaUmbral + ' Evaluar conversión de inventarios y cobranza.' });
  }
  if (hayDato(razones.RR) && razones.denominadores.RR !== 0 && razones.RR < UMBRALES.ratioRapidoMin) {
    hallazgos.push({ hallazgo: `Prueba ácida por debajo del umbral configurado (${UMBRALES.ratioRapidoMin})`, causa: 'Dependencia significativa de los inventarios para cubrir obligaciones a corto plazo', riesgo: 'Posible riesgo de liquidez inmediata', accion: notaUmbral + ' Revisar niveles de inventario y activos líquidos.' });
  }
  if (hayDato(razones.endeudamiento) && razones.endeudamiento > UMBRALES.endeudamientoMax) {
    hallazgos.push({ hallazgo: `Endeudamiento por encima del umbral configurado (${formatPercent(UMBRALES.endeudamientoMax)})`, causa: 'Dependencia significativa de financiamiento ajeno', riesgo: 'Posible riesgo financiero elevado', accion: notaUmbral + ' Revisar estructura de capital.' });
  }
  if (hayDato(razones.deudaPatrimonio) && razones.deudaPatrimonio > UMBRALES.deudaPatrimonioMax) {
    hallazgos.push({ hallazgo: `Deuda / Patrimonio por encima del umbral configurado (${UMBRALES.deudaPatrimonioMax})`, causa: 'La empresa se financia principalmente con deuda', riesgo: 'Posible riesgo de insolvencia', accion: notaUmbral + ' Evaluar capitalización o reducción de deuda.' });
  }
  if (hayDato(razones.coberturaIntereses) && razones.coberturaIntereses < UMBRALES.coberturaInteresesMin) {
    hallazgos.push({ hallazgo: `Cobertura de intereses por debajo del umbral configurado (${UMBRALES.coberturaInteresesMin}×)`, causa: 'La utilidad operativa no cubre con holgura los gastos financieros', riesgo: 'Posible riesgo de incumplir obligaciones financieras', accion: notaUmbral + ' Aumentar la utilidad operativa o renegociar condiciones de deuda.' });
  }
  if (hayDato(razones.margenBruto) && razones.margenBruto < UMBRALES.margenBrutoMin) {
    hallazgos.push({ hallazgo: `Margen bruto por debajo del umbral configurado (${formatPercent(UMBRALES.margenBrutoMin)})`, causa: 'Costo de ventas elevado respecto a las ventas', riesgo: 'Rentabilidad comprometida desde el costo de ventas', accion: notaUmbral + ' Revisar costos de producción y proveedores.' });
  }
  if (hayDato(razones.margenOperativo) && razones.margenOperativo < UMBRALES.margenOperativoMin) {
    hallazgos.push({ hallazgo: `Margen operativo por debajo del umbral configurado (${formatPercent(UMBRALES.margenOperativoMin)})`, causa: 'Gastos de administración y ventas elevados', riesgo: 'Posible dificultad para cubrir gastos financieros', accion: notaUmbral + ' Optimizar gastos de administración y ventas.' });
  }
  if (hayDato(razones.MN) && razones.MN < UMBRALES.margenNetoMin) {
    hallazgos.push({ hallazgo: `Margen neto por debajo del umbral configurado (${formatPercent(UMBRALES.margenNetoMin)})`, causa: 'Costos o gastos elevados respecto a ventas', riesgo: 'Rentabilidad posiblemente comprometida', accion: notaUmbral + ' Optimizar costos operativos y revisar precios.' });
  }
  if (hayDato(razones.ROA) && razones.ROA < UMBRALES.roaMin) {
    hallazgos.push({ hallazgo: `ROA por debajo del umbral configurado (${formatPercent(UMBRALES.roaMin)})`, causa: 'Baja eficiencia en el uso de activos para generar utilidades', riesgo: 'Posible subutilización de recursos', accion: notaUmbral + ' Evaluar activos improductivos.' });
  }
  if (hayDato(razones.roe) && razones.roe < UMBRALES.roeMin) {
    hallazgos.push({ hallazgo: `ROE por debajo del umbral configurado (${formatPercent(UMBRALES.roeMin)})`, causa: 'Baja rentabilidad sobre el patrimonio invertido', riesgo: 'Rendimiento posiblemente insuficiente para los accionistas', accion: notaUmbral + ' Relacionar con DuPont para ver si lo explica el margen, la rotación o el apalancamiento.' });
  }
  if (hayDato(razones.cicloConversion) && razones.cicloConversion > UMBRALES.cicloConversionMaxDias) {
    hallazgos.push({ hallazgo: `Ciclo de conversión de efectivo mayor a ${UMBRALES.cicloConversionMaxDias} días`, causa: 'La empresa tarda en convertir inventarios y cuentas por cobrar en efectivo', riesgo: 'Posibles problemas de liquidez operativa', accion: notaUmbral + ' Revisar la gestión de inventarios, cobranza y pagos.' });
  }
  if (hallazgos.length === 0) {
    const evaluables = [razones.RC, razones.RR, razones.endeudamiento, razones.deudaPatrimonio,
      razones.coberturaIntereses, razones.margenBruto, razones.margenOperativo, razones.MN,
      razones.ROA, razones.roe, razones.cicloConversion];
    if (evaluables.some(hayDato)) {
      hallazgos.push({ hallazgo: 'Indicadores dentro de los umbrales configurados', causa: 'Situación financieramente estable según los parámetros actuales', riesgo: 'Riesgo controlado', accion: 'Los umbrales son referencias educativas: complementar con comparación sectorial y análisis histórico.' });
    } else {
      // Nada calculable: afirmar que están "dentro de los umbrales" sería un
      // hallazgo falso sobre razones N/D.
      hallazgos.push({ hallazgo: 'No hay indicadores calculables (N/D)', causa: 'Faltan datos en los estados financieros para evaluar las razones', riesgo: 'Sin evaluación posible', accion: 'Complete los estados financieros con los datos requeridos y vuelva a analizar.' });
    }
  }
  return hallazgos;
}

function computeEvolucion(periods) {
  if (periods.length < 2) return [];
  const evoluciones = [];
  const esCalculable = v => typeof v === 'number' && Number.isFinite(v);
  const nombres = [
    ['Liquidez Corriente', r => r.RC, formatNumber],
    ['Rotación Inventario', r => r.RotInv, formatNumber],
    ['Margen Neto', r => r.MN, formatPercent],
    ['ROA', r => r.ROA, formatPercent]
  ];
  for (let i = 1; i < periods.length; i++) {
    const r1 = computeRazones(periods[i - 1]);
    const r2 = computeRazones(periods[i]);
    for (const [nombre, getter, fmt] of nombres) {
      const v1 = getter(r1);
      const v2 = getter(r2);
      if (!esCalculable(v1) || !esCalculable(v2)) {
        // Razón N/D en uno de los periodos: no hay variación calculable.
        evoluciones.push({ periodo: `${periods[i - 1]} → ${periods[i]}`, indicador: nombre, t1: v1, t2: v2, lectura: 'N/D: la razón no pudo calcularse en uno de los periodos.' });
        continue;
      }
      const delta = v2 - v1;
      const pct = v1 !== 0 ? delta / Math.abs(v1) : null;
      let lectura;
      if (Math.abs(delta) < 1e-9) lectura = 'Sin cambio relevante.';
      else if (delta > 0) lectura = `Aumentó ${fmt(Math.abs(delta))} puntos (${pct !== null ? formatPercent(pct) : 'N/D'}).`;
      else lectura = `Disminuyó ${fmt(Math.abs(delta))} puntos (${pct !== null ? formatPercent(pct) : 'N/D'}). Investigar causas posibles.`;
      evoluciones.push({ periodo: `${periods[i - 1]} → ${periods[i]}`, indicador: nombre, t1: v1, t2: v2, lectura });
    }
  }
  return evoluciones;
}

function renderAHSection(periods) {
  const ahData = computeAH(periods);
  if (ahData.length === 0) return '<p class="text-muted">Se necesitan al menos 2 periodos.</p>';
  let html = '<p class="analisis-note">Todas las cuentas del balance y del estado de resultados. Δ = T2 − T1; variación % = Δ / |T1|. Una cuenta ausente no equivale a cero: se muestra N/D. Con base cero, el porcentaje es N/D.</p>';
  for (const ah of ahData) {
    html += `<h4 class="analisis-comparison-title">${escapeHTML(ah.periodo)}</h4>`;
    for (const [seccion, titulo] of [['balance', 'Balance general'], ['resultados', 'Estado de resultados'],
      ['complementarios', 'Datos suplementarios'], ['pendientes', 'Cuentas pendientes de grupo']]) {
      const filas = ah.rows.filter(r => r.seccion === seccion);
      if (!filas.length) continue;
      const { visibles, opcionales } = separarCuentasOpcionales(filas, r => [r.fuenteT1, r.fuenteT2]);
      const tabla = lista => `<div class="table-wrapper mb-6"><table>
        <thead><tr><th>Cuenta</th><th class="text-right">Periodo T1</th><th class="text-right">Periodo T2</th><th class="text-right">Δ</th><th class="text-right">%Δ</th></tr></thead>
        <tbody>${lista.map(r => `<tr class="${r.subtotal ? 'statement-subtotal' : ''}">
          <td><span class="analisis-account-group">${escapeHTML(r.grupo)}</span><span class="statement-label">${etiquetaFilaEstado(r, { mostrarOrigen: false })}</span></td>
          <td class="text-right font-mono">${formatCurrencyND(r.t1)}${origenFilaEstado(r.fuenteT1, r.cuenta)}</td>
          <td class="text-right font-mono">${formatCurrencyND(r.t2)}${origenFilaEstado(r.fuenteT2, r.cuenta)}</td>
          <td class="text-right font-mono ${esNumero(r.delta) && r.delta < 0 ? 'text-danger' : ''}">${formatCurrencyND(r.delta)}</td>
          <td class="text-right font-mono">${r.pctDelta === null ? 'N/D' : formatPercent(r.pctDelta)}</td>
        </tr>`).join('')}</tbody>
      </table></div>`;
      html += `<section class="analisis-sheet" data-statement="${seccion}"><h5>${titulo}</h5>${tabla(visibles)}${desplegableCuentasOpcionales(opcionales, opcionales.length ? tabla(opcionales) : '')}</section>`;
    }
  }
  return html;
}

export function computeAH(periods) {
  return analisisHorizontalCompleto(savedCache || refreshSavedStates(), periods);
}

function renderAVTable(avData, titulo, fuentes) {
  const { visibles, opcionales } = separarCuentasOpcionales(avData.rows, fuentes);
  const tabla = lista => `<div class="table-wrapper mb-6"><table>
      <thead><tr><th>Cuenta</th><th class="text-right">Valor</th><th class="text-right">% Base</th></tr></thead>
      <tbody>${lista.map(r => `<tr class="${r.subtotal ? 'statement-subtotal' : ''}">
        <td><span class="analisis-account-group">${escapeHTML(r.grupo)}</span><span class="statement-label">${etiquetaFilaEstado(r)}</span></td>
        <td class="text-right font-mono">${formatCurrencyND(r.valor)}</td>
        <td class="text-right font-mono">${r.pctBase === null ? 'N/D' : formatPercent(r.pctBase)}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  return `<section class="analisis-sheet"><h4>${titulo}</h4>
    <p class="analisis-note">Cuenta / base × 100. Base utilizada: <strong>${escapeHTML(avData.base)}</strong> = ${formatCurrencyND(avData.baseValor)}</p>
    ${tabla(visibles)}${desplegableCuentasOpcionales(opcionales, opcionales.length ? tabla(opcionales) : '')}</section>`;
}

function renderAVSection(period) {
  const estados = savedCache || refreshSavedStates();
  const datos = analisisVerticalCompleto(estados, period);
  const periodos = (estados?.periods || []).map(p => new Map(filasAnalisis(estados, p).map(f => [f.clave, f])));
  const fuentes = fila => periodos.map(m => m.get(fila.clave));
  return '<p class="analisis-note">Incluye todas las cuentas y los subtotales resueltos en orden. Los importados conservan sus nombres; los calculados no se suman de nuevo. Una base cero o incompleta produce N/D.</p>' +
    renderAVTable(datos.balanceGeneral, 'Análisis Vertical — Balance General', fuentes) +
    renderAVTable(datos.estadoResultados, 'Análisis Vertical — Estado de Resultados', fuentes) +
    (datos.complementarios.length ? `<section class="analisis-sheet"><h4>Datos fuera de la base vertical</h4><p class="analisis-note">Los datos suplementarios y las cuentas sin grupo se conservan, pero no se les asigna una base contable sin acreditar su clasificación.</p><div class="table-wrapper"><table><thead><tr><th>Cuenta</th><th>Importe</th><th>% Base</th></tr></thead><tbody>${datos.complementarios.map(fila => `<tr><td>${escapeHTML(fila.cuenta)}</td><td>${formatCurrencyND(fila.valor)}</td><td>N/D · ${escapeHTML(fila.grupo)}</td></tr>`).join('')}</tbody></table></div></section>` : '');
}

function msgDivisionCero(indicador, denominador) {
  return `No se puede calcular ${indicador}: ${denominador} es igual a cero.`;
}

function renderRazonesSection(period) {
  const r = computeRazones(period);
  const d = r.denominadores;
  // Denominador 0 → mensaje de división; valor no calculable (null) → N/D.
  const val = (valor, fmt, den, nombre, indicador) => {
    if (den === 0) return msgDivisionCero(indicador, nombre);
    if (valor == null) return 'N/D';
    return fmt(valor);
  };
  const badge = (ok) => ok ? 'badge-success' : 'badge-warning';
  // Las razones N/D (null) no se evalúan contra el umbral: se muestran sin insignia.
  const badgeSiHay = (v, ok) => v == null ? 'badge-info' : badge(ok);
  const etiqueta = (b) => b === 'badge-success' ? 'OK' : 'Revisión';
  const fuenteCxP = `compras a crédito${r.usaPromedios ? ' / CxP promedio' : ''}`;
  // D-113: con AGRI-CORP consolidado, las ventas a crédito (S1) y los pagos a proveedores (S2–S3)
  // son supuestos declarados: las cifras que los usan llevan la etiqueta.
  const { credito } = supuestosActivos(store.getAll());
  const sup = (texto, ids) => (credito && texto !== 'N/D' && !texto.startsWith('No se puede calcular')
    ? `${texto} ${etiquetaSupuesto(ids, 'Depende de un supuesto declarado; ver el mapa de supuestos en Inicio')}` : texto);
  const items = [
    ['Liquidez', '', '', ''],
    ['Ratio Corriente', val(r.RC, formatNumber, d.RC, 'el pasivo corriente', 'la liquidez corriente'), badgeSiHay(r.RC, r.RC >= UMBRALES.ratioCorrienteMin)],
    ['Ratio Rápido', val(r.RR, formatNumber, d.RR, 'el pasivo corriente', 'la prueba ácida'), badgeSiHay(r.RR, r.RR >= UMBRALES.ratioRapidoMin)],
    ['Prueba Defensiva', r.pruebaDefensiva == null ? 'N/D' : formatNumber(r.pruebaDefensiva), 'badge-info'],
    ['Actividad', '', '', ''],
    [`Rotación Inventario${r.usaPromedios ? ' (inv. promedio)' : ''}`, val(r.RotInv, formatNumber, d.RotInv, 'el inventario', 'la rotación de inventario'), 'badge-info'],
    ['Edad del Inventario (días)', r.edadInventario == null ? 'N/D' : formatNumber(r.edadInventario, 2), 'badge-info'],
    [`Rotación CxC (ventas a crédito${r.usaPromedios ? ' / CxC promedio' : ''})`, sup(val(r.RotCxC, formatNumber, d.RotCxC, 'las CxC', 'la rotación de CxC'), 'S1'), 'badge-info'],
    ['Plazo Cobro (días)', sup(r.PPC == null ? 'N/D' : formatNumber(r.PPC, 2), 'S1'), 'badge-info'],
    [`Rotación de Cuentas por Pagar (${fuenteCxP})`, sup(r.rotacionCxP == null ? 'N/D' : formatNumber(r.rotacionCxP), 'S2–S3'), 'badge-info'],
    ['Plazo Pago (días)', sup(r.plazoPago == null ? 'N/D' : formatNumber(r.plazoPago, 2), 'S2–S3'), 'badge-info'],
    ['Ciclo de Conversión (días)', sup(r.cicloConversion == null ? 'N/D' : formatNumber(r.cicloConversion, 2), 'S1–S3'), badgeSiHay(r.cicloConversion, r.cicloConversion <= UMBRALES.cicloConversionMaxDias)],
    [`Rotación Activos${r.usaPromedios ? ' (activo promedio)' : ''}`, r.rotacionActivos == null ? 'N/D' : formatNumber(r.rotacionActivos), 'badge-info'],
    ['Rotación Activos Fijos (Ventas / activo fijo neto)', r.rotacionActivosFijos == null ? 'N/D' : formatNumber(r.rotacionActivosFijos), 'badge-info'],
    ['Rotación Capital de Trabajo (Ventas / CNT)', r.rotacionCapitalTrabajo == null ? 'N/D' : formatNumber(r.rotacionCapitalTrabajo), 'badge-info'],
    ['Endeudamiento y Cobertura', '', '', ''],
    ['Endeudamiento', val(r.endeudamiento, formatPercent, d.End, 'el activo total', 'el endeudamiento'), badgeSiHay(r.endeudamiento, r.endeudamiento <= UMBRALES.endeudamientoMax)],
    ['Deuda / Patrimonio', r.deudaPatrimonio == null ? 'N/D' : formatNumber(r.deudaPatrimonio), badgeSiHay(r.deudaPatrimonio, r.deudaPatrimonio <= UMBRALES.deudaPatrimonioMax)],
    [`Apalancamiento${r.usaPromedios ? ' (promedio)' : ''}`, r.apalancamiento == null ? 'N/D' : formatNumber(r.apalancamiento), 'badge-info'],
    ['Solvencia (Activos / Pasivos)', r.solvencia == null ? 'N/D' : formatNumber(r.solvencia), 'badge-info'],
    ['Cobertura de Intereses', r.coberturaIntereses == null ? 'N/D' : `${formatNumber(r.coberturaIntereses)}×`, badgeSiHay(r.coberturaIntereses, r.coberturaIntereses >= UMBRALES.coberturaInteresesMin)],
    ['Rentabilidad', '', '', ''],
    ['Margen Bruto', r.margenBruto == null ? 'N/D' : formatPercent(r.margenBruto), badgeSiHay(r.margenBruto, r.margenBruto >= UMBRALES.margenBrutoMin)],
    ['Margen Operativo', r.margenOperativo == null ? 'N/D' : formatPercent(r.margenOperativo), badgeSiHay(r.margenOperativo, r.margenOperativo >= UMBRALES.margenOperativoMin)],
    [`ROE${r.usaPromedios ? ' (patrimonio promedio)' : ''}`, r.roe == null ? 'N/D' : formatPercent(r.roe), badgeSiHay(r.roe, r.roe >= UMBRALES.roeMin)],
    ['Margen Neto', val(r.MN, formatPercent, d.MN, 'las ventas', 'el margen neto'), badgeSiHay(r.MN, r.MN >= UMBRALES.margenNetoMin)],
    [`ROA${r.usaPromedios ? ' (activo promedio)' : ''}`, val(r.ROA, formatPercent, d.ROA, 'el activo total', 'el ROA'), badgeSiHay(r.ROA, r.ROA >= UMBRALES.roaMin)]
  ];
  const notaPromedios = r.usaPromedios
    ? 'Rotaciones, ROA y DuPont usan saldos promedio ((inicial + final) / 2).'
    : getPeriods().length === 1 ? 'Con un único periodo, las razones de flujo usan saldos de cierre; no hay promedio de dos periodos.'
      : 'En el primer periodo de la serie, las razones de flujo permanecen N/D con el modo directo desactivado; los indicadores de punto usan el saldo disponible.';
  const notaCreditos = r.RotCxC == null
    ? ''
    : 'La rotación de CxC y el plazo de cobro usan las ventas a crédito declaradas.';
  let grupoAbierto = false;
  const indicadores = items.map(([label, value, badgeClass]) => {
    if (!value) {
      const cierre = grupoAbierto ? '</dl></section>' : '';
      grupoAbierto = true;
      return `${cierre}<section class="analisis-ratio-group"><h4>${label}</h4><dl class="analisis-ratio-list">`;
    }
    const esError = value.startsWith('No se puede calcular');
    return `<div><dt>${label}</dt><dd class="${esError ? 'text-danger' : ''}">${value}${!esError && badgeClass && badgeClass !== 'badge-info' ? ` <span class="badge ${badgeClass}">${etiqueta(badgeClass)}</span>` : ''}</dd></div>`;
  }).join('') + (grupoAbierto ? '</dl></section>' : '');
  return `<p class="text-muted mb-4" style="font-size:var(--font-size-sm)">${notaPromedios}</p>
  ${notaCreditos ? `<p class="text-muted mb-4" style="font-size:var(--font-size-sm)">${notaCreditos}</p>` : ''}
  <div class="analisis-ratios">${indicadores}</div>${disponibilidadRazones(r)}`;
}

function renderCNTCNOSection(period) {
  const { CNT, CNO, activosCorrientesOps, pasivosCorrientesOps, excluidosAC, excluidosPC } = computeCNTCNO(period);
  return `<div class="kpi-grid mb-4">
    <div class="kpi-card"><div class="kpi-value ${CNT >= 0 ? '' : 'text-danger'}">${formatCurrency(CNT)}</div><div class="kpi-label">Capital Neto de Trabajo</div><div class="kpi-label" style="font-size:var(--font-size-sm)">Todo AC − todo PC</div></div>
    <div class="kpi-card"><div class="kpi-value ${CNO >= 0 ? '' : 'text-danger'}">${formatCurrency(CNO)}</div><div class="kpi-label">Capital Neto Operativo</div><div class="kpi-label" style="font-size:var(--font-size-sm)">AC ops − PC ops</div></div>
  </div>
  <p class="text-muted" style="font-size:var(--font-size-sm)">
    Composición del CNO — Activos corrientes operativos: <strong>CxC + Inventario</strong> = ${formatCurrency(activosCorrientesOps)};
    Pasivos corrientes operativos: <strong>CxP + Provisiones</strong> = ${formatCurrency(pasivosCorrientesOps)}.
    Excluidos por no ser operativos: Efectivo y otros activos corrientes (${formatCurrency(excluidosAC)}) y Pasivo corto plazo financiero (${formatCurrency(excluidosPC)}).
  </p>`;
}

// Estados que leen el EOAF y el EFE: los normalizados si la caché es válida; si
// no, los guardados en bruto, porque las cuentas sin clasificar o con importes
// inválidos se reportan en la comprobación en lugar de ignorarse.
function estadosParaComprobacion() {
  // D-078: sin respaldo — si los estados no se pueden leer, el EOAF y el EFE
  // muestran su estado incompleto; el aviso real lo da avisoEstadosGuardados().
  return savedCache || refreshSavedStates();
}

export function computeEOAF(periods) {
  const par = seleccionarPeriodoPar(periods);
  if (par.incompleto) {
    return { periodos: null, incompleto: par.incompleto, secciones: [], resumen: null, advertencias: [], interpretacion: '' };
  }
  return construirEOAF(estadosParaComprobacion(), par.periodoInicial, par.periodoFinal);
}

// Piezas de interfaz que comparten las pestañas EOAF y EFE.
const INSIGNIAS_COMPROBACION = {
  cuadra: '<span class="badge badge-success">Cuadra</span>',
  // D-069: tercer estado del EFE — los flujos cierran pero no hay cuenta de
  // resultado del periodo contra la que verificar la utilidad.
  'cuadra-sin-verificar': '<span class="badge badge-info">Cuadra (sin verificar la utilidad)</span>',
  'no-cuadra': '<span class="badge badge-danger">No cuadra</span>',
  incompleta: '<span class="badge badge-warning">Comprobación incompleta</span>'
};

function insigniaComprobacion(estado) {
  return INSIGNIAS_COMPROBACION[estado] || INSIGNIAS_COMPROBACION.incompleta;
}

// Tarjeta con una lista de textos. Pueden traer nombres de cuenta de un archivo
// importado, así que cada uno se escapa; `titulo` y `color` son literales.
function tarjetaLista(titulo, textos, color) {
  if (!textos || textos.length === 0) return '';
  return `<div class="card mb-4" style="border-left:4px solid var(${color})">
    <p class="font-bold mb-2">${titulo}</p>
    <ul style="margin:0;padding-left:1.2em;font-size:var(--font-size-sm)">
      ${textos.map(texto => `<li>${escapeHTML(texto)}</li>`).join('')}
    </ul>
  </div>`;
}

function tarjetaInterpretacion(texto) {
  return `<div class="card mb-4" style="border-left:4px solid var(--color-primary)">
    <p class="font-bold mb-2">Interpretación</p>
    <p style="margin:0;font-size:var(--font-size-sm);color:var(--text-secondary)">${escapeHTML(texto)}</p>
  </div>`;
}

function pieComprobacion() {
  return `<p class="text-muted" style="font-size:var(--font-size-sm)">Tolerancia de la comprobación: ${formatCurrency(TOLERANCIA_COMPROBACION)} (un centavo), más el redondeo de coma flotante de los totales. «Cuadra» confirma que los dos balances cierran y que sus variaciones se explican entre sí; no verifica que los importes capturados sean correctos.</p>`;
}

function renderEOAFSection(periods) {
  const estado = computeEOAF(periods);
  if (estado.incompleto) {
    // D-078: cuando los estados no se leen, el aviso real precede al mensaje.
    const aviso = avisoEstadosGuardados();
    return `<p class="text-muted">${escapeHTML(aviso ? `${aviso} ${estado.incompleto}` : estado.incompleto)}</p>`;
  }
  const { periodos, secciones, resumen, advertencias, interpretacion } = estado;
  // Los subtotales y totales solo muestran saldos: nunca suman movimientos.
  const fmtSaldo = valor => valor == null ? 'N/D' : formatCurrency(valor);
  const fmtMovimiento = valor => valor == null ? '—' : formatCurrency(valor);
  const insignia = fila => {
    if (fila.clasificacion === 'Origen') return '<span class="badge badge-success">Origen</span>';
    if (fila.clasificacion === 'Aplicacion') return '<span class="badge badge-primary">Aplicación</span>';
    if (fila.clasificacion === 'Sin movimiento') return '<span class="badge badge-info">Sin movimiento</span>';
    return `<span class="badge badge-warning">${escapeHTML(fila.etiqueta || 'Dato faltante')}</span>`;
  };
  const celdaMovimiento = (valor, clase) =>
    `<td class="text-right font-mono ${valor == null ? 'text-muted' : clase}">${fmtMovimiento(valor)}</td>`;

  const filas = secciones.map(seccion => `
    <tr>
      <td colspan="7" class="font-bold" style="background:var(--bg-tertiary)">${escapeHTML(seccion.titulo)}</td>
    </tr>
    ${seccion.filas.map(fila => `<tr>
      <td>${escapeHTML(fila.cuenta)}</td>
      <td class="text-right font-mono">${fmtSaldo(fila.saldoInicial)}</td>
      <td class="text-right font-mono">${fmtSaldo(fila.saldoFinal)}</td>
      ${celdaMovimiento(fila.variacion, fila.variacion < 0 ? 'text-danger' : 'text-success')}
      <td>${insignia(fila)}</td>
      ${celdaMovimiento(fila.origen, '')}
      ${celdaMovimiento(fila.aplicacion, '')}
    </tr>`).join('')}
    <tr class="font-bold" style="border-top:2px solid var(--border-color-strong)">
      <td>Subtotal ${escapeHTML(seccion.titulo)}</td>
      <td class="text-right font-mono">${fmtSaldo(seccion.subtotal.saldoInicial)}</td>
      <td class="text-right font-mono">${fmtSaldo(seccion.subtotal.saldoFinal)}</td>
      <td class="text-right font-mono">${fmtSaldo(seccion.subtotal.variacion)}</td>
      <td class="text-muted">—</td>
      <td class="text-right text-muted">—</td>
      <td class="text-right text-muted">—</td>
    </tr>`).join('');

  const pasivos = secciones.find(seccion => seccion.id === 'pasivos');
  const patrimonio = secciones.find(seccion => seccion.id === 'patrimonio');
  const totalPasivosPatrimonio = pasivos.subtotal.completo && patrimonio.subtotal.completo
    ? {
      saldoInicial: pasivos.subtotal.saldoInicial + patrimonio.subtotal.saldoInicial,
      saldoFinal: pasivos.subtotal.saldoFinal + patrimonio.subtotal.saldoFinal,
      variacion: pasivos.subtotal.variacion + patrimonio.subtotal.variacion
    }
    : { saldoInicial: null, saldoFinal: null, variacion: null };

  return `<p class="text-muted mb-4" style="font-size:var(--font-size-sm)">
    Comparación de saldos: <strong>${escapeHTML(periodos.inicial)}</strong> (periodo inicial) → <strong>${escapeHTML(periodos.final)}</strong> (periodo final).
    Reglas: aumento de activo = aplicación, disminución de activo = origen; aumento de pasivo o patrimonio = origen, disminución = aplicación;
    sin variación = sin movimiento. Los subtotales y los totales solo muestran saldos y no generan movimientos.
  </p>
  <div class="table-wrapper mb-6"><table>
    <thead><tr>
      <th>Cuenta</th>
      <th class="text-right">Saldo ${escapeHTML(periodos.inicial)}</th>
      <th class="text-right">Saldo ${escapeHTML(periodos.final)}</th>
      <th class="text-right">Variación</th>
      <th>Clasificación</th>
      <th class="text-right">Origen</th>
      <th class="text-right">Aplicación</th>
    </tr></thead>
    <tbody>${filas}
      <tr class="font-bold" style="border-top:2px solid var(--border-color-strong)">
        <td>Total Pasivos y Patrimonio</td>
        <td class="text-right font-mono">${fmtSaldo(totalPasivosPatrimonio.saldoInicial)}</td>
        <td class="text-right font-mono">${fmtSaldo(totalPasivosPatrimonio.saldoFinal)}</td>
        <td class="text-right font-mono">${fmtSaldo(totalPasivosPatrimonio.variacion)}</td>
        <td class="text-muted">—</td>
        <td class="text-right text-muted">—</td>
        <td class="text-right text-muted">—</td>
      </tr>
    </tbody>
  </table></div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card"><div class="kpi-value">${fmtSaldo(resumen.totalOrigenes)}</div><div class="kpi-label">Total de orígenes</div></div>
    <div class="kpi-card"><div class="kpi-value">${fmtSaldo(resumen.totalAplicaciones)}</div><div class="kpi-label">Total de aplicaciones</div></div>
    <div class="kpi-card"><div class="kpi-value ${resumen.estado === 'no-cuadra' ? 'text-danger' : ''}">${fmtSaldo(resumen.diferencia)}</div><div class="kpi-label">Diferencia (orígenes − aplicaciones)</div></div>
    <div class="kpi-card">${insigniaComprobacion(resumen.estado)}<div class="kpi-label font-bold" style="margin-top:var(--space-2)">Estado de la comprobación</div></div>
  </div>
  ${tarjetaLista('Comprobación incompleta', resumen.motivos, '--color-warning')}
  ${tarjetaLista('Notas de la comprobación', advertencias, '--color-info')}
  ${tarjetaInterpretacion(interpretacion)}
  ${pieComprobacion()}`;
}

function renderEFESection(period) {
  const efe = computeEFE(period);
  if (efe.incompleto) {
    // D-078: cuando los estados no se leen, el aviso real precede al mensaje.
    const aviso = avisoEstadosGuardados();
    return `<p class="text-muted">${escapeHTML(aviso ? `${aviso} ${efe.incompleto}` : efe.incompleto)}</p>`;
  }
  const fmt = valor => valor == null ? 'N/D' : formatCurrency(valor);
  const celda = valor => `<td class="text-right font-mono ${valor != null && valor < 0 ? 'text-danger' : ''}">${fmt(valor)}</td>`;
  const filas = (seccion, titulo) => `
    <tr>
      <td colspan="2" class="font-bold" style="background:var(--bg-tertiary)">${titulo}</td>
    </tr>
    ${seccion.items.map(fila => `<tr>
      <td>${escapeHTML(fila.concepto)}${fila.falta ? ' <span class="badge badge-warning">Revisar</span>' : ''}</td>
      ${celda(fila.monto)}
    </tr>`).join('')}
    <tr class="font-bold" style="border-top:2px solid var(--border-color-strong)">
      <td>(=) Flujo neto de ${titulo.toLowerCase()}</td>
      ${celda(seccion.total)}
    </tr>`;
  const documentado = efe.naturaleza !== 'estimacion_por_variaciones';
  const aviso = documentado
    ? `<div class="card mb-4" role="note"><strong>${efe.naturaleza === 'flujo_reportado' ? 'Estado de flujos reportado' : 'Flujo del caso simulado'}.</strong> ${escapeHTML(efe.fuente)}. Se usan los movimientos suministrados y su propio intervalo; no se estiman desde diferencias de balances.</div>`
    : '<div class="card mb-4" role="note"><strong>Estimación por variaciones de saldos.</strong> Cuadrar con el cambio de efectivo no confirma los cobros, pagos, dividendos ni operaciones no monetarias. Verifique los movimientos reales y las notas del periodo. Para registrar cobros y pagos, use <a href="#/flujo">Flujo de Efectivo</a>.</div>';
  return `${aviso}
  <p class="text-muted mb-4" style="font-size:var(--font-size-sm)">
    ${documentado ? 'Intervalo del documento' : 'Método indirecto desde dos balances'}: <strong>${escapeHTML(efe.periodos.inicial)}</strong> (inicial) → <strong>${escapeHTML(efe.periodos.final)}</strong> (final).
    ${documentado ? 'Cada actividad suma las entradas y salidas acreditadas en el documento. La comprobación no cambia sus cifras.' : 'Operación = utilidad neta + depreciación + variación de activos y pasivos de operación; Inversión = activos de inversión; Financiamiento = deuda, patrimonio y dividendos. Los gastos por intereses e impuestos ya están dentro de la utilidad neta.'}
  </p>
  <div class="table-wrapper mb-4"><table>
    <thead><tr><th>Concepto</th><th class="text-right">Monto</th></tr></thead>
    <tbody>
      ${filas(efe.operacion, 'Operación')}
      ${filas(efe.inversion, 'Inversión')}
      ${filas(efe.financiamiento, 'Financiamiento')}
      <tr class="font-bold" style="border-top:2px solid var(--border-color-strong)"><td>(=) Total de flujos (CFO + CFI + CFF) · variación neta calculada</td>${celda(efe.totalFlujos)}</tr>
      <tr class="font-bold"><td>(+) Efectivo al inicio</td>${celda(efe.efectivoInicial)}</tr>
      ${Object.hasOwn(efe, 'efectoConversion') ? `<tr class="font-bold"><td>(+) Efecto de conversión de moneda (publicado; no es una actividad)</td>${celda(efe.efectoConversion)}</tr>` : ''}
      <tr class="font-bold"><td>(=) Efectivo final calculado (inicial + flujos${Object.hasOwn(efe, 'efectoConversion') ? ' + efecto de conversión' : ''})</td>${celda(efe.efectivoFinalCalculado)}</tr>
      <tr class="font-bold"><td>Efectivo al final · saldo del balance</td>${celda(efe.efectivoFinal)}</tr>
      <tr class="font-bold"><td>Variación de efectivo según balances</td>${celda(efe.variacionEfectivo)}</tr>
      <tr class="font-bold"><td>Diferencia (flujos${Object.hasOwn(efe, 'efectoConversion') ? ' + efecto de conversión' : ''} − variación de efectivo)</td>${celda(efe.diferencia)}</tr>
    </tbody>
  </table></div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card"><div class="kpi-value">${fmt(efe.operacion.total)}</div><div class="kpi-label">Flujo de Efectivo Operativo (CFO)</div></div>
    <div class="kpi-card"><div class="kpi-value">${fmt(efe.inversion.total)}</div><div class="kpi-label">Flujo de Efectivo de Inversión (CFI)</div></div>
    <div class="kpi-card"><div class="kpi-value">${fmt(efe.financiamiento.total)}</div><div class="kpi-label">Flujo de Efectivo de Financiamiento (CFF)</div></div>
    <div class="kpi-card">${insigniaComprobacion(efe.estado)}<div class="kpi-label font-bold" style="margin-top:var(--space-2)">Estado de la comprobación</div></div>
  </div>
  ${tarjetaLista('Comprobación incompleta', efe.motivos, '--color-warning')}
  ${tarjetaLista('Notas del EFE', efe.advertencias, '--color-info')}
  ${tarjetaInterpretacion(efe.interpretacion)}
  ${pieComprobacion()}`;
}

function renderDuPontSection(period) {
  const dp = computeDuPont(period);
  const fmtProm = formatCurrencyND;
  const notaPromedios = dp.usaPromedios
    ? `Activo promedio = ${fmtProm(dp.activoProm)} · Patrimonio promedio = ${fmtProm(dp.patrimonioProm)} ((inicial + final) / 2)`
    : `Sin periodo previo: se conserva la política de saldos finales del sistema. Los factores que requieran un promedio no acreditado permanecen N/D. Activo = ${fmtProm(dp.activoProm)}; patrimonio = ${fmtProm(dp.patrimonioProm)}.`;
  const pct = v => esNumero(v) ? formatPercent(v) : 'N/D';
  const veces = v => esNumero(v) ? `${formatNumber(v, 4)} veces` : 'N/D';
  const factores = [
    ['Margen neto (PM)', 'Utilidad neta / Ventas netas', dp.utilidadNeta, dp.ventas, dp.PM, pct],
    ['Rotación de activos (AT)', 'Ventas netas / Activo promedio', dp.ventas, dp.activoProm, dp.AT, veces],
    ['Multiplicador del capital (EM)', 'Activo promedio / Patrimonio promedio', dp.activoProm, dp.patrimonioProm, dp.EM, veces]
  ];
  const comprobar = (producto, directo) => !esNumero(producto) || !esNumero(directo) ? 'N/D · faltan datos o existe un divisor cero'
    : Math.abs(producto - directo) <= 1e-10 * Math.max(1, Math.abs(directo)) ? 'Coincide con la fórmula directa' : 'Revisar diferencia con la fórmula directa';
  return `<p class="analisis-note">${notaPromedios}</p>
    <section class="analisis-sheet"><h4>Cálculo de cada factor</h4>
      <p class="analisis-note">Se conserva toda la precisión durante el cálculo. Los valores mostrados se redondean al final.</p>
      <div class="table-wrapper"><table><thead><tr><th>Factor</th><th>Fórmula</th><th>Sustitución</th><th>Resultado</th></tr></thead><tbody>
        ${factores.map(([nombre, formula, numerador, denominador, resultado, formato]) => `<tr><th scope="row">${nombre}</th><td>${formula}</td><td class="analisis-operation">${fmtProm(numerador)} / ${fmtProm(denominador)}</td><td class="text-right">${formato(resultado)}</td></tr>`).join('')}
      </tbody></table></div></section>
    <section class="analisis-sheet"><h4>ROA y ROE: descomposición y comprobación</h4>
      <div class="table-wrapper"><table><thead><tr><th>Indicador</th><th>DuPont</th><th>Fórmula directa</th><th>Comprobación</th></tr></thead><tbody>
        <tr><th scope="row">ROA</th><td>PM × AT<br>${pct(dp.PM)} × ${veces(dp.AT)}<br><strong>${pct(dp.ROA)}</strong></td><td>UN / Activo promedio<br>${fmtProm(dp.utilidadNeta)} / ${fmtProm(dp.activoProm)}<br><strong>${pct(dp.roaDirecto)}</strong></td><td>${comprobar(dp.ROA, dp.roaDirecto)}</td></tr>
        <tr><th scope="row">ROE</th><td>PM × AT × EM<br>${pct(dp.PM)} × ${veces(dp.AT)} × ${veces(dp.EM)}<br><strong>${pct(dp.ROE)}</strong></td><td>UN / Patrimonio promedio<br>${fmtProm(dp.utilidadNeta)} / ${fmtProm(dp.patrimonioProm)}<br><strong>${pct(dp.roeDirecto)}</strong></td><td>${comprobar(dp.ROE, dp.roeDirecto)}</td></tr>
      </tbody></table></div></section>
    <p class="analisis-note"><strong>Lectura integrada:</strong> el margen explica la rentabilidad de las ventas; la rotación, la eficiencia de los activos; el multiplicador, la relación activo/patrimonio. Un multiplicador alto no demuestra por sí solo rentabilidad favorable ni deuda conveniente. Fuentes: clase DuPont, diapositivas 5–11.</p>`;
}

function renderInterpretacionSection(period) {
  const razones = computeRazones(period);
  const hallazgos = interpretacion(razones);
  const niveles = `
    <h4 class="mb-2">Indicadores en tres niveles</h4>
    <div class="table-wrapper mb-6"><table>
      <thead><tr><th>Indicador</th><th class="text-right">Resultado</th><th>Significado</th><th>Análisis</th></tr></thead>
      <tbody>
        <tr><td>Liquidez Corriente</td><td class="text-right font-mono">${razones.RC == null ? 'N/D' : formatNumber(razones.RC)}</td><td>${razones.RC == null ? '—' : `Por cada unidad monetaria de pasivo corriente existen ${formatNumber(razones.RC)} unidades de activo corriente.`}</td><td>Complementar con la prueba ácida, la composición del activo corriente y la evolución histórica antes de concluir.</td></tr>
        <tr><td>Margen Neto</td><td class="text-right font-mono">${razones.MN == null ? 'N/D' : formatPercent(razones.MN)}</td><td>${razones.MN == null ? '—' : `Queda ${formatPercent(razones.MN)} de utilidad por cada unidad vendida.`}</td><td>Comparar con el sector y con periodos anteriores; revisar estructura de costos y gastos.</td></tr>
        <tr><td>ROA</td><td class="text-right font-mono">${razones.ROA == null ? 'N/D' : formatPercent(razones.ROA)}</td><td>${razones.ROA == null ? '—' : `La operación genera ${formatPercent(razones.ROA)} de utilidad sobre los activos empleados.`}</td><td>Relacionar con DuPont: margen × rotación. Un margen bajo con rotación alta puede ser normal según el modelo de negocio.</td></tr>
      </tbody>
    </table></div>`;
  const evolucionData = computeEvolucion(getPeriods());
  const evolucionHtml = evolucionData.length === 0 ? '' : `
    <h4 class="mb-2">Evolución entre periodos</h4>
    <div class="table-wrapper mb-6"><table>
      <thead><tr><th>Periodo</th><th>Indicador</th><th class="text-right">Anterior</th><th class="text-right">Actual</th><th>Evolución</th></tr></thead>
      <tbody>${evolucionData.map(e => {
        const celda = v => (typeof v === 'number' && Number.isFinite(v)
          ? (e.indicador.includes('%') ? formatPercent(v) : formatNumber(v)) : 'N/D');
        return `<tr>
        <td>${escapeHTML(e.periodo)}</td>
        <td>${e.indicador}</td>
        <td class="text-right font-mono">${celda(e.t1)}</td>
        <td class="text-right font-mono">${celda(e.t2)}</td>
        <td style="font-size:var(--font-size-sm)">${e.lectura}</td>
      </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  return niveles + evolucionHtml + hallazgos.map(h => `
    <div class="card mb-4">
      <div class="flex-gap mb-2"><span class="badge badge-warning">Hallazgo</span><strong>${h.hallazgo}</strong></div>
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-2) 0"><strong>Causa:</strong> ${h.causa}</p>
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-2) 0"><strong>Riesgo:</strong> ${h.riesgo}</p>
      <p style="font-size:var(--font-size-sm);color:var(--ink-primary);margin:var(--space-2) 0"><strong>Acción:</strong> ${h.accion}</p>
    </div>`).join('');
}

const METODOS_ANALISIS = {
  ah: 'Comparar cada cuenta entre periodos consecutivos: T2 − T1 y Δ / |T1|. Se conserva la convención actual para bases negativas. Una cuenta ausente no se trata como cero.',
  av: 'Dividir cada cuenta del balance entre el total de activos, y cada cuenta del estado de resultados entre las ventas netas. Los totales reportados se presentan sin volver a sumarlos. No se asigna base a una cuenta sin grupo.',
  razones: `Liquidez: AC / PC y (AC − inventario) / PC. Actividad: flujos / saldos promedio; plazos = ${DIAS_ANIO} / rotación exacta. Rentabilidad: UN / ventas, UN / activo promedio y UN / patrimonio promedio. La app exige ventas a crédito declaradas y deriva compras a crédito desde pagos a proveedores y ΔCxP: difiere del ejemplo docente que estima compras como 70 % del costo de ventas. No se inventan pagos para igualarlo.`,
  'cnt-cno': 'CNT = activo corriente − pasivo corriente. CNO = (CxC + inventario) − (CxP + provisiones), según la clasificación operativa actual de la app. Esta composición es una convención del sistema; no se atribuye al profesor una clasificación que el material no detalla.',
  eoaf: 'Comparar los balances de dos periodos. Un aumento de activo es aplicación; una disminución es origen. En pasivo y patrimonio se invierte la clasificación. Los totales son comprobaciones, no nuevos movimientos.',
  efe: 'Si hay un flujo documentado para el cierre se muestran su fuente, intervalo y movimientos. Sin ese documento se aplica el método indirecto: utilidad neta + ajustes no monetarios + cambios operativos; añadir inversión y financiamiento. Comprobar operación + inversión + financiamiento = efectivo final − inicial. La clase también desarrolla el método directo, disponible en Flujo de Efectivo. Su ejemplo no aporta balances y ER completos: este EFE no fue comparado con la clase.',
  dupont: 'DuPont, diapositivas 5–11: margen = UN / ventas; rotación = ventas / activo promedio; multiplicador = activo promedio / patrimonio promedio. ROA = margen × rotación. ROE = margen × rotación × multiplicador. Comprobar ambos contra las fórmulas directas, con precisión completa.',
  interpretacion: 'Relacionar resultado, causa posible, riesgo y acción. Los umbrales son referencias educativas configuradas por el equipo, no límites universales ni diagnósticos del profesor. N/D no permite concluir que un indicador es favorable.',
  mercado: 'UPA = (UN − DAP) / acciones comunes; P/U = precio / UPA; valor en libros por acción = patrimonio / acciones; rendimiento = dividendo por acción / precio. Requiere acciones, precio y dividendos acreditados. Es contenido adicional al alcance obligatorio de la guía.'
};

export function initAnalisis() {
  refreshSavedStates();
  const page = document.getElementById('page-analisis');
  if (!page) return;
  const periods = getPeriods();
  if (!periods.includes(selectedAnalysisPeriod)) selectedAnalysisPeriod = periods.at(-1) || null;
  const period = selectedAnalysisPeriod;
  const menu = [
    ['Comparar estados', [['ah', 'Horizontal (AH)'], ['av', 'Vertical (AV)']]],
    ['Rentabilidad y lectura', [['razones', 'Razones'], ['dupont', 'DuPont'], ['interpretacion', 'Interpretación'], ['mercado', 'Mercado']]],
    ['Capital y fondos', [['cnt-cno', 'CNT / CNO'], ['eoaf', 'Origen y aplicación'], ['efe', 'Flujo de efectivo']]]
  ];
  const contenidoPanel = (id, titulo, contenido) => `<h2>${titulo}</h2><details class="analisis-method"><summary>Ver método y criterios</summary><p>${METODOS_ANALISIS[id]}</p></details>${contenido}`;
  const panel = (id, titulo, contenido) => `<section class="tab-content analisis-panel${id === activeAnalysisTab ? ' active' : ''}" id="tab-${id}" aria-labelledby="analysis-tab-${id}">${contenidoPanel(id, titulo, contenido)}</section>`;
  const sinDatos = '<p class="analisis-empty">No hay datos para este periodo. <a href="#/estados">Cargue y guarde los estados financieros</a> para comenzar.</p>';
  const secciones = periodo => {
    const comparables = periodo ? periods.slice(0, periods.indexOf(periodo) + 1) : [];
    return [
      ['ah', 'Análisis Horizontal', renderAHSection(comparables)],
      ['av', 'Análisis Vertical', periodo ? renderAVSection(periodo) : sinDatos],
      ['razones', 'Razones Financieras', periodo ? renderRazonesSection(periodo) : sinDatos],
      ['cnt-cno', 'Capital Neto de Trabajo y Operativo', periodo ? renderCNTCNOSection(periodo) : sinDatos],
      ['eoaf', 'Estado de Origen y Aplicación de Fondos', renderEOAFSection(comparables)],
      ['efe', 'Estado de Flujo de Efectivo', periodo ? renderEFESection(periodo) : sinDatos],
      ['dupont', 'Modelo DuPont · ROA y ROE', periodo ? renderDuPontSection(periodo) : sinDatos],
      ['interpretacion', 'Interpretación de resultados', periodo ? renderInterpretacionSection(periodo) : sinDatos]
    ];
  };
  page.innerHTML = `<div class="analisis-workspace">
    <header class="page-header analisis-header"><div><h1 class="page-title">Análisis Financiero</h1><p class="page-subtitle">Compare sus estados, revise los cálculos y relacione los resultados.</p></div><a href="#/estados">Editar estados guardados →</a></header>
    ${avisoEstadosGuardados() ? `<p class="form-hint mb-4 text-danger">${escapeHTML(avisoEstadosGuardados())}</p>` : ''}
    <section class="analisis-context" aria-label="Datos analizados"><div><strong>${escapeHTML(savedCache?.name || 'Sin estados guardados')}</strong><p>Lectura de los datos guardados en Estados. Mercado conserva su comparación de todos los periodos.</p></div>
      <div><label class="form-label" for="analysisPeriod">Periodo de análisis</label><select class="form-select" id="analysisPeriod"${period ? '' : ' disabled'}>${periods.map(p => `<option value="${escapeHTML(p)}"${p === period ? ' selected' : ''}>${escapeHTML(p)}</option>`).join('') || '<option>Sin periodos</option>'}</select></div></section>
    <nav class="analisis-navigation" aria-label="Secciones del análisis">${menu.map(([grupo, opciones]) => `<div class="analisis-nav-group"><p>${grupo}</p><div class="tabs">${opciones.map(([id, nombre]) => `<button type="button" id="analysis-tab-${id}" class="tab-btn${activeAnalysisTab === id ? ' active' : ''}" data-tab="${id}" aria-controls="tab-${id}" aria-pressed="${activeAnalysisTab === id}">${nombre}</button>`).join('')}</div></div>`).join('')}</nav>
    ${secciones(period).map(fila => panel(...fila)).join('')}
    ${panel('mercado', 'Razones de Mercado', '<div id="mercadoContenido"></div>')}
    </div>`;

  const mercado = page.querySelector?.('#mercadoContenido');
  if (mercado) {
    mercadoUI(mercado, {
      estados: estadosGuardados(store.get('estados')),
      datos: store.get('razonesMercado'),
      dap: store.get('apalancamiento')?.dap || {},
      guardar: datos => store.setPersisted('razonesMercado', datos)
    });
  }
  const selector = page.querySelector?.('#analysisPeriod');
  if (selector) selector.onchange = event => {
    if (!periods.includes(event.target.value)) return;
    selectedAnalysisPeriod = event.target.value;
    // Mercado compara todos los periodos: conservar su DOM mantiene el borrador,
    // sus mensajes y los manejadores de Guardar, sin persistir entradas pendientes.
    for (const [id, titulo, contenido] of secciones(selectedAnalysisPeriod)) {
      const seccion = page.querySelector(`#tab-${id}`);
      if (seccion) seccion.innerHTML = contenidoPanel(id, titulo, contenido);
    }
  };
  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeAnalysisTab = btn.dataset.tab;
      page.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute?.('aria-pressed', 'false');
      });
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute?.('aria-pressed', 'true');
      page.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
}
