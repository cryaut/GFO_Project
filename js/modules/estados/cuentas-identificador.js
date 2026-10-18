import { CUENTAS_CATALOGO, TIPOS_APP, ALIAS_CLASIFICACION, COMPATIBILIDAD_LEGADA, versionCatalogo } from './cuentas-catalogo.js';
import { normalizarCuenta, sugerirCuentas } from './cuentas-similitud.js';

export { versionCatalogo };
const catalogo = new Map(CUENTAS_CATALOGO.map(cuenta => [cuenta.id, cuenta]));
const copia = valor => structuredClone(valor);

export function obtenerCuenta(id) { return catalogo.has(id) ? copia(catalogo.get(id)) : null; }

export function listarCuentas({ grupo } = {}) {
  return CUENTAS_CATALOGO.filter(cuenta => !grupo || cuenta.grupo === grupo).map(copia);
}

export function resolverClasificacion(grupo, valor) {
  const clave = normalizarCuenta(valor);
  return (TIPOS_APP[grupo] || []).find(tipo => normalizarCuenta(tipo) === clave
    || (ALIAS_CLASIFICACION[tipo] || []).some(alias => normalizarCuenta(alias) === clave)) || '';
}

function compatible(cuenta, grupo, clasificacion) {
  if (grupo && cuenta.grupo !== grupo) return false;
  return !clasificacion || cuenta.tipoApp === resolverClasificacion(cuenta.grupo, clasificacion)
    || cuenta.clasificacion === clasificacion;
}

function resultado(estado, cuentas = [], metodo = null, preseleccion = null) {
  return { estado, id: estado === 'reconocida' ? cuentas[0].id : null, metodo,
    candidatos: cuentas.map(cuenta => ({ id: cuenta.id, nombreCanonico: cuenta.nombreCanonico,
      grupo: cuenta.grupo, tipoApp: cuenta.tipoApp, puntuacion: cuenta.puntuacion ?? 1 })), preseleccion };
}

export function identificarCuenta(texto, { grupo = '', clasificacion = '', id = '' } = {}) {
  if (String(texto ?? '').length > 120) return resultado('no_reconocida');
  const nombre = normalizarCuenta(texto);
  if (id) {
    const cuenta = catalogo.get(id);
    if (!cuenta) return resultado('no_reconocida');
    return compatible(cuenta, grupo, clasificacion) ? resultado('reconocida', [cuenta], 'id')
      : resultado('sugerida', [cuenta], 'conflicto_contexto');
  }
  if (!nombre || !/[a-z]/.test(nombre)) return resultado('no_reconocida');
  const exactas = CUENTAS_CATALOGO.filter(cuenta => normalizarCuenta(cuenta.nombreCanonico) === nombre);
  const sinonimos = CUENTAS_CATALOGO.filter(cuenta => cuenta.sinonimos.some(alias => normalizarCuenta(alias) === nombre));
  const originales = exactas.length ? exactas : sinonimos;
  if (originales.length) {
    const filtradas = originales.filter(cuenta => compatible(cuenta, grupo, clasificacion));
    if (!filtradas.length) return resultado('sugerida', originales, 'conflicto_contexto');
    const ambigua = !exactas.length && (filtradas.some(cuenta => cuenta.estadoInvestigacion === 'ambiguous')
      || originales.length > 1 && ['otros ingresos', 'otros gastos'].includes(nombre));
    if (filtradas.length === 1 && !ambigua) return resultado('reconocida', filtradas,
      filtradas.length !== originales.length ? 'contexto' : exactas.length ? 'nombre_canonico' : 'sinonimo');
    return resultado('sugerida', filtradas, 'contexto');
  }
  const posibles = CUENTAS_CATALOGO.filter(cuenta => compatible(cuenta, grupo, clasificacion));
  if (clasificacion && posibles.length === 1 && posibles[0].estadoInvestigacion !== 'ambiguous') {
    return resultado('reconocida', posibles, 'contexto');
  }
  const difusas = sugerirCuentas(nombre, posibles);
  if (difusas.candidatos.length) return resultado('sugerida', difusas.candidatos.map(candidato => ({
    ...catalogo.get(candidato.id), puntuacion: candidato.puntuacion })), 'similitud', difusas.preseleccion);
  // Un tipo explícito restringe la selección, pero no elige entre varias cuentas.
  if (clasificacion && posibles.length) return resultado('sugerida', posibles.slice(0, 5), 'contexto');
  return resultado('no_reconocida');
}

