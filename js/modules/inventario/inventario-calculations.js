// Control básico de inventario: existencia final, valor y alerta de reposición por producto.
// Lógica pura: sin DOM, window ni store. Plan: docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
import { formatCurrency } from '../../utils/format.js';
import { existenciaFinal, necesitaReposicion, TOLERANCIA_REPOSICION, valorInventario } from '../../utils/calculate.js';

export const TIPOS_MOVIMIENTO = ['entrada', 'salida'];
export const MAX_TEXTO = 80;
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Datos guardados → forma válida. Lo que no cumple la forma se descarta para no romper la pantalla.
// D-083: cada descarte se cuenta en `descartados` con su motivo (nada silencioso).
export function normalizarInventario(datos) {
  const descartados = [];
  const contar = motivo => {
    const existente = descartados.find(d => d.motivo === motivo);
    if (existente) existente.cantidad += 1;
    else descartados.push({ motivo, cantidad: 1 });
  };
  const productos = [];
  const ids = new Set();
  for (const p of Array.isArray(datos?.productos) ? datos.productos : []) {
    if (!p || typeof p.id !== 'string' || !texto(p.nombre) || ids.has(p.id)) {
      contar('Producto sin nombre o identificador inválido');
      continue;
    }
    if (![p.existenciaInicial, p.costoUnitario, p.stockMinimo].every(esNumero)) {
      contar('Producto con campo numérico inválido o negativo');
      continue;
    }
    if (p.existenciaInicial < 0 || p.costoUnitario < 0 || p.stockMinimo < 0) {
      contar('Producto con campo numérico inválido o negativo');
      continue;
    }
    ids.add(p.id);
    productos.push({
      id: p.id, nombre: texto(p.nombre), unidad: texto(p.unidad) || 'unidades',
      existenciaInicial: p.existenciaInicial, costoUnitario: p.costoUnitario, stockMinimo: p.stockMinimo
    });
  }
  const movimientos = [];
  const idsMovimiento = new Set();
  for (const m of Array.isArray(datos?.movimientos) ? datos.movimientos : []) {
    if (!m || typeof m.id !== 'string' || idsMovimiento.has(m.id)) {
      contar('Movimiento con identificador inválido o repetido');
      continue;
    }
    if (!ids.has(m.productoId)) {
      contar('Movimiento de un producto inexistente');
      continue;
    }
    if (!TIPOS_MOVIMIENTO.includes(m.tipo)) {
      contar('Movimiento con tipo inválido');
      continue;
    }
    if (!esNumero(m.cantidad) || m.cantidad <= 0) {
      contar('Movimiento con cantidad inválida');
      continue;
    }
    if (typeof m.fecha !== 'string' || !FECHA_ISO.test(m.fecha)) {
      contar('Movimiento con fecha inválida');
      continue;
    }
    idsMovimiento.add(m.id);
    // D-081: las entradas pueden traer su costo unitario (≥ 0); los datos
    // anteriores sin costo se conservan sin él y usan el costo del producto.
    const conCosto = esNumero(m.costoUnitario) && m.costoUnitario >= 0;
    movimientos.push({
      id: m.id, productoId: m.productoId, fecha: m.fecha, tipo: m.tipo,
      cantidad: m.cantidad, concepto: texto(m.concepto),
      ...(conCosto ? { costoUnitario: m.costoUnitario } : {})
    });
  }
  return { productos, movimientos, descartados };
}

// Movimientos de un producto en orden cronológico; a igual fecha, en el orden en que se registraron.
export function movimientosDeProducto(datos, productoId) {
  return datos.movimientos
    .map((movimiento, orden) => ({ movimiento, orden }))
    .filter(({ movimiento }) => movimiento.productoId === productoId)
    .sort((a, b) => a.movimiento.fecha.localeCompare(b.movimiento.fecha) || a.orden - b.orden)
    .map(({ movimiento }) => movimiento);
}

