import { ejemploBaker, ejemploBartlett, ejemploBartlettClase, ejemploPractico2, completarEjemploMuno } from './ejemplos-estados.js';
import { ejemploEstudiantil, ejemploSoloTransporte } from '../modules/presupuesto/ejemplos-estudiantiles.js';
import { ejemplosPersonalesDefensa, ejemploPersonalDefensa } from './ejemplos-personales-defensa.js';

import { casoHistoricoReal, casoOperativoSimulado, flujoRealAgricorp, presupuestoPersonalDemo } from './ejemplos-agricorp.js';

// Flujos publicados de AGRI-CORP, un año por opción (D-113).
const FLUJOS_AGRICORP = [
  ['2025', 'F04 · auditado 2025, p. 10', 'Flujo publicado 2025. La inversión neta es positiva por la venta de activos financieros (VRORI).'],
  ['2024', 'F03 · auditado 2024, p. 9', 'Flujo publicado 2024.'],
  ['2023', 'F03 · auditado 2024, p. 9 (comparativo)', 'Flujo publicado 2023, con efecto de conversión de C$ 180,394.'],
  ['2022', 'F02 · auditado 2023, p. 8 (comparativo)', 'Flujo publicado 2022, con efecto de conversión de C$ 323,599.']
].map(([anio, fuente, detalle]) => ({ id:`agricorp-${anio}`, nombre:`AGRI-CORP · flujo publicado ${anio}`, fuente, grupo:'AGRI-CORP',
  detalle:`${detalle} REAL, en C$: operación = subtotal publicado del método indirecto + impuesto pagado + intereses cobrados y pagados; inversión y financiamiento línea por línea.` }));

