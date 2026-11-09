// Datos de ejemplo de AGRI-CORP para la demostración (proyecto final GFO 2026).
// Fuente: AGRICORP_GFO_datos_reales_y_simulados_justificados.md.
//
// Hay dos casos separados que NO se deben mezclar ni sumar (sección I y VI del dossier):
//   - historico: AGRI-CORP consolidada, estados auditados 2023 y 2024 (cifras REALES en C$).
//   - simulado:  Unidad_Comercial_Arroz_Demo_2027, jul–sep 2027 (cifras INVENTADAS, solo docentes).
// El presupuesto personal (ficticio) se incluye en ambos.
//
// Solo datos, sin DOM ni store. Las cifras calculadas (presupuestos, caja, GAO/GAF/GAT, proforma)
// NO se guardan: salen de las fórmulas de cada módulo.
import { registrarCuenta } from '../modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../modules/estados/estados-normalize.js';

// ---------- Caso histórico real: AGRI-CORP consolidada ----------

const REAL_ACTIVOS = [
  // [cuenta, tipo, 2023, 2024]
  ['Efectivo', 'efectivo', 70837459, 284636118],
  ['Cuentas por cobrar a clientes', 'cxC', 919245520, 1160810469],
  ['Activos mantenidos para la venta', 'activosCorrientesOtros', 139540598, 133374515],
  ['Activo financiero a costo amortizado', 'activosCorrientesOtros', 0, 3160677],
  ['Otros activos financieros a costo amortizado (corriente)', 'activosCorrientesOtros', 345894825, 509964388],
  ['Cuentas y documentos por cobrar a partes relacionadas (corriente)', 'activosCorrientesOtros', 474203132, 482736490],
  ['Inventarios', 'inventario', 1180606300, 1621305239],
  ['Otros activos (corriente)', 'activosCorrientesOtros', 72169, 26603],
  ['Cuentas y documentos por cobrar a partes relacionadas (no corriente)', 'activosFijos', 225357135, 228273402],
  ['Otros activos financieros a costo amortizado (no corriente)', 'activosFijos', 8167247, 1216866],
  ['Inversiones por el método de participación', 'activosFijos', 12519114, 15104274],
  ['Activos financieros a valor razonable (VRORI)', 'activosFijos', 256514034, 256514034],
  ['Propiedad, planta y equipos', 'activosFijos', 1598740842, 1571088222],
  ['Activos por derecho de uso', 'activosFijos', 19141180, 20460361],
  ['Activos intangibles', 'activosFijos', 16378500, 6320510],
  ['Otros activos (no corriente)', 'activosFijos', 22506048, 33140528]
];

const REAL_PASIVOS = [
  ['Préstamos por pagar (corriente)', 'pasivoCortoPlazo', 1725890504, 1762614697],
  ['Documentos por pagar (corriente)', 'pasivoCortoPlazo', 386390267, 359864099],
  ['Cuentas y documentos por pagar a partes relacionadas (corriente)', 'pasivoCortoPlazo', 513755625, 868126830],
  ['Proveedores', 'cuentasPorPagar', 404590181, 1039869493],
  ['Pasivo por arrendamiento (corriente)', 'pasivoCortoPlazo', 13058258, 12283446],
  ['Impuesto sobre la renta por pagar', 'pasivoCortoPlazo', 437257071, 148959541],
  ['Cuentas por pagar y gastos acumulados', 'provisiones', 213218003, 174894746],
  ['Préstamos por pagar (no corriente)', 'pasivoLargoPlazo', 601987067, 744971522],
  ['Documentos por pagar (no corriente)', 'pasivoLargoPlazo', 3340319, 52821542],
  ['Pasivo por arrendamiento (no corriente)', 'pasivoLargoPlazo', 10008186, 10671079],
  ['Obligaciones post-empleo', 'pasivoLargoPlazo', 41732593, 43624964],
  ['Cuentas y documentos por pagar a partes relacionadas (no corriente)', 'pasivoLargoPlazo', 50670635, 42613289],
  ['Impuesto sobre la renta diferido', 'pasivoLargoPlazo', 57119047, 66595757]
];

