import { MAX_PERIODOS, SUPUESTOS, normalizarSupuestos, validarSupuestos } from './planeacion-calculations.js';

export const ARCHIVO_REFERENCIA = 'propuesta-caso/referencia/referencia_resultados.json';
export const CAMPOS_BASE = ['saldoInicialCaja', 'cxcInicial', 'cxpInicial', 'inventarioInicial'];
export const MAX_NOMBRE_ESCENARIO = 80;
const VERSION = 1;
const MAX_ESCENARIOS = 50;
const ID_BASE = 'comercial-ejemplo-2025-r1';
const ID_ESCENARIO_BASE = 'comercial-ejemplo-base';
const CAMPOS_SUPUESTOS = new Set([
  ...SUPUESTOS.map(([clave]) => clave), 'tipoPeriodo', 'periodos', 'ventasUnidades',
  'otrosDesembolsos', 'productoInventario', 'productoId'
]);

const esObjeto = valor => valor !== null && typeof valor === 'object' && !Array.isArray(valor);
const esTexto = (valor, maximo = 160) => typeof valor === 'string' && valor.trim() !== '' && valor.length <= maximo;

export function tieneEscenarios(datos) {
  return esObjeto(datos) && Object.hasOwn(datos, 'versionEscenarios');
}

function validarBase(base) {
  if (!esObjeto(base) || ![base.id, base.empresa, base.revision, base.origen].every(v => esTexto(v))
      || base.moneda !== 'C$' || base.naturaleza !== 'ficticia' || !esObjeto(base.apertura)) {
    throw new Error('La base histórica del escenario está incompleta.');
  }
  const fecha = new Date(`${base.fechaCorte}T00:00:00Z`);
  if (!Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== base.fechaCorte) {
    throw new Error('La fecha de corte de la base histórica no es válida.');
  }
  for (const clave of [...CAMPOS_BASE, 'inventarioValor']) {
    const valor = base.apertura[clave];
    if (valor !== null && (!Number.isFinite(valor) || (clave !== 'saldoInicialCaja' && valor < 0))) {
      throw new Error(`Saldo inválido en la base histórica (${clave}).`);
    }
  }
}

// La apertura vive en la base. Solo se agrega a los supuestos al leer el escenario.
function conApertura(escenario, base) {
  if (!base) return escenario.supuestos;
  const supuestos = { ...escenario.supuestos };
  for (const clave of CAMPOS_BASE) supuestos[clave] = base.apertura[clave];
  return supuestos;
}

export function validarEscenarios(datos) {
  if (!tieneEscenarios(datos) || datos.versionEscenarios !== VERSION) {
    throw new Error('Versión de escenarios de Planeación no admitida.');
  }
  if (!Array.isArray(datos.bases) || !Array.isArray(datos.escenarios) || Object.hasOwn(datos, 'supuestos')
      || datos.bases.length > MAX_ESCENARIOS || datos.escenarios.length > MAX_ESCENARIOS) {
    throw new Error('Estructura de escenarios de Planeación inválida.');
  }
  const bases = new Map();
  for (const base of datos.bases) {
    validarBase(base);
    if (bases.has(base.id)) throw new Error('Hay bases históricas duplicadas.');
    bases.set(base.id, base);
  }
  const ids = new Set();
  for (const escenario of datos.escenarios) {
    if (!esObjeto(escenario) || !esTexto(escenario.id) || !esTexto(escenario.nombre, MAX_NOMBRE_ESCENARIO)
        || !esObjeto(escenario.supuestos) || ids.has(escenario.id)) {
      throw new Error('Hay un escenario inválido o duplicado.');
    }
    ids.add(escenario.id);
    const base = bases.get(escenario.baseId);
    if (escenario.baseId !== null && !base) throw new Error('Un escenario referencia una base histórica inexistente.');
    const { supuestos } = escenario;
    if (Object.keys(supuestos).some(clave => !CAMPOS_SUPUESTOS.has(clave))
        || typeof supuestos.productoId !== 'string' || typeof supuestos.productoInventario !== 'string'
        || (base && (CAMPOS_BASE.some(clave => Object.hasOwn(supuestos, clave))
          || supuestos.productoId || supuestos.productoInventario))) {
      throw new Error('El escenario tiene supuestos incompatibles con su base.');
    }
    const errores = validarSupuestos(conApertura(escenario, base), { parcial: true });
    if (errores.length) throw new Error(`Escenario ${escenario.nombre}. ${errores.join(' ')}`);
  }
  if (!ids.has(datos.activoId)) throw new Error('El escenario activo no existe.');
  if (datos.escenarios.some(e => e.origenId !== null && (e.origenId === e.id || !ids.has(e.origenId)))) {
    throw new Error('Un escenario tiene un origen inválido.');
  }
  return datos;
}

