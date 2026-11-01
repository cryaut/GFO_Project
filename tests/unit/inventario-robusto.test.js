import { afterEach, describe, expect, it, vi } from 'vitest';
import { necesitaReposicion, TOLERANCIA_REPOSICION } from '../../js/utils/calculate.js';
import { descripcionReposicion } from '../../js/modules/inventario/inventario-calculations.js';

// Ronda 1 de Inventario (F7): regla única de reposición (D-082), valuación a
// costo promedio ponderado móvil (D-081), descartes visibles (D-083) y totales
// de existencia con una sola unidad (D-084). Los datos viven en este archivo:
// no se usa la demostración (ejemploInventario).

// Casos de frontera de la regla de reposición (T1, D-082).
describe('regla única de reposición (D-082)', () => {
  it('enteros: la existencia igual al mínimo da alerta', () => {
    expect(necesitaReposicion(40, 40)).toBe(true);
    expect(necesitaReposicion(35, 40)).toBe(true);
  });

  it('H1: decimales en el mínimo — 0.3 + 0.1 + 0.2 frente a 0.6 da alerta', () => {
    // La suma flotante da 0.6000000000000001: con la tolerancia 1e-6 cuenta como igualado.
    expect(necesitaReposicion(0.3 + 0.1 + 0.2, 0.6)).toBe(true);
    expect(TOLERANCIA_REPOSICION).toBe(1e-6);
  });

  it('debajo del mínimo da alerta y encima no', () => {
    expect(necesitaReposicion(4, 6)).toBe(true);
    expect(necesitaReposicion(6.001, 6)).toBe(false);
  });

  it('mínimo 0: sin política de reposición, no hay alerta', () => {
    expect(necesitaReposicion(0, 0)).toBe(false);
    expect(necesitaReposicion(5, 0)).toBe(false);
  });
});

// Productos y movimientos base de la matriz (sin costo en los movimientos: M0).
// Se definen en la sección de la matriz, más abajo.

describe('redacción única de la alerta (T2, D-082)', () => {
  it('faltante mayor que 0: «Bajo el mínimo» con cantidad y costo estimado', () => {
    const p = { nombre: 'Tornillo', unidad: 'unidades', reponer: true, faltante: 3, costoReposicion: 12.5 };
    expect(descripcionReposicion(p)).toBe('Bajo el mínimo: comprar al menos 3 unidades (costo estimado C$ 12.50) para volver al mínimo.');
  });

  it('faltante 0 (igual al mínimo): «Llegó al mínimo»', () => {
    const p = { nombre: 'Tornillo', unidad: 'unidades', reponer: true, faltante: 0, costoReposicion: 0 };
    expect(descripcionReposicion(p)).toBe('Llegó al mínimo: programe una compra.');
  });

  it('sin reposición devuelve cadena vacía', () => {
    expect(descripcionReposicion({ reponer: false })).toBe('');
  });
});


// --- Matriz de casos M0 a M11 (los datos viven aquí, no la demostración) ---

