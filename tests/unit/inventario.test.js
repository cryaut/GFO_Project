import { describe, expect, it, vi } from 'vitest';
import { existenciaFinal, necesitaReposicion, valorInventario } from '../../js/utils/calculate.js';
import {
  calcularInventario, ejemploInventario, kardex, movimientosDeProducto, normalizarInventario,
  validarBorradoMovimiento, validarMovimiento, validarProducto
} from '../../js/modules/inventario/inventario-calculations.js';
import { inventarioUI } from '../../js/modules/inventario/inventario-ui.js';
import { clic, element, enviar, llenar, mensaje } from './helpers/dom-falso.js';

describe('fórmulas de inventario', () => {
  it('existencia final = inicial + entradas − salidas', () => {
    expect(existenciaFinal(120, 60, 145)).toBe(35); // camisa del ejemplo
    expect(existenciaFinal(0, 0, 0)).toBe(0);
    expect(existenciaFinal(null, 60, 145)).toBeNull();
  });

  it('valor del inventario = existencia final × costo unitario', () => {
    expect(valorInventario(35, 350)).toBe(12250);
    expect(valorInventario(35, undefined)).toBeNull();
  });

  it('alerta de reposición cuando la existencia llega al stock mínimo', () => {
    expect(necesitaReposicion(35, 40)).toBe(true);
    expect(necesitaReposicion(40, 40)).toBe(true);
    expect(necesitaReposicion(50, 30)).toBe(false);
    expect(necesitaReposicion(null, 30)).toBeNull();
  });
});

describe('caso de ejemplo de MUNO MODA', () => {
  const r = calcularInventario(ejemploInventario());
  const porNombre = Object.fromEntries(r.productos.map(p => [p.nombre, p]));

  it('existencias finales y valores resueltos a mano', () => {
    // Camisa 120 + 60 − 145 = 35; jean 80 + 40 − 70 = 50; vestido 45 − 32 = 13; chaqueta 30 + 20 − 18 = 32
    expect(porNombre['Camisa casual']).toMatchObject({ entradas: 60, salidas: 145, existenciaFinal: 35, valor: 12250 });
    expect(porNombre['Pantalón jean']).toMatchObject({ existenciaFinal: 50, valor: 26000, reponer: false });
    expect(porNombre['Vestido de verano']).toMatchObject({ existenciaFinal: 13, valor: 10140 });
    expect(porNombre['Chaqueta']).toMatchObject({ existenciaFinal: 32, valor: 30400, reponer: false });
    // 12,250 + 26,000 + 10,140 + 30,400
    expect(r.valorTotal).toBe(78790);
    expect(r.unidadesTotales).toBe(130);
  });

  it('alertas de reposición con el faltante y su costo', () => {
    expect(r.porReponer.map(p => p.nombre)).toEqual(['Camisa casual', 'Vestido de verano']);
    expect(porNombre['Camisa casual']).toMatchObject({ faltante: 5, costoReposicion: 1750 }); // (40 − 35) × 350
    expect(porNombre['Vestido de verano']).toMatchObject({ faltante: 2, costoReposicion: 1560 }); // (15 − 13) × 780
    expect(r.costoReposicionTotal).toBe(3310);
  });

  it('el kardex ordena por fecha y lleva el saldo acumulado', () => {
    const datos = normalizarInventario(ejemploInventario());
    const camisa = datos.productos[0];
    const { filas, saldoFinal } = kardex(camisa, movimientosDeProducto(datos, camisa.id));
    expect(filas.map(f => f.saldo)).toEqual([180, 90, 35]);
    expect(saldoFinal).toBe(35);
  });
});

