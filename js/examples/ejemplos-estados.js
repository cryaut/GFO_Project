import { registrarCuenta } from '../modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../modules/estados/estados-normalize.js';

// Datos de Ejercicios_AFOD.zip. La escala 1000 pasa USD miles a USD, sin tipo de cambio.
function documento(nombre, moneda, periodos, filas, escala = 1) {
  const base = { name:nombre, moneda, periods:periodos,
    balanceGeneral:Object.fromEntries(periodos.map(p => [p, { activos:{}, pasivos:{}, patrimonio:{} }])),
    estadoResultados:Object.fromEntries(periodos.map(p => [p, {}])),
    coberturaEstados:Object.fromEntries(periodos.map(p => [p, { activos:'completo', pasivos:'completo', patrimonio:'completo' }])) };
  const registros = filas.flatMap(([id, nombreCuenta, ...importes]) => importes.flatMap((importe, i) => importe === null ? []
    : [{ id, nombre:nombreCuenta, periodo:periodos[i], importe:importe * escala, confirmado:true }]));
  const datos = registrarCuenta(base, registros);
  for (const p of periodos) if (Object.keys(datos.estadoResultados[p]).length || Object.keys(datos.reportedTotals?.[p] || {}).some(id => id.startsWith('is.'))) {
    datos.coberturaEstados[p].estadoResultados = 'completo';
  }
  return datos;
}

export function ejemploBaker() {
  return documento('Baker Corporation · AFOD', 'USD', ['2011','2012'], [
    ['bs.cash_and_equivalents','Efectivo y valores negociables',500,1000],
    ['bs.trade_receivables','Cuentas por cobrar',500,400], ['bs.inventory_total','Inventarios',900,600],
    ['bs.current_assets_total','Total de activos corrientes',1900,2000],
    ['bs.ppe_buildings','Terreno y edificios',1050,1200], ['bs.ppe_other','Maquinaria, equipo, mobiliario, vehículos y otros',1150,1300],
    ['bs.accumulated_depreciation','Depreciación acumulada',-1200,-1300], ['bs.fixed_assets_net_total','Activos fijos netos',1000,1200],
    ['bs.total_assets','Total de activos',2900,3200], ['bs.trade_payables','Cuentas por pagar',500,700],
    ['bs.short_term_borrowings','Documentos por pagar (corrientes según fuente)',700,600],
    ['bs.accrued_expenses_payable','Deuda acumulada',200,100], ['bs.current_liabilities_total','Total pasivos corrientes',1400,1400],
    ['bs.long_term_borrowings','Deuda a largo plazo',400,600], ['bs.total_liabilities','Total de pasivos',1800,2000],
    ['bs.share_capital','Acciones preferentes',100,100], ['bs.share_capital','Acciones comunes',120,120],
    ['bs.additional_paid_in_capital','Capital pagado en exceso',380,380], ['bs.retained_earnings','Ganancias retenidas',500,600],
    ['bs.total_equity','Total de patrimonio',1100,1200],
    ['is.net_sales_reported','Ingresos por ventas',null,1700], ['is.cost_of_sales_reported','Costo de bienes vendidos',null,1000],
    ['is.other_operating_expenses','Gastos de ventas, generales y administrativos',null,230],
    ['is.operating_depreciation','Gasto por depreciación',null,100], ['is.interest_expense','Gastos por intereses',null,70],
    ['is.income_tax_expense','Impuestos',null,120], ['is.gross_profit_reported','Utilidad bruta',null,700],
    ['is.operating_profit_reported','Utilidad antes de intereses e impuestos (UAII)',null,370],
    ['is.net_income_reported','Utilidad neta después de impuestos',null,180]
  ], 1000);
}