const REAL_PATRIMONIO = [
  ['Capital social común', 'patrimonio', 476176000, 476176000],
  ['Capital social preferente', 'patrimonio', 262998840, 348028158],
  ['Reserva legal', 'patrimonio', 47617691, 47617691],
  ['Superávit por revaluación', 'patrimonio', 8508572, 55695277],
  ['Efecto de conversión de moneda', 'patrimonio', 16652855, 16652855],
  ['Utilidades retenidas (déficit acumulado)', 'patrimonio', -2656945, 29796514],
  ['Participaciones no controladoras', 'patrimonio', 21409334, 26255196]
];

// Estado de resultados: importes positivos; el tipo define si suma o resta.
const REAL_RESULTADOS = [
  ['Ingresos procedentes de contratos con clientes', 'ventas', 9355895570, 9010443238],
  ['Costo de ventas', 'costoVentas', 7967257505, 7539860126],
  ['Gastos de mercadeo y ventas', 'gastosVentas', 573616923, 562260236],
  ['Gastos de administración', 'gastosAdmin', 150376398, 151041897],
  ['Gastos de tráfico de almacenes', 'gastosVentas', 197510015, 215360471],
  ['Otros gastos', 'otrosGastos', 239524557, 209248155],
  ['Otros ingresos', 'otrosIngresos', 69212845, 24995050],
  ['Gastos financieros', 'intereses', 262177780, 275824274],
  ['Pérdida cambiaria, neta', 'otrosGastos', 32726261, 3682989],
  ['Ingresos financieros', 'otrosIngresos', 35771615, 53045676],
  ['Participación en utilidad neta de asociadas', 'otrosIngresos', 856420, 2585160],
  ['Provisión para el impuesto sobre la renta', 'impuestos', 458130322, 91567028]
];

function porPeriodo(filas, columna) {
  return Object.fromEntries(filas.map(fila => [fila[0], fila[columna]]));
}

function tiposDe(filas) {
  return Object.fromEntries(filas.map(fila => [fila[0], fila[1]]));
}

