import { monedaDe } from './moneda.js';
import { consultarMontoCuenta } from '../modules/estados/cuentas-identificador.js';

const origenes = new Set(['estados', 'inventario', 'planeacion']);
const naturalezas = new Set(['reportado', 'calculado', 'estimado']);
const monedas = new Set(['C$', 'USD', 'UM']);
const finito = valor => typeof valor === 'number' && Number.isFinite(valor);
const texto = valor => typeof valor === 'string' ? valor.trim().slice(0, 160) : '';
const esObjeto = valor => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

export const CAMPOS_BALANCE_PLANEACION = [
  ['saldoInicialCaja', 'Efectivo inicial', 'bs.cash_and_equivalents'],
  ['cxcInicial', 'Cuentas por cobrar iniciales', 'bs.trade_receivables'],
  ['cxpInicial', 'Cuentas por pagar iniciales', 'bs.trade_payables']
];
export const CAMPOS_BALANCE_FLUJO = [['saldoInicial', 'Saldo inicial de efectivo', 'bs.cash_and_equivalents']];

const motivosCuenta = {
  missing_required_account_data: 'La cuenta carece de un importe acreditado.',
  missing_required_period_balance: 'El corte ya no está disponible.',
  ambiguous_account_match: 'La identidad de la cuenta es ambigua.',
  unrecognized_imported_account: 'Hay cuentas pendientes de identificar.'
};

function contexto(origen, caso, periodo, moneda, producto = '', escenario = '') {
  return { origen, caso: texto(caso), periodo: texto(periodo), moneda, producto: texto(producto), escenario: texto(escenario) };
}

function propuesta(origen, filas, destino, error = '') {
  if (!error && origen.moneda !== destino) {
    error = `Moneda incompatible: la fuente usa ${origen.moneda} y el destino ${destino}.`;
  }
  return { origen, filas, error };
}

export function transferenciaBalance(estados, periodo, destino, campos, actuales) {
  const moneda = monedaDe(estados);
  const origen = contexto('estados', estados?.name || 'Estados guardados', periodo, moneda);
  if (!estados?.periods?.includes(periodo)) {
    return propuesta(origen, [], destino, 'Elija un periodo de los estados guardados.');
  }
  const filas = campos.map(([campo, etiqueta, idDato]) => {
    const lectura = consultarMontoCuenta(estados, periodo, idDato);
    return {
      campo, etiqueta, idDato, etiquetaOrigen: etiqueta.replace(/ inicial(?:es)?$/, ''), unidad: moneda, monetario: true, modo: 'copia',
      naturaleza: estados.reportedTotals?.[periodo]?.[idDato] ? 'reportado' : 'calculado',
      actual: actuales[campo], valor: lectura.valor,
      motivo: motivosCuenta[lectura.motivo] || ''
    };
  });
  return propuesta(origen, filas, destino);
}

export function transferenciaInventario(inventario, productoId, destino, actuales) {
  const producto = inventario?.productos?.find(p => p.id === productoId);
  const moneda = monedaDe(inventario);
  const origen = contexto('inventario', producto?.nombre, 'Saldo vigente', moneda, productoId);
  if (!producto) return propuesta(origen, [], destino, 'Elija un producto de Inventario.');
  const unidad = texto(producto.unidad) || 'unidades';
  const filas = [
    { campo: 'inventarioInicial', etiqueta: 'Inventario inicial', idDato: 'existenciaFinal', etiquetaOrigen: 'Existencia vigente', unidad, valor: producto.existenciaFinal },
    { campo: 'costoUnitario', etiqueta: 'Costo unitario de compra', idDato: 'costoPromedio', etiquetaOrigen: 'Costo promedio vigente',
      unidad: `${moneda}/${unidad}`, monetario: true, valor: producto.costoPromedio }
  ].map(fila => ({
    ...fila, actual: actuales[fila.campo], modo: 'copia', naturaleza: 'calculado',
    motivo: finito(fila.valor) && fila.valor >= 0 ? '' : 'El producto carece de un saldo válido para presupuestar.'
  }));
  filas.push({
    campo: 'stockMinimo', etiqueta: 'Stock mínimo', idDato: 'stockMinimo', etiquetaOrigen: 'Stock mínimo del producto',
    unidad, valor: producto.stockMinimo, modo: 'vínculo', naturaleza: 'reportado',
    motivo: 'Planeación consulta el mínimo vigente del producto vinculado.'
  });
  return propuesta(origen, filas, destino);
}