const propio = (id, nombre, detalle) => ({ id, nombre, fuente:'Ejemplo ficticio de la app', detalle });
// D-113: AGRI-CORP es el caso central. Sus opciones van primero y agrupadas en cada selector de
// empresa; las demás quedan en «Otros ejemplos».
const agri = (id, nombre, fuente, detalle) => ({ id, nombre, fuente, detalle, grupo:'AGRI-CORP' });
const CONSOLIDADO = 'AGRI-CORP · consolidado real 2022–2025 con supuestos';
const ARROZ = 'AGRI-CORP · línea de arroz (escenario simulado jul–sep 2027)';
const FUENTE_REAL = 'Estados consolidados auditados 2022–2025 (F02, F03 y F04) y supuestos declarados';
const FUENTE_ARROZ = 'Escenario docente de la línea de arroz (datos inventados)';
const DETALLE_ARROZ = 'Línea de negocio de arroz con sacos, precios y calendarios inventados con fines docentes: no son cifras reales de AGRI-CORP ni se suman al consolidado. Tres meses en C$.';
const AGRI_ESTADOS = [
  agri('agricorp-historico', CONSOLIDADO, FUENTE_REAL, 'Balance y estado de resultados auditados de cuatro años, en C$, con los flujos publicados de 2022 a 2025. 2022 y 2023 tienen opinión calificada del auditor. Supuestos declarados y editables: ventas a crédito 50 % y compras a crédito 60 % de las compras estimadas.'),
  agri('agricorp-simulado', ARROZ, FUENTE_ARROZ, DETALLE_ARROZ)
];
const docente = (id, nombre, fuente, detalle) => ({ id, nombre, fuente:`Ejercicios_AFOD.zip · ${fuente}`, detalle });
const estados = [
  ...AGRI_ESTADOS,
  propio('actual','MUNO MODA · integral','Incluye ventas a crédito y pagos ficticios declarados. Las 24 razones están disponibles en 2024; 2023 es la base comparativa. C$.'),
  docente('baker','Baker Corporation','Baker Completo.md','BG 2011–2012 y ER 2012. USD: se multiplican por 1000 las cifras en miles de la fuente. Documentos corrientes según su ubicación en la fuente; no hay ER 2011 ni datos de ventas a crédito. DAP 10000 no es gasto del ER.'),
  docente('bartlett','Bartlett Company','Bartlley Company.md','BG/ER 2011–2012. USD convertidos desde miles. Valores negociables incluidos en equivalentes según la comprobación de efectivo de la fuente. No se inventan datos de crédito. DAP 10000 no es gasto.'),
  { id:'bartlett-clase', nombre:'Bartlett · razones de clase', fuente:'Diapositivas AFOD · Liquidez y actividad, 14–15',
    detalle:'Mismos BG/ER en USD. Premisas docentes SOLO para 2012: todas las ventas a crédito (3074000) y compras estimadas = 70 % del costo (1461600). Base de 365 días y saldos promedio. No son pagos a proveedores ni flujos de caja; 2011 conserva N/D donde falta información.' },
  docente('practico2','Ejercicio práctico 2','Ejercicio practico 2.md','BG y ER 2023–2024. UM: la fuente usa $ sin identificar moneda. PPE ya neto; no se añade depreciación. No da ventas a crédito ni pagos a proveedores.')
];
const LISTAS = {
  activos:[...ejemplosPersonalesDefensa('activos'), propio('actual','Hogar ficticio · cuatro bienes','Ejemplo anterior de laptop, refrigeradora, motocicleta y juego de sala.')],
  presupuestoEstudiantil:[{ id:'actual', nombre:'Plantilla del profesor · C$2400', fuente:'Presupuesto_estudiantil.xlsx', detalle:'32 movimientos en cuatro semanas de agosto de 2026. Meta C$2000 en 20 semanas; ahorro realizado C$400, reserva C$250. Proyección real mensual C$2400; la deseada queda por definir.' },
    ...ejemplosPersonalesDefensa('presupuestoEstudiantil'),
    propio('transporte', 'Solo transporte · ahorro cero', 'Caso sintético: ingreso y gasto semanales C$175. Ahorro realizado cero; no se inventa dinero para cumplir la meta.')],
  estados,
  flujo:[...FLUJOS_AGRICORP, propio('actual','MUNO MODA · flujo anual','Movimientos ficticios de caja en C$.'),
    docente('baker-directo','Baker · método directo','Baker Completo.md','Flujo resuelto 2012: CFO 780000, inversión −300000 y financiamiento 20000. USD; fuente en miles. No es una estimación desde saldos.'),
    docente('bartlett-directo','Bartlett · método directo','Bartlley Company.md','Flujo resuelto 2012: CFO 500000, inversión −347000 y financiamiento −61000. USD; fuente en miles.')],
  equilibrio:[
    agri('agricorp', 'AGRI-CORP · consolidado en C$1 de ventas', FUENTE_REAL, 'Precio, costo variable y costos fijos derivados de los estados de 2024 con la clasificación de Apalancamiento (75 % y 25 % variable). Requiere AGRI-CORP consolidado en Estados y Apalancamiento.'),
    agri('agricorp-arroz', 'AGRI-CORP · línea de arroz por saco', FUENTE_ARROZ, 'Precio C$ 900, costo variable C$ 650 y costos fijos C$ 450,000 en un mes de 4,200 sacos. ' + DETALLE_ARROZ),
    propio('actual','MUNO MODA · una prenda','C-V-U trimestral ficticio en C$.'),
    docente('tor-base','TOR · 100000 unidades','Practica_clase_TOR_Gitman_Resuelto.md','Precio 7.50, variable 3, fijos 250000. UM, moneda no identificada. Este módulo resuelve C-V-U; intereses y DAP pertenecen al análisis de apalancamiento.'),
    docente('tor-alto','TOR · 120000 unidades','Practica_clase_TOR_Gitman_Resuelto.md','Segundo escenario de la práctica: mismas condiciones y 120000 unidades. UM; no se convierte a córdobas.')],
  planeacion:[
    agri('agricorp', 'AGRI-CORP · presupuesto 2025 desde el cierre real de 2024', FUENTE_REAL, 'Cuatro trimestres en C$1 al costo: ventas +1.35 %, 50 % al contado, compras 40 % al contado, inventario final de 78.49 días (cierre 2024), IR 30 %. Aperturas reales de 2024; el 2025 auditado queda como contraste.'),
    agri('agricorp-arroz', 'AGRI-CORP · línea de arroz jul–sep 2027', FUENTE_ARROZ, 'Presupuesto mensual por sacos. ' + DETALLE_ARROZ),
    propio('actual','MUNO MODA · presupuesto trimestral','Presupuesto completo ficticio 2025 en C$. No representa los calendarios de La Pinolera.'),
    propio('contado','MUNO MODA · ventas al contado','Variante ficticia: todas las ventas se cobran al contado. Conserva las demás hipótesis y saldos del caso base.')],
  inventario:[
    agri('agricorp', 'AGRI-CORP · composición real y kárdex de granza', 'Notas de inventarios de F02, F03 y F04 y supuesto S16', 'Composición real por categoría 2022–2025 y kárdex de granza con cantidades supuestas a C$ 620 por quintal, anclado a los saldos reales de 2024 y 2025.'),
    agri('agricorp-arroz', 'AGRI-CORP · línea de arroz por saco', FUENTE_ARROZ, 'Sacos de arroz de 100 lb: compras y ventas de tres meses. ' + DETALLE_ARROZ),
    propio('actual','Tienda de prendas','Cuatro productos y ocho movimientos ficticios de enero de 2025.'),
    propio('bodega','Bodega sin movimientos','Los cuatro productos con sus existencias iniciales, para practicar entradas y salidas desde cero movimientos.')],
  presupuesto:[propio('actual','Salario y trabajo independiente','Ingresos ficticios 22500 y gastos 17200; meta de ahorro 36000 en 12 meses.'),
    propio('salario','Solo salario','Variante ficticia sin ingreso ocasional: salario 18000, mismos gastos y meta; permite analizar un ahorro insuficiente.')],
  mercado:[
    agri('agricorp', 'AGRI-CORP · 476,176 acciones y precio ilustrativo', 'F03 nota 34 y supuesto S7', 'Acciones comunes reales de 2022 a 2025 y precio de C$ 100 por acción: número ilustrativo, no es una cotización.'),
    agri('agricorp-arroz', 'AGRI-CORP · línea de arroz', FUENTE_ARROZ, '100,000 acciones del escenario, sin precio de mercado. ' + DETALLE_ARROZ),
    propio('actual','Acciones y dividendos · caso base','Datos ficticios de acciones para los dos últimos periodos cargados. No son datos bursátiles del ejercicio docente.'),
    propio('sin-dividendos','Sin dividendos','Variante ficticia: conserva las acciones/precios del caso base y declara dividendos cero; los resultados cero siguen visibles.')],
  inicioEmpresa:[
    agri('agricorp-historico', CONSOLIDADO, FUENTE_REAL, 'Los siete módulos de empresa con datos reales y supuestos declarados: estados 2022–2025, flujos publicados, apalancamiento, mercado, punto de equilibrio en C$1 de ventas, inventario y presupuesto 2025 con balance proforma contrastado con el 2025 real. Reemplaza todos los módulos de empresa.'),
    agri('agricorp-simulado', ARROZ, FUENTE_ARROZ, DETALLE_ARROZ + ' Reemplaza todos los módulos de empresa.'),
    propio('actual','Empresa comercial · caso integral','Carga módulos vacíos del caso ficticio MUNO MODA en C$. No reemplaza datos existentes.'),
    ...estados.filter(e => !e.id.startsWith('agricorp-') && e.id !== 'actual').map(e => ({ ...e, detalle:e.detalle + ' Desde Inicio carga solo Estados; los otros módulos quedan intactos.' }))],
  inicioPersonal:[propio('actual','Hogar con dos ingresos','Presupuesto y bienes ficticios, solo en módulos vacíos.'),
    { id:'agricorp', nombre:'Estudiante con dos ingresos', fuente:'AGRICORP_GFO_datos_reales_y_simulados_justificados.md · Sección IV',
      detalle:'Caso personal ficticio: ingresos 20500, gastos 17100 y ahorro planificado 2400 al mes. Solo en módulos vacíos.' },
    propio('salario','Hogar con un ingreso','Presupuesto ficticio de solo salario y los bienes del hogar, sin reemplazar módulos existentes.')]
};