// Cuenta del catálogo (js/modules/estados/cuentas-catalogo.js) a la que corresponde cada cuenta
// del ejemplo. Sin esta confirmación el motor de identificación solo «sugiere» las cuentas con
// nombres propios y deja en N/D las razones que dependen de ellas. Es lo mismo que confirmar la
// cuenta a mano en Estados. Se evitan los totales reportados del catálogo para no duplicar sumas.
const CATALOGO = {
  // AGRI-CORP: activos
  'Efectivo': 'bs.cash_and_equivalents',
  'Cuentas por cobrar a clientes': 'bs.trade_receivables',
  'Activos mantenidos para la venta': 'bs.other_current_assets',
  'Activo financiero a costo amortizado': 'bs.other_current_assets',
  'Otros activos financieros a costo amortizado (corriente)': 'bs.other_current_assets',
  'Cuentas y documentos por cobrar a partes relacionadas (corriente)': 'bs.other_current_receivables',
  'Inventarios': 'bs.inventory_finished_goods',
  'Otros activos (corriente)': 'bs.other_current_assets',
  'Cuentas y documentos por cobrar a partes relacionadas (no corriente)': 'bs.other_noncurrent_assets',
  'Otros activos financieros a costo amortizado (no corriente)': 'bs.other_noncurrent_assets',
  'Inversiones por el método de participación': 'bs.long_term_investments',
  'Activos financieros a valor razonable (VRORI)': 'bs.long_term_investments',
  'Propiedad, planta y equipos': 'bs.ppe_other',
  'Activos por derecho de uso': 'bs.other_noncurrent_assets',
  'Activos intangibles': 'bs.intangible_assets',
  'Otros activos (no corriente)': 'bs.other_noncurrent_assets',
  // AGRI-CORP: pasivos
  'Préstamos por pagar (corriente)': 'bs.short_term_borrowings',
  'Documentos por pagar (corriente)': 'bs.short_term_borrowings',
  'Cuentas y documentos por pagar a partes relacionadas (corriente)': 'bs.other_current_liabilities',
  'Proveedores': 'bs.trade_payables',
  'Pasivo por arrendamiento (corriente)': 'bs.other_current_liabilities',
  'Impuesto sobre la renta por pagar': 'bs.taxes_payable',
  'Cuentas por pagar y gastos acumulados': 'bs.current_provisions',
  'Préstamos por pagar (no corriente)': 'bs.long_term_borrowings',
  'Documentos por pagar (no corriente)': 'bs.long_term_borrowings',
  'Pasivo por arrendamiento (no corriente)': 'bs.other_noncurrent_liabilities',
  'Obligaciones post-empleo': 'bs.long_term_provisions',
  'Cuentas y documentos por pagar a partes relacionadas (no corriente)': 'bs.other_noncurrent_liabilities',
  'Impuesto sobre la renta diferido': 'bs.other_noncurrent_liabilities',
  // AGRI-CORP: patrimonio
  'Capital social común': 'bs.share_capital',
  'Capital social preferente': 'bs.share_capital',
  'Reserva legal': 'bs.legal_reserve',
  'Superávit por revaluación': 'bs.other_reserves',
  'Efecto de conversión de moneda': 'bs.other_equity_components',
  'Utilidades retenidas (déficit acumulado)': 'bs.retained_earnings',
  'Participaciones no controladoras': 'bs.other_equity_components',
  // AGRI-CORP: resultados
  'Ingresos procedentes de contratos con clientes': 'is.product_sales',
  'Costo de ventas': 'is.product_cost',
  'Gastos de mercadeo y ventas': 'is.selling_expenses',
  'Gastos de administración': 'is.administrative_expenses',
  'Gastos de tráfico de almacenes': 'is.selling_expenses',
  'Otros gastos': 'is.noninterest_nonoperating_expenses',
  'Otros ingresos': 'is.nonoperating_income',
  'Gastos financieros': 'is.interest_expense',
  'Pérdida cambiaria, neta': 'is.noninterest_nonoperating_expenses',
  'Ingresos financieros': 'is.interest_income',
  'Participación en utilidad neta de asociadas': 'is.nonoperating_income',
  'Provisión para el impuesto sobre la renta': 'is.income_tax_expense',
  // Unidad simulada
  'Clientes por cobrar': 'bs.trade_receivables',
  'Inventario de arroz': 'bs.inventory_merchandise',
  'Propiedad, planta y equipo neto': 'bs.ppe_other',
  'Proveedores por pagar': 'bs.trade_payables',
  'Préstamo a largo plazo': 'bs.long_term_borrowings',
  'Patrimonio': 'bs.other_equity_components',
  'Ventas de arroz': 'is.product_sales',
  'Costo de mercancía vendida': 'is.merchandise_cost',
  'Gastos variables de reparto': 'is.selling_expenses',
  'Costos fijos (incluye depreciación)': 'is.administrative_expenses',
  'Gastos por intereses': 'is.interest_expense',
  'Impuesto sobre la renta (ilustrativo)': 'is.income_tax_expense'
};

// Los cuatro estados de cada periodo están completos (sin partidas omitidas): así el motor trata
// como cero las cuentas del catálogo que el ejemplo no usa en lugar de dejar la razón en N/D.
// Los ingresos de clientes no incluyen intereses: los ingresos financieros van aparte.
function coberturaYComposicion(periodos) {
  return {
    coberturaEstados: Object.fromEntries(periodos.map(p => [p,
      { activos: 'completo', pasivos: 'completo', patrimonio: 'completo', estadoResultados: 'completo' }])),
    composicionIngresos: Object.fromEntries(periodos.map(p => [p, 'excluye_intereses']))
  };
}

