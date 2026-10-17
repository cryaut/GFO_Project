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

export function aplicarDisponibilidadRazones(razones, ...totales) {
  const resultado = { ...razones, motivosNoDisponible: {} };
  for (const motivo of totales.flatMap(total => total?.notAvailableReasons || [])) {
    const campos = DEPENDENCIAS[motivo.group] || [...new Set(Object.values(DEPENDENCIAS).flat())];
    for (const campo of campos) {
      resultado[campo] = null;
      resultado.motivosNoDisponible[campo] ??= [];
      if (!resultado.motivosNoDisponible[campo].includes(motivo.motivo)) resultado.motivosNoDisponible[campo].push(motivo.motivo);
    }
  }
  return resultado;
}
