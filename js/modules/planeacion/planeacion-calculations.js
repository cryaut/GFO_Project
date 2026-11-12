// Presupuesto maestro de una empresa comercial: ventas, compras, costo de bienes vendidos,
// gastos de operación, caja y estado de resultados presupuestado.
// Lógica pura: sin DOM, window ni store. Plan: docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
import {
  comprasPresupuestadas, costoBienesVendidos, financiamientoRequerido, margenContribucionUnitario,
  margenSeguridad, necesitaReposicion, puntoEquilibrioUnidades, puntoEquilibrioVentas, razonMargenContribucion,
  valorInventario
} from '../../utils/calculate.js';

export const TIPOS_PERIODO = ['Mes', 'Trimestre'];
export const MAX_PERIODOS = 12;
export const CALENDARIOS_CAPITAL_TRABAJO = [
  ['cobrosApertura', 'Cobro de cuentas por cobrar iniciales'],
  ['cobrosCredito', 'Cobro de ventas a crédito'],
  ['pagosApertura', 'Pago de cuentas por pagar iniciales'],
  ['pagosCredito', 'Pago de compras a crédito']
];
// Admite el redondeo de la captura en porcentajes. Al repartir se usa el total real.
const TOLERANCIA_CALENDARIO = 1e-7;

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
    // D-082: el stock mínimo ya no se guarda: se toma del producto vigente en Inventario.
    productoId: typeof datos.productoId === 'string' ? datos.productoId : ''
  };
  for (const [clave] of SUPUESTOS) s[clave] = esNumero(datos[clave]) ? datos[clave] : null;
  // D-113 (opcionales): unidad de medida y nota de procedencia del caso. Sin ellas, la forma no cambia.
  const textoOpcional = (valor, max) => (typeof valor === 'string' && valor.trim() && valor.trim().length <= max ? valor.trim() : '');
  const unidad = textoOpcional(datos.unidad, MAX_UNIDAD), nota = textoOpcional(datos.nota, MAX_NOTA);
  if (unidad) s.unidad = unidad;
  if (nota) s.nota = nota;
  // D-113 (opcionales, para el balance proforma): el periodo de Estados que sirve de apertura y
  // en qué se gastan los «otros desembolsos» del horizonte (montos totales ≥ 0).
  const periodoBase = textoOpcional(datos.periodoBase, 40);
  if (periodoBase) s.periodoBase = periodoBase;
  const desglose = datos.desgloseOtrosDesembolsos;
  if (desglose && typeof desglose === 'object' && CAMPOS_DESGLOSE.every(c => esNumero(desglose[c]) && desglose[c] >= 0)) {
    s.desgloseOtrosDesembolsos = Object.fromEntries(CAMPOS_DESGLOSE.map(c => [c, desglose[c]]));
  }
  return s;
}

// inversion: compras de activo no corriente; dividendos: pagados a los accionistas;
// impuestos: pago del IR por pagar de la apertura.
export const CAMPOS_DESGLOSE = ['inversion', 'dividendos', 'impuestos'];

export const MAX_UNIDAD = 60;
export const MAX_NOTA = 1200;