function identidadesDe(grupos) {
  return Object.fromEntries(Object.entries(grupos).map(([grupo, nombres]) => [grupo, Object.fromEntries(nombres.map(nombre => {
    if (!CATALOGO[nombre]) throw new Error(`Cuenta sin identificador del catálogo: ${nombre}`);
    return [nombre, { idCuenta: CATALOGO[nombre], estado: 'reconocida', metodo: 'confirmacion_manual', candidatos: [], origen: 'manual' }];
  }))]));
}

function estadosDe(nombre, periodos, grupos) {
  const { activos, pasivos, patrimonio, resultados } = grupos;
  return {
    name: nombre,
    periods: periodos,
    balanceGeneral: Object.fromEntries(periodos.map((periodo, k) => [periodo, {
      activos: porPeriodo(activos, 2 + k),
      pasivos: porPeriodo(pasivos, 2 + k),
      patrimonio: porPeriodo(patrimonio, 2 + k)
    }])),
    estadoResultados: Object.fromEntries(periodos.map((periodo, k) => [periodo, porPeriodo(resultados, 2 + k)])),
    accountTypes: {
      activos: tiposDe(activos),
      pasivos: tiposDe(pasivos),
      patrimonio: tiposDe(patrimonio),
      estadoResultados: tiposDe(resultados)
    },
    accountIdentities: identidadesDe({
      activos: activos.map(f => f[0]), pasivos: pasivos.map(f => f[0]),
      patrimonio: patrimonio.map(f => f[0]), estadoResultados: resultados.map(f => f[0])
    }),
    ...coberturaYComposicion(periodos)
  };
}

// Flujo de efectivo consolidado 2024 (estado auditado, líneas netas agrupadas por actividad).
function flujoReal2024() {
  const m = (id, concepto, actividad, tipo, monto) => ({ id, concepto, actividad, tipo, monto });
  return {
    saldoInicial: 70837459,
    periodoBase: '2023',
    movimientos: [
      m('real-f1', 'Efectivo de operaciones antes de intereses e impuestos', 'operacion', 'entrada', 758587482),
      m('real-f2', 'Impuestos sobre la renta pagados', 'operacion', 'salida', 374194121),
      m('real-f3', 'Intereses cobrados', 'operacion', 'entrada', 12611343),
      m('real-f4', 'Intereses pagados', 'operacion', 'salida', 206971340),
      m('real-f5', 'Préstamos otorgados a partes relacionadas', 'inversion', 'salida', 46190672),
      m('real-f6', 'Pagos recibidos por préstamos a partes relacionadas', 'inversion', 'entrada', 7124865),
      m('real-f7', 'Cuentas por cobrar a partes relacionadas', 'inversion', 'entrada', 5957397),
      m('real-f8', 'Adquisición de activos intangibles', 'inversion', 'salida', 9121425),
      m('real-f9', 'Adiciones de propiedad, planta y equipos', 'inversion', 'salida', 36286932),
      m('real-f10', 'Contratación de préstamos', 'financiamiento', 'entrada', 4240845895),
      m('real-f11', 'Pagos de préstamos', 'financiamiento', 'salida', 4061137253),
      m('real-f12', 'Contrataciones de documentos por pagar', 'financiamiento', 'entrada', 597311913),
      m('real-f13', 'Pagos de documentos por pagar', 'financiamiento', 'salida', 574357520),
      m('real-f14', 'Pagos a financiamientos de partes relacionadas', 'financiamiento', 'salida', 163791333),
      m('real-f15', 'Venta de acciones preferentes', 'financiamiento', 'entrada', 85029318),
      m('real-f16', 'Dividendos pagados sobre acciones preferentes', 'financiamiento', 'salida', 7520629),
      m('real-f17', 'Pagos de principal de arrendamiento', 'financiamiento', 'salida', 14098329)
    ]
  };
}

