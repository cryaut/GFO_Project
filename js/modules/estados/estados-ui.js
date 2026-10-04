import { ACCOUNT_TYPES, computeFinancialTotals, validateFinancialData, inferAccountType } from './estados-calculations.js';
import { normalizeFinancialData } from './estados-normalize.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrency } from '../../utils/format.js';
import { exportJSON, exportCSV } from '../../utils/export.js';
import { importStatementFile, tableTextToFinancialData, TABULAR_TEMPLATE_ROWS } from './estados-import.js';

const GROUPS = { activos: 'Activos', pasivos: 'Pasivos', patrimonio: 'Patrimonio', estadoResultados: 'Estado de Resultados' };
const LABELS = {
  efectivo: 'Efectivo', cxC: 'Cuentas por cobrar', inventario: 'Inventario',
  activosCorrientesOtros: 'Otros activos corrientes', activosFijos: 'Activos no corrientes',
  depreciacionAcumulada: 'Depreciación acumulada (negativa)', cuentasPorPagar: 'Cuentas por pagar operativas',
  pasivoCortoPlazo: 'Deuda financiera corriente', provisiones: 'Provisiones corrientes operativas',
  pasivoLargoPlazo: 'Pasivos no corrientes', patrimonio: 'Patrimonio', ventas: 'Ventas',
  costoVentas: 'Costo de ventas', gastosAdmin: 'Gastos administrativos', gastosVentas: 'Gastos de ventas',
  otrosIngresos: 'Otros ingresos', otrosGastos: 'Otros gastos', intereses: 'Gastos financieros', impuestos: 'Impuestos'
};
const emptyData = () => ({ name: 'Mi empresa', periods: [], balanceGeneral: {}, estadoResultados: {},
  accountTypes: { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {} } });
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
  // Opciones de lectura de importes: formato elegido y lista donde se acumulan los avisos.
  const importOptions = () => ({ decimal: numberFormat, avisos: [] });
  const avisoText = avisos => (avisos.length
    ? ` Atención: ${avisos.length} importe(s) ambiguo(s). ${avisos[0]}` : '');
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
    dirty = true;
    render();
    message(text);
  };

  function render() {
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Estados Financieros</h1>
      <p>1. Cargar o editar → 2. Revisar equilibrio → 3. Guardar → <a href="#/analisis">Analizar datos guardados</a></p></div>
      <div class="card mb-4"><div class="flex-gap flex-wrap">
        <button type="button" class="btn btn-secondary" id="newStates">Nuevo conjunto</button>
        <label class="btn btn-secondary">Importar archivo (.json, .csv, .xlsx) <input id="statesFile" type="file" accept=".json,.csv,.tsv,.txt,.xlsx,.xls,application/json,text/csv"></label>
        <button type="button" class="btn btn-secondary" id="templateStates">Descargar plantilla CSV</button>
        <button type="button" class="btn btn-secondary" id="demoStates">Cargar ejemplo</button>
        <button type="button" class="btn btn-secondary" id="downloadStates">Descargar borrador JSON</button>
        <button type="button" class="btn btn-primary" id="saveStates">Guardar estados</button>
      </div><p id="estadoMessage" role="status" aria-live="polite">${dirty ? 'Borrador sin guardar.' : 'Datos guardados. Edite o importe sus estados.'}</p>
      <label class="form-label" for="numberFormat">Formato de importes al importar CSV/Excel</label>
      <select class="form-select" id="numberFormat">
        <option value="auto" ${numberFormat === 'auto' ? 'selected' : ''}>Automático (recomendado)</option>
        <option value="." ${numberFormat === '.' ? 'selected' : ''}>Punto decimal: 1,234.50</option>
        <option value="," ${numberFormat === ',' ? 'selected' : ''}>Coma decimal: 1.234,50</option>
      </select>
      <p class="text-muted">Automático deduce el formato de todo el archivo y avisa de importes ambiguos como 45.000. Si su archivo usa el punto para miles, elija "Coma decimal".</p>
      <label class="form-label" for="companyName">Empresa</label><input class="form-input" id="companyName" maxlength="120" value="${esc(draft.name)}">
      <details class="mt-4"><summary>Formatos de importación admitidos y criterios</summary>
      <p><strong>Archivos:</strong> JSON (objeto con name, periods, balanceGeneral, estadoResultados y accountTypes, o {estados: …} exportado por Reportes), CSV/TSV delimitado y Excel .xlsx/.xls. La importación reemplaza el borrador, no combina periodos.</p>
      <p><strong>Tabla CSV/Excel (ancha):</strong> una fila por cuenta y una columna por periodo. Cabecera obligatoria <code>Cuenta</code>; opcionales <code>Estado</code> (Balance|Resultados), <code>Grupo</code> (activos|pasivos|patrimonio) y <code>Clasificacion</code>. Descargue la plantilla para verlo.</p>
      <p><strong>Tabla CSV (larga):</strong> columnas <code>Periodo</code>, <code>Estado</code>, <code>Grupo</code>, <code>Cuenta</code> e <code>Importe</code>. También puede pegar celdas copiadas de Excel con tabuladores.</p>
      <p><strong>Importes:</strong> 45.000, 45,000, C$ 12.500,50, (500) o 500- se interpretan correctamente. Gastos positivos; depreciación acumulada negativa. Celdas en blanco omiten la cuenta en ese periodo; las cuentas desconocidas requieren clasificación explícita.</p>
      <p>Los periodos se ordenan del más antiguo al más reciente. Moneda de presentación: C$. El equilibrio no garantiza exactitud; EFE y CNO son aproximaciones educativas.</p></details></div>
      <details class="card mb-4"><summary>Importar pegando celdas desde Excel</summary>
        <label class="form-label" for="pasteStates">Pegue la tabla incluyendo la fila de encabezados</label>
        <textarea class="form-input" id="pasteStates" rows="5" placeholder="Estado,Grupo,Cuenta,Clasificacion,2023,2024"></textarea>
        <button type="button" class="btn btn-secondary mt-2" id="importPaste">Importar tabla pegada</button>
      </details>
      <div class="card mb-4"><form id="periodForm" class="flex-gap flex-wrap">
        <label>Periodo nuevo <input class="form-input" name="period" required maxlength="40" placeholder="2025"></label>
        <button class="btn btn-secondary">Añadir periodo vacío</button></form>
        ${draft.periods.length ? `<label class="form-label" for="currentPeriod">Editar periodo</label>
        <select class="form-select" id="currentPeriod">${draft.periods.map((p, i) => `<option value="${i}" ${p === selected ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <form id="renamePeriod" class="flex-gap mt-4"><input class="form-input" name="period" aria-label="Nuevo nombre del periodo" required maxlength="40" value="${esc(selected)}"><button class="btn btn-secondary">Renombrar</button></form>
        <div class="flex-gap mt-4"><button class="btn btn-secondary" id="earlierPeriod">Mover antes</button><button class="btn btn-secondary" id="laterPeriod">Mover después</button><button class="btn btn-danger" id="deletePeriod">Eliminar periodo</button></div>` : '<p>No hay periodos. Añada uno para empezar, sin necesidad de cargar el ejemplo.</p>'}</div>
      <div id="accountEditor"></div><div id="balanceCheck" aria-live="polite"></div>
      <h2 class="mt-4">Vista multiperiodo del borrador</h2><div id="statementPreview"></div>`;
    renderAccounts();
    guard(renderPreview);
    bind();
  }

  const options = (group, current = '') => ACCOUNT_TYPES[group].map(type =>
    `<option value="${type}" ${type === current ? 'selected' : ''}>${LABELS[type]}</option>`).join('');

  function renderAccounts() {
    const el = page.querySelector('#accountEditor');
    if (!selected) { el.innerHTML = ''; return; }
    el.innerHTML = Object.entries(GROUPS).map(([group, label]) => {
      const accounts = accountsFor(draft, selected, group);
      return `<section class="card mb-4" data-group="${group}"><h2>${label} — ${esc(selected)}</h2>
        <p>La clasificación de una cuenta se comparte entre periodos.</p>
        <div class="table-wrapper"><table><thead><tr><th>Cuenta</th><th>Importe</th><th>Clasificación</th><th>Acción</th></tr></thead><tbody>
        ${Object.entries(accounts).map(([name, value], i) => `<tr data-account="${i}"><td>${esc(name)}</td>
          <td><input class="form-input" data-amount type="number" step="any" required aria-label="Importe ${esc(name)}" value="${value}"></td>
          <td><select class="form-select" data-type aria-label="Clasificación ${esc(name)}">${options(group, draft.accountTypes[group][name] || inferAccountType(group, name))}</select></td>
          <td><button class="btn btn-danger btn-sm" data-remove type="button" aria-label="Eliminar ${esc(name)}">Eliminar</button></td></tr>`).join('')}
        </tbody></table></div>
        <form class="addAccount flex-gap flex-wrap mt-4"><label>Cuenta nueva <input class="form-input" name="account" required maxlength="120"></label>
          <label>Importe <input class="form-input" name="amount" type="number" step="any" required value="0"></label>
          <label>Clasificación <select class="form-select" name="type" required><option value="">Seleccionar…</option>${options(group)}</select></label>
          <button class="btn btn-secondary">Añadir cuenta</button></form></section>`;
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
          draft.accountTypes[group][name] = event.target.value;
          markDirty(); guard(renderPreview);
        };
        row.querySelector('[data-remove]').onclick = () => {
          delete accountsFor(draft, selected, group)[name];
          markDirty(); renderAccounts(); guard(renderPreview);
        };
      });
      section.querySelector('form').onsubmit = event => {
        event.preventDefault();
        guard(() => {
          const fields = new FormData(event.target);
          const name = fields.get('account').trim();
          if (Object.hasOwn(accountsFor(draft, selected, group), name)) throw new Error('Esa cuenta ya existe en este periodo.');
          const candidate = structuredClone(draft);
          Object.defineProperty(accountsFor(candidate, selected, group), name, { value: fields.get('amount'), enumerable: true, configurable: true, writable: true });
          Object.defineProperty(candidate.accountTypes[group], name, { value: fields.get('type'), enumerable: true, configurable: true, writable: true });
          draft = normalizeFinancialData(candidate);
          markDirty(); renderAccounts(); renderPreview();
        });
      };
    });
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
        markDirty(); render();
      });
    };
    const move = offset => guard(() => {
      const to = draft.periods.indexOf(selected) + offset;
      if (to < 0 || to >= draft.periods.length) return;
      [draft.periods[to], draft.periods[to - offset]] = [draft.periods[to - offset], draft.periods[to]];
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
        if (draft.periods.includes(period) && period !== selected) throw new Error('Ese periodo ya existe.');
        draft = normalizeFinancialData(candidate);
        selected = period;
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
        draft = normalizeFinancialData(candidate);
        selected = draft.periods[0] || '';
        markDirty(); render();
      });
    });
    page.querySelector('#currentPeriod')?.addEventListener('change', event => {
      selected = draft.periods[Number(event.target.value)];
      render();
    });
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
        replaceDraft(imported, `${file.name} importado al borrador. Revise el equilibrio y pulse Guardar.${avisoText(options.avisos)}`);
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
        replaceDraft(imported, `Tabla pegada importada al borrador. Revise el equilibrio y pulse Guardar.${avisoText(options.avisos)}`);
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

  function renderPreview() {
    const preview = page.querySelector('#statementPreview');
    const check = page.querySelector('#balanceCheck');
    preview.innerHTML = '';
    check.textContent = 'Complete importes válidos para calcular el borrador.';
    const normalized = normalizeFinancialData(draft);
    const validation = validateFinancialData(normalized);
    if (validation.length) check.innerHTML = validation.map(row => `<p class="${row.balanced ? 'text-success' : 'text-danger'}">${esc(row.period)}: ${row.balanced ? 'Balance equilibrado' : 'Balance descuadrado'} — Activos ${formatCurrency(row.totalActivos)}; Pasivos + Patrimonio ${formatCurrency(row.totalPasivos + row.totalPatrimonio)}; diferencia ${formatCurrency(row.difference)}</p>`).join('');
    const table = (label, rows) => `<h3>${label}</h3><div class="table-wrapper mb-4"><table><thead><tr><th>Cuenta</th>${draft.periods.map(p => `<th>${esc(p)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name, values]) => `<tr><td>${esc(name)}</td>${values.map(v => `<td>${formatCurrency(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    preview.innerHTML = Object.entries(GROUPS).map(([group, label]) => {
      const names = [...new Set(draft.periods.flatMap(p => Object.keys(accountsFor(normalized, p, group))))];
      return table(label, names.map(name => [name, draft.periods.map(p => accountsFor(normalized, p, group)[name] || 0)]));
    }).join('') + table('Totales compartidos', [
      ['Total activos', 'totalActivos'], ['Total pasivos', 'totalPasivos'],
      ['Total patrimonio', 'totalPatrimonio'], ['Utilidad bruta', 'utilidadBruta'], ['Utilidad neta', 'utilidadNeta']
    ].map(([label, key]) => [label, draft.periods.map(p => computeFinancialTotals(normalized, p)[key])]));
  }

  render();
}

