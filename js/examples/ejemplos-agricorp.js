import { adjuntarFlujoDocumentado } from '../modules/estados/estados-flujo-documentado.js';
// Datos de AGRI-CORP: el caso central de la app (D-113).
//
// Hay dos capas que NO se suman entre sí:
//   - consolidado: Corporación Agrícola, S. A. y subsidiarias, estados auditados 2022–2025
//     (cifras REALES en C$) más supuestos declarados y visibles.
//   - línea de arroz: escenario simulado jul–sep 2027 (cifras INVENTADAS, solo docentes).
// El presupuesto personal ficticio se ofrece aparte; no se mezcla con los módulos de empresa.
//
// Fuentes del consolidado (documento de investigación «AGRI-CORP: estados, datos útiles y
// supuestos para GFO» y su anexo de flujos e inventarios):
//   F02  auditado 2023, con comparativo 2022: balance p. 5, resultados p. 6, flujo 2022 p. 8.
//   F03  auditado 2024: flujos 2023 y 2024 p. 9; acciones comunes, nota 34.
//   F04  auditado 2025 (BDO): balance p. 7 y resultados p. 8 de 2024 y 2025; flujo 2025 p. 10.
// 2022–2023 reproducen F02 y 2024–2025 reproducen F04, con las mismas líneas: F04 separa el
// pago mínimo definitivo y la porción corriente de la deuda de largo plazo; F02 no las presenta
// por separado, así que esas cuentas no existen en 2022–2023 (no se rellenan con cero).
//
// Solo datos, sin DOM ni store. Las cifras calculadas (presupuestos, caja, GAO/GAF/GAT, proforma)
// NO se guardan: salen de las fórmulas de cada módulo.
import { registrarCuenta } from '../modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../modules/estados/estados-normalize.js';

// ---------- AGRI-CORP consolidada: estados auditados 2022–2025 ----------

export const PERIODOS_REALES = ['2022', '2023', '2024', '2025'];
export const EMPRESA_AGRICORP = 'Corporación Agrícola, S. A. y subsidiarias (AGRI-CORP)';

// [cuenta, tipo, 2022, 2023, 2024, 2025]. null = la fuente de esa columna no presenta la partida.
const REAL_ACTIVOS = [
  ['Efectivo y equivalentes de efectivo', 'efectivo', 230869144, 70837459, 284636118, 149251171],
  ['Cuentas por cobrar a clientes', 'cxC', 807443466, 919245520, 1160810469, 1073865816],
  ['Activos mantenidos para la venta', 'activosCorrientesOtros', 49850500, 139540598, 133374515, 140216922],
  ['Activo financiero a costo amortizado', 'activosCorrientesOtros', null, null, 3160677, 3160677],
  ['Otros activos financieros a costo amortizado (corriente)', 'activosCorrientesOtros', 266763609, 345966994, 509964388, 209478971],
  ['Cuentas y documentos por cobrar a partes relacionadas (corriente)', 'activosCorrientesOtros', 317459678, 474203132, 482736490, 280934177],
  ['Inventarios', 'inventario', 1410622339, 1180606300, 1621305239, 1546028593],
  ['Otros activos (corriente)', 'activosCorrientesOtros', null, null, 26603, null],
  ['Cuentas y documentos por cobrar a partes relacionadas (no corriente)', 'activosFijos', 54712511, 225357135, 228273402, 303360687],
  ['Otros activos financieros a costo amortizado (no corriente)', 'activosFijos', 13222021, 8167247, 1216866, 9853514],
  ['Inversiones por el método de participación', 'activosFijos', 11662694, 12519114, 15104274, 15780755],
  ['Activos financieros a valor razonable (VRORI)', 'activosFijos', 253762189, 256514034, 256514034, null],
  ['Propiedad, planta y equipos', 'activosFijos', 1679610691, 1598740842, 1571088222, 1486614825],
  ['Activos por derecho de uso', 'activosFijos', 31645309, 19141180, 20460361, 26396653],
  ['Activos intangibles', 'activosFijos', 22950330, 16378500, 6320510, 4302737],
  ['Otros activos (no corriente)', 'activosFijos', 54925063, 22506048, 33140528, 30724344]
];

