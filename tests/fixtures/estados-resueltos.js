import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { listarCuentas } from '../../js/modules/estados/cuentas-identificador.js';

// Sesión 3, diaps. 22–25: julio UB=72000−42000=30000;
// UAII=30000−19000=11000; UAI=11000−1000=10000; UN=10000−3000=7000.
// Los ceros de partidas no detalladas y la agrupación de los 19000 son
// acreditaciones SINTÉTICAS del fixture, no datos adicionales del profesor.
export function ejemploEstadosResueltos(periods = ['Julio']) {
  const base = { name: 'Ejemplo resuelto', periods,
    balanceGeneral: Object.fromEntries(periods.map(p => [p, { activos: {}, pasivos: {}, patrimonio: {} }])),
    estadoResultados: Object.fromEntries(periods.map(p => [p, {}])) };
  const filas = periods.flatMap(periodo => [
    ...listarCuentas({ grupo: 'estadoResultados' }).filter(c => c.rol !== 'reported_total').map(c =>
      ({ periodo, id: c.id, nombre: `Dato ${c.id}`, importe: c.id === 'is.product_sales' ? 72000 : c.id === 'is.merchandise_cost' ? 42000
        : c.id === 'is.other_operating_expenses' ? 19000
        : c.id === 'is.interest_expense' ? 1000 : c.id === 'is.income_tax_expense' ? 3000 : 0, confirmado: true })),
    { periodo, id: 'is.net_sales_reported', nombre: 'Ventas del ejercicio', importe: 72000 },
    { periodo, id: 'is.cost_of_sales_reported', nombre: 'Costo del ejercicio', importe: 42000 }
  ]);
  const datos = registrarCuenta(base, filas);
  datos.composicionIngresos = Object.fromEntries(periods.map(p => [p, 'excluye_intereses']));
  return datos;
}

