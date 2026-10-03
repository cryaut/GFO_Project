import store from '../../store.js';
import { mercadoUI } from './mercado-ui.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/format.js';
import { escapeHTML } from '../../utils/html.js';
import {
  ahDelta, ahPctDelta, av, ratioCorriente, ratioRapido,
  rotacionInventario, rotacionCxC, plazoCobro, endeudamiento,
  margenNeto, roa, dupont, capitalNetoTrabajo, capitalNetoOperativo,
  eoaf, efeIndirecto, saldoPromedio,
  pruebaDefensiva, rotacionActivos, rotacionCxP, plazoPago, edadInventario,
  cicloConversion, coberturaIntereses, deudaPatrimonio, apalancamiento,
  margenBruto, margenOperativo, roe,
  rotacionActivosFijos, rotacionCapitalTrabajo, solvencia
} from '../../utils/calculate.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { normalizeFinancialData, sortPeriods } from '../estados/estados-normalize.js';

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

function getSavedStates() {
  const accountTypes = store.get('estados.accountTypes');
  const data = {
    name: store.get('estados.name') || 'Datos guardados',
    periods: store.get('estados.periods') || [],
    balanceGeneral: store.get('estados.balanceGeneral') || {},
    estadoResultados: store.get('estados.estadoResultados') || {},
    accountTypes: accountTypes && typeof accountTypes === 'object' ? accountTypes : undefined
  };
  // Data saved before this refactor may lack accountTypes; classify defensively.
  return normalizeFinancialData(data);
}

let savedCache = null;
let savedPeriods = [];
// Exportada: Reportes refresca la caché antes de reutilizar computeRazones para
// que el dashboard no lea estados guardados de una navegación anterior.
export function refreshSavedStates() {
  try {
    savedCache = getSavedStates();
    savedPeriods = savedCache.periods;
  } catch {
    // Unsaved/legacy data without valid classification: analysis degrades to
    // the fixed-name readers instead of crashing the whole section.
    savedCache = null;
    const raw = store.get('estados.periods');
    savedPeriods = Array.isArray(raw) ? sortPeriods(raw) : [];
  }
  return savedCache;
}

function totalsFor(period) {
  const states = savedCache || refreshSavedStates();
  if (!states || !states.periods.includes(period)) return null;
  return computeFinancialTotals(states, period);
}


function getERData(period) {
  const shared = totalsFor(period);
  if (shared) {
    return {
      ventas: shared.ventas, costoVentas: shared.costoVentas,
      gastosAdmin: shared.gastosAdmin, gastosVentas: shared.gastosVentas,
      otrosIngresos: shared.otrosIngresos, otrosGastos: shared.otrosGastos,
      intereses: shared.intereses, impuestos: shared.impuestos,
      utilidadNeta: shared.utilidadNeta
    };
  }
  // Datos sin clasificación válida: lectura por nombres fijos.
  const er = store.get('estados.estadoResultados')?.[period] || {};
  const ventas = er['Ventas'] || 0;
  const costoVentas = er['Costo de Ventas'] || 0;
  const gastosAdmin = er['Gastos de Administracion'] || 0;
  const gastosVentas = er['Gastos de Ventas'] || 0;
  const otrosIngresos = er['Otros Ingresos'] || 0;
  const otrosGastos = er['Otros Gastos'] || 0;
  const intereses = er['Gastos por Intereses'] || 0;
  const impuestos = er['Impuestos'] || 0;
  return {
    ventas, costoVentas, gastosAdmin, gastosVentas, otrosIngresos, otrosGastos,
    intereses, impuestos,
    utilidadNeta: ventas - costoVentas - gastosAdmin - gastosVentas +
      otrosIngresos - otrosGastos - intereses - impuestos
  };
}