export function casoHistoricoReal() {
  return {
    id: 'historico',
    nombre: 'AGRI-CORP consolidada (estados auditados 2023 y 2024, cifras reales)',
    estados: estadosDe('Corporación Agrícola, S. A. y subsidiarias (AGRI-CORP)', ['2023', '2024'], {
      activos: REAL_ACTIVOS, pasivos: REAL_PASIVOS, patrimonio: REAL_PATRIMONIO, resultados: REAL_RESULTADOS
    }),
    // Dividendos preferentes 2023 y 2024 (nota 34). Sin clasificación fijo/variable: no hay base
    // pública, así que el GAO queda N/D (el dossier prohíbe llamarlo «GAO real»).
    apalancamiento: { comportamiento: {}, dap: { '2023': 1948421, '2024': 7520630 }, tasaDefecto: null },
    // 476,176 acciones comunes; sin dividendos comunes (nota 4); sin cotización pública representativa.
    razonesMercado: { periodos: {
      '2023': { acciones: 476176, precio: null, dividendos: 0 },
      '2024': { acciones: 476176, precio: null, dividendos: 0 }
    } },
    flujo: flujoReal2024()
  };
}

// ---------- Caso operativo simulado: Unidad_Comercial_Arroz_Demo_2027 ----------

const PRECIO = 900;
const COSTO = 620;
const REPARTO = 30;
const FIJOS = 450000;
const FIJOS_PAGADOS = 440000;
const INTERES = 20000;
const DIVIDENDO = 15000;
const TASA_IR = 0.3;
const MESES = ['2027-07', '2027-08', '2027-09'];
const VENTAS_U = [3800, 4200, 4600];

// Saldos de cierre de cada mes (comprobados contra las secciones III.8 y III.9 del dossier).
const CIERRE = {
  '2027-07': { efectivo: 1805480, cxc: 1710000, inventario: 520800, ppe: 1190000, cxp: 1428480, patrimonio: 1797800 },
  '2027-08': { efectivo: 1990560, cxc: 1890000, inventario: 570400, ppe: 1330000, cxp: 1592160, patrimonio: 2188800 },
  '2027-09': { efectivo: 2380760, cxc: 2070000, inventario: 620000, ppe: 1320000, cxp: 1740960, patrimonio: 2649800 }
};

function estadosSimulados() {
  const resultados = {};
  const balance = {};
  MESES.forEach((mes, k) => {
    const u = VENTAS_U[k];
    const ventas = u * PRECIO;
    const ir = Math.round((ventas - u * COSTO - u * REPARTO - FIJOS - INTERES) * TASA_IR);
    resultados[mes] = {
      'Ventas de arroz': ventas,
      'Costo de mercancía vendida': u * COSTO,
      'Gastos variables de reparto': u * REPARTO,
      'Costos fijos (incluye depreciación)': FIJOS,
      'Gastos por intereses': INTERES,
      'Impuesto sobre la renta (ilustrativo)': ir
    };
    const c = CIERRE[mes];
    balance[mes] = {
      activos: {
        'Efectivo': c.efectivo,
        'Clientes por cobrar': c.cxc,
        'Inventario de arroz': c.inventario,
        'Propiedad, planta y equipo neto': c.ppe
      },
      pasivos: { 'Proveedores por pagar': c.cxp, 'Préstamo a largo plazo': 2000000 },
      patrimonio: { 'Patrimonio': c.patrimonio }
    };
  });
  const base = {
    name: 'Unidad_Comercial_Arroz_Demo_2027 (SIMULADA, no es AGRI-CORP)',
    periods: MESES,
    balanceGeneral: balance,
    estadoResultados: resultados,
    accountTypes: {
      activos: {
        'Efectivo': 'efectivo', 'Clientes por cobrar': 'cxC', 'Inventario de arroz': 'inventario',
        'Propiedad, planta y equipo neto': 'activosFijos'
      },
      pasivos: { 'Proveedores por pagar': 'cuentasPorPagar', 'Préstamo a largo plazo': 'pasivoLargoPlazo' },
      patrimonio: { 'Patrimonio': 'patrimonio' },
      estadoResultados: {
        'Ventas de arroz': 'ventas', 'Costo de mercancía vendida': 'costoVentas',
        'Gastos variables de reparto': 'gastosVentas', 'Costos fijos (incluye depreciación)': 'gastosAdmin',
        'Gastos por intereses': 'intereses', 'Impuesto sobre la renta (ilustrativo)': 'impuestos'
      }
    },
    accountIdentities: identidadesDe({
      activos: ['Efectivo', 'Clientes por cobrar', 'Inventario de arroz', 'Propiedad, planta y equipo neto'],
      pasivos: ['Proveedores por pagar', 'Préstamo a largo plazo'],
      patrimonio: ['Patrimonio'],
      estadoResultados: ['Ventas de arroz', 'Costo de mercancía vendida', 'Gastos variables de reparto',
        'Costos fijos (incluye depreciación)', 'Gastos por intereses', 'Impuesto sobre la renta (ilustrativo)']
    }),
    ...coberturaYComposicion(MESES)
  };
  // Premisas del dossier (III.2 y III.8): 50 % de las ventas a crédito y pagos reales a proveedores.
  const pagosProveedores = [2291520, 2489920, 2752800];
  return registrarCuenta(normalizeFinancialData(base), MESES.flatMap((periodo, k) => [
    { id: 'supp.credit_sales', nombre: 'Ventas a crédito (50 % de las ventas)', periodo, importe: VENTAS_U[k] * PRECIO * 0.5, confirmado: true },
    { id: 'supp.supplier_payments', nombre: 'Pagos a proveedores del mes', periodo, importe: pagosProveedores[k], confirmado: true }
  ]));
}