// En un borrador, null conserva un supuesto pendiente de revisión.
export function validarSupuestos(s, { parcial = false } = {}) {
  if (!s) return ['Configure los supuestos o cargue el ejemplo.'];
  const errores = [];
  if (!TIPOS_PERIODO.includes(s.tipoPeriodo)) errores.push('Elija meses o trimestres.');
  if (!Number.isInteger(s.periodos) || s.periodos < 1 || s.periodos > MAX_PERIODOS) {
    errores.push(`El número de periodos debe ser un entero entre 1 y ${MAX_PERIODOS}.`);
  }
  for (const [clave, etiqueta, clase] of SUPUESTOS) {
    const v = s[clave];
    if (parcial && v === null) continue;
    if (!esNumero(v)) { errores.push(`${etiqueta}: escriba un número.`); continue; }
    if (clase === 'positivo' && v <= 0) errores.push(`${etiqueta}: debe ser mayor que 0.`);
    if (['monto', 'unidades', 'multiplo'].includes(clase) && v < 0) errores.push(`${etiqueta}: no puede ser negativo.`);
    if (clase === 'fraccion' && (v < 0 || v > 1)) errores.push(`${etiqueta}: debe estar entre 0 y 100 %.`);
    if (clase === 'tasa' && (v < 0 || v >= 1)) errores.push(`${etiqueta}: debe estar entre 0 y 99.99 %.`);
  }
  const listas = [['ventasUnidades', 'Unidades a vender'], ['otrosDesembolsos', 'Otros desembolsos']];
  for (const [clave, etiqueta] of listas) {
    const lista = s[clave];
    if (!Array.isArray(lista) || lista.length !== s.periodos
        || !Array.from(lista).every(v => (parcial && v === null) || (esNumero(v) && v >= 0))) {
      errores.push(`${etiqueta}: indique un número mayor o igual a 0 en cada periodo.`);
    }
  }
  if (s.desgloseOtrosDesembolsos) {
    const valores = CAMPOS_DESGLOSE.map(c => s.desgloseOtrosDesembolsos[c]);
    if (!valores.every(v => esNumero(v) && v >= 0)) errores.push('El reparto para el balance requiere inversión, dividendos e impuestos no negativos.');
    else if (Array.isArray(s.otrosDesembolsos) && s.otrosDesembolsos.every(esNumero)) {
      const total = suma(s.otrosDesembolsos);
      if (Math.abs(suma(valores) - total) > Math.max(0.01, Math.abs(total) * 1e-11)) errores.push('El reparto para el balance debe sumar los otros desembolsos del horizonte.');
    }
  }
  return errores;
}

export function validarCapitalTrabajo(capital, supuestos) {
  if (!capital || typeof capital !== 'object' || Array.isArray(capital)) {
    return ['Los supuestos de capital de trabajo no son válidos.'];
  }
  const errores = [];
  const claves = ['costosCompra', ...CALENDARIOS_CAPITAL_TRABAJO.map(([clave]) => clave)];
  if (Object.keys(capital).some(clave => !claves.includes(clave))) {
    errores.push('Hay supuestos de capital de trabajo desconocidos.');
  }
  if (supuestos.tipoPeriodo !== 'Mes' || supuestos.costoUnitario !== null) {
    errores.push('Capital de trabajo requiere periodos mensuales y un costo de compra por mes.');
  }
  const { costosCompra } = capital;
  if (!Array.isArray(costosCompra) || costosCompra.length !== supuestos.periodos
      || !Array.from(costosCompra).every(v => v === null || (esNumero(v) && v >= 0))) {
    errores.push('Indique el costo de compra de cada mes, o déjelo pendiente.');
  }
  for (const [clave, etiqueta] of CALENDARIOS_CAPITAL_TRABAJO) {
    const calendario = capital[clave];
    if (calendario === null) continue;
    if (!Array.isArray(calendario) || calendario.length < 1 || calendario.length > MAX_PERIODOS
        || !Array.from(calendario).every(v => esNumero(v) && v >= 0 && v <= 1)
        || Math.abs(suma(calendario) - 1) > TOLERANCIA_CALENDARIO) {
      errores.push(`${etiqueta}: indique de 1 a ${MAX_PERIODOS} porcentajes entre 0 y 100 % que sumen 100 %.`);
    }
  }
  return errores;
}

const finito = valor => esNumero(valor) ? valor : null;

function importeDisponible(unidades, unitario) {
  if (unidades === 0 || unitario === 0) return 0;
  return esNumero(unidades) && esNumero(unitario) ? finito(unidades * unitario) : null;
}

function totalDisponible(valores) {
  return valores.every(esNumero) ? finito(suma(valores)) : null;
}

