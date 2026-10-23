// Datos de las celdas B5: 370000 / 160000 y 412000 / 175000.
const datos = [
  ['bs.cash_and_equivalents',45000,52000],
  ['bs.trade_receivables',120000,135000],
  ['bs.inventory_total',180000,195000],
  ['bs.other_current_assets',25000,30000],
  ['bs.trade_payables',85000,92000],
  ['bs.other_current_liabilities',60000,65000],
  ['bs.current_provisions',15000,18000]
];

export function entradaPiloto(indice = 1) {
  return { periodos:{ actual:indice ? '2024' : '2023', anterior:indice ? '2023' : null, cantidad:2, indice },
    cuentas:datos.map(([id,anterior,actual]) => indice
      ? { id, estado:'reconocida', origen:'importacion', current:actual, previous:anterior }
      : { id, estado:'reconocida', origen:'importacion', current:anterior }) };
}
