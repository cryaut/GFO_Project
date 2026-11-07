// Filas de lectura: nunca se insertan cuentas calculadas en el documento original.
import { computeFinancialTotals, resolveAccountType } from './estados-calculations.js';
import { obtenerCuenta } from './cuentas-identificador.js';
import { crearContextoRazonesGuardadas, evaluarConComposicion } from '../razones/razones-app-entrada.js';
import { evaluarDerivado } from '../razones/razones-motor.js';
import { ESPECIFICACION_RAZONES } from '../razones/especificacion-razones.js';
import { leerNumero } from '../../utils/form.js';

const numero = v => typeof v === 'number' && Number.isFinite(v);
const TITULOS = { activos: 'Activos', pasivos: 'Pasivos', patrimonio: 'Patrimonio', estadoResultados: 'Estado de resultados' };
const TIPOS = { activos: 'Activo', pasivos: 'Pasivo', patrimonio: 'Patrimonio' };
const RAZON_ER = 'rentabilidad_margen_utilidad_neta';
// Se consulta la expresión existente antes del impuesto, sin modificar la
// especificación generada ni sustituir impuestos ausentes por un cero ficticio.
const docER = ESPECIFICACION_RAZONES[RAZON_ER];
const formulaUN = docER.derivados.find(d => d.id === 'derived.net_income').formula.calculation;
const consultaUAI = { id: 'derived.presentacion_uai', kind: 'flow', formula: {
  ...formulaUN, right: { ...formulaUN.right,
    operands: formulaUN.right.operands.filter(n => n.id !== 'is.income_tax_expense') }
} };
const consultasER = { ...ESPECIFICACION_RAZONES, [RAZON_ER]: {
  ...docER, derivados: [...docER.derivados, consultaUAI]
} };

function lecturaBorrador(datos) {
  const lectura = structuredClone(datos), calculo = structuredClone(datos);
  for (const periodo of datos.periods) for (const grupo of Object.keys(TITULOS)) {
    const cuentas = grupo === 'estadoResultados' ? lectura.estadoResultados?.[periodo] : lectura.balanceGeneral?.[periodo]?.[grupo];
    const destino = grupo === 'estadoResultados' ? calculo.estadoResultados?.[periodo] : calculo.balanceGeneral?.[periodo]?.[grupo];
    for (const [nombre, original] of Object.entries(cuentas || {})) {
      const valor = numero(original) ? original : leerNumero(original).valor;
      cuentas[nombre] = valor;
      // La consulta recibe ausencia, nunca un 0 inventado. La fila de lectura
      // permanece con N/D y el guardado continúa usando la validación original.
      if (valor === null) delete destino[nombre];
      else destino[nombre] = valor;
    }
  }
  return { lectura, calculo };
}

function cuentasPeriodo(datos, periodo) {
  const filas = [];
  for (const grupo of Object.keys(TITULOS)) {
    const cuentas = grupo === 'estadoResultados' ? datos.estadoResultados?.[periodo] : datos.balanceGeneral?.[periodo]?.[grupo];
    for (const [cuenta, valor] of Object.entries(cuentas || {})) {
      const identidad = datos.accountIdentities?.[grupo]?.[cuenta];
      const id = identidad?.estado === 'reconocida' ? identidad.idCuenta : null;
      filas.push({ clave: `${grupo}:${cuenta}`, cuenta, grupo: TITULOS[grupo], grupoId: grupo,
        tipo: TIPOS[grupo], seccion: grupo === 'estadoResultados' ? 'resultados' : 'balance',
        id, tipoCuenta: resolveAccountType(datos, grupo, cuenta), valor: numero(valor) ? valor : null,
        origen: obtenerCuenta(id)?.rol === 'reported_total' ? 'reportado' : 'importado', operador: '' });
    }
  }
  for (const [id, total] of Object.entries(datos.reportedTotals?.[periodo] || {})) {
    const duplicada = filas.find(f => f.grupoId === total.grupo && (f.id === id || f.cuenta === total.nombre));
    if (duplicada) { duplicada.id = id; duplicada.origen = 'reportado'; continue; }
    filas.push({ clave: `reportado:${id}`, cuenta: total.nombre, grupo: TITULOS[total.grupo] || 'Totales reportados', grupoId: total.grupo,
      tipo: TIPOS[total.grupo], seccion: total.grupo === 'estadoResultados' ? 'resultados' : 'balance',
      id, tipoCuenta: obtenerCuenta(id)?.tipoApp, valor: numero(total.importe) ? total.importe : null,
      origen: 'reportado', operador: '' });
  }
  return filas;
}

