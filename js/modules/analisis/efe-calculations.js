// Estado de Flujo de Efectivo (EFE) por método indirecto: lógica pura, sin DOM
// ni store. Deriva las tres actividades desde dos balances y comprueba que la
// suma de los flujos iguale la variación de efectivo entre los dos periodos.
//
// Operación: utilidad neta + depreciación/amortización del periodo + ajustes de
// capital de trabajo (Inventario, CxC, otros activos corrientes, CxP y
// provisiones). Inversión: variación de los activos fijos brutos.
// Financiamiento: variación de la deuda (largo y corto plazo), aportaciones de
// patrimonio y dividendos. Los gastos por intereses e impuestos quedan dentro
// de la utilidad neta, como en el método indirecto clásico.

import { formatCurrency } from '../../utils/format.js';
import { computeFinancialTotals, resolveAccountType } from '../estados/estados-calculations.js';
import {
  variacionesDeCuentas, advertenciasDeBalance, toleranciaComprobacion
} from './comprobacion-calculations.js';

// Cuentas de patrimonio que acumulan resultados: su variación permite separar
// los dividendos de las aportaciones de capital. Es una inferencia local por
// nombre: ACCOUNT_TYPES no tiene subtipos de patrimonio, porque partirlo
// cambiaría el patrimonio que consumen las razones. Incluye las cuentas del
// resultado del ejercicio (utilidad del ejercicio o del periodo): si se
// dejaran fuera, su cambio se leería como aportación de capital y los
// dividendos saldrían distorsionados por la utilidad del año anterior.
const RE_RESULTADOS = /\b(utilidad(es)? (acumuladas?|retenidas?|del (ejercicio|periodo))|resultados? (acumulados?|del (ejercicio|periodo)|de ejercicios anteriores)|ganancias? (acumuladas?|retenidas?)|perdidas? acumuladas?)\b/;