const REAL_PASIVOS = [
  ['Préstamos por pagar (corriente)', 'pasivoCortoPlazo', 1682185298, 1725890504, 1510216214, 1525967690],
  ['Porción corriente de préstamos a largo plazo', 'pasivoCortoPlazo', null, null, 252398483, 215833203],
  ['Documentos por pagar (corriente)', 'pasivoCortoPlazo', 350670637, 386390267, 359864099, 270521327],
  ['Cuentas y documentos por pagar a partes relacionadas (corriente)', 'pasivoCortoPlazo', 416267521, 513755625, 868126830, 958486941],
  ['Proveedores', 'cuentasPorPagar', 453159401, 404590181, 1039869493, 644576373],
  ['Pasivo por arrendamiento (corriente)', 'pasivoCortoPlazo', 11652961, 13058258, 12283446, 13827841],
  ['Impuesto sobre la renta por pagar', 'pasivoCortoPlazo', null, 437257071, 148959541, null],
  ['Cuentas por pagar y gastos acumulados', 'provisiones', 150496600, 213218003, 174894746, 145889913],
  ['Préstamos por pagar (no corriente)', 'pasivoLargoPlazo', 904783251, 601987067, 744971522, 532398283],
  ['Documentos por pagar (no corriente)', 'pasivoLargoPlazo', 109491511, 3340319, 52821542, null],
  ['Pasivo por arrendamiento (no corriente)', 'pasivoLargoPlazo', 24144103, 10008186, 10671079, 13710966],
  ['Obligaciones post-empleo', 'pasivoLargoPlazo', 39055007, 41732593, 43624964, 31486386],
  ['Cuentas y documentos por pagar a partes relacionadas (no corriente)', 'pasivoLargoPlazo', 15941816, 50670635, 42613289, 14100356],
  ['Impuesto sobre la renta diferido', 'pasivoLargoPlazo', 47304376, 57119047, 66595757, 67785998]
];

const REAL_PATRIMONIO = [
  ['Capital social común', 'patrimonio', 476176000, 476176000, 476176000, 476176000],
  ['Capital social preferente', 'patrimonio', 8267884, 262998840, 348028158, 358702159],
  ['Reserva legal', 'patrimonio', 47617691, 47617691, 47617691, 47617691],
  ['Superávit por revaluación', 'patrimonio', 234124770, 8508572, 55695277, 55488855],
  ['Efecto de conversión de moneda', 'patrimonio', 16472461, 16652855, 16652855, 16652855],
  ['Utilidades retenidas (déficit acumulado)', 'patrimonio', 195410776, -2656945, 29796514, -140673929],
  ['Participaciones no controladoras', 'patrimonio', 22277480, 21409334, 26255196, 31420934]
];

// Estado de resultados: importes positivos; el tipo define si suma o resta. Las partidas antes de
// los gastos financieros forman la utilidad operativa, como el subtotal del auditado
// («antes de partidas financieras»): 335,413,089 / 296,823,017 / 357,667,403 / 196,252,210.
const REAL_RESULTADOS = [
  ['Ingresos de contratos con clientes', 'ventas', 8342024681, 9355895570, 9010443238, 7895371400],
  ['Costo de ventas', 'costoVentas', 7086559300, 7967257505, 7539860126, 6461733590],
  ['Gastos de mercadeo y ventas', 'gastosVentas', 511800132, 573616923, 562260236, 640070996],
  ['Gastos de administración', 'gastosAdmin', 141592808, 150376398, 151041897, 143295077],
  ['Gastos de tráfico de almacenes', 'gastosVentas', 185810532, 197510015, 215360471, 267787833],
  ['Gasto por pago mínimo definitivo', 'otrosGastos', null, null, 192060853, 188682180],
  ['Otros gastos', 'otrosGastos', 117936673, 239524557, 17187302, 18652400],
  ['Otros ingresos', 'otrosIngresos', 37087853, 69212845, 24995050, 21102886],
  ['Gastos financieros', 'intereses', 247792263, 262177780, 275824274, 327207977],
  ['Pérdida cambiaria, neta', 'otrosGastos', 62085790, 32726261, 3682989, 16103294],
  ['Ingresos financieros', 'otrosIngresos', 34665705, 35771615, 53045676, 45818036],
  ['Participación en utilidad neta de asociadas', 'otrosIngresos', 2714237, 856420, 2585160, 676480],
  ['Provisión para el impuesto sobre la renta', 'impuestos', 50786334, 458130322, 91567028, 57425953]
];

