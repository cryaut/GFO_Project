// Punto de equilibrio y análisis costo-volumen-utilidad (C-V-U).
// Lógica pura: sin DOM, window ni store. Plan: docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
import {
  gao, casiCero, margenContribucionUnitario, margenSeguridad, puntoEquilibrioUnidades,
  puntoEquilibrioVentas, razonMargenContribucion, unidadesUtilidadObjetivo
} from '../../utils/calculate.js';
import { calcularApalancamiento } from '../apalancamiento/apalancamiento-calculations.js';

// Cambio de los escenarios predefinidos: ±10 %.
export const CAMBIO_ESCENARIO = 0.10;
const CAMPOS_ESCENARIO = ['precio', 'costoVariable', 'costosFijos', 'volumen'];

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function numeroONull(valor) {
  return esNumero(valor) ? valor : null;
}

// Producto que propaga el N/D: null si falta un factor.
function por(a, b) {
  return esNumero(a) && esNumero(b) ? a * b : null;
}

function menos(a, b) {
  return esNumero(a) && esNumero(b) ? a - b : null;
}

// Datos guardados → { origen, periodo, precio, costoVariableUnitario, costosFijos,
// unidades, utilidadObjetivo, escenario }. D-074: origen «estados» guarda solo el
// origen, el periodo y las unidades (la base se deriva en cada consulta); datos
// sin `origen` se leen como «manual» (migración), igual que el formato de hoy.
// D-075: en los escenarios, un valor vacío sigue siendo 0, pero uno que no es
// número se conserva como null para que validarEquilibrio lo reporte.
export function normalizarEquilibrio(datos) {
  const escenario = {};
  for (const campo of CAMPOS_ESCENARIO) {
    const valor = datos?.escenario?.[campo];
    escenario[campo] = valor === undefined || valor === null || valor === '' ? 0
      : esNumero(valor) ? valor : null;
  }
  return {
    origen: datos?.origen === 'estados' ? 'estados' : 'manual',
    periodo: typeof datos?.periodo === 'string' ? datos.periodo : '',
    precio: numeroONull(datos?.precio),
    costoVariableUnitario: numeroONull(datos?.costoVariableUnitario),
    costosFijos: numeroONull(datos?.costosFijos),
    unidades: numeroONull(datos?.unidades),
    utilidadObjetivo: numeroONull(datos?.utilidadObjetivo),
    escenario
  };
}

// Errores de los datos base (lista vacía si se puede calcular).
export function validarEquilibrio(datos) {
  const errores = [];
  if (!esNumero(datos.precio) || datos.precio <= 0) errores.push('El precio de venta debe ser un número mayor que 0.');
  if (!esNumero(datos.costoVariableUnitario) || datos.costoVariableUnitario < 0) {
    errores.push('El costo variable unitario debe ser un número mayor o igual a 0.');
  }
  if (!esNumero(datos.costosFijos) || datos.costosFijos < 0) errores.push('Los costos fijos deben ser un número mayor o igual a 0.');
  if (!esNumero(datos.unidades) || datos.unidades < 0) errores.push('Las unidades vendidas deben ser un número mayor o igual a 0.');
  if (datos.utilidadObjetivo !== null && !esNumero(datos.utilidadObjetivo)) errores.push('La utilidad objetivo debe ser un número.');
  // D-075: cada campo del escenario se reporta por su nombre (un valor no
  // numérico llega aquí como null, sin convertirse en 0).
  const etiquetasEscenario = {
    precio: 'precio', costoVariable: 'costo variable', costosFijos: 'costos fijos', volumen: 'volumen'
  };
  for (const campo of CAMPOS_ESCENARIO) {
    const valor = datos.escenario?.[campo];
    if (valor === null || !esNumero(valor) || valor <= -1) {
      errores.push(`El cambio de ${etiquetasEscenario[campo]} del escenario debe ser un número mayor que −100 %.`);
    }
  }
  return errores;
}

