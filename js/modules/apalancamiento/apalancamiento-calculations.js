// Derivación del apalancamiento desde los estados financieros guardados.
// Lógica pura: sin DOM, window ni store; recibe los estados y la configuración como parámetros.
// Plan y reglas: docs/planificacion/apalancamiento/03-datos-y-derivacion.md.
import { computeFinancialTotals, resolveAccountType } from '../estados/estados-calculations.js';
import {
  TASA_IR_DEFECTO, tasaEfectiva, tasaImpuesto, denominadorGaf,
  gao, gaf, gat, gaoVariacion, gafVariacion, gatVariacion
} from '../../utils/calculate.js';

// Cuentas que forman la UAII y se clasifican como fijas o variables.
export const TIPOS_OPERATIVOS = ['costoVentas', 'gastosAdmin', 'gastosVentas'];
export const COMPORTAMIENTOS = ['variable', 'fijo', 'mixto'];
// Diferencia relativa entre el GAO por variación y el estructural que dispara el aviso
// 'estructura-cambio'. Referencia educativa, como UMBRALES en Análisis.
export const UMBRAL_CAMBIO_ESTRUCTURA = 0.10;

const TOLERANCIA_CONTROL = 0.005;
const GRADOS_ND = Object.freeze({ gao: null, gaf: null, gat: null });

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

// Devuelve { tipo, pctVariable } con pctVariable en [0, 1], o null si el comportamiento es inválido.
export function normalizarComportamiento(valor) {
  if (!valor || typeof valor !== 'object') return null;
  if (valor.tipo === 'variable') return { tipo: 'variable', pctVariable: 1 };
  if (valor.tipo === 'fijo') return { tipo: 'fijo', pctVariable: 0 };
  if (valor.tipo === 'mixto' && esNumero(valor.pctVariable)
    && valor.pctVariable >= 0 && valor.pctVariable <= 1) {
    return { tipo: 'mixto', pctVariable: valor.pctVariable };
  }
  return null;
}

// Cuentas operativas del estado de resultados de cualquier periodo, sin repetir.
export function cuentasOperativas(estados) {
  const vistas = new Map();
  for (const periodo of estados?.periods || []) {
    for (const nombre of Object.keys(estados.estadoResultados?.[periodo] || {})) {
      if (vistas.has(nombre)) continue;
      const tipo = resolveAccountType(estados, 'estadoResultados', nombre);
      if (TIPOS_OPERATIVOS.includes(tipo)) vistas.set(nombre, { nombre, tipo });
    }
  }
  return [...vistas.values()];
}

// Sugerencia por tipo (D-004): el resto lo elige el usuario.
export function sugerirComportamiento(tipo) {
  if (tipo === 'costoVentas') return 'variable';
  if (tipo === 'gastosAdmin') return 'fijo';
  return null;
}

// Comportamiento de cada cuenta: el guardado si es válido; si no, la sugerencia (D-009).
export function resolverComportamiento(cuentas, guardado = {}) {
  return cuentas.map(({ nombre, tipo }) => {
    const propio = guardado && Object.hasOwn(guardado, nombre)
      ? normalizarComportamiento(guardado[nombre]) : null;
    if (propio) return { nombre, tipo, comportamiento: propio, origen: 'guardado' };
    const sugerido = sugerirComportamiento(tipo);
    return sugerido
      ? { nombre, tipo, comportamiento: normalizarComportamiento({ tipo: sugerido }), origen: 'sugerido' }
      : { nombre, tipo, comportamiento: null, origen: null };
  });
}

function cuentasDeTipo(estados, er, tipos) {
  return Object.entries(er)
    .filter(([nombre]) => tipos.includes(resolveAccountType(estados, 'estadoResultados', nombre)))
    .map(([nombre, importe]) => ({ nombre, importe }));
}

function variablesVacias() {
  return {
    ventas: null, cv: null, cf: null, mc: null, uaii: null, oi: null, og: null, i: null,
    uai: null, ir: null, t: null, origenT: null, un: null, dap: null, udac: null, denominadorGaf: null
  };
}

