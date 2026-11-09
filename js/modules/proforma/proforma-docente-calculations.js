import {
  av, cicloConversion, edadInventario, plazoCobro, plazoPago, rotacionActivos, rotacionActivosFijos,
  rotacionCxC, rotacionCxP as rotacionCxPDocente, rotacionInventario
} from '../../utils/calculate.js';

const finito = valor => Number.isFinite(valor) ? valor : null;
const sumar = (...valores) => valores.every(Number.isFinite) ? finito(valores.reduce((a, b) => a + b, 0)) : null;
const restar = (a, b) => Number.isFinite(a) && Number.isFinite(b) ? finito(a - b) : null;
const aplicar = (importe, tasa) => Number.isFinite(importe) && Number.isFinite(tasa) ? finito(importe * tasa) : null;

export function calcularERDocente(supuestos, metodo) {
  const s = supuestos ?? {};
  const ventas = finito(s.ventasProyectadas);
  const ventasBase = s.ventasBase > 0 ? finito(s.ventasBase) : null;
  const fijoVariable = metodo === 'fijo-variable';
  if (!fijoVariable && metodo !== 'porcentaje') return null;
  const tasaCosto = finito(av(finito(fijoVariable ? s.costoVariable : s.costoBase), ventasBase));
  const tasaGastos = finito(av(finito(fijoVariable ? s.gastosVariables : s.gastosBase), ventasBase));
  const fijoCosto = fijoVariable ? finito(s.costoFijo) : 0;
  const fijoGastos = fijoVariable ? finito(s.gastosFijos) : 0;
  const costo = sumar(fijoCosto, aplicar(ventas, tasaCosto));
  const gastos = sumar(fijoGastos, aplicar(ventas, tasaGastos));
  const otrosOperativos = finito(s.otrosOperativos);
  const otrosNoOperativos = finito(s.otrosNoOperativos);
  const intereses = finito(s.intereses);
  const bruta = restar(ventas, costo);
  const uaii = sumar(restar(bruta, gastos), otrosOperativos);
  const uai = restar(sumar(uaii, otrosNoOperativos), intereses);
  const tasaIR = s.tasaIR >= 0 && s.tasaIR <= 1 ? finito(s.tasaIR) : null;
  // El ejercicio aplica IR sobre utilidad positiva y no acredita un beneficio por pérdidas.
  const ir = uai === null ? null : aplicar(Math.max(0, uai), tasaIR);
  const neta = restar(uai, ir);
  const dividendos = finito(s.dividendos);
  const retenidas = restar(neta, dividendos);
  return {
    ventas, costo, gastos, otrosOperativos, otrosNoOperativos, intereses, bruta, uaii,
    uai, ir, neta, dividendos, retenidas, tasaCosto, tasaGastos, fijoCosto, fijoGastos, tasaIR
  };
}

export function calcularERResidualDocente(s) {
  const tasaIR = s.tasaIR >= 0 && s.tasaIR < 1 ? finito(s.tasaIR) : null;
  const inventarioPromedio = aplicar(sumar(s.inventarioInicial, s.inventarioFinal), 0.5);
  const costo = aplicar(inventarioPromedio, s.rotacionObjetivo);
  const ventas = finito(av(costo, s.costoSobreVentas));
  const bruta = restar(ventas, costo);
  const uai = finito(av(s.utilidadObjetivo, restar(1, tasaIR)));
  const intereses = aplicar(s.deudaPromedio, s.tasaInteres);
  const uaii = sumar(uai, intereses);
  const gastos = restar(bruta, uaii);
  const ir = aplicar(uai, tasaIR);
  const neta = restar(uai, ir);
  const ventasCredito = aplicar(ventas, s.tasaVentasCredito);
  const comprasCredito = aplicar(sumar(costo, restar(s.inventarioFinal, s.inventarioInicial)), s.tasaComprasCredito);
  const RotInv = rotacionInventario(costo, inventarioPromedio);
  const RotCxC = rotacionCxC(ventasCredito, s.cxcPromedio);
  const rotacionCxP = rotacionCxPDocente(comprasCredito, s.cxpPromedio);
  const PPC = plazoCobro(RotCxC);
  return {
    ventas, costo, bruta, gastos, uaii, uai, intereses, ir, neta,
    inventarioPromedio, ventasCredito, comprasCredito,
    actividad: {
      RotInv, edadInventario: edadInventario(RotInv), RotCxC, PPC, rotacionCxP, plazoPago: plazoPago(rotacionCxP),
      rotacionActivosFijos: rotacionActivosFijos(ventas, s.activoFijoPromedio),
      rotacionActivos: rotacionActivos(ventas, s.activoPromedio),
      cicloConversion: cicloConversion(PPC, RotInv, rotacionCxP)
    }
  };
}

export function calcularBalanceDocente(supuestos) {
  const s = supuestos ?? {};
  const activos = {
    efectivo: finito(s.efectivoMinimo),
    valores: finito(s.valoresNegociables),
    cxc: aplicar(s.ventasProyectadas, s.tasaCxC),
    inventario: aplicar(s.ventasProyectadas, s.tasaInventario),
    fijosNetos: restar(sumar(s.fijosNetosBase, s.compraMaquina), s.depreciacion)
  };
  activos.corrientes = sumar(activos.efectivo, activos.valores, activos.cxc, activos.inventario);
  activos.total = sumar(activos.corrientes, activos.fijosNetos);

  const pasivos = {
    cxp: aplicar(s.ventasProyectadas, s.tasaCxP),
    deudasAcumuladas: finito(s.deudasAcumuladas),
    otrosCorrientes: finito(s.otrosPasivosCorrientes),
    deudaLargoPlazo: finito(s.deudaLargoPlazo)
  };
  pasivos.corrientes = sumar(pasivos.cxp, pasivos.deudasAcumuladas, pasivos.otrosCorrientes);
  pasivos.total = sumar(pasivos.corrientes, pasivos.deudaLargoPlazo);

  const utilidadNeta = aplicar(s.ventasProyectadas, s.tasaUtilidadNeta);
  const adicionRetenidas = restar(utilidadNeta, s.dividendos);
  const patrimonio = {
    acciones: finito(s.accionesComunes),
    retenidas: sumar(s.retenidasBase, adicionRetenidas)
  };
  patrimonio.total = sumar(patrimonio.acciones, patrimonio.retenidas);
  const pasivosPatrimonio = sumar(pasivos.total, patrimonio.total);
  const diferencia = restar(activos.total, pasivosPatrimonio);
  const financiamiento = diferencia === null ? null : Math.max(0, diferencia);
  const exceso = diferencia === null ? null : Math.max(0, -diferencia);
  const dividendoEquilibrio = restar(s.dividendos, diferencia);
  const dividendoSinFaltante = dividendoEquilibrio !== null && dividendoEquilibrio >= 0 ? dividendoEquilibrio : null;
  const financiamientoSinDividendos = restar(diferencia, s.dividendos);
  return {
    activos, pasivos, patrimonio, pasivosPatrimonio, utilidadNeta, adicionRetenidas, diferencia, financiamiento, exceso,
    dividendoSinFaltante, faltanteSinDividendos: financiamientoSinDividendos === null ? null : Math.max(0, financiamientoSinDividendos)
  };
}