function normalizarNombre(nombre) {
  return String(nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function esResultadoAcumulado(nombre) {
  return RE_RESULTADOS.test(normalizarNombre(nombre));
}

// Opuesto de un monto sin producir -0: un cambio de 0 se mostraría "C$ -0.00".
// `null` (N/D) se conserva.
function opuesto(monto) {
  return monto == null ? null : 0 - monto;
}

// Δ de un tipo dentro de un grupo. Si la empresa no tiene cuentas de ese tipo
// la variación es 0; si le falta el saldo de alguna, es null (dato faltante).
function deltaTipo(filas, tipo) {
  const relevantes = filas.filter(fila => fila.tipo === tipo);
  if (relevantes.length === 0) return { delta: 0, presente: false, completo: true, filas: [] };
  const completo = relevantes.every(fila => fila.saldoInicial !== null && fila.saldoFinal !== null);
  const delta = completo
    ? relevantes.reduce((suma, fila) => suma + fila.variacion, 0)
    : null;
  return { delta, presente: true, completo, filas: relevantes };
}

// Δ de depreciación acumulada medida en magnitud (|final| − |inicial|): un
// crecimiento es el gasto no efectivo del periodo; una baja puede ser un retiro.
function deltaDepreciacion(filas) {
  const relevantes = filas.filter(fila => fila.tipo === 'depreciacionAcumulada');
  if (relevantes.length === 0) return { delta: 0, presente: false, completo: true, filas: [] };
  const completo = relevantes.every(fila => fila.saldoInicial !== null && fila.saldoFinal !== null);
  const delta = completo
    ? relevantes.reduce((suma, fila) => suma + (Math.abs(fila.saldoFinal) - Math.abs(fila.saldoInicial)), 0)
    : null;
  return { delta, presente: true, completo, filas: relevantes };
}

function item(concepto, monto, falta = null) {
  return { concepto, monto, falta };
}

function totalDe(items) {
  return items.every(fila => typeof fila.monto === 'number' && Number.isFinite(fila.monto))
    ? items.reduce((suma, fila) => suma + fila.monto, 0)
    : null;
}

// Estado completo: las tres actividades, la comprobación contra la variación de
// efectivo, motivos (datos faltantes), advertencias e interpretación.
export function construirEFE(datos, periodoInicial, periodoFinal) {
  const periodos = { inicial: periodoInicial, final: periodoFinal };
  const motivos = [];
  const advertencias = [];
  const sinDatos = incompleto => ({
    periodos, incompleto, utilidadNeta: null,
    operacion: null, inversion: null, financiamiento: null,
    totalFlujos: null, efectivoInicial: null, efectivoFinal: null,
    variacionEfectivo: null, diferencia: null, tolerancia: toleranciaComprobacion(),
    estado: 'incompleta', motivos, advertencias, interpretacion: ''
  });

  const bgInicial = datos?.balanceGeneral?.[periodoInicial];
  const bgFinal = datos?.balanceGeneral?.[periodoFinal];
  if (!bgInicial || !bgFinal) {
    const faltante = !bgInicial ? periodoInicial : periodoFinal;
    return sinDatos(`No hay balance general del periodo ${faltante}. Capture o importe los estados de ambos periodos en Estados Financieros.`);
  }

  const activos = variacionesDeCuentas(datos, 'activos', periodoInicial, periodoFinal);
  const pasivos = variacionesDeCuentas(datos, 'pasivos', periodoInicial, periodoFinal);
  const patrimonio = variacionesDeCuentas(datos, 'patrimonio', periodoInicial, periodoFinal);
  // Si el balance no cierra, la comprobación lo va a reflejar: se avisa de dónde viene.
  advertencias.push(...advertenciasDeBalance(periodos, bgInicial, bgFinal));

  for (const fila of [...activos, ...pasivos, ...patrimonio]) {
    if (fila.saldoInicial === null || fila.saldoFinal === null) {
      const faltante = fila.saldoInicial === null ? periodoInicial : periodoFinal;
      motivos.push(`La cuenta «${fila.cuenta}» no tiene saldo en el periodo ${faltante}; su variación no entra en el EFE.`);
    } else if (!fila.tipo) {
      motivos.push(`La cuenta «${fila.cuenta}» no tiene clasificación; añada un tipo de cuenta en Estados Financieros para incluirla en el EFE.`);
    }
  }

  // Efectivo: es la cifra con la que se comprueba el estado.
  const efectivo = deltaTipo(activos, 'efectivo');
  for (const [bg, periodo] of [[bgInicial, periodoInicial], [bgFinal, periodoFinal]]) {
    const hayEfectivo = Object.keys(bg.activos || {}).some(
      nombre => resolveAccountType(datos, 'activos', nombre) === 'efectivo'
    );
    if (!hayEfectivo) {
      motivos.push(`El periodo ${periodo} no tiene cuentas de efectivo: la comprobación necesita el saldo de efectivo.`);
    }
  }
  const efectivoInicial = efectivo.completo && efectivo.presente
    ? efectivo.filas.reduce((suma, fila) => suma + fila.saldoInicial, 0) : null;
  const efectivoFinal = efectivo.completo && efectivo.presente
    ? efectivo.filas.reduce((suma, fila) => suma + fila.saldoFinal, 0) : null;

  // Utilidad neta del periodo final. computeFinancialTotals lanza si algún
  // importe del balance o del estado de resultados no es un número: en ese caso
  // el estado queda incompleto en lugar de dejar la pantalla de Análisis vacía.
  const erFinal = datos?.estadoResultados && Object.hasOwn(datos.estadoResultados, periodoFinal)
    ? datos.estadoResultados[periodoFinal] : null;
  let utilidadNeta = null;
  if (!erFinal) {
    motivos.push(`No hay estado de resultados del periodo ${periodoFinal}: sin utilidad neta no se puede armar la operación.`);
  } else {
    try {
      utilidadNeta = computeFinancialTotals(datos, periodoFinal).utilidadNeta;
      if (utilidadNeta === null) {
        motivos.push('La utilidad neta no se puede determinar: el estado de resultados tiene cuentas sin clasificar.');
      } else if (Object.keys(erFinal).length === 0) {
        advertencias.push(`El estado de resultados del periodo ${periodoFinal} no tiene cuentas: la utilidad neta se toma como 0 y la operación parte de ahí.`);
      }
    } catch (error) {
      motivos.push(`No se pudo calcular la utilidad neta del periodo ${periodoFinal} (${error.message}). Corrija el importe en Estados Financieros.`);
    }
  }

  // --- Operación ---
  const inventario = deltaTipo(activos, 'inventario');
  const cxC = deltaTipo(activos, 'cxC');
  const acOtros = deltaTipo(activos, 'activosCorrientesOtros');
  const cxP = deltaTipo(pasivos, 'cuentasPorPagar');
  const provisiones = deltaTipo(pasivos, 'provisiones');
  const depreciacion = deltaDepreciacion(activos);
  if (depreciacion.presente && depreciacion.completo && depreciacion.delta < 0) {
    for (const fila of depreciacion.filas) {
      if (Math.abs(fila.saldoFinal) < Math.abs(fila.saldoInicial)) {
        advertencias.push(`La depreciación acumulada de «${fila.cuenta}» disminuyó: puede corresponder a una baja de activos. El modelo no distingue el gasto del periodo y el resultado puede incluirlo.`);
      }
    }
  }
  if (depreciacion.presente) {
    const signoPositivo = depreciacion.filas.some(fila =>
      (typeof fila.saldoInicial === 'number' && fila.saldoInicial > 0)
      || (typeof fila.saldoFinal === 'number' && fila.saldoFinal > 0));
    if (signoPositivo) {
      advertencias.push('La depreciación acumulada está guardada con signo positivo: con ese signo el balance no refleja la depreciación y la comprobación del EFE puede no cuadrar. Corrija el signo de la cuenta en Estados Financieros.');
    }
    advertencias.push('La depreciación y amortización del periodo se estima con la variación del saldo de la depreciación acumulada: el modelo no guarda el gasto por separado.');
  }

  const operacionItems = [
    item('Utilidad Neta', utilidadNeta, utilidadNeta == null ? 'sin-utilidad-neta' : null),
    item('(+) Depreciación y amortización del periodo', depreciacion.delta,
      depreciacion.presente && !depreciacion.completo ? 'falta-saldo' : null),
    item('(-) Aumento de Inventario (o + si disminuye)', opuesto(inventario.delta),
      inventario.presente && !inventario.completo ? 'falta-saldo' : null),
    item('(-) Aumento de Cuentas por Cobrar (o + si disminuye)', opuesto(cxC.delta),
      cxC.presente && !cxC.completo ? 'falta-saldo' : null),
    item('(-) Aumento de otros activos corrientes (o + si disminuye)', opuesto(acOtros.delta),
      acOtros.presente && !acOtros.completo ? 'falta-saldo' : null),
    item('(+) Aumento de Cuentas por Pagar (o - si disminuye)', cxP.delta,
      cxP.presente && !cxP.completo ? 'falta-saldo' : null),
    item('(+) Aumento de Provisiones (o - si disminuye)', provisiones.delta,
      provisiones.presente && !provisiones.completo ? 'falta-saldo' : null)
  ];
  const CFO = totalDe(operacionItems);
  const operacion = { items: operacionItems, total: CFO };

  // --- Inversión ---
  const activosFijos = deltaTipo(activos, 'activosFijos');
  const inversionItems = [
    item('(+) Venta o baja de activos fijos (o - si compra)', opuesto(activosFijos.delta),
      activosFijos.presente && !activosFijos.completo ? 'falta-saldo' : null)
  ];
  const CFI = totalDe(inversionItems);
  const inversion = { items: inversionItems, total: CFI };

  // --- Financiamiento ---
  const pasivoLargo = deltaTipo(pasivos, 'pasivoLargoPlazo');
  const pasivoCorto = deltaTipo(pasivos, 'pasivoCortoPlazo');
  const patrimonioTotal = patrimonio.reduce(
    (suma, fila) => (fila.saldoInicial !== null && fila.saldoFinal !== null ? suma + fila.variacion : NaN), 0
  );
  const patrimonioCompleto = Number.isFinite(patrimonioTotal);
  const reAcumuladas = patrimonio.filter(fila => esResultadoAcumulado(fila.cuenta));
  const tieneResultadosAcumulados = reAcumuladas.length > 0;
  const deltaRE = reAcumuladas.reduce(
    (suma, fila) => (fila.saldoInicial !== null && fila.saldoFinal !== null ? suma + fila.variacion : NaN), 0
  );

  const financiamientoItems = [
    item('(+) Aumento de pasivo a largo plazo (o - si disminuye)', pasivoLargo.delta,
      pasivoLargo.presente && !pasivoLargo.completo ? 'falta-saldo' : null),
    item('(+) Aumento de pasivo a corto plazo financiero (o - si disminuye)', pasivoCorto.delta,
      pasivoCorto.presente && !pasivoCorto.completo ? 'falta-saldo' : null)
  ];
  if (tieneResultadosAcumulados) {
    const aportaciones = patrimonioCompleto && Number.isFinite(deltaRE) ? patrimonioTotal - deltaRE : null;
    const dividendos = utilidadNeta != null && Number.isFinite(deltaRE) ? utilidadNeta - deltaRE : null;
    financiamientoItems.push(
      item('(+) Aportaciones de capital, reservas y otros patrimonios', aportaciones,
        aportaciones == null ? 'falta-saldo' : null),
      item('(-) Dividendos y distribuciones de utilidades', opuesto(dividendos),
        dividendos == null ? 'sin-dividendos' : null)
    );
    if (dividendos != null && dividendos < 0) {
      advertencias.push('La utilidad acumulada creció más que la utilidad neta: revise las transferencias entre cuentas de patrimonio, porque el renglón de dividendos queda negativo.');
    }
  } else {
    advertencias.push(`No se identificaron cuentas de utilidades acumuladas en el patrimonio (${periodoInicial} → ${periodoFinal}): los dividendos no se pueden separar y se descuenta la utilidad neta de la variación de patrimonio.`);
    financiamientoItems.push(
      item('(+) Variación total del patrimonio', patrimonioCompleto ? patrimonioTotal : null,
        patrimonioCompleto ? null : 'falta-saldo'),
      item('(-) Utilidad neta del periodo (ya incluida en Operación)', opuesto(utilidadNeta),
        utilidadNeta == null ? 'sin-utilidad-neta' : null)
    );
  }
  const CFF = totalDe(financiamientoItems);
  const financiamiento = { items: financiamientoItems, total: CFF };

  const totalFlujos = [CFO, CFI, CFF].every(v => typeof v === 'number' && Number.isFinite(v))
    ? CFO + CFI + CFF : null;
  const variacionEfectivo = efectivoInicial !== null && efectivoFinal !== null
    ? efectivoFinal - efectivoInicial : null;
  const diferencia = totalFlujos !== null && variacionEfectivo !== null
    ? totalFlujos - variacionEfectivo : null;
  const tolerancia = toleranciaComprobacion(totalFlujos, variacionEfectivo);
  // Sin diferencia (algún flujo o el efectivo es N/D) no hay nada que comprobar:
  // se informa como incompleta aunque ningún motivo puntual lo explique.
  if (diferencia === null && motivos.length === 0) {
    motivos.push('Faltan datos para calcular la diferencia entre los flujos y la variación de efectivo.');
  }
  const motivosUnicos = [...new Set(motivos)];
  const estado = motivosUnicos.length > 0
    ? 'incompleta'
    : (Math.abs(diferencia) <= tolerancia ? 'cuadra' : 'no-cuadra');

  const resultado = {
    periodos,
    utilidadNeta,
    operacion,
    inversion,
    financiamiento,
    totalFlujos,
    efectivoInicial,
    efectivoFinal,
    variacionEfectivo,
    diferencia,
    tolerancia,
    estado,
    motivos: motivosUnicos,
    advertencias,
    interpretacion: ''
  };
  resultado.interpretacion = interpretarEFE(resultado);
  return resultado;
}

// Qué dicen los signos de los tres flujos (sin umbrales: solo si la operación
// genera o consume efectivo, si alcanza para la inversión y de dónde viene o a
// dónde va el financiamiento). Solo se llama con los tres totales presentes.
function lecturaFlujos({ operacion, inversion, financiamiento }) {
  const cfo = operacion.total;
  const cfi = inversion.total;
  const cff = financiamiento.total;
  const frases = [cfo >= 0
    ? `la operación generó ${formatCurrency(cfo)} de efectivo`
    : `la operación consumió ${formatCurrency(Math.abs(cfo))} de efectivo`];
  if (cfo + cfi < 0) {
    frases.push(`no alcanzó a cubrir la inversión (faltaron ${formatCurrency(Math.abs(cfo + cfi))})`);
  } else if (cfi < 0) {
    frases.push('alcanzó para cubrir la inversión');
  }
  if (cff > 0) {
    frases.push(`el financiamiento aportó ${formatCurrency(cff)}`);
  } else if (cff < 0) {
    frases.push(`el financiamiento devolvió o distribuyó ${formatCurrency(Math.abs(cff))}`);
  }
  const texto = frases.join('; ');
  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}.`;
}

// Lectura breve del estado. Los motivos y advertencias pueden traer nombres de
// cuenta del archivo importado: el llamador debe escaparlos antes de HTML.
export function interpretarEFE(resultado) {
  const { estado, totalFlujos, variacionEfectivo, diferencia, operacion, inversion, financiamiento, motivos } = resultado;
  if (estado === 'incompleta') {
    return `El EFE está incompleto: ${motivos.join(' ')} Complete los datos en Estados Financieros y vuelva a comprobar el estado.`;
  }
  const fmt = valor => formatCurrency(valor);
  const partes = `Operación ${fmt(operacion.total)}, inversión ${fmt(inversion.total)} y financiamiento ${fmt(financiamiento.total)}`;
  const lectura = lecturaFlujos(resultado);
  if (estado === 'cuadra') {
    return `Los flujos suman ${fmt(totalFlujos)}, igual a la variación de efectivo entre ${resultado.periodos.inicial} y ${resultado.periodos.final}: el estado cuadra dentro de la tolerancia de ${fmt(resultado.tolerancia)}. (${partes}.) ${lectura}`;
  }
  return `Los flujos suman ${fmt(totalFlujos)} pero el efectivo varió ${fmt(variacionEfectivo)}: la diferencia es de ${fmt(Math.abs(diferencia))}. Revise las cuentas, las clasificaciones o los movimientos faltantes: el estado no ajusta cifras ni distribuye diferencias automáticamente. (${partes}.) ${lectura}`;
}