// Resultados de un caso. Cada valor es un número o null (N/D).
export function calcularCVU(datos) {
  const { precio, costoVariableUnitario: cvu, costosFijos: cf, unidades: q } = datos;
  const mcu = margenContribucionUnitario(precio, cvu);
  const rmc = razonMargenContribucion(mcu, precio);
  const peUnidades = puntoEquilibrioUnidades(cf, mcu);
  const peVentas = puntoEquilibrioVentas(cf, rmc);
  const ventas = por(precio, q);
  const costoVariableTotal = por(cvu, q);
  const mcTotal = por(mcu, q);
  const uaii = menos(mcTotal, cf);
  const unidadesObjetivo = esNumero(datos.utilidadObjetivo)
    ? unidadesUtilidadObjetivo(cf, datos.utilidadObjetivo, mcu) : null;
  // D-073: el GAO solo existe con margen y UAII positivos; el motivo explica
  // por qué falta, en este orden: sin ventas, margen no positivo, UAII no
  // positiva, dato faltante.
  const valorGao = gao(mcTotal, uaii);
  let motivoGao = null;
  if (valorGao === null) {
    if (!esNumero(q) || q <= 0) motivoGao = 'sin-ventas';
    else if (!esNumero(mcTotal) || mcTotal <= 0 || casiCero(mcTotal)) motivoGao = 'margen-no-positivo';
    else if (!esNumero(uaii) || uaii <= 0 || casiCero(uaii)) motivoGao = 'uaii-no-positiva';
    else motivoGao = 'dato-faltante';
  }
  return {
    precio, cvu, cf, q, mcu, rmc, peUnidades, peVentas,
    // Unidades enteras que hay que vender para no perder.
    unidadesMinimas: peUnidades === null ? null : Math.ceil(peUnidades - 1e-9),
    ventas, costoVariableTotal, mcTotal,
    costoTotal: esNumero(costoVariableTotal) && esNumero(cf) ? costoVariableTotal + cf : null,
    uaii,
    msUnidades: peUnidades === null ? null : menos(q, peUnidades),
    msVentas: peVentas === null ? null : menos(ventas, peVentas),
    msPorcentaje: peUnidades === null ? null : margenSeguridad(q, peUnidades),
    gao: valorGao,
    motivoGao,
    utilidadObjetivo: numeroONull(datos.utilidadObjetivo),
    unidadesObjetivo,
    ventasObjetivo: por(unidadesObjetivo, precio)
  };
}

// Aplica cambios relativos (0.10 = +10 %) a precio, costo variable, costos fijos y volumen.
export function aplicarCambios(datos, cambios = {}) {
  const factor = campo => 1 + (esNumero(cambios[campo]) ? cambios[campo] : 0);
  return {
    ...datos,
    precio: por(datos.precio, factor('precio')),
    costoVariableUnitario: por(datos.costoVariableUnitario, factor('costoVariable')),
    costosFijos: por(datos.costosFijos, factor('costosFijos')),
    unidades: por(datos.unidades, factor('volumen'))
  };
}

function nombreCambios(cambios) {
  const etiquetas = { precio: 'precio', costoVariable: 'CVu', costosFijos: 'CF', volumen: 'volumen' };
  const partes = CAMPOS_ESCENARIO.filter(c => cambios[c])
    .map(c => `${etiquetas[c]} ${cambios[c] > 0 ? '+' : '−'}${Number((Math.abs(cambios[c]) * 100).toFixed(2))} %`);
  return partes.length ? `Personalizado: ${partes.join(', ')}` : 'Personalizado (sin cambios)';
}

// Base, cambios de ±10 % en cada variable y el escenario personalizado, con su efecto en la UAII.
export function calcularEscenarios(datos) {
  const pct = `${CAMBIO_ESCENARIO * 100} %`;
  const lista = [
    { id: 'base', nombre: 'Base', cambios: {} },
    { id: 'precio-sube', nombre: `Precio +${pct}`, cambios: { precio: CAMBIO_ESCENARIO } },
    { id: 'precio-baja', nombre: `Precio −${pct}`, cambios: { precio: -CAMBIO_ESCENARIO } },
    { id: 'cv-sube', nombre: `Costo variable unitario +${pct}`, cambios: { costoVariable: CAMBIO_ESCENARIO } },
    { id: 'cv-baja', nombre: `Costo variable unitario −${pct}`, cambios: { costoVariable: -CAMBIO_ESCENARIO } },
    { id: 'cf-sube', nombre: `Costos fijos +${pct}`, cambios: { costosFijos: CAMBIO_ESCENARIO } },
    { id: 'cf-baja', nombre: `Costos fijos −${pct}`, cambios: { costosFijos: -CAMBIO_ESCENARIO } },
    { id: 'volumen-sube', nombre: `Volumen +${pct}`, cambios: { volumen: CAMBIO_ESCENARIO } },
    { id: 'volumen-baja', nombre: `Volumen −${pct}`, cambios: { volumen: -CAMBIO_ESCENARIO } }
  ];
  const personalizado = datos.escenario || {};
  // D-075: el escenario personalizado no se calcula mientras tenga un valor
  // inválido (null); los escenarios predefinidos sí.
  const personalizadoValido = CAMPOS_ESCENARIO.every(campo => personalizado[campo] !== null);
  if (CAMPOS_ESCENARIO.some(campo => personalizado[campo]) && personalizadoValido) {
    lista.push({ id: 'personalizado', nombre: nombreCambios(personalizado), cambios: personalizado });
  }
  const base = calcularCVU(datos);
  return lista.map(escenario => {
    const resultado = calcularCVU(aplicarCambios(datos, escenario.cambios));
    const deltaUAII = menos(resultado.uaii, base.uaii);
    return {
      ...escenario, resultado, deltaUAII,
      // %ΔUAII solo si la UAII base es positiva: con base negativa el porcentaje no se lee.
      pctUAII: esNumero(deltaUAII) && esNumero(base.uaii) && base.uaii > 0 ? deltaUAII / base.uaii : null
    };
  });
}

