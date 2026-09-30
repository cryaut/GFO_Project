// Presupuesto maestro de una empresa comercial: ventas, compras, costo de bienes vendidos,
// gastos de operación, caja y estado de resultados presupuestado.
// Lógica pura: sin DOM, window ni store. Plan: docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
import {
  comprasPresupuestadas, costoBienesVendidos, financiamientoRequerido, margenContribucionUnitario,
  margenSeguridad, puntoEquilibrioUnidades, puntoEquilibrioVentas, razonMargenContribucion
} from '../../utils/calculate.js';

export const TIPOS_PERIODO = ['Mes', 'Trimestre'];
export const MAX_PERIODOS = 12;

// Supuestos escalares: [clave, etiqueta, clase]. clase: 'positivo' (> 0), 'monto' (≥ 0),
// 'libre' (cualquier número), 'unidades' (≥ 0), 'fraccion' (0 a 1), 'tasa' (0 a menos de 1)
// y 'multiplo' (≥ 0, puede pasar de 1). Las tres últimas se escriben en % en la pantalla.
export const SUPUESTOS = [
  ['precio', 'Precio de venta unitario (C$)', 'positivo'],
  ['costoUnitario', 'Costo unitario de compra (C$)', 'monto'],
  ['pctContado', 'Ventas cobradas al contado (%)', 'fraccion'],
  ['cxcInicial', 'Cuentas por cobrar iniciales (C$)', 'monto'],
  ['pctComprasContado', 'Compras pagadas al contado (%)', 'fraccion'],
  ['cxpInicial', 'Cuentas por pagar iniciales (C$)', 'monto'],
  ['inventarioInicial', 'Inventario inicial (unidades)', 'unidades'],
  ['pctInventarioFinal', 'Inventario final deseado (% de las ventas del periodo siguiente)', 'multiplo'],
  ['inventarioFinalUltimo', 'Inventario final del último periodo (unidades)', 'unidades'],
  ['pctGastosVariables', 'Gastos variables de operación (% de las ventas)', 'fraccion'],
  ['gastosFijos', 'Gastos fijos pagados por periodo (C$)', 'monto'],
  ['depreciacion', 'Depreciación por periodo (C$)', 'monto'],
  ['intereses', 'Intereses pagados por periodo (C$)', 'monto'],
  ['tasaIR', 'Tasa de impuesto sobre la renta (%)', 'tasa'],
  ['saldoInicialCaja', 'Saldo inicial de caja (C$)', 'libre'],
  ['saldoMinimoCaja', 'Saldo mínimo de caja (C$)', 'monto']
];

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function suma(lista) {
  return lista.reduce((total, valor) => total + valor, 0);
}

// Lista de n números: recorta o completa con el último valor (o 0).
export function ajustarLista(lista, n) {
  const base = Array.isArray(lista) ? lista.map(v => (esNumero(v) ? v : null)) : [];
  const relleno = base.length ? base[base.length - 1] : 0;
  return Array.from({ length: n }, (_, i) => (i < base.length ? base[i] : relleno));
}

// Supuestos guardados → forma completa, o null si nunca se configuraron.
export function normalizarSupuestos(datos) {
  if (!datos || typeof datos !== 'object') return null;
  const periodos = Number.isInteger(datos.periodos) && datos.periodos >= 1 && datos.periodos <= MAX_PERIODOS ? datos.periodos : 4;
  const s = {
    tipoPeriodo: TIPOS_PERIODO.includes(datos.tipoPeriodo) ? datos.tipoPeriodo : 'Trimestre',
    periodos,
    ventasUnidades: ajustarLista(datos.ventasUnidades, periodos),
    otrosDesembolsos: ajustarLista(datos.otrosDesembolsos, periodos),
    productoInventario: typeof datos.productoInventario === 'string' ? datos.productoInventario : '',
    stockMinimo: esNumero(datos.stockMinimo) ? datos.stockMinimo : null
  };
  for (const [clave] of SUPUESTOS) s[clave] = esNumero(datos[clave]) ? datos[clave] : null;
  return s;
}