export function leerPlaneacion(datos) {
  if (!tieneEscenarios(datos)) {
    return { escenario: null, base: null, supuestos: normalizarSupuestos(datos?.supuestos), error: null };
  }
  try {
    validarEscenarios(datos);
    const escenario = datos.escenarios.find(e => e.id === datos.activoId);
    const base = datos.bases.find(b => b.id === escenario.baseId) ?? null;
    return { escenario, base, supuestos: conApertura(escenario, base), error: null };
  } catch (error) {
    return { escenario: null, base: null, supuestos: null, error: error.message };
  }
}

export function crearCasoComercial(datos, referencia) {
  const cierre = referencia?.historicos?.['2025']?.cierre;
  const meses = referencia?.proyeccion_2026?.meses;
  if (referencia?.caso !== 'Caso ficticio' || cierre?.diferencia !== 0
      || !Array.isArray(meses) || meses.length !== MAX_PERIODOS
      || !meses.every((mes, i) => mes?.mes === i + 1 && Number.isFinite(mes.movimientos?.unidades_vendidas)
        && mes.movimientos.unidades_vendidas >= 0)) {
    throw new Error('El archivo de referencia de Comercial Ejemplo está incompleto.');
  }
  const base = {
    id: ID_BASE, empresa: referencia.empresa, moneda: referencia.moneda,
    fechaCorte: '2025-12-31', revision: 'Etapa 1 · Ronda 1', origen: ARCHIVO_REFERENCIA, naturaleza: 'ficticia',
    apertura: {
      saldoInicialCaja: cierre.efectivo, cxcInicial: cierre.cxc, cxpInicial: cierre.cxp,
      inventarioInicial: cierre.inventario_unidades, inventarioValor: cierre.inventario_valor
    }
  };
  validarBase(base);
  const anterior = tieneEscenarios(datos) ? validarEscenarios(datos) : null;
  const existente = anterior?.bases.find(b => b.id === base.id);
  if (existente) {
    if (Object.keys(base.apertura).some(clave => existente.apertura[clave] !== base.apertura[clave])
        || existente.empresa !== base.empresa || existente.fechaCorte !== base.fechaCorte) {
      throw new Error('La base guardada tiene otros datos. Revise el respaldo antes de cargar la referencia.');
    }
    const escenario = anterior.escenarios.find(e => e.baseId === base.id);
    if (escenario) return { ...anterior, activoId: escenario.id };
  }
  const supuestos = normalizarSupuestos({
    tipoPeriodo: 'Mes', periodos: meses.length,
    ventasUnidades: meses.map(mes => mes.movimientos.unidades_vendidas),
    otrosDesembolsos: meses.map(() => null)
  });
  for (const clave of CAMPOS_BASE) delete supuestos[clave];
  const previo = normalizarSupuestos(datos?.supuestos);
  const escenarios = anterior?.escenarios ?? (previo ? [{
    id: 'presupuesto-anterior', nombre: 'Presupuesto anterior', baseId: null, origenId: null, supuestos: previo
  }] : []);
  return validarEscenarios({
    versionEscenarios: VERSION,
    bases: existente ? anterior.bases : [...(anterior?.bases ?? []), base],
    escenarios: [...escenarios, {
      id: ID_ESCENARIO_BASE, nombre: 'Base', baseId: base.id, origenId: null, supuestos
    }],
    activoId: ID_ESCENARIO_BASE
  });
}

export function seleccionarEscenario(datos, id) {
  return validarEscenarios({ ...datos, activoId: id });
}

export function duplicarEscenario(datos, id) {
  const { escenario, error } = leerPlaneacion(datos);
  if (!escenario) throw new Error(error ?? 'Seleccione un escenario para duplicarlo.');
  const copia = {
    ...structuredClone(escenario), id, origenId: escenario.id,
    nombre: `Copia de ${escenario.nombre}`.slice(0, MAX_NOMBRE_ESCENARIO)
  };
  return validarEscenarios({ ...datos, escenarios: [...datos.escenarios, copia], activoId: id });
}

export function editarEscenario(datos, nombre, supuestos) {
  const { escenario, base, error } = leerPlaneacion(datos);
  if (!escenario) throw new Error(error ?? 'Seleccione un escenario para guardarlo.');
  const nuevo = { ...escenario, nombre: nombre.trim(), supuestos: { ...supuestos } };
  if (base) for (const clave of CAMPOS_BASE) delete nuevo.supuestos[clave];
  return validarEscenarios({
    ...datos, escenarios: datos.escenarios.map(e => (e.id === escenario.id ? nuevo : e))
  });
}