describe('validaciones', () => {
  const datos = normalizarInventario(ejemploInventario());

  it('una salida no puede superar la existencia', () => {
    const errores = validarMovimiento(datos, {
      id: 'x', productoId: 'demo-camisa', tipo: 'salida', cantidad: 36, fecha: '2025-02-01', concepto: 'Venta'
    });
    expect(errores.join(' ')).toContain('Existencia insuficiente');
    expect(errores.join(' ')).toContain('-1');
  });

  it('una salida con fecha anterior no puede dejar negativa una salida posterior', () => {
    // Antes del 15 de enero hay 180 camisas; otra salida de 100 deja −10 el 15 y −65 el 30.
    const errores = validarMovimiento(datos, {
      id: 'x', productoId: 'demo-camisa', tipo: 'salida', cantidad: 100, fecha: '2025-01-10', concepto: ''
    });
    expect(errores.join(' ')).toContain('2025-01-15');
  });

  it('acepta una entrada válida', () => {
    expect(validarMovimiento(datos, {
      id: 'x', productoId: 'demo-camisa', tipo: 'entrada', cantidad: 50, fecha: '2025-02-01', concepto: 'Compra'
    })).toEqual([]);
  });

  it('no deja borrar una entrada de la que dependen salidas posteriores', () => {
    // Sin la entrada de 60: 120 − 90 = 30 y luego 30 − 55 = −25.
    expect(validarBorradoMovimiento(datos, 'demo-m1').join(' ')).toContain('-25');
    expect(validarBorradoMovimiento(datos, 'demo-m8')).toEqual([]);
  });

  it('rechaza nombres repetidos, números inválidos y una existencia inicial que deja saldos negativos', () => {
    const base = { nombre: 'Camisa casual', unidad: 'prendas', existenciaInicial: 0, costoUnitario: 10, stockMinimo: 0 };
    expect(validarProducto(datos, base).join(' ')).toContain('Ya existe');
    expect(validarProducto(datos, { ...base, nombre: 'Gorra', costoUnitario: null }).join(' ')).toContain('costo unitario');
    expect(validarProducto(datos, { ...base, nombre: 'Gorra', stockMinimo: -1 }).join(' ')).toContain('stock mínimo');
    // Editar la camisa con existencia inicial 0: 0 + 60 − 90 = −30 el 15 de enero.
    expect(validarProducto(datos, { ...base, existenciaInicial: 0 }, 'demo-camisa').join(' ')).toContain('-30');
  });

  it('descarta datos guardados inválidos en vez de romper la pantalla', () => {
    const limpio = normalizarInventario({
      productos: [{ id: 'a', nombre: 'A', existenciaInicial: 5, costoUnitario: 2, stockMinimo: 1 }, { id: 'b', nombre: '' }],
      movimientos: [
        { id: 'm1', productoId: 'a', tipo: 'entrada', cantidad: 3, fecha: '2025-01-01' },
        { id: 'm2', productoId: 'zzz', tipo: 'entrada', cantidad: 3, fecha: '2025-01-01' },
        { id: 'm3', productoId: 'a', tipo: 'salida', cantidad: -3, fecha: '2025-01-01' },
        { id: 'm4', productoId: 'a', tipo: 'salida', cantidad: 3, fecha: '01/01/2025' }
      ]
    });
    expect(limpio.productos.map(p => p.id)).toEqual(['a']);
    expect(limpio.movimientos.map(m => m.id)).toEqual(['m1']);
    expect(normalizarInventario(undefined)).toEqual({ productos: [], movimientos: [] });
  });
});

