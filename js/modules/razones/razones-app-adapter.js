import { apalancamiento, pruebaDefensiva, rotacionCapitalTrabajo, saldoPromedio, solvencia } from '../../utils/calculate.js';
import { ESPECIFICACION_RAZONES } from './especificacion-razones.js';
import { evaluarDerivado } from './razones-motor.js';
import { calcularMotorDesdeDatos, crearContextoRazonesGuardadas, evaluarConComposicion } from './razones-app-entrada.js';

// Contrato app → id del motor (las 20 razones, sin duplicar sus fórmulas):
// RC → liquidez_razon_corriente; RR → liquidez_prueba_acida;
// RotInv → actividad_rotacion_inventarios; RotCxC → actividad_rotacion_cuentas_por_cobrar;
// PPC → actividad_periodo_promedio_cobro; endeudamiento → endeudamiento_razon_deuda_total;
// MN → rentabilidad_margen_utilidad_neta; ROA → rentabilidad_roa; roe → rentabilidad_roe;
// margenBruto → rentabilidad_margen_utilidad_bruta; margenOperativo → rentabilidad_margen_utilidad_operativa;
// coberturaIntereses → endeudamiento_cobertura_interes; deudaPatrimonio → endeudamiento_razon_deuda_patrimonio;
// cicloConversion → actividad_ciclo_conversion_efectivo; edadInventario → actividad_edad_promedio_inventario;
// plazoPago → actividad_periodo_promedio_pago; rotacionActivosFijos → actividad_rotacion_activos_fijos;
// rotacionCxP → actividad_rotacion_cuentas_por_pagar; rotacionActivos → actividad_rotacion_activos_totales;
// capitalNetoTrabajo → liquidez_capital_trabajo_neto (aditiva; conserva las 31 claves anteriores).
export const MAPA_RAZONES_APP = Object.freeze({
  RC:'liquidez_razon_corriente', RR:'liquidez_prueba_acida',
  RotInv:'actividad_rotacion_inventarios', RotCxC:'actividad_rotacion_cuentas_por_cobrar',
  PPC:'actividad_periodo_promedio_cobro', endeudamiento:'endeudamiento_razon_deuda_total',
  MN:'rentabilidad_margen_utilidad_neta', ROA:'rentabilidad_roa', roe:'rentabilidad_roe',
  margenBruto:'rentabilidad_margen_utilidad_bruta', margenOperativo:'rentabilidad_margen_utilidad_operativa',
  coberturaIntereses:'endeudamiento_cobertura_interes', deudaPatrimonio:'endeudamiento_razon_deuda_patrimonio',
  cicloConversion:'actividad_ciclo_conversion_efectivo', edadInventario:'actividad_edad_promedio_inventario',
  plazoPago:'actividad_periodo_promedio_pago', rotacionActivosFijos:'actividad_rotacion_activos_fijos',
  rotacionCxP:'actividad_rotacion_cuentas_por_pagar', rotacionActivos:'actividad_rotacion_activos_totales',
  capitalNetoTrabajo:'liquidez_capital_trabajo_neto'
});

const CAMPOS_DENOMINADOR = {
  RC:'RC', RR:'RR', RotInv:'RotInv', RotCxC:'RotCxC', End:'endeudamiento', MN:'MN', ROA:'ROA',
  rotacionActivos:'rotacionActivos', rotacionCxP:'rotacionCxP', plazoPago:'plazoPago',
  edadInventario:'edadInventario', coberturaIntereses:'coberturaIntereses', deudaPatrimonio:'deudaPatrimonio',
  margenBruto:'margenBruto', margenOperativo:'margenOperativo', roe:'roe', rotacionActivosFijos:'rotacionActivosFijos'
};
const EXTRAS = ['pruebaDefensiva','rotacionCapitalTrabajo','apalancamiento','solvencia'];
const numero = valor => typeof valor === 'number' && Number.isFinite(valor);
const deduplicar = motivos => [...new Map(motivos.map(motivo => [JSON.stringify(motivo),motivo])).values()];

function traducirMotivos(campo, resultado, entrada, periodo) {
  return resultado.motivos.map(motivo => ({ campo,
    periodo:motivo.periodo === 'previous' ? entrada?.periodos.anterior ?? periodo
      : motivo.periodo === 'current' ? entrada?.periodos.actual ?? periodo : motivo.periodo ?? periodo,
    motivo:motivo.codigo,
    operandos:motivo.id ? [motivo.id] : motivo.camposAfectados || (motivo.ruta ? [motivo.ruta] : [])
  }));
}

// Consulta un nodo ya escrito en el JSON como un derivado temporal. El árbol
// original y el modo de periodo se conservan; el intérprete realiza la lectura.
function crearConsultas(entrada, opciones) {
  const cache = new Map();
  return (razon, nodo) => {
    const clave = `${razon}:${JSON.stringify(nodo)}`;
    if (cache.has(clave)) return cache.get(clave);
    const doc = ESPECIFICACION_RAZONES[razon];
    const consulta = 'derived.app_consulta';
    const especificacion = { ...ESPECIFICACION_RAZONES, [razon]:{ ...doc,
      derivados:[...doc.derivados,{ id:consulta, kind:'balance', formula:nodo }]
    } };
    const resultado = evaluarConComposicion(() => evaluarDerivado(razon, consulta, entrada, opciones, especificacion), entrada);
    cache.set(clave, resultado);
    return resultado;
  };
}

function evaluarExtra(calcular, operandos) {
  const motivos = operandos.flatMap(operando => operando.motivos);
  if (operandos.some(operando => !numero(operando.valor))) return { valor:null, motivos:deduplicar(motivos) };
  const valor = calcular(...operandos.map(operando => operando.valor));
  return { valor, motivos:valor === null ? [...motivos,{ codigo:'zero_denominator' }] : motivos };
}