function getBGData(period) {
  const shared = totalsFor(period);
  if (shared) {
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
  const bg = store.get('estados.balanceGeneral')?.[period] || {};
  const activos = bg.activos || {};
  const pasivos = bg.pasivos || {};
  const patrimonio = bg.patrimonio || {};

  const efectivo = activos['Efectivo'] || 0;
  const cxC = activos['Cuentas por Cobrar'] || 0;
  const inventario = activos['Inventario'] || 0;
  const activosCorrientesOtros = activos['Activos Corrientes Otros'] || 0;
  const activosCorrientes = efectivo + cxC + inventario + activosCorrientesOtros;

  const cuentasPorPagar = pasivos['Cuentas por Pagar'] || 0;
  const pasivoCortoPlazo = pasivos['Pasivo Corto Plazo'] || 0;
  const provisiones = pasivos['Provisiones'] || 0;
  const pasivosCorrientes = cuentasPorPagar + pasivoCortoPlazo + provisiones;

  const totalActivos = Object.values(activos).reduce((s, v) => s + v, 0);
  const totalPasivos = Object.values(pasivos).reduce((s, v) => s + v, 0);
  const totalPatrimonio = Object.values(patrimonio).reduce((s, v) => s + v, 0);

  return {
    efectivo, cxC, inventario, activosCorrientesOtros, activosCorrientes,
    cuentasPorPagar, pasivoCortoPlazo, provisiones, pasivosCorrientes,
    totalActivos, totalPasivos, totalPatrimonio,
    activosFijos: totalActivos - activosCorrientes
  };
}

function getPeriods() {
  if (!savedCache) refreshSavedStates();
  if (savedPeriods.length) return savedPeriods;
  const raw = store.get('estados.periods');
  return Array.isArray(raw) ? sortPeriods(raw) : [];
}

function getPrevPeriod(period) {
  const periods = getPeriods();
  const idx = periods.indexOf(period);
  return idx > 0 ? periods[idx - 1] : null;
}

// Presencia de una cuenta por tipo en un periodo: distingue "cuenta ausente"
// (dato faltante) de "cuenta con importe 0". Sin estados normalizados no se
// puede saber → se asume presente (modo degradado, sin cambiar su comportamiento).
function cuentaPresente(period, group, tipo) {
  const states = savedCache || refreshSavedStates();
  if (!states) return true;
  const cuentas = states.balanceGeneral?.[period]?.[group];
  if (!cuentas) return false;
  const tipos = states.accountTypes?.[group] || {};
  return Object.keys(cuentas).some(nombre => tipos[nombre] === tipo);
}

function grupoPresente(period, group) {
  const states = savedCache || refreshSavedStates();
  if (!states) return true;
  const cuentas = states.balanceGeneral?.[period]?.[group];
  return !!cuentas && Object.keys(cuentas).length > 0;
}

export function computeAVBalanceGeneral(period) {
  const bg = getBGData(period);
  const ta = bg.totalActivos;
  const raw = store.get('estados.balanceGeneral')?.[period] || {};
  const rows = [];
  for (const [k, v] of Object.entries(raw.activos || {})) {
    rows.push({ cuenta: k, valor: v, pctBase: ta === 0 ? null : av(v, ta), tipo: 'Activo', base: 'Total Activos' });
  }
  for (const [k, v] of Object.entries(raw.pasivos || {})) {
    rows.push({ cuenta: k, valor: v, pctBase: ta === 0 ? null : av(v, ta), tipo: 'Pasivo', base: 'Total Activos' });
  }
  for (const [k, v] of Object.entries(raw.patrimonio || {})) {
    rows.push({ cuenta: k, valor: v, pctBase: ta === 0 ? null : av(v, ta), tipo: 'Patrimonio', base: 'Total Activos' });
  }
  return { rows, base: 'Total Activos', baseValor: ta };
}

export function computeAVEstadoResultados(period) {
  const er = getERData(period);
  const ventas = er.ventas;
  const items = [
    ['Ventas', er.ventas],
    ['Costo de Ventas', er.costoVentas],
    ['Gastos de Administracion', er.gastosAdmin],
    ['Gastos de Ventas', er.gastosVentas],
    ['Otros Ingresos', er.otrosIngresos],
    ['Otros Gastos', er.otrosGastos],
    ['Utilidad Neta', er.utilidadNeta]
  ];
  const rows = items.map(([cuenta, valor]) => ({
    cuenta, valor,
    pctBase: ventas === 0 ? null : av(valor, ventas),
    base: 'Ventas'
  }));
  return { rows, base: 'Ventas', baseValor: ventas };
}

// Public AV aggregate: the `av.js` shell re-exports this name.
export function computeAV(period) {
  return {
    balanceGeneral: computeAVBalanceGeneral(period),
    estadoResultados: computeAVEstadoResultados(period)
  };
}

export function computeRazones(period) {
  const bg = getBGData(period);
  const er = getERData(period);
  const prev = getPrevPeriod(period);
  const bgPrev = prev ? getBGData(prev) : null;
  const hayDosPeriodos = !!bgPrev;

  // Resuelve el valor de una cuenta/tipo en un periodo: null si la cuenta no
  // existe (dato faltante, no un saldo de 0).
  const resolve = (p, data, campo, group, tipo) => {
    const presente = tipo ? cuentaPresente(p, group, tipo) : grupoPresente(p, group);
    return presente ? data[campo] : null;
  };
  // Promedio de dos periodos. Reglas: dato ausente en cualquier lado → null;
  // un solo periodo → saldo final (metodología documentada del proyecto).
  const promedio = (inicial, final) => {
    if (final === null) return null;
    if (!hayDosPeriodos) return saldoPromedio(undefined, final);
    if (inicial === null) return null;
    return saldoPromedio(inicial, final);
  };
  const prom = (campo, group, tipo) => promedio(
    hayDosPeriodos ? resolve(prev, bgPrev, campo, group, tipo) : undefined,
    resolve(period, bg, campo, group, tipo)
  );

  const invActual = resolve(period, bg, 'inventario', 'activos', 'inventario');
  const invPrevio = hayDosPeriodos
    ? resolve(prev, bgPrev, 'inventario', 'activos', 'inventario')
    : undefined;
  const invProm = promedio(invPrevio, invActual);
  const cxcProm = prom('cxC', 'activos', 'cxC');
  const activoProm = prom('totalActivos', 'activos');
  const patrimonioProm = prom('totalPatrimonio', 'patrimonio');
  const cxpProm = prom('cuentasPorPagar', 'pasivos', 'cuentasPorPagar');

  const RC = ratioCorriente(bg.activosCorrientes, bg.pasivosCorrientes);
  const RR = ratioRapido(bg.activosCorrientes, bg.inventario, bg.pasivosCorrientes);
  const RotInv = rotacionInventario(er.costoVentas, invProm);
  // El modelo de datos no separa las ventas a crédito: se usan las ventas totales, como el
  // plazo de cobro de Gitman (CxC / ventas diarias). Con ventas a crédito sería más preciso.
  const RotCxC = rotacionCxC(er.ventas, cxcProm);
  const PPC = plazoCobro(RotCxC);
  const End = endeudamiento(bg.totalPasivos, bg.totalActivos);
  const MN = margenNeto(er.utilidadNeta, er.ventas);
  const ROA = roa(er.utilidadNeta, activoProm);
  // Compras = Costo de Ventas + Inventario Final − Inventario Inicial (periodo
  // previo). Sin inventario comparable se aproxima con el costo de ventas, como
  // documenta la metodología del proyecto; compras negativas son datos rotos.
  let compras = er.costoVentas;
  if (hayDosPeriodos && invActual !== null && invPrevio !== null) {
    compras = er.costoVentas + invActual - invPrevio;
  }
  const comprasValidas = compras >= 0 ? compras : null;
  const RotCxP = rotacionCxP(comprasValidas, cxpProm);
  const usaComprasReales = hayDosPeriodos && invActual !== null && invPrevio !== null
    && compras >= 0;
  const utilidadOperativa = er.ventas - er.costoVentas - er.gastosAdmin - er.gastosVentas;
  const hayVentas = er.ventas !== 0 || er.costoVentas !== 0;
  const extra = {
    pruebaDefensiva: pruebaDefensiva(bg.efectivo, bg.pasivosCorrientes),
    rotacionActivos: rotacionActivos(er.ventas, activoProm),
    rotacionCxP: RotCxP,
    plazoPago: plazoPago(RotCxP),
    edadInventario: edadInventario(RotInv),
    cicloConversion: cicloConversion(PPC, RotInv, RotCxP),
    coberturaIntereses: coberturaIntereses(utilidadOperativa, er.intereses),
    deudaPatrimonio: deudaPatrimonio(bg.totalPasivos, bg.totalPatrimonio),
    apalancamiento: apalancamiento(activoProm, patrimonioProm),
    margenBruto: margenBruto(hayVentas ? er.ventas - er.costoVentas : 0, er.ventas),
    margenOperativo: margenOperativo(hayVentas ? er.ventas - er.costoVentas : 0, er.gastosAdmin, er.gastosVentas, er.ventas),
    roe: roe(er.utilidadNeta, patrimonioProm),
    rotacionActivosFijos: rotacionActivosFijos(er.ventas, bg.activosFijos),
    rotacionCapitalTrabajo: rotacionCapitalTrabajo(er.ventas, bg.activosCorrientes - bg.pasivosCorrientes),
    solvencia: solvencia(bg.totalActivos, bg.totalPasivos)
  };

  return {
    RC, RR, RotInv, RotCxC, PPC, endeudamiento: End, MN, ROA,
    ...extra,
    usaPromedios: hayDosPeriodos,
    usaComprasReales,
    invProm, cxcProm, activoProm, patrimonioProm,
    denominadores: {
      RC: bg.pasivosCorrientes,
      RR: bg.pasivosCorrientes,
      RotInv: invProm,
      RotCxC: cxcProm,
      End: bg.totalActivos,
      MN: er.ventas,
      ROA: activoProm,
      pruebaDefensiva: bg.pasivosCorrientes,
      rotacionActivos: activoProm,
      rotacionCxP: cxpProm,
      plazoPago: RotCxP,
      edadInventario: RotInv,
      cicloConversion: 1,
      coberturaIntereses: er.intereses,
      deudaPatrimonio: bg.totalPatrimonio,
      apalancamiento: patrimonioProm,
      margenBruto: er.ventas,
      margenOperativo: er.ventas,
      roe: patrimonioProm,
      rotacionActivosFijos: bg.activosFijos,
      rotacionCapitalTrabajo: bg.activosCorrientes - bg.pasivosCorrientes,
      solvencia: bg.totalPasivos
    }
  };
}

export function computeDuPont(period) {
  const r = computeRazones(period);
  const dp = dupont(
    getERData(period).utilidadNeta,
    getERData(period).ventas,
    r.activoProm,
    r.patrimonioProm
  );
  return { ...dp, activoProm: r.activoProm, patrimonioProm: r.patrimonioProm, usaPromedios: r.usaPromedios };
}

export function computeCNTCNO(period) {
  const bg = getBGData(period);
  const CNT = capitalNetoTrabajo(bg.activosCorrientes, bg.pasivosCorrientes);
  const activosCorrientesOps = bg.cxC + bg.inventario;
  const pasivosCorrientesOps = bg.cuentasPorPagar + bg.provisiones;
  const CNO = capitalNetoOperativo(activosCorrientesOps, pasivosCorrientesOps);
  return {
    CNT, CNO, activosCorrientesOps, pasivosCorrientesOps,
    excluidosAC: bg.efectivo + bg.activosCorrientesOtros,
    excluidosPC: bg.pasivoCortoPlazo
  };
}

export function computeEFE(period) {
  const er = getERData(period);
  const prev = getPrevPeriod(period);

  if (!prev) {
    return {
      CFO: er.utilidadNeta, utilidadNeta: er.utilidadNeta,
      ajustes: [], tieneVariaciones: false,
      aviso: 'Se necesitan dos periodos para calcular las variaciones reales del método indirecto. Se muestra solo la Utilidad Neta.'
    };
  }

  const bgT1 = getBGData(prev);
  const bgT2 = getBGData(period);

  const dInv = bgT2.inventario - bgT1.inventario;
  const dCxC = bgT2.cxC - bgT1.cxC;
  const dPasOp = (bgT2.cuentasPorPagar + bgT2.provisiones) -
    (bgT1.cuentasPorPagar + bgT1.provisiones);

  const ajustes = [
    { concepto: '(-) Aumento de Inventario', monto: -dInv },
    { concepto: '(-) Aumento de Cuentas por Cobrar', monto: -dCxC },
    { concepto: '(+) Aumento de Pasivos Operativos (CxP + Provisiones)', monto: dPasOp }
  ];

  const CFO = efeIndirecto(er.utilidadNeta, ajustes.map(a => a.monto));
  return { CFO, utilidadNeta: er.utilidadNeta, ajustes, tieneVariaciones: true };
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
  let html = '<p class="text-muted" style="font-size:var(--font-size-sm)">Variación % = Δ / |valor T1|. Si el periodo base es 0, la variación porcentual no está definida y se muestra N/D.</p>';
  for (const ah of ahData) {
    html += `<h4 class="mb-2">${escapeHTML(ah.periodo)}</h4>
      <div class="table-wrapper mb-6"><table>
        <thead><tr><th>Cuenta</th><th class="text-right">Periodo T1</th><th class="text-right">Periodo T2</th><th class="text-right">Δ</th><th class="text-right">%Δ</th></tr></thead>
        <tbody>${ah.rows.map(r => `<tr>
          <td>${escapeHTML(r.cuenta)}</td>
          <td class="text-right font-mono">${formatCurrency(r.t1)}</td>
          <td class="text-right font-mono">${formatCurrency(r.t2)}</td>
          <td class="text-right font-mono ${r.delta < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(r.delta)}</td>
          <td class="text-right font-mono">${r.pctDelta === null ? 'N/D' : formatPercent(r.pctDelta)}</td>
        </tr>`).join('')}</tbody>
      </table></div>`;
  }
  return html;
}

export function computeAH(periods) {
  const results = [];
  for (let i = 1; i < periods.length; i++) {
    const t1 = getBGData(periods[i - 1]);
    const t2 = getBGData(periods[i]);
    const cuentas = [
      { nombre: 'Activos Corrientes', v1: t1.activosCorrientes, v2: t2.activosCorrientes },
      { nombre: 'Inventario', v1: t1.inventario, v2: t2.inventario },
      { nombre: 'CxC', v1: t1.cxC, v2: t2.cxC },
      { nombre: 'Total Activos', v1: t1.totalActivos, v2: t2.totalActivos },
      { nombre: 'Pasivos Corrientes', v1: t1.pasivosCorrientes, v2: t2.pasivosCorrientes },
      { nombre: 'Total Pasivos', v1: t1.totalPasivos, v2: t2.totalPasivos },
      { nombre: 'Patrimonio', v1: t1.totalPatrimonio, v2: t2.totalPatrimonio }
    ];
    const rows = cuentas.map(c => ({
      cuenta: c.nombre, t1: c.v1, t2: c.v2,
      delta: ahDelta(c.v2, c.v1), pctDelta: ahPctDelta(c.v2, c.v1)
    }));
    results.push({ periodo: `${periods[i - 1]} → ${periods[i]}`, rows });
  }
  return results;
}

function renderAVTable(avData, titulo) {
  return `<h4>${titulo}</h4>
    <p class="text-muted" style="font-size:var(--font-size-sm)">Base utilizada: <strong>${avData.base}</strong> = ${formatCurrency(avData.baseValor)}</p>
    <div class="table-wrapper mb-6"><table>
      <thead><tr><th>Cuenta</th><th class="text-right">Valor</th><th class="text-right">% Base</th></tr></thead>
      <tbody>${avData.rows.map(r => `<tr>
        <td>${escapeHTML(r.cuenta)}</td>
        <td class="text-right font-mono">${formatCurrency(r.valor)}</td>
        <td class="text-right font-mono">${r.pctBase === null ? 'N/D (base = 0)' : formatPercent(r.pctBase)}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function renderAVSection(period) {
  const bgAv = computeAVBalanceGeneral(period);
  const erAv = computeAVEstadoResultados(period);
  return renderAVTable(bgAv, 'Análisis Vertical — Balance General') +
    renderAVTable(erAv, 'Análisis Vertical — Estado de Resultados');
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
  const fuenteCxP = r.usaComprasReales
    ? `compras${r.usaPromedios ? ' / CxP promedio' : ''}`
    : `costo de ventas (aprox.)${r.usaPromedios ? ' / CxP promedio' : ''}`;
  const items = [
    ['Liquidez', '', '', ''],
    ['Ratio Corriente', val(r.RC, formatNumber, d.RC, 'el pasivo corriente', 'la liquidez corriente'), badgeSiHay(r.RC, r.RC >= UMBRALES.ratioCorrienteMin)],
    ['Ratio Rápido', val(r.RR, formatNumber, d.RR, 'el pasivo corriente', 'la prueba ácida'), badgeSiHay(r.RR, r.RR >= UMBRALES.ratioRapidoMin)],
    ['Prueba Defensiva', r.pruebaDefensiva == null ? 'N/D' : formatNumber(r.pruebaDefensiva), 'badge-info'],
    ['Actividad', '', '', ''],
    [`Rotación Inventario${r.usaPromedios ? ' (inv. promedio)' : ''}`, val(r.RotInv, formatNumber, d.RotInv, 'el inventario', 'la rotación de inventario'), 'badge-info'],
    ['Edad del Inventario (días)', r.edadInventario == null ? 'N/D' : formatNumber(r.edadInventario, 0), 'badge-info'],
    [`Rotación CxC (ventas totales${r.usaPromedios ? ' / CxC promedio' : ''})`, val(r.RotCxC, formatNumber, d.RotCxC, 'las CxC', 'la rotación de CxC'), 'badge-info'],
    ['Plazo Cobro (días)', r.PPC == null ? 'N/D' : formatNumber(r.PPC, 0), 'badge-info'],
    [`Rotación de Cuentas por Pagar (${fuenteCxP})`, r.rotacionCxP == null ? 'N/D' : formatNumber(r.rotacionCxP), 'badge-info'],
    ['Plazo Pago (días)', r.plazoPago == null ? 'N/D' : formatNumber(r.plazoPago, 0), 'badge-info'],
    ['Ciclo de Conversión (días)', r.cicloConversion == null ? 'N/D' : formatNumber(r.cicloConversion, 0), badgeSiHay(r.cicloConversion, r.cicloConversion <= UMBRALES.cicloConversionMaxDias)],
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
    : 'Con un solo periodo se usan saldos finales. Ingrese dos periodos para usar promedios.';
  const notaCreditos = r.RotCxC == null
    ? ''
    : 'Rotación CxC y plazo de cobro con ventas totales: el modelo de datos no separa las ventas a crédito; con ellas el resultado sería más preciso.';
  return `<p class="text-muted mb-4" style="font-size:var(--font-size-sm)">${notaPromedios}</p>
  ${notaCreditos ? `<p class="text-muted mb-4" style="font-size:var(--font-size-sm)">${notaCreditos}</p>` : ''}
  <div class="kpi-grid">${items.map(([label, value, badgeClass]) => {
    if (!value) return `<div class="kpi-card" style="grid-column:1/-1"><div class="kpi-label font-bold">${label}</div></div>`;
    const esError = value.startsWith('No se puede calcular');
    return `<div class="kpi-card"><div class="kpi-value" style="${esError ? 'font-size:var(--font-size-sm);color:var(--ink-danger)' : ''}">${value}</div><div class="kpi-label">${label}</div>${!esError && badgeClass && badgeClass !== 'badge-info' ? `<span class="badge ${badgeClass}" style="margin-top:var(--space-2)">${etiqueta(badgeClass)}</span>` : ''}</div>`;
  }).join('')}</div>`;
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

export function computeEOAF(periods) {
  if (periods.length < 2) return [];
  const t1 = getBGData(periods[0]);
  const t2 = getBGData(periods[1]);
  const items = [
    { cuenta: 'Activos Corrientes', cambio: t2.activosCorrientes - t1.activosCorrientes, tipo: 'activo' },
    { cuenta: 'Inventario', cambio: t2.inventario - t1.inventario, tipo: 'activo' },
    { cuenta: 'Total Activos', cambio: t2.totalActivos - t1.totalActivos, tipo: 'activo' },
    { cuenta: 'Pasivos Corrientes', cambio: t2.pasivosCorrientes - t1.pasivosCorrientes, tipo: 'pasivo' },
    { cuenta: 'Total Pasivos', cambio: t2.totalPasivos - t1.totalPasivos, tipo: 'pasivo' },
    { cuenta: 'Patrimonio', cambio: t2.totalPatrimonio - t1.totalPatrimonio, tipo: 'pasivo' }
  ];
  return items.map(i => eoaf(i.cuenta, i.cambio, i.tipo)).filter(Boolean);
}

function renderEOAFSection(periods) {
  const items = computeEOAF(periods);
  if (items.length === 0) return '<p class="text-muted">Se necesitan al menos 2 periodos.</p>';
  return `<div class="table-wrapper"><table>
    <thead><tr><th>Cuenta</th><th class="text-right">Cambio</th><th>Clasificación</th><th class="text-right">Monto</th></tr></thead>
    <tbody>${items.map(r => `<tr>
      <td>${escapeHTML(r.cuenta)}</td>
      <td class="text-right font-mono ${r.cambio < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(r.cambio)}</td>
      <td><span class="badge ${r.clasificacion === 'Origen' ? 'badge-success' : 'badge-primary'}">${r.clasificacion}</span></td>
      <td class="text-right font-mono">${formatCurrency(r.monto)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderEFESection(period) {
  const efe = computeEFE(period);
  let filasAjustes = '';
  if (efe.tieneVariaciones) {
    filasAjustes = `<div class="table-wrapper mb-4"><table>
      <thead><tr><th>Ajuste (variación real entre periodos)</th><th class="text-right">Monto</th></tr></thead>
      <tbody>
        <tr><td>Utilidad Neta</td><td class="text-right font-mono">${formatCurrency(efe.utilidadNeta)}</td></tr>
        ${efe.ajustes.map(a => `<tr><td>${a.concepto}</td><td class="text-right font-mono ${a.monto < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(a.monto)}</td></tr>`).join('')}
        <tr><td><strong>Flujo de Efectivo Operativo</strong></td><td class="text-right font-mono"><strong>${formatCurrency(efe.CFO)}</strong></td></tr>
      </tbody>
    </table></div>`;
  }
  return `${efe.aviso ? `<div class="card mb-4" style="border-left:4px solid var(--color-warning)"><p style="margin:0;font-size:var(--font-size-sm)">${efe.aviso}</p></div>` : ''}
  <div class="kpi-grid mb-4">
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(efe.CFO)}</div><div class="kpi-label">Flujo de Efectivo Operativo</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(efe.utilidadNeta)}</div><div class="kpi-label">Utilidad Neta</div></div>
  </div>
  ${filasAjustes}
  <p class="text-muted" style="font-size:var(--font-size-sm)">Método indirecto: UN − aumentos de activos operativos (Inventario, CxC) + aumentos de pasivos operativos (CxP, Provisiones), usando variaciones reales entre el periodo actual y el anterior.</p>`;
}

function renderDuPontSection(period) {
  const dp = computeDuPont(period);
  const fmtProm = v => v == null ? 'N/D' : formatCurrency(v);
  const notaPromedios = dp.usaPromedios
    ? `Activo promedio = ${fmtProm(dp.activoProm)} · Patrimonio promedio = ${fmtProm(dp.patrimonioProm)} ((inicial + final) / 2)`
    : `Un solo periodo disponible: se usan saldos finales (Activo = ${fmtProm(dp.activoProm)}, Patrimonio = ${fmtProm(dp.patrimonioProm)}). Ingrese dos periodos para promediar.`;
  return `<div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-value">${dp.PM == null ? 'N/D' : formatPercent(dp.PM)}</div><div class="kpi-label">Margen Neto (PM)</div></div>
    <div class="kpi-card"><div class="kpi-value">${dp.AT == null ? 'N/D' : formatNumber(dp.AT)}</div><div class="kpi-label">Rotación Activos (AT)</div></div>
    <div class="kpi-card"><div class="kpi-value">${dp.EM == null ? 'N/D' : formatNumber(dp.EM)}</div><div class="kpi-label">Multiplicador (EM)</div></div>
    <div class="kpi-card" style="border-color:var(--ink-primary)"><div class="kpi-value" style="color:var(--ink-primary)">${dp.ROE == null ? 'N/D' : formatPercent(dp.ROE)}</div><div class="kpi-label font-bold">ROE = PM × AT × EM</div></div>
  </div>
  <p class="text-muted mt-4" style="font-size:var(--font-size-sm)">${notaPromedios}</p>
  <div class="card" style="border-left:4px solid var(--color-primary)">
    <p style="margin:0;font-size:var(--font-size-sm);color:var(--text-secondary)">
      <strong>Lectura integrada:</strong> un ROE alto no implica por sí mismo buena salud financiera.
      Identifique qué componente lo impulsa: PM alto (rentabilidad), AT alta (eficiencia en el uso de activos)
      o EM alto (apalancamiento, que también amplifica el riesgo).
    </p>
  </div>`;
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
    <div class="card mb-4" style="border-left:4px solid var(--color-warning)">
      <div class="flex-gap mb-2"><span class="badge badge-warning">Hallazgo</span><strong>${h.hallazgo}</strong></div>
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-2) 0"><strong>Causa:</strong> ${h.causa}</p>
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-2) 0"><strong>Riesgo:</strong> ${h.riesgo}</p>
      <p style="font-size:var(--font-size-sm);color:var(--ink-primary);margin:var(--space-2) 0"><strong>Acción:</strong> ${h.accion}</p>
    </div>`).join('');
}

export function initAnalisis() {
  refreshSavedStates();
  const page = document.getElementById('page-analisis');
  if (!page) return;

  const periods = getPeriods();

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Análisis Financiero</h1>
      <p class="page-subtitle">AH, AV, Razones, CNT/CNO, EOAF, EFE, DuPont, Interpretación y razones de mercado</p>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="ah">AH</button>
      <button class="tab-btn" data-tab="av">AV</button>
      <button class="tab-btn" data-tab="razones">Razones</button>
      <button class="tab-btn" data-tab="cnt-cno">CNT/CNO</button>
      <button class="tab-btn" data-tab="eoaf">EOAF</button>
      <button class="tab-btn" data-tab="efe">EFE</button>
      <button class="tab-btn" data-tab="dupont">DuPont</button>
      <button class="tab-btn" data-tab="interpretacion">Interpretación</button>
      <button class="tab-btn" data-tab="mercado">Mercado</button>
    </div>
    <div class="tab-content active" id="tab-ah">
      <h3 class="mb-4">Análisis Horizontal</h3>
      ${renderAHSection(periods)}
    </div>
    <div class="tab-content" id="tab-av">
      <h3 class="mb-4">Análisis Vertical (último periodo)</h3>
      ${periods.length > 0 ? renderAVSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-razones">
      <h3 class="mb-4">Razones Financieras (último periodo)</h3>
      ${periods.length > 0 ? renderRazonesSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-cnt-cno">
      <h3 class="mb-4">Capital Neto de Trabajo y Operativo</h3>
      ${periods.length > 0 ? renderCNTCNOSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-eoaf">
      <h3 class="mb-4">Estado de Origen y Aplicación de Fondos</h3>
      ${renderEOAFSection(periods)}
    </div>
    <div class="tab-content" id="tab-efe">
      <h3 class="mb-4">Estado de Flujo de Efectivo (Método Indirecto)</h3>
      ${periods.length > 0 ? renderEFESection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-dupont">
      <h3 class="mb-4">Modelo DuPont (3 pasos)</h3>
      ${periods.length > 0 ? renderDuPontSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-interpretacion">
      <h3 class="mb-4">Interpretación Heurística</h3>
      ${periods.length > 0 ? renderInterpretacionSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-mercado">
      <h3 class="mb-4">Razones de Mercado</h3>
      <div id="mercadoContenido"></div>
    </div>`;

  // Razones de mercado: datos de acciones propios; UN y patrimonio de los estados; DAP de Apalancamiento.
  const mercado = page.querySelector?.('#mercadoContenido');
  if (mercado) {
    mercadoUI(mercado, {
      estados: estadosGuardados(store.get('estados')),
      datos: store.get('razonesMercado'),
      dap: store.get('apalancamiento')?.dap || {},
      guardar: datos => store.setPersisted('razonesMercado', datos)
    });
  }

  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      page.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
}