// Adaptador de los datos anteriores a la colección. Nunca se usa para confirmar un id.
export function tipoCuentaLegada(grupo, nombre) {
  const identificacion = identificarCuenta(nombre, { grupo });
  if (identificacion.estado === 'reconocida') return catalogo.get(identificacion.id).tipoApp || '';
  const legado = COMPATIBILIDAD_LEGADA.find(([g, n]) => g === grupo && normalizarCuenta(n) === normalizarCuenta(nombre));
  return legado?.[2] || '';
}

function identidadesPeriodo(datos, periodo, grupo) {
  const valores = grupo === 'estadoResultados' ? datos.estadoResultados?.[periodo]
    : grupo === 'suplementario' ? datos.supplementaryAccounts?.[periodo] : datos.balanceGeneral?.[periodo]?.[grupo];
  return Object.entries(valores || {}).map(([nombre, valor]) => {
    const previa = datos.accountIdentities?.[grupo]?.[nombre];
    const identificada = previa || identificarCuenta(nombre, { grupo });
    return { valor, ...identificada, idCuenta: previa ? previa.idCuenta : identificada.id };
  });
}

export function consultarMontoCuenta(datos, periodo, id) {
  const cuenta = catalogo.get(id);
  if (!cuenta) return { valor: null, motivo: 'unknown_account_id' };
  if (!datos?.periods?.includes(periodo)) return { valor: null, motivo: 'missing_required_period_balance' };
  const reportado = datos.reportedTotals?.[periodo]?.[id];
  const identidades = identidadesPeriodo(datos, periodo, cuenta.grupo);
  const valores = reportado ? [reportado.importe] : identidades.filter(identidad => identidad.estado === 'reconocida'
    && identidad.idCuenta === id).map(identidad => identidad.valor);
  if (valores.length) {
    if (valores.some(valor => typeof valor !== 'number' || !Number.isFinite(valor))) return { valor: null, motivo: 'missing_required_account_data' };
    if (cuenta.rol === 'reported_total' && valores.length !== 1) return { valor: null, motivo: 'ambiguous_account_match' };
    return { valor: valores.reduce((suma, valor) => suma + valor, 0), motivo: null };
  }
  const pendientes = identidades.filter(identidad => identidad.estado !== 'reconocida' && identidad.valor !== 0);
  const afecta = pendientes.filter(identidad => identidad.candidatos.some(candidato => candidato.id === id)
    || identidad.estado === 'no_reconocida');
  const sinGrupo = (datos.pendingAccounts || []).filter(fila => Object.hasOwn(fila.importes, periodo) && fila.importes[periodo] !== 0);
  if (afecta.length || sinGrupo.length) {
    return { valor: null, motivo: afecta.some(identidad => identidad.estado === 'sugerida')
      || sinGrupo.some(fila => fila.identificacion.estado === 'sugerida') ? 'ambiguous_account_match' : 'unrecognized_imported_account' };
  }
  return { valor: cuenta.rol !== 'reported_total' && cuenta.politicaAusencia === 'zero_if_not_reported' ? 0 : null,
    motivo: cuenta.rol !== 'reported_total' && cuenta.politicaAusencia === 'zero_if_not_reported' ? null : 'missing_required_account_data' };
}

export function montoCuenta(datos, periodo, id) { return consultarMontoCuenta(datos, periodo, id).valor; }

export function resumenIdentificacion(datos) {
  const filas = Object.values(datos.accountIdentities || {}).flatMap(grupo => Object.values(grupo));
  for (const fila of datos.pendingAccounts || []) filas.push(fila.identificacion);
  return Object.fromEntries(['reconocida', 'sugerida', 'no_reconocida'].map(estado => [estado, filas.filter(fila => fila.estado === estado).length]));
}