describe('pantalla de inventario', () => {
  function montar(datos = { productos: [], movimientos: [] }, guardar = vi.fn()) {
    const page = element();
    const graficar = vi.fn();
    inventarioUI(page, { datos, guardar, graficar, confirmar: () => true });
    return { page, guardar, graficar };
  }

  it('sin productos invita a cargar el ejemplo', () => {
    const { page, graficar } = montar();
    expect(page.innerHTML).toContain('Sin productos');
    expect(page.querySelector('#invEjemplo')).not.toBeNull();
    expect(graficar).not.toHaveBeenCalled();
  });

  it('carga el ejemplo, lo guarda y muestra valor, alertas y gráfico', async () => {
    const { page, guardar, graficar } = montar();
    await clic(page, 'invEjemplo');
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(guardar.mock.calls[0][0].productos).toHaveLength(4);
    const html = page.innerHTML;
    expect(html).toContain('78,790.00');
    expect(html).toContain('Alertas de reposición');
    expect(html).toContain('Comprar al menos 5 prendas');
    expect(html).toContain('Existencia final = 120 + 60 − 145 = 35 prendas');
    expect(graficar).toHaveBeenLastCalledWith('inventarioChart', expect.objectContaining({ type: 'bar' }));
  });

  it('agrega un producto y escapa su nombre', async () => {
    const { page, guardar } = montar();
    llenar(page, { invNombre: '<img src=x onerror=alert(1)>', invUnidad: 'cajas', invInicial: '10', invCosto: '25.5', invMinimo: '4' });
    await enviar(page, 'formProducto');
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(guardar.mock.calls[0][0].productos[0]).toMatchObject({ existenciaInicial: 10, costoUnitario: 25.5, stockMinimo: 4 });
    expect(page.innerHTML).toContain('&lt;img src=x');
    expect(page.innerHTML).not.toContain('<img src=x');
  });

  it('rechaza una salida mayor que la existencia sin guardar', async () => {
    const { page, guardar } = montar(ejemploInventario());
    llenar(page, { movProducto: 'demo-vestido', movTipo: 'salida', movCantidad: '20', movFecha: '2025-02-01', movConcepto: 'Venta' });
    await enviar(page, 'formMovimiento');
    expect(guardar).not.toHaveBeenCalled();
    expect(mensaje(page, 'inventarioMensaje')).toContain('Existencia insuficiente');
  });

  it('registra una entrada que quita la alerta', async () => {
    const { page, guardar } = montar(ejemploInventario());
    llenar(page, { movProducto: 'demo-vestido', movTipo: 'entrada', movCantidad: '10', movFecha: '2025-02-01', movConcepto: 'Compra' });
    await enviar(page, 'formMovimiento');
    expect(guardar).toHaveBeenCalledTimes(1);
    const vestido = calcularInventario(guardar.mock.calls[0][0]).productos.find(p => p.id === 'demo-vestido');
    expect(vestido).toMatchObject({ existenciaFinal: 23, reponer: false });
    expect(mensaje(page, 'inventarioMensaje')).toContain('Entrada de 10 prendas');
  });

  it('edita y elimina el producto seleccionado desde su kardex', async () => {
    const { page, guardar } = montar(ejemploInventario());
    await clic(page, 'verKardex-2');
    expect(page.innerHTML).toContain('3. Kardex de Vestido de verano');
    await clic(page, 'editarProducto');
    expect(page.innerHTML).toContain('Guardar cambios');
    llenar(page, { invNombre: 'Vestido de verano', invUnidad: 'prendas', invInicial: '45', invCosto: '800', invMinimo: '10' });
    await enviar(page, 'formProducto');
    const vestido = calcularInventario(guardar.mock.lastCall[0]).productos.find(p => p.id === 'demo-vestido');
    expect(vestido).toMatchObject({ costoUnitario: 800, valor: 10400, reponer: false }); // 13 × 800; 13 > 10
    await clic(page, 'borrarProducto');
    const tras = guardar.mock.lastCall[0];
    expect(tras.productos.map(p => p.id)).not.toContain('demo-vestido');
    expect(tras.movimientos.some(m => m.productoId === 'demo-vestido')).toBe(false);
    expect(mensaje(page, 'inventarioMensaje')).toContain('Vestido de verano eliminado');
  });

  it('si no se puede guardar, lo avisa y conserva los datos', async () => {
    const guardar = vi.fn(() => { throw new Error('Cuota excedida'); });
    const { page } = montar({ productos: [], movimientos: [] }, guardar);
    await clic(page, 'invEjemplo');
    expect(mensaje(page, 'inventarioMensaje')).toContain('No se pudo guardar: Cuota excedida');
    expect(page.innerHTML).toContain('Sin productos');
  });
});