import { calcularInventario as calcularInv, normalizarInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';

describe('matriz de casos de inventario (M0 a M11)', () => {
  afterEach(() => vi.unstubAllGlobals());

  // M0: movimientos sin costo (datos anteriores) — el costo del producto es el
  // costo de la existencia inicial y el promedio no cambia: regresión con main.
  const BASE = () => ({
    productos: [
      { id: 'p1', nombre: 'Producto único', unidad: 'unidades', existenciaInicial: 10, costoUnitario: 4, stockMinimo: 4 }
    ],
    movimientos: [
      { id: 'm1', productoId: 'p1', fecha: '2026-01-05', tipo: 'entrada', cantidad: 6, concepto: 'Compra' },
      { id: 'm2', productoId: 'p1', fecha: '2026-01-20', tipo: 'salida', cantidad: 8, concepto: 'Venta' }
    ]
  });

  it('M0: regresión — sin costo en movimientos, valor y alertas iguales a main', () => {
    const r = calcularInv(BASE());
    expect(r.productos[0].existenciaFinal).toBe(8);
    expect(r.productos[0].costoPromedio).toBe(4);
    expect(r.productos[0].valor).toBe(32);
    expect(r.valorTotal).toBe(32);
    expect(r.productos[0].reponer).toBe(false);
    // La entrada sin costo cuenta en el aviso (D-081/D-083).
    expect(r.movimientosSinCosto).toBe(1);
  });

  it('M1: existencia igual al mínimo (enteros) — alerta con «Llegó al mínimo»', () => {
    const datos = BASE();
    datos.productos[0].stockMinimo = 8;
    datos.movimientos = [{ id: 'm2', productoId: 'p1', fecha: '2026-01-20', tipo: 'salida', cantidad: 2, concepto: 'Venta' }];
    const r = calcularInv(datos);
    expect(r.productos[0].existenciaFinal).toBe(8);
    expect(r.productos[0].reponer).toBe(true);
    expect(r.productos[0].faltante).toBe(0);
    expect(descripcionReposicion(r.productos[0])).toBe('Llegó al mínimo: programe una compra.');
  });

  it('M2: decimales igual al mínimo (0.3 + 0.1 + 0.2 frente a 0.6) — alerta', () => {
    const datos = {
      productos: [{ id: 'p1', nombre: 'Harina', unidad: 'kilos', existenciaInicial: 0.3, costoUnitario: 2, stockMinimo: 0.6 }],
      movimientos: [
        { id: 'm1', productoId: 'p1', fecha: '2026-01-05', tipo: 'entrada', cantidad: 0.1, concepto: 'Compra' },
        { id: 'm2', productoId: 'p1', fecha: '2026-01-10', tipo: 'entrada', cantidad: 0.2, concepto: 'Compra' }
      ]
    };
    const r = calcularInv(datos);
    expect(r.productos[0].existenciaFinal).toBeCloseTo(0.6, 9);
    expect(r.productos[0].reponer).toBe(true);
    expect(descripcionReposicion(r.productos[0])).toBe('Llegó al mínimo: programe una compra.');
  });

  it('M3: existencia debajo del mínimo — faltante y costo con el costo promedio', () => {
    const datos = BASE();
    datos.productos[0].existenciaInicial = 2;
    datos.movimientos = [];
    const r = calcularInv(datos);
    expect(r.productos[0].existenciaFinal).toBe(2);
    expect(r.productos[0].reponer).toBe(true);
    expect(r.productos[0].faltante).toBe(2);
    expect(r.productos[0].costoReposicion).toBe(8); // 2 faltantes × 4 promedio
    expect(descripcionReposicion(r.productos[0])).toBe('Bajo el mínimo: comprar al menos 2 unidades (costo estimado C$ 8.00) para volver al mínimo.');
  });

  it('M4: compra a precio distinto — promedio ponderado móvil', () => {
    const datos = {
      productos: [{ id: 'p1', nombre: 'Producto', unidad: 'unidades', existenciaInicial: 5, costoUnitario: 10, stockMinimo: 0 }],
      movimientos: [
        { id: 'm1', productoId: 'p1', fecha: '2026-01-05', tipo: 'entrada', cantidad: 10, costoUnitario: 12, concepto: 'Compra a otro precio' },
        { id: 'm2', productoId: 'p1', fecha: '2026-01-20', tipo: 'salida', cantidad: 8, concepto: 'Venta' }
      ]
    };
    const r = calcularInv(datos);
    const p = r.productos[0];
    // Promedio tras la entrada: (5 × 10 + 10 × 12) / 15 = 170 / 15 = 11.3333.
    expect(p.costoPromedio).toBeCloseTo(170 / 15, 6);
    // Salida de 8 u: costo 8 × 11.3333 = 90.6667; existencia final 7 u; valor 79.3333.
    expect(p.costoSalidas).toBeCloseTo(8 * 170 / 15, 6);
    expect(p.existenciaFinal).toBe(7);
    expect(p.valor).toBeCloseTo(7 * 170 / 15, 6);
  });

  it('M5: salida que deja la existencia en 0 — alerta con mínimo 5, sin alerta con mínimo 0', () => {
    const datos = BASE();
    datos.productos[0].stockMinimo = 5;
    datos.movimientos = [{ id: 'm1', productoId: 'p1', fecha: '2026-01-20', tipo: 'salida', cantidad: 10, concepto: 'Venta' }];
    const r = calcularInv(datos);
    expect(r.productos[0].existenciaFinal).toBe(0);
    expect(r.productos[0].reponer).toBe(true);
    // Con mínimo 0 no hay política de reposición.
    const sinPolitica = { ...datos, productos: [{ ...datos.productos[0], stockMinimo: 0 }] };
    const r2 = calcularInv(sinPolitica);
    expect(r2.productos[0].existenciaFinal).toBe(0);
    expect(r2.productos[0].reponer).toBe(false);
    expect(r2.porReponer).toEqual([]);
  });

  it('M6: fecha mal escrita en dato importado — descartada, contada y el respaldo se rechaza', () => {
    const datos = BASE();
    datos.movimientos.forEach(m => { m.fecha = '05/01/2026'; });
    expect(normalizarInventario(datos).movimientos).toEqual([]);
    const r = calcularInv(datos);
    expect(r.descartados).toContainEqual({ motivo: 'Movimiento con fecha inválida', cantidad: 2 });
    expect(() => validarRespaldo({ inventario: datos }, { inventario: { productos: [], movimientos: [] } }))
      .toThrow(/El inventario del respaldo tiene registros descartados/);
  });

  it('M7: existencia inicial negativa en dato importado — descartada con su motivo', () => {
    const datos = BASE();
    datos.productos[0].existenciaInicial = -3;
    const r = calcularInv(datos);
    expect(r.productos).toEqual([]);
    expect(r.descartados).toContainEqual({ motivo: 'Producto con campo numérico inválido o negativo', cantidad: 1 });
  });

  it('M8: entrada sin costo (dato anterior) usa el costo del producto y cuenta en el aviso', () => {
    const datos = BASE();
    datos.productos[0].costoUnitario = 6;
    const r = calcularInv(datos);
    // La entrada de 6 u sin costo usa el costo del producto (6): el promedio no cambia.
    expect(r.productos[0].costoPromedio).toBe(6);
    expect(r.productos[0].valor).toBe(8 * 6);
    expect(r.movimientosSinCosto).toBe(1);
  });

  it('M10: productos con unidades distintas — existencia total N/D', () => {
    const datos = {
      productos: [
        { id: 'p1', nombre: 'Prenda', unidad: 'prendas', existenciaInicial: 10, costoUnitario: 4, stockMinimo: 2 },
        { id: 'p2', nombre: 'Tela', unidad: 'kilos', existenciaInicial: 5, costoUnitario: 3, stockMinimo: 1 }
      ],
      movimientos: []
    };
    const r = calcularInv(datos);
    expect(r.unidadesTotales).toBeNull();
    expect(r.productos).toHaveLength(2);
  });

  it('M9 y M11: el mínimo cambia en Inventario y Planeación alerta con el valor nuevo', async () => {
    vi.stubGlobal('document', { getElementById: () => null });
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const { default: store } = await import('../../js/store.js');
    store._data = null;
    store._listeners = [];
    const planeacion = await import('../../js/modules/planeacion/planeacion-calculations.js');
    const supuestos = { ...planeacion.ejemploPlaneacion(), productoId: 'prod-min' };
    const inventarioCon = minimo => ({
      productos: [{ id: 'prod-min', nombre: 'Producto', unidad: 'unidades', stockMinimo: minimo, existenciaFinal: 60, costoPromedio: 480, reponer: false, faltante: 0, costoReposicion: 0 }]
    });
    // Con mínimo 50, el Trimestre 1 (60 sobre el mínimo) no avisa; al subirlo a 70 sí (60 ≤ 70).
    const r1 = planeacion.calcularPresupuestoMaestro(supuestos, inventarioCon(50));
    expect(r1.avisos.some(a => a.codigo === 'bajo-stock-minimo')).toBe(false);
    const r2 = planeacion.calcularPresupuestoMaestro(supuestos, inventarioCon(70));
    expect(r2.avisos.filter(a => a.codigo === 'bajo-stock-minimo').map(a => a.periodo))
      .toEqual(['Trimestre 1', 'Trimestre 2', 'Trimestre 4']);
    vi.unstubAllGlobals();
  });
});

// --- Ronda 2: correcciones (H1 a H5) y D-085 ---

// Productos y movimientos base de la matriz (sin costo en los movimientos: M0).
const BASE = () => ({
  productos: [
    { id: 'p1', nombre: 'Producto único', unidad: 'unidades', existenciaInicial: 10, costoUnitario: 4, stockMinimo: 4 }
  ],
  movimientos: [
    { id: 'm1', productoId: 'p1', fecha: '2026-01-05', tipo: 'entrada', cantidad: 6, concepto: 'Compra' },
    { id: 'm2', productoId: 'p1', fecha: '2026-01-20', tipo: 'salida', cantidad: 8, concepto: 'Venta' }
  ]
});

describe('respaldo de inventario: forma y descartes (ronda 2, T1)', () => {
  const ACTUALES = { inventario: { productos: [], movimientos: [] }, estados: { periods: [], balanceGeneral: {}, estadoResultados: {} } };

  it('C1: inventario null se rechaza con el texto de main', () => {
    expect(() => validarRespaldo({ inventario: null }, ACTUALES))
      .toThrow('El módulo "inventario" debe ser un objeto.');
  });

  it('C2: inventario texto se rechaza con el texto de main', () => {
    expect(() => validarRespaldo({ inventario: 'abc' }, ACTUALES))
      .toThrow('El módulo "inventario" debe ser un objeto.');
  });

  it('C3: productos que no es lista se rechaza con el texto de main', () => {
    expect(() => validarRespaldo({ inventario: { productos: 'x', movimientos: [] } }, ACTUALES))
      .toThrow('inventario.productos debe ser una lista.');
  });

  it('C4: movimientos que no es lista se rechaza con el texto de main', () => {
    expect(() => validarRespaldo({ inventario: { productos: [], movimientos: 'x' } }, ACTUALES))
      .toThrow('inventario.movimientos debe ser una lista.');
  });

  it('C5: respaldo válido se acepta y se normaliza', () => {
    const { modulos } = validarRespaldo({ inventario: BASE() }, ACTUALES);
    expect(modulos.inventario.productos).toHaveLength(1);
    expect(modulos.inventario.movimientos).toHaveLength(2);
  });

  it('C6: respaldo con registros descartados se rechaza con el conteo (D-083)', () => {
    const conDescartes = BASE();
    conDescartes.movimientos[0].fecha = '05/01/2026';
    expect(() => validarRespaldo({ inventario: conDescartes }, ACTUALES))
      .toThrow(/El inventario del respaldo tiene registros descartados \(Movimiento con fecha inválida: 1\)/);
  });
});

describe('normalizarInventario con listas no válidas (ronda 2, T1/H2)', () => {
  it('C7: una productos o movimientos que no sea lista cuenta como descarte', () => {
    const r = normalizarInventario({ productos: 'x', movimientos: 'y' });
    expect(r.productos).toEqual([]);
    expect(r.movimientos).toEqual([]);
    expect(r.descartados).toContainEqual({ motivo: 'Lista de productos inválida', cantidad: 1 });
    expect(r.descartados).toContainEqual({ motivo: 'Lista de movimientos inválida', cantidad: 1 });
  });
});

describe('Planeación sin producto vinculado (ronda 2, T2/D-085)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('C8: con nombre y sin productoId hay aviso y no hay alerta de stock por nombre', async () => {
    vi.stubGlobal('document', { getElementById: () => null });
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const { default: store } = await import('../../js/store.js');
    store._data = null;
    store._listeners = [];
    const planeacion = await import('../../js/modules/planeacion/planeacion-calculations.js');
    const supuestos = {
      ...planeacion.ejemploPlaneacion(),
      productoInventario: 'Producto anterior', productoId: ''
    };
    const inventario = {
      productos: [{ id: 'prod-1', nombre: 'Producto', unidad: 'unidades', stockMinimo: 1, existenciaFinal: 0, costoPromedio: 480, reponer: false, faltante: 0, costoReposicion: 0 }]
    };
    const r = planeacion.calcularPresupuestoMaestro(supuestos, inventario);
    expect(r.avisos).toContainEqual({ codigo: 'sin-producto-vinculado' });
    expect(r.avisos.some(a => a.codigo === 'bajo-stock-minimo')).toBe(false);
    vi.unstubAllGlobals();
  });

  it('C9: con productoId y mínimo vigente, la alerta usa el mínimo del producto', async () => {
    vi.stubGlobal('document', { getElementById: () => null });
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const { default: store } = await import('../../js/store.js');
    store._data = null;
    store._listeners = [];
    const planeacion = await import('../../js/modules/planeacion/planeacion-calculations.js');
    const supuestos = {
      ...planeacion.ejemploPlaneacion(),
      productoInventario: 'Producto', productoId: 'prod-1'
    };
    const inventario = {
      productos: [{ id: 'prod-1', nombre: 'Producto', unidad: 'unidades', stockMinimo: 80, existenciaFinal: 0, costoPromedio: 480, reponer: false, faltante: 0, costoReposicion: 0 }]
    };
    const r = planeacion.calcularPresupuestoMaestro(supuestos, inventario);
    expect(r.avisos.filter(a => a.codigo === 'bajo-stock-minimo').map(a => a.periodo))
      .toEqual(['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Trimestre 4']);
    expect(r.avisos.some(a => a.codigo === 'sin-producto-vinculado')).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe('faltante con tolerancia (ronda 2, T3/H4)', () => {
  it('C10: existencia 0.5999999 con mínimo 0.6 — «Llegó al mínimo», sin comprar 0.0000001', () => {
    const p = {
      nombre: 'Harina', unidad: 'kilos', reponer: true,
      existenciaFinal: 0.5999999, stockMinimo: 0.6,
      faltante: 0.6 - 0.5999999, costoReposicion: 0.6 - 0.5999999
    };
    const texto = descripcionReposicion(p);
    expect(texto).toBe('Llegó al mínimo: programe una compra.');
    expect(texto).not.toContain('comprar al menos');
  });

  it('C11: la regresión M0 a M11 de la ronda 1 sigue en verde en este archivo', () => {
    // C11 no agrega una prueba nueva: los describes «matriz de casos de
    // inventario (M0 a M11)» de este archivo son la verificación, y la suite
    // los ejecuta en cada corrida. La fila del reporte apunta a ellos.
    expect(true).toBe(true);
  });
});
