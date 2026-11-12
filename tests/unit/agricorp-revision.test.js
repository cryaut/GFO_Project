// Revisión del PR #37 (D-113): el aviso del caso solo afirma «datos reales» mientras los datos
// siguen siendo los del caso; el respaldo conserva el registro de casos; las cifras que dependen
// de un supuesto llevan la etiqueta SUPUESTO en pantalla y en el reporte exportado.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast: vi.fn() }));
import store from '../../js/store.js';
import { ejemploBaker } from '../../js/examples/ejemplos-estados.js';
import { ejemploSeleccionado } from '../../js/components/ejemplos.js';
import { cargarEjemploEmpresa } from '../../js/modules/inicio/index.js';
import { mapaSupuestos } from '../../js/modules/inicio/inicio-supuestos.js';
import { getDemoData } from '../../js/modules/estados/index.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';
import { construirReporteHTML } from '../../js/modules/integracion/integracion-reporte.js';
import { reunirEntradas } from '../../js/modules/proforma/index.js';
import { construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { apalancamientoUI } from '../../js/modules/apalancamiento/apalancamiento-ui.js';
import {
  avisoCaso, bannerCaso, casoVigente, CLAVES_EMPRESA, huellaCaso, supuestosActivos, textoProcedencia
} from '../../js/utils/casos.js';
import { element } from './helpers/dom-falso.js';

let memoria;
beforeEach(() => {
  memoria = new Map();
  vi.stubGlobal('localStorage', { getItem: k => memoria.get(k) ?? null, setItem: vi.fn((k, v) => memoria.set(k, v)) });
  vi.stubGlobal('window', { confirm: vi.fn(() => true) });
  store.reset();
  store.load();
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const editarCifra = () => {
  const estados = structuredClone(store.get('estados'));
  estados.estadoResultados['2024']['Otros ingresos'] += 1;
  store.setPersisted('estados', estados);
};

describe('vigencia del aviso del caso', () => {
  it('recién cargado, el aviso afirma datos reales y el mapa de supuestos aparece', () => {
    cargarEjemploEmpresa('agricorp-historico');
    for (const ruta of ['estados', 'analisis', 'apalancamiento', 'proforma']) {
      expect(avisoCaso(ruta, store.getAll())).toEqual({ tipo: 'caso', caso: 'agricorp-consolidado', nombre: 'AGRI-CORP · consolidado' });
    }
    expect(bannerCaso(avisoCaso('estados', store.getAll()))).toContain('Datos reales de los estados auditados 2022–2025');
    expect(mapaSupuestos(store.getAll())).not.toBeNull();
  });

  it('editar una cifra real de Estados quita la afirmación, el mapa y las etiquetas de S1–S3', () => {
    cargarEjemploEmpresa('agricorp-historico');
    editarCifra();
    const aviso = avisoCaso('estados', store.getAll());
    expect(aviso).toEqual({ tipo: 'modificado', detalle: [{ modulo: 'Estados', nombre: 'AGRI-CORP · consolidado' }] });
    const html = bannerCaso(aviso);
    expect(html).toContain('Datos modificados');
    expect(html).toContain('Estados ya no coincide con «AGRI-CORP · consolidado»');
    expect(html).not.toContain('Datos reales');
    expect(mapaSupuestos(store.getAll())).toBeNull();
    // La clasificación de costos sigue siendo el supuesto S4–S6 del caso.
    expect(supuestosActivos(store.getAll())).toEqual({ credito: false, costos: true, presupuesto: true, kardex: true });
  });

  it('editar un supuesto (S1 en los datos suplementarios) no cambia el origen del caso', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const estados = structuredClone(store.get('estados'));
    const [cuenta] = Object.keys(estados.supplementaryAccounts['2024']).filter(n => n.startsWith('Ventas a crédito'));
    estados.supplementaryAccounts['2024'][cuenta] = estados.supplementaryAccounts['2024'][cuenta] * 0.6 / 0.5;
    store.setPersisted('estados', estados);
    expect(avisoCaso('estados', store.getAll()).tipo).toBe('caso');
    expect(mapaSupuestos(store.getAll()).filas.find(f => f.id === 'S1').valor).toBe('60.00%');
  });

  it('reemplazar Estados con Baker desde el store (sin pasar por el selector) no se presenta como AGRI-CORP', () => {
    cargarEjemploEmpresa('agricorp-historico');
    store.setPersisted('estados', normalizeFinancialData(ejemploBaker()));
    for (const ruta of ['estados', 'apalancamiento', 'reportes']) {
      const aviso = avisoCaso(ruta, store.getAll());
      expect(aviso.tipo).toBe('modificado');
      expect(bannerCaso(aviso)).not.toContain('Datos reales');
    }
    expect(casoVigente(store.getAll(), 'estados')).toBeNull();
    expect(mapaSupuestos(store.getAll())).toBeNull();
  });

  it('cargar Baker con el selector de Estados lo registra como otro caso: Estados no avisa y Apalancamiento avisa la mezcla', async () => {
    cargarEjemploEmpresa('agricorp-historico');
    const page = { querySelector: () => ({ value: 'baker' }) };
    store.setPersisted('estados', normalizeFinancialData(ejemploSeleccionado(page, 'estados', getDemoData)));
    await Promise.resolve();
    expect(store.get('casos').estados).toMatchObject({ caso: 'otro', nombre: 'Baker Corporation' });
    expect(avisoCaso('estados', store.getAll())).toBeNull();
    const mezcla = avisoCaso('apalancamiento', store.getAll());
    expect(mezcla.tipo).toBe('mezcla');
    expect(mezcla.detalle.map(d => d.nombre)).toEqual(['Baker Corporation', 'AGRI-CORP · consolidado']);
  });

  it('volver a cargar el caso desde Inicio recupera el aviso', () => {
    cargarEjemploEmpresa('agricorp-historico');
    editarCifra();
    cargarEjemploEmpresa('agricorp-historico');
    expect(avisoCaso('proforma', store.getAll()).tipo).toBe('caso');
  });

  it('un registro sin huella en un módulo con datos reales no se puede comprobar y no afirma nada', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const casos = structuredClone(store.get('casos'));
    delete casos.estados.huella;
    store.setPersisted('casos', casos);
    expect(avisoCaso('estados', store.getAll()).tipo).toBe('modificado');
  });

  it('la huella no depende del orden de las claves y solo mira la parte real', () => {
    const a = { periods: ['1'], balanceGeneral: { 1: { activos: { Caja: 1, Bancos: 2 } } }, estadoResultados: {} };
    const b = { estadoResultados: {}, balanceGeneral: { 1: { activos: { Bancos: 2, Caja: 1 } } }, periods: ['1'], supplementaryAccounts: { 1: { x: 9 } } };
    expect(huellaCaso('estados', a)).toBe(huellaCaso('estados', b));
    expect(huellaCaso('estados', a)).toMatch(/^[0-9a-f]{8}$/);
    expect(huellaCaso('apalancamiento', {})).toBeNull();
  });

  it('el texto del aviso modificado se escapa', () => {
    expect(bannerCaso({ tipo: 'modificado', detalle: [{ modulo: 'Estados', nombre: '<img src=x>' }] })).not.toContain('<img');
  });
});

describe('respaldo JSON y registro de casos', () => {
  const exportar = () => JSON.parse(JSON.stringify(store.getAll()));

  it('restaurar un respaldo de AGRI-CORP recupera el registro de casos sin omitir campos', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const archivo = exportar();
    store.setPersisted('estados', normalizeFinancialData(ejemploBaker()));
    const { modulos, omitidos } = validarRespaldo(archivo, store.getAll());
    expect(omitidos).toEqual([]);
    store.setModulesPersisted(modulos);
    expect(store.get('casos')).toEqual(archivo.casos);
    for (const ruta of ['estados', 'analisis', 'proforma', 'reportes']) expect(avisoCaso(ruta, store.getAll()).tipo).toBe('caso');
    expect(mapaSupuestos(store.getAll())).not.toBeNull();
  });

  it('un respaldo sin registro de casos deja sin caso los módulos que restaura y conserva los demás', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const archivo = { estados: normalizeFinancialData(ejemploBaker()) };
    const { modulos } = validarRespaldo(archivo, store.getAll());
    store.setModulesPersisted(modulos);
    expect(store.get('casos').estados).toBeUndefined();
    expect(store.get('casos').apalancamiento.caso).toBe('agricorp-consolidado');
    expect(avisoCaso('estados', store.getAll())).toBeNull();
  });

  it('un registro de un módulo que el respaldo no trae se omite y no cambia el actual', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const actual = store.get('casos').flujo;
    const archivo = { estados: exportar().estados, casos: { estados: exportar().casos.estados, flujo: { caso: 'otro', nombre: 'X' } } };
    const { modulos, omitidos } = validarRespaldo(archivo, store.getAll());
    expect(omitidos).toEqual(['casos.flujo']);
    expect(modulos.casos.flujo).toEqual(actual);
  });

  it('rechaza un registro de casos inválido sin importar nada', () => {
    const actuales = store.getAll();
    expect(() => validarRespaldo({ casos: { estados: { caso: 'inventado', nombre: 'X' } } }, actuales)).toThrow('casos.estados');
    expect(() => validarRespaldo({ casos: { estados: { caso: 'otro', nombre: 'X', huella: '<script>' } } }, actuales)).toThrow('casos.estados');
    expect(() => validarRespaldo({ casos: [] }, actuales)).toThrow('registro de casos');
    const { omitidos } = validarRespaldo({ casos: { theme: { caso: 'otro', nombre: 'X' } } }, actuales);
    expect(omitidos).toEqual(['casos.theme']);
  });

  it('los siete módulos de empresa tienen registro con huella donde hay datos reales', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const casos = store.get('casos');
    expect(Object.keys(casos).sort()).toEqual([...CLAVES_EMPRESA].sort());
    for (const clave of ['estados', 'flujo', 'inventario']) expect(casos[clave].huella).toMatch(/^[0-9a-f]{8}$/);
    for (const clave of ['apalancamiento', 'razonesMercado', 'equilibrio', 'planeacion']) expect(casos[clave].huella).toBeUndefined();
  });
});