// Errores de los supuestos (lista vacía si se puede calcular).
export function validarSupuestos(s) {
  if (!s) return ['Configure los supuestos o cargue el ejemplo.'];
  const errores = [];
  if (!TIPOS_PERIODO.includes(s.tipoPeriodo)) errores.push('Elija meses o trimestres.');
  if (!Number.isInteger(s.periodos) || s.periodos < 1 || s.periodos > MAX_PERIODOS) {
    errores.push(`El número de periodos debe ser un entero entre 1 y ${MAX_PERIODOS}.`);
  }
  for (const [clave, etiqueta, clase] of SUPUESTOS) {
    const v = s[clave];
    if (!esNumero(v)) { errores.push(`${etiqueta}: escriba un número.`); continue; }
    if (clase === 'positivo' && v <= 0) errores.push(`${etiqueta}: debe ser mayor que 0.`);
    if (['monto', 'unidades', 'multiplo'].includes(clase) && v < 0) errores.push(`${etiqueta}: no puede ser negativo.`);
    if (clase === 'fraccion' && (v < 0 || v > 1)) errores.push(`${etiqueta}: debe estar entre 0 y 100 %.`);
    if (clase === 'tasa' && (v < 0 || v >= 1)) errores.push(`${etiqueta}: debe estar entre 0 y 99.99 %.`);
  }
  const listas = [['ventasUnidades', 'Unidades a vender'], ['otrosDesembolsos', 'Otros desembolsos']];
  for (const [clave, etiqueta] of listas) {
    const lista = s[clave];
    if (!Array.isArray(lista) || lista.length !== s.periodos || !lista.every(v => esNumero(v) && v >= 0)) {
      errores.push(`${etiqueta}: indique un número mayor o igual a 0 en cada periodo.`);
    }
  }
  return errores;
}

