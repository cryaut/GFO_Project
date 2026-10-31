// Estado de Flujo de Efectivo (EFE) por método indirecto: lógica pura, sin DOM
// ni store. Deriva las tres actividades desde dos balances y comprueba que la
// suma de los flujos iguale la variación de efectivo entre los dos periodos.
//
// D-066: la pertenencia a cada actividad se decide por el rol del id del
// catálogo (efe-roles.js), no por el tipo general. Operación: utilidad neta +
// depreciación/amortización del periodo + variación de los activos y pasivos de
// operación. Inversión: variación de los activos de inversión. Financiamiento:
// variación de la deuda, aportaciones de patrimonio y dividendos. Los gastos
// por intereses e impuestos quedan dentro de la utilidad neta, como en el
// método indirecto clásico.

import { formatCurrency } from '../../utils/format.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { obtenerCuenta } from '../estados/cuentas-identificador.js';
import { rolEFE, COMPONENTES_TOTALES } from './efe-roles.js';
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
const RE_RESULTADOS = /\b(utilidad(es)? (acumuladas?|retenidas?|del (ejercicio|periodo))|resultados? (acumulados?|del (ejercicio|periodo)|de ejercicios anteriores)|ganancias? (acumuladas?|retenidas?)|perdidas? (acumuladas?|del (ejercicio|periodo)))\b/;

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

