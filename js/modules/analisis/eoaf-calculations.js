// Estado de Origen y Aplicación de Fondos (EOAF): lógica pura, sin DOM ni store.
// Recibe los estados financieros, arma el balance comparado de dos periodos,
// clasifica cada variación de cuenta como origen o aplicación y comprueba que
// los totales coincidan. Las reglas de clasificación son las de `eoaf` de
// calculate.js; aquí se aplica el grupo y el tipo de ACCOUNT_TYPES.

import { eoaf } from '../../utils/calculate.js';
import { formatCurrency } from '../../utils/format.js';
import { resolveAccountType } from '../estados/estados-calculations.js';
import { ordenarPeriodos } from '../estados/estados-normalize.js';

// Tolerancia de la comprobación: un centavo, más el epsilon de coma flotante
// escalado a los totales (misma regla que validateFinancialData). No se
// redistribuyen diferencias: si el estado no cuadra, se informa la cifra exacta.
export const TOLERANCIA_EOAF = 0.01;

const SECCIONES = [
  { id: 'activos', titulo: 'Activos' },
  { id: 'pasivos', titulo: 'Pasivos' },
  { id: 'patrimonio', titulo: 'Patrimonio' }
];

// Cuenta contra-activo: su magnitud creciente es un origen de fondos (gasto no
// efectivo del periodo) y no una aplicación como en un activo ordinario.
const CONTRA_ACTIVO = 'depreciacionAcumulada';

const ETIQUETA_FALTA = {
  'falta-saldo': 'Dato faltante',
  'sin-clasificar': 'Sin clasificar',
  'signo-cambiado': 'Revisar'
};

// Periodo inicial y final de la comparación: los dos últimos periodos en orden
// cronológico, con el mismo criterio que usa Análisis para el resto de pestañas.
export function seleccionarPeriodoPar(periodos) {
  const lista = (Array.isArray(periodos) ? periodos : [])
    .filter(periodo => typeof periodo === 'string' && periodo.trim());
  if (lista.length < 2) {
    return {
      incompleto: `Se necesitan al menos 2 periodos para comparar y hay ${lista.length}. Capture o importe un periodo adicional en Estados Financieros.`
    };
  }
  // Con año al inicio se ordenan solos; con nombres ("Marzo") se respeta el
  // orden que el usuario dejó en Estados, igual que normalizeFinancialData.
  const ordenados = ordenarPeriodos(lista);
  const periodoFinal = ordenados[ordenados.length - 1];
  const periodoInicial = ordenados[ordenados.length - 2];
  if (periodoInicial === periodoFinal) {
    return { incompleto: 'Los periodos comparables no son distintos: no hay dos periodos diferentes para armar el estado.' };
  }
  return { periodoInicial, periodoFinal, periodos: ordenados };
}

// Clasifica la variación de una cuenta del balance.
// - `grupo`: sección del balance ('activos', 'pasivos', 'patrimonio').
// - `tipo`: valor de ACCOUNT_TYPES, o '' si la cuenta no está clasificada.
// Devuelve `{ clasificacion, monto, motivo }`:
// - clasificacion: 'Origen', 'Aplicacion', 'Sin movimiento' o null (incompleto).
// - monto: importe del movimiento (valor absoluto de la variación) o null.
// - motivo: 'falta-saldo', 'sin-clasificar', 'signo-cambiado' o null.
export function clasificarMovimientoEOAF(grupo, tipo, saldoInicial, saldoFinal) {
  if (!Number.isFinite(saldoInicial) || !Number.isFinite(saldoFinal)) {
    return { clasificacion: null, monto: null, motivo: 'falta-saldo' };
  }
  if (!tipo) return { clasificacion: null, monto: null, motivo: 'sin-clasificar' };
  const variacion = saldoFinal - saldoInicial;
  if (variacion === 0) return { clasificacion: 'Sin movimiento', monto: null, motivo: null };
  if (tipo === CONTRA_ACTIVO) {
    const magnitudInicial = Math.abs(saldoInicial);
    const magnitudFinal = Math.abs(saldoFinal);
    // Mismo signo en ambos lados con magnitudes iguales: cambió de signo.
    if (magnitudInicial === magnitudFinal) {
      return { clasificacion: null, monto: null, motivo: 'signo-cambiado' };
    }
    return {
      clasificacion: magnitudFinal > magnitudInicial ? 'Origen' : 'Aplicacion',
      monto: Math.abs(variacion),
      motivo: null
    };
  }
  const regla = grupo === 'activos' ? 'activo' : grupo === 'patrimonio' ? 'patrimonio' : 'pasivo';
  const movimiento = eoaf('', variacion, regla);
  return movimiento
    ? { clasificacion: movimiento.clasificacion, monto: movimiento.monto, motivo: null }
    : { clasificacion: null, monto: null, motivo: null };
}