function salidaNoDisponible(contexto, periodo) {
  const campos = [...Object.keys(MAPA_RAZONES_APP),...EXTRAS];
  const motivo = { valor:null, motivos:[contexto.fallo] };
  return { ...Object.fromEntries(campos.map(campo => [campo,null])),
    usaPromedios:false, usaComprasReales:false, invProm:null, cxcProm:null, activoProm:null, patrimonioProm:null,
    notAvailableReasons:campos.flatMap(campo => traducirMotivos(campo, motivo, null, periodo)),
    denominadores:Object.fromEntries([...Object.keys(CAMPOS_DENOMINADOR),...EXTRAS,'cicloConversion'].map(campo => [campo,null]))
  };
}

export function computarRazonesDesdeDatos(datos, periodo, opciones = {}) {
  const contexto = calcularMotorDesdeDatos(datos, periodo, opciones);
  if (contexto.fallo) return salidaNoDisponible(contexto, periodo);
  const { entrada, motor } = contexto;
  const resultados = Object.fromEntries(Object.entries(MAPA_RAZONES_APP).map(([campo,id]) => [campo,motor.razones[id]]));
  const consultar = crearConsultas(entrada, opciones);
  const derivado = (razon, id, token = 'current') => consultar(razon, { op:'derived', id, period:token });
  const cuenta = (razon, id, token = 'current') => consultar(razon, { op:'account', id, period:token });
  const anterior = entrada.periodos.anterior !== null;
  const promedio = (actual, previo) => !anterior ? actual : evaluarExtra(saldoPromedio, [previo,actual]);
  const inventario = derivado(MAPA_RAZONES_APP.RotInv, 'derived.inventory_total');
  const inventarioPrevio = anterior ? derivado(MAPA_RAZONES_APP.RotInv, 'derived.inventory_total', 'previous') : null;
  const activos = derivado(MAPA_RAZONES_APP.endeudamiento, 'derived.total_assets');
  const pasivos = derivado(MAPA_RAZONES_APP.endeudamiento, 'derived.total_liabilities');
  const patrimonio = derivado(MAPA_RAZONES_APP.roe, 'derived.total_equity');
  const pasivoCorriente = derivado(MAPA_RAZONES_APP.RC, 'derived.current_liabilities');
  const ventas = derivado(MAPA_RAZONES_APP.MN, 'derived.net_sales');
  const efectivo = cuenta(MAPA_RAZONES_APP.RC, 'bs.cash_and_equivalents');
  const invProm = promedio(inventario, inventarioPrevio);
  const cxcProm = promedio(cuenta(MAPA_RAZONES_APP.RotCxC, 'bs.trade_receivables'),
    anterior ? cuenta(MAPA_RAZONES_APP.RotCxC, 'bs.trade_receivables', 'previous') : null);
  const activoProm = promedio(activos,
    anterior ? derivado(MAPA_RAZONES_APP.endeudamiento, 'derived.total_assets', 'previous') : null);
  const patrimonioProm = promedio(patrimonio,
    anterior ? derivado(MAPA_RAZONES_APP.roe, 'derived.total_equity', 'previous') : null);
  const compras = derivado(MAPA_RAZONES_APP.rotacionCxP, 'derived.credit_purchases');
  const usaComprasReales = anterior && numero(inventario.valor) && numero(inventarioPrevio.valor)
    && numero(compras.valor) && compras.valor >= 0;

  // Cuatro indicadores ajenos a los 20 JSON conservan sus funciones actuales.
  resultados.pruebaDefensiva = evaluarExtra(pruebaDefensiva, [efectivo,pasivoCorriente]);
  resultados.rotacionCapitalTrabajo = evaluarExtra(rotacionCapitalTrabajo, [ventas,resultados.capitalNetoTrabajo]);
  resultados.apalancamiento = evaluarExtra(apalancamiento, [activoProm,patrimonioProm]);
  resultados.solvencia = evaluarExtra(solvencia, [activos,pasivos]);

  const denominadores = Object.fromEntries(Object.entries(CAMPOS_DENOMINADOR).map(([campo,origen]) => {
    const id = MAPA_RAZONES_APP[origen];
    return [campo,consultar(id, ESPECIFICACION_RAZONES[id].razon.formula.denominator).valor];
  }));
  Object.assign(denominadores, { pruebaDefensiva:pasivoCorriente.valor, rotacionCapitalTrabajo:resultados.capitalNetoTrabajo.valor,
    apalancamiento:patrimonioProm.valor, solvencia:pasivos.valor, cicloConversion:1 });
  return { ...Object.fromEntries(Object.entries(resultados).map(([campo,resultado]) => [campo,resultado.valor])),
    usaPromedios:anterior, usaComprasReales,
    invProm:invProm.valor, cxcProm:cxcProm.valor, activoProm:activoProm.valor, patrimonioProm:patrimonioProm.valor,
    notAvailableReasons:deduplicar(Object.entries(resultados).flatMap(([campo,resultado]) => traducirMotivos(campo, resultado, entrada, periodo))),
    denominadores
  };
}

export function obtenerUtilidadNetaMotor(datos, periodo) {
  const contexto = crearContextoRazonesGuardadas(datos, periodo);
  if (contexto.fallo) return { valor:null, metodo:'not_applicable', motivos:[contexto.fallo] };
  return evaluarConComposicion(() => evaluarDerivado('rentabilidad_margen_utilidad_neta', 'derived.net_income', contexto.entrada), contexto.entrada);
}