// Δ de todas las filas de un rol del EFE. Si la empresa no tiene cuentas de ese
// rol la variación es 0; si le falta el saldo de alguna, es null (dato
// faltante). `excluirId` saca una cuenta del lote (la depreciación acumulada va
// en su propio renglón).
function deltaRol(filas, rol, excluirId = null) {
  const relevantes = filas.filter(fila => rolEFE(fila.id) === rol && fila.id !== excluirId);
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
  const relevantes = filas.filter(fila => fila.id === 'bs.accumulated_depreciation');
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

// D-067: un total reportado no entra en el EFE cuando alguna de sus componentes
// del catálogo está en los datos — la variación la explican ellas y el total
// duplicaría. Sin componentes, el total es el único dato de ese concepto y se
// conserva (por ejemplo un «Inventario» sin desglose).
function sinTotalesDuplicados(filas) {
  const idsPresentes = new Set(filas.map(fila => fila.id).filter(Boolean));
  return filas.filter(fila => {
    if (obtenerCuenta(fila.id)?.rol !== 'reported_total') return true;
    const componentes = COMPONENTES_TOTALES[fila.id] || [];
    return !componentes.some(id => idsPresentes.has(id));
  });
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
    conciliacionUtilidad: null,
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
  const patrimonio = sinTotalesDuplicados(
    variacionesDeCuentas(datos, 'patrimonio', periodoInicial, periodoFinal)
  );
  // D-067: los totales reportados con componentes en los datos no entran.
  const activosEFE = sinTotalesDuplicados(activos);
  const pasivosEFE = sinTotalesDuplicados(pasivos);
  // Si el balance no cierra, la comprobación lo va a reflejar: se avisa de dónde viene.
  advertencias.push(...advertenciasDeBalance(periodos, bgInicial, bgFinal));

  for (const fila of [...activosEFE, ...pasivosEFE, ...patrimonio]) {
    if (fila.saldoInicial === null || fila.saldoFinal === null) {
      const faltante = fila.saldoInicial === null ? periodoInicial : periodoFinal;
      motivos.push(`La cuenta «${fila.cuenta}» no tiene saldo en el periodo ${faltante}; su variación no entra en el EFE.`);
    } else if (!(fila.saldoInicial === 0 && fila.saldoFinal === 0)
      && (fila.grupo === 'patrimonio' ? !fila.tipo : !rolEFE(fila.id))) {
      motivos.push(`La cuenta «${fila.cuenta}» no tiene clasificación; añada un tipo de cuenta en Estados Financieros para incluirla en el EFE.`);
    }
  }

  // Efectivo: es la cifra con la que se comprueba el estado.
  const efectivo = deltaRol(activosEFE, 'efectivo');
  const nombresEfectivo = new Set(efectivo.filas.map(fila => fila.cuenta));
  for (const [bg, periodo] of [[bgInicial, periodoInicial], [bgFinal, periodoFinal]]) {
    const hayEfectivo = Object.keys(bg.activos || {}).some(nombre => nombresEfectivo.has(nombre));
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

  // D-069: la utilidad del estado de resultados se concilia contra la cuenta de
  // resultado del periodo en el patrimonio. Si difiere (tolerancia de la
  // comprobación), el estado no cuadra con motivo `utilidad_no_conciliada`. Sin
  // esa cuenta la utilidad no se puede verificar: tercer estado de la
  // comprobación, con advertencia visible.
  const filaResultadoPatrimonio = patrimonio.find(fila => fila.id === 'bs.current_year_result_equity');
  let conciliacionUtilidad = null;
  if (filaResultadoPatrimonio && utilidadNeta != null && filaResultadoPatrimonio.saldoFinal != null) {
    const diferenciaConciliacion = utilidadNeta - filaResultadoPatrimonio.saldoFinal;
    const conciliada = Math.abs(diferenciaConciliacion)
      <= toleranciaComprobacion(utilidadNeta, filaResultadoPatrimonio.saldoFinal);
    conciliacionUtilidad = {
      cuenta: filaResultadoPatrimonio.cuenta,
      utilidadNeta,
      resultadoPatrimonio: filaResultadoPatrimonio.saldoFinal,
      diferencia: diferenciaConciliacion,
      conciliada,
      motivo: conciliada ? null : 'utilidad_no_conciliada'
    };
    if (!conciliada) {
      advertencias.push(`La utilidad neta del estado de resultados (${formatCurrency(utilidadNeta)}) no coincide con el resultado del periodo del balance (${formatCurrency(filaResultadoPatrimonio.saldoFinal)}): diferencia de ${formatCurrency(Math.abs(diferenciaConciliacion))}. Revise la utilidad, los dividendos declarados o el resultado cargado en el patrimonio.`);
    }
  }

  // --- Operación ---
  // D-066: los activos de operación van netos de su propia línea de depreciación,
  // que se suma como no efectivo; los pasivos de operación suman directo.
  const activosOperacion = deltaRol(activosEFE, 'operacion', 'bs.accumulated_depreciation');
  const pasivosOperacion = deltaRol(pasivosEFE, 'operacion');
  const depreciacion = deltaDepreciacion(activosEFE);
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
    item('(-) Aumento de activos de operación (o + si disminuye)', opuesto(activosOperacion.delta),
      activosOperacion.presente && !activosOperacion.completo ? 'falta-saldo' : null),
    item('(+) Aumento de pasivos de operación (o - si disminuye)', pasivosOperacion.delta,
      pasivosOperacion.presente && !pasivosOperacion.completo ? 'falta-saldo' : null)
  ];
  const CFO = totalDe(operacionItems);
  const operacion = { items: operacionItems, total: CFO };

  // --- Inversión ---
  const activosInversion = deltaRol(activosEFE, 'inversion');
  const inversionItems = [
    item('(+) Venta o baja de activos de inversión (o - si compra)', opuesto(activosInversion.delta),
      activosInversion.presente && !activosInversion.completo ? 'falta-saldo' : null)
  ];
  const CFI = totalDe(inversionItems);
  const inversion = { items: inversionItems, total: CFI };

  // --- Financiamiento ---
  const deuda = deltaRol(pasivosEFE, 'financiamiento');
  const patrimonioTotal = patrimonio.reduce(
    (suma, fila) => (fila.saldoInicial !== null && fila.saldoFinal !== null ? suma + fila.variacion : NaN), 0
  );
  const patrimonioCompleto = Number.isFinite(patrimonioTotal);
  // D-068: las reservas son destino de utilidades, no aportaciones de capital:
  // se mueven junto con las utilidades acumuladas y las cuentas del resultado
  // del periodo. Misma regla de nombres del aviso de sentidos opuestos
  // (/\breservas?\b/ sobre el nombre normalizado).
  const esReserva = nombre => /\breservas?\b/.test(normalizarNombre(nombre));
  const reAcumuladas = patrimonio.filter(fila => esResultadoAcumulado(fila.cuenta));
  const reservas = patrimonio.filter(fila => esReserva(fila.cuenta));
  const destinoUtilidades = patrimonio.filter(fila => esResultadoAcumulado(fila.cuenta) || esReserva(fila.cuenta));
  const tieneDestinoUtilidades = destinoUtilidades.length > 0;
  const deltaDestino = destinoUtilidades.reduce(
    (suma, fila) => (fila.saldoInicial !== null && fila.saldoFinal !== null ? suma + fila.variacion : NaN), 0
  );
  if (reAcumuladas.some(resultado => reservas.some(reserva =>
    resultado.variacion !== null && reserva.variacion !== null && resultado.variacion * reserva.variacion < 0))) {
    advertencias.push('Las reservas y los resultados acumulados cambiaron en sentidos opuestos: puede haber transferencias internas que distorsionen la separación de aportaciones y dividendos derivados. Revise el estado de cambios en el patrimonio.');
  }

  const financiamientoItems = [
    item('(+) Aumento de deuda (o - si se paga)', deuda.delta,
      deuda.presente && !deuda.completo ? 'falta-saldo' : null)
  ];
  if (tieneDestinoUtilidades) {
    const aportaciones = patrimonioCompleto && Number.isFinite(deltaDestino) ? patrimonioTotal - deltaDestino : null;
    const dividendos = utilidadNeta != null && Number.isFinite(deltaDestino) ? utilidadNeta - deltaDestino : null;
    financiamientoItems.push(
      item('(+) Aportaciones de capital y otros patrimonios', aportaciones,
        aportaciones == null ? 'falta-saldo' : null),
      item('(-) Dividendos y distribuciones de utilidades (derivados de las utilidades acumuladas)', opuesto(dividendos),
        dividendos == null ? 'sin-dividendos' : null)
    );
    if (dividendos != null && dividendos < 0) {
      advertencias.push('La utilidad acumulada creció más que la utilidad neta: revise las transferencias entre cuentas de patrimonio, porque el renglón de dividendos queda negativo.');
    }
  } else {
    advertencias.push(`No se identificaron cuentas de utilidades acumuladas ni reservas en el patrimonio (${periodoInicial} → ${periodoFinal}): los dividendos no se pueden separar y se descuenta la utilidad neta de la variación de patrimonio.`);
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
  const conciliacionFallida = conciliacionUtilidad != null && conciliacionUtilidad.motivo === 'utilidad_no_conciliada';
  // D-069: la conciliación de la utilidad manda. Con los flujos cuadrados hay
  // dos salidas: «cuadra» cuando la utilidad concilia contra el balance, y el
  // tercer estado «cuadra-sin-verificar» cuando no existe la cuenta de
  // resultado del periodo que permita verificarla.
  const estado = motivosUnicos.length > 0
    ? 'incompleta'
    : conciliacionFallida
      ? 'no-cuadra'
      : Math.abs(diferencia) <= tolerancia
        ? (conciliacionUtilidad != null ? 'cuadra' : 'cuadra-sin-verificar')
        : 'no-cuadra';
  if (motivosUnicos.length === 0 && conciliacionUtilidad == null) {
    advertencias.push('No hay cuenta de resultado del periodo en el patrimonio: la comprobación no puede verificar la utilidad neta contra el balance y los dividendos derivados requieren confirmación con un dato independiente.');
  }

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
    conciliacionUtilidad,
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
  const { estado, totalFlujos, variacionEfectivo, diferencia, operacion, inversion, financiamiento, motivos, conciliacionUtilidad } = resultado;
  if (estado === 'incompleta') {
    return `El EFE está incompleto: ${motivos.join(' ')} Complete los datos en Estados Financieros y vuelva a comprobar el estado.`;
  }
  const fmt = valor => formatCurrency(valor);
  const partes = `Operación ${fmt(operacion.total)}, inversión ${fmt(inversion.total)} y financiamiento ${fmt(financiamiento.total)}`;
  const lectura = lecturaFlujos(resultado);
  if (estado === 'cuadra') {
    // D-069: con la cuenta de resultado del periodo presente y coincidente, la
    // utilidad quedó verificada contra el balance.
    const alcance = ' La utilidad neta concilia con el resultado del periodo del balance: los dividendos derivados quedan respaldados por esa verificación.';
    return `Los flujos suman ${fmt(totalFlujos)}, igual a la variación de efectivo entre ${resultado.periodos.inicial} y ${resultado.periodos.final}: el estado cuadra dentro de la tolerancia de ${fmt(resultado.tolerancia)}. (${partes}.) ${lectura}${alcance}`;
  }
  if (estado === 'cuadra-sin-verificar') {
    const alcance = ' No hay cuenta de resultado del periodo en el patrimonio: la utilidad neta no se pudo conciliar contra el balance y los dividendos derivados requieren confirmación con un dato independiente.';
    return `Los flujos suman ${fmt(totalFlujos)}, igual a la variación de efectivo entre ${resultado.periodos.inicial} y ${resultado.periodos.final}: el estado cuadra dentro de la tolerancia de ${fmt(resultado.tolerancia)}. (${partes}.) ${lectura}${alcance}`;
  }
  const alcance = conciliacionUtilidad != null && conciliacionUtilidad.motivo === 'utilidad_no_conciliada'
    ? ` La utilidad neta (${fmt(conciliacionUtilidad.utilidadNeta)}) no coincide con el resultado del periodo del balance (${fmt(conciliacionUtilidad.resultadoPatrimonio)}): diferencia de ${fmt(Math.abs(conciliacionUtilidad.diferencia))} (utilidad_no_conciliada).`
    : ' La conciliación no valida de forma independiente la utilidad neta: los dividendos se derivan de ella y de la variación del patrimonio; requieren confirmación con un dato independiente.';
  return `Los flujos suman ${fmt(totalFlujos)} pero el efectivo varió ${fmt(variacionEfectivo)}: la diferencia es de ${fmt(Math.abs(diferencia))}. Revise las cuentas, las clasificaciones o los movimientos faltantes: el estado no ajusta cifras ni distribuye diferencias automáticamente. (${partes}.) ${lectura}${alcance}`;
}
