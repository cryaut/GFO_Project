// Piezas comunes de las comprobaciones del EOAF y del EFE: lógica pura, sin DOM
// ni store. Los dos estados comparan dos balances y verifican una identidad
// (Σ orígenes = Σ aplicaciones; CFO + CFI + CFF = Δ efectivo), así que eligen el
// par de periodos, miden la variación de cada cuenta y toleran el redondeo de
// la misma manera. Un solo lugar evita que las reglas se separen con el tiempo.

import { formatCurrency } from '../../utils/format.js';
import { resolveAccountType } from '../estados/estados-calculations.js';
import { identificarCuenta } from '../estados/cuentas-identificador.js';
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
  return nombres.map(cuenta => {
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
}

function totalGrupo(bg, grupo) {
  return Object.values(bg[grupo] || {}).reduce(
    (suma, valor) => (Number.isFinite(valor) ? suma + valor : suma), 0
  );
}

// Avisos cuando un balance no cumple A = P + O. Las dos comprobaciones dependen
// de esa identidad: sin el aviso, un descuadre del balance aparecería como un
// error del estado.
export function advertenciasDeBalance(periodos, bgInicial, bgFinal) {
  const advertencias = [];
  for (const [etiqueta, bg] of [[periodos.inicial, bgInicial], [periodos.final, bgFinal]]) {
    const descuadre = totalGrupo(bg, 'activos') - totalGrupo(bg, 'pasivos') - totalGrupo(bg, 'patrimonio');
    if (Math.abs(descuadre) > TOLERANCIA_COMPROBACION) {
      advertencias.push(`El balance del periodo ${etiqueta} no cumple A = P + O (diferencia de ${formatCurrency(descuadre)}); esa diferencia se refleja en la comprobación.`);
    }
  }
  return advertencias;
}