// Un mismo concepto tiene clave estable aunque un periodo lo reporte y otro lo calcule.
function subtotal(filas, { id, concepto, grupoId, orden }, valor, motivos = []) {
  const original = filas.find(f => f.id === id);
  return { ...original, clave: `resuelto:${id}`, id, concepto, cuenta: original?.cuenta || concepto,
    grupoId, grupo: TITULOS[grupoId], tipo: TIPOS[grupoId],
    seccion: grupoId === 'estadoResultados' ? 'resultados' : 'balance',
    valor: original ? original.valor : (numero(valor) ? valor : null),
    valorCalculo: numero(valor) ? valor : null,
    origen: original ? 'reportado' : (numero(valor) ? 'calculado' : 'pendiente'),
    operador: '=', subtotal: true, orden, motivos };
}

function balanceResuelto(filas, totales) {
  if (!filas.some(f => f.seccion === 'balance')) return [];
  const grupos = [
    ['activos', [
      ['bs.current_assets_total', 'Total de activos corrientes', 'activosCorrientes', ['efectivo', 'cxC', 'inventario', 'activosCorrientesOtros']],
      ['bs.fixed_assets_net_total', 'Activos fijos netos', 'activosFijos', ['activosFijos', 'depreciacionAcumulada']],
      ['bs.total_assets', 'Total de activos', 'totalActivos', null]
    ]],
    ['pasivos', [
      ['bs.current_liabilities_total', 'Total de pasivos corrientes', 'pasivosCorrientes', ['cuentasPorPagar', 'pasivoCortoPlazo', 'provisiones']],
      ['bs.total_liabilities', 'Total de pasivos', 'totalPasivos', null]
    ]],
    ['patrimonio', [['bs.total_equity', 'Total de patrimonio', 'totalPatrimonio', null]]]
  ];
  const salida = [];
  let orden = 0;
  const valores = {};
  for (const [grupoId, bloques] of grupos) {
    const delGrupo = filas.filter(f => f.grupoId === grupoId);
    const totalesIds = bloques.map(b => b[0]);
    const pendientes = new Set(delGrupo.filter(f => !totalesIds.includes(f.id)));
    for (const [id, concepto, campo, tipos] of bloques) {
      const detalles = [...pendientes].filter(f => !tipos || tipos.includes(f.tipoCuenta));
      for (const f of detalles) { salida.push({ ...f, orden, operador: f.origen === 'reportado' ? '=' : '' }); pendientes.delete(f); }
      orden += 10;
      const hayDatos = tipos ? detalles.length || delGrupo.some(f => f.id === id) : delGrupo.length;
      const incompleto = (tipos ? detalles : delGrupo).some(f => f.valor === null);
      const valor = hayDatos && !incompleto ? totales[campo] : null;
      const fila = subtotal(delGrupo, { id, concepto, grupoId, orden }, valor,
        totales.notAvailableReasons.filter(m => m.campos?.includes(campo)));
      salida.push(fila); valores[campo] = fila.valor;
      orden += 10;
    }
    orden += 100;
  }
  const pasivos = valores.totalPasivos, patrimonio = valores.totalPatrimonio;
  salida.push(subtotal([], { id: 'presentacion.pasivos_patrimonio', concepto: 'Total pasivos y patrimonio', grupoId: 'patrimonio', orden },
    numero(pasivos) && numero(patrimonio) ? pasivos + patrimonio : null));
  return salida;
}

