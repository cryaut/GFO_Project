// F7 (D-113): AGRI-CORP primero en los selectores, registro del caso de cada módulo, aviso de
// empresas mezcladas y mapa de supuestos de Inicio.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast: vi.fn() }));
import store from '../../js/store.js';
import { casoDeEjemplo, crearEjemplo, listarEjemplos } from '../../js/examples/catalogo.js';
import { casoHistoricoReal, casoOperativoSimulado } from '../../js/examples/ejemplos-agricorp.js';
import { ejemploSeleccionado, panelEjemplos } from '../../js/components/ejemplos.js';
import { cargarEjemploEmpresa } from '../../js/modules/inicio/index.js';
import { avisoCaso, bannerCaso, CLAVES_EMPRESA, registrarCasos } from '../../js/utils/casos.js';
import { mapaSupuestos } from '../../js/modules/inicio/inicio-supuestos.js';

let memoria;
beforeEach(() => {
  memoria = new Map();
  vi.stubGlobal('localStorage', { getItem: k => memoria.get(k) ?? null, setItem: vi.fn((k, v) => memoria.set(k, v)) });
  vi.stubGlobal('window', { confirm: vi.fn(() => true) });
  store.load();
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('selectores de ejemplos', () => {
  it.each(['estados', 'flujo', 'equilibrio', 'planeacion', 'inventario', 'mercado', 'inicioEmpresa'])(
    '%s: AGRI-CORP va primero y agrupado; los demás ejemplos se conservan', modulo => {
      const lista = listarEjemplos(modulo);
      expect(lista[0].grupo).toBe('AGRI-CORP');
      expect(lista[0].nombre).toContain('AGRI-CORP');
      expect(lista.some(e => e.id === 'actual' && !e.grupo)).toBe(true);
      const html = panelEjemplos(modulo, 'boton');
      expect(html).toContain('<optgroup label="AGRI-CORP">');
      expect(html).toContain('<optgroup label="Otros ejemplos">');
    });

  it('los selectores personales no cambian', () => {
    expect(panelEjemplos('presupuesto', 'b')).not.toContain('optgroup');
    expect(listarEjemplos('inicioPersonal')[0].id).toBe('actual');
  });

  it('cada pantalla carga su parte del caso AGRI-CORP', () => {
    const real = casoHistoricoReal(), arroz = casoOperativoSimulado();
    expect(crearEjemplo('equilibrio', 'agricorp')).toEqual(real.equilibrio);
    expect(crearEjemplo('planeacion', 'agricorp')).toEqual(real.planeacion.supuestos);
    expect(crearEjemplo('inventario', 'agricorp')).toEqual(real.inventario);
    expect(crearEjemplo('mercado', 'agricorp')).toEqual(real.razonesMercado);
    expect(crearEjemplo('equilibrio', 'agricorp-arroz')).toEqual(arroz.equilibrio);
  });

  it('la línea de arroz se presenta como parte de AGRI-CORP, rotulada como simulada', () => {
    expect(casoOperativoSimulado().estados.name).toBe('AGRI-CORP · línea de arroz (escenario simulado 2027)');
    expect(listarEjemplos('inicioEmpresa')[1].nombre).toContain('línea de arroz (escenario simulado');
  });

  it('casoDeEjemplo distingue consolidado, línea de arroz y otros ejemplos', () => {
    expect(casoDeEjemplo('flujo', 'agricorp-2024')).toEqual({ caso: 'agricorp-consolidado', nombre: 'AGRI-CORP · consolidado' });
    expect(casoDeEjemplo('estados', 'agricorp-simulado').caso).toBe('agricorp-arroz');
    expect(casoDeEjemplo('equilibrio', 'tor-base')).toEqual({ caso: 'otro', nombre: 'TOR · 100000 unidades' });
    expect(casoDeEjemplo('equilibrio', 'no-existe')).toBeNull();
  });
});

describe('registro del caso y aviso de mezcla', () => {
  it('Inicio registra los siete módulos en la misma escritura', () => {
    localStorage.setItem.mockClear();
    cargarEjemploEmpresa('agricorp-historico');
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    for (const clave of CLAVES_EMPRESA) expect(store.get('casos')[clave].caso).toBe('agricorp-consolidado');
    expect(avisoCaso('proforma', store.getAll())).toEqual({ tipo: 'caso', caso: 'agricorp-consolidado', nombre: 'AGRI-CORP · consolidado' });
    expect(bannerCaso(avisoCaso('equilibrio', store.getAll()))).toContain('Ver el mapa de supuestos');
  });

  it('un módulo con otro caso produce el aviso de empresas mezcladas', () => {
    cargarEjemploEmpresa('agricorp-historico');
    registrarCasos({ equilibrio: { caso: 'otro', nombre: 'MUNO MODA · una prenda' } });
    const aviso = avisoCaso('equilibrio', store.getAll());
    expect(aviso.tipo).toBe('mezcla');
    expect(aviso.detalle).toEqual([{ modulo: 'Estados', nombre: 'AGRI-CORP · consolidado' }, { modulo: 'Punto de equilibrio', nombre: 'MUNO MODA · una prenda' }]);
    expect(bannerCaso(aviso)).toContain('Empresas mezcladas');
    // Flujo no usa Equilibrio: su pantalla no avisa.
    expect(avisoCaso('flujo', store.getAll()).tipo).toBe('caso');
  });

  it('un módulo vacío no cuenta para el aviso', () => {
    cargarEjemploEmpresa('agricorp-historico');
    registrarCasos({ inventario: { caso: 'otro', nombre: 'Tienda de prendas' } });
    store.setPersisted('inventario', { productos: [], movimientos: [] });
    expect(avisoCaso('inventario', store.getAll()).tipo).toBe('caso');
  });

  it('cargar un ejemplo en una pantalla registra su caso solo si el módulo cambió', async () => {
    cargarEjemploEmpresa('agricorp-historico');
    const page = { querySelector: () => ({ value: 'actual' }) };
    const datos = ejemploSeleccionado(page, 'flujo', () => ({ saldoInicial: 1, periodoBase: '', movimientos: [] }));
    await Promise.resolve();
    expect(store.get('casos').flujo.caso).toBe('agricorp-consolidado');
    ejemploSeleccionado(page, 'flujo', () => datos);
    store.setPersisted('flujo', datos);
    await Promise.resolve();
    expect(store.get('casos').flujo).toMatchObject({ caso: 'otro', nombre: 'MUNO MODA · flujo anual' });
  });

  it('el texto del aviso se escapa', () => {
    const html = bannerCaso({ tipo: 'mezcla', detalle: [{ modulo: 'Estados', nombre: '<img src=x>' }] });
    expect(html).not.toContain('<img');
  });
});

describe('mapa de supuestos de Inicio', () => {
  it('muestra el valor vigente de cada supuesto con su fuente y su módulo', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const mapa = mapaSupuestos(store.getAll());
    const valor = id => mapa.filas.find(f => f.id === id).valor;
    expect(mapa.base).toBe('2024');
    expect(valor('S1')).toBe('50.00%');
    expect(valor('S2–S3')).toBe('60.00%');
    expect(valor('S4')).toBe('75.00% variable');
    expect(valor('S5')).toBe('25.00% variable');
    expect(valor('S6')).toBe('Variable (100 %)');
    expect(valor('S7')).toBe('C$ 100.00');
    expect(valor('S8')).toBe('1.35%');
    expect(valor('S10')).toBe('30.00%');
    expect(valor('S15')).toBe('78.49 días');
    expect(valor('S16')).toContain('C$ 620.00 por quintal');
    expect(mapa.filas.every(f => f.valor !== 'N/D')).toBe(true);
  });

  it('refleja un supuesto editado en su módulo', () => {
    cargarEjemploEmpresa('agricorp-historico');
    const apal = store.get('apalancamiento');
    store.setPersisted('apalancamiento', { ...apal, comportamiento: { ...apal.comportamiento, 'Costo de ventas': { tipo: 'mixto', pctVariable: 0.9 } } });
    expect(mapaSupuestos(store.getAll()).filas.find(f => f.id === 'S4').valor).toBe('90.00% variable');
  });

  it('no aparece con otro caso', () => {
    cargarEjemploEmpresa('agricorp-simulado');
    expect(mapaSupuestos(store.getAll())).toBeNull();
  });
});
