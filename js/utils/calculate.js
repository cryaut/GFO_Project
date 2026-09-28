// Días del año para plazos, edades y ciclos (decisión del equipo: año calendario).
// Cambiarlo aquí actualiza plazoCobro, plazoPago, edadInventario y cicloConversion.
export const DIAS_ANIO = 365;

export function saldoPromedio(saldoInicial, saldoFinal) {
  if (
    (saldoInicial === undefined || saldoInicial === null) ||
    (saldoFinal === undefined || saldoFinal === null)
  ) {
    return saldoFinal ?? saldoInicial ?? 0;
  }
  return (saldoInicial + saldoFinal) / 2;
}

export function variacion(valorFinal, valorInicial) {
  return valorFinal - valorInicial;
}

export function ah(delta, valorT1) {
  if (valorT1 === 0 || valorT1 === undefined || valorT1 === null) return null;
  return delta / Math.abs(valorT1);
}

export function ahDelta(valorT2, valorT1) {
  return valorT2 - valorT1;
}

export function ahPctDelta(valorT2, valorT1) {
  const d = ahDelta(valorT2, valorT1);
  return ah(d, valorT1);
}

export function av(cuenta, base) {
  if (base === 0) return 0;
  return cuenta / base;
}

export function ratioCorriente(activosCorrientes, pasivosCorrientes) {
  if (pasivosCorrientes === 0) return 0;
  return activosCorrientes / pasivosCorrientes;
}

export function ratioRapido(activosCorrientes, inventario, pasivosCorrientes) {
  if (pasivosCorrientes === 0) return 0;
  return (activosCorrientes - inventario) / pasivosCorrientes;
}

export function rotacionInventario(costoVentas, inventarioPromedio) {
  if (inventarioPromedio === 0) return 0;
  return costoVentas / inventarioPromedio;
}

export function rotacionCxC(ventas, cxCprom) {
  if (cxCprom === 0) return 0;
  return ventas / cxCprom;
}

export function plazoCobro(rotCxC) {
  if (rotCxC === 0) return 0;
  return DIAS_ANIO / rotCxC;
}

export function endeudamiento(pasivoTotal, totalActivo) {
  if (totalActivo === 0) return 0;
  return pasivoTotal / totalActivo;
}

export function margenNeto(utilidadNeta, ventas) {
  if (ventas === 0) return 0;
  return utilidadNeta / ventas;
}

export function roa(utilidadNeta, totalActivo) {
  if (totalActivo === 0) return 0;
  return utilidadNeta / totalActivo;
}

export function dupont(UN, ventas, activoTotalProm, patrimonio) {
  const PM = margenNeto(UN, ventas);
  const AT = ventas === 0 ? 0 : ventas / activoTotalProm;
  const EM = patrimonio === 0 ? 0 : activoTotalProm / patrimonio;
  const ROE = PM * AT * EM;
  return { PM, AT, EM, ROE };
}

export function capitalNetoTrabajo(activosCorrientes, pasivosCorrientes) {
  return activosCorrientes - pasivosCorrientes;
}

export function capitalNetoOperativo(activosCorrientesOps, pasivosCorrientesOps) {
  return activosCorrientesOps - pasivosCorrientesOps;
}

export function eoaf(cuenta, cambio, tipo) {
  if (cambio === 0) return null;
  let clasificacion;
  if (tipo === 'activo') {
    clasificacion = cambio > 0 ? 'Aplicacion' : 'Origen';
  } else {
    clasificacion = cambio > 0 ? 'Origen' : 'Aplicacion';
  }
  return { cuenta, cambio, tipo, clasificacion, monto: Math.abs(cambio) };
}

export function efeIndirecto(utilidadNeta, ajustes) {
  return ajustes.reduce((sum, a) => sum + a, utilidadNeta);
}

