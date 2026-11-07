// Traza de resultados ya calculados: no vuelve a calcular presupuestos ni guarda datos.
const numero = v => typeof v === 'number' && Number.isFinite(v);
const termino = (valor, formato = 'monto') => ({ valor: numero(valor) ? valor : null, formato });
const paso = (clave, concepto, formula, expresion, valor) => ({ clave, concepto, formula, expresion,
  valor: numero(valor) ? valor : null });

export function desarrolloPresupuesto(p, indice = null) {
  if (!p?.totales || !p.resultados || !p.caja || !p.supuestos) return null;
  if (indice !== null && (!Number.isInteger(indice) || indice < 0 || indice >= p.etiquetas.length)) return null;
  const horizonte = indice === null;
  const t = p.totales, s = p.supuestos;
  const valor = clave => horizonte ? t[clave] : p.resultados[clave]?.[indice];
  const dato = clave => termino(valor(clave));
  const suma = valores => valores.flatMap((v, i) => i ? [' + ', termino(v)] : [termino(v)]);
  const n = p.etiquetas.length;
  const gastos = horizonte ? [t.gastosVariables, t.gastosFijos, t.depreciacion]
    : [p.gastos.variables[indice], s.gastosFijos, s.depreciacion];
  const resultados = [
    paso('ventas', 'Ventas', 'Unidades × precio', [termino(horizonte ? t.unidades : p.ventas.unidades[indice], 'numero'), ' × ', termino(s.precio)], valor('ventas')),
    paso('cbv', '(−) Costo de ventas', horizonte ? 'Suma del costo de ventas por periodo' : 'Inventario inicial + compras − inventario final',
      horizonte ? suma(p.cbv.costo) : [termino(p.cbv.inventarioInicial[indice]), ' + ', termino(p.cbv.compras[indice]), ' − ', termino(p.cbv.inventarioFinal[indice])], valor('cbv')),
    paso('utilidadBruta', '(=) Utilidad bruta', 'Ventas − costo de ventas', [dato('ventas'), ' − ', dato('cbv')], valor('utilidadBruta')),
    paso('gastosOperacion', '(−) Gastos operativos', 'Gastos variables + gastos fijos + depreciación', suma(gastos), valor('gastosOperacion')),
    paso('uaii', '(=) Utilidad operativa (UAII)', 'Utilidad bruta − gastos operativos', [dato('utilidadBruta'), ' − ', dato('gastosOperacion')], valor('uaii')),
    paso('intereses', '(−) Intereses', horizonte ? 'Intereses por periodo × cantidad de periodos' : 'Intereses del periodo',
      horizonte ? [termino(s.intereses), ' × ', termino(n, 'numero')] : [termino(s.intereses)], horizonte ? t.intereses : s.intereses),
    paso('uai', '(=) Utilidad antes de impuestos (UAI)', 'UAII − intereses', [dato('uaii'), ' − ', termino(horizonte ? t.intereses : s.intereses)], valor('uai')),
    paso('ir', '(−) Impuesto sobre la renta', horizonte ? 'Suma del IR calculado en cada periodo' : 'Máximo entre UAI y cero × tasa declarada',
      horizonte ? suma(p.resultados.ir) : ['máx(', dato('uai'), ', 0) × ', termino(s.tasaIR, 'pct')], valor('ir')),
    paso('utilidadNeta', '(=) Utilidad neta', 'UAI − impuesto', [dato('uai'), ' − ', dato('ir')], valor('utilidadNeta'))
  ];
  const inicial = horizonte ? p.caja.saldoInicial[0] : p.caja.saldoInicial[indice];
  const final = horizonte ? p.cierre.efectivo : p.caja.saldoFinal[indice];
  const cobros = horizonte ? t.cobros : p.caja.cobros[indice];
  const salidas = horizonte ? t.desembolsos : p.caja.desembolsos[indice];
  const neto = horizonte ? t.flujoNeto : p.caja.flujoNeto[indice];
  const pagos = horizonte ? [t.pagosProveedores, t.gastosPagados, t.intereses, t.otrosDesembolsos]
    : [p.caja.pagosProveedores[indice], p.caja.gastosPagados[indice], s.intereses, p.caja.otros[indice]];
  const caja = [
    paso('cobros', 'Entradas de efectivo', 'Cobros al contado + cobros de crédito',
      horizonte ? suma(p.caja.cobros) : [termino(p.ventas.contado[indice]), ' + ', termino(p.ventas.cobroAnterior[indice])], cobros),
    paso('desembolsos', '(−) Desembolsos', 'Proveedores + gastos pagados + intereses + otros desembolsos', suma(pagos), salidas),
    paso('flujoNeto', '(=) Flujo neto', 'Entradas − desembolsos', [termino(cobros), ' − ', termino(salidas)], neto),
    paso('saldoFinal', '(=) Efectivo final antes de financiamiento', 'Efectivo inicial + flujo neto', [termino(inicial), ' + ', termino(neto)], final),
    paso('saldoMinimo', 'Saldo mínimo requerido', 'Supuesto declarado', [termino(s.saldoMinimoCaja)], s.saldoMinimoCaja),
    paso('financiamiento', horizonte ? 'Necesidad máxima de financiamiento' : 'Financiamiento requerido',
      horizonte ? 'Máximo de las necesidades de los periodos' : 'Máximo entre mínimo − efectivo final y cero',
      horizonte ? ['máx(', ...suma(p.caja.financiamiento).map(v => v === ' + ' ? '; ' : v), ')']
        : ['máx(', termino(s.saldoMinimoCaja), ' − ', termino(final), ', 0)'], horizonte ? p.financiamientoMaximo : p.caja.financiamiento[indice])
  ];
  return { etiqueta: horizonte ? `Horizonte completo · ${n} periodos` : p.etiquetas[indice], resultados, caja };
}
