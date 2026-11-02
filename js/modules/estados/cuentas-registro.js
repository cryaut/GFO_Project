import { identificarCuenta, obtenerCuenta, resolverClasificacion } from './cuentas-identificador.js';
import { normalizeFinancialData } from './estados-normalize.js';

// Única vía de alta: la UI y el importador pasan registros con el mismo contrato.
// El lote evita normalizar miles de veces al leer un archivo grande.
export function registrarCuenta(datos, registros) {
  const copia = structuredClone(datos);
  copia.accountTypes ??= { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {} };
  copia.accountIdentities ??= { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {}, suplementario: {} };
  const filas = {};
  for (const registro of Array.isArray(registros) ? registros : [registros]) {
    const { nombre, periodo, importe, clasificacion = '', origen = 'manual' } = registro;
    if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 120 || ['__proto__', 'constructor', 'prototype'].includes(nombre)) throw new Error('Nombre de cuenta inválido');
    if (typeof periodo !== 'string' || !periodo.trim() || periodo !== periodo.trim() || periodo.length > 40
      || ['__proto__', 'constructor', 'prototype'].includes(periodo)) throw new Error('Periodo inválido');
    const identificacion = identificarCuenta(nombre, { grupo: registro.grupo, clasificacion, id: registro.id || '' });
    const cuenta = obtenerCuenta(identificacion.id);
    const grupo = cuenta?.grupo || registro.grupo || '';
    const identidad = { idCuenta: identificacion.id, estado: identificacion.estado,
      metodo: registro.confirmado && cuenta ? 'confirmacion_manual' : identificacion.metodo,
      candidatos: identificacion.candidatos, origen };
    if (!copia.periods.includes(periodo)) {
      copia.periods.push(periodo);
      copia.balanceGeneral[periodo] = { activos: {}, pasivos: {}, patrimonio: {} };
      copia.estadoResultados[periodo] = {};
    }
    if (!Object.hasOwn(copia.accountIdentities, grupo)) {
      copia.pendingAccounts ??= [];
      const anterior = copia.pendingAccounts.find(fila => fila.nombre === nombre);
      if (anterior && Object.hasOwn(anterior.importes, periodo)) throw new Error(`La cuenta "${nombre}" está duplicada en ${periodo}.`);
      if (anterior) anterior.importes[periodo] = importe;
      else copia.pendingAccounts.push({ nombre, importes: { [periodo]: importe }, identificacion: identidad });
      continue;
    }
    const tipo = resolverClasificacion(grupo, clasificacion) || cuenta?.tipoApp || '';
    if (Number.isInteger(registro.fila) && registro.fila > 0) filas[`${grupo}:${nombre}:${periodo}`] = registro.fila;
    const anterior = copia.accountIdentities[grupo]?.[nombre];
    if (anterior?.idCuenta && cuenta && anterior.idCuenta !== cuenta.id && !registro.reemplazar) throw new Error('La misma cuenta tiene identificadores distintos entre periodos.');
    let destino;
    if (cuenta?.rol === 'reported_total') {
      copia.reportedTotals ??= {};
      copia.reportedTotals[periodo] ??= {};
      if (Object.hasOwn(copia.reportedTotals[periodo], cuenta.id) && !registro.reemplazar) throw new Error('Total reportado duplicado');
      copia.reportedTotals[periodo][cuenta.id] = { nombre, grupo, importe };
    } else {
      if (grupo === 'suplementario') {
        copia.supplementaryAccounts ??= {};
        copia.supplementaryAccounts[periodo] ??= {};
        destino = copia.supplementaryAccounts[periodo];
      } else destino = grupo === 'estadoResultados' ? copia.estadoResultados[periodo] : copia.balanceGeneral[periodo][grupo];
      if (Object.hasOwn(destino, nombre) && !registro.reemplazar) throw new Error(`La cuenta "${nombre}" está duplicada en ${periodo}.`);
      destino[nombre] = importe;
      if (grupo !== 'suplementario') copia.accountTypes[grupo][nombre] = tipo;
    }
    copia.accountIdentities[grupo][nombre] = identidad;
  }
  return normalizeFinancialData(copia, { filas });
}
