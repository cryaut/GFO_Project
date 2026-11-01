// Piezas comunes de las comprobaciones del EOAF y del EFE: lógica pura, sin DOM
// ni store. Los dos estados comparan dos balances y verifican una identidad
// (Σ orígenes = Σ aplicaciones; CFO + CFI + CFF = Δ efectivo), así que eligen el
// par de periodos, miden la variación de cada cuenta y toleran el redondeo de
// la misma manera. Un solo lugar evita que las reglas se separen con el tiempo.

import { formatCurrency } from '../../utils/format.js';
import { resolveAccountType } from '../estados/estados-calculations.js';
import { identificarCuenta, obtenerCuenta } from '../estados/cuentas-identificador.js';
import { ordenarPeriodos } from '../estados/estados-normalize.js';

// Un centavo, más el epsilon de coma flotante escalado a las magnitudes (misma
// regla que validateFinancialData). No se redistribuyen diferencias: si el
// estado no cuadra, se informa la cifra exacta.
export const TOLERANCIA_COMPROBACION = 0.01;

// Tolerancia efectiva para unos totales dados: los valores que no son números
// finitos (N/D) no cuentan para escalar el epsilon.
export function toleranciaComprobacion(...totales) {
  const mayor = totales.reduce(
    (max, valor) => (Number.isFinite(valor) ? Math.max(max, Math.abs(valor)) : max), 1
  );
  return TOLERANCIA_COMPROBACION + Number.EPSILON * mayor;
}

// Par de periodos a comparar. Sin `periodoFinal` son los dos más recientes en
// orden cronológico; con nombres sin año ("Marzo") se respeta el orden que dejó
// el usuario. Con `periodoFinal` (si está en la lista) se compara contra el
// inmediatamente anterior; si no está, se usan los dos más recientes.
export function seleccionarPeriodoPar(periodos, periodoFinal) {
  const lista = (Array.isArray(periodos) ? periodos : [])
    .filter(periodo => typeof periodo === 'string' && periodo.trim());
  if (lista.length < 2) {
    return {
      incompleto: `Se necesitan al menos 2 periodos para comparar y hay ${lista.length}. Capture o importe un periodo adicional en Estados Financieros.`
    };
  }
  const ordenados = ordenarPeriodos([...new Set(lista)]);
  if (ordenados.length < 2) {
    return { incompleto: 'Los periodos comparables no son distintos: no hay dos periodos diferentes para armar el estado.' };
  }
  const indice = ordenados.indexOf(periodoFinal);
  const indiceFinal = indice >= 0 ? indice : ordenados.length - 1;
  if (indiceFinal === 0) {
    return { incompleto: `No hay un periodo anterior a ${ordenados[0]} para compararlo. Capture o importe un periodo previo en Estados Financieros.` };
  }
  return {
    periodoInicial: ordenados[indiceFinal - 1],
    periodoFinal: ordenados[indiceFinal],
    periodos: ordenados
  };
}

// Id del catálogo de una fila: la identidad reconocida manda (la misma puerta
// que resolveAccountType); sin identidad guardada se identifica por nombre.
// Devuelve null cuando la cuenta no está reconocida.
function idDeCuenta(datos, grupo, cuenta) {
  const guardada = datos?.accountIdentities?.[grupo]?.[cuenta];
  if (guardada) return guardada.estado === 'reconocida' ? guardada.idCuenta : null;
  const inferida = identificarCuenta(cuenta, { grupo });
  return inferida.estado === 'reconocida' ? inferida.id : null;
}

// D-072: componentes del catálogo de cada total reportado del balance. Un total
// se excluye de las comprobaciones solo cuando alguna de sus componentes está
// en los datos: entonces la variación la explican ellas y el total duplicaría.
// Sin componentes, el total es el único dato de ese concepto y se conserva
// (por ejemplo un «Inventario» sin desglose). Las listas cubren las componentes
// brutas; la depreciación acumulada va en su propio renglón. La regla vive aquí
// y la usan `variacionesDeCuentas`, `totalGrupo`, el EOAF y el EFE (D-067).
export const COMPONENTES_TOTALES = {
  'bs.inventory_total': [
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods'
  ],
  'bs.current_assets_total': [
    'bs.cash_and_equivalents', 'bs.trade_receivables', 'bs.other_current_receivables',
    'bs.prepaid_expenses', 'bs.other_current_assets', 'bs.short_term_investments',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods'
  ],
  'bs.fixed_assets_net_total': [
    'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land', 'bs.ppe_machinery',
    'bs.ppe_other', 'bs.ppe_vehicles', 'bs.intangible_assets',
    'bs.other_noncurrent_assets', 'bs.long_term_investments'
  ],
  'bs.total_assets': [
    'bs.cash_and_equivalents', 'bs.trade_receivables', 'bs.other_current_receivables',
    'bs.prepaid_expenses', 'bs.other_current_assets', 'bs.short_term_investments',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods',
    'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land', 'bs.ppe_machinery',
    'bs.ppe_other', 'bs.ppe_vehicles', 'bs.intangible_assets',
    'bs.other_noncurrent_assets', 'bs.long_term_investments'
  ],
  'bs.current_liabilities_total': [
    'bs.trade_payables', 'bs.taxes_payable', 'bs.accrued_expenses_payable',
    'bs.current_provisions', 'bs.other_current_liabilities',
    'bs.short_term_borrowings', 'bs.current_portion_long_term_debt'
  ],
  'bs.total_liabilities': [
    'bs.trade_payables', 'bs.taxes_payable', 'bs.accrued_expenses_payable',
    'bs.current_provisions', 'bs.other_current_liabilities',
    'bs.short_term_borrowings', 'bs.current_portion_long_term_debt',
    'bs.long_term_borrowings', 'bs.long_term_provisions', 'bs.other_noncurrent_liabilities'
  ],
  'bs.total_equity': [
    'bs.share_capital', 'bs.additional_paid_in_capital', 'bs.retained_earnings',
    'bs.current_year_result_equity', 'bs.legal_reserve', 'bs.other_reserves',
    'bs.other_equity_components'
  ]
};