function inventarioSimulado() {
  const producto = 'Saco de arroz 100 lb';
  const mov = (id, fecha, tipo, cantidad, concepto) => ({ id, productoId: 'arroz-100lb', fecha, tipo, cantidad, concepto });
  return {
    productos: [{
      id: 'arroz-100lb', nombre: producto, unidad: 'sacos',
      existenciaInicial: 800, costoUnitario: COSTO, stockMinimo: 800
    }],
    // Compras (política de inventario final = 20 % de las ventas del mes siguiente) y ventas.
    movimientos: [
      mov('arroz-c-jul', '2027-07-01', 'entrada', 3840, 'Compras de julio'),
      mov('arroz-v-jul', '2027-07-31', 'salida', 3800, 'Ventas de julio'),
      mov('arroz-c-ago', '2027-08-01', 'entrada', 4280, 'Compras de agosto'),
      mov('arroz-v-ago', '2027-08-31', 'salida', 4200, 'Ventas de agosto'),
      mov('arroz-c-sep', '2027-09-01', 'entrada', 4680, 'Compras de septiembre'),
      mov('arroz-v-sep', '2027-09-30', 'salida', 4600, 'Ventas de septiembre')
    ]
  };
}

// Flujo del trimestre (método directo). Sus totales cuadran con el presupuesto de caja: variación 880,760.
function flujoSimulado() {
  const m = (id, concepto, actividad, tipo, monto) => ({ id, concepto, actividad, tipo, monto });
  return {
    saldoInicial: 1500000,
    periodoBase: '',
    movimientos: [
      m('sim-f1', 'Cobros a clientes (jul–sep)', 'operacion', 'entrada', 3330000 + 3600000 + 3960000),
      m('sim-f2', 'Pagos a proveedores', 'operacion', 'salida', 2291520 + 2489920 + 2752800),
      m('sim-f3', 'Gastos de reparto', 'operacion', 'salida', 114000 + 126000 + 138000),
      m('sim-f4', 'Costos fijos pagados', 'operacion', 'salida', FIJOS_PAGADOS * 3),
      m('sim-f5', 'Intereses pagados', 'operacion', 'salida', INTERES * 3),
      m('sim-f6', 'Impuesto sobre la renta pagado', 'operacion', 'salida', 144000 + 174000 + 204000),
      m('sim-f7', 'Inversión en activos fijos (agosto)', 'inversion', 'salida', 150000),
      m('sim-f8', 'Dividendos preferentes pagados', 'financiamiento', 'salida', DIVIDENDO * 3)
    ]
  };
}