export function etiquetaFalta(motivo) {
  return ETIQUETA_FALTA[motivo] || null;
}

function mensajeFalta(motivo, cuenta, saldoInicial, saldoFinal, periodos) {
  if (motivo === 'falta-saldo') {
    const faltante = saldoInicial === null ? periodos.inicial : periodos.final;
    return `La cuenta «${cuenta}» no tiene saldo en el periodo ${faltante}; sin ese dato no se puede clasificar su variación.`;
  }
  if (motivo === 'sin-clasificar') {
    return `La cuenta «${cuenta}» no tiene clasificación; añada un tipo de cuenta en Estados Financieros para poder clasificarla.`;
  }
  if (motivo === 'signo-cambiado') {
    return `La cuenta «${cuenta}» cambió de signo entre periodos; revise el importe en Estados Financieros.`;
  }
  return '';
}

function totalGrupo(bg, grupo) {
  return Object.values(bg[grupo] || {}).reduce(
    (suma, valor) => (Number.isFinite(valor) ? suma + valor : suma), 0
  );
}

function advertenciasDeBalance(periodos, bgInicial, bgFinal) {
  const advertencias = [];
  for (const [etiqueta, bg] of [[periodos.inicial, bgInicial], [periodos.final, bgFinal]]) {
    const descuadre = totalGrupo(bg, 'activos') - totalGrupo(bg, 'pasivos') - totalGrupo(bg, 'patrimonio');
    if (Math.abs(descuadre) > TOLERANCIA_EOAF) {
      advertencias.push(`El balance del periodo ${etiqueta} no cumple A = P + O (diferencia de ${formatCurrency(descuadre)}); esa diferencia se refleja en la comprobación del EOAF.`);
    }
  }
  return advertencias;
}

// Construye el estado completo: secciones con sus filas y subtotales, resumen de
// la comprobación (origenes vs aplicaciones), advertencias e interpretación.
export function construirEOAF(datos, periodoInicial, periodoFinal) {
  const periodos = { inicial: periodoInicial, final: periodoFinal };
  const advertencias = [];
  const motivos = [];
  const sinDatos = incompleto => ({
    periodos, incompleto, secciones: [], resumen: null, advertencias, interpretacion: ''
  });

  const bgInicial = datos?.balanceGeneral?.[periodoInicial];
  const bgFinal = datos?.balanceGeneral?.[periodoFinal];
  if (!bgInicial || !bgFinal) {
    const faltante = !bgInicial ? periodoInicial : periodoFinal;
    return sinDatos(`No hay balance general del periodo ${faltante}. Capture o importe los estados de ambos periodos en Estados Financieros.`);
  }

  const secciones = [];
  for (const { id, titulo } of SECCIONES) {
    const cuentasInicial = bgInicial[id] || {};
    const cuentasFinal = bgFinal[id] || {};
    // Unión de cuentas: primero las del periodo inicial y después las que solo
    // aparecen en el final (sin saldo inicial no hay variación clasificable).
    const nombres = [
      ...Object.keys(cuentasInicial),
      ...Object.keys(cuentasFinal).filter(nombre => !Object.hasOwn(cuentasInicial, nombre))
    ];
    const filas = [];
    let avisoDepreciacion = false;
    for (const cuenta of nombres) {
      const saldoInicial = Object.hasOwn(cuentasInicial, cuenta) ? cuentasInicial[cuenta] : null;
      const saldoFinal = Object.hasOwn(cuentasFinal, cuenta) ? cuentasFinal[cuenta] : null;
      const tipo = resolveAccountType(datos, id, cuenta) || '';
      const r = clasificarMovimientoEOAF(id, tipo, saldoInicial, saldoFinal);
      const mensaje = mensajeFalta(r.motivo, cuenta, saldoInicial, saldoFinal, periodos);
      if (mensaje) motivos.push(mensaje);
      if (tipo === CONTRA_ACTIVO && !avisoDepreciacion) {
        avisoDepreciacion = true;
        advertencias.push('La depreciación acumulada se presenta con la variación de su saldo: el modelo de datos no registra el gasto del periodo por separado, por lo que no se distingue la depreciación del periodo de los retiros o ventas de activos.');
        if ((Number.isFinite(saldoInicial) && saldoInicial > 0)
          || (Number.isFinite(saldoFinal) && saldoFinal > 0)) {
          advertencias.push(`La cuenta «${cuenta}» de depreciación acumulada está guardada con signo positivo; se clasifica por la variación de su magnitud y la comprobación puede no cuadrar hasta corregir el signo en los datos.`);
        }
      }
      filas.push({
        cuenta,
        tipo: tipo || null,
        saldoInicial,
        saldoFinal,
        variacion: saldoInicial !== null && saldoFinal !== null ? saldoFinal - saldoInicial : null,
        clasificacion: r.clasificacion,
        origen: r.clasificacion === 'Origen' ? r.monto : null,
        aplicacion: r.clasificacion === 'Aplicacion' ? r.monto : null,
        falta: r.motivo,
        etiqueta: etiquetaFalta(r.motivo),
        mensaje
      });
    }
    const completo = filas.every(fila => fila.saldoInicial !== null && fila.saldoFinal !== null);
    const saldoInicial = completo ? filas.reduce((suma, fila) => suma + fila.saldoInicial, 0) : null;
    const saldoFinal = completo ? filas.reduce((suma, fila) => suma + fila.saldoFinal, 0) : null;
    secciones.push({
      id,
      titulo,
      filas,
      subtotal: {
        saldoInicial,
        saldoFinal,
        variacion: completo ? saldoFinal - saldoInicial : null,
        completo
      }
    });
  }

  if (!secciones.some(seccion => seccion.filas.length > 0)) {
    motivos.push('El balance general de los periodos seleccionados no tiene cuentas.');
  }
  advertencias.push(...advertenciasDeBalance(periodos, bgInicial, bgFinal));

  const filas = secciones.flatMap(seccion => seccion.filas);
  const totalOrigenes = filas.reduce((suma, fila) => suma + (fila.origen ?? 0), 0);
  const totalAplicaciones = filas.reduce((suma, fila) => suma + (fila.aplicacion ?? 0), 0);
  const diferencia = totalOrigenes - totalAplicaciones;
  const tolerancia = TOLERANCIA_EOAF
    + Number.EPSILON * Math.max(1, Math.abs(totalOrigenes), Math.abs(totalAplicaciones));
  const motivosUnicos = [...new Set(motivos)];
  const estado = motivosUnicos.length > 0
    ? 'incompleta'
    : (Math.abs(diferencia) <= tolerancia ? 'cuadra' : 'no-cuadra');

  const resultado = {
    periodos,
    secciones,
    resumen: {
      totalOrigenes,
      totalAplicaciones,
      diferencia,
      estado,
      tolerancia,
      motivos: motivosUnicos
    },
    advertencias,
    interpretacion: ''
  };
  resultado.interpretacion = interpretarEOAF(resultado);
  return resultado;
}

