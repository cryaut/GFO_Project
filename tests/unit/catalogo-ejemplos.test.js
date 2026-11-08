import { expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast:vi.fn() }));
import { listarEjemplos, crearEjemplo } from '../../js/examples/catalogo.js';
import { DEMO_MUNOMODA } from '../../js/modules/estados/index.js';
import { computarRazonesDesdeDatos, MAPA_RAZONES_APP } from '../../js/modules/razones/razones-app-adapter.js';
import { estadosResueltos } from '../../js/modules/estados/estados-presentacion-calculations.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { calcularFlujo, normalizarFlujo, ejemploFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { calcularCVU, normalizarEquilibrio, ejemploEquilibrio } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { ejemploPlaneacion, normalizarSupuestos, calcularPresupuestoMaestro } from '../../js/modules/planeacion/planeacion-calculations.js';
import { ejemploInventario, normalizarInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { ejemploPresupuestoPersonal } from '../../js/modules/presupuesto/index.js';
import { ejemploMercado } from '../../js/modules/analisis/mercado-calculations.js';
import { panelEjemplos, vincularEjemplos, ejemploSeleccionado } from '../../js/components/ejemplos.js';
import { element } from './helpers/dom-falso.js';
import { monedaDe, normalizarMoneda } from '../../js/utils/moneda.js';

it('todos los puntos de carga ofrecen más de una opción con procedencia y alcance', () => {
  for (const modulo of ['estados','flujo','equilibrio','planeacion','inventario','presupuesto','mercado','inicioEmpresa','inicioPersonal']) {
    const lista = listarEjemplos(modulo);
    expect(lista.length).toBeGreaterThan(1);
    expect(new Set(lista.map(e => e.id)).size).toBe(lista.length);
    expect(lista.every(e => e.fuente && e.detalle)).toBe(true);
  }
  const lista = listarEjemplos('estados'); lista[0].nombre = 'Alterado';
  expect(listarEjemplos('estados')[0].nombre).not.toBe('Alterado');
  expect(() => crearEjemplo('flujo', 'baker', ejemploFlujo)).toThrow();
});

it('el panel cambia la selección sin cargar datos y la conserva al renderizar otra vez', () => {
  const page = element(); page.innerHTML = panelEjemplos('estados', 'cargar');
  vincularEjemplos(page, 'estados');
  const select = page.querySelector('#example-estados'); select.value = 'baker'; select.onchange();
  expect(page.querySelector('#example-info-estados').textContent).toContain('Baker Completo.md');
  expect(ejemploSeleccionado(page, 'estados', () => DEMO_MUNOMODA).moneda).toBe('USD');
  page.innerHTML = panelEjemplos('estados', 'cargar'); vincularEjemplos(page, 'estados');
  expect(page.querySelector('#example-estados').value).toBe('baker');
});

it.each([
  ['baker','2012',3200000,2000000,1200000,700000,370000,180000],
  ['bartlett','2012',3597000,1643000,1954000,986000,418000,231000],
  ['practico2','2024',595000,250000,345000,300000,150000,77000]
])('contrasta %s con las cifras de la fuente y su escala', (id, p, A, P, E, UB, UAII, UN) => {
  const datos = crearEjemplo('estados', id, () => DEMO_MUNOMODA);
  const totales = computeFinancialTotals(datos, p), filas = estadosResueltos(datos, p).estadoResultados;
  expect(totales.totalActivos).toBe(A); expect(totales.totalPasivos).toBe(P); expect(totales.totalPatrimonio).toBe(E);
  expect(A).toBe(P + E);
  expect(filas.find(f => f.id === 'is.gross_profit_reported').valorCalculo).toBe(UB);
  expect(filas.find(f => f.id === 'is.operating_profit_reported').valorCalculo).toBe(UAII);
  expect(filas.find(f => f.id === 'is.net_income_reported').valorCalculo).toBe(UN);
  const razones = computarRazonesDesdeDatos(datos, p);
  expect(razones.MN).toBeCloseTo(UN / filas.find(f => f.id === 'is.net_sales_reported').valor, 12);
  expect(razones.RotCxC).toBeNull(); // La fuente no declara ventas a crédito.
});

it('MUNO integral completa las 24 razones de 2024 sin mutar el ejemplo histórico', () => {
  const copia = structuredClone(DEMO_MUNOMODA), datos = crearEjemplo('estados', 'actual', () => DEMO_MUNOMODA);
  const r = computarRazonesDesdeDatos(datos, '2024');
  expect([...Object.keys(MAPA_RAZONES_APP),'pruebaDefensiva','rotacionCapitalTrabajo','apalancamiento','solvencia'].every(k => r[k] !== null)).toBe(true);
  expect(r.RotCxC).toBeCloseTo(736000 / 127500, 12);
  expect(r.rotacionCxP).toBeCloseTo(560000 / 88500, 12); // 553000+92000−85000.
  expect(DEMO_MUNOMODA).toEqual(copia);
  expect(datos.balanceGeneral).toEqual(copia.balanceGeneral);
});

it.each([['baker-directo',780000,-300000,20000,1000000], ['bartlett-directo',500000,-347000,-61000,431000]])(
  'flujo %s reproduce el resuelto docente', (id, operacion, inversion, financiamiento, final) => {
    const datos = normalizarFlujo(crearEjemplo('flujo', id, ejemploFlujo)), r = calcularFlujo(datos);
    expect(datos.moneda).toBe('USD');
    expect(r.neto).toMatchObject({ operacion, inversion, financiamiento });
    expect(r.saldoFinal).toBe(final);
  });

it.each([['tor-base',100000,200000],['tor-alto',120000,290000]])('C-V-U %s reproduce la práctica TOR', (id, Q, UAII) => {
  const datos = normalizarEquilibrio(crearEjemplo('equilibrio', id, ejemploEquilibrio)), r = calcularCVU(datos);
  expect(datos.moneda).toBe('UM'); expect(r.q).toBe(Q); expect(r.uaii).toBe(UAII);
  expect(r.peUnidades).toBeCloseTo(250000 / 4.5, 8);
});

it('las variantes ficticias usan el modelo existente y no se atribuyen al profesor', () => {
  const plan = crearEjemplo('planeacion','contado',ejemploPlaneacion);
  expect(calcularPresupuestoMaestro(normalizarSupuestos(plan))).not.toBeNull(); expect(plan.pctContado).toBe(1);
  const inv = normalizarInventario(crearEjemplo('inventario','bodega',ejemploInventario));
  expect(inv.productos).toHaveLength(4); expect(inv.movimientos).toEqual([]);
  const p = crearEjemplo('presupuesto','salario',ejemploPresupuestoPersonal);
  expect(p.ingresos).toHaveLength(1); expect(p.ingresoMensual).toBe(18000);
  const m = crearEjemplo('mercado','sin-dividendos',()=>ejemploMercado(['2023','2024']));
  expect(Object.values(m.periodos).every(p => p.dividendos === 0)).toBe(true);
});

it('valida monedas explícitas sin inferir USD desde un signo $ ni cambiar importes', () => {
  expect(monedaDe({ moneda:'UM' })).toBe('UM'); expect(monedaDe({})).toBe('C$');
  expect(normalizarMoneda({ moneda:'USD' })).toEqual({ moneda:'USD' });
  expect(() => normalizarMoneda({ moneda:'<img>' })).toThrow();
});

it('conserva la unidad declarada después de normalizar sin convertir los importes', () => {
  const flujo = crearEjemplo('flujo','baker-directo',ejemploFlujo);
  expect(calcularFlujo(normalizarFlujo(flujo)).moneda).toBe('USD');
  expect(calcularFlujo(normalizarFlujo(flujo)).saldoInicial).toBe(500000);
  expect(calcularCVU(normalizarEquilibrio(crearEjemplo('equilibrio','tor-base',ejemploEquilibrio))).moneda).toBe('UM');
});
it('no compara porcentualmente estados y proyecciones en monedas distintas', async () => {
  const { construirReporte } = await import('../../js/modules/proforma/proforma-calculations.js');
  const estados = crearEjemplo('estados','bartlett',()=>DEMO_MUNOMODA);
  const presupuesto = calcularPresupuestoMaestro(normalizarSupuestos(ejemploPlaneacion()));
  const r = construirReporte({ estados, presupuesto });
  expect(r.real.moneda).toBe('USD');
  expect(r.motivoComparacion).toContain('monedas difieren');
  expect(r.comparacion.every(f => f.variacion === null && f.puntos === null)).toBe(true);
});
