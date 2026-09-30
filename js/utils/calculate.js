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

// === Punto de equilibrio y C-V-U ===
// Casos resueltos a mano en docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
// Devuelven null (N/D) si falta un dato o si el margen de contribución no es positivo: con
// MCu ≤ 0 cada unidad vendida aumenta la pérdida y no existe punto de equilibrio.

// MCu = P − CVu
export function margenContribucionUnitario(precio, costoVariableUnitario) {
  if (!esNumero(precio) || !esNumero(costoVariableUnitario)) return null;
  return precio - costoVariableUnitario;
}

// RMC = MCu / P
export function razonMargenContribucion(mcUnitario, precio) {
  if (!esNumero(mcUnitario) || !esNumero(precio) || precio <= 0) return null;
  return mcUnitario / precio;
}

// PE en unidades = CF / MCu
export function puntoEquilibrioUnidades(costosFijos, mcUnitario) {
  if (!esNumero(costosFijos) || costosFijos < 0 || !esNumero(mcUnitario) || mcUnitario <= 0) return null;
  return costosFijos / mcUnitario;
}

// PE en C$ = CF / RMC
export function puntoEquilibrioVentas(costosFijos, razonMC) {
  if (!esNumero(costosFijos) || costosFijos < 0 || !esNumero(razonMC) || razonMC <= 0) return null;
  return costosFijos / razonMC;
}

// Unidades para lograr una utilidad objetivo = (CF + UO) / MCu
export function unidadesUtilidadObjetivo(costosFijos, utilidadObjetivo, mcUnitario) {
  if (![costosFijos, utilidadObjetivo, mcUnitario].every(esNumero) || mcUnitario <= 0) return null;
  const numerador = costosFijos + utilidadObjetivo;
  return numerador < 0 ? null : numerador / mcUnitario;
}

// Margen de seguridad = (ventas − ventas de equilibrio) / ventas, en unidades o en C$.
// Negativo: la empresa vende menos que su punto de equilibrio.
export function margenSeguridad(ventas, ventasEquilibrio) {
  if (!esNumero(ventas) || !esNumero(ventasEquilibrio) || ventas <= 0) return null;
  return (ventas - ventasEquilibrio) / ventas;
}

// === Inventario básico ===

// Existencia final = existencia inicial + entradas − salidas
export function existenciaFinal(existenciaInicial, entradas, salidas) {
  if (![existenciaInicial, entradas, salidas].every(esNumero)) return null;
  return existenciaInicial + entradas - salidas;
}

// Valor del inventario = existencia final × costo unitario
export function valorInventario(existencia, costoUnitario) {
  if (!esNumero(existencia) || !esNumero(costoUnitario)) return null;
  return existencia * costoUnitario;
}

// Alerta de reposición: la existencia llegó al stock mínimo o quedó por debajo.
export function necesitaReposicion(existencia, stockMinimo) {
  if (!esNumero(existencia) || !esNumero(stockMinimo)) return null;
  return existencia <= stockMinimo;
}

// === Flujo de efectivo ===

// Flujo neto de una actividad = entradas − salidas
export function flujoNeto(entradas, salidas) {
  if (!esNumero(entradas) || !esNumero(salidas)) return null;
  return entradas - salidas;
}

// Variación neta del efectivo = operación + inversión + financiamiento
export function variacionNetaEfectivo(operacion, inversion, financiamiento) {
  if (![operacion, inversion, financiamiento].every(esNumero)) return null;
  return operacion + inversion + financiamiento;
}

// Saldo final de efectivo = saldo inicial + variación neta
export function saldoFinalEfectivo(saldoInicial, variacionNeta) {
  if (!esNumero(saldoInicial) || !esNumero(variacionNeta)) return null;
  return saldoInicial + variacionNeta;
}

// === Presupuesto maestro ===

