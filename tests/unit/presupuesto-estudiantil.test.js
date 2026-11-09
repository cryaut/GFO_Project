import { ejemploEstadosResueltos } from '../fixtures/estados-resueltos.js';
import { ejemploCajaDocente } from '../../js/modules/planeacion/caja-docente-ejemplos.js';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast:vi.fn() }));
import { nuevoPresupuestoEstudiantil, normalizarEstudiantil, calcularSeguimiento, calcularProyeccion, semanaDeFecha, desplazarFecha, resumenEstudiantilGuardado } from '../../js/modules/presupuesto/presupuesto-calculations.js';
import { ejemploEstudiantil, ejemploSoloTransporte } from '../../js/modules/presupuesto/ejemplos-estudiantiles.js';
import { presupuestoEstudiantilUI } from '../../js/modules/presupuesto/presupuesto-ui.js';
import { finanzasPersonales } from '../../js/modules/inicio/inicio-calculations.js';
import { construirReporteHTML } from '../../js/modules/integracion/integracion-reporte.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';
import { element, clic, enviar, llenar, cambiar } from './helpers/dom-falso.js';

afterEach(() => vi.unstubAllGlobals());

it('reproduce Inicio y meta y las cuatro semanas del XLSX sin convertir proyecciones en movimientos', () => {
  const d = ejemploEstudiantil(), original = structuredClone(d), r = calcularSeguimiento(d);
  expect(r).toMatchObject({ ingreso:2400, gasto:1750, ahorro:400, reserva:250, saldo:0, avance:0.2, aporteRecomendado:100, final:'2026-12-20' });
  expect(r.semanas).toHaveLength(20);
  for (let i = 0; i < 4; i++) expect(r.semanas[i]).toMatchObject({ ingreso:600, gasto:437.5, ahorro:100, reserva:62.5, saldo:0, acumulado:100 * (i + 1), bloque:1 });
  expect(r.semanas[4]).toMatchObject({ ingreso:0, ahorro:0, acumulado:400, bloque:2, movimientos:0 });
  expect(d).toEqual(original);
});

it('reproduce el presupuesto proyectado de 2400, incluido límite semanal 437.50', () => {
  const p = calcularProyeccion(ejemploEstudiantil().proyecciones.real);
  expect(p).toMatchObject({ total:2400, ahorro:400, reserva:250, diferencia:0, porcentaje:1, estado:'Balanceado', limiteSemanal:437.5 });
  expect(p.partidas[0].porcentaje).toBeCloseTo(700 / 2400, 12);
  expect(p.partidas[4].porcentaje).toBe(0);
});

it('un ingreso solo para transporte permite ahorro real cero', () => {
  const d = ejemploSoloTransporte();
  expect(calcularSeguimiento(d)).toMatchObject({ ingreso:175, gasto:175, ahorro:0, reserva:0, saldo:0, avance:0 });
  expect(calcularProyeccion(d.proyecciones.real)).toMatchObject({ total:175, diferencia:0, ahorro:0, limiteSemanal:175 });
});

it('los planes real y deseado no cambian el seguimiento realizado', () => {
  const d = ejemploEstudiantil(), antes = calcularSeguimiento(d);
  d.proyecciones.deseada = structuredClone(d.proyecciones.real);
  d.proyecciones.deseada.ingreso = 10000;
  d.proyecciones.deseada.partidas[7].monto = 9000;
  expect(calcularSeguimiento(d)).toEqual(antes);
});

it('vacío es N/D, cero explícito se conserva, y no hay porcentaje con base cero', () => {
  const d = nuevoPresupuestoEstudiantil();
  expect(calcularProyeccion(d.proyecciones.real)).toMatchObject({ total:null, diferencia:null, ahorro:null, limiteSemanal:null, porcentaje:null });
  d.proyecciones.real.ingreso = 0;
  d.proyecciones.real.partidas.forEach(f => { f.monto = 0; });
  expect(calcularProyeccion(d.proyecciones.real)).toMatchObject({ total:0, diferencia:0, estado:'Balanceado', ahorro:0, porcentaje:null });
  d.meta.costo = 0;
  expect(calcularSeguimiento(d).avance).toBeNull();
});

it('no oculta déficit ni un avance superior al 100 %', () => {
  const d = ejemploEstudiantil();
  d.movimientos.push({ ...d.movimientos[1], id:'gasto-extra', monto:100 });
  d.meta.costo = 100;
  expect(calcularSeguimiento(d)).toMatchObject({ saldo:-100, avance:4 });
  d.proyecciones.real.ingreso = 1000;
  expect(calcularProyeccion(d.proyecciones.real)).toMatchObject({ diferencia:-1400, estado:'Excede ingreso' });
});

