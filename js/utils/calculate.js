export function ah(delta, valorT1) {
  if (valorT1 === 0) return 0;
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
  return 360 / rotCxC;
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

export function rotacionCxP(costoVentas, cxPprom) {
  if (cxPprom === 0) return 0;
  return costoVentas / cxPprom;
}

export function periodoPromedioPago(rotCxP) {
  if (rotCxP === 0) return 0;
  return 365 / rotCxP;
}

export function rotacionActivosFijos(ventas, activosFijosProm) {
  if (activosFijosProm === 0) return 0;
  return ventas / activosFijosProm;
}

export function rotacionActivosTotales(ventas, activosTotalesProm) {
  if (activosTotalesProm === 0) return 0;
  return ventas / activosTotalesProm;
}

export function edadInventario(rotInv) {
  if (rotInv === 0) return 0;
  return 365 / rotInv;
}

export function cicloConversionEfectivo(edadInv, periodoCobro, periodoPago) {
  return edadInv + periodoCobro - periodoPago;
}

export function razonDeudaPatrimonio(pasivoTotal, patrimonio) {
  if (patrimonio === 0) return 0;
  return pasivoTotal / patrimonio;
}

export function coberturaIntereses(UAII, gastosIntereses) {
  if (gastosIntereses === 0) return 0;
  return UAII / gastosIntereses;
}

export function margenBruto(utilidadBruta, ventas) {
  if (ventas === 0) return 0;
  return utilidadBruta / ventas;
}

export function margenOperativo(utilidadOperativa, ventas) {
  if (ventas === 0) return 0;
  return utilidadOperativa / ventas;
}

export function roe(utilidadNeta, patrimonio) {
  if (patrimonio === 0) return 0;
  return utilidadNeta / patrimonio;
}