// Todas las variables del diccionario del paso 01 para un periodo, con su traza y lo que falta.
export function derivarPeriodo(estados, periodo, config = {}, cuentasResueltas = null) {
  const er = estados.estadoResultados?.[periodo] || {};
  const totales = computeFinancialTotals(estados, periodo);
  const faltantes = totales.unclassified
    .filter(cuenta => cuenta.group === 'estadoResultados')
    .map(cuenta => ({ tipo: 'sinClasificacion', cuenta: cuenta.name }));
  if (faltantes.length || totales.utilidadNeta === null) {
    return { periodo, variables: variablesVacias(), grados: { ...GRADOS_ND }, traza: [], faltantes };
  }

  const resueltas = cuentasResueltas
    || resolverComportamiento(cuentasOperativas(estados), config.comportamiento);
  const porNombre = new Map(resueltas.map(cuenta => [cuenta.nombre, cuenta]));

  // CV y CF cuenta por cuenta; una mixta reparte su importe según pctVariable.
  const trazaCV = [];
  const trazaCF = [];
  let cv = 0;
  let cf = 0;
  let operativo = 0;
  for (const { nombre, importe } of cuentasDeTipo(estados, er, TIPOS_OPERATIVOS)) {
    operativo += importe;
    const cuenta = porNombre.get(nombre);
    if (!cuenta?.comportamiento) {
      faltantes.push({ tipo: 'sinComportamiento', cuenta: nombre });
      continue;
    }
    const { tipo, pctVariable } = cuenta.comportamiento;
    const detalle = { nombre, comportamiento: tipo, origen: cuenta.origen };
    cv += importe * pctVariable;
    cf += importe * (1 - pctVariable);
    if (pctVariable > 0) trazaCV.push({ ...detalle, importe: importe * pctVariable });
    if (pctVariable < 1) trazaCF.push({ ...detalle, importe: importe * (1 - pctVariable) });
  }
  const costosClasificados = !faltantes.some(f => f.tipo === 'sinComportamiento');
  if (costosClasificados && Math.abs(cv + cf - operativo) >= TOLERANCIA_CONTROL) {
    throw new Error(`Control CV + CF distinto de los costos operativos en ${periodo}`);
  }
  if (!costosClasificados) { cv = null; cf = null; }

  const ventas = totales.ventas;
  const uaii = ventas - totales.costoVentas - totales.gastosAdmin - totales.gastosVentas;
  const oi = totales.otrosIngresos;
  const og = totales.otrosGastos;
  const i = totales.intereses;
  const uai = uaii + oi - og - i;
  const cuentasIR = cuentasDeTipo(estados, er, ['impuestos']);
  // Sin cuenta de impuestos el IR es desconocido (null), no 0: se usa la tasa por defecto.
  const ir = cuentasIR.length ? totales.impuestos : null;
  const tasaDefecto = config.tasaDefecto ?? TASA_IR_DEFECTO;
  const t = tasaImpuesto(ir, uai, tasaDefecto);
  const origenT = tasaEfectiva(ir, uai) !== null ? 'efectiva' : (t !== null ? 'defecto' : null);
  const un = totales.utilidadNeta;

  const dapGuardado = config.dap && Object.hasOwn(config.dap, periodo) ? config.dap[periodo] : 0;
  const dap = esNumero(dapGuardado) && dapGuardado >= 0 ? dapGuardado : null;
  if (dap === null) faltantes.push({ tipo: 'dapInvalido', periodo });
  const udac = dap === null ? null : un - dap;
  const mc = cv === null ? null : ventas - cv;

  const variables = {
    ventas, cv, cf, mc, uaii, oi, og, i, uai, ir, t, origenT, un, dap, udac,
    denominadorGaf: dap === null ? null : denominadorGaf(uai, dap, t)
  };
  const grados = {
    gao: gao(mc, uaii),
    gaf: dap === null ? null : gaf(uaii, uai, dap, t),
    gat: dap === null ? null : gat(mc, uai, dap, t)
  };

  const fila = (concepto, valor, formula, cuentas = []) => ({ concepto, valor, formula, cuentas });
  const formulaT = { efectiva: 'IR / UAI (tasa efectiva)', defecto: 'Tasa por defecto' }[origenT]
    || 'Sin tasa válida';
  const traza = [
    fila('Ventas', ventas, 'Suma de las cuentas de ventas', cuentasDeTipo(estados, er, ['ventas'])),
    fila('CV', cv, 'Suma de la parte variable de los costos operativos', trazaCV),
    fila('CF', cf, 'Suma de la parte fija de los costos operativos', trazaCF),
    fila('MC', mc, 'Ventas − CV'),
    fila('UAII', uaii, 'Ventas − costo de ventas − gastos de administración − gastos de ventas'),
    fila('OI', oi, 'Suma de otros ingresos', cuentasDeTipo(estados, er, ['otrosIngresos'])),
    fila('OG', og, 'Suma de otros gastos', cuentasDeTipo(estados, er, ['otrosGastos'])),
    fila('I', i, 'Suma de gastos financieros', cuentasDeTipo(estados, er, ['intereses'])),
    fila('UAI', uai, 'UAII + OI − OG − I'),
    fila('IR', ir, ir === null ? 'Sin cuenta de impuestos' : 'Suma de impuestos', cuentasIR),
    fila('T', t, formulaT),
    fila('UN', un, 'UAI − IR'),
    fila('DAP', dap, 'Dato del usuario (0 si no se informa)'),
    fila('UDAC', udac, 'UN − DAP'),
    fila('GAO', grados.gao, 'MC / UAII'),
    fila('GAF', grados.gaf, 'UAII / (UAI − DAP / (1 − T))'),
    fila('GAT', grados.gat, 'MC / (UAI − DAP / (1 − T))')
  ];
  return { periodo, variables, grados, traza, faltantes };
}