function presupuestarExistencias(s) {
  let inicial = s.inventarioInicial;
  return s.ventasUnidades.map((vendidas, i) => {
    const objetivo = i === s.periodos - 1
      ? s.inventarioFinalUltimo : importeDisponible(s.ventasUnidades[i + 1], s.pctInventarioFinal);
    const necesidad = finito(comprasPresupuestadas(vendidas, objetivo, inicial));
    const compras = necesidad === null ? null : Math.max(0, necesidad);
    const final = necesidad === null ? null : (necesidad < 0 ? inicial - vendidas : objetivo);
    const existencia = { inicial, objetivo, compras, final };
    inicial = final;
    return existencia;
  });
}

function valorarExistencias(existencias, compras, unidadesVendidas, valorInicial) {
  let inicial = finito(valorInicial);
  // Un importe positivo sin unidades no acredita el valor de apertura.
  if (existencias[0]?.inicial === 0) inicial = inicial > 0 ? null : 0;
  const meses = existencias.map((fila, i) => {
    const compra = compras[i];
    const unidades = totalDisponible([fila.inicial, fila.compras]);
    const disponible = totalDisponible([inicial, compra]);
    const promedio = unidades > 0 && disponible !== null ? disponible / unidades : null;
    const vendidas = unidadesVendidas[i];
    let final = finito(valorInventario(fila.final, promedio));
    if (vendidas === 0) final = disponible;
    if (fila.final === 0) final = 0;
    const costoVentas = vendidas === 0 ? 0 : finito(costoBienesVendidos(inicial, compra, final));
    const mes = { inicial, compras: compra, costoVentas, final };
    inicial = final;
    return mes;
  });
  return { meses, costoVentasTotal: totalDisponible(meses.map(mes => mes.costoVentas)) };
}

// El origen 0 es la apertura. Los créditos nuevos empiezan a vencer a partir del mes siguiente.
function proyectarCredito(importes, fraccionContado, saldoInicial, calendarioApertura, calendarioCredito, periodo) {
  const agenda = [];
  let faltaCalendario = false;
  function agendar(importe, origen, calendario) {
    if (importe === 0) return;
    if (calendario === null) {
      faltaCalendario = true;
      return;
    }
    const total = suma(calendario);
    calendario.forEach((fraccion, i) => {
      if (fraccion > 0) agenda.push({ origen, vence: origen + i + 1, importe: importeDisponible(importe, fraccion / total) });
    });
  }
  const describir = cuotas => cuotas.map(cuota => ({
    origen: periodo(cuota.origen), vence: periodo(cuota.vence), importe: cuota.importe
  }));

  agendar(saldoInicial, 0, calendarioApertura);
  let saldo = saldoInicial;
  const meses = importes.map((importe, i) => {
    const mes = i + 1;
    const contado = importeDisponible(importe, fraccionContado);
    const credito = fraccionContado === 1 || importe === 0 ? 0
      : importe === null || contado === null ? null : importe - contado;
    const cuotas = agenda.filter(cuota => cuota.vence === mes);
    const liquidado = faltaCalendario ? null : totalDisponible(cuotas.map(cuota => cuota.importe));
    const apertura = saldo;
    agendar(credito, mes, calendarioCredito);
    // El saldo agendado evita arrastrar redondeos. La conciliación permite conocer el
    // cierre del mes de origen aun cuando todavía falte distribuir ese crédito.
    const programado = faltaCalendario ? null
      : totalDisponible(agenda.filter(cuota => cuota.vence > mes).map(cuota => cuota.importe));
    saldo = programado ?? totalDisponible([apertura, credito, liquidado === null ? null : -liquidado]);
    return {
      importe, contado, credito, liquidado, total: totalDisponible([contado, liquidado]),
      apertura, cierre: saldo, vencimientos: liquidado === null ? null : describir(cuotas)
    };
  });
  const pendientes = agenda.filter(cuota => cuota.vence > importes.length).sort((a, b) => a.vence - b.vence);
  return {
    meses,
    totales: Object.fromEntries(['importe', 'contado', 'credito', 'liquidado', 'total'].map(clave =>
      [clave, totalDisponible(meses.map(mes => mes[clave]))])),
    pendientes: faltaCalendario || pendientes.some(cuota => cuota.importe === null) ? null : describir(pendientes)
  };
}