// === Razones adicionales (completan RC, RR, RotInv, RotCxC, PPC, Endeudamiento, MN, ROA) ===
// Todas devuelven null si su denominador es 0 o el dato falta: N/D, no cero.
export function pruebaDefensiva(efectivo, pasivosCorrientes) {
  if (pasivosCorrientes === 0) return null;
  return efectivo / pasivosCorrientes;
}

export function rotacionActivos(ventas, activoTotalProm) {
  if (!activoTotalProm) return null;
  return ventas / activoTotalProm;
}

// Rotación de cuentas por pagar: costo de ventas (aproxima las compras) / CxP promedio.
export function rotacionCxP(costoVentas, cxPprom) {
  if (!cxPprom) return null;
  return costoVentas / cxPprom;
}

export function plazoPago(rotCxP) {
  if (!rotCxP) return null;
  return DIAS_ANIO / rotCxP;
}

// Edad del inventario (plazo promedio de inventario) en días.
export function edadInventario(rotInv) {
  if (!rotInv) return null;
  return DIAS_ANIO / rotInv;
}

// Ciclo de conversión de efectivo = plazo de cobro + edad del inventario − plazo de pago.
export function cicloConversion(plazoCobroDias, rotInv, rotCxP) {
  if (!rotInv || !rotCxP) return null;
  return plazoCobroDias + edadInventario(rotInv) - plazoPago(rotCxP);
}

export function coberturaIntereses(utilidadOperativa, intereses) {
  if (!intereses) return null;
  return utilidadOperativa / intereses;
}

export function deudaPatrimonio(pasivoTotal, patrimonio) {
  if (!patrimonio) return null;
  return pasivoTotal / patrimonio;
}

export function apalancamiento(activoTotalProm, patrimonioProm) {
  if (!patrimonioProm) return null;
  return activoTotalProm / patrimonioProm;
}

export function margenBruto(utilidadBruta, ventas) {
  if (!ventas) return null;
  return utilidadBruta / ventas;
}

export function margenOperativo(utilidadBruta, gastosAdmin, gastosVentas, ventas) {
  if (!ventas) return null;
  return (utilidadBruta - gastosAdmin - gastosVentas) / ventas;
}

export function roe(utilidadNeta, patrimonioProm) {
  if (!patrimonioProm) return null;
  return utilidadNeta / patrimonioProm;
}

export function rotacionActivosFijos(ventas, activosFijosNetos) {
  if (!activosFijosNetos) return null;
  return ventas / activosFijosNetos;
}

export function rotacionCapitalTrabajo(ventas, capitalNetoTrabajoValor) {
  if (!capitalNetoTrabajoValor) return null;
  return ventas / capitalNetoTrabajoValor;
}

export function solvencia(activoTotal, pasivoTotal) {
  if (!pasivoTotal) return null;
  return activoTotal / pasivoTotal;
}

export function depAnualLineaRecta(costoOriginal, valorResidual, vidaUtil) {
  if (vidaUtil <= 0) return 0;
  return (costoOriginal - valorResidual) / vidaUtil;
}

export function depAcumulada(depAnual, aniosConsumidos, vidaUtil) {
  const maxDep = aniosConsumidos > vidaUtil ? vidaUtil : aniosConsumidos;
  return depAnual * maxDep;
}

export function valorEnLibros(costoOriginal, depAcum) {
  return costoOriginal - depAcum;
}

export function ahorroMensual(metaAhorro, mesesDisponibles) {
  if (mesesDisponibles <= 0) return metaAhorro;
  return metaAhorro / mesesDisponibles;
}

export function saldoSemanal(ingreso, gastos, ahorro, reserva) {
  return ingreso - gastos - ahorro - (reserva || 0);
}

// === Apalancamiento: GAO, GAF y GAT ===
// Fórmulas y casos especiales en docs/planificacion/apalancamiento/01-formulas-apalancamiento.md.
// Devuelven null (N/D) si falta un dato o el denominador es ≈ 0. Los valores negativos se
// devuelven tal cual: la interfaz advierte que la empresa está bajo su punto de equilibrio.