// ¿El id es un total reportado cuya variación ya explican sus componentes
// presentes en los datos? Los ids presentes son los del mismo grupo.
export function esTotalDuplicado(id, idsPresentes) {
  if (!id || obtenerCuenta(id)?.rol !== 'reported_total') return false;
  return (COMPONENTES_TOTALES[id] || []).some(cid => idsPresentes.has(cid));
}

// Variación de cada cuenta de un grupo del balance ('activos', 'pasivos' o
// 'patrimonio') entre dos periodos, con su tipo. Primero van las cuentas del
// periodo inicial y después las que solo aparecen en el final. Un saldo ausente
// o que no es un número finito queda en `null` (dato faltante): nunca se
// completa con 0 ni se suma como texto.
export function variacionesDeCuentas(datos, grupo, periodoInicial, periodoFinal) {
  const cuentasInicial = datos?.balanceGeneral?.[periodoInicial]?.[grupo] || {};
  const cuentasFinal = datos?.balanceGeneral?.[periodoFinal]?.[grupo] || {};
  const saldoDe = (cuentas, cuenta) =>
    (Object.hasOwn(cuentas, cuenta) && Number.isFinite(cuentas[cuenta]) ? cuentas[cuenta] : null);
  const nombres = [
    ...Object.keys(cuentasInicial),
    ...Object.keys(cuentasFinal).filter(nombre => !Object.hasOwn(cuentasInicial, nombre))
  ];
  const filas = nombres.map(cuenta => {
    const saldoInicial = saldoDe(cuentasInicial, cuenta);
    const saldoFinal = saldoDe(cuentasFinal, cuenta);
    return {
      cuenta,
      grupo,
      id: idDeCuenta(datos, grupo, cuenta),
      tipo: resolveAccountType(datos, grupo, cuenta) || '',
      saldoInicial,
      saldoFinal,
      variacion: saldoInicial !== null && saldoFinal !== null ? saldoFinal - saldoInicial : null
    };
  });
  const idsPresentes = new Set(filas.map(fila => fila.id).filter(Boolean));
  return filas.filter(fila => !esTotalDuplicado(fila.id, idsPresentes));
}

function totalGrupo(datos, bg, grupo) {
  const cuentas = bg[grupo] || {};
  const ids = Object.keys(cuentas).map(nombre => idDeCuenta(datos, grupo, nombre));
  const idsPresentes = new Set(ids.filter(Boolean));
  return Object.keys(cuentas).reduce((suma, nombre, i) => {
    if (esTotalDuplicado(ids[i], idsPresentes)) return suma;
    const valor = cuentas[nombre];
    return Number.isFinite(valor) ? suma + valor : suma;
  }, 0);
}

// Avisos cuando un balance no cumple A = P + O. Las dos comprobaciones dependen
// de esa identidad: sin el aviso, un descuadre del balance aparecería como un
// error del estado. D-072: los totales reportados con componentes en los datos
// no suman (duplicarían a sus componentes).
export function advertenciasDeBalance(datos, periodos, bgInicial, bgFinal) {
  const advertencias = [];
  for (const [etiqueta, bg] of [[periodos.inicial, bgInicial], [periodos.final, bgFinal]]) {
    const descuadre = totalGrupo(datos, bg, 'activos') - totalGrupo(datos, bg, 'pasivos') - totalGrupo(datos, bg, 'patrimonio');
    if (Math.abs(descuadre) > TOLERANCIA_COMPROBACION) {
      advertencias.push(`El balance del periodo ${etiqueta} no cumple A = P + O (diferencia de ${formatCurrency(descuadre)}); esa diferencia se refleja en la comprobación.`);
    }
  }
  return advertencias;
}
