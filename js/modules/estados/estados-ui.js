import { estadosResueltos } from './estados-presentacion-calculations.js';
import { etiquetaFilaEstado, tablasEstadosResueltos, separarCuentasOpcionales, desplegableCuentasOpcionales } from './estados-presentacion-ui.js';
import { ACCOUNT_TYPES, validateFinancialData, inferAccountType,
  seleccionarPeriodos, MAXIMO_PERIODOS_VISIBLES } from './estados-calculations.js';
import { normalizeFinancialData, ordenarPeriodos } from './estados-normalize.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrency, formatCurrencyND } from '../../utils/format.js';
import { exportJSON, exportCSV } from '../../utils/export.js';
import { importStatementFile, tableTextToFinancialData, TABULAR_TEMPLATE_ROWS } from './estados-import.js';
import { identificarCuenta, resumenIdentificacion, obtenerCuenta, consultarMontoCuenta } from './cuentas-identificador.js';
import { registrarCuenta } from './cuentas-registro.js';
import { selectorCuenta, renderRevisionCuentas } from './cuentas-ui.js';

const GROUPS = { activos: 'Activos', pasivos: 'Pasivos', patrimonio: 'Patrimonio', estadoResultados: 'Estado de Resultados' };
const SUPLEMENTARIOS_ROTACION = [
  { id: 'supp.credit_sales', campo: 'ventasCredito' },
  { id: 'supp.supplier_payments', campo: 'pagosProveedores' }
];
const LABELS = {
  efectivo: 'Efectivo', cxC: 'Cuentas por cobrar', inventario: 'Inventario',
  activosCorrientesOtros: 'Otros activos corrientes', activosFijos: 'Activos no corrientes',
  depreciacionAcumulada: 'Depreciación acumulada (negativa)', cuentasPorPagar: 'Cuentas por pagar operativas',
  pasivoCortoPlazo: 'Deuda financiera corriente', provisiones: 'Provisiones corrientes operativas',
  pasivoLargoPlazo: 'Pasivos no corrientes', patrimonio: 'Patrimonio', ventas: 'Ventas',
  deduccionesVentas: 'Deducciones de ventas (devoluciones, descuentos y rebajas)',
  costoVentas: 'Costo de ventas', gastosAdmin: 'Gastos administrativos', gastosVentas: 'Gastos de ventas',
  otrosIngresos: 'Otros ingresos', otrosGastos: 'Otros gastos', intereses: 'Gastos financieros', impuestos: 'Impuestos'
};
const emptyData = () => ({ name: 'Mi empresa', periods: [], balanceGeneral: {}, estadoResultados: {},
  accountTypes: { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {} }, composicionIngresos: {} });
const accountsFor = (data, period, group) => group === 'estadoResultados'
  ? data.estadoResultados[period] : data.balanceGeneral[period][group];

