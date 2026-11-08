import { ejemploBaker, ejemploBartlett, ejemploPractico2, completarEjemploMuno } from './ejemplos-estados.js';

const propio = (id, nombre, detalle) => ({ id, nombre, fuente:'Ejemplo ficticio de la app', detalle });
const docente = (id, nombre, fuente, detalle) => ({ id, nombre, fuente:`Ejercicios_AFOD.zip · ${fuente}`, detalle });
const estados = [
  propio('actual','MUNO MODA · integral','Incluye ventas a crédito y pagos ficticios declarados. Las 24 razones están disponibles en 2024; 2023 es la base comparativa. C$.'),
  docente('baker','Baker Corporation','Baker Completo.md','BG 2011–2012 y ER 2012. USD: se multiplican por 1000 las cifras en miles de la fuente. Documentos corrientes según su ubicación en la fuente; no hay ER 2011 ni datos de ventas a crédito. DAP 10000 no es gasto del ER.'),
  docente('bartlett','Bartlett Company','Bartlley Company.md','BG/ER 2011–2012. USD convertidos desde miles. Valores negociables incluidos en equivalentes según la comprobación de efectivo de la fuente. No se inventan datos de crédito. DAP 10000 no es gasto.'),
  docente('practico2','Ejercicio práctico 2','Ejercicio practico 2.md','BG y ER 2023–2024. UM: la fuente usa $ sin identificar moneda. PPE ya neto; no se añade depreciación. No da ventas a crédito ni pagos a proveedores.')
];
const LISTAS = {
  estados,
  flujo:[propio('actual','MUNO MODA · flujo anual','Movimientos ficticios de caja en C$.'),
    docente('baker-directo','Baker · método directo','Baker Completo.md','Flujo resuelto 2012: CFO 780000, inversión −300000 y financiamiento 20000. USD; fuente en miles. No es una estimación desde saldos.'),
    docente('bartlett-directo','Bartlett · método directo','Bartlley Company.md','Flujo resuelto 2012: CFO 500000, inversión −347000 y financiamiento −61000. USD; fuente en miles.')],
  equilibrio:[propio('actual','MUNO MODA · una prenda','C-V-U trimestral ficticio en C$.'),
    docente('tor-base','TOR · 100000 unidades','Practica_clase_TOR_Gitman_Resuelto.md','Precio 7.50, variable 3, fijos 250000. UM, moneda no identificada. Este módulo resuelve C-V-U; intereses y DAP pertenecen al análisis de apalancamiento.'),
    docente('tor-alto','TOR · 120000 unidades','Practica_clase_TOR_Gitman_Resuelto.md','Segundo escenario de la práctica: mismas condiciones y 120000 unidades. UM; no se convierte a córdobas.')],
  planeacion:[propio('actual','MUNO MODA · presupuesto trimestral','Presupuesto completo ficticio 2025 en C$. No representa los calendarios de La Pinolera.'),
    propio('contado','MUNO MODA · ventas al contado','Variante ficticia: todas las ventas se cobran al contado. Conserva las demás hipótesis y saldos del caso base.')],
  inventario:[propio('actual','Tienda de prendas','Cuatro productos y ocho movimientos ficticios de enero de 2025.'),
    propio('bodega','Bodega sin movimientos','Los cuatro productos con sus existencias iniciales, para practicar entradas y salidas desde cero movimientos.')],
  presupuesto:[propio('actual','Salario y trabajo independiente','Ingresos ficticios 22500 y gastos 17200; meta de ahorro 36000 en 12 meses.'),
    propio('salario','Solo salario','Variante ficticia sin ingreso ocasional: salario 18000, mismos gastos y meta; permite analizar un ahorro insuficiente.')],
  mercado:[propio('actual','Acciones y dividendos · caso base','Datos ficticios de acciones para los dos últimos periodos cargados. No son datos bursátiles del ejercicio docente.'),
    propio('sin-dividendos','Sin dividendos','Variante ficticia: conserva las acciones/precios del caso base y declara dividendos cero; los resultados cero siguen visibles.')],
  inicioEmpresa:[propio('actual','Empresa comercial · caso integral','Carga módulos vacíos del caso ficticio MUNO MODA en C$. No reemplaza datos existentes.'),
    ...estados.slice(1).map(e => ({ ...e, detalle:e.detalle + ' Desde Inicio carga solo Estados; los otros módulos quedan intactos.' }))],
  inicioPersonal:[propio('actual','Hogar con dos ingresos','Presupuesto y bienes ficticios, solo en módulos vacíos.'),
    propio('salario','Hogar con un ingreso','Presupuesto ficticio de solo salario y los bienes del hogar, sin reemplazar módulos existentes.')]
};

export function listarEjemplos(modulo) { return structuredClone(LISTAS[modulo] || []); }

export function crearEjemplo(modulo, id, actual) {
  if (!LISTAS[modulo]?.some(e => e.id === id)) throw new Error('El ejemplo seleccionado no existe en esta sección.');
  if (['estados','inicioEmpresa'].includes(modulo)) {
    if (id === 'baker') return ejemploBaker();
    if (id === 'bartlett') return ejemploBartlett();
    if (id === 'practico2') return ejemploPractico2();
    if (modulo === 'estados') return completarEjemploMuno(actual());
  }
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
  if (modulo === 'equilibrio' && id.startsWith('tor-')) return { moneda:'UM', precio:7.5,costoVariableUnitario:3,costosFijos:250000,
    unidades:id === 'tor-base' ? 100000 : 120000,utilidadObjetivo:null,escenario:{ precio:0,costoVariable:0,costosFijos:0,volumen:0 } };
  const datos = structuredClone(actual());
  if (modulo === 'planeacion' && id === 'contado') datos.pctContado = 1;
  if (modulo === 'inventario' && id === 'bodega') datos.movimientos = [];
  if (['presupuesto','inicioPersonal'].includes(modulo) && id === 'salario') {
    datos.ingresos = datos.ingresos.filter(i => i.tipo === 'regular'); datos.ingresoMensual = 18000;
  }
  if (modulo === 'mercado' && id === 'sin-dividendos') for (const p of Object.values(datos.periodos)) p.dividendos = 0;
  return datos;
}