// Puntos de la gráfica: de 0 al mayor entre 2 × PE y 1.2 × Q unidades.
export function puntosGrafica(resultado, pasos = 20) {
  const { precio, cvu, cf, q, peUnidades, peVentas } = resultado;
  if (![precio, cvu, cf].every(esNumero)) return null;
  const tope = Math.max(esNumero(peUnidades) ? peUnidades * 2 : 0, esNumero(q) ? q * 1.2 : 0, 10);
  const xs = Array.from({ length: pasos + 1 }, (_, i) => (tope * i) / pasos);
  return {
    ingresos: xs.map(x => ({ x, y: x * precio })),
    costosTotales: xs.map(x => ({ x, y: cf + x * cvu })),
    costosFijos: xs.map(x => ({ x, y: cf })),
    equilibrio: esNumero(peUnidades) ? { x: peUnidades, y: peVentas } : null,
    actual: esNumero(q) ? { x: q, y: q * precio } : null
  };
}

// Base C-V-U desde los estados guardados: con las unidades vendidas del periodo,
// P = Ventas / Q, CVu = CV / Q y CF según la clasificación de Apalancamiento (D-004, D-009).
export function baseDesdeEstados(estados, configApalancamiento, periodo, unidades) {
  if (!esNumero(unidades) || unidades <= 0) return { error: 'Indique las unidades vendidas en el periodo (mayor que 0).' };
  if (!estados?.periods?.includes(periodo)) return { error: 'Elija un periodo de los estados guardados.' };
  let resultado;
  try {
    resultado = calcularApalancamiento(estados, configApalancamiento || {});
  } catch (error) {
    return { error: `No se pudieron leer los estados: ${error.message}` };
  }
  const derivado = resultado.periodos.find(p => p.periodo === periodo);
  const v = derivado.variables;
  if (v.cv === null || v.cf === null) {
    const faltan = derivado.faltantes.filter(f => f.cuenta).map(f => f.cuenta);
    return {
      error: faltan.length
        ? `Clasifique en Apalancamiento como fijas o variables: ${faltan.join(', ')}.`
        : 'Los estados del periodo no permiten separar costos fijos y variables.'
    };
  }
  if (!esNumero(v.ventas) || v.ventas <= 0) return { error: `El periodo ${periodo} no tiene ventas.` };
  return {
    periodo,
    variables: v,
    base: { precio: v.ventas / unidades, costoVariableUnitario: v.cv / unidades, costosFijos: v.cf, unidades }
  };
}

// D-074: aviso de divergencia del CF manual contra el CF de estados del último
// periodo. La diferencia pasa del 0,5 % del CF de estados (mínimo 0,005 C$).
// Devuelve null cuando no hay con qué comparar o la diferencia está dentro.
function avisoCostosFijos(cfManual, estados, configApalancamiento) {
  if (!estados || !esNumero(cfManual)) return null;
  let ultimo = null;
  try {
    const resultado = calcularApalancamiento(estados, configApalancamiento || {});
    ultimo = resultado.periodos[resultado.periodos.length - 1];
  } catch {
    return null;
  }
  const cfEstados = ultimo?.variables?.cf;
  if (!esNumero(cfEstados)) return null;
  const diferencia = cfManual - cfEstados;
  const umbral = Math.max(0.005, 0.005 * Math.abs(cfEstados));
  if (Math.abs(diferencia) <= umbral) return null;
  return {
    cfManual, cfEstados, diferencia,
    diferenciaPct: Math.abs(diferencia) / Math.abs(cfEstados)
  };
}

// D-074: fuente única de costos. Origen «estados»: la base se deriva en cada
// consulta con la clasificación de Apalancamiento y no se guardan copias.
// Origen «manual» (o datos sin origen, por migración): la captura de hoy, con
// el aviso de divergencia del CF. La pantalla solo usa esta función.
export function resolverBase(datos, estados, configApalancamiento) {
  const origen = datos?.origen === 'estados' ? 'estados' : 'manual';
  if (origen === 'estados') {
    const r = baseDesdeEstados(estados, configApalancamiento, datos?.periodo, datos?.unidades);
    if (r.error) return { origen, error: r.error, avisoCF: null };
    return { origen, base: r.base, periodo: r.periodo, error: null, avisoCF: null };
  }
  const base = {
    precio: numeroONull(datos?.precio),
    costoVariableUnitario: numeroONull(datos?.costoVariableUnitario),
    costosFijos: numeroONull(datos?.costosFijos),
    unidades: numeroONull(datos?.unidades)
  };
  return {
    origen, base, periodo: null, error: null,
    avisoCF: avisoCostosFijos(base.costosFijos, estados, configApalancamiento)
  };
}

// Ejemplo ficticio: una prenda de MUNO MODA en un trimestre (caso del paso 01).
export function ejemploEquilibrio() {
  return {
    precio: 800, costoVariableUnitario: 520, costosFijos: 42000, unidades: 250, utilidadObjetivo: 42000,
    escenario: { precio: 0.05, costoVariable: 0.05, costosFijos: 0, volumen: -0.10 }
  };
}
