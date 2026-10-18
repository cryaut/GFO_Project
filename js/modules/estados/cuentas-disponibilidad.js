// Protección transitoria para los consumidores que todavía no usan montoCuenta.
// Solo propaga N/D y sus motivos; las fórmulas y los datos numéricos no cambian.
const DEPENDENCIAS = {
  activos: ['RC', 'RR', 'RotInv', 'RotCxC', 'PPC', 'endeudamiento', 'ROA', 'pruebaDefensiva', 'rotacionActivos', 'rotacionCxP',
    'plazoPago', 'edadInventario', 'cicloConversion', 'apalancamiento', 'rotacionActivosFijos', 'rotacionCapitalTrabajo', 'solvencia',
    'invProm', 'cxcProm', 'activoProm'],
  pasivos: ['RC', 'RR', 'endeudamiento', 'pruebaDefensiva', 'rotacionCxP', 'plazoPago', 'cicloConversion', 'deudaPatrimonio',
    'rotacionCapitalTrabajo', 'solvencia'],
  patrimonio: ['deudaPatrimonio', 'apalancamiento', 'roe', 'patrimonioProm'],
  estadoResultados: ['RotInv', 'RotCxC', 'PPC', 'MN', 'ROA', 'rotacionActivos', 'rotacionCxP', 'plazoPago', 'edadInventario',
    'cicloConversion', 'coberturaIntereses', 'margenBruto', 'margenOperativo', 'roe', 'rotacionActivosFijos', 'rotacionCapitalTrabajo']
};

// Entradas que realmente usa cada razón. El periodo anterior solo interviene
// en promedios y compras: una venta pendiente anterior no anula el margen actual.
const ENTRADAS = {
  RC: ['activosCorrientes', 'pasivosCorrientes'],
  RR: ['activosCorrientes', 'inventario', 'pasivosCorrientes'],
  RotInv: ['costoVentas', 'inventario'],
  RotCxC: ['ventas', 'cxC'], PPC: ['ventas', 'cxC'],
  endeudamiento: ['totalPasivos', 'totalActivos'],
  MN: ['utilidadNeta', 'ventas'], ROA: ['utilidadNeta', 'totalActivos'],
  pruebaDefensiva: ['efectivo', 'pasivosCorrientes'],
  rotacionActivos: ['ventas', 'totalActivos'],
  rotacionCxP: ['costoVentas', 'inventario', 'cuentasPorPagar'],
  plazoPago: ['costoVentas', 'inventario', 'cuentasPorPagar'],
  edadInventario: ['costoVentas', 'inventario'],
  cicloConversion: ['ventas', 'cxC', 'costoVentas', 'inventario', 'cuentasPorPagar'],
  coberturaIntereses: ['ventas', 'costoVentas', 'gastosAdmin', 'gastosVentas', 'intereses'],
  deudaPatrimonio: ['totalPasivos', 'totalPatrimonio'],
  apalancamiento: ['totalActivos', 'totalPatrimonio'],
  margenBruto: ['ventas', 'costoVentas'],
  margenOperativo: ['ventas', 'costoVentas', 'gastosAdmin', 'gastosVentas'],
  roe: ['utilidadNeta', 'totalPatrimonio'],
  rotacionActivosFijos: ['ventas', 'activosFijos'],
  rotacionCapitalTrabajo: ['ventas', 'activosCorrientes', 'pasivosCorrientes'],
  solvencia: ['totalActivos', 'totalPasivos'],
  invProm: ['inventario'], cxcProm: ['cxC'], activoProm: ['totalActivos'], patrimonioProm: ['totalPatrimonio']
};
const ENTRADAS_PREVIAS = {
  RotInv: ['inventario'], RotCxC: ['cxC'], PPC: ['cxC'], ROA: ['totalActivos'],
  rotacionActivos: ['totalActivos'], rotacionCxP: ['inventario', 'cuentasPorPagar'],
  plazoPago: ['inventario', 'cuentasPorPagar'], edadInventario: ['inventario'],
  cicloConversion: ['inventario', 'cxC', 'cuentasPorPagar'],
  apalancamiento: ['totalActivos', 'totalPatrimonio'], roe: ['totalPatrimonio'],
  invProm: ['inventario'], cxcProm: ['cxC'], activoProm: ['totalActivos'], patrimonioProm: ['totalPatrimonio']
};

export function aplicarDisponibilidadRazones(razones, ...totales) {
  const resultado = { ...razones, motivosNoDisponible: {} };
  if (razones.denominadores) resultado.denominadores = { ...razones.denominadores };
  for (const [indice, total] of totales.entries()) {
    for (const motivo of total?.notAvailableReasons || []) {
      const entradas = indice === 0 ? ENTRADAS : ENTRADAS_PREVIAS;
      const campos = motivo.campos ? Object.keys(entradas).filter(campo =>
        entradas[campo].some(entrada => motivo.campos.includes(entrada)))
        : DEPENDENCIAS[motivo.group] || Object.keys(entradas);
      for (const campo of campos) {
        resultado[campo] = null;
        resultado.motivosNoDisponible[campo] ??= [];
        if (!resultado.motivosNoDisponible[campo].includes(motivo.motivo)) resultado.motivosNoDisponible[campo].push(motivo.motivo);
        const denominador = campo === 'endeudamiento' ? 'End' : campo;
        if (resultado.denominadores && Object.hasOwn(resultado.denominadores, denominador)) resultado.denominadores[denominador] = null;
      }
    }
  }
  return resultado;
}