// Alícuota general del IR en Nicaragua; se usa si la tasa efectiva no tiene sentido.
export const TASA_IR_DEFECTO = 0.30;

// Montos en córdobas: menos de medio centavo cuenta como 0.
const TOLERANCIA_CERO = 0.005;

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function esCasiCero(valor) {
  return Math.abs(valor) < TOLERANCIA_CERO;
}

function esTasaValida(tasa) {
  return esNumero(tasa) && tasa >= 0 && tasa < 1;
}

// T efectiva = IR / UAI, solo si la UAI es positiva y el resultado está en [0, 1).
export function tasaEfectiva(ir, uai) {
  if (!esNumero(ir) || !esNumero(uai) || uai <= 0) return null;
  const tasa = ir / uai;
  return esTasaValida(tasa) ? tasa : null;
}

// T para el GAF: la efectiva si existe; si no, la tasa por defecto (si es válida).
export function tasaImpuesto(ir, uai, tasaDefecto = TASA_IR_DEFECTO) {
  const efectiva = tasaEfectiva(ir, uai);
  if (efectiva !== null) return efectiva;
  return esTasaValida(tasaDefecto) ? tasaDefecto : null;
}

// Denominador del GAF y del GAT: UAI − DAP / (1 − T). Con DAP = 0 es la UAI y T no se valida.
export function denominadorGaf(uai, dap = 0, t = null) {
  if (!esNumero(uai) || !esNumero(dap) || dap < 0) return null;
  if (dap === 0) return uai;
  if (!esTasaValida(t)) return null;
  return uai - dap / (1 - t);
}

// GAO = MC / UAII
export function gao(mc, uaii) {
  if (!esNumero(mc) || !esNumero(uaii) || esCasiCero(uaii)) return null;
  return mc / uaii;
}

// GAF = UAII / (UAI − DAP / (1 − T)). Usa la UAI, con otros ingresos y otros gastos (D-007).
export function gaf(uaii, uai, dap = 0, t = null) {
  const denominador = denominadorGaf(uai, dap, t);
  if (!esNumero(uaii) || denominador === null || esCasiCero(denominador)) return null;
  return uaii / denominador;
}

// GAT = MC / (UAI − DAP / (1 − T)) = GAO × GAF
export function gat(mc, uai, dap = 0, t = null) {
  const denominador = denominadorGaf(uai, dap, t);
  if (!esNumero(mc) || denominador === null || esCasiCero(denominador)) return null;
  return mc / denominador;
}

// %Δ entre un periodo base y el actual; null si la base no es positiva.
function variacionRelativa(base, actual) {
  if (!esNumero(base) || !esNumero(actual) || base < TOLERANCIA_CERO) return null;
  return ahPctDelta(actual, base);
}

// %Δ numerador / %Δ denominador; null si el denominador no cambió.
function cocienteVariaciones(numBase, num, denBase, den) {
  const pctNum = variacionRelativa(numBase, num);
  const pctDen = variacionRelativa(denBase, den);
  if (pctNum === null || pctDen === null || esCasiCero(den - denBase)) return null;
  return pctNum / pctDen;
}

// GAO por variación = %ΔUAII / %ΔVentas. Primero el periodo base y después el actual.
export function gaoVariacion(ventasBase, ventas, uaiiBase, uaii) {
  return cocienteVariaciones(uaiiBase, uaii, ventasBase, ventas);
}

// GAF por variación = %ΔUDAC / %ΔUAII, con UDAC = UN − DAP.
export function gafVariacion(uaiiBase, uaii, udacBase, udac) {
  return cocienteVariaciones(udacBase, udac, uaiiBase, uaii);
}

// GAT por variación = %ΔUDAC / %ΔVentas.
export function gatVariacion(ventasBase, ventas, udacBase, udac) {
  return cocienteVariaciones(udacBase, udac, ventasBase, ventas);
}