// Una partida que la fuente de esa columna no presenta no se escribe en ese periodo.
function porPeriodo(filas, columna) {
  return Object.fromEntries(filas.filter(fila => fila[columna] !== null).map(fila => [fila[0], fila[columna]]));
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
  'Efectivo y equivalentes de efectivo': 'bs.cash_and_equivalents',
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
  'Porción corriente de préstamos a largo plazo': 'bs.current_portion_long_term_debt',
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
  'Ingresos de contratos con clientes': 'is.product_sales',
  'Costo de ventas': 'is.product_cost',
  'Gastos de mercadeo y ventas': 'is.selling_expenses',
  'Gastos de administración': 'is.administrative_expenses',
  'Gastos de tráfico de almacenes': 'is.selling_expenses',
  // El auditado presenta estas tres partidas antes de las partidas financieras: son operativas.
  'Gasto por pago mínimo definitivo': 'is.other_operating_expenses',
  'Otros gastos': 'is.other_operating_expenses',
  'Otros ingresos': 'is.other_operating_income',
  'Gastos financieros': 'is.interest_expense',
  'Pérdida cambiaria, neta': 'is.noninterest_nonoperating_expenses',
  'Ingresos financieros': 'is.interest_income',
  'Participación en utilidad neta de asociadas': 'is.nonoperating_income',
  'Provisión para el impuesto sobre la renta': 'is.income_tax_expense',
  // Unidad simulada
  'Efectivo': 'bs.cash_and_equivalents',
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

// ---------- Supuestos S1–S3 (documento de investigación, sección 11) ----------
// No son datos de AGRI-CORP: se declaran para que las razones de actividad tengan base. El
// nombre de cada cuenta lo dice, y el usuario puede editarlos en Estados.
export const SUPUESTOS_CREDITO = Object.freeze({ ventasCredito: 0.5, comprasCredito: 0.6 });

const filaDe = (filas, nombre) => filas.find(fila => fila[0] === nombre);

// S1: ventas a crédito = 50 % de las ventas de cada año.
// S2–S3: compras estimadas = costo de ventas + inventario final − inventario inicial (aproximación
// docente; en una empresa que produce no demuestra las compras reales). 60 % de ellas a crédito.
// El motor de razones toma «pagos a proveedores» y deriva las compras a crédito como
// pagos + proveedores final − proveedores inicial; por eso se declara el pago que, con el saldo
// real de proveedores, reproduce exactamente ese 60 %. 2022 no tiene inventario de 2021: sin base.
export function datosSuplementariosAgricorp() {
  const ventas = filaDe(REAL_RESULTADOS, 'Ingresos de contratos con clientes');
  const costo = filaDe(REAL_RESULTADOS, 'Costo de ventas');
  const inventario = filaDe(REAL_ACTIVOS, 'Inventarios');
  const proveedores = filaDe(REAL_PASIVOS, 'Proveedores');
  return PERIODOS_REALES.flatMap((periodo, k) => {
    const c = 2 + k;
    const registros = [{ id: 'supp.credit_sales', nombre: 'Ventas a crédito (SUPUESTO: 50 % de las ventas)',
      periodo, importe: ventas[c] * 5 / 10, confirmado: true }];
    if (k > 0) {
      const compras = costo[c] + inventario[c] - inventario[c - 1];
      const comprasCredito = compras * 6 / 10;
      registros.push({ id: 'supp.supplier_payments', nombre: 'Pagos a proveedores (SUPUESTO: 60 % de las compras estimadas, a crédito)',
        periodo, importe: comprasCredito - (proveedores[c] - proveedores[c - 1]), confirmado: true });
    }
    return registros;
  });
}

// ---------- Flujos de efectivo publicados ----------
// Una sola versión por año (anexo de flujos, tabla 1). Operación: el estado usa el método
// indirecto; aquí entra su subtotal publicado más las tres líneas que sí son de caja, para no
// inventar cobros ni pagos. El detalle indirecto completo queda en el documento fuente.
// 2022 y 2023 separan además el efecto de conversión sobre el efectivo (no es una actividad).
const FLUJOS_REALES = {
  '2022': {
    inicial: '2021', saldoInicial: 110110140, efectoConversion: 323599,
    fuente: 'F02 · Estados consolidados auditados 2023 · Flujo comparativo 2022, p. 8',
    partidas: [
      ['Operación antes de intereses e impuestos (subtotal indirecto publicado)', 'operacion', 218255609],
      ['Impuesto sobre la renta pagado', 'operacion', -41532605],
      ['Intereses pagados', 'operacion', -207891280],
      ['Préstamos otorgados a partes relacionadas', 'inversion', -87302060],
      ['Pagos recibidos por préstamos a partes relacionadas', 'inversion', 47350810],
      ['Adquisición de activos intangibles', 'inversion', -10383500],
      ['Adiciones de propiedad, planta y equipo', 'inversion', -90541013],
      ['Contratación de préstamos', 'financiamiento', 3682508715],
      ['Pagos de préstamos', 'financiamiento', -3373955800],
      ['Contrataciones de documentos por pagar', 'financiamiento', 491097575],
      ['Pagos de documentos por pagar', 'financiamiento', -492432507],
      ['Cuentas por cobrar a partes relacionadas (financiamiento)', 'financiamiento', 32611015],
      ['Préstamos recibidos de partes relacionadas', 'financiamiento', 1903699],
      ['Pagos de financiamientos de partes relacionadas', 'financiamiento', -5838248],
      ['Recompra de acciones preferentes', 'financiamiento', -27700983],
      ['Dividendos pagados sobre acciones preferentes', 'financiamiento', -4443312],
      ['Pago de principal de arrendamientos', 'financiamiento', -11270710]
    ]
  },
  '2023': {
    inicial: '2022', saldoInicial: 230869144, efectoConversion: 180394,
    fuente: 'F03 · Estados consolidados auditados 2024 · Flujo comparativo 2023, p. 9',
    partidas: [
      ['Operación antes de intereses e impuestos (subtotal indirecto publicado)', 'operacion', 573640542],
      ['Impuesto sobre la renta pagado', 'operacion', -11058580],
      ['Intereses cobrados', 'operacion', 7844369],
      ['Intereses pagados', 'operacion', -216937087],
      ['Préstamos otorgados a partes relacionadas', 'inversion', -8603379],
      ['Pagos recibidos por venta de subsidiaria', 'inversion', 9693541],
      ['Pagos recibidos por préstamos a partes relacionadas', 'inversion', 4576138],
      ['Cuentas por cobrar a partes relacionadas', 'inversion', -109810866],
      ['Adquisición de activos intangibles', 'inversion', -11598542],
      ['Adiciones de propiedad, planta y equipo', 'inversion', -81188234],
      ['Contratación de préstamos', 'financiamiento', 4116250543],
      ['Pagos de préstamos', 'financiamiento', -4401126200],
      ['Contrataciones de documentos por pagar', 'financiamiento', 437221266],
      ['Pagos de documentos por pagar', 'financiamiento', -512459876],
      ['Pagos de financiamientos de partes relacionadas', 'financiamiento', -2587867],
      ['Pago recibido por venta de acciones preferentes', 'financiamiento', 60935420],
      ['Dividendos pagados sobre acciones preferentes', 'financiamiento', -1948421],
      ['Pago de principal de arrendamientos', 'financiamiento', -13054846]
    ]
  },
  '2024': {
    inicial: '2023', saldoInicial: 70837459,
    fuente: 'F03 · Estados consolidados auditados 2024 · Estado de flujos de efectivo, p. 9',
    partidas: [
      ['Operación antes de intereses e impuestos (subtotal indirecto publicado)', 'operacion', 758587482],
      ['Impuesto sobre la renta pagado', 'operacion', -374194121],
      ['Intereses cobrados', 'operacion', 12611343],
      ['Intereses pagados', 'operacion', -206971340],
      ['Préstamos otorgados a partes relacionadas', 'inversion', -46190672],
      ['Pagos recibidos por préstamos a partes relacionadas', 'inversion', 7124865],
      ['Cuentas por cobrar a partes relacionadas', 'inversion', 5957397],
      ['Adquisición de activos intangibles', 'inversion', -9121425],
      ['Adiciones de propiedad, planta y equipo', 'inversion', -36286932],
      ['Contratación de préstamos', 'financiamiento', 4240845895],
      ['Pagos de préstamos', 'financiamiento', -4061137253],
      ['Contrataciones de documentos por pagar', 'financiamiento', 597311913],
      ['Pagos de documentos por pagar', 'financiamiento', -574357520],
      ['Pagos de financiamientos de partes relacionadas', 'financiamiento', -163791333],
      ['Pago recibido por venta de acciones preferentes', 'financiamiento', 85029318],
      ['Dividendos pagados sobre acciones preferentes', 'financiamiento', -7520629],
      ['Pago de principal de arrendamientos', 'financiamiento', -14098329]
    ]
  },
  '2025': {
    inicial: '2024', saldoInicial: 284636118,
    fuente: 'F04 · Estados consolidados auditados 2025 (BDO) · Estado de flujos de efectivo, p. 10',
    partidas: [
      ['Operación antes de intereses e impuestos (subtotal indirecto publicado)', 'operacion', 713049482],
      ['Impuesto sobre la renta pagado', 'operacion', -393877433],
      ['Intereses cobrados', 'operacion', 45818036],
      ['Intereses pagados', 'operacion', -327207977],
      ['Adquisición de activos intangibles', 'inversion', -6068021],
      ['Adiciones de propiedad, planta y equipo', 'inversion', -29180606],
      ['Aumento de activos recibidos para la venta', 'inversion', -6842407],
      // Positivo en F04 aunque el rótulo diga «usado en»: se conserva el signo publicado.
      ['Disminución de activos financieros a valor razonable (VRORI)', 'inversion', 256514034],
      ['Contratación de préstamos', 'financiamiento', 5043336095],
      ['Pagos de préstamos', 'financiamiento', -5276723138],
      ['Contrataciones de documentos por pagar', 'financiamiento', 395333898],
      ['Pagos de documentos por pagar', 'financiamiento', -537470820],
      ['Pago recibido por venta de acciones preferentes', 'financiamiento', 10674001],
      ['Dividendos pagados sobre acciones preferentes', 'financiamiento', -7520629],
      ['Pago de principal de arrendamientos', 'financiamiento', -15219462]
    ]
  }
};

export function flujoRealAgricorp(final) {
  const f = FLUJOS_REALES[final];
  if (!f) throw new Error(`No hay flujo publicado de AGRI-CORP cargado para ${final}.`);
  return {
    saldoInicial: f.saldoInicial,
    periodoBase: f.inicial,
    ...(f.efectoConversion ? { efectoConversion: f.efectoConversion } : {}),
    movimientos: f.partidas.map(([concepto, actividad, monto], i) => ({
      id: `real-${final}-${i + 1}`, concepto, actividad, tipo: monto < 0 ? 'salida' : 'entrada', monto: Math.abs(monto)
    }))
  };
}

// Dividendos preferentes PAGADOS según cada flujo (F02 p. 8, F03 p. 9, F04 p. 10). Un pago no
// siempre coincide con el dividendo declarado; la nota 34 de F03 muestra 7,520,630 para 2024.
const DAP_PAGADOS = { '2022': 4443312, '2023': 1948421, '2024': 7520629, '2025': 7520629 };

// 476,176 acciones comunes de C$ 1,000 nominales (F03, nota 34); el capital común no cambia en
// 2022–2025. Sin dividendos comunes ni cotización pública.
const ACCIONES_COMUNES = 476176;

// ---------- Supuestos S4–S7 (documento de investigación, sección 11) ----------
// S4: costo de ventas 75 % variable. S5: gastos de operación 25 % variable (mercadeo y ventas,
// administración, tráfico de almacenes y otros gastos operativos). S6: el pago mínimo definitivo
// se calcula sobre los ingresos, así que es variable. Los otros ingresos operativos no se
// clasifican: Apalancamiento los suma a la UAII como ingreso fijo.
export const SUPUESTOS_COSTOS = Object.freeze({ costoVentasVariable: 0.75, gastosOperacionVariable: 0.25 });

export function comportamientoAgricorp(pctCostoVentas = SUPUESTOS_COSTOS.costoVentasVariable) {
  const gasto = { tipo: 'mixto', pctVariable: SUPUESTOS_COSTOS.gastosOperacionVariable };
  return {
    'Costo de ventas': { tipo: 'mixto', pctVariable: pctCostoVentas },
    'Gastos de mercadeo y ventas': { ...gasto },
    'Gastos de administración': { ...gasto },
    'Gastos de tráfico de almacenes': { ...gasto },
    'Otros gastos': { ...gasto },
    'Gasto por pago mínimo definitivo': { tipo: 'variable' }
  };
}

// Depreciación de PPE + depreciación de derecho de uso + amortización de intangibles, tomadas de
// los ajustes de cada flujo publicado (anexo de flujos, tabla 2). Dato REAL de referencia: un
// costo fijo seguro con el que Apalancamiento comprueba la clasificación supuesta.
export const DEPRECIACION_AMORTIZACION = Object.freeze({
  '2022': 102534709 + 11791555 + 17204051,
  '2023': 115373159 + 12504129 + 18250540,
  '2024': 117394766 + 12667239 + 19179415,
  '2025': 113568824 + 13867452 + 8085794
});

// ---------- Inventario ----------
// Composición REAL por categoría al 31 de diciembre (anexo de flujos e inventarios, tabla 6):
// 2022–2023 de F02 nota 12 p. 36, 2024 de F03 nota 12 p. 42, 2025 de F04 nota 12 p. 47.
// Son saldos contables en dinero, no existencias físicas.
const COMPOSICION_INVENTARIO = {
  fuente: 'Notas de inventarios de los auditados: F02 nota 12 p. 36 (2022–2023), F03 nota 12 p. 42 (2024) y F04 nota 12 p. 47 (2025)',
  periodos: ['2022', '2023', '2024', '2025'],
  categorias: [
    { nombre: 'Granza de arroz (materia prima)', importes: [821158348, 468536868, 848279169, 902648496] },
    { nombre: 'Sal (materia prima)', importes: [341289, 56973525, 21409278, 2256408] },
    { nombre: 'Productos terminados producidos', importes: [138705017, 240157652, 470778502, 383715028] },
    { nombre: 'Productos terminados adquiridos', importes: [259733122, 218515031, 134712829, 37749132] },
    { nombre: 'Insumos y aditivos', importes: [12165688, 10865680, 6064438, 6939182] },
    { nombre: 'Repuestos y accesorios', importes: [69009942, 77972732, 83335009, 79757164] },
    { nombre: 'Material de empaque', importes: [21235133, 21100287, 20178995, 17285427] },
    { nombre: 'Importaciones en tránsito', importes: [86963257, 82508623, 30751594, 117770506] },
    { nombre: 'Otros', importes: [3370863, 6436584, 8293312, 5458786] }
  ],
  deterioro: [2060320, 2460682, 2497887, 7551536]
};

// S16: kárdex de granza con cantidades HIPOTÉTICAS. El valor de apertura (cierre 2024) y el de
// cierre (2025) son reales; el costo por quintal y los movimientos son supuestos:
//   - costo: C$ 620 por quintal (el mismo de la línea de arroz simulada);
//   - consumo anual = rotación del inventario consolidado 2025 × granza promedio 2024–2025;
//   - compras = consumo + (granza 2025 − granza 2024), así el kárdex cierra en el saldo real;
//   - cuatro trimestres iguales, compras al inicio y consumo al cierre de cada trimestre;
//   - stock mínimo = un mes de consumo.
export const COSTO_QUINTAL_SUPUESTO = 620;

export function kardexGranzaAgricorp() {
  const granza = COMPOSICION_INVENTARIO.categorias[0].importes;
  const [inicial, final] = [granza[2], granza[3]];
  const costo2025 = filaDe(REAL_RESULTADOS, 'Costo de ventas')[5];
  const inventario = filaDe(REAL_ACTIVOS, 'Inventarios');
  const rotacion2025 = costo2025 / ((inventario[4] + inventario[5]) / 2);
  const consumo = rotacion2025 * (inicial + final) / 2;
  const compras = consumo + (final - inicial);
  const q = valor => valor / COSTO_QUINTAL_SUPUESTO;
  const trimestres = [['01-01', '03-31'], ['04-01', '06-30'], ['07-01', '09-30'], ['10-01', '12-31']];
  const movimientos = trimestres.flatMap(([inicio, fin], k) => [
    { id: `granza-c${k + 1}`, productoId: 'granza-arroz', fecha: `2025-${inicio}`, tipo: 'entrada',
      cantidad: q(compras / 4), costoUnitario: COSTO_QUINTAL_SUPUESTO, concepto: `Compras T${k + 1} 2025 (SUPUESTO)` },
    { id: `granza-s${k + 1}`, productoId: 'granza-arroz', fecha: `2025-${fin}`, tipo: 'salida',
      cantidad: q(consumo / 4), concepto: `Consumo en producción T${k + 1} 2025 (SUPUESTO)` }
  ]);
  return {
    producto: { id: 'granza-arroz', nombre: 'Granza de arroz (materia prima)', unidad: 'quintales',
      existenciaInicial: q(inicial), costoUnitario: COSTO_QUINTAL_SUPUESTO, stockMinimo: q(consumo) / 12 },
    movimientos, consumo, compras, rotacion2025
  };
}

function inventarioAgricorp() {
  const { producto, movimientos } = kardexGranzaAgricorp();
  return { productos: [producto], movimientos, composicion: structuredClone(COMPOSICION_INVENTARIO) };
}

// ---------- Presupuesto maestro 2025 (supuestos S8–S15) ----------
// Proyecta 2025 por trimestres desde el cierre real de 2024; el 2025 auditado queda como
// contraste. Unidad «C$1 al costo»: costo unitario 1 y precio = ventas / costo de ventas de 2024,
// así compras, costo de ventas e inventario se leen en C$ y la apertura coincide con el balance.
//   S8   ventas 2025 = ventas 2024 × 1.0135 (crecimiento de las ventas proyectadas en F05).
//   S9   cuatro trimestres iguales.
//   S1/S2 50 % de las ventas al contado; 40 % de las compras al contado.
//   S15  inventario final = días de inventario de 2024 (67.82) → fracción de las ventas del
//        trimestre siguiente = 4 × inventario promedio 2024 / costo de ventas 2024.
//   S4–S6 en el presupuesto: los gastos de operación se reparten 25 % variable / 75 % fijo y el
//        pago mínimo definitivo es variable. Los otros ingresos operativos reducen los gastos fijos
//        y la depreciación y amortización (S13) se separan de ellos porque no salen de caja.
//        El módulo valora el costo de ventas al costo completo por unidad (costeo absorbente): su
//        punto de equilibrio trata todo el costo de ventas como variable. El punto de equilibrio
//        del caso es el de la pantalla Punto de equilibrio, con S4.
//   S10  IR 30 % de la UAI positiva; el módulo no lo paga dentro del horizonte.
//   Intereses: los gastos financieros de 2024, sin cambio. Las demás partidas no operativas
//        (ingresos financieros, diferencial cambiario, asociadas) no se proyectan.
//   Otros desembolsos: inversión (S14) y dividendos preferentes (S11) por cuartos, y en el T1 el
//        IR por pagar al cierre de 2024 (148,959,541). Saldo mínimo de caja: 0, sin política publicada.
export const CRECIMIENTO_VENTAS_2025 = 0.0135;
export const INVERSION_2025 = 36286932 + 9121425;
export const DIVIDENDOS_2025 = 7520629;

export function presupuestoAgricorp2025() {
  const valor = (filas, nombre, k = 4) => filaDe(filas, nombre)[k];
  const ventas = valor(REAL_RESULTADOS, 'Ingresos de contratos con clientes');
  const costo = valor(REAL_RESULTADOS, 'Costo de ventas');
  const gastosOperacion = ['Gastos de mercadeo y ventas', 'Gastos de administración', 'Gastos de tráfico de almacenes', 'Otros gastos']
    .reduce((suma, nombre) => suma + valor(REAL_RESULTADOS, nombre), 0);
  const pagoMinimo = valor(REAL_RESULTADOS, 'Gasto por pago mínimo definitivo');
  const otrosIngresosOperativos = valor(REAL_RESULTADOS, 'Otros ingresos');
  const dya = DEPRECIACION_AMORTIZACION['2024'];
  const inventario = filaDe(REAL_ACTIVOS, 'Inventarios');
  const unidadesTrimestre = costo * (1 + CRECIMIENTO_VENTAS_2025) / 4;
  const pctInventarioFinal = 4 * ((inventario[3] + inventario[4]) / 2) / costo;
  const desembolsoTrimestral = (INVERSION_2025 + DIVIDENDOS_2025) / 4;
  const irPorPagar2024 = valor(REAL_PASIVOS, 'Impuesto sobre la renta por pagar');
  return {
    tipoPeriodo: 'Trimestre', periodos: 4,
    unidad: 'C$1 al costo (precio = ventas / costo de ventas de 2024)',
    nota: 'Presupuesto 2025 de AGRI-CORP consolidada desde el cierre real de 2024. Ventas +1.35 % en cuatro trimestres iguales; '
      + '50 % al contado; compras 40 % al contado; inventario final de 67.82 días; gastos de operación 25 % variables, pago mínimo '
      + 'variable; IR 30 %; inversión y dividendos de 2024 repetidos; el IR por pagar de 2024 se paga en el T1. El costo de ventas '
      + 'se valora completo por unidad: el punto de equilibrio de esta pantalla lo trata todo como variable; el del caso está en '
      + 'Punto de equilibrio. Contraste: el 2025 auditado está en Estados.',
    precio: ventas / costo, costoUnitario: 1,
    ventasUnidades: Array(4).fill(unidadesTrimestre),
    pctContado: 1 - SUPUESTOS_CREDITO.ventasCredito,
    cxcInicial: valor(REAL_ACTIVOS, 'Cuentas por cobrar a clientes'),
    pctComprasContado: 1 - SUPUESTOS_CREDITO.comprasCredito,
    cxpInicial: valor(REAL_PASIVOS, 'Proveedores'),
    inventarioInicial: inventario[4],
    pctInventarioFinal,
    // Sin el T1 de 2026, el último trimestre usa la misma política sobre sus propias ventas.
    inventarioFinalUltimo: unidadesTrimestre * pctInventarioFinal,
    pctGastosVariables: (SUPUESTOS_COSTOS.gastosOperacionVariable * gastosOperacion + pagoMinimo) / ventas,
    gastosFijos: ((1 - SUPUESTOS_COSTOS.gastosOperacionVariable) * gastosOperacion - otrosIngresosOperativos - dya) / 4,
    depreciacion: dya / 4,
    intereses: valor(REAL_RESULTADOS, 'Gastos financieros') / 4,
    otrosDesembolsos: [0, 1, 2, 3].map(k => desembolsoTrimestral + (k === 0 ? irPorPagar2024 : 0)),
    tasaIR: 0.3,
    saldoInicialCaja: valor(REAL_ACTIVOS, 'Efectivo y equivalentes de efectivo'),
    saldoMinimoCaja: 0,
    productoInventario: '', productoId: '',
    // Balance proforma: abre con el balance real de 2024 y reparte los otros desembolsos.
    periodoBase: '2024',
    desgloseOtrosDesembolsos: { inversion: INVERSION_2025, dividendos: DIVIDENDOS_2025, impuestos: irPorPagar2024 }
  };
}

// S7: precio ilustrativo, no observado. Solo sirve para mostrar el cálculo de P/U y P/VL.
export const PRECIO_ACCION_SUPUESTO = 100;
const NOTA_PRECIO = 'Precio por acción de C$ 100 en todos los años (S7): número ilustrativo, no es una cotización. '
  + 'El valor nominal es C$ 1,000 y no hay precio de mercado publicado. El patrimonio incluye capital preferente '
  + 'y participaciones no controladoras: el valor en libros por acción común queda sobrestimado.';

export function casoHistoricoReal() {
  let estados = registrarCuenta(normalizeFinancialData(estadosDe(EMPRESA_AGRICORP, [...PERIODOS_REALES], {
    activos: REAL_ACTIVOS, pasivos: REAL_PASIVOS, patrimonio: REAL_PATRIMONIO, resultados: REAL_RESULTADOS
  })), datosSuplementariosAgricorp());
  // Los flujos se adjuntan al final: su revisión identifica los estados ya completos.
  for (const [final, f] of Object.entries(FLUJOS_REALES)) {
    estados = adjuntarFlujoDocumentado(estados, flujoRealAgricorp(final), { tipo: 'reportado', fuente: f.fuente, inicial: f.inicial, final });
  }
  return {
    id: 'historico',
    nombre: 'AGRI-CORP consolidada (estados auditados 2022–2025 y supuestos declarados)',
    estados,
    apalancamiento: {
      comportamiento: comportamientoAgricorp(), dap: { ...DAP_PAGADOS }, tasaDefecto: null,
      depreciacionAmortizacion: { ...DEPRECIACION_AMORTIZACION }
    },
    razonesMercado: {
      periodos: Object.fromEntries(PERIODOS_REALES.map(p => [p, { acciones: ACCIONES_COMUNES, precio: PRECIO_ACCION_SUPUESTO, dividendos: 0 }])),
      nota: NOTA_PRECIO
    },
    // La captura de Flujo abre el mismo año que Análisis, Inicio y Proforma: el último cargado.
    flujo: flujoRealAgricorp(PERIODOS_REALES.at(-1)),
    inventario: inventarioAgricorp(),
    planeacion: { supuestos: presupuestoAgricorp2025() },
    // C-V-U consolidado: se deriva de los estados de 2024 (año base de la proyección) con la
    // clasificación de Apalancamiento, en C$1 de ventas porque no hay unidades físicas publicadas.
    equilibrio: {
      origen: 'estados', periodo: '2024', unidadVentas: true, unidades: null, utilidadObjetivo: null,
      escenario: { precio: 0, costoVariable: 0, costosFijos: 0, volumen: 0 }
    }
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
  const mov = (id, fecha, tipo, cantidad, concepto) => ({ id, productoId: 'arroz-100lb', fecha, tipo, cantidad, concepto, ...(tipo === 'entrada' ? { costoUnitario:COSTO } : {}) });
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
    ventasUnidades: [...VENTAS_U], pctContado: 0.5, cxcInicial: 1620000,
    pctComprasContado: 0.4, cxpInicial: 1339200,
    inventarioInicial: 800, pctInventarioFinal: 0.2, inventarioFinalUltimo: 1000,
    pctGastosVariables: REPARTO / PRECIO, gastosFijos: FIJOS_PAGADOS, depreciacion: FIJOS - FIJOS_PAGADOS,
    intereses: INTERES, otrosDesembolsos: irMes.map((ir, k) => ir + DIVIDENDO + (k === 1 ? 150000 : 0)),
    tasaIR: TASA_IR, saldoInicialCaja: 1500000,
    // El dossier no define un saldo mínimo de caja: 0 para no inventar una política.
    saldoMinimoCaja: 0,
    productoInventario: 'Saco de arroz 100 lb', productoId:'arroz-100lb'
  };
}

export function casoOperativoSimulado() {
  return {
    id: 'simulado',
    nombre: 'Unidad_Comercial_Arroz_Demo_2027 (jul–sep 2027, datos inventados)',
    estados: adjuntarFlujoDocumentado(estadosSimulados(), flujoSimulado(), { tipo:'simulado', fuente:'Dossier AGRI-CORP · III.8–III.9 · Caja y conciliación trimestral simuladas', inicial:'2027-06', final:'2027-09' }),
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