it.each([['2026-08-03',1],['2026-08-09',1],['2026-08-10',2],['2026-12-20',20],['2026-08-02',null],['2026-12-21',null],['2026-02-30',null]])('asigna %s a semana %s, sin depender de la zona horaria', (f, s) => {
  expect(semanaDeFecha(f, '2026-08-03', 20)).toBe(s);
});

it('desplaza fechas a través de fin de año y bisiesto', () => {
  expect(desplazarFecha('2024-02-28', 1)).toBe('2024-02-29');
  expect(desplazarFecha('2026-12-28', 6)).toBe('2027-01-03');
});

it.each([
  d => { d.meta.inicio = '2026-08-04'; },
  d => { d.meta.semanas = 0; },
  d => { d.meta.semanas = 2.5; },
  d => { d.movimientos[0].monto = null; },
  d => { d.movimientos[0].monto = -1; },
  d => { d.movimientos[0].monto = Infinity; },
  d => { d.movimientos[0].fecha = '2026-08-02'; },
  d => { d.movimientos[1].id = d.movimientos[0].id; },
  d => { d.proyecciones.real.partidas[0].monto = '700'; }
])('rechaza documentos inválidos sin modificar la entrada', cambiarDato => {
  const d = ejemploEstudiantil(); cambiarDato(d); const antes = structuredClone(d);
  expect(() => normalizarEstudiantil(d)).toThrow(); expect(d).toEqual(antes);
});

function montar(inicial = ejemploEstudiantil(), guardar = vi.fn()) {
  vi.stubGlobal('window', { confirm:vi.fn(() => true) });
  const page = element();
  presupuestoEstudiantilUI(page, { inicial, guardar, verMensual:vi.fn() });
  return { page, guardar };
}
const entrada = { ppFecha:'2026-08-10', ppTipo:'Gasto', ppCategoria:'Otro', ppDescripcionMovimiento:'Compra <b>segura</b>', ppMonto:'0', ppPrioridad:'Necesidad', ppMedio:'Efectivo', ppObservacion:'<img src=x>' };

it('registrar cero explícito, editar y eliminar actualizan el mismo documento', async () => {
  const { page, guardar } = montar();
  llenar(page, entrada); await enviar(page, 'ppFormMovimiento');
  expect(guardar.mock.lastCall[0].movimientos).toHaveLength(33);
  expect(page.querySelector('#ppRegistroTabla').innerHTML).toContain('&lt;b&gt;segura&lt;/b&gt;');
  expect(page.querySelector('#ppRegistroTabla').innerHTML).not.toContain('<img');
  await clic(page, 'ppEditar-32');
  llenar(page, { ppMonto:'25' }); await enviar(page, 'ppFormMovimiento');
  expect(guardar.mock.lastCall[0].movimientos.at(-1).monto).toBe(25);
  await clic(page, 'ppEliminar-32');
  expect(guardar.mock.lastCall[0].movimientos).toHaveLength(32);
});

it('cancelar edición o eliminación no guarda ni cambia resultados', async () => {
  const { page, guardar } = montar();
  await clic(page, 'ppEditar-0'); llenar(page, { ppMonto:'9999' }); await clic(page, 'ppCancelarEdicion');
  window.confirm.mockReturnValue(false); await clic(page, 'ppEliminar-0');
  expect(guardar).not.toHaveBeenCalled();
  expect(page.querySelector('#ppTotales').innerHTML).toContain('C$ 2,400.00');
});

it('un fallo de persistencia conserva datos, resultados y borrador para reintentar', async () => {
  const guardar = vi.fn(() => { throw new Error('cuota agotada'); }), { page } = montar(ejemploEstudiantil(), guardar);
  llenar(page, { ...entrada, ppMonto:'25' }); await enviar(page, 'ppFormMovimiento');
  expect(page.querySelector('#ppMonto').value).toBe('25');
  expect(page.querySelector('#ppMensaje').textContent).toContain('cuota agotada');
  expect(page.querySelector('#ppTotales').innerHTML).toContain('C$ 1,750.00');
  guardar.mockImplementation(() => {}); await enviar(page, 'ppFormMovimiento');
  expect(calcularSeguimiento(guardar.mock.lastCall[0]).gasto).toBe(1775);
});

it('guardar un plan no pisa el otro borrador ni crea movimientos', async () => {
  const { page, guardar } = montar();
  llenar(page, { 'ppIngreso-deseada':'6000' });
  await enviar(page, 'ppPlan-real');
  expect(page.querySelector('#ppIngreso-deseada').value).toBe('6000');
  expect(guardar.mock.lastCall[0].movimientos).toHaveLength(32);
  expect(guardar.mock.lastCall[0].proyecciones.deseada.ingreso).toBeNull();
});

