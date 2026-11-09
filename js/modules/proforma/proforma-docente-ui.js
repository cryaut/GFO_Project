import { leerNumero } from '../../utils/form.js';
import { formatCurrencyND, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { calcularBalanceDocente, calcularERDocente, calcularERResidualDocente } from './proforma-docente-calculations.js';
import { CASOS_PROFORMA_DOCENTE } from './proforma-docente-ejemplos.js';

const monto = valor => formatCurrencyND(valor, 'USD');
const BASE_ER = [
  ['ventasBase', 'Ventas de 2012'], ['costoBase', 'Costo de ventas de 2012'], ['gastosBase', 'Gastos operativos de 2012']
];
const CLASIFICACION = [
  ['costoFijo', 'Costo fijo de ventas'], ['costoVariable', 'Costo variable de ventas'],
  ['gastosFijos', 'Gastos operativos fijos'], ['gastosVariables', 'Gastos operativos variables']
];
const PROYECCION_ER = [
  ['ventasProyectadas', 'Ventas de 2013'], ['intereses', 'Intereses de 2013'], ['tasaIR', 'Tasa de IR de 2013', 'impuesto'],
  ['dividendos', 'Dividendos de 2013'], ['otrosOperativos', 'Otros ingresos operativos netos', 'signo'],
  ['otrosNoOperativos', 'Otros ingresos no operativos netos', 'signo']
];
const BALANCE = [
  ['ventasProyectadas', 'Ventas de 2013'], ['efectivoMinimo', 'Efectivo mínimo'], ['valoresNegociables', 'Valores negociables de 2012'],
  ['tasaCxC', 'Cuentas por cobrar / ventas', 'tasa'], ['tasaInventario', 'Inventario / ventas', 'tasa'],
  ['fijosNetosBase', 'Activos fijos netos de 2012'], ['compraMaquina', 'Compra de maquinaria'], ['depreciacion', 'Depreciación de 2013'],
  ['tasaCxP', 'Cuentas por pagar / ventas', 'tasa'], ['deudasAcumuladas', 'Deudas acumuladas de 2012'],
  ['otrosPasivosCorrientes', 'Otros pasivos corrientes de 2012'], ['deudaLargoPlazo', 'Deuda a largo plazo de 2012'],
  ['accionesComunes', 'Acciones comunes de 2012'], ['retenidasBase', 'Ganancias retenidas de 2012', 'signo'],
  ['tasaUtilidadNeta', 'Margen neto de 2013', 'tasa-signo'], ['dividendos', 'Dividendos de 2013']
];
const RESIDUAL = [
  ['inventarioInicial', 'Inventario de 2018'], ['inventarioFinal', 'Inventario de 2019'],
  ['rotacionObjetivo', 'Rotación objetivo del inventario', 'veces'], ['costoSobreVentas', 'Costo de ventas / ventas', 'impuesto'],
  ['utilidadObjetivo', 'Utilidad neta objetivo'], ['tasaIR', 'Tasa de IR proyectada', 'impuesto'],
  ['deudaPromedio', 'Deuda promedio'], ['tasaInteres', 'Tasa de interés', 'impuesto'],
  ['tasaVentasCredito', 'Ventas a crédito', 'impuesto'], ['tasaComprasCredito', 'Compras a crédito', 'impuesto'],
  ['cxcPromedio', 'CxC promedio'], ['cxpPromedio', 'CxP promedio'], ['activoFijoPromedio', 'Activo fijo neto promedio'],
  ['activoPromedio', 'Activo total promedio']
];

const idCampo = clave => 'proformaAFOD-' + clave;
const esTasa = tipo => tipo === 'impuesto' || tipo?.startsWith('tasa');
const entrada = (valor, tipo) => esTasa(tipo) ? Number((valor * 100).toFixed(10)) : valor;

function campo([clave, etiqueta, tipo], supuestos) {
  const id = idCampo(clave);
  const valor = entrada(supuestos[clave], tipo);
  return `<div class="form-group">
    <label for="${id}" class="form-label">${etiqueta} (${esTasa(tipo) ? '%' : tipo === 'veces' ? 'veces' : 'USD'})</label>
    <input class="form-input" id="${id}" inputmode="decimal" value="${esc(valor)}">
  </div>`;
}

function campos(titulo, grupo, supuestos) {
  return `<fieldset class="mb-4"><legend>${titulo}</legend>
    <div class="form-row">${grupo.map(fila => campo(fila, supuestos)).join('')}</div></fieldset>`;
}

function tabla(titulo, columnas, filas) {
  return `<section class="mb-4"><h3>${esc(titulo)}</h3><div class="table-wrapper">
    <table class="statement-table"><thead><tr><th scope="col">Concepto</th>
    ${columnas.map(nombre => `<th scope="col" class="text-right">${esc(nombre)}</th>`).join('')}</tr></thead>
    <tbody>${filas.map(([nombre, ...celdas]) => `<tr><th scope="row">${esc(nombre)}</th>
      ${celdas.map(([valor, desarrollo]) => `<td class="text-right">
        <strong class="font-mono">${monto(valor)}</strong><span class="desarrollo-operacion">${esc(desarrollo)}</span>
      </td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}

function aplicarTasa(ventas, tasa) {
  return `${monto(ventas)} × ${pct(tasa)}`;
}

function costoPorVentas(base, ventasBase, tasa, ventas, fijo, desglosado) {
  return `${monto(base)} ÷ ${monto(ventasBase)} = ${pct(tasa)}. ${desglosado ? monto(fijo) + ' + ' : ''}${aplicarTasa(ventas, tasa)}.`;
}

function mostrarResidual(s) {
  const r = calcularERResidualDocente(s);
  const actividad = [
    ['Rotación del inventario', 'RotInv', 'veces'], ['Edad del inventario', 'edadInventario', 'días'],
    ['Rotación de CxC', 'RotCxC', 'veces'], ['Periodo de cobro', 'PPC', 'días'],
    ['Rotación de CxP', 'rotacionCxP', 'veces'], ['Periodo de pago', 'plazoPago', 'días'],
    ['Rotación del activo fijo', 'rotacionActivosFijos', 'veces'], ['Rotación del activo total', 'rotacionActivos', 'veces'],
    ['Ciclo de conversión', 'cicloConversion', 'días']
  ];
  return tabla('ER proyectado 2019 por método residual', ['Proyección 2019 · USD'], [
    ['Ventas proyectadas', [r.ventas, `${monto(r.costo)} ÷ ${pct(s.costoSobreVentas)}`]],
    ['− Costo de ventas', [r.costo, `${monto(r.inventarioPromedio)} × ${formatNumberND(s.rotacionObjetivo)} veces`]],
    ['= Utilidad bruta', [r.bruta, `${monto(r.ventas)} − ${monto(r.costo)}`]],
    ['− Gastos operativos residuales', [r.gastos, `${monto(r.bruta)} − ${monto(r.uaii)}`]],
    ['= UAII', [r.uaii, `${monto(r.uai)} + ${monto(r.intereses)}`]],
    ['− Intereses', [r.intereses, aplicarTasa(s.deudaPromedio, s.tasaInteres)]],
    ['= UAI', [r.uai, `${monto(s.utilidadObjetivo)} ÷ (1 − ${pct(s.tasaIR)})`]],
    ['− IR', [r.ir, aplicarTasa(r.uai, s.tasaIR)]],
    ['= Utilidad neta', [r.neta, `${monto(r.uai)} − ${monto(r.ir)}`]],
    ['Ventas a crédito', [r.ventasCredito, aplicarTasa(r.ventas, s.tasaVentasCredito)]],
    ['Compras a crédito', [r.comprasCredito, `(${monto(r.costo)} + ${monto(s.inventarioFinal)} − ${monto(s.inventarioInicial)}) × ${pct(s.tasaComprasCredito)}`]]
  ]) + `<h3>Actividad del escenario proyectado</h3><ul>${actividad.map(([nombre, clave, unidad]) =>
    `<li>${esc(nombre)} · ${formatNumberND(r.actividad[clave])} ${unidad}</li>`).join('')}</ul>`;
}

function mostrarER(s, comparar) {
  const metodos = comparar ? ['porcentaje', 'fijo-variable'] : ['porcentaje'];
  const resultados = metodos.map(metodo => calcularERDocente(s, metodo));
  const celdas = (clave, desarrollo) => resultados.map((r, i) => [r[clave], desarrollo(r, i === 1)]);
  const filas = [
    ['Ventas proyectadas', ...celdas('ventas', () => 'Pronóstico declarado de 2013.')],
    ['− Costo de ventas', ...celdas('costo', (r, fv) =>
      costoPorVentas(fv ? s.costoVariable : s.costoBase, s.ventasBase, r.tasaCosto, r.ventas, r.fijoCosto, fv))],
    ['= Utilidad bruta', ...celdas('bruta', r => `${monto(r.ventas)} − ${monto(r.costo)}`)],
    ['− Gastos operativos', ...celdas('gastos', (r, fv) =>
      costoPorVentas(fv ? s.gastosVariables : s.gastosBase, s.ventasBase, r.tasaGastos, r.ventas, r.fijoGastos, fv))],
    ['+ Otros ingresos operativos netos', ...celdas('otrosOperativos', () => 'Importe declarado de 2013.')],
    ['= Utilidad operativa (UAII)', ...celdas('uaii', r => `${monto(r.bruta)} − ${monto(r.gastos)} + ${monto(r.otrosOperativos)}`)],
    ['+ Otros ingresos no operativos netos', ...celdas('otrosNoOperativos', () => 'Importe declarado de 2013.')],
    ['− Intereses', ...celdas('intereses', () => 'Gasto financiero previsto de 2013.')],
    ['= Utilidad antes de impuestos (UAI)', ...celdas('uai', r => `${monto(r.uaii)} + ${monto(r.otrosNoOperativos)} − ${monto(r.intereses)}`)],
    ['− Impuesto sobre la renta (IR)', ...celdas('ir', r => `Máx(0, ${monto(r.uai)}) × ${pct(r.tasaIR)}`)],
    ['= Utilidad neta', ...celdas('neta', r => `${monto(r.uai)} − ${monto(r.ir)}`)],
    ['− Dividendos en efectivo', ...celdas('dividendos', () => 'Distribución prevista después de impuestos.')],
    ['= Adición a ganancias retenidas', ...celdas('retenidas', r => `${monto(r.neta)} − ${monto(r.dividendos)}`)]
  ];
  const columnas = comparar ? ['Porcentaje de ventas', 'Fijo + variable'] : ['Porcentaje de ventas'];
  return tabla('Estado de resultados pro forma de 2013', columnas, filas) + (comparar
    ? '<p class="form-hint">La variante fijo + variable conserva los importes fijos declarados. Su estimación depende de que esa clasificación siga siendo válida para 2013.</p>'
    : '');
}

function mostrarBalance(s) {
  const r = calcularBalanceDocente(s);
  const a = r.activos;
  const p = r.pasivos;
  const pt = r.patrimonio;
  const columna = ['Proyección 2013'];
  const activos = [
    ['Efectivo', [a.efectivo, 'Efectivo mínimo declarado.']],
    ['Valores negociables', [a.valores, 'Importe de 2012 conservado.']],
    ['Cuentas por cobrar', [a.cxc, aplicarTasa(s.ventasProyectadas, s.tasaCxC)]],
    ['Inventario', [a.inventario, aplicarTasa(s.ventasProyectadas, s.tasaInventario)]],
    ['Total de activos corrientes', [a.corrientes, 'Efectivo + valores negociables + cuentas por cobrar + inventario.']],
    ['Activos fijos netos', [a.fijosNetos, `${monto(s.fijosNetosBase)} + ${monto(s.compraMaquina)} − ${monto(s.depreciacion)}`]],
    ['Total de activos', [a.total, `${monto(a.corrientes)} + ${monto(a.fijosNetos)}`]]
  ];
  const pasivosPatrimonio = [
    ['Cuentas por pagar', [p.cxp, aplicarTasa(s.ventasProyectadas, s.tasaCxP)]],
    ['Deudas acumuladas', [p.deudasAcumuladas, 'Importe de 2012 conservado.']],
    ['Otros pasivos corrientes', [p.otrosCorrientes, 'Importe de 2012 conservado.']],
    ['Total de pasivos corrientes', [p.corrientes, 'Cuentas por pagar + deudas acumuladas + otros pasivos corrientes.']],
    ['Deuda a largo plazo', [p.deudaLargoPlazo, 'Importe de 2012 conservado.']],
    ['Total de pasivos', [p.total, `${monto(p.corrientes)} + ${monto(p.deudaLargoPlazo)}`]],
    ['Acciones comunes', [pt.acciones, 'Importe de 2012 conservado.']],
    ['Utilidad neta prevista', [r.utilidadNeta, aplicarTasa(s.ventasProyectadas, s.tasaUtilidadNeta)]],
    ['Dividendos en efectivo', [s.dividendos, 'Distribución prevista después de impuestos.']],
    ['Adición a ganancias retenidas', [r.adicionRetenidas, `${monto(r.utilidadNeta)} − ${monto(s.dividendos)}`]],
    ['Ganancias retenidas al cierre', [pt.retenidas, `${monto(s.retenidasBase)} + ${monto(r.adicionRetenidas)}`]],
    ['Total de patrimonio', [pt.total, `${monto(pt.acciones)} + ${monto(pt.retenidas)}`]],
    ['Pasivos + patrimonio', [r.pasivosPatrimonio, `${monto(p.total)} + ${monto(pt.total)}`]]
  ];
  const financiacion = [
    ['Brecha del balance', [r.diferencia, `${monto(a.total)} − ${monto(r.pasivosPatrimonio)}`]],
    ['Financiamiento externo requerido', [r.financiamiento, `Máx(0, ${monto(r.diferencia)})`]],
    ['Exceso de recursos', [r.exceso, `Máx(0, −${monto(r.diferencia)})`]],
    ['Dividendo que equilibraría el balance', [r.dividendoSinFaltante, `${monto(s.dividendos)} − ${monto(r.diferencia)}`]],
    ['Faltante con dividendo cero', [r.faltanteSinDividendos, `Máx(0, ${monto(r.diferencia)} − ${monto(s.dividendos)})`]]
  ];
  return tabla('Activos', columna, activos) + tabla('Pasivos y patrimonio', columna, pasivosPatrimonio)
    + tabla('Conciliación del balance y ajuste de dividendos', columna, financiacion)
    + '<p class="form-hint">El financiamiento requerido es un saldo por cubrir. El dividendo de equilibrio es N/D si un dividendo de cero todavía deja un faltante o falta una premisa.</p>';
}

export function montarProformaDocente(panel) {
  if (!panel) return;
  panel.innerHTML = `<label class="form-label" for="proformaAFODCaso">Ejercicio AFOD</label>
    <select id="proformaAFODCaso" class="form-select">${Object.entries(CASOS_PROFORMA_DOCENTE)
      .map(([clave, caso]) => `<option value="${clave}">${esc(caso.nombre)}</option>`).join('')}</select>
    <div id="proformaAFODContenido"></div>`;
  const contenido = panel.querySelector('#proformaAFODContenido');
  const selector = panel.querySelector('#proformaAFODCaso');
  function renderizar(clave) {
    if (!Object.hasOwn(CASOS_PROFORMA_DOCENTE, clave)) return;
    const { tipo, supuestos } = CASOS_PROFORMA_DOCENTE[clave];
    const balance = tipo === 'balance';
    const comparar = tipo === 'comparativo';
    const residual = tipo === 'residual';
    const grupos = residual ? [['Premisas del escenario proyectado 2019', RESIDUAL]]
      : balance ? [['Premisas del balance por método crítico', BALANCE]] : [
      ['Base histórica de 2012', BASE_ER], ...(comparar ? [['Clasificación fija y variable de 2012', CLASIFICACION]] : []),
      ['Premisas de proyección de 2013', PROYECCION_ER]
    ];
    const resultado = s => residual ? mostrarResidual(s) : balance ? mostrarBalance(s) : mostrarER(s, comparar);
    const fuente = residual ? 'Fuente académica «Electronicas_analisis_financiero». La proyección anual de 2019 se presenta en USD a partir de la fuente en miles.'
      : 'Fuente académica «Ejercicios E.R proformas». Base 2012 y proyección anual 2013 en USD.';
    contenido.innerHTML = `<p class="form-hint">${fuente}
      Las premisas editadas son temporales y se reinician al cambiar de ejercicio o salir de Proforma.</p>
      <form id="proformaAFODForm">
        ${grupos.map(([titulo, grupo]) => campos(titulo, grupo, supuestos)).join('')}
        <button type="submit" class="btn btn-primary">Calcular ejercicio</button>
      </form><p id="proformaAFODAviso" class="form-hint" role="status"></p>
      <div id="proformaAFODResultado">${resultado(supuestos)}</div>`;
    contenido.querySelector('#proformaAFODForm').addEventListener('submit', evento => {
      evento.preventDefault();
      const invalidos = [];
      const editados = {};
      for (const [, grupo] of grupos) {
        for (const [campoClave, etiqueta, clase] of grupo) {
          const texto = contenido.querySelector('#' + idCampo(campoClave)).value;
          const { valor, vacio } = leerNumero(texto);
          const firmado = clase === 'signo' || clase === 'tasa-signo';
          const valido = valor !== null && !texto.includes('$') && (firmado || valor >= 0)
            && (clase !== 'impuesto' || valor <= 100);
          if (!vacio && !valido) invalidos.push(etiqueta);
          editados[campoClave] = valido ? valor / (esTasa(clase) ? 100 : 1) : null;
        }
      }
      contenido.querySelector('#proformaAFODAviso').textContent = invalidos.length
        ? `Revisa los valores de ${invalidos.join(', ')}. Sus resultados dependientes muestran N/D.`
        : 'Cálculo actualizado. Un campo vacío se trata como N/D.';
      contenido.querySelector('#proformaAFODResultado').innerHTML = resultado(editados);
    });
  }
  selector.addEventListener('change', () => renderizar(selector.value));
  renderizar('euro');
}
