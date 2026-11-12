// D-113: mapa de supuestos de AGRI-CORP para Inicio. Lee el valor VIGENTE de cada supuesto en el
// módulo donde se edita (si se cambia allí, el mapa lo refleja) y dice de dónde sale.
// Lógica pura: recibe los datos del store y devuelve filas; la pantalla las dibuja.
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { consultarMontoCuenta } from '../estados/cuentas-identificador.js';
import { formatCurrencyND, formatNumberND, formatPercentND } from '../../utils/format.js';

const esNumero = v => typeof v === 'number' && Number.isFinite(v);
const pct = v => (esNumero(v) ? formatPercentND(v, 2) : 'N/D');
const INVESTIGACION = 'Investigación de AGRI-CORP, sección 11';
const EQUIPO = 'Decisión del equipo (plan D-113)';

// Lo que se toma tal como lo publican las fuentes.
export const DATOS_REALES = [
  'Balance y estado de resultados auditados 2022–2025 (F02, F03 y F04)',
  'Flujos de efectivo publicados 2022–2025, línea por línea',
  'Inventario por categoría 2022–2025 (notas de inventarios)',
  'Dividendos preferentes pagados, depreciación y amortización de cada flujo',
  '476,176 acciones comunes (F03, nota 34)'
];

function leer(fn) {
  try {
    const valor = fn();
    return valor === null || valor === undefined || valor === '' ? 'N/D' : valor;
  } catch {
    return 'N/D';
  }
}

export function mapaSupuestos(datos) {
  if (datos?.casos?.estados?.caso !== 'agricorp-consolidado') return null;
  const estados = datos.estados;
  if (!estados?.periods?.length) return null;
  const s = datos.planeacion?.supuestos || null;
  const base = s?.periodoBase && estados.periods.includes(s.periodoBase) ? s.periodoBase : estados.periods.at(-1);
  const anterior = estados.periods[estados.periods.indexOf(base) - 1] ?? null;
  const t = computeFinancialTotals(estados, base);
  const tPrev = anterior ? computeFinancialTotals(estados, anterior) : null;
  const cuenta = (periodo, id) => consultarMontoCuenta(estados, periodo, id).valor;
  const comp = nombre => datos.apalancamiento?.comportamiento?.[nombre];
  const pctComp = nombre => {
    const c = comp(nombre);
    if (!c) return null;
    return c.tipo === 'variable' ? 'Variable (100 %)' : c.tipo === 'fijo' ? 'Fijo' : `${pct(c.pctVariable)} variable`;
  };
  const precioUltimo = datos.razonesMercado?.periodos?.[estados.periods.at(-1)]?.precio;
  const granza = datos.inventario?.productos?.find(p => p.id === 'granza-arroz');
  const ventasPresupuesto = s ? s.ventasUnidades.reduce((suma, u) => suma + u * s.precio, 0) : null;
  const diasPeriodo = s?.tipoPeriodo === 'Mes' ? 365 / 12 : 365 / 4;
  const fila = (id, supuesto, valor, fuente, modulo, ruta) => ({ id, supuesto, valor: leer(valor), fuente, modulo, ruta });
  return {
    base,
    filas: [
      fila('S1', `Ventas a crédito (${base})`, () => pct(cuenta(base, 'supp.credit_sales') / t.ventas), INVESTIGACION, 'Estados', '#/estados'),
      fila('S2–S3', `Compras a crédito sobre compras estimadas (${base})`, () => {
        const compras = t.costoVentas + t.inventario - tPrev.inventario;
        const credito = cuenta(base, 'supp.supplier_payments') + cuenta(base, 'bs.trade_payables') - cuenta(anterior, 'bs.trade_payables');
        return pct(credito / compras);
      }, INVESTIGACION, 'Estados', '#/estados'),
      fila('S4', 'Costo de ventas', () => pctComp('Costo de ventas'), INVESTIGACION, 'Apalancamiento', '#/apalancamiento'),
      fila('S5', 'Gastos de operación', () => pctComp('Gastos de administración'), INVESTIGACION, 'Apalancamiento', '#/apalancamiento'),
      fila('S6', 'Pago mínimo definitivo', () => pctComp('Gasto por pago mínimo definitivo'), EQUIPO, 'Apalancamiento', '#/apalancamiento'),
      fila('S7', 'Precio por acción común (ilustrativo)', () => (esNumero(precioUltimo) ? formatCurrencyND(precioUltimo) : null), INVESTIGACION, 'Análisis › Mercado', '#/analisis'),
      fila('—', 'Unidad del punto de equilibrio', () => (datos.equilibrio?.unidadVentas ? 'C$1 de ventas' : 'Unidades capturadas'), EQUIPO, 'Punto de equilibrio', '#/equilibrio'),
      fila('S8', `Crecimiento de ventas sobre ${base}`, () => (s ? pct(ventasPresupuesto / t.ventas - 1) : null), INVESTIGACION, 'Presupuesto maestro', '#/planeacion'),
      fila('S9', 'Reparto de las ventas', () => (s ? (new Set(s.ventasUnidades).size === 1 ? `${s.periodos} periodos iguales` : 'Distinto por periodo') : null), EQUIPO, 'Presupuesto maestro', '#/planeacion'),
      fila('S10', 'Tasa de impuesto sobre la renta', () => (s ? pct(s.tasaIR) : null), EQUIPO, 'Presupuesto maestro', '#/planeacion'),
      fila('S11', 'Dividendos del horizonte', () => (s?.desgloseOtrosDesembolsos ? formatCurrencyND(s.desgloseOtrosDesembolsos.dividendos) : null), EQUIPO, 'Presupuesto maestro', '#/planeacion'),
      fila('S12', 'Partidas sin regla de proyección', () => 'Sin cambio respecto de la apertura', EQUIPO, 'Proforma', '#/proforma'),
      fila('S13', 'Depreciación y amortización del horizonte', () => (s ? formatCurrencyND(s.depreciacion * s.periodos) : null), EQUIPO, 'Presupuesto maestro', '#/planeacion'),
      fila('S14', 'Inversión en activo fijo del horizonte', () => (s?.desgloseOtrosDesembolsos ? formatCurrencyND(s.desgloseOtrosDesembolsos.inversion) : null), EQUIPO, 'Presupuesto maestro', '#/planeacion'),
      fila('S15', 'Inventario final deseado', () => (s ? `${formatNumberND(s.pctInventarioFinal * diasPeriodo, 2)} días` : null), EQUIPO, 'Presupuesto maestro', '#/planeacion'),
      fila('S16', 'Kárdex de granza', () => (granza ? `${formatCurrencyND(granza.costoUnitario)} por quintal · stock mínimo ${formatNumberND(granza.stockMinimo, 0)} quintales` : null), EQUIPO, 'Inventario', '#/inventario')
    ]
  };
}