it('cambiar frecuencia semanal no divide entre cuatro ni convierte montos', async () => {
  const { page } = montar();
  await cambiar(page, 'ppFrecuencia-real', 'Semanal');
  await page.querySelector('#ppPlan-real').dispatchEvent({ type:'change' });
  expect(page.querySelector('#ppResultadoPlan-real').innerHTML).toContain('C$ 1,750.00');
  expect(page.querySelector('#ppIngreso-real').value).toBe(2400);
});

it('Inicio y Reportes comparten realizados y no usan el ingreso del plan mensual anterior', () => {
  const p = { vista:'estudiantil', estudiantil:ejemploEstudiantil(), ingresoMensual:99999 };
  const resumen = resumenEstudiantilGuardado(p);
  expect(resumen).toMatchObject({ ingresos:2400, gastos:1750, ahorro:400, reserva:250, saldo:0 });
  const area = finanzasPersonales(resumen)[0];
  expect(area.titulo).toBe('Presupuesto estudiantil');
  expect(JSON.stringify(area)).not.toContain('99999');
  const html = construirReporteHTML({ kpis:{ presupuestoEstudiantil:resumen } });
  expect(html).toContain('C$ 400.00'); expect(html).toContain('C$ 250.00');
  expect(resumenEstudiantilGuardado({ ...p, vista:'mensual' })).toBeNull();
});

it('respaldo estudiantil se valida incluso si el dato actual es legado, y el inválido se rechaza', () => {
  const actuales = { presupuesto:{ ingresoMensual:8000, gastos:[], ingresos:[], semanas:[] } };
  const p = { ...actuales.presupuesto, estudiantil:ejemploEstudiantil(), vista:'estudiantil' };
  expect(validarRespaldo({ presupuesto:p }, actuales).modulos.presupuesto.estudiantil).toEqual(p.estudiantil);
  p.estudiantil.movimientos[0].monto = -1;
  expect(() => validarRespaldo({ presupuesto:p }, actuales)).toThrow();
  expect(validarRespaldo({ presupuesto:{ ingresoMensual:500 } }, actuales).modulos.presupuesto.vista).toBe('mensual');
});

it('la clasificación descriptiva no cambia el ahorro de B19 ni la reserva de B18', () => {
  const p = ejemploEstudiantil().proyecciones.real;
  p.partidas[0].tipo = 'Ahorro'; p.partidas[7].tipo = 'Deseo'; p.partidas[6].tipo = 'Necesidad';
  expect(calcularProyeccion(p)).toMatchObject({ ahorro:400, reserva:250, limiteSemanal:437.5 });
});

it('el reporte personal no fabrica un resumen empresarial cuando no hay estados', () => {
  const p = resumenEstudiantilGuardado({ estudiantil:ejemploEstudiantil(), vista:'estudiantil' });
  const html = construirReporteHTML({ kpis:{ presupuestoEstudiantil:p } });
  expect(html).toContain('C$ 2,400.00'); expect(html).not.toContain('Total Activos:');
  expect(html).not.toContain('para generar el reporte');
});

it('Reportes reúne histórico y proyección USD con realizados personales C$ sin perder ninguna sección', () => {
  const estados = { ...ejemploEstadosResueltos(['2024']), moneda:'USD' };
  const personal = resumenEstudiantilGuardado({ estudiantil:ejemploEstudiantil(), vista:'estudiantil' });
  const html = construirReporteHTML({ estados, kpis:{ presupuestoEstudiantil:personal },
    reporte:{ proforma:{ moneda:'USD', horizonte:'2026', ventas:10000, uai:2000, utilidadNeta:1400 }, efectivo:{ saldoFinal:3000 } } });
  expect(html).toContain('USD 72,000.00');
  expect(html).toContain('C$ 400.00');
  expect(html).toContain('USD 1,400.00');
  expect(html).toContain('Proyección del presupuesto guardado');
});

it('un respaldo puede restaurar presupuesto estudiantil y caja docente juntos sin mezclar sus documentos', () => {
  const estudiantil = ejemploEstudiantil(), cajaDocente = ejemploCajaDocente('halleyRepago');
  const actuales = { presupuesto:{ ingresoMensual:8000 }, planeacion:{ supuestos:null } };
  const contenido = { presupuesto:{ vista:'estudiantil', estudiantil }, planeacion:{ cajaDocente } };
  const r = validarRespaldo(contenido, actuales);
  expect(r.modulos.presupuesto).toMatchObject({ ingresoMensual:8000, estudiantil });
  expect(r.modulos.planeacion).toEqual({ supuestos:null, cajaDocente });
  expect(actuales.planeacion.supuestos).toBeNull();
});