export function listarEjemplos(modulo) { return structuredClone(LISTAS[modulo] || []); }

export function crearEjemplo(modulo, id, actual) {
  if (!LISTAS[modulo]?.some(e => e.id === id)) throw new Error('El ejemplo seleccionado no existe en esta sección.');
  if (['presupuestoEstudiantil','activos'].includes(modulo) && /^(presupuesto|activos)-/.test(id)) return ejemploPersonalDefensa(id);
  if (modulo === 'presupuestoEstudiantil') return id === 'actual' ? ejemploEstudiantil() : ejemploSoloTransporte();
  if (['estados','inicioEmpresa'].includes(modulo)) {
    if (id === 'baker') return ejemploBaker();
    if (id === 'bartlett') return ejemploBartlett();
    if (id === 'bartlett-clase') return ejemploBartlettClase();
    if (id === 'practico2') return ejemploPractico2();
    if (modulo === 'estados' && id === 'agricorp-historico') return casoHistoricoReal().estados;
    if (modulo === 'estados' && id === 'agricorp-simulado') return casoOperativoSimulado().estados;
    if (modulo === 'estados') return completarEjemploMuno(actual());
  }
  if (modulo === 'flujo' && id.startsWith('agricorp-')) return { moneda:'C$', ...flujoRealAgricorp(id.slice('agricorp-'.length)) };
  if (modulo === 'flujo' && id !== 'actual') {
    const baker = id === 'baker-directo';
    const filas = baker ? [
      ['Cobros a clientes','operacion','entrada',1800], ['Pagos a proveedores','operacion','salida',500],
      ['Gastos operativos pagados','operacion','salida',330], ['Intereses pagados','operacion','salida',70], ['Impuestos pagados','operacion','salida',120],
      ['Terreno y edificios','inversion','salida',150], ['Maquinaria y equipos','inversion','salida',150],
      ['Pago de documentos','financiamiento','salida',100], ['Deuda recibida','financiamiento','entrada',200], ['Dividendos pagados','financiamiento','salida',80]
    ] : [
      ['Cobros a clientes','operacion','entrada',2936], ['Pagos a proveedores','operacion','salida',1965],
      ['Gastos operativos pagados','operacion','salida',284], ['Intereses pagados','operacion','salida',93], ['Impuestos pagados','operacion','salida',94],
      ['Terreno y edificios','inversion','salida',169], ['Maquinaria y equipo','inversion','salida',173], ['Mobiliario','inversion','salida',42],
      ['Venta de vehículos','inversion','entrada',39], ['Otros activos','inversion','salida',2],
      ['Pago de documentos','financiamiento','salida',20], ['Deuda recibida','financiamiento','entrada',56],
      ['Acciones comunes','financiamiento','entrada',1], ['Aportaciones','financiamiento','entrada',10], ['Dividendos pagados','financiamiento','salida',108]
    ];
    return { moneda:'USD', saldoInicial:(baker ? 500 : 339)*1000, periodoBase:'',
      movimientos:filas.map(([concepto,actividad,tipo,monto], i) => ({ id:`${id}-${i}`,concepto,actividad,tipo,monto:monto*1000 })) };
  }
  const caso = id === 'agricorp' ? casoHistoricoReal() : id === 'agricorp-arroz' ? casoOperativoSimulado() : null;
  if (caso && modulo === 'equilibrio') return caso.equilibrio;
  if (caso && modulo === 'planeacion') return caso.planeacion.supuestos;
  if (caso && modulo === 'inventario') return caso.inventario;
  if (caso && modulo === 'mercado') return caso.razonesMercado;
  if (modulo === 'equilibrio' && id.startsWith('tor-')) return { moneda:'UM', precio:7.5,costoVariableUnitario:3,costosFijos:250000,
    unidades:id === 'tor-base' ? 100000 : 120000,utilidadObjetivo:null,escenario:{ precio:0,costoVariable:0,costosFijos:0,volumen:0 } };
  if (modulo === 'inicioPersonal' && id === 'agricorp') return presupuestoPersonalDemo();
  const datos = structuredClone(actual());
  if (modulo === 'planeacion' && id === 'contado') datos.pctContado = 1;
  if (modulo === 'inventario' && id === 'bodega') datos.movimientos = [];
  if (['presupuesto','inicioPersonal'].includes(modulo) && id === 'salario') {
    datos.ingresos = datos.ingresos.filter(i => i.tipo === 'regular'); datos.ingresoMensual = 18000;
  }
  if (modulo === 'mercado' && id === 'sin-dividendos') for (const p of Object.values(datos.periodos)) p.dividendos = 0;
  return datos;
}

// D-113: a qué caso pertenece un ejemplo, para avisar cuando se mezclan empresas entre módulos.
export function casoDeEjemplo(modulo, id) {
  const ejemplo = LISTAS[modulo]?.find(e => e.id === id);
  if (!ejemplo) return null;
  if (ejemplo.grupo !== 'AGRI-CORP') return { caso: 'otro', nombre: ejemplo.nombre };
  return ['agricorp-simulado', 'agricorp-arroz'].includes(id)
    ? { caso: 'agricorp-arroz', nombre: 'AGRI-CORP · línea de arroz (simulada)' }
    : { caso: 'agricorp-consolidado', nombre: 'AGRI-CORP · consolidado' };
}