export function ejemploBartlett() {
  return documento('Bartlett Company · AFOD', 'USD', ['2011','2012'], [
    ['bs.cash_and_equivalents','Efectivo',288,363], ['bs.cash_and_equivalents','Valores negociables (equivalentes según EFE de la fuente)',51,68],
    ['bs.trade_receivables','Cuentas por cobrar',365,503], ['bs.inventory_total','Inventarios',300,289],
    ['bs.current_assets_total','Total activos corrientes',1004,1223], ['bs.ppe_buildings','Terreno y edificios',1903,2072],
    ['bs.ppe_machinery','Maquinaria y equipo',1693,1866], ['bs.ppe_furniture','Mobiliario y accesorios',316,358],
    ['bs.ppe_vehicles','Vehículos',314,275], ['bs.ppe_other','Otros activos fijos',96,98],
    ['bs.accumulated_depreciation','Depreciación acumulada',-2056,-2295], ['bs.fixed_assets_net_total','Activos fijos netos',2266,2374],
    ['bs.total_assets','Total de activos',3270,3597], ['bs.trade_payables','Cuentas por pagar',270,382],
    ['bs.short_term_borrowings','Documentos por pagar',99,79], ['bs.accrued_expenses_payable','Deudas acumuladas',114,159],
    ['bs.current_liabilities_total','Total pasivos corrientes',483,620], ['bs.long_term_borrowings','Deuda a largo plazo',967,1023],
    ['bs.total_liabilities','Total de pasivos',1450,1643], ['bs.share_capital','Acciones preferentes',200,200],
    ['bs.share_capital','Acciones comunes',190,191], ['bs.additional_paid_in_capital','Capital pagado en exceso',418,428],
    ['bs.retained_earnings','Ganancias retenidas',1012,1135], ['bs.total_equity','Total patrimonio',1820,1954],
    ['is.net_sales_reported','Ingreso por ventas',2567,3074], ['is.cost_of_sales_reported','Costo de bienes vendidos',1711,2088],
    ['is.selling_expenses','Gastos de venta',108,100], ['is.administrative_expenses','Gastos generales y administrativos',187,194],
    ['is.other_operating_expenses','Gastos de arrendamiento',35,35], ['is.operating_depreciation','Gasto por depreciación',223,239],
    ['is.interest_expense','Gastos por intereses',91,93], ['is.income_tax_expense','Impuestos',64,94],
    ['is.gross_profit_reported','Utilidad bruta',856,986], ['is.operating_profit_reported','Utilidad operativa (UAII)',303,418],
    ['is.net_income_reported','Utilidad neta después de impuestos',148,231]
  ], 1000);
}

export function ejemploPractico2() {
  return documento('Ejercicio práctico 2 · AFOD', 'UM', ['2023','2024'], [
    ['bs.cash_and_equivalents','Efectivo y equivalentes',50000,65000], ['bs.trade_receivables','Cuentas por cobrar',80000,100000],
    ['bs.inventory_total','Inventarios',120000,150000], ['bs.fixed_assets_net_total','Propiedad, planta y equipo netos',250000,280000],
    ['bs.total_assets','Total activos',500000,595000], ['bs.trade_payables','Proveedores',70000,95000],
    ['bs.short_term_borrowings','Pasivos financieros a corto plazo',30000,40000], ['bs.long_term_borrowings','Pasivos financieros a largo plazo',100000,115000],
    ['bs.total_liabilities','Total pasivos',200000,250000], ['bs.total_equity','Patrimonio',300000,345000],
    ['is.net_sales_reported','Ventas netas',600000,750000], ['is.cost_of_sales_reported','Costo de ventas',360000,450000],
    ['is.other_operating_expenses','Gastos de operación',120000,150000], ['is.interest_expense','Gastos financieros',30000,40000],
    ['is.income_tax_expense','Impuestos',27000,33000], ['is.gross_profit_reported','Utilidad bruta',240000,300000],
    ['is.net_income_reported','Utilidad neta',63000,77000]
  ]);
}

export function completarEjemploMuno(base) {
  if (!base.periods.includes('2023') || !base.periods.includes('2024')) return structuredClone(base);
  return registrarCuenta(normalizeFinancialData(base), [
    ['2023','supp.credit_sales',680000], ['2024','supp.credit_sales',736000],
    ['2023','supp.supplier_payments',500000], ['2024','supp.supplier_payments',553000]
  ].map(([periodo,id,importe]) => ({ periodo,id,importe,nombre:id === 'supp.credit_sales' ? 'Ventas a crédito declaradas' : 'Pagos a proveedores declarados',confirmado:true })));
}