// Supuestos del presupuesto maestro. El IR y los dividendos preferentes se pagan en el mes: el
// módulo no los tiene como supuesto, así que entran en «otros desembolsos» para que la caja
// cuadre con el dossier (III.8). El capex de agosto también.
function planeacionSimulada() {
  const irMes = [144000, 174000, 204000];
  return {
    tipoPeriodo: 'Mes', periodos: 3, precio: PRECIO, costoUnitario: COSTO,
    ventasUnidades: VENTAS_U, pctContado: 0.5, cxcInicial: 1620000,
    pctComprasContado: 0.4, cxpInicial: 1339200,
    inventarioInicial: 800, pctInventarioFinal: 0.2, inventarioFinalUltimo: 1000,
    pctGastosVariables: REPARTO / PRECIO, gastosFijos: FIJOS_PAGADOS, depreciacion: FIJOS - FIJOS_PAGADOS,
    intereses: INTERES, otrosDesembolsos: irMes.map((ir, k) => ir + DIVIDENDO + (k === 1 ? 150000 : 0)),
    tasaIR: TASA_IR, saldoInicialCaja: 1500000,
    // El dossier no define un saldo mínimo de caja: 0 para no inventar una política.
    saldoMinimoCaja: 0,
    productoInventario: 'Saco de arroz 100 lb', stockMinimo: 800
  };
}

export function casoOperativoSimulado() {
  return {
    id: 'simulado',
    nombre: 'Unidad_Comercial_Arroz_Demo_2027 (jul–sep 2027, datos inventados)',
    estados: estadosSimulados(),
    apalancamiento: {
      comportamiento: {
        'Costo de mercancía vendida': { tipo: 'variable' },
        'Gastos variables de reparto': { tipo: 'variable' },
        'Costos fijos (incluye depreciación)': { tipo: 'fijo' }
      },
      dap: Object.fromEntries(MESES.map(mes => [mes, DIVIDENDO])),
      tasaDefecto: TASA_IR
    },
    // 100,000 acciones del escenario; sin precio de mercado ni dividendos comunes.
    razonesMercado: { periodos: Object.fromEntries(MESES.map(mes => [mes, { acciones: 100000, precio: null, dividendos: 0 }])) },
    flujo: flujoSimulado(),
    inventario: inventarioSimulado(),
    // Base C-V-U de agosto (sección III.6).
    equilibrio: {
      precio: PRECIO, costoVariableUnitario: COSTO + REPARTO, costosFijos: FIJOS, unidades: 4200, utilidadObjetivo: null,
      escenario: { precio: 0, costoVariable: 0, costosFijos: 0, volumen: 0 }
    },
    planeacion: { supuestos: planeacionSimulada() }
  };
}

// ---------- Presupuesto personal ficticio (sección IV) ----------

// El ahorro planificado (2,400/mes) va como meta de ahorro a 12 meses, no como gasto.
export function presupuestoPersonalDemo() {
  const gasto = (concepto, monto, categoria) => ({ concepto, monto, categoria });
  return {
    ingresoMensual: 20500,
    metaAhorro: 2400 * 12,
    mesesDisponibles: 12,
    ingresos: [
      { concepto: 'Trabajo a tiempo parcial', monto: 18000, tipo: 'regular' },
      { concepto: 'Trabajo eventual', monto: 2500, tipo: 'ocasional' }
    ],
    gastos: [
      gasto('Vivienda', 4500, 'necesidad'), gasto('Alimentación', 4400, 'necesidad'),
      gasto('Transporte', 2400, 'necesidad'), gasto('Servicios', 1200, 'necesidad'),
      gasto('Estudios', 2000, 'necesidad'), gasto('Salud', 700, 'imprevisto'),
      gasto('Entretenimiento', 1000, 'deseo'), gasto('Otros', 900, 'deseo')
    ],
    semanas: []
  };
}
