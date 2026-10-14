import { ACCOUNT_TYPES, computeFinancialTotals, validateFinancialData, inferAccountType } from './estados-calculations.js';
import { normalizeFinancialData } from './estados-normalize.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrency } from '../../utils/format.js';
import { exportJSON, exportCSV } from '../../utils/export.js';
import { TABULAR_TEMPLATE_ROWS } from './estados-import.js';
import { ACCOUNT_LABELS as LABELS, GROUP_LABELS as GROUPS, normalizeAccountName, ACCOUNT_CATALOG, CATALOGO_VERSION } from './estados-catalogo.js';
import { prepareStatementImport, textToImportReview, evaluateImportReview, finalizeImportReview,
  updateImportClassification, updateImportAmount, updateImportName } from './estados-import-review.js';
import { IMPORT_AI_STATUS } from './estados-import-ia.js';

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
  let importSession = null;
  let importToken = 0;
  let reading = false;
  let statement = 'balance';
  let reviewFilter = 'all';
  let reviewSearch = '';
  let reviewPage = 0;
  // Opciones de lectura de importes: formato elegido y lista donde se acumulan los avisos.
  const importOptions = () => ({ decimal: numberFormat });
  const avisoText = avisos => (avisos.length
    ? ` Atención: ${avisos.length} aviso(s) de importación. ${avisos[0]}` : '');
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
    importSession = null;
    importToken++;
    reading = false;
    selected = draft.periods[0] || '';
    dirty = true;
    render();
    message(text);
  };

  function render() {
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Estados financieros</h1>
      <p class="page-subtitle">Organice sus cuentas y publique los datos que utilizará el análisis.</p>
      <ol class="states-workflow" aria-label="Flujo de trabajo"><li>Importar</li><li>Revisar y corregir</li><li>Guardar</li><li><a href="#/analisis">Analizar</a></li></ol></div>
      <section class="card mb-4 states-import-card"><h2>1. Importar datos</h2><p class="text-muted">Cargue un archivo o use la plantilla. La revisión se realiza antes de reemplazar el borrador.</p><div class="states-toolbar">
        <label class="btn btn-primary file-button">Importar archivo <input class="sr-only" id="statesFile" type="file" accept=".json,.csv,.tsv,.txt,.xlsx,.xls,application/json,text/csv"></label>
        <a class="btn btn-secondary" href="scripts/gfo-plantilla-estados.xlsx" download>Descargar plantilla Excel</a>
        <button type="button" class="btn btn-secondary" id="templateStates">Descargar plantilla CSV</button>
      </div><div class="states-secondary-actions"><span>Exportar</span><button type="button" class="btn btn-secondary" id="downloadStates">Exportar borrador JSON</button>
        <span>Otros datos</span><button type="button" class="btn btn-secondary" id="newStates">Nuevo conjunto</button>
        <button type="button" class="btn btn-secondary" id="demoStates">Cargar ejemplo</button>
      </div><div class="states-status"><p id="estadoMessage" role="status" aria-live="polite">${dirty ? 'Borrador sin guardar.' : 'Datos guardados. Edite o importe sus estados.'}</p></div>
      <div class="form-group">
      <label class="form-label" for="numberFormat">Formato de importes al importar CSV/Excel</label>
      <select class="form-select" id="numberFormat">
        <option value="auto" ${numberFormat === 'auto' ? 'selected' : ''}>Automático (recomendado)</option>
        <option value="." ${numberFormat === '.' ? 'selected' : ''}>Punto decimal: 1,234.50</option>
        <option value="," ${numberFormat === ',' ? 'selected' : ''}>Coma decimal: 1.234,50</option>
      </select>
      <p class="form-hint">Automático deduce el formato de todo el archivo y avisa de importes ambiguos como 45.000. Si su archivo usa el punto para miles, elija "Coma decimal".</p></div>
      <div class="form-group"><label class="form-label" for="companyName">Empresa</label><input class="form-input" id="companyName" maxlength="120" value="${esc(draft.name)}"></div>
      <details class="mt-4"><summary>Formatos de importación admitidos y criterios</summary>
      <p><strong>Archivos:</strong> JSON (objeto con name, periods, balanceGeneral, estadoResultados y accountTypes, o {estados: …} exportado por Reportes), CSV/TSV delimitado y Excel .xlsx/.xls. La importación reemplaza el borrador, no combina periodos.</p>
      <p><strong>Tabla CSV/Excel (ancha):</strong> una fila por cuenta y una columna por periodo (2023, 2024 o 2024-T1). Cabecera obligatoria <code>Cuenta</code>; opcionales <code>Estado</code> (Estado de situación financiera|Estado de resultados), <code>Grupo</code> (Activos|Pasivos|Patrimonio) y <code>Clasificacion</code>. Balance y Resultados siguen siendo válidos.</p>
      <p><strong>Tabla CSV (larga):</strong> columnas <code>Periodo</code>, <code>Estado</code>, <code>Grupo</code>, <code>Cuenta</code> e <code>Importe</code>. También puede pegar celdas copiadas de Excel con tabuladores.</p>
      <p><strong>Importes:</strong> elija el separador decimal si el formato es ambiguo (45.000 puede significar 45 o 45 mil). Gastos positivos; depreciación acumulada negativa. Las celdas vacías se conservan como datos ausentes. Puede clasificar las cuentas desconocidas en la revisión.</p>
      <p>Los subtotales reconocidos se excluyen y se muestran en la revisión. Máximo: 10 MB, 5000 filas, 120 columnas, 20000 importes y 50 hojas. Moneda de presentación: C$. El equilibrio no garantiza exactitud; el estado de flujo de efectivo y el capital neto operativo son aproximaciones educativas.</p></details></section>
      <details class="card mb-4"><summary>Catálogo de cuentas (${ACCOUNT_CATALOG.length} cuentas y sus nombres alternativos)</summary><p>El catálogo identifica nombres conocidos; los préstamos sin plazo y los gastos sin función se revisan manualmente. Puede usar una clasificación explícita para sus propias cuentas.</p><button type="button" class="btn btn-secondary" id="downloadCatalog">Descargar catálogo JSON</button></details>
      <details class="card mb-4"><summary>Importar pegando celdas desde Excel</summary>
        <label class="form-label" for="pasteStates">Pegue la tabla incluyendo la fila de encabezados</label>
        <textarea class="form-input" id="pasteStates" rows="5" placeholder="Estado,Grupo,Cuenta,Clasificacion,2023,2024"></textarea>
        <button type="button" class="btn btn-secondary mt-2" id="importPaste">Importar tabla pegada</button>
      </details>
      <div id="importReview"></div>
      <section class="states-section-heading"><div><h2>2. Revisar los estados</h2><p class="text-muted">Edite el borrador por periodo y compruebe el equilibrio antes de publicarlo.</p></div>
      <button type="button" class="btn btn-primary" id="saveStates">Guardar estados</button></section>
      <div class="card mb-4"><form id="periodForm" class="flex-gap flex-wrap">
        <label>Periodo nuevo <input class="form-input" name="period" required maxlength="40" placeholder="2025"></label>
        <button class="btn btn-secondary">Añadir periodo vacío</button></form>
        ${draft.periods.length ? `<label class="form-label" for="currentPeriod">Editar periodo</label>
        <select class="form-select" id="currentPeriod">${draft.periods.map((p, i) => `<option value="${i}" ${p === selected ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <form id="renamePeriod" class="flex-gap flex-wrap mt-4"><input class="form-input" name="period" aria-label="Nuevo nombre del periodo" required maxlength="40" value="${esc(selected)}"><button class="btn btn-secondary">Renombrar</button></form>
        <div class="flex-gap flex-wrap mt-4"><button class="btn btn-secondary" id="earlierPeriod">Mover antes</button><button class="btn btn-secondary" id="laterPeriod">Mover después</button><button class="btn btn-danger" id="deletePeriod">Eliminar periodo</button></div>` : '<p>No hay periodos. Añada uno para empezar, sin necesidad de cargar el ejemplo.</p>'}</div>
      <div class="states-statement-switch" aria-label="Seleccionar estado financiero">
        <button type="button" class="btn ${statement === 'balance' ? 'btn-primary' : 'btn-secondary'}" id="showBalance" aria-pressed="${statement === 'balance'}">Estado de situación financiera</button>
        <button type="button" class="btn ${statement === 'resultados' ? 'btn-primary' : 'btn-secondary'}" id="showResults" aria-pressed="${statement === 'resultados'}">Estado de resultados</button></div>
      <div id="accountEditor"></div><section class="card states-balance-check" aria-label="Verificación del equilibrio"><h2>Equilibrio por periodo</h2><div id="balanceCheck" aria-live="polite"></div></section>
      <h2 class="mt-4">Comparación entre periodos</h2><div id="statementPreview"></div>`;
    renderAccounts();
    renderImportReview();
    guard(renderPreview);
    bind();
  }

  const options = (group, current = '') => ACCOUNT_TYPES[group].map(type =>
    `<option value="${type}" ${type === current ? 'selected' : ''}>${LABELS[type]}</option>`).join('');

  function renderAccounts() {
    const el = page.querySelector('#accountEditor');
    if (!selected) { el.innerHTML = ''; return; }
    const sections = Object.entries(GROUPS).map(([group, label]) => {
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
    });
    el.innerHTML = `<article id="editorBalance" ${statement === 'balance' ? '' : 'hidden'}><h2 class="states-statement-title">Estado de situación financiera</h2>${sections.slice(0, 3).join('')}</article>
      <article id="editorResults" ${statement === 'resultados' ? '' : 'hidden'}><h2 class="states-statement-title">Estado de resultados</h2>${sections[3]}</article>`;
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

  function renderImportReview() {
    const root = page.querySelector('#importReview');
    page.querySelector('#saveStates').disabled = !!importSession || reading;
    if (!importSession) { root.innerHTML = ''; return; }
    const review = evaluateImportReview(importSession);
    const filtered = review.rows.filter(row => {
      const visible = reviewFilter === 'all' || reviewFilter === 'issues' && !row.ignored && row.issues.length
        || reviewFilter === 'ignored' && row.ignored;
      return visible && normalizeAccountName(`${row.account} ${row.sheet}`).includes(normalizeAccountName(reviewSearch));
    });
    const pages = Math.max(1, Math.ceil(filtered.length / 30));
    reviewPage = Math.min(reviewPage, pages - 1);
    const visible = filtered.slice(reviewPage * 30, (reviewPage + 1) * 30);
    const classifications = row => `<option value="">Seleccione una clasificación</option>${Object.entries(ACCOUNT_TYPES).map(([group, types]) =>
      `<optgroup label="${GROUPS[group]}">${types.map(type => `<option value="${group}:${type}" ${row.group === group && row.type === type ? 'selected' : ''}>${LABELS[type]}</option>`).join('')}</optgroup>`).join('')}`;
    let balance = '';
    if (review.ready) {
      try {
        balance = validateFinancialData(finalizeImportReview(importSession)).map(row =>
          `<span class="states-review-balance">${esc(row.period)}: ${row.balanced ? 'Equilibrado' : `Diferencia ${formatCurrency(row.difference)}`}</span>`).join('');
      } catch (error) { balance = `<p class="text-danger">${esc(error.message)}</p>`; }
    }
    root.innerHTML = `<section class="card states-review-card" aria-labelledby="importReviewTitle"><h2 id="importReviewTitle">Revisar importación: ${esc(importSession.name)}</h2>
      <p>Corrija las cuentas pendientes y los importes. Aplicar la importación reemplaza el borrador; Guardar publica los datos para Análisis.</p>
      <div class="states-review-counts"><div><strong>${review.recognized}</strong><span>Filas clasificadas</span></div><div><strong>${review.pending}</strong><span>Cuentas pendientes</span></div><div><strong>${review.errors}</strong><span>Filas con errores</span></div><div><strong>${review.ignored}</strong><span>Filas excluidas</span></div></div>
      ${importSession.data ? '<p>Respaldo JSON validado. Se conservarán sus nombres, periodos y clasificaciones.</p>' : `<div class="states-review-tools"><label>Mostrar<select class="form-select" id="reviewFilter"><option value="all" ${reviewFilter === 'all' ? 'selected' : ''}>Todas las filas</option><option value="issues" ${reviewFilter === 'issues' ? 'selected' : ''}>Pendientes y errores</option><option value="ignored" ${reviewFilter === 'ignored' ? 'selected' : ''}>Filas excluidas</option></select></label>
      <label>Buscar cuenta u hoja<input class="form-input" id="reviewSearch" value="${esc(reviewSearch)}" type="search"></label></div>
      <div class="table-wrapper"><table class="states-review-table"><thead><tr><th>Origen y cuenta</th><th>Clasificación</th><th>Importes por periodo</th><th>Revisión</th></tr></thead><tbody>${visible.map(row => {
        const index = importSession.rows.findIndex(candidate => candidate.id === row.id);
        return `<tr class="${row.ignored ? 'states-row-ignored' : ''}"><td><small>${esc(row.sheet)}, fila ${row.line}</small><label class="sr-only" for="reviewName-${index}">Nombre de cuenta, fila ${row.line}</label><input class="form-input" id="reviewName-${index}" value="${esc(row.account)}" maxlength="120"></td>
          <td><label class="sr-only" for="reviewType-${index}">Clasificación de ${esc(row.account)}</label><select class="form-select" id="reviewType-${index}" ${row.ignored ? 'disabled' : ''}>${classifications(row)}</select><small>${esc(row.match)}${row.subtotal ? ' · Subtotal reconocido' : ''}</small></td>
          <td>${row.amounts.map((amount, amountIndex) => `<label class="states-review-amount">${esc(amount.period || 'Sin periodo')}<input class="form-input" id="reviewAmount-${index}-${amountIndex}" value="${esc(amount.raw ?? '')}" aria-label="Importe de ${esc(row.account)}, ${esc(amount.period)}" ${row.ignored ? 'disabled' : ''}></label>`).join('')}</td>
          <td><span class="states-review-status ${row.issues.length && !row.ignored ? 'text-danger' : ''}">${row.ignored ? 'Excluida' : row.issues.length ? 'Requiere corrección' : 'Lista'}</span>${!row.ignored && row.issues.length ? `<ul>${row.issues.map(issue => `<li>${esc(issue)}</li>`).join('')}</ul>` : ''}
          <label class="states-review-skip"><input type="checkbox" id="reviewSkip-${index}" ${row.ignored ? 'checked' : ''}> Excluir esta fila</label></td></tr>`;
      }).join('') || '<tr><td colspan="4">No hay filas con este filtro.</td></tr>'}</tbody></table></div>
      <div class="states-review-pagination"><button type="button" class="btn btn-secondary" id="reviewPrevious" ${reviewPage === 0 ? 'disabled' : ''}>Anterior</button><span>Página ${reviewPage + 1} de ${pages} · ${filtered.length} filas</span><button type="button" class="btn btn-secondary" id="reviewNext" ${reviewPage === pages - 1 ? 'disabled' : ''}>Siguiente</button></div>`}
      ${importSession.ignoredSheets.length ? `<details class="states-review-notes"><summary>${importSession.ignoredSheets.length} hoja(s) excluida(s)</summary><ul>${importSession.ignoredSheets.map(sheet => `<li>${esc(sheet.name)}: ${esc(sheet.reason)}</li>`).join('')}</ul></details>` : ''}
      ${importSession.warnings.length ? `<details class="states-review-notes" open><summary>Advertencias (${importSession.warnings.length})</summary><ul>${[...new Set(importSession.warnings)].map(warning => `<li>${esc(warning)}</li>`).join('')}</ul></details>` : ''}
      <div class="states-review-balances">${balance}</div>
      <div class="states-review-actions"><button type="button" class="btn btn-primary" id="applyImport" ${review.ready ? '' : 'disabled'}>Aplicar al borrador</button><button type="button" class="btn btn-secondary" id="cancelImport">Cancelar importación</button>
      <button type="button" class="btn btn-secondary" disabled aria-describedby="importAIReason">Asistencia con IA</button></div>
      <p class="text-muted" id="importAIReason">${esc(IMPORT_AI_STATUS.reason)} Las sugerencias requerirán revisión antes de aplicarse.</p>
      ${review.ready ? '' : '<p class="text-danger" role="status">Resuelva las filas pendientes o exclúyalas explícitamente. Se necesita al menos un importe para aplicar la importación.</p>'}</section>`;
    root.querySelector('#applyImport').onclick = () => guard(() => {
      const imported = finalizeImportReview(importSession);
      const avisos = importSession.warnings;
      replaceDraft(imported, `Importación aplicada al borrador. Revise el equilibrio y pulse Guardar.${avisoText(avisos)}`);
    });
    root.querySelector('#cancelImport').onclick = () => { importSession = null; importToken++; reading = false; renderImportReview(); message('Importación cancelada. El borrador se conserva.'); };
    root.querySelector('#reviewFilter')?.addEventListener('change', event => { reviewFilter = event.target.value; reviewPage = 0; renderImportReview(); });
    root.querySelector('#reviewSearch')?.addEventListener('change', event => { reviewSearch = event.target.value; reviewPage = 0; renderImportReview(); });
    root.querySelector('#reviewPrevious')?.addEventListener('click', () => { reviewPage--; renderImportReview(); });
    root.querySelector('#reviewNext')?.addEventListener('click', () => { reviewPage++; renderImportReview(); });
    for (const row of visible) {
      const index = importSession.rows.findIndex(candidate => candidate.id === row.id);
      root.querySelector(`#reviewType-${index}`).onchange = event => guard(() => {
        const [group, type] = event.target.value.split(':');
        if (!group) { const original = importSession.rows[index]; original.group = ''; original.type = ''; }
        else updateImportClassification(importSession, row.id, group, type);
        renderImportReview();
      });
      root.querySelector(`#reviewName-${index}`).onchange = event => guard(() => { updateImportName(importSession, row.id, event.target.value); renderImportReview(); });
      root.querySelector(`#reviewSkip-${index}`).onchange = event => {
        const original = importSession.rows[index];
        original.ignored = event.target.checked;
        if (!original.ignored && !original.type) updateImportName(importSession, row.id, original.account);
        renderImportReview();
      };
      row.amounts.forEach((_amount, amountIndex) => {
        root.querySelector(`#reviewAmount-${index}-${amountIndex}`).onchange = event => guard(() => {
          updateImportAmount(importSession, row.id, amountIndex, event.target.value); renderImportReview();
        });
      });
    }
    page.querySelector('#saveStates').disabled = true;
  }

  function stageImport(session) {
    importSession = session; reviewFilter = 'all'; reviewSearch = ''; reviewPage = 0;
    renderImportReview();
    message(`Archivo leído. Revise las cuentas y pulse Aplicar al borrador.${avisoText(session.warnings)}`);
  }

  function bind() {
    page.querySelector('#downloadCatalog').onclick = () => guard(() => exportJSON({ version: CATALOGO_VERSION, cuentas: ACCOUNT_CATALOG, clasificaciones: LABELS }, 'gfo-catalogo-cuentas.json'));
    page.querySelector('#showBalance').onclick = () => { statement = 'balance'; render(); };
    page.querySelector('#showResults').onclick = () => { statement = 'resultados'; render(); };
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
      const token = ++importToken;
      reading = true;
      page.querySelector('#saveStates').disabled = true;
      message('Leyendo archivo…');
      try {
        const imported = await prepareStatementImport(file, importOptions());
        if (token === importToken) stageImport(imported);
      } catch (error) {
        if (token === importToken) message(error.message, true);
      } finally {
        if (token === importToken) { reading = false; page.querySelector('#saveStates').disabled = !!importSession; }
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
        importToken++; reading = false;
        stageImport(textToImportReview(textarea.value, { ...importOptions(), name: 'Datos pegados' }));
      } catch (error) {
        message(error.message, true);
      }
    };
    page.querySelector('#saveStates').onclick = () => {
      try {
        if (reading || importSession) throw new Error('Termine la revisión y aplique o cancele la importación antes de guardar.');
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
    const table = (label, rows) => `<h3>${label}</h3><div class="table-wrapper mb-4"><table><thead><tr><th>Cuenta</th>${draft.periods.map(p => `<th class="text-right">${esc(p)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name, values]) => `<tr><td>${esc(name)}</td>${values.map(v => `<td class="text-right font-mono">${v === null ? 'N/D' : formatCurrency(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const totals = Object.fromEntries(draft.periods.map(period => [period, computeFinancialTotals(normalized, period)]));
    const sections = Object.entries(GROUPS).map(([group, label]) => {
      const names = [...new Set(draft.periods.flatMap(p => Object.keys(accountsFor(normalized, p, group))))];
      return table(group === 'estadoResultados' ? 'Ingresos, costos y gastos' : label, names.map(name => [name, draft.periods.map(p => accountsFor(normalized, p, group)[name] ?? null)]));
    });
    const totalRows = entries => entries.map(([label, key]) => [label, draft.periods.map(p => totals[p][key])]);
    preview.innerHTML = `<section class="card states-statement-preview"><h2>Estado de situación financiera</h2>${sections.slice(0, 3).join('')}${table('Totales del estado de situación financiera', totalRows([
      ['Total activos', 'totalActivos'], ['Total pasivos', 'totalPasivos'], ['Total patrimonio', 'totalPatrimonio']
    ]))}</section><section class="card states-statement-preview"><h2>Estado de resultados</h2>${sections[3]}${table('Resultados del periodo', totalRows([
      ['Utilidad bruta', 'utilidadBruta'], ['Utilidad neta', 'utilidadNeta']
    ]))}</section>`;
  }

  render();
    return { hasUnsavedChanges: () => dirty || reading || importSession !== null };
}