function difiereEstructura(variacion, estructural) {
  if (!esNumero(variacion) || !esNumero(estructural) || estructural === 0) return false;
  return Math.abs(variacion - estructural) / Math.abs(estructural) > UMBRAL_CAMBIO_ESTRUCTURA;
}

// Grados por periodo, por variación entre periodos consecutivos y advertencias con código.
export function calcularApalancamiento(estados, config = {}) {
  const cuentas = resolverComportamiento(cuentasOperativas(estados), config.comportamiento);
  const periodos = (estados?.periods || [])
    .map(periodo => derivarPeriodo(estados, periodo, config, cuentas));

  const variaciones = [];
  for (let k = 1; k < periodos.length; k++) {
    const base = periodos[k - 1];
    const actual = periodos[k];
    const vb = base.variables;
    const va = actual.variables;
    variaciones.push({
      desde: base.periodo,
      hasta: actual.periodo,
      gao: gaoVariacion(vb.ventas, va.ventas, vb.uaii, va.uaii),
      gaf: gafVariacion(vb.uaii, va.uaii, vb.udac, va.udac),
      gat: gatVariacion(vb.ventas, va.ventas, vb.udac, va.udac),
      estructuralBase: { ...base.grados }
    });
  }

  const advertencias = [];
  const sugeridas = cuentas.filter(c => c.origen === 'sugerido').map(c => c.nombre);
  if (sugeridas.length) advertencias.push({ codigo: 'clasificacion-sugerida', cuentas: sugeridas });
  const sinComportamiento = cuentas.filter(c => !c.comportamiento).map(c => c.nombre);
  if (sinComportamiento.length) advertencias.push({ codigo: 'sin-comportamiento', cuentas: sinComportamiento });
  for (const { periodo, variables: v } of periodos) {
    if (esNumero(v.uaii) && v.uaii < 0) advertencias.push({ codigo: 'bajo-equilibrio-operativo', periodo });
    if (esNumero(v.denominadorGaf) && v.denominadorGaf < -TOLERANCIA_CONTROL) {
      advertencias.push({ codigo: 'bajo-equilibrio-financiero', periodo });
    }
    // T solo interviene si hay DAP; sin DAP el aviso sería ruido.
    if (v.origenT === 'defecto' && v.dap > 0) advertencias.push({ codigo: 'tasa-por-defecto', periodo });
  }
  for (const variacion of variaciones) {
    if (difiereEstructura(variacion.gao, variacion.estructuralBase.gao)) {
      advertencias.push({
        codigo: 'estructura-cambio', desde: variacion.desde, hasta: variacion.hasta,
        gaoVariacion: variacion.gao, gaoEstructural: variacion.estructuralBase.gao
      });
    }
  }
  return { periodos, variaciones, cuentas, advertencias };
}