// Lectura breve del estado. Los nombres de cuenta que aparecen aquí pueden venir
// de un archivo importado: el llamador debe escaparlos antes de insertarlos en HTML.
export function interpretarEOAF(resultado) {
  const { resumen, secciones } = resultado;
  if (!resumen) return '';
  if (resumen.estado === 'incompleta') {
    return `La comprobación está incompleta: ${resumen.motivos.join(' ')} Complete los datos en Estados Financieros y vuelva a comprobar el estado.`;
  }
  const filas = secciones.flatMap(seccion => seccion.filas);
  if (resumen.totalOrigenes === 0 && resumen.totalAplicaciones === 0) {
    return 'Ninguna cuenta varió entre los periodos comparados: no hay orígenes ni aplicaciones que reportar.';
  }
  const fuentes = filas.filter(fila => fila.origen != null).sort((a, b) => b.origen - a.origen);
  const usos = filas.filter(fila => fila.aplicacion != null).sort((a, b) => b.aplicacion - a.aplicacion);
  const partes = [];
  if (fuentes[0]) partes.push(`la mayor fuente de fondos fue «${fuentes[0].cuenta}» (${formatCurrency(fuentes[0].origen)})`);
  if (usos[0]) partes.push(`la mayor aplicación fue «${usos[0].cuenta}» (${formatCurrency(usos[0].aplicacion)})`);
  const detalle = partes.length ? ` ${partes.join(' y ')}.` : '';
  if (resumen.estado === 'cuadra') {
    return `Los orígenes (${formatCurrency(resumen.totalOrigenes)}) igualan a las aplicaciones (${formatCurrency(resumen.totalAplicaciones)}): el estado cuadra dentro de la tolerancia de ${formatCurrency(resumen.tolerancia)}.${detalle}`;
  }
  const exceso = formatCurrency(Math.abs(resumen.diferencia));
  const lado = resumen.diferencia > 0
    ? `Los orígenes superan a las aplicaciones en ${exceso}`
    : `Las aplicaciones superan a los orígenes en ${exceso}`;
  return `${lado}. Revise las cuentas, las clasificaciones o los movimientos faltantes: el estado no ajusta cifras ni distribuye diferencias automáticamente.${detalle}`;
}
