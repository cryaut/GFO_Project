import { normalizeFinancialData } from '../estados/estados-normalize.js';
import { ESPECIFICACION_RAZONES } from './especificacion-razones.js';
import { crearEntradaRazones, calcularRazones, calcularRazon, revisarEntradaRazones } from './razones-motor.js';

const numero = valor => typeof valor === 'number' && Number.isFinite(valor);
const noDisponible = motivo => ({ valor:null, metodo:'not_applicable', motivos:[motivo] });

// La normalización estructural existente valida el documento. Sus inferencias
// de etiquetas no acreditan identidades nuevas para el motor (D-049).
function normalizarConIdentidadesGuardadas(datos) {
  const origen = datos?.balanceGeneral && datos?.estadoResultados ? datos : datos?.estados;
  const normalizados = normalizeFinancialData(datos);
  for (const [grupo, identidades] of Object.entries(normalizados.accountIdentities)) {
    for (const [clave, identidad] of Object.entries(identidades)) {
      if (Object.hasOwn(origen.accountIdentities?.[grupo] || {}, clave)) continue;
      // Un total reportado se acredita por su id explícito, no por el texto.
      const reportadoPorId = Object.values(origen.reportedTotals || {}).some(totales =>
        Object.entries(totales).some(([id, total]) => id === identidad.idCuenta && total.nombre === clave));
      if (reportadoPorId) continue;
      identidades[clave] = { idCuenta:null, estado:'no_reconocida', metodo:null, candidatos:[], origen:'legado' };
      if (normalizados.accountTypes[grupo] && !Object.hasOwn(origen.accountTypes?.[grupo] || {}, clave)) {
        normalizados.accountTypes[grupo][clave] = '';
      }
    }
  }
  return normalizados;
}

export function crearContextoRazonesGuardadas(datos, periodo) {
  let normalizados;
  try {
    normalizados = normalizarConIdentidadesGuardadas(datos);
  } catch (error) {
    return { datos:null, entrada:null, fallo:{ codigo:'documento_no_normalizable', periodo, detalle:error.message } };
  }
  if (!normalizados.periods.includes(periodo)) {
    return { datos:normalizados, entrada:null, fallo:{ codigo:'periodo_no_disponible', periodo } };
  }
  const indice = normalizados.periods.indexOf(periodo);
  const anterior = indice > 0 ? normalizados.periods[indice - 1] : null;
  const origen = datos.balanceGeneral && datos.estadoResultados ? datos : datos.estados;
  const composicion = normalizados.composicionIngresos || origen.composicionIngresos || {};
  const entrada = crearEntradaRazones(normalizados, periodo, { composicionIngresos:{
    current:composicion[periodo] ?? 'sin_declarar',
    previous:anterior === null ? 'sin_declarar' : composicion[anterior] ?? 'sin_declarar'
  } });
  return { datos:normalizados, entrada, fallo:null };
}

function motivoComposicion(error, entrada) {
  const faltante = /^is\.nonoperating_income: falta declarar composición excluye_intereses para (current|previous); no se infiere de nombres ni importes\.$/.exec(error.message);
  if (faltante) return { codigo:'composicion_no_declarada', id:'is.nonoperating_income', periodo:faltante[1] };
  if (error.message === 'is.nonoperating_income: entrada inválida; otros ingresos ya incluye intereses (D-051 opción A).') {
    const periodo = ['current', 'previous'].find(token => entrada.composicionIngresos[token] === 'incluye_intereses'
      && entrada.cuentas.some(fila => fila.id === 'is.nonoperating_income' && numero(fila[token]))) || 'current';
    return { codigo:'composicion_incluye_intereses', id:'is.nonoperating_income', periodo };
  }
  return null;
}

// Solo los dos errores contractuales de D-056 se convierten a N/D. Un error
// inesperado del intérprete conserva su excepción para que se investigue.
export function evaluarConComposicion(operacion, entrada) {
  try {
    return operacion();
  } catch (error) {
    const motivo = motivoComposicion(error, entrada);
    if (!motivo) throw error;
    return noDisponible(motivo);
  }
}

export function calcularMotorDesdeDatos(datos, periodo, opciones = {}) {
  const contexto = crearContextoRazonesGuardadas(datos, periodo);
  const ids = Object.keys(ESPECIFICACION_RAZONES);
  if (contexto.fallo) return { ...contexto, motor:{
    razones:Object.fromEntries(ids.map(id => [id,noDisponible(contexto.fallo)])), revision:[]
  } };
  const { entrada } = contexto;
  try {
    return { ...contexto, motor:calcularRazones(entrada, opciones) };
  } catch (error) {
    if (!motivoComposicion(error, entrada)) throw error;
    // El error de una razón no invalida las que dependen de otras cuentas.
    return { ...contexto, motor:{ razones:Object.fromEntries(ids.map(id => [id,
      evaluarConComposicion(() => calcularRazon(id, entrada, opciones), entrada)
    ])), revision:revisarEntradaRazones(entrada) } };
  }
}