describe('etiquetas SUPUESTO', () => {
  it('Apalancamiento rotula el GAO y el GAT estructurales, no el GAF', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const page = element();
    apalancamientoUI(page, { estados: store.get('estados'), config: store.get('apalancamiento'), guardar: () => {}, supuestos: supuestosActivos(store.getAll()) });
    expect(page.innerHTML).toMatch(/GAO <span class="badge badge-warning"[^>]*>SUPUESTO S4–S6<\/span><\/th>/);
    expect(page.innerHTML).toMatch(/GAT <span class="badge badge-warning"[^>]*>SUPUESTO S4–S6<\/span><\/th>/);
    expect(page.innerHTML).toContain('<th scope="col" class="text-right">GAF</th>');
    const sinCaso = element();
    apalancamientoUI(sinCaso, { estados: store.get('estados'), config: store.get('apalancamiento'), guardar: () => {} });
    expect(sinCaso.innerHTML).not.toContain('SUPUESTO');
  });

  it('el reporte exportado dice de qué caso vienen los datos y rotula las cifras supuestas', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const entradas = reunirEntradas();
    const html = construirReporteHTML({ estados: entradas.estados, reporte: construirReporte(entradas), entradas, aviso: avisoCaso('reportes', store.getAll()) });
    expect(html).toContain('datos reales de los estados auditados 2022–2025 con supuestos declarados (S1–S16)');
    expect(html).toContain('(SUPUESTO S4–S6)');
    expect(html).toContain('SUPUESTO S8–S15');
    expect(html).toContain('SUPUESTO S7');
    expect(html).not.toContain('<a href');
  });

  it('con Estados modificado el reporte no afirma datos reales', () => {
    cargarEjemploEmpresa('agricorp-historico');
    editarCifra();
    const texto = textoProcedencia(avisoCaso('reportes', store.getAll()));
    expect(texto).toContain('Datos modificados: Estados (AGRI-CORP · consolidado)');
    expect(texto).not.toContain('datos reales');
  });
});