export function transferenciaCvuInventario(inventario, productoId, destino, actuales, costoConfirmado) {
  const previa = transferenciaInventario(inventario, productoId, destino, {});
  if (!previa.filas.length) return previa;
  const costo = previa.filas.find(fila => fila.campo === 'costoUnitario');
  return { ...previa, filas: [{
    ...costo, campo: 'costoVariableUnitario', etiqueta: 'Costo variable unitario', actual: actuales.costoVariableUnitario,
    motivo: costo.motivo || (costoConfirmado ? '' : 'Confirme que este costo cubre todo el costo variable unitario de la misma línea.')
  }] };
}

export function transferenciaCvuPlaneacion(fuente, periodo, destino, actuales) {
  const { supuestos, resultado, escenario, base } = fuente ?? {};
  const moneda = monedaDe(base || supuestos);
  const origen = contexto('planeacion', base?.empresa || 'Presupuesto guardado', periodo, moneda,
    supuestos?.productoId, escenario?.nombre);
  const i = fuente?.periodos?.indexOf(periodo) ?? -1;
  if (i < 0 || !supuestos) return propuesta(origen, [], destino, 'Elija un periodo del presupuesto guardado.');
  const unidad = fuente.unidad || 'unidad';
  const filas = [
    ['precio', 'Precio de venta unitario', supuestos.precio, `${moneda}/${unidad}`, 'reportado'],
    ['unidades', 'Unidades previstas', supuestos.ventasUnidades[i], unidad, 'reportado'],
    ['costoVariableUnitario', 'Costo variable unitario', resultado?.equilibrio.cvu, `${moneda}/${unidad}`, 'calculado'],
    ['costosFijos', 'Costos fijos del periodo', resultado?.equilibrio.costosFijos, moneda, 'calculado']
  ].map(([campo, etiqueta, valor, unidad, naturaleza]) => ({
    campo, etiqueta, idDato: campo, etiquetaOrigen: etiqueta, valor: finito(valor) ? valor : null, unidad,
    naturaleza, monetario: campo !== 'unidades', modo: 'copia', actual: actuales[campo],
    motivo: finito(valor) ? '' : 'El presupuesto guardado carece de los supuestos necesarios.'
  }));
  return propuesta(origen, filas, destino);
}

function huella(dato) {
  return JSON.stringify([
    dato.origen, dato.caso, dato.periodo, dato.moneda, dato.producto, dato.escenario,
    dato.idDato, dato.unidad, dato.naturaleza, dato.modo, dato.valor
  ]);
}

export function fichaTransferencia(origen, fila) {
  const { idDato, unidad, naturaleza, modo, valor } = fila;
  const dato = { ...origen, idDato, unidad, naturaleza, modo, valor };
  return { ...dato, revision: huella(dato) };
}

export function firmaTransferencia(prevision) {
  return JSON.stringify([prevision.error, prevision.filas.map(fila => [
    fila.campo, fichaTransferencia(prevision.origen, fila).revision, fila.motivo, fila.actual
  ])]);
}

export function filaTransferible(fila) {
  return !fila.motivo && finito(fila.valor);
}

// Una copia antigua sin metadatos se conserva. El respaldo valida los campos
// admitidos y la revisión derivada, sin crear datos de procedencia por inferencia.
export function validarProcedencia(procedencia, campos) {
  if (!esObjeto(procedencia)) throw new Error('La procedencia de la transferencia debe ser un objeto.');
  for (const [campo, dato] of Object.entries(procedencia)) {
    if (!campos.includes(campo) || !esObjeto(dato) || !origenes.has(dato.origen)
      || !monedas.has(dato.moneda) || !naturalezas.has(dato.naturaleza)
      || !['copia', 'vínculo'].includes(dato.modo) || !finito(dato.valor)
      || !['caso', 'periodo', 'producto', 'escenario', 'idDato', 'unidad'].every(clave =>
        typeof dato[clave] === 'string' && dato[clave].length <= 320)
      || !dato.idDato || !dato.unidad || dato.revision !== huella(dato)) {
      throw new Error('La procedencia de la transferencia contiene un dato inválido.');
    }
  }
  return procedencia;
}

export const PROCEDENCIA_FLUJO = ['saldoInicial'];
export const PROCEDENCIA_PLANEACION = [...CAMPOS_BALANCE_PLANEACION.map(([campo]) => campo), 'inventarioInicial', 'costoUnitario'];
export const PROCEDENCIA_CVU = ['precio', 'costoVariableUnitario', 'costosFijos', 'unidades'];

export function leerProcedencia(procedencia, campos) {
  if (procedencia === undefined) return {};
  try {
    return validarProcedencia(procedencia, campos);
  } catch {
    return {};
  }
}

export function procedenciaVigente(dato, prevision) {
  return !prevision.error && prevision.filas.some(fila => filaTransferible(fila)
    && fichaTransferencia(prevision.origen, fila).revision === dato.revision);
}