// Kardex en unidades y en costo: saldo después de cada movimiento y, con D-081,
// costo promedio ponderado móvil (las entradas lo recalculan, las salidas salen
// al costo vigente). primerNegativo es el primer movimiento que deja la
// existencia bajo cero (null si ninguno lo hace).
export function kardex(producto, movimientos) {
  let saldo = producto.existenciaInicial;
  let costoPromedio = producto.costoUnitario; // D-081: costo de la existencia inicial
  let entradas = 0;
  let salidas = 0;
  let costoSalidas = 0;
  let primerNegativo = null;
  const filas = movimientos.map(movimiento => {
    let costoMovimiento = null;
    if (movimiento.tipo === 'entrada') {
      const costoEntrada = esNumero(movimiento.costoUnitario) && movimiento.costoUnitario >= 0
        ? movimiento.costoUnitario : producto.costoUnitario;
      // C = (E × C + q × c) / (E + q); con E = 0 el nuevo promedio es c.
      costoPromedio = saldo <= 0
        ? costoEntrada
        : (saldo * costoPromedio + movimiento.cantidad * costoEntrada) / (saldo + movimiento.cantidad);
      entradas += movimiento.cantidad;
      saldo += movimiento.cantidad;
    } else {
      // La salida sale al costo promedio vigente y no cambia el promedio.
      costoMovimiento = movimiento.cantidad * costoPromedio;
      costoSalidas += costoMovimiento;
      salidas += movimiento.cantidad;
      saldo -= movimiento.cantidad;
    }
    if (saldo < -TOLERANCIA_REPOSICION && !primerNegativo) primerNegativo = { ...movimiento, saldo };
    return { ...movimiento, saldo, costoPromedio, costoMovimiento };
  });
  return { filas, entradas, salidas, saldoFinal: saldo, primerNegativo, costoPromedio, costoSalidas };
}

// Existencia final, valuación a costo promedio y alerta de un producto con sus
// movimientos ya ordenados.
export function resumenProducto(producto, movimientos) {
  const k = kardex(producto, movimientos);
  const final = existenciaFinal(producto.existenciaInicial, k.entradas, k.salidas);
  const reponer = necesitaReposicion(final, producto.stockMinimo);
  // Faltante para volver al stock mínimo: la cantidad mínima a comprar (D-011).
  const faltante = reponer ? Math.max(0, producto.stockMinimo - final) : 0;
  return {
    ...producto, entradas: k.entradas, salidas: k.salidas, existenciaFinal: final,
    costoPromedio: k.costoPromedio, costoSalidas: k.costoSalidas,
    valor: valorInventario(final, k.costoPromedio),
    reponer, faltante, costoReposicion: faltante * k.costoPromedio,
    cantidadMovimientos: k.filas.length
  };
}

// Resumen de todo el inventario: productos, valor total, alertas de reposición,
// descartes visibles (D-083) y conteo de entradas sin costo (D-081).
export function calcularInventario(datos) {
  const normal = normalizarInventario(datos);
  const productos = normal.productos
    .map(producto => resumenProducto(producto, movimientosDeProducto(normal, producto.id)));
  const porReponer = productos.filter(producto => producto.reponer);
  // D-084: sumar existencias de unidades distintas no tiene sentido → N/D.
  const unidadesDistintas = new Set(productos.map(p => p.unidad)).size > 1;
  return {
    productos,
    valorTotal: productos.reduce((suma, p) => suma + p.valor, 0),
    unidadesTotales: unidadesDistintas ? null : productos.reduce((suma, p) => suma + p.existenciaFinal, 0),
    porReponer,
    costoReposicionTotal: porReponer.reduce((suma, p) => suma + p.costoReposicion, 0),
    descartados: normal.descartados,
    movimientosSinCosto: normal.movimientos.filter(m => m.tipo === 'entrada' && !esNumero(m.costoUnitario)).length
  };
}

// D-082: redacción única de la alerta de reposición para las tres pantallas
// (Inventario, Inicio y Proforma). Devuelve '' si el producto no pide reposición.
export function descripcionReposicion(producto) {
  if (!producto.reponer) return '';
  return producto.faltante > 0
    ? `Bajo el mínimo: comprar al menos ${producto.faltante} ${producto.unidad} (costo estimado ${formatCurrency(producto.costoReposicion)}) para volver al mínimo.`
    : 'Llegó al mínimo: programe una compra.';
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
// fecha ni en las siguientes. D-081: las entradas exigen costo unitario ≥ 0.
export function validarMovimiento(datos, movimiento) {
  const errores = [];
  const producto = datos.productos.find(p => p.id === movimiento.productoId);
  if (!producto) errores.push('Elija un producto.');
  if (!TIPOS_MOVIMIENTO.includes(movimiento.tipo)) errores.push('Elija si es una entrada o una salida.');
  if (!esNumero(movimiento.cantidad) || movimiento.cantidad <= 0) errores.push('La cantidad debe ser un número mayor que 0.');
  if (movimiento.tipo === 'entrada' && (!esNumero(movimiento.costoUnitario) || movimiento.costoUnitario < 0)) {
    errores.push('La entrada debe indicar un costo unitario mayor o igual a 0.');
  }
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
