// Control básico de inventario: existencia final, valor y alerta de reposición por producto.
// Lógica pura: sin DOM, window ni store. Plan: docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
import { existenciaFinal, necesitaReposicion, valorInventario } from '../../utils/calculate.js';

export const TIPOS_MOVIMIENTO = ['entrada', 'salida'];
export const MAX_TEXTO = 80;
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;
// Cantidades con decimales (kg, metros): menos de una millonésima cuenta como 0.
const TOLERANCIA = 1e-6;

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Datos guardados → forma válida. Lo que no cumple la forma se descarta para no romper la pantalla.
export function normalizarInventario(datos) {
  const productos = [];
  const ids = new Set();
  for (const p of Array.isArray(datos?.productos) ? datos.productos : []) {
    if (!p || typeof p.id !== 'string' || ids.has(p.id) || !texto(p.nombre)) continue;
    if (![p.existenciaInicial, p.costoUnitario, p.stockMinimo].every(esNumero)) continue;
    if (p.existenciaInicial < 0 || p.costoUnitario < 0 || p.stockMinimo < 0) continue;
    ids.add(p.id);
    productos.push({
      id: p.id, nombre: texto(p.nombre), unidad: texto(p.unidad) || 'unidades',
      existenciaInicial: p.existenciaInicial, costoUnitario: p.costoUnitario, stockMinimo: p.stockMinimo
    });
  }
  const movimientos = [];
  const idsMovimiento = new Set();
  for (const m of Array.isArray(datos?.movimientos) ? datos.movimientos : []) {
    if (!m || typeof m.id !== 'string' || idsMovimiento.has(m.id) || !ids.has(m.productoId)) continue;
    if (!TIPOS_MOVIMIENTO.includes(m.tipo) || !esNumero(m.cantidad) || m.cantidad <= 0) continue;
    if (typeof m.fecha !== 'string' || !FECHA_ISO.test(m.fecha)) continue;
    idsMovimiento.add(m.id);
    movimientos.push({
      id: m.id, productoId: m.productoId, fecha: m.fecha, tipo: m.tipo,
      cantidad: m.cantidad, concepto: texto(m.concepto)
    });
  }
  return { productos, movimientos };
}

// Movimientos de un producto en orden cronológico; a igual fecha, en el orden en que se registraron.
export function movimientosDeProducto(datos, productoId) {
  return datos.movimientos
    .map((movimiento, orden) => ({ movimiento, orden }))
    .filter(({ movimiento }) => movimiento.productoId === productoId)
    .sort((a, b) => a.movimiento.fecha.localeCompare(b.movimiento.fecha) || a.orden - b.orden)
    .map(({ movimiento }) => movimiento);
}

// Kardex en unidades: saldo después de cada movimiento. primerNegativo es el primer
// movimiento que deja la existencia bajo cero (null si ninguno lo hace).
export function kardex(producto, movimientos) {
  let saldo = producto.existenciaInicial;
  let entradas = 0;
  let salidas = 0;
  let primerNegativo = null;
  const filas = movimientos.map(movimiento => {
    if (movimiento.tipo === 'entrada') {
      entradas += movimiento.cantidad;
      saldo += movimiento.cantidad;
    } else {
      salidas += movimiento.cantidad;
      saldo -= movimiento.cantidad;
    }
    if (saldo < -TOLERANCIA && !primerNegativo) primerNegativo = { ...movimiento, saldo };
    return { ...movimiento, saldo };
  });
  return { filas, entradas, salidas, saldoFinal: saldo, primerNegativo };
}

// Existencia final, valor y alerta de un producto con sus movimientos ya ordenados.
export function resumenProducto(producto, movimientos) {
  const { entradas, salidas, filas } = kardex(producto, movimientos);
  const final = existenciaFinal(producto.existenciaInicial, entradas, salidas);
  const reponer = necesitaReposicion(final, producto.stockMinimo);
  // Faltante para volver al stock mínimo: la cantidad mínima a comprar (D-011).
  const faltante = reponer ? Math.max(0, producto.stockMinimo - final) : 0;
  return {
    ...producto, entradas, salidas, existenciaFinal: final,
    valor: valorInventario(final, producto.costoUnitario),
    reponer, faltante, costoReposicion: faltante * producto.costoUnitario,
    cantidadMovimientos: filas.length
  };
}

// Resumen de todo el inventario: productos, valor total y alertas de reposición.
export function calcularInventario(datos) {
  const normal = normalizarInventario(datos);
  const productos = normal.productos
    .map(producto => resumenProducto(producto, movimientosDeProducto(normal, producto.id)));
  const porReponer = productos.filter(producto => producto.reponer);
  return {
    productos,
    valorTotal: productos.reduce((suma, p) => suma + p.valor, 0),
    unidadesTotales: productos.reduce((suma, p) => suma + p.existenciaFinal, 0),
    porReponer,
    costoReposicionTotal: porReponer.reduce((suma, p) => suma + p.costoReposicion, 0)
  };
}

function negativoEn(datos, producto) {
  return kardex(producto, movimientosDeProducto(datos, producto.id)).primerNegativo;
}

function textoNegativo(producto, negativo) {
  return `la existencia de ${producto.nombre} queda en ${negativo.saldo} ${producto.unidad} el ${negativo.fecha}`;
}