// Presupuesto parcial mensual. Recibe un escenario y su apertura validados.
export function calcularCapitalTrabajo(s, capital, fechaCorte, valorInventarioInicial = null) {
  const [anio, mes] = fechaCorte.split('-').map(Number);
  const periodo = desplazamiento => {
    const indice = anio * 12 + mes - 1 + desplazamiento;
    return `${String(Math.floor(indice / 12)).padStart(4, '0')}-${String(indice % 12 + 1).padStart(2, '0')}`;
  };
  const existencias = presupuestarExistencias(s);
  const ventas = s.ventasUnidades.map(unidades => importeDisponible(unidades, s.precio));
  const compras = existencias.map((fila, i) => importeDisponible(fila.compras, capital.costosCompra[i]));
  return {
    etiquetas: s.ventasUnidades.map((_, i) => periodo(i + 1)),
    unidadesVendidas: s.ventasUnidades,
    existencias,
    costosCompra: capital.costosCompra,
    valoracion: valorarExistencias(existencias, compras, s.ventasUnidades, valorInventarioInicial),
    ventas: proyectarCredito(ventas, s.pctContado, s.cxcInicial, capital.cobrosApertura, capital.cobrosCredito, periodo),
    compras: proyectarCredito(compras, s.pctComprasContado, s.cxpInicial, capital.pagosApertura, capital.pagosCredito, periodo)
  };
}

// Todos los presupuestos. Supone supuestos válidos (validarSupuestos vacío).
// D-082: `inventario` es el resultado de calcularInventario; el stock mínimo
// vigente sale del producto elegido (supuestos.productoId), no de una copia.
export function calcularPresupuestoMaestro(s, inventario = null) {
  const n = s.periodos;
  const etiquetas = Array.from({ length: n }, (_, i) => `${s.tipoPeriodo} ${i + 1}`);
  const avisos = [];
  const cada = f => Array.from({ length: n }, (_, i) => f(i));
  const productoElegido = s.productoId && inventario?.productos
    ? inventario.productos.find(p => p.id === s.productoId) : null;
  const stockMinimo = productoElegido ? productoElegido.stockMinimo : null;
  // D-085: supuestos de una versión anterior con el nombre del producto pero sin
  // productoId — el presupuesto no adivina el producto por nombre; pide re vincularlo.
  if (s.productoInventario && !s.productoId) {
    avisos.push({ codigo: 'sin-producto-vinculado' });
  }

  // 1. Ventas y cobros: lo vendido a crédito se cobra el periodo siguiente (D-014).
  const unidades = s.ventasUnidades;
  const importe = cada(i => unidades[i] * s.precio);
  const contado = cada(i => importe[i] * s.pctContado);
  const credito = cada(i => importe[i] - contado[i]);
  const cobroAnterior = cada(i => (i === 0 ? s.cxcInicial : credito[i - 1]));
  const cobros = cada(i => contado[i] + cobroAnterior[i]);

  // 2. Compras en unidades: ventas + inventario final deseado − inventario inicial.
  const existencias = presupuestarExistencias(s);
  const invInicialU = existencias.map(fila => fila.inicial);
  const invFinalU = existencias.map(fila => fila.final);
  const deseadoU = existencias.map(fila => fila.objetivo);
  const comprasU = existencias.map(fila => fila.compras);
  existencias.forEach(({ final, objetivo }, i) => {
    if (esNumero(final) && esNumero(objetivo) && final > objetivo) {
      avisos.push({ codigo: 'sin-compras', periodo: etiquetas[i], sobrante: final - objetivo });
    }
    if (stockMinimo !== null && necesitaReposicion(invFinalU[i], stockMinimo)) {
      avisos.push({ codigo: 'bajo-stock-minimo', periodo: etiquetas[i], inventario: invFinalU[i], stockMinimo });
    }
  });
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
    productoInventario: '', productoId: ''
  };
}