describe('Análisis rotula las razones que usan S1–S3', () => {
  async function montar(preparar) {
    vi.resetModules();
    const page = element();
    vi.stubGlobal('document', { getElementById: id => (id === 'page-analisis' ? page : null) });
    const { default: s } = await import('../../js/store.js');
    s.reset();
    const { cargarEjemploEmpresa: cargar } = await import('../../js/modules/inicio/index.js');
    cargar('agricorp-historico');
    preparar?.(s);
    const { initAnalisis } = await import('../../js/modules/analisis/index.js');
    initAnalisis();
    return page.innerHTML;
  }

  it('con el caso vigente, rotación de CxC, plazos y ciclo llevan SUPUESTO', async () => {
    const html = await montar();
    expect(html).toContain('SUPUESTO S1</span>');
    expect(html).toContain('SUPUESTO S2–S3</span>');
    expect(html).toContain('SUPUESTO S1–S3</span>');
  });

  it('con una cifra real de Estados editada, las razones siguen calculadas pero ya no se atribuyen al caso', async () => {
    const html = await montar(s => {
      const estados = structuredClone(s.get('estados'));
      estados.estadoResultados['2024']['Otros ingresos'] += 1;
      s.setPersisted('estados', estados);
    });
    expect(html).toMatch(/Plazo Cobro \(días\)<\/dt><dd class="">\d/);
    expect(html).not.toContain('SUPUESTO S1');
  });
});