// Errores de un producto nuevo o editado (lista vacía si es válido). Los números llegan
// ya leídos: null significa que el campo no era un número.
export function validarProducto(datos, producto, idEditado = null) {
  const errores = [];
  const nombre = texto(producto.nombre);
  if (!nombre) errores.push('Escriba el nombre del producto.');
  else if (nombre.length > MAX_TEXTO) errores.push(`El nombre admite hasta ${MAX_TEXTO} caracteres.`);
  else if (datos.productos.some(p => p.id !== idEditado && p.nombre.toLowerCase() === nombre.toLowerCase())) {
    errores.push(`Ya existe un producto llamado ${nombre}.`);
  }
  if (texto(producto.unidad).length > MAX_TEXTO) errores.push(`La unidad admite hasta ${MAX_TEXTO} caracteres.`);
  const campos = [
    ['existenciaInicial', 'La existencia inicial'], ['costoUnitario', 'El costo unitario'], ['stockMinimo', 'El stock mínimo']
  ];
  for (const [campo, etiqueta] of campos) {
    if (!esNumero(producto[campo]) || producto[campo] < 0) errores.push(`${etiqueta} debe ser un número mayor o igual a 0.`);
  }
  if (!errores.length && idEditado) {
    const negativo = negativoEn(datos, { ...producto, id: idEditado });
    if (negativo) errores.push(`Con esa existencia inicial, ${textoNegativo(producto, negativo)}.`);
  }
  return errores;
}

// Errores de un movimiento nuevo. Una salida no puede dejar la existencia negativa en su
// fecha ni en las siguientes.
export function validarMovimiento(datos, movimiento) {
  const errores = [];
  const producto = datos.productos.find(p => p.id === movimiento.productoId);
  if (!producto) errores.push('Elija un producto.');
  if (!TIPOS_MOVIMIENTO.includes(movimiento.tipo)) errores.push('Elija si es una entrada o una salida.');
  if (!esNumero(movimiento.cantidad) || movimiento.cantidad <= 0) errores.push('La cantidad debe ser un número mayor que 0.');
  if (typeof movimiento.fecha !== 'string' || !FECHA_ISO.test(movimiento.fecha)) errores.push('Indique la fecha del movimiento.');
  if (texto(movimiento.concepto).length > MAX_TEXTO) errores.push(`El concepto admite hasta ${MAX_TEXTO} caracteres.`);
  if (errores.length) return errores;
  const negativo = negativoEn({ ...datos, movimientos: [...datos.movimientos, movimiento] }, producto);
  if (negativo) {
    errores.push(`Existencia insuficiente: con este movimiento ${textoNegativo(producto, negativo)}.`);
  }
  return errores;
}

// Errores al borrar un movimiento: sin una entrada, una salida posterior podría quedar sin existencia.
export function validarBorradoMovimiento(datos, idMovimiento) {
  const movimiento = datos.movimientos.find(m => m.id === idMovimiento);
  if (!movimiento) return ['El movimiento ya no existe.'];
  const producto = datos.productos.find(p => p.id === movimiento.productoId);
  const restantes = { ...datos, movimientos: datos.movimientos.filter(m => m.id !== idMovimiento) };
  const negativo = producto ? negativoEn(restantes, producto) : null;
  return negativo ? [`No se puede borrar: sin ese movimiento, ${textoNegativo(producto, negativo)}.`] : [];
}

// Ejemplo ficticio de MUNO MODA para la demostración (caso de docs/planificacion/modulos-guia/01).
export function ejemploInventario() {
  const producto = (id, nombre, existenciaInicial, costoUnitario, stockMinimo) => ({
    id, nombre, unidad: 'prendas', existenciaInicial, costoUnitario, stockMinimo
  });
  const mov = (id, productoId, fecha, tipo, cantidad, concepto) => ({ id, productoId, fecha, tipo, cantidad, concepto });
  return {
    productos: [
      producto('demo-camisa', 'Camisa casual', 120, 350, 40),
      producto('demo-jean', 'Pantalón jean', 80, 520, 30),
      producto('demo-vestido', 'Vestido de verano', 45, 780, 15),
      producto('demo-chaqueta', 'Chaqueta', 30, 950, 10)
    ],
    movimientos: [
      mov('demo-m1', 'demo-camisa', '2025-01-06', 'entrada', 60, 'Compra a proveedor'),
      mov('demo-m2', 'demo-jean', '2025-01-08', 'entrada', 40, 'Compra a proveedor'),
      mov('demo-m3', 'demo-chaqueta', '2025-01-10', 'entrada', 20, 'Compra a proveedor'),
      mov('demo-m4', 'demo-camisa', '2025-01-15', 'salida', 90, 'Ventas de la quincena'),
      mov('demo-m5', 'demo-vestido', '2025-01-20', 'salida', 32, 'Ventas del mes'),
      mov('demo-m6', 'demo-jean', '2025-01-25', 'salida', 70, 'Ventas del mes'),
      mov('demo-m7', 'demo-chaqueta', '2025-01-28', 'salida', 18, 'Ventas del mes'),
      mov('demo-m8', 'demo-camisa', '2025-01-30', 'salida', 55, 'Ventas de fin de mes')
    ]
  };
}
