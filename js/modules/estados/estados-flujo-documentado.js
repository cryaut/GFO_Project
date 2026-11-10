// D-111: un estado de flujos suministrado conserva su fuente y sus movimientos.
// No convierte una captura manual cualquiera en un estado auditado.
import { calcularFlujo, validarMovimientoFlujo } from '../flujo/flujo-calculations.js';
import { consultarMontoCuenta } from './cuentas-identificador.js';
import { monedaDe } from '../../utils/moneda.js';
import { toleranciaComprobacion } from '../analisis/comprobacion-calculations.js';

const objeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const texto = (v, max) => typeof v === 'string' && v.trim() && v.length <= max;

export function revisionEstadosFlujo(datos) {
  return JSON.stringify([datos.name, monedaDe(datos), datos.periods, datos.balanceGeneral, datos.estadoResultados]);
}

export function validarFlujosDocumentados(lista) {
  if (!Array.isArray(lista) || lista.length > 100) throw new Error('Lista de flujos documentados inválida.');
  const pares = new Set();
  return Array.from(lista).map(f => {
    if (!objeto(f) || !['reportado', 'simulado'].includes(f.tipo)
        || !texto(f.fuente, 500) || !texto(f.empresa, 160)
        || !texto(f.periodoInicial, 40) || !texto(f.periodoFinal, 40) || f.periodoInicial === f.periodoFinal
        || !['C$', 'USD', 'UM'].includes(f.moneda) || !texto(f.revision, 1000000)
        || !objeto(f.datos) || !Number.isFinite(f.datos.saldoInicial)
        || !Array.isArray(f.datos.movimientos) || f.datos.movimientos.length > 1000) {
      throw new Error('El flujo documentado requiere fuente, entidad, periodos, moneda y movimientos válidos.');
    }
    const par = f.periodoFinal;
    if (pares.has(par)) throw new Error('Hay más de un flujo documentado para el mismo cierre; conserve un intervalo explícito.');
    pares.add(par);
    const ids = new Set();
    const movimientos = Array.from(f.datos.movimientos).map(m => {
      if (!objeto(m) || !texto(m.id, 100) || ids.has(m.id) || validarMovimientoFlujo(m).length) {
        throw new Error('Movimiento inválido o repetido en el flujo documentado.');
      }
      ids.add(m.id);
      return { id:m.id, concepto:m.concepto, actividad:m.actividad, tipo:m.tipo, monto:m.monto };
    });
    return { tipo:f.tipo, fuente:f.fuente, empresa:f.empresa, moneda:f.moneda,
      periodoInicial:f.periodoInicial, periodoFinal:f.periodoFinal, revision:f.revision,
      datos:{ saldoInicial:f.datos.saldoInicial, moneda:f.moneda, periodoBase:f.periodoInicial, movimientos } };
  });
}

export function adjuntarFlujoDocumentado(estados, flujo, { tipo, fuente, inicial, final }) {
  const ficha = { tipo, fuente, empresa:estados.name, moneda:monedaDe(estados),
    periodoInicial:inicial, periodoFinal:final, revision:revisionEstadosFlujo(estados), datos:flujo };
  return { ...estados, flujosDocumentados:validarFlujosDocumentados([...(estados.flujosDocumentados || []), ficha]) };
}

export function construirFlujoDocumentado(datos, inicial, final) {
  const ficha = datos?.flujosDocumentados?.find(f => f.periodoInicial === inicial && f.periodoFinal === final);
  if (!ficha) return null;
  // Se valida también la llamada directa, no solo la importación.
  const f = validarFlujosDocumentados([ficha])[0];
  const vigente = f.revision === revisionEstadosFlujo(datos) && f.empresa === datos.name && f.moneda === monedaDe(datos);
  const r = calcularFlujo(f.datos);
  const efectivoFinal = consultarMontoCuenta(datos, final, 'bs.cash_and_equivalents').valor;
  const aperturaBalance = datos.periods.includes(inicial)
    ? consultarMontoCuenta(datos, inicial, 'bs.cash_and_equivalents').valor : f.datos.saldoInicial;
  const tolerancia = toleranciaComprobacion(r.saldoFinal, efectivoFinal);
  const diferencia = efectivoFinal === null ? null : r.saldoFinal - efectivoFinal;
  const motivos = [];
  if (!vigente) motivos.push('Los estados cambiaron desde que se suministró este flujo. Revise o vuelva a importar su documento; no se sustituye por una estimación.');
  if (aperturaBalance === null || efectivoFinal === null) motivos.push('Falta efectivo identificado para comprobar el flujo suministrado.');
  const aperturaCuadra = aperturaBalance !== null && Math.abs(aperturaBalance - r.saldoInicial) <= tolerancia;
  const estado = motivos.length ? 'incompleta' : aperturaCuadra && Math.abs(diferencia) <= tolerancia ? 'cuadra' : 'no-cuadra';
  const actividad = id => {
    const a = r.actividades.find(a => a.actividad === id);
    return { total:vigente ? a.neto : null,
      items:a.movimientos.map(m => ({ concepto:m.concepto, monto:vigente ? (m.tipo === 'entrada' ? m.monto : -m.monto) : null, falta:vigente ? null : 'fuente-desactualizada' })) };
  };
  return { naturaleza:f.tipo === 'reportado' ? 'flujo_reportado' : 'flujo_simulado_documentado', fuente:f.fuente,
    periodos:{ inicial, final }, utilidadNeta:null, conciliacionUtilidad:null,
    operacion:actividad('operacion'), inversion:actividad('inversion'), financiamiento:actividad('financiamiento'),
    totalFlujos:vigente ? r.variacionNeta : null, efectivoInicial:vigente ? r.saldoInicial : null,
    efectivoFinal, efectivoFinalCalculado:vigente ? r.saldoFinal : null,
    variacionEfectivo:efectivoFinal === null ? null : efectivoFinal - f.datos.saldoInicial,
    diferencia:vigente ? diferencia : null, tolerancia, estado, motivos,
    advertencias:[f.tipo === 'reportado' ? 'Flujo transcrito de la fuente identificada; el cuadre no constituye una auditoría nueva.'
      : 'Escenario académico simulado: no representa operaciones reales de AGRI-CORP.',
    ...(datos.periods.includes(inicial) ? [] : ['La apertura del intervalo está declarada en el documento; no hay balance inicial cargado para ese corte.'])],
    interpretacion:estado === 'cuadra' ? 'Los movimientos suministrados concilian con el efectivo de cierre. Se conserva el intervalo y la fuente del documento.'
      : motivos.join(' ') || 'El flujo suministrado no concilia con los saldos: revise apertura, movimientos y efectivo final.' };
}
