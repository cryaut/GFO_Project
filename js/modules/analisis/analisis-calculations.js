// Composición de las tablas de Análisis; no modifica los estados ni suma totales reportados.
import { ahDelta, ahPctDelta, av, dupont } from '../../utils/calculate.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { estadosResueltos } from '../estados/estados-presentacion-calculations.js';
import { computarRazonesDesdeDatos, MAPA_RAZONES_APP, obtenerUtilidadNetaMotor } from '../razones/razones-app-adapter.js';
import { crearContextoRazonesGuardadas, evaluarConComposicion } from '../razones/razones-app-entrada.js';
import { evaluarDerivado } from '../razones/razones-motor.js';

const numero = valor => typeof valor === 'number' && Number.isFinite(valor);

export function filasAnalisis(datos, periodo) {
  if (!datos?.periods?.includes(periodo)) return [];
  const resueltos = estadosResueltos(datos, periodo);
  const filas = [...resueltos.balanceGeneral, ...resueltos.estadoResultados];
  for (const [cuenta, valor] of Object.entries(datos.supplementaryAccounts?.[periodo] || {})) {
    filas.push({ clave: `suplementario:${cuenta}`, cuenta, grupo: 'Datos suplementarios', seccion: 'complementarios', valor: numero(valor) ? valor : null });
  }
  (datos.pendingAccounts || []).forEach((fila, indice) => {
    if (Object.hasOwn(fila.importes, periodo)) filas.push({ clave: `pendiente:${indice}`, cuenta: fila.nombre,
      grupo: 'Pendientes de grupo', seccion: 'pendientes', valor: numero(fila.importes[periodo]) ? fila.importes[periodo] : null });
  });
  return filas;
}

export function analisisHorizontalCompleto(datos, periodos) {
  const resultados = [];
  for (let i = 1; i < periodos.length; i++) {
    const inicial = periodos[i - 1], final = periodos[i];
    const t1 = new Map(filasAnalisis(datos, inicial).map(fila => [fila.clave, fila]));
    const t2 = new Map(filasAnalisis(datos, final).map(fila => [fila.clave, fila]));
    const claves = [...new Set([...t1.keys(), ...t2.keys()])].sort((a, b) =>
      ((t2.get(a) || t1.get(a)).orden ?? 2000) - ((t2.get(b) || t1.get(b)).orden ?? 2000));
    const rows = claves.map(clave => {
      const fila = t2.get(clave) || t1.get(clave);
      const v1 = t1.get(clave)?.valor ?? null, v2 = t2.get(clave)?.valor ?? null;
      return { ...fila, fuenteT1: t1.get(clave), fuenteT2: t2.get(clave), t1: v1, t2: v2, delta: ahDelta(v2, v1), pctDelta: ahPctDelta(v2, v1) };
    });
    resultados.push({ periodo: `${inicial} → ${final}`, inicial, final, rows });
  }
  return resultados;
}

export function analisisVerticalCompleto(datos, periodo) {
  const totales = datos?.periods?.includes(periodo) ? computeFinancialTotals(datos, periodo) : null;
  const filas = filasAnalisis(datos, periodo);
  // La disponibilidad del activo reportado es independiente de su desglose.
  const reportado = filas.find(f => f.id === 'bs.total_assets' && f.origen === 'reportado');
  const contexto = reportado && crearContextoRazonesGuardadas(datos, periodo);
  const lectura = contexto?.entrada && evaluarDerivado(MAPA_RAZONES_APP.endeudamiento, 'derived.total_assets', contexto.entrada);
  if (numero(lectura?.valor) && lectura.valor === reportado.valor) {
    reportado.valorCalculo = lectura.valor;
    reportado.motivos = lectura.motivos;
  }
  const activos = reportado?.valorCalculo ?? totales?.totalActivos ?? null;
  // Misma base (ventas netas), con la disponibilidad de la lectura del ER.
  // Un ingreso operativo acreditado no debe invalidarla por carecer de tipoApp.
  const ventas = filas.find(f => f.id === 'is.net_sales_reported')?.valorCalculo ?? null;
  const bases = { balance: ['Total Activos', activos], resultados: ['Ventas netas', ventas] };
  const seccion = nombre => {
    const [base, baseValor] = bases[nombre];
    return { base, baseValor, rows: filas.filter(fila => fila.seccion === nombre).map(fila => ({ ...fila, base,
      pctBase: numero(fila.valor) && numero(baseValor) && baseValor !== 0 ? av(fila.valor, baseValor) : null })) };
  };
  return { balanceGeneral: seccion('balance'), estadoResultados: seccion('resultados'),
    complementarios: filas.filter(fila => !bases[fila.seccion]) };
}

export function detalleDuPont(datos, periodo) {
  const razones = computarRazonesDesdeDatos(datos, periodo);
  const contexto = crearContextoRazonesGuardadas(datos, periodo);
  const utilidad = obtenerUtilidadNetaMotor(datos, periodo);
  const ventas = contexto.fallo ? { valor: null } : evaluarConComposicion(() =>
    evaluarDerivado('rentabilidad_margen_utilidad_neta', 'derived.net_sales', contexto.entrada), contexto.entrada);
  const dp = dupont(utilidad.valor, ventas.valor, razones.activoProm, razones.patrimonioProm);
  // Los factores conservan la disponibilidad del mismo motor que las razones directas.
  // No se usa el totalizador legado para completar operandos faltantes del motor.
  const PM = razones.MN, AT = razones.rotacionActivos, EM = razones.apalancamiento;
  const ROA = numero(PM) && numero(AT) ? PM * AT : null;
  const ROE = numero(ROA) && numero(EM) ? dp.ROE : null;
  return { ...dp, PM, AT, EM, ROA, ROE, roaDirecto: razones.ROA, roeDirecto: razones.roe,
    utilidadNeta: utilidad.valor, ventas: ventas.valor, activoProm: razones.activoProm,
    patrimonioProm: razones.patrimonioProm, usaPromedios: razones.usaPromedios,
    motivos: razones.notAvailableReasons.filter(motivo => ['MN', 'rotacionActivos', 'apalancamiento', 'ROA', 'roe'].includes(motivo.campo)) };
}
