import { monedaDe } from '../../utils/moneda.js';
// Piezas comunes de las comprobaciones del EOAF y del EFE: lógica pura, sin DOM
// ni store. Los dos estados comparan dos balances y verifican una identidad
// (Σ orígenes = Σ aplicaciones; CFO + CFI + CFF = Δ efectivo), así que eligen el
// par de periodos, miden la variación de cada cuenta y toleran el redondeo de
// la misma manera. Un solo lugar evita que las reglas se separen con el tiempo.

import { formatCurrency as monedaBase } from '../../utils/format.js';
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

// D-101 reemplaza la selección de D-072: se usa el detalle solo cuando su suma
// acredita el total. En caso contrario se conserva el reportado, sin sumar sus
// componentes otra vez. Los activos fijos netos incluyen la depreciación con
// su signo. EOAF, EFE y comprobación del balance comparten esta selección.
export const COMPONENTES_TOTALES = {
  'bs.inventory_total': [
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods'
  ],
  'bs.current_assets_total': [
    'bs.inventory_total',
    'bs.cash_and_equivalents', 'bs.trade_receivables', 'bs.other_current_receivables',
    'bs.prepaid_expenses', 'bs.other_current_assets', 'bs.short_term_investments',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods'
  ],
  'bs.fixed_assets_net_total': [
    'bs.accumulated_depreciation',
    'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land', 'bs.ppe_machinery',
    'bs.ppe_other', 'bs.ppe_vehicles'
  ],
  'bs.total_assets': [
    'bs.current_assets_total', 'bs.fixed_assets_net_total', 'bs.inventory_total', 'bs.accumulated_depreciation',
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
    'bs.current_liabilities_total',
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

// Consulta estructural conservada por compatibilidad: indica solapamiento de
// ids, no que el detalle acredite el importe. La selección financiera compara
// saldos en cuentasDelBalance; no depende de este predicado.
export function esTotalDuplicado(id, idsPresentes) {
  if (!id || obtenerCuenta(id)?.rol !== 'reported_total') return false;
  return (COMPONENTES_TOTALES[id] || []).some(cid => idsPresentes.has(cid));
}

// Una cuenta reportada puede ser el único saldo de un concepto. La lectura
// reúne ambas representaciones sin modificar el documento ni inventar ceros.
function cuentasDelBalance(datos, grupo, periodo, bg = datos?.balanceGeneral?.[periodo]) {
  const cuentas = bg?.[grupo] || {};
  const filas = new Map();
  for (const [cuenta, saldo] of Object.entries(cuentas)) {
    const id = idDeCuenta(datos, grupo, cuenta);
    const reportada = obtenerCuenta(id)?.rol === 'reported_total';
    const clave = reportada ? `id:${id}` : cuenta;
    const duplicada = filas.has(clave);
    filas.set(clave, { cuenta, id, tipo: resolveAccountType(datos, grupo, cuenta) || (reportada ? 'totalReportado' : ''),
      saldo: duplicada ? null : saldo, duplicada });
  }
  for (const [id, reportado] of Object.entries(datos?.reportedTotals?.[periodo] || {})) {
    const meta = obtenerCuenta(id);
    if (meta?.grupo !== grupo || meta.rol !== 'reported_total' || reportado.grupo !== grupo) continue;
    const clave = `id:${id}`, previa = filas.get(clave);
    // Si se recibe una doble representación contradictoria, no se elige un
    // importe en silencio. El normalizador habitual ya rechaza esos archivos.
    filas.set(clave, { cuenta: reportado.nombre, id, tipo: meta.tipoApp || 'totalReportado',
      saldo: previa && (previa.duplicada || previa.saldo !== reportado.importe) ? null : reportado.importe });
  }
  // Del menor concepto al mayor: inventario -> corriente -> total del activo.
  const totales = [...filas].filter(([, f]) => COMPONENTES_TOTALES[f.id])
    .sort(([, a], [, b]) => COMPONENTES_TOTALES[a.id].length - COMPONENTES_TOTALES[b.id].length);
  const mixtos = new Set(['bs.current_assets_total', 'bs.total_assets', 'bs.fixed_assets_net_total', 'bs.current_liabilities_total', 'bs.total_liabilities']);
  for (const [clave, fila] of totales) {
    if (!filas.has(clave)) continue;
    const componentes = [...filas].filter(([, f]) => COMPONENTES_TOTALES[fila.id].includes(f.id));
    const suma = componentes.reduce((s, [, f]) => s + (Number.isFinite(f.saldo) ? f.saldo : NaN), 0);
    const completo = componentes.length && Number.isFinite(fila.saldo) && Number.isFinite(suma)
      && Math.abs(suma - fila.saldo) <= toleranciaComprobacion(suma, fila.saldo);
    if (completo) filas.delete(clave);
    else {
      // Un desglose parcial no sustituye el total. Se conserva el importe
      // acreditado y se excluyen sus componentes para no duplicar cantidades.
      for (const [hija] of componentes) filas.delete(hija);
      fila.detalleNoComprobable = componentes.length > 0;
      fila.requiereDesglose = mixtos.has(fila.id);
    }
  }
  return filas;
}

// Variación de cada cuenta de un grupo del balance ('activos', 'pasivos' o
// 'patrimonio') entre dos periodos, con su tipo. Primero van las cuentas del
// periodo inicial y después las que solo aparecen en el final. Un saldo ausente
// o que no es un número finito queda en `null` (dato faltante): nunca se
// completa con 0 ni se suma como texto.
export function variacionesDeCuentas(datos, grupo, periodoInicial, periodoFinal) {
  const cuentasInicial = cuentasDelBalance(datos, grupo, periodoInicial);
  const cuentasFinal = cuentasDelBalance(datos, grupo, periodoFinal);
  const saldoDe = (cuentas, cuenta) => Number.isFinite(cuentas.get(cuenta)?.saldo) ? cuentas.get(cuenta).saldo : null;
  const nombres = [
    ...cuentasInicial.keys(),
    ...[...cuentasFinal.keys()].filter(nombre => !cuentasInicial.has(nombre))
  ];
  return nombres.map(clave => {
    const inicial = cuentasInicial.get(clave), final = cuentasFinal.get(clave);
    const fila = final || inicial;
    const saldoInicial = saldoDe(cuentasInicial, clave);
    const saldoFinal = saldoDe(cuentasFinal, clave);
    return {
      cuenta: fila.cuenta,
      grupo,
      id: fila.id,
      tipo: fila.tipo,
      requiereDesglose: Boolean(inicial?.requiereDesglose || final?.requiereDesglose),
      saldoInicial,
      saldoFinal,
      variacion: saldoInicial !== null && saldoFinal !== null ? saldoFinal - saldoInicial : null
    };
  });
}

function totalGrupo(datos, bg, grupo, periodo) {
  return [...cuentasDelBalance(datos, grupo, periodo, bg).values()]
    .reduce((suma, fila) => Number.isFinite(fila.saldo) ? suma + fila.saldo : NaN, 0);
}

// Avisos cuando un balance no cumple A = P + O. Las dos comprobaciones dependen
// de esa identidad: sin el aviso, un descuadre del balance aparecería como un
// error del estado. D-072: los totales reportados con componentes en los datos
// no suman (duplicarían a sus componentes).
export function advertenciasDeBalance(datos, periodos, bgInicial, bgFinal) {
  const formatCurrency = v => monedaBase(v, monedaDe(datos));
  const advertencias = [];
  for (const [etiqueta, bg] of [[periodos.inicial, bgInicial], [periodos.final, bgFinal]]) {
    const descuadre = totalGrupo(datos, bg, 'activos', etiqueta) - totalGrupo(datos, bg, 'pasivos', etiqueta) - totalGrupo(datos, bg, 'patrimonio', etiqueta);
    if (Math.abs(descuadre) > TOLERANCIA_COMPROBACION) {
      advertencias.push(`El balance del periodo ${etiqueta} no cumple A = P + O (diferencia de ${formatCurrency(descuadre)}); esa diferencia se refleja en la comprobación.`);
    }
    for (const grupo of ['activos', 'pasivos', 'patrimonio']) for (const fila of cuentasDelBalance(datos, grupo, etiqueta, bg).values()) {
      if (fila.detalleNoComprobable) advertencias.push(`El total reportado «${fila.cuenta}» de ${etiqueta} se conserva porque el detalle disponible no permite comprobarlo; no se suman ambos.`);
    }
  }
  return advertencias;
}