// Compras en unidades = ventas + inventario final deseado − inventario inicial.
// Puede salir negativo si el inventario inicial sobra; el módulo decide cómo tratarlo.
export function comprasPresupuestadas(ventasUnidades, inventarioFinalDeseado, inventarioInicial) {
  if (![ventasUnidades, inventarioFinalDeseado, inventarioInicial].every(esNumero)) return null;
  return ventasUnidades + inventarioFinalDeseado - inventarioInicial;
}

// CBV = inventario inicial + compras − inventario final (en C$)
export function costoBienesVendidos(inventarioInicial, compras, inventarioFinal) {
  if (![inventarioInicial, compras, inventarioFinal].every(esNumero)) return null;
  return inventarioInicial + compras - inventarioFinal;
}

// Financiamiento requerido = saldo mínimo − saldo final, si el saldo final queda por debajo
// del mínimo (presupuesto de caja de Gitman); 0 si hay excedente.
export function financiamientoRequerido(saldoFinal, saldoMinimo) {
  if (!esNumero(saldoFinal) || !esNumero(saldoMinimo)) return null;
  return Math.max(0, saldoMinimo - saldoFinal);
}

// === Presupuesto personal ===

// Capacidad de ahorro = ingresos − gastos (antes del ahorro planificado)
export function capacidadAhorro(ingresos, gastos) {
  if (!esNumero(ingresos) || !esNumero(gastos)) return null;
  return ingresos - gastos;
}

// Tasa de ahorro = capacidad de ahorro / ingresos
export function tasaAhorro(capacidad, ingresos) {
  if (!esNumero(capacidad) || !esNumero(ingresos) || ingresos <= 0) return null;
  return capacidad / ingresos;
}

// === Razones de mercado ===
// UDAC = utilidad disponible para accionistas comunes (UN − DAP). null (N/D) si falta un dato o
// el denominador no es positivo: con UPA ≤ 0 la relación precio/utilidad no tiene lectura.

// UPA = UDAC / acciones comunes en circulación (C$ por acción)
export function utilidadPorAccion(udac, accionesComunes) {
  if (!esNumero(udac) || !esNumero(accionesComunes) || accionesComunes <= 0) return null;
  return udac / accionesComunes;
}

// P/U = precio de mercado por acción / UPA (veces)
export function precioUtilidad(precioAccion, upa) {
  if (!esNumero(precioAccion) || precioAccion <= 0 || !esNumero(upa) || upa <= 0) return null;
  return precioAccion / upa;
}

// Valor en libros por acción = patrimonio común / acciones comunes (C$ por acción)
export function valorLibrosPorAccion(patrimonioComun, accionesComunes) {
  if (!esNumero(patrimonioComun) || !esNumero(accionesComunes) || accionesComunes <= 0) return null;
  return patrimonioComun / accionesComunes;
}

// P/VL = precio de mercado por acción / valor en libros por acción (veces)
export function precioValorLibros(precioAccion, valorLibrosAccion) {
  if (!esNumero(precioAccion) || precioAccion <= 0 || !esNumero(valorLibrosAccion) || valorLibrosAccion <= 0) return null;
  return precioAccion / valorLibrosAccion;
}

// DPA = dividendos comunes pagados / acciones comunes (C$ por acción)
export function dividendoPorAccion(dividendosComunes, accionesComunes) {
  if (!esNumero(dividendosComunes) || dividendosComunes < 0 || !esNumero(accionesComunes) || accionesComunes <= 0) return null;
  return dividendosComunes / accionesComunes;
}

// Razón de pago de dividendos = DPA / UPA
export function razonPagoDividendos(dpa, upa) {
  if (!esNumero(dpa) || !esNumero(upa) || upa <= 0) return null;
  return dpa / upa;
}

// Rendimiento del dividendo = DPA / precio de mercado por acción
export function rendimientoDividendo(dpa, precioAccion) {
  if (!esNumero(dpa) || !esNumero(precioAccion) || precioAccion <= 0) return null;
  return dpa / precioAccion;
}
