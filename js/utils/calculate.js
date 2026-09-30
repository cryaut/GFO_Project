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

// Denominador 0 o dato ausente => null (N/D), nunca 0: un 0 aquí sería un
// resultado financiero falso (AGENTS.md regla 4).
export function ratioCorriente(activosCorrientes, pasivosCorrientes) {
  if (!pasivosCorrientes) return null;
  return activosCorrientes / pasivosCorrientes;
}

export function ratioRapido(activosCorrientes, inventario, pasivosCorrientes) {
  if (!pasivosCorrientes) return null;
  return (activosCorrientes - inventario) / pasivosCorrientes;
}

export function rotacionInventario(costoVentas, inventarioPromedio) {
  if (!inventarioPromedio) return null;
  return costoVentas / inventarioPromedio;
}

// Requiere ventas a crédito reales: el modelo de datos no las distingue, así que
// los llamadores pasan null y la razón queda N/D en vez de usar ventas totales.
export function rotacionCxC(ventasACredito, cxCprom) {
  if (ventasACredito === null || ventasACredito === undefined) return null;
  if (!cxCprom) return null;
  return ventasACredito / cxCprom;
}

export function plazoCobro(rotCxC) {
  if (!rotCxC) return null;
  return DIAS_ANIO / rotCxC;
}

export function endeudamiento(pasivoTotal, totalActivo) {
  if (!totalActivo) return null;
  return pasivoTotal / totalActivo;
}

export function margenNeto(utilidadNeta, ventas) {
  if (!ventas) return null;
  if (utilidadNeta === null || utilidadNeta === undefined) return null;
  return utilidadNeta / ventas;
}

export function roa(utilidadNeta, totalActivo) {
  if (!totalActivo) return null;
  if (utilidadNeta === null || utilidadNeta === undefined) return null;
  return utilidadNeta / totalActivo;
}

export function dupont(UN, ventas, activoTotalProm, patrimonio) {
  const PM = margenNeto(UN, ventas);
  const AT = !activoTotalProm ? null : ventas / activoTotalProm;
  // El guard explícito de null evita que null / patrimonio se lea como 0.
  const EM = (activoTotalProm === null || activoTotalProm === undefined || !patrimonio)
    ? null : activoTotalProm / patrimonio;
  // Un solo componente N/D anula el producto: nunca Infinity ni NaN.
  const ROE = (PM === null || PM === undefined || AT === null || EM === null)
    ? null : PM * AT * EM;
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
// Todas las razones de este archivo devuelven null si su denominador es 0 o el
// dato falta: N/D, no cero.
export function pruebaDefensiva(efectivo, pasivosCorrientes) {
  if (pasivosCorrientes === 0) return null;
  return efectivo / pasivosCorrientes;
}

export function rotacionActivos(ventas, activoTotalProm) {
  if (!activoTotalProm) return null;
  return ventas / activoTotalProm;
}

// Rotación de cuentas por pagar = Compras / CxP promedio. El llamador calcula
// Compras = Costo de Ventas + Inventario Final − Inventario Inicial y, si no hay
// inventario comparable, pasa el costo de ventas (aproximación documentada).
export function rotacionCxP(compras, cxPprom) {
  if (!cxPprom) return null;
  if (compras === null || compras === undefined) return null;
  return compras / cxPprom;
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
  if (plazoCobroDias === null || plazoCobroDias === undefined) return null;
  if (!rotInv || !rotCxP) return null;
  const edad = edadInventario(rotInv);
  const pago = plazoPago(rotCxP);
  if (edad === null || pago === null) return null;
  return plazoCobroDias + edad - pago;
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
