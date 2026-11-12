import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast:vi.fn() }));
import store from '../../js/store.js';
import { casoHistoricoReal, casoOperativoSimulado } from '../../js/examples/ejemplos-agricorp.js';
import { cargarEjemploEmpresa, cargarEjemploPersonal } from '../../js/modules/inicio/index.js';
import { inicioUI } from '../../js/modules/inicio/inicio-ui.js';
import { panoramaGeneral } from '../../js/modules/inicio/inicio-calculations.js';
import { reunirEntradas } from '../../js/modules/proforma/index.js';
import { construirReporte, flujoDesdeEFE } from '../../js/modules/proforma/proforma-calculations.js';
import { construirReporteHTML } from '../../js/modules/integracion/integracion-reporte.js';
import { computeEFE, refreshSavedStates } from '../../js/modules/analisis/index.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { calcularFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { calcularInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { calcularApalancamiento } from '../../js/modules/apalancamiento/apalancamiento-calculations.js';
import { calcularCVU } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { calcularPresupuestoMaestro, normalizarSupuestos } from '../../js/modules/planeacion/planeacion-calculations.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';
import { element, clic } from './helpers/dom-falso.js';

let memoria;
beforeEach(() => {
  memoria = new Map();
  vi.stubGlobal('localStorage', { getItem:k => memoria.get(k) ?? null, setItem:vi.fn((k,v) => memoria.set(k,v)) });
  vi.stubGlobal('window', { confirm:vi.fn(() => true) });
  store.load();
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('cambiar de caso publica los siete módulos en una sola escritura y no toca datos personales', () => {
  store.setPersisted('presupuesto', { ingresoMensual:12345, ingresos:[{ concepto:'Personal', monto:12345 }] });
  const personal = structuredClone(store.get('presupuesto'));
  cargarEjemploEmpresa('agricorp-simulado');
  localStorage.setItem.mockClear();
  cargarEjemploEmpresa('agricorp-historico');
  expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  expect(store.get('estados.name')).toContain('Corporación Agrícola');
  // F3: inventario (composición real y kárdex de granza) y equilibrio derivado de los estados.
  expect(store.get('inventario.productos').map(p => p.id)).toEqual(['granza-arroz']);
  expect(store.get('inventario.composicion.periodos')).toEqual(['2022','2023','2024','2025']);
  expect(store.get('equilibrio')).toMatchObject({ origen:'estados', periodo:'2024', unidadVentas:true, precio:null });
  expect(store.get('planeacion.supuestos')).toMatchObject({ tipoPeriodo:'Trimestre', periodos:4, costoUnitario:1 });
  expect(store.get('presupuesto')).toEqual(personal);
});

it.each(['agricorp-simulado','agricorp-historico'])('un fallo de cuota al cargar %s conserva todos los módulos y el JSON anterior', id => {
  cargarEjemploEmpresa(id === 'agricorp-simulado' ? 'agricorp-historico' : 'agricorp-simulado');
  const previo = store.getAll(), json = memoria.get('gfo-toolkit-data');
  localStorage.setItem.mockImplementation(() => { throw new Error('cuota agotada'); });
  expect(() => cargarEjemploEmpresa(id)).toThrow('cuota agotada');
  expect(store.getAll()).toEqual(previo);
  expect(memoria.get('gfo-toolkit-data')).toBe(json);
});

it('un identificador de caso inexistente no sustituye datos por otro ejemplo', () => {
  const antes = store.getAll();
  expect(() => cargarEjemploEmpresa('agricorp-inexistente')).toThrow();
  expect(store.getAll()).toEqual(antes);
});

it('el selector sigue disponible después de cargar y cancelar no guarda', async () => {
  cargarEjemploEmpresa('agricorp-simulado');
  const entradas = reunirEntradas(), page = element(), cargar = vi.fn();
  inicioUI(page, { panorama:panoramaGeneral(entradas, construirReporte(entradas)), cargarEjemploEmpresa:cargar });
  expect(page.querySelector('#example-inicioEmpresa')).not.toBeNull();
  page.querySelector('#example-inicioEmpresa').value = 'agricorp-historico';
  window.confirm.mockReturnValue(false);
  await clic(page,'inicioEjemplo');
  expect(cargar).not.toHaveBeenCalled();
  window.confirm.mockReturnValue(true);
  await clic(page,'inicioEjemplo');
  expect(cargar).toHaveBeenCalledWith('agricorp-historico');
});

it.each([
  ['agricorp-historico', '2025', 37782108, 214423000, -387590055, 149251171, 'flujo_reportado'],
  ['agricorp-simulado', '2027-09', 1075760, -150000, -45000, 2380760, 'flujo_simulado_documentado']
])('%s usa los mismos flujos e intervalo en captura, Análisis, Inicio, Proforma y HTML', (id, periodo, operacion, inversion, financiamiento, final, naturaleza) => {
  cargarEjemploEmpresa(id); refreshSavedStates();
  const estados = store.get('estados'), efe = computeEFE(periodo), directo = calcularFlujo(store.get('flujo'));
  expect(efe).toMatchObject({ naturaleza, estado:'cuadra', operacion:{ total:operacion }, inversion:{ total:inversion }, financiamiento:{ total:financiamiento }, efectivoFinal:final, diferencia:0 });
  expect(directo.neto).toEqual({ operacion, inversion, financiamiento });
  const entradas = reunirEntradas(), reporte = construirReporte(entradas);
  expect(entradas.flujo).toMatchObject({ naturaleza, neto:directo.neto, saldoFinal:final });
  expect(entradas.flujo.periodos).toEqual(efe.periodos);
  expect(reporte.indicadores.find(i => i.nombre === 'Flujo de operación').valor).toBe(operacion);
  expect(panoramaGeneral(entradas,reporte).areas.find(a => a.id === 'flujo').puntos[0].valor).toBe(operacion);
  const html = construirReporteHTML({ estados, reporte });
  expect(html).toContain(naturaleza === 'flujo_reportado' ? 'Flujo de efectivo · reportado' : 'Flujo de efectivo · simulado');
  expect(html).toContain(operacion.toLocaleString('en-US', { minimumFractionDigits:2 }));
  expect(html).not.toContain('-145,444,600');
});

it('la carga de solo Estados también conserva y exporta el flujo documentado', () => {
  const d = normalizeFinancialData(JSON.parse(JSON.stringify(casoHistoricoReal().estados)));
  expect(construirEFE(d,'2023','2024').operacion.total).toBe(190033364);
  expect(normalizeFinancialData(d)).toEqual(d);
  const r = validarRespaldo({ estados:d }, store.getAll());
  expect(r.modulos.estados.flujosDocumentados).toEqual(d.flujosDocumentados);
});

it.each(['importe','nombre','moneda'])('cambiar %s invalida el documento sin inventar otra cifra operativa', campo => {
  const d = casoHistoricoReal().estados;
  if (campo === 'importe') d.balanceGeneral['2024'].activos['Efectivo y equivalentes de efectivo']++;
  if (campo === 'nombre') d.name = 'Otra entidad';
  if (campo === 'moneda') d.moneda = 'USD';
  const r = construirEFE(d,'2023','2024');
  expect(r.estado).toBe('incompleta');
  expect(r.operacion.total).toBeNull();
  expect(r.motivos.join(' ')).toContain('Los estados cambiaron');
  expect(flujoDesdeEFE(d).disponible).toBe(false);
});

it('no usa una captura manual editada para reemplazar el flujo documental', () => {
  cargarEjemploEmpresa('agricorp-historico');
  const captura = structuredClone(store.get('flujo')); captura.movimientos[0].monto = 1;
  store.setPersisted('flujo',captura);
  expect(reunirEntradas().flujo.neto.operacion).toBe(37782108);
});

it.each(['tipo','moneda','monto','duplicado','hueco'])('rechaza un flujo documental inválido: %s', campo => {
  const d = casoHistoricoReal().estados, f = d.flujosDocumentados[0];
  if (campo === 'tipo') f.tipo = 'auditado-por-app';
  if (campo === 'moneda') f.moneda = 'EUR';
  if (campo === 'monto') f.datos.movimientos[0].monto = Infinity;
  if (campo === 'duplicado') f.datos.movimientos[1].id = f.datos.movimientos[0].id;
  if (campo === 'hueco') delete f.datos.movimientos[0];
  expect(() => normalizeFinancialData(d)).toThrow();
});

it('avisa el descuadre de un documento alterado en vez de ajustar sus cifras', () => {
  const d = casoHistoricoReal().estados; d.flujosDocumentados.find(f => f.periodoFinal === '2024').datos.movimientos[0].monto++;
  const r = construirEFE(d,'2023','2024');
  expect(r.estado).toBe('no-cuadra'); expect(r.diferencia).toBe(1);
});

it('los datos del escenario reproducen caja, PE, apalancamiento e inventario del dossier', () => {
  const d = casoOperativoSimulado(), s = normalizarSupuestos(d.planeacion.supuestos);
  const p = calcularPresupuestoMaestro(s);
  expect(p.compras.unidades).toEqual([3840,4280,4680]);
  expect(p.caja.saldoFinal).toEqual([1805480,1990560,2380760]);
  expect(p.totales.utilidadNeta).toBe(1218000);
  expect(calcularCVU(d.equilibrio).peUnidades).toBe(1800);
  expect(calcularApalancamiento(d.estados,d.apalancamiento).periodos[1].grados).toMatchObject({ gao:1.75, gaf:expect.closeTo(1.07416879795,8), gat:expect.closeTo(1.87979539642,8) });
  const inventario = calcularInventario(d.inventario);
  expect(inventario.movimientosSinCosto).toBe(0);
  expect(inventario.productos[0].existenciaFinal).toBe(1000);
  expect(computeFinancialTotals(d.estados,'2027-09').totalActivos).toBe(6390760);
  d.planeacion.supuestos.ventasUnidades[0] = 0;
  expect(casoOperativoSimulado().planeacion.supuestos.ventasUnidades[0]).toBe(3800);
});

it('dos documentos del mismo cierre no se seleccionan por orden implícito', () => {
  const d = casoHistoricoReal().estados;
  d.flujosDocumentados.push({ ...d.flujosDocumentados.find(f => f.periodoFinal === '2024'), periodoInicial:'2022' });
  expect(() => normalizeFinancialData(d)).toThrow('más de un flujo');
});

it('preparar un caso inválido no escribe ningún módulo', async () => {
  const ejemplos = await import('../../js/examples/ejemplos-agricorp.js');
  const caso = ejemplos.casoOperativoSimulado();
  caso.estados.moneda = 'EUR';
  vi.spyOn(ejemplos,'casoOperativoSimulado').mockReturnValueOnce(caso);
  const antes = store.getAll();
  expect(() => cargarEjemploEmpresa('agricorp-simulado')).toThrow();
  expect(localStorage.setItem).not.toHaveBeenCalled();
  expect(store.getAll()).toEqual(antes);
});

it('el presupuesto personal del dossier se abre en la vista mensual y no sustituye un documento estudiantil', () => {
  cargarEjemploPersonal('agricorp');
  expect(store.get('presupuesto')).toMatchObject({ vista:'mensual', ingresoMensual:20500, metaAhorro:28800 });
  const estudiante = { version:1, meta:{ descripcion:'Meta propia' }, movimientos:[] };
  store.setPersisted('presupuesto',{ ingresos:[], gastos:[], estudiantil:estudiante, vista:'estudiantil' });
  cargarEjemploPersonal('agricorp');
  expect(store.get('presupuesto')).toEqual({ ingresos:[], gastos:[], estudiantil:estudiante, vista:'estudiantil' });
});

it('el texto de la fuente se escapa en el reporte HTML', () => {
  const estados = casoHistoricoReal().estados;
  // El reporte usa el flujo del último par de periodos (2024 → 2025).
  estados.flujosDocumentados.find(f => f.periodoFinal === '2025').fuente = '<img src=x onerror=alert(1)>';
  store.setPersisted('estados', estados);
  const reporte = construirReporte(reunirEntradas());
  const html = construirReporteHTML({ estados, reporte });
  expect(html).toContain('&lt;img');
  expect(html).not.toContain('<img');
});