export function estadosUI(page, { initial, demo, save }) {
  let draft;
  let initialError = '';
  try { draft = normalizeFinancialData(initial); }
  catch (error) { draft = emptyData(); initialError = `No se pudieron editar los datos guardados: ${error.message}. No se han borrado.`; }
  let selected = draft.periods[0] || '';
  let dirty = false;
  let numberFormat = 'auto';
  // D-065: periodos visibles elegidos en la sesión; null usa los predeterminados.
  // No se guarda en el store: los cálculos siempre usan todos los periodos.
  let seleccionVisibles = null;
  const periodosOrdenados = () => ordenarPeriodos(draft.periods);
  const periodosVisibles = () => seleccionarPeriodos({
    periodos: periodosOrdenados(), seleccion: seleccionVisibles, maximo: MAXIMO_PERIODOS_VISIBLES
  });
  // Opciones de lectura de importes: formato elegido y lista donde se acumulan los avisos.
  const importOptions = () => ({ decimal: numberFormat, avisos: [] });
  const avisoText = avisos => {
    if (!avisos.length) return '';
    const importes = avisos.filter(aviso => aviso.includes('se leyó como')).length;
    const otros = avisos.length - importes;
    return ` Atención: ${importes ? `${importes} importe(s) ambiguo(s)${otros ? `; ${otros} aviso(s) de lectura` : ''}`
      : `${otros} aviso(s) de lectura`}. ${avisos[0]}`;
  };
  const resumenText = data => {
    const resumen = resumenIdentificacion(data);
    return ` ${resumen.reconocida} reconocidas; ${resumen.sugerida} sugeridas; ${resumen.no_reconocida} no reconocidas.`;
  };
  const markDirty = () => { dirty = true; message('Borrador sin guardar.'); };
  const message = (text, error = false) => {
    const el = page.querySelector('#estadoMessage');
    el.textContent = text;
    el.className = error ? 'text-danger' : 'text-muted';
  };
  const guard = action => {
    try { action(); } catch (error) { message(error.message, true); }
  };
  const replaceDraft = (data, text) => {
    if ((dirty || draft.periods.length) && !window.confirm('¿Reemplazar el borrador completo? Los datos guardados no cambian hasta pulsar Guardar.')) return;
    draft = data;
    selected = draft.periods[0] || '';
    seleccionVisibles = null;
    dirty = true;
    render();
    message(text);
  };

  function render() {
    const { visibles, puedeAgregar } = periodosVisibles();
    const ordenados = periodosOrdenados();
    const casillas = ordenados.map(p => {
      const marcado = visibles.includes(p);
      return `<label><input type="checkbox" data-periodo value="${esc(p)}" ${marcado ? 'checked' : ''} ${!marcado && !puedeAgregar ? 'disabled' : ''}> ${esc(p)}</label>`;
    }).join('');
    const selectorPeriodos = ordenados.length > 1
      ? `<div class="states-visible-periods" id="periodSelector"><p><strong>Periodos visibles</strong>
          <span class="text-muted" id="periodSelectorCount">${visibles.length} de ${MAXIMO_PERIODOS_VISIBLES} seleccionados</span></p>
        <div class="flex-gap flex-wrap">${casillas}</div>
        ${!puedeAgregar ? '<p class="text-muted">Máximo 4 periodos</p>' : ''}
        <button type="button" class="btn btn-secondary mt-2" id="defaultPeriods">Predeterminados</button></div>`
      : '';
    page.innerHTML = `<div class="states-workspace">
      <header class="page-header states-header"><div><h1 class="page-title">Estados Financieros</h1>
        <p class="page-subtitle">Cargue o edite sus datos, revise el equilibrio y guarde los estados.</p></div>
        <a class="states-analysis-link" href="#/analisis">Analizar datos guardados <span aria-hidden="true">→</span></a>
      </header>
      <section class="states-document" aria-label="Empresa y guardado">
        <div class="states-company"><label class="form-label" for="companyName">Empresa</label>
          <input class="form-input" id="companyName" maxlength="120" value="${esc(draft.name)}"></div>
        <div class="states-save"><button type="button" class="btn btn-primary" id="saveStates">Guardar estados</button>
          <p class="form-hint">Publica el borrador para Análisis.</p></div>
        <p id="estadoMessage" role="status" aria-live="polite">${dirty ? 'Borrador sin guardar.' : 'Datos guardados. Edite o importe sus estados.'}</p>
      </section>
      <div class="states-setup">
      <details class="states-panel" id="statesImportPanel"${draft.periods.length ? '' : ' open'}>
        <summary><span>Cargar datos</span><small>Archivo, tabla de Excel o nuevo conjunto</small></summary>
        <div class="states-panel-body">
        <div class="states-field"><label class="form-label" for="statesFile">Importar archivo (.json, .csv, .xlsx)</label>
          <input class="form-input states-file-input" id="statesFile" type="file" accept=".json,.csv,.tsv,.txt,.xlsx,.xls,application/json,text/csv"></div>
        <div class="states-action-row"><button type="button" class="btn btn-secondary" id="templateStates">Descargar plantilla CSV</button></div>
        <details class="states-subpanel"><summary>Pegar celdas desde Excel</summary><div class="states-disclosure-content">
          <label class="form-label" for="pasteStates">Pegue la tabla incluyendo la fila de encabezados</label>
          <textarea class="form-input" id="pasteStates" rows="5" placeholder="Estado,Grupo,Cuenta,Clasificacion,2023,2024"></textarea>
          <div class="states-action-row"><button type="button" class="btn btn-secondary" id="importPaste">Importar tabla pegada</button></div>
        </div></details>
        <details class="states-subpanel"><summary>Formato de importes y ayuda</summary><div class="states-disclosure-content states-import-help">
      <label class="form-label" for="numberFormat">Formato de importes al importar CSV/Excel</label>
      <select class="form-select" id="numberFormat">
        <option value="auto" ${numberFormat === 'auto' ? 'selected' : ''}>Automático (recomendado)</option>
        <option value="." ${numberFormat === '.' ? 'selected' : ''}>Punto decimal: 1,234.50</option>
        <option value="," ${numberFormat === ',' ? 'selected' : ''}>Coma decimal: 1.234,50</option>
      </select>
      <p class="text-muted">Automático deduce el formato de todo el archivo y avisa de importes ambiguos como 45.000. Si su archivo usa el punto para miles, elija "Coma decimal".</p>
      <details class="states-subpanel"><summary>Formatos de importación admitidos y criterios</summary><div class="states-disclosure-content">
      <p><strong>Archivos:</strong> JSON (objeto con name, periods, balanceGeneral, estadoResultados y accountTypes, o {estados: …} exportado por Reportes), CSV/TSV delimitado y Excel .xlsx/.xls. La importación reemplaza el borrador, no combina periodos.</p>
      <p><strong>Tabla CSV/Excel (ancha):</strong> una fila por cuenta y una columna por periodo. Cabecera obligatoria <code>Cuenta</code>; opcionales <code>Estado</code> (Balance|Resultados), <code>Grupo</code> (activos|pasivos|patrimonio), <code>Clasificacion</code> e <code>id</code> del catálogo. Descargue la plantilla para verlo.</p>
      <p><strong>Tabla CSV (larga):</strong> columnas <code>Periodo</code>, <code>Estado</code>, <code>Grupo</code>, <code>Cuenta</code> e <code>Importe</code>. También puede pegar celdas copiadas de Excel con tabuladores.</p>
      <p><strong>Importes:</strong> 45.000, 45,000, C$ 12.500,50, (500) o 500- se interpretan correctamente. Gastos positivos; depreciación acumulada negativa. Celdas en blanco omiten la cuenta en ese periodo; las cuentas desconocidas se conservan para revisión.</p>
      <p>Los periodos se ordenan del más antiguo al más reciente. Moneda de presentación: C$. El equilibrio no garantiza exactitud; EFE y CNO son aproximaciones educativas.</p></div></details>
        </div></details>
        <details class="states-subpanel"><summary>Nuevo conjunto o ejemplo</summary><div class="states-disclosure-content">
          <div class="states-action-row"><button type="button" class="btn btn-secondary" id="newStates">Nuevo conjunto</button>
            <button type="button" class="btn btn-secondary" id="demoStates">Cargar ejemplo</button></div>
        </div></details>
        </div>
      </details>
      <section class="states-period-panel" aria-labelledby="statesPeriodTitle"><h2 id="statesPeriodTitle">Periodo de trabajo</h2>
        ${draft.periods.length ? `<label class="form-label" for="currentPeriod">Editar periodo</label>
        <select class="form-select" id="currentPeriod">${draft.periods.map((p, i) => `<option value="${i}" ${p === selected ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <details class="states-subpanel"><summary>Datos complementarios del periodo</summary><div class="states-disclosure-content">
        <label class="form-label" for="composicionIngresos">Otros ingresos del periodo ${esc(selected)}</label>
        <select class="form-select" id="composicionIngresos">
          <option value="sin_declarar" ${draft.composicionIngresos[selected] === 'sin_declarar' ? 'selected' : ''}>Sin declarar</option>
          <option value="excluye_intereses" ${draft.composicionIngresos[selected] === 'excluye_intereses' ? 'selected' : ''}>Excluyen los intereses ganados</option>
          <option value="incluye_intereses" ${draft.composicionIngresos[selected] === 'incluye_intereses' ? 'selected' : ''}>Incluyen los intereses ganados</option>
        </select>
        <fieldset class="states-supplementary"><legend>Datos para las rotaciones — ${esc(selected)}</legend>
          <p>Declare las ventas a crédito y los pagos a proveedores reales de este periodo. Deje vacío lo que no tenga: las razones que lo necesitan mostrarán N/D. Un cero declarado se conserva como cero.</p>
          ${SUPLEMENTARIOS_ROTACION.map(({ id, campo }) => `<label class="form-label" for="${campo}">${esc(obtenerCuenta(id).nombreCanonico)}</label>
            <input class="form-input" id="${campo}" type="number" step="any" value="${consultarMontoCuenta(draft, selected, id).valor ?? ''}">`).join('')}
        </fieldset></div></details>` : '<p class="form-hint">No hay periodos. Añada uno para empezar, sin necesidad de cargar el ejemplo.</p>'}
        <details class="states-subpanel"${draft.periods.length ? '' : ' open'}><summary>Administrar periodos</summary><div class="states-disclosure-content">
          <form id="periodForm" class="states-inline-form"><label class="form-label" for="statesNewPeriod">Periodo nuevo
            <input class="form-input" id="statesNewPeriod" name="period" required maxlength="40" placeholder="2025"></label>
            <button class="btn btn-secondary">Añadir periodo vacío</button></form>
          ${draft.periods.length ? `<form id="renamePeriod" class="states-inline-form"><label class="form-label" for="statesRenamePeriod">Nuevo nombre del periodo
            <input class="form-input" id="statesRenamePeriod" name="period" required maxlength="40" value="${esc(selected)}"></label>
            <button class="btn btn-secondary">Renombrar</button></form>
          <div class="states-period-order"><p class="form-label">Orden del periodo</p><div class="states-action-row">
            <button class="btn btn-secondary" id="earlierPeriod">Mover antes</button><button class="btn btn-secondary" id="laterPeriod">Mover después</button></div></div>
          <div class="states-danger-zone"><button class="btn btn-danger" id="deletePeriod">Eliminar periodo</button></div>` : ''}
        </div></details>
      </section></div>
      <div id="accountReview"></div><div id="accountEditor"></div>
      <section class="states-check" aria-labelledby="statesCheckTitle"><h2 id="statesCheckTitle">Revisar equilibrio</h2>
        <div id="balanceCheck" aria-live="polite"></div></section>
      <details class="states-panel states-preview"><summary><span>Vista multiperiodo del borrador</span><small>Comparar periodos y descargar</small></summary>
        <div class="states-panel-body">${selectorPeriodos}
          <div class="states-action-row states-export-row"><button type="button" class="btn btn-secondary" id="downloadStates">Descargar borrador JSON</button></div>
          <div id="statementPreview"></div></div>
      </details></div>`;
    renderAccounts();
    renderReview();
    guard(renderPreview);
    bindPeriodSelector();
    bind();
  }

  const options = (group, current = '') => ACCOUNT_TYPES[group].map(type =>
    `<option value="${type}" ${type === current ? 'selected' : ''}>${LABELS[type]}</option>`).join('');

  function renderAccounts() {
    const el = page.querySelector('#accountEditor');
    if (!selected) { el.innerHTML = ''; return; }
    const resueltos = estadosResueltos(draft, selected);
    const comparadas = draft.periods.map(p => {
      const estado = p === selected ? resueltos : estadosResueltos(draft, p);
      return new Map([...estado.balanceGeneral, ...estado.estadoResultados].map(f => [f.clave, f]));
    });
    el.innerHTML = Object.entries(GROUPS).map(([group, label]) => {
      const accounts = accountsFor(draft, selected, group);
      const filasGrupo = [...resueltos.balanceGeneral, ...resueltos.estadoResultados].filter(f => f.grupoId === group);
      const { visibles, opcionales } = separarCuentasOpcionales(filasGrupo, f => comparadas.map(m => m.get(f.clave)));
      const tabla = filas => `<div class="table-wrapper"><table><thead><tr><th>Cuenta</th><th>Importe</th><th>Clasificación</th><th>Acción</th></tr></thead><tbody>
        ${filas.map(fila => {
          const i = ['calculado', 'pendiente'].includes(fila.origen) ? -1 : Object.keys(accounts).indexOf(fila.cuenta);
          if (i < 0) return `<tr class="${fila.subtotal ? 'statement-subtotal' : ''}" data-readonly-key="${esc(fila.clave)}">${filaLectura(fila)}</tr>`;
          const catalogada = fila.id ? obtenerCuenta(fila.id) : null;
          const sinTipo = catalogada && !catalogada.tipoApp ? `Identificada: ${catalogada.clasificacion.replaceAll('_', ' ')}` : 'Pendiente';
          return `<tr data-account="${i}" class="${fila.subtotal ? 'statement-subtotal' : ''}"><td><span class="statement-label">${etiquetaFilaEstado(fila)}</span></td>
          <td><input class="form-input" data-amount type="number" step="any" required aria-label="Importe ${esc(fila.cuenta)}" value="${accounts[fila.cuenta]}"></td>
          <td><select class="form-select" data-type aria-label="Clasificación ${esc(fila.cuenta)}"><option value="">${esc(sinTipo)}</option>${options(group, draft.accountTypes[group][fila.cuenta] ?? inferAccountType(group, fila.cuenta))}</select></td>
          <td><button class="btn btn-danger btn-sm" data-remove type="button" aria-label="Eliminar ${esc(fila.cuenta)}">Eliminar</button></td></tr>`;
        }).join('')}
        </tbody></table></div>`;
      return `<details class="states-account-group" data-group="${group}"${filasGrupo.length ? ' open' : ''}>
        <summary><span>${label}</span><small>${Object.keys(accounts).length} cuenta(s) · ${esc(selected)}</small></summary>
        <div class="states-account-body">
        <p>La clasificación de una cuenta se comparte entre periodos.</p>
        ${tabla(visibles)}${desplegableCuentasOpcionales(opcionales, opcionales.length ? tabla(opcionales) : '')}
        <details class="states-subpanel states-add-account"><summary>Añadir cuenta</summary><div class="states-disclosure-content">
        <form class="addAccount states-add-form"><label>Cuenta nueva <input class="form-input" name="account" required maxlength="120"></label>
          <label>Importe <input class="form-input" name="amount" type="number" step="any" required value="0"></label>
          <div data-resolution aria-live="polite">Escriba el nombre para identificar la cuenta.</div>
          <button class="btn btn-secondary">Añadir cuenta</button></form></div></details>
        </div></details>`;
    }).join('');
    el.querySelectorAll('[data-group]').forEach(section => {
      const group = section.dataset.group;
      section.querySelectorAll('[data-account]').forEach(row => {
        const name = Object.keys(accountsFor(draft, selected, group))[Number(row.dataset.account)];
        row.querySelector('[data-amount]').oninput = event => {
          accountsFor(draft, selected, group)[name] = event.target.value;
          markDirty();
          guard(renderPreview);
        };
        row.querySelector('[data-type]').onchange = event => {
          guard(() => {
            const registros = draft.periods.filter(periodo => Object.hasOwn(accountsFor(draft, periodo, group), name))
              .map(periodo => ({ nombre: name, grupo: group, periodo, importe: accountsFor(draft, periodo, group)[name],
                clasificacion: event.target.value, reemplazar: true }));
            draft = registrarCuenta(draft, registros);
            markDirty(); renderAccounts(); renderReview(); renderPreview();
          });
        };
        row.querySelector('[data-remove]').onclick = () => {
          delete accountsFor(draft, selected, group)[name];
          markDirty(); renderAccounts(); renderReview(); guard(renderPreview);
        };
      });
      const formulario = section.querySelector('form');
      const entrada = formulario.querySelector('[name="account"]');
      entrada.oninput = () => selectorCuenta(formulario.querySelector('[data-resolution]'), entrada.value, group);
      formulario.onsubmit = event => {
        event.preventDefault();
        guard(() => {
          const fields = new FormData(event.target);
          const name = fields.get('account').trim();
          if (Object.hasOwn(accountsFor(draft, selected, group), name)) throw new Error('Esa cuenta ya existe en este periodo.');
          const resultado = identificarCuenta(name, { grupo: group });
          const id = resultado.id || fields.get('idCuenta');
          if (!id) throw new Error('Seleccione una cuenta del catálogo para confirmar.');
          draft = registrarCuenta(draft, { nombre: name, grupo: group, periodo: selected, importe: fields.get('amount'),
            id, confirmado: resultado.estado !== 'reconocida' });
          markDirty(); renderAccounts(); renderReview(); renderPreview();
        });
      };
    });
  }

  function renderReview() {
    renderRevisionCuentas(page.querySelector('#accountReview'), draft, data => {
      draft = data; markDirty(); renderAccounts(); renderReview(); guard(renderPreview);
    }, text => message(text, true));
  }

  // La selección vive solo en esta sesión: no marca el borrador como sucio.
  function bindPeriodSelector() {
    const contenedor = page.querySelector('#periodSelector');
    if (!contenedor) return;
    for (const casilla of page.querySelectorAll('input[data-periodo]')) {
      casilla.onchange = event => {
        const marcados = new Set(periodosVisibles().visibles);
        if (event.target.checked) marcados.add(event.target.value);
        else marcados.delete(event.target.value);
        seleccionVisibles = ordenadosQueExisten(marcados);
        render();
      };
    }
    page.querySelector('#defaultPeriods').onclick = () => {
      seleccionVisibles = null;
      render();
    };
  }

  function ordenadosQueExisten(marcados) {
    return periodosOrdenados().filter(p => marcados.has(p));
  }

  function bind() {
    page.querySelector('#companyName').oninput = event => {
      draft.name = event.target.value.trim() || 'Mi empresa';
      markDirty();
    };
    page.querySelector('#periodForm').onsubmit = event => {
      event.preventDefault();
      guard(() => {
        const period = new FormData(event.target).get('period').trim();
        if (draft.periods.includes(period)) throw new Error('Ese periodo ya existe.');
        const candidate = structuredClone(draft);
        candidate.periods.push(period);
        candidate.balanceGeneral[period] = { activos: {}, pasivos: {}, patrimonio: {} };
        candidate.estadoResultados[period] = {};
        draft = normalizeFinancialData(candidate);
        selected = period;
        seleccionVisibles = null;
        markDirty(); render();
      });
    };
    const move = offset => guard(() => {
      const to = draft.periods.indexOf(selected) + offset;
      if (to < 0 || to >= draft.periods.length) return;
      [draft.periods[to], draft.periods[to - offset]] = [draft.periods[to - offset], draft.periods[to]];
      seleccionVisibles = null;
      markDirty(); render();
    });
    page.querySelector('#earlierPeriod')?.addEventListener('click', () => move(-1));
    page.querySelector('#laterPeriod')?.addEventListener('click', () => move(1));
    page.querySelector('#renamePeriod')?.addEventListener('submit', event => {
      event.preventDefault();
      guard(() => {
        const period = new FormData(event.target).get('period').trim();
        if (period === selected) return;
        const candidate = structuredClone(draft);
        const from = candidate.periods.indexOf(selected);
        candidate.periods[from] = period;
        for (const statement of [candidate.balanceGeneral, candidate.estadoResultados]) {
          statement[period] = statement[selected];
          delete statement[selected];
        }
        for (const key of ['supplementaryAccounts', 'reportedTotals', 'composicionIngresos']) {
          if (candidate[key]?.[selected]) { candidate[key][period] = candidate[key][selected]; delete candidate[key][selected]; }
        }
        for (const fila of candidate.pendingAccounts || []) {
          if (Object.hasOwn(fila.importes, selected)) { fila.importes[period] = fila.importes[selected]; delete fila.importes[selected]; }
        }
        if (draft.periods.includes(period) && period !== selected) throw new Error('Ese periodo ya existe.');
        draft = normalizeFinancialData(candidate);
        selected = period;
        seleccionVisibles = null;
        markDirty(); render();
      });
    });
    page.querySelector('#deletePeriod')?.addEventListener('click', () => {
      if (!window.confirm(`¿Eliminar el periodo ${selected} del borrador?`)) return;
      guard(() => {
        const candidate = structuredClone(draft);
        candidate.periods = candidate.periods.filter(p => p !== selected);
        delete candidate.balanceGeneral[selected];
        delete candidate.estadoResultados[selected];
        for (const key of ['supplementaryAccounts', 'reportedTotals', 'composicionIngresos']) if (candidate[key]) delete candidate[key][selected];
        for (const fila of candidate.pendingAccounts || []) delete fila.importes[selected];
        candidate.pendingAccounts = candidate.pendingAccounts?.filter(fila => Object.keys(fila.importes).length);
        draft = normalizeFinancialData(candidate);
        selected = draft.periods[0] || '';
        seleccionVisibles = null;
        markDirty(); render();
      });
    });
    page.querySelector('#currentPeriod')?.addEventListener('change', event => {
      selected = draft.periods[Number(event.target.value)];
      render();
    });
    const composicionSelect = page.querySelector('#composicionIngresos');
    if (composicionSelect) composicionSelect.onchange = event => {
      draft.composicionIngresos[selected] = event.target.value;
      markDirty();
    };
    for (const { id, campo } of SUPLEMENTARIOS_ROTACION) {
      const entrada = page.querySelector(`#${campo}`);
      if (entrada) entrada.onchange = event => guard(() => {
        const candidato = structuredClone(draft);
        const nombres = Object.keys(candidato.supplementaryAccounts?.[selected] || {}).filter(nombre =>
          candidato.accountIdentities.suplementario[nombre]?.estado === 'reconocida'
          && candidato.accountIdentities.suplementario[nombre]?.idCuenta === id);
        for (const nombre of nombres) delete candidato.supplementaryAccounts[selected][nombre];
        draft = event.target.value === '' ? normalizeFinancialData(candidato)
          : registrarCuenta(candidato, { nombre: nombres[0] || obtenerCuenta(id).nombreCanonico,
            grupo: 'suplementario', periodo: selected, importe: event.target.value, id,
            confirmado: true, reemplazar: true });
        markDirty(); guard(renderPreview);
      });
    }
    page.querySelector('#newStates').onclick = () => replaceDraft(emptyData(), 'Borrador nuevo.');
    const formatSelect = page.querySelector('#numberFormat');
    if (formatSelect) formatSelect.onchange = event => { numberFormat = event.target.value || 'auto'; };
    page.querySelector('#demoStates').onclick = () => replaceDraft(normalizeFinancialData(demo), 'Ejemplo cargado como borrador. Recuerde revisar el equilibrio antes de guardar.');
    page.querySelector('#downloadStates').onclick = () => {
      try { exportJSON(normalizeFinancialData(draft), 'gfo-estados-borrador.json'); }
      catch (error) { message(error.message, true); }
    };
    page.querySelector('#statesFile').onchange = async event => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      message('Leyendo archivo…');
      try {
        const options = importOptions();
        const imported = await importStatementFile(file, options);
        replaceDraft(imported, `${file.name} importado al borrador.${resumenText(imported)} Revise las cuentas y pulse Guardar.${avisoText(options.avisos)}`);
      } catch (error) {
        message(error.message, true);
      }
    };
    page.querySelector('#templateStates').onclick = () => {
      try {
        const [header, ...rows] = TABULAR_TEMPLATE_ROWS;
        exportCSV(rows, header, 'gfo-plantilla-estados.csv');
        message('Plantilla CSV descargada.');
      } catch (error) {
        message(error.message, true);
      }
    };
    page.querySelector('#importPaste').onclick = () => {
      const textarea = page.querySelector('#pasteStates');
      if (!textarea.value.trim()) { message('Pegue primero la tabla de Excel.', true); return; }
      try {
        const options = { ...importOptions(), name: 'Datos pegados' };
        const imported = tableTextToFinancialData(textarea.value, options);
        textarea.value = '';
        replaceDraft(imported, `Tabla pegada importada al borrador.${resumenText(imported)} Revise las cuentas y pulse Guardar.${avisoText(options.avisos)}`);
      } catch (error) {
        message(error.message, true);
      }
    };
    page.querySelector('#saveStates').onclick = () => {
      try {
        const normalized = normalizeFinancialData(draft);
        if (!window.confirm('¿Guardar y publicar estos estados para Análisis?')) return;
        save(normalized);
        dirty = false;
        message('Datos guardados. Puede analizarlos en la sección Análisis.');
      } catch (error) {
        message(`No se pudo guardar: ${error.message}`, true);
      }
    };
    if (initialError) message(initialError, true);
  }

  function filaLectura(fila) {
    return `<td><span class="statement-label">${etiquetaFilaEstado(fila)}</span></td><td class="text-right font-mono">${formatCurrencyND(fila.valor)}</td><td colspan="2" class="text-muted">Resultado de lectura</td>`;
  }

  function renderPreview() {
    const preview = page.querySelector('#statementPreview');
    const check = page.querySelector('#balanceCheck');
    preview.innerHTML = '';
    // Un importe incompleto no debe dejar visible el subtotal anterior.
    page.querySelectorAll('[data-readonly-key]').forEach(row => {
      const cell = row.querySelector('td:nth-child(2)');
      if (cell) cell.textContent = 'N/D';
    });
    check.textContent = 'Complete importes válidos para calcular el borrador.';
    let normalized = draft;
    let validation = [];
    try {
      normalized = normalizeFinancialData(draft);
      validation = validateFinancialData(normalized);
    } catch (error) {
      check.textContent = `Complete los importes para guardar: ${error.message}`;
    }
    const actual = estadosResueltos(normalized, selected);
    const porClave = new Map([...actual.balanceGeneral, ...actual.estadoResultados].map(f => [f.clave, f]));
    page.querySelectorAll('[data-readonly-key]').forEach(row => {
      const fila = porClave.get(row.dataset.readonlyKey);
      if (fila) row.innerHTML = filaLectura(fila);
    });
    // La selección solo filtra las columnas; cada total se calcula igual con cualquier selección (D-065).
    const { visibles } = periodosVisibles();
    const mostrarMonto = valor => valor === null ? 'N/D' : formatCurrency(valor);
    if (validation.length) check.innerHTML = validation.map(row => `<p class="${row.balanced ? 'text-success' : 'text-danger'}">${esc(row.period)}: ${row.difference === null ? 'Comprobación incompleta: revise las cuentas pendientes' : row.balanced ? 'Balance equilibrado' : 'Balance descuadrado'} — Activos ${mostrarMonto(row.totalActivos)}; Pasivos + Patrimonio ${mostrarMonto(row.totalPasivos === null || row.totalPatrimonio === null ? null : row.totalPasivos + row.totalPatrimonio)}; diferencia ${mostrarMonto(row.difference)}${row.diagnostico ? `; ${esc(row.diagnostico)}` : ''}</p>`).join('');
    const table = (label, rows) => `<h3>${label}</h3><div class="table-wrapper mb-4"><table><thead><tr><th>Cuenta</th>${visibles.map(p => `<th>${esc(p)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name, values]) => `<tr><td>${esc(name)}</td>${values.map(v => `<td>${mostrarMonto(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    preview.innerHTML = tablasEstadosResueltos(normalized, visibles) + table('Datos suplementarios', [...new Set(Object.values(normalized.supplementaryAccounts || {}).flatMap(cuentas => Object.keys(cuentas)))].map(nombre => [
      nombre, visibles.map(periodo => normalized.supplementaryAccounts?.[periodo]?.[nombre] ?? null)
    ])) + table('Cuentas pendientes de grupo', (normalized.pendingAccounts || []).map(fila => [
      fila.nombre, visibles.map(periodo => fila.importes[periodo] ?? null)
    ]));
  }

  render();
}