const BLOQUES_ER = [
  ['derived.gross_sales', 'is.sales_total', 'Total de ventas', '+', ['ventas'], ['is.product_sales', 'is.service_revenue', 'is.other_sales_revenue']],
  [null, null, null, '−', ['deduccionesVentas'], ['is.sales_returns', 'is.sales_discounts', 'is.sales_allowances']],
  ['derived.net_sales', 'is.net_sales_reported', 'Ventas netas', null, [], []],
  ['derived.cost_of_sales', 'is.cost_of_sales_reported', 'Costo de ventas', '−', ['costoVentas'], ['is.merchandise_cost', 'is.product_cost', 'is.service_cost']],
  ['derived.gross_profit', 'is.gross_profit_reported', 'Utilidad bruta', null, [], []],
  [null, null, null, '+', [], ['is.other_operating_income']],
  ['derived.operating_expenses', 'presentacion.gastos_operativos', 'Total de gastos operativos', '−', ['gastosAdmin', 'gastosVentas'],
    ['is.administrative_expenses', 'is.selling_expenses', 'is.operating_depreciation', 'is.operating_amortization', 'is.other_operating_expenses']],
  ['derived.operating_profit', 'is.operating_profit_reported', 'Utilidad operativa (UAII)', null, [], []],
  [null, null, null, '+', ['otrosIngresos'], ['is.nonoperating_income', 'is.interest_income']],
  [null, null, null, '−', ['otrosGastos', 'intereses'], ['is.noninterest_nonoperating_expenses', 'is.interest_expense']],
  ['derived.presentacion_uai', 'presentacion.uai', 'Utilidad antes de impuestos (UAI)', null, [], []],
  [null, null, null, '−', ['impuestos'], ['is.income_tax_expense']],
  ['derived.net_income', 'is.net_income_reported', 'Utilidad neta (UN)', null, [], []]
];

function resultadosResueltos(datos, periodo, filas) {
  const delGrupo = filas.filter(f => f.grupoId === 'estadoResultados');
  if (!delGrupo.length) return [];
  const contexto = crearContextoRazonesGuardadas(datos, periodo);
  const restantes = new Set(delGrupo);
  const salida = [];
  const idsSubtotales = new Set(BLOQUES_ER.map(b => b[1]).filter(Boolean));
  BLOQUES_ER.forEach(([derivado, id, concepto, operador, tipos, ids], i) => {
    const orden = 1000 + i * 20;
    for (const f of restantes) {
      if (idsSubtotales.has(f.id)) continue;
      if (!(ids.includes(f.id) || (!f.id && tipos.includes(f.tipoCuenta)))) continue;
      salida.push({ ...f, operador, orden }); restantes.delete(f);
    }
    if (!derivado) return;
    const consulta = contexto.fallo ? { valor: null, motivos: [contexto.fallo] }
      : evaluarConComposicion(() => evaluarDerivado(RAZON_ER, derivado, contexto.entrada, {}, consultasER), contexto.entrada);
    salida.push(subtotal(delGrupo, { id, concepto, grupoId: 'estadoResultados', orden: orden + 10 }, consulta.valor, consulta.motivos));
    for (const f of restantes) if (f.id === id) restantes.delete(f);
  });
  // No se asigna una función contable a cuentas cuyo tipo todavía es incierto.
  for (const f of restantes) salida.push({ ...f, orden: 1300, operador: '' });
  return salida;
}

export function estadosResueltos(datos, periodo) {
  if (!datos?.periods?.includes(periodo)) return { balanceGeneral: [], estadoResultados: [] };
  const { lectura, calculo } = lecturaBorrador(datos);
  const filas = cuentasPeriodo(lectura, periodo);
  const compatibles = { ...calculo, pendingAccounts: (calculo.pendingAccounts || []).map(f => ({
    ...f, identificacion: f.identificacion || { estado: 'no_reconocida' }
  })) };
  return { balanceGeneral: balanceResuelto(filas, computeFinancialTotals(compatibles, periodo)),
    estadoResultados: resultadosResueltos(calculo, periodo, filas) };
}
