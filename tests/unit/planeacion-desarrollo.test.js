import { ejemploEstadosResueltos } from '../fixtures/estados-resueltos.js';
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { desarrolloPresupuesto } from '../../js/modules/planeacion/planeacion-desarrollo-calculations.js';
import { calcularPresupuestoMaestro, ejemploPlaneacion, normalizarSupuestos, calcularCapitalTrabajo } from '../../js/modules/planeacion/planeacion-calculations.js';
import { crearCasoComercial, leerPlaneacion } from '../../js/modules/planeacion/planeacion-escenarios.js';
import { resumenPlaneacionUI } from '../../js/modules/planeacion/planeacion-resumen-ui.js';
import { resultadosReales, construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { proformaUI } from '../../js/modules/proforma/proforma-ui.js';
import { cambiar, clic, element } from './helpers/dom-falso.js';

function julio(extra = {}) {
  // Sesión 3: 72000−42000=30000; −19000=11000; −1000=10000; −3000=7000.
  // Apertura de caja 25000 y todas las ventas/compras al contado son supuestos
  // sintéticos explícitos del test, no datos adicionales del ejercicio docente.
  return calcularPresupuestoMaestro(normalizarSupuestos({ ...ejemploPlaneacion(),
    tipoPeriodo: 'Mes', periodos: 1, ventasUnidades: [120], precio: 600, costoUnitario: 350,
    inventarioInicial: 30, inventarioFinalUltimo: 30, pctInventarioFinal: 0,
    gastosFijos: 18500, depreciacion: 500, pctGastosVariables: 0, intereses: 1000, tasaIR: 0.3,
    pctContado: 1, pctComprasContado: 1, cxcInicial: 0, cxpInicial: 0,
    saldoInicialCaja: 25000, saldoMinimoCaja: 15000, otrosDesembolsos: [0], ...extra }));
}

it('el desarrollo conserva los resultados calculados y muestra UAI antes del impuesto', () => {
  const p = julio(), copia = structuredClone(p);
  const d = desarrolloPresupuesto(p);
  expect(d.resultados.find(f => f.clave === 'utilidadBruta').valor).toBe(30000);
  expect(d.resultados.find(f => f.clave === 'uai').valor).toBe(10000);
  expect(d.resultados.find(f => f.clave === 'utilidadNeta').valor).toBe(7000);
  expect(d.resultados.find(f => f.clave === 'uai').expresion).toEqual([
    { valor: 11000, formato: 'monto' }, ' − ', { valor: 1000, formato: 'monto' }
  ]);
  expect(p).toEqual(copia);
});

it('distingue resultado, depreciación y caja antes de financiamiento', () => {
  const d = desarrolloPresupuesto(julio(), 0);
  // Pagos = 42000+18500+1000=61500; flujo=72000−61500=10500;
  // cierre=25000+10500=35500. IR 3000 queda por pagar según D-014.
  expect(d.caja.find(f => f.clave === 'desembolsos').valor).toBe(61500);
  expect(d.caja.find(f => f.clave === 'flujoNeto').valor).toBe(10500);
  expect(d.caja.find(f => f.clave === 'saldoFinal').valor).toBe(35500);
  expect(d.caja.find(f => f.clave === 'financiamiento').valor).toBe(0);
});

it('el IR del horizonte suma periodos y no aplica la tasa sobre una UAI agregada', () => {
  const d = desarrolloPresupuesto(julio({ periodos: 2, ventasUnidades: [0, 120], otrosDesembolsos: [0, 0] }));
  expect(d.resultados.find(f => f.clave === 'uai').valor).toBe(-10000);
  expect(d.resultados.find(f => f.clave === 'ir')).toMatchObject({ valor: 3000,
    expresion: [{ valor: 0, formato: 'monto' }, ' + ', { valor: 3000, formato: 'monto' }] });
  expect(d.resultados.find(f => f.clave === 'utilidadNeta').valor).toBe(-13000);
});

it('un resultado ausente sigue siendo N/D y un índice inválido no inventa una traza', () => {
  const p = julio(); p.totales.uai = null;
  expect(desarrolloPresupuesto(p).resultados.find(f => f.clave === 'uai').valor).toBeNull();
  expect(desarrolloPresupuesto(null)).toBeNull();
  expect(desarrolloPresupuesto(p, 5)).toBeNull();
});

it('el resumen completo abre con la utilidad y permite consultar caja y periodos', async () => {
  const panel = element(); resumenPlaneacionUI(panel, julio(), false);
  const contenido = panel.querySelector('#planDetalleContenido');
  expect(panel.querySelector('#planDetalleTitulo').textContent).toBe('Estado de resultados presupuestado');
  expect(contenido.innerHTML).toContain('7,000.00');
  expect(contenido.innerHTML).toContain('Cálculo con los datos guardados');
  await clic(panel, 'planTarjetaCaja');
  expect(contenido.innerHTML).toContain('35,500.00');
  await cambiar(panel, 'planPeriodoConsulta', '0');
  expect(contenido.innerHTML).toContain('Mes 1');
});

it('Proforma muestra UAI, desarrollo y resultados propios del presupuesto', () => {
  const reporte = construirReporte({ presupuesto: julio() });
  expect(reporte.proforma.uai).toBe(10000);
  expect(reporte.comparacion.find(f => f.clave === 'uai').proforma).toBe(10000);
  const page = element(); proformaUI(page, { reporte });
  expect(page.innerHTML).toContain('Desarrollo del estado de resultados proyectado');
  expect(page.innerHTML).toContain('10,000.00');
  expect(page.innerHTML).toContain('Efectivo final antes de financiamiento');
});

it('el caso parcial explica sus pendientes y no presenta ER ni caja ficticios', () => {
  const referencia = JSON.parse(readFileSync(new URL('./fixtures/caso_ficticio_referencia.json', import.meta.url), 'utf8'));
  const entradas = JSON.parse(readFileSync(new URL('../../propuesta-caso/referencia/inputs.json', import.meta.url), 'utf8'));
  const l = leerPlaneacion(crearCasoComercial(null, referencia, entradas));
  const p = calcularCapitalTrabajo(l.supuestos, l.escenario.capitalTrabajo, l.base.fechaCorte);
  const panel = element(); resumenPlaneacionUI(panel, p, true);
  expect(panel.innerHTML).toContain('Capital de trabajo · cálculo parcial');
  expect(panel.innerHTML).toContain('Pendientes: costo de ventas');
  expect(panel.querySelector('#planTarjetaResultado')).toBeNull();
  expect(panel.querySelector('#planTarjetaCaja')).toBeNull();
  expect(desarrolloPresupuesto(p)).toBeNull();
});


it('el real de Proforma reconoce los gastos operativos acreditados igual que Estados', () => {
  const r = resultadosReales(ejemploEstadosResueltos(['2025']));
  expect(r).toMatchObject({ utilidadBruta: 30000, gastosOperacion: 19000, uaii: 11000, uai: 10000, ir: 3000, utilidadNeta: 7000 });
});


it('Proforma conserva el N/D de UN sin impuesto y la UAI disponible', () => {
  const datos = ejemploEstadosResueltos(['2025']);
  delete datos.estadoResultados['2025']['Dato is.income_tax_expense'];
  expect(resultadosReales(datos)).toMatchObject({ uai: 10000, ir: null, utilidadNeta: null });
});

it('los otros ingresos operativos se presentan antes de UAII y no se restan dos veces', () => {
  const datos = ejemploEstadosResueltos(['2025']);
  datos.estadoResultados['2025']['Dato is.other_operating_income'] = 1000;
  const reporte = construirReporte({ estados: datos, presupuesto: julio() });
  expect(reporte.real).toMatchObject({ otrosOperativos: 1000, uaii: 12000, uai: 11000, utilidadNeta: 8000 });
  expect(reporte.comparacion.findIndex(f => f.clave === 'otrosOperativos')).toBeLessThan(reporte.comparacion.findIndex(f => f.clave === 'uaii'));
});