// Todos los presupuestos. Supone supuestos válidos (validarSupuestos vacío).
export function calcularPresupuestoMaestro(s) {
  const n = s.periodos;
  const etiquetas = Array.from({ length: n }, (_, i) => `${s.tipoPeriodo} ${i + 1}`);
  const avisos = [];
  const cada = f => Array.from({ length: n }, (_, i) => f(i));

  // 1. Ventas y cobros: lo vendido a crédito se cobra el periodo siguiente (D-014).
  const unidades = s.ventasUnidades;
  const importe = cada(i => unidades[i] * s.precio);
  const contado = cada(i => importe[i] * s.pctContado);
  const credito = cada(i => importe[i] - contado[i]);
  const cobroAnterior = cada(i => (i === 0 ? s.cxcInicial : credito[i - 1]));
  const cobros = cada(i => contado[i] + cobroAnterior[i]);

  // 2. Compras en unidades: ventas + inventario final deseado − inventario inicial.
  const invInicialU = [];
  const invFinalU = [];
  const deseadoU = [];
  const comprasU = [];
  for (let i = 0; i < n; i++) {
    invInicialU[i] = i === 0 ? s.inventarioInicial : invFinalU[i - 1];
    deseadoU[i] = i < n - 1 ? s.pctInventarioFinal * unidades[i + 1] : s.inventarioFinalUltimo;
    const compras = comprasPresupuestadas(unidades[i], deseadoU[i], invInicialU[i]);
    if (compras < 0) {
      // El inventario inicial ya cubre las ventas y el inventario deseado: no se compra y sobra existencia.
      comprasU[i] = 0;
      invFinalU[i] = invInicialU[i] - unidades[i];
      avisos.push({ codigo: 'sin-compras', periodo: etiquetas[i], sobrante: invFinalU[i] - deseadoU[i] });
    } else {
      comprasU[i] = compras;
      invFinalU[i] = deseadoU[i];
    }
    if (esNumero(s.stockMinimo) && invFinalU[i] < s.stockMinimo) {
      avisos.push({ codigo: 'bajo-stock-minimo', periodo: etiquetas[i], inventario: invFinalU[i], stockMinimo: s.stockMinimo });
    }
  }
  const comprasImporte = cada(i => comprasU[i] * s.costoUnitario);
  const pagoContado = cada(i => comprasImporte[i] * s.pctComprasContado);
  const pagoCredito = cada(i => comprasImporte[i] - pagoContado[i]);
  const pagoAnterior = cada(i => (i === 0 ? s.cxpInicial : pagoCredito[i - 1]));
  const pagosProveedores = cada(i => pagoContado[i] + pagoAnterior[i]);

  // 3. Costo de bienes vendidos = inventario inicial + compras − inventario final (C$).
  const invInicialC = cada(i => invInicialU[i] * s.costoUnitario);
  const invFinalC = cada(i => invFinalU[i] * s.costoUnitario);
  const disponible = cada(i => invInicialC[i] + comprasImporte[i]);
  const cbv = cada(i => costoBienesVendidos(invInicialC[i], comprasImporte[i], invFinalC[i]));

  // 4. Gastos de operación: la depreciación es gasto pero no sale de la caja.
  const gastosVariables = cada(i => importe[i] * s.pctGastosVariables);
  const gastosTotal = cada(i => gastosVariables[i] + s.gastosFijos + s.depreciacion);
  const gastosPagados = cada(i => gastosVariables[i] + s.gastosFijos);

  // 5. Estado de resultados presupuestado. IR solo sobre UAI positiva, sin pagarse en el horizonte (D-014).
  const utilidadBruta = cada(i => importe[i] - cbv[i]);
  const uaii = cada(i => utilidadBruta[i] - gastosTotal[i]);
  const uai = cada(i => uaii[i] - s.intereses);
  const ir = cada(i => (uai[i] > 0 ? uai[i] * s.tasaIR : 0));
  const utilidadNeta = cada(i => uai[i] - ir[i]);

  // 6. Caja: el financiamiento requerido se informa sin sumarse a la caja (Gitman, D-010).
  const saldoInicial = [];
  const saldoFinal = [];
  const desembolsos = cada(i => pagosProveedores[i] + gastosPagados[i] + s.intereses + s.otrosDesembolsos[i]);
  const flujoNeto = cada(i => cobros[i] - desembolsos[i]);
  for (let i = 0; i < n; i++) {
    saldoInicial[i] = i === 0 ? s.saldoInicialCaja : saldoFinal[i - 1];
    saldoFinal[i] = saldoInicial[i] + flujoNeto[i];
  }
  const financiamiento = cada(i => financiamientoRequerido(saldoFinal[i], s.saldoMinimoCaja));
  const excedente = cada(i => Math.max(0, saldoFinal[i] - s.saldoMinimoCaja));
  financiamiento.forEach((monto, i) => {
    if (monto > 0) avisos.push({ codigo: 'financiamiento', periodo: etiquetas[i], monto, saldoFinal: saldoFinal[i] });
  });
  utilidadNeta.forEach((un, i) => {
    if (un < 0) avisos.push({ codigo: 'perdida', periodo: etiquetas[i], monto: un });
  });

  // 7. Punto de equilibrio de cada periodo con los mismos supuestos.
  const cvu = s.costoUnitario + s.precio * s.pctGastosVariables;
  const mcu = margenContribucionUnitario(s.precio, cvu);
  const costosFijos = s.gastosFijos + s.depreciacion;
  const peUnidades = puntoEquilibrioUnidades(costosFijos, mcu);
  const peVentas = puntoEquilibrioVentas(costosFijos, razonMargenContribucion(mcu, s.precio));
  const margen = cada(i => (peUnidades === null ? null : margenSeguridad(unidades[i], peUnidades)));
  unidades.forEach((u, i) => {
    if (peUnidades !== null && u < peUnidades) avisos.push({ codigo: 'bajo-equilibrio', periodo: etiquetas[i], unidades: u, peUnidades });
  });
  if (peUnidades === null) avisos.push({ codigo: 'sin-margen', mcu });

  const unidadesTotal = suma(unidades);
  const financiamientoMaximo = Math.max(...financiamiento);
  const totales = {
    unidades: unidadesTotal, ventas: suma(importe), contado: suma(contado), credito: suma(credito),
    cobros: suma(cobros), comprasUnidades: suma(comprasU), compras: suma(comprasImporte),
    pagosProveedores: suma(pagosProveedores), cbv: suma(cbv), gastosVariables: suma(gastosVariables),
    gastosFijos: s.gastosFijos * n, depreciacion: s.depreciacion * n, gastosOperacion: suma(gastosTotal),
    gastosPagados: suma(gastosPagados), utilidadBruta: suma(utilidadBruta), uaii: suma(uaii),
    intereses: s.intereses * n, uai: suma(uai), ir: suma(ir), utilidadNeta: suma(utilidadNeta),
    otrosDesembolsos: suma(s.otrosDesembolsos), desembolsos: suma(desembolsos), flujoNeto: suma(flujoNeto),
    peUnidades: peUnidades === null ? null : peUnidades * n,
    margenSeguridad: peUnidades === null ? null : margenSeguridad(unidadesTotal, peUnidades * n)
  };

  return {
    supuestos: s, etiquetas, n,
    ventas: { unidades, precio: s.precio, importe, contado, credito, cobroAnterior, cobros },
    compras: {
      unidadesVenta: unidades, inventarioFinal: deseadoU, necesidad: cada(i => unidades[i] + deseadoU[i]),
      inventarioInicial: invInicialU, inventarioFinalReal: invFinalU, unidades: comprasU,
      costoUnitario: s.costoUnitario, importe: comprasImporte, pagoContado, pagoAnterior, pagos: pagosProveedores
    },
    cbv: { inventarioInicial: invInicialC, compras: comprasImporte, disponible, inventarioFinal: invFinalC, costo: cbv },
    gastos: { variables: gastosVariables, fijos: s.gastosFijos, depreciacion: s.depreciacion, total: gastosTotal, pagados: gastosPagados },
    caja: {
      saldoInicial, cobros, pagosProveedores, gastosPagados, intereses: s.intereses, otros: s.otrosDesembolsos,
      desembolsos, flujoNeto, saldoFinal, saldoMinimo: s.saldoMinimoCaja, financiamiento, excedente
    },
    resultados: { ventas: importe, cbv, utilidadBruta, gastosOperacion: gastosTotal, uaii, intereses: s.intereses, uai, ir, utilidadNeta },
    equilibrio: { cvu, mcu, costosFijos, peUnidades, peVentas, margenSeguridad: margen },
    cierre: {
      efectivo: saldoFinal[n - 1], cxc: credito[n - 1], cxp: pagoCredito[n - 1],
      inventarioUnidades: invFinalU[n - 1], inventarioValor: invFinalC[n - 1],
      // IR del horizonte: se causa pero no se paga dentro de él.
      irPorPagar: totales.ir
    },
    totales,
    financiamientoMaximo,
    periodoFinanciamiento: financiamientoMaximo > 0 ? etiquetas[financiamiento.indexOf(financiamientoMaximo)] : null,
    avisos
  };
}

// Ejemplo ficticio: MUNO MODA 2025 por trimestres (caso del paso 01). La UAII del primer
// trimestre (28,000) coincide con la del ejemplo de punto de equilibrio.
export function ejemploPlaneacion() {
  return {
    tipoPeriodo: 'Trimestre', periodos: 4, precio: 800, costoUnitario: 480,
    ventasUnidades: [250, 300, 300, 400], pctContado: 0.6, cxcInicial: 135000,
    pctComprasContado: 0.5, cxpInicial: 92000,
    inventarioInicial: 50, pctInventarioFinal: 0.2, inventarioFinalUltimo: 56,
    pctGastosVariables: 0.05, gastosFijos: 37500, depreciacion: 4500, intereses: 3000,
    otrosDesembolsos: [0, 120000, 0, 0], tasaIR: 0.3, saldoInicialCaja: 52000, saldoMinimoCaja: 40000,
    productoInventario: '', stockMinimo: null
  };
}
