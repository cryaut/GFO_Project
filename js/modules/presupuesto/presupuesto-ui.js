import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatPercentND as porcentaje } from '../../utils/format.js';
import { leerNumero, nuevoId } from '../../utils/form.js';
import { exportJSON } from '../../utils/export.js';
import { panelEjemplos, vincularEjemplos, ejemploSeleccionado } from '../../components/ejemplos.js';
import {
  CATEGORIAS_ESTUDIANTE, TIPOS_MOVIMIENTO, PRIORIDADES, MEDIOS, TIPOS_PLAN,
  nuevoPresupuestoEstudiantil, normalizarEstudiantil, calcularSeguimiento, calcularProyeccion, semanaDeFecha
} from './presupuesto-calculations.js';

const VISTAS = [['meta', 'Inicio y meta'], ['registro', 'Registro semanal'], ['seguimiento', 'Seguimiento'], ['proyecciones', 'Presupuesto proyectado']];
const valor = v => esc(String(v ?? ''));
const fecha = v => v ? new Date(`${v}T00:00:00Z`).toLocaleDateString('es-NI', { day:'2-digit', month:'short', year:'numeric', timeZone:'UTC' }) : 'Sin fecha';
const opciones = (lista, seleccion) => lista.map(v => `<option value="${esc(v)}"${v === seleccion ? ' selected' : ''}>${esc(v)}</option>`).join('');
const campo = (id, label, tipo, v = '', atributos = '') => `<div class="student-field"><label for="${id}">${esc(label)}</label><input class="form-input" id="${id}" type="${tipo}" value="${valor(v)}" ${atributos}></div>`;
const selector = (id, label, lista, seleccion) => `<div class="student-field"><label for="${id}">${esc(label)}</label><select class="form-select" id="${id}">${opciones(lista, seleccion)}</select></div>`;

export function presupuestoEstudiantilUI(page, { inicial, guardar, verMensual }) {
  let datos, errorInicial = '';
  try { datos = normalizarEstudiantil(inicial ?? nuevoPresupuestoEstudiantil()); }
  catch (error) { datos = nuevoPresupuestoEstudiantil(); errorInicial = `No se pudieron leer los datos guardados: ${error.message} Se conservan en el respaldo; no se han reemplazado.`; }
  let editarId = null;
  const mensaje = (texto, error = false) => {
    const el = page.querySelector('#ppMensaje');
    el.textContent = texto; el.className = error ? 'student-message text-danger' : 'student-message';
  };
  function persistir(candidato, texto, reemplazo = false) {
    if (errorInicial && !reemplazo) { mensaje('Descargue el respaldo de los datos que no se pudieron leer antes de reemplazarlos con un ejemplo.', true); return false; }
    try {
      const limpio = normalizarEstudiantil(candidato);
      guardar(limpio); datos = limpio; errorInicial = '';
      actualizar(); mensaje(texto); return true;
    } catch (error) { mensaje(`No se guardó: ${error.message} Se conservan sus datos y el borrador.`, true); return false; }
  }
  function formPlan(id, titulo) {
    const p = datos.proyecciones[id];
    return `<details class="student-plan"${id === 'real' ? ' open' : ''}><summary>${titulo}</summary><form id="ppPlan-${id}" class="student-disclosure">
      <p>${id === 'real' ? 'Distribuya el dinero con el que cuenta. Puede planificar ahorro cero.' : 'Prepare aparte lo que necesitaría recibir. Este escenario no modifica sus ingresos ni movimientos reales.'}</p>
      <div class="student-form-grid">${campo(`ppIngreso-${id}`, 'Ingreso disponible (C$)', 'number', p.ingreso, 'min="0" step="0.01"')}
      ${selector(`ppFrecuencia-${id}`, 'Frecuencia del presupuesto', ['Mensual','Semanal'], p.frecuencia)}</div>
      <p class="form-hint">Los montos pertenecen a la frecuencia elegida. Cambiarla no convierte las cifras automáticamente. Para el límite semanal, el plan mensual usa cuatro semanas, como el ejemplo del profesor.</p>
      <div class="student-plan-rows">${p.partidas.map((f, i) => `<div class="student-plan-row"><strong>${esc(f.categoria)}</strong>
        ${campo(`ppMonto-${id}-${i}`, 'Monto planificado (C$)', 'number', f.monto, 'min="0" step="0.01"')}
        ${selector(`ppTipo-${id}-${i}`, 'Tipo de asignación', TIPOS_PLAN, f.tipo)}
        ${campo(`ppComentario-${id}-${i}`, 'Comentario', 'text', f.comentario, 'maxlength="240"')}
        <span class="student-share" id="ppPorcentaje-${id}-${i}"></span></div>`).join('')}</div>
      <div id="ppResultadoPlan-${id}" class="student-plan-result" aria-live="polite"></div>
      <div class="student-actions"><button class="btn btn-primary" type="submit">Guardar proyección ${id === 'real' ? 'real' : 'deseada'}</button><span>Las proyecciones no generan movimientos realizados.</span></div>
    </form></details>`;
  }
  page.innerHTML = `<div class="student-workspace">
    <header class="student-header"><div><h1>Presupuesto personal</h1><p>Define tu meta, registra lo que recibes y gastas, y revisa tu avance cada semana.</p></div>
      <details class="student-tools"><summary>Ejemplos y datos</summary><div class="student-disclosure">
        ${panelEjemplos('presupuestoEstudiantil', 'ppCargarEjemplo')}
        <div class="student-actions"><button class="btn btn-secondary" id="ppExportar">Descargar respaldo estudiantil</button><button class="btn btn-secondary" id="ppMensual">Ver presupuesto mensual anterior</button></div>
        <p class="form-hint">El presupuesto mensual anterior se conserva separado. Sus asignaciones no se convierten en gastos o ahorros realizados.</p>
      </div></details></header>
    <p id="ppMensaje" class="student-message" role="status" aria-live="polite"></p>
    <div id="ppTotales" class="student-totals" aria-label="Resultados de movimientos registrados"></div>
    <nav class="student-nav" aria-label="Secciones del presupuesto">${VISTAS.map(([id, titulo]) => `<button type="button" class="btn btn-secondary" id="ppVista-${id}" aria-controls="ppPanel-${id}" aria-pressed="${id === 'meta'}">${titulo}</button>`).join('')}</nav>
    <section class="student-section" id="ppPanel-meta" aria-labelledby="ppTituloMeta">
      <div class="student-section-heading"><h2 id="ppTituloMeta">Inicio y meta</h2><p>Una meta concreta y un plazo en semanas.</p></div>
      <div class="student-meta-layout"><form id="ppFormMeta"><div class="student-form-grid">
        ${campo('ppNombre', 'Nombre del estudiante', 'text', datos.meta.nombre, 'maxlength="120" autocomplete="name"')}
        ${campo('ppDescripcion', '¿Para qué quieres ahorrar?', 'text', datos.meta.descripcion, 'maxlength="240"')}
        ${campo('ppCosto', 'Costo de la meta (C$)', 'number', datos.meta.costo, 'min="0" step="0.01"')}
        ${campo('ppDuracion', 'Duración del seguimiento (semanas)', 'number', datos.meta.semanas, 'min="1" max="52" step="1" required')}
        ${campo('ppInicio', 'Inicio del seguimiento (lunes)', 'date', datos.meta.inicio)}
      </div><div class="student-actions"><button class="btn btn-primary" type="submit">Guardar meta y fechas</button></div></form>
      <aside class="student-meta-result" id="ppMetaResultado" aria-live="polite"></aside></div>
      <details class="student-method"><summary>Cómo se calcula y cómo usarlo</summary><p>Aporte semanal recomendado = costo de la meta ÷ semanas. El avance usa solo el ahorro registrado, no el planificado. Cada semana comienza el lunes y termina el domingo. Un movimiento de reserva se separa del ahorro para la meta.</p><p>La hoja del profesor agrupa cuatro semanas por bloque de seguimiento; no son meses calendario. Una meta o un ingreso sin base de cálculo se muestra N/D.</p></details>
    </section>
    <section class="student-section" id="ppPanel-registro" aria-labelledby="ppTituloRegistro" hidden>
      <div class="student-section-heading"><h2 id="ppTituloRegistro">Registro semanal</h2><p>Escribe montos positivos o cero; el tipo determina cómo se usa el dinero.</p></div>
      <form id="ppFormMovimiento"><div class="student-form-grid student-ledger-form">
        ${campo('ppFecha', 'Fecha del movimiento', 'date')}
        ${selector('ppTipo', 'Tipo de movimiento', TIPOS_MOVIMIENTO, 'Gasto')}
        ${selector('ppCategoria', 'Categoría', CATEGORIAS_ESTUDIANTE, 'Transporte')}
        ${campo('ppDescripcionMovimiento', 'Descripción', 'text', '', 'maxlength="240"')}
        ${campo('ppMonto', 'Monto (C$)', 'number', '', 'min="0" step="0.01" required')}
        ${selector('ppPrioridad', 'Prioridad', PRIORIDADES, 'Necesidad')}
        ${selector('ppMedio', 'Medio', MEDIOS, 'Efectivo')}
        ${campo('ppObservacion', 'Observación (opcional)', 'text', '', 'maxlength="500"')}
      </div><p class="form-hint" id="ppSemanaFecha">La semana se calcula con la fecha y el lunes inicial.</p>
      <div class="student-actions"><button class="btn btn-primary" type="submit" id="ppGuardarMovimiento">Registrar movimiento</button><button class="btn btn-secondary" type="button" id="ppCancelarEdicion" hidden>Cancelar edición</button></div></form>
      <div class="student-register-heading"><h3>Movimientos registrados</h3><label for="ppFiltroSemana">Consultar semana<select class="form-select" id="ppFiltroSemana"></select></label></div>
      <div class="table-wrapper" id="ppRegistroTabla" tabindex="0" role="region" aria-label="Registro de movimientos con desplazamiento horizontal"></div>
    </section>
    <section class="student-section" id="ppPanel-seguimiento" aria-labelledby="ppTituloSeguimiento" hidden>
      <div class="student-section-heading"><h2 id="ppTituloSeguimiento">Seguimiento</h2><p>Resultados semanales de los movimientos realizados. Las semanas vacías no aportan ahorro.</p></div>
      <div id="ppSeguimientoResumen" class="student-follow-result"></div>
      <div class="table-wrapper" id="ppSeguimientoTabla" tabindex="0" role="region" aria-label="Seguimiento semanal con desplazamiento horizontal"></div>
      <details class="student-method"><summary>Ver fórmulas del seguimiento</summary><p>Saldo semanal = ingresos − gastos − ahorro − reserva. Ahorro acumulado = suma de aportes a la meta hasta esa semana. Avance = ahorro acumulado ÷ costo de la meta. La reserva no se suma al avance.</p></details>
    </section>
    <section class="student-section" id="ppPanel-proyecciones" aria-labelledby="ppTituloProyecciones" hidden>
      <div class="student-section-heading"><h2 id="ppTituloProyecciones">Presupuesto proyectado</h2><p>Separa lo que puedes distribuir hoy de lo que necesitarías recibir. Ambos planes se guardan por separado.</p></div>
      ${formPlan('real', 'Real actual')}${formPlan('deseada', 'Deseado')}
      <details class="student-method"><summary>Ver fórmulas de la proyección</summary><p>Total asignado = suma de partidas, incluido ahorro y reserva. Diferencia = ingreso − total asignado. Porcentaje = monto ÷ ingreso. Límite de gasto semanal = (ingreso − ahorro − reserva) ÷ 4 para un plan mensual; en un plan semanal no se divide. Un campo vacío queda N/D; un cero escrito se conserva.</p></details>
    </section>
  </div>`;

  for (const [id] of VISTAS) page.querySelector(`#ppVista-${id}`).addEventListener('click', () => {
    for (const [otra] of VISTAS) {
      page.querySelector(`#ppPanel-${otra}`).hidden = otra !== id;
      page.querySelector(`#ppVista-${otra}`).setAttribute('aria-pressed', String(otra === id));
    }
  });
  const leer = id => String(page.querySelector(`#${id}`).value ?? '');
  const leerMonto = id => leerNumero(leer(id)).valor;
  function leerPlan(id) {
    const p = datos.proyecciones[id];
    return { frecuencia:leer(`ppFrecuencia-${id}`), ingreso:leerMonto(`ppIngreso-${id}`),
      partidas:p.partidas.map((p, i) => ({ ...p, monto:leerMonto(`ppMonto-${id}-${i}`), tipo:leer(`ppTipo-${id}-${i}`), comentario:leer(`ppComentario-${id}-${i}`) })) };
  }
  function mostrarPlan(id) {
    const r = calcularProyeccion(leerPlan(id));
    r.partidas.forEach((f, i) => { page.querySelector(`#ppPorcentaje-${id}-${i}`).textContent = `${porcentaje(f.porcentaje)} del ingreso`; });
    page.querySelector(`#ppResultadoPlan-${id}`).innerHTML = `<dl><div><dt>Total asignado</dt><dd>${monto(r.total)}</dd></div><div><dt>Diferencia</dt><dd>${monto(r.diferencia)}</dd></div><div><dt>Ahorro proyectado</dt><dd>${monto(r.ahorro)}</dd></div><div><dt>Reserva proyectada</dt><dd>${monto(r.reserva)}</dd></div><div><dt>Límite de gasto semanal</dt><dd>${monto(r.limiteSemanal)}</dd></div></dl><p><strong>${r.estado}</strong> · ${porcentaje(r.porcentaje)} asignado</p>`;
  }
  for (const id of ['real', 'deseada']) {
    page.querySelector(`#ppPlan-${id}`).addEventListener('input', () => mostrarPlan(id));
    page.querySelector(`#ppPlan-${id}`).addEventListener('change', () => mostrarPlan(id));
    page.querySelector(`#ppPlan-${id}`).addEventListener('submit', event => {
      event.preventDefault();
      const p = leerPlan(id);
      // Una entrada inválida no se interpreta como campo vacío.
      const entradas = [`ppIngreso-${id}`, ...p.partidas.map((_, i) => `ppMonto-${id}-${i}`)];
      if (entradas.some(c => leer(c).trim() && leerMonto(c) === null)) { mensaje('Revise los importes de la proyección.', true); return; }
      persistir({ ...datos, proyecciones:{ ...datos.proyecciones, [id]:p } }, 'Proyección guardada. Los movimientos reales no cambiaron.');
    });
  }
  page.querySelector('#ppFormMeta').addEventListener('submit', event => {
    event.preventDefault();
    if (leer('ppCosto').trim() && leerMonto('ppCosto') === null) { mensaje('Revise el costo de la meta.', true); return; }
    persistir({ ...datos, meta:{ nombre:leer('ppNombre'), descripcion:leer('ppDescripcion'), costo:leerMonto('ppCosto'), semanas:leerMonto('ppDuracion'), inicio:leer('ppInicio') || null } }, 'Meta y fechas guardadas.');
  });
  function cancelarEdicion() {
    editarId = null;
    for (const id of ['ppFecha','ppDescripcionMovimiento','ppMonto','ppObservacion']) page.querySelector(`#${id}`).value = '';
    page.querySelector('#ppGuardarMovimiento').textContent = 'Registrar movimiento';
    page.querySelector('#ppCancelarEdicion').hidden = true;
  }
  page.querySelector('#ppCancelarEdicion').addEventListener('click', cancelarEdicion);
  page.querySelector('#ppFecha').addEventListener('change', () => {
    const n = semanaDeFecha(leer('ppFecha'), datos.meta.inicio, datos.meta.semanas);
    page.querySelector('#ppSemanaFecha').textContent = n === null ? 'La fecha está fuera del seguimiento o falta definir el lunes inicial.' : `Semana ${n} del seguimiento.`;
  });
  page.querySelector('#ppFormMovimiento').addEventListener('submit', event => {
    event.preventDefault();
    const m = { id:editarId || nuevoId('movimiento'), fecha:leer('ppFecha'), tipo:leer('ppTipo'), categoria:leer('ppCategoria'), descripcion:leer('ppDescripcionMovimiento'), monto:leerMonto('ppMonto'), prioridad:leer('ppPrioridad'), medio:leer('ppMedio'), observacion:leer('ppObservacion') };
    const movimientos = editarId ? datos.movimientos.map(f => f.id === editarId ? m : f) : [...datos.movimientos, m];
    if (persistir({ ...datos, movimientos }, editarId ? 'Movimiento actualizado.' : 'Movimiento registrado.')) cancelarEdicion();
  });
  page.querySelector('#ppFiltroSemana').addEventListener('change', mostrarRegistro);
  page.querySelector('#ppExportar').addEventListener('click', () => exportJSON({ presupuesto:{ vista:'estudiantil', estudiantil:errorInicial ? inicial : datos } }, 'presupuesto-estudiantil.json'));
  page.querySelector('#ppMensual').addEventListener('click', () => { try { verMensual(); } catch (error) { mensaje(error.message, true); } });
  vincularEjemplos(page, 'presupuestoEstudiantil');
  page.querySelector('#ppCargarEjemplo').addEventListener('click', () => {
    if ((datos.movimientos.length || datos.meta.costo !== null || datos.meta.nombre || datos.meta.descripcion || datos.meta.inicio || Object.values(datos.proyecciones).some(p => p.ingreso !== null || p.partidas.some(f => f.monto !== null)) || errorInicial) && !window.confirm('¿Reemplazar los datos estudiantiles por el ejemplo seleccionado? El presupuesto mensual anterior se conserva.')) return;
    if (persistir(ejemploSeleccionado(page, 'presupuestoEstudiantil', nuevoPresupuestoEstudiantil), 'Ejemplo seleccionado cargado. Revise sus fechas y procedencia.', true)) {
      // Recarga explícita: solo al reemplazar el documento completo.
      presupuestoEstudiantilUI(page, { inicial:datos, guardar, verMensual });
      page.querySelector('#ppMensaje').textContent = 'Ejemplo seleccionado cargado. Revise sus fechas y procedencia.';
    }
  });

  function mostrarRegistro() {
    const semana = Number(leer('ppFiltroSemana')) || null;
    const lista = datos.movimientos.map((m, i) => ({ ...m, indice:i, semana:semanaDeFecha(m.fecha, datos.meta.inicio, datos.meta.semanas) })).filter(m => semana === null || m.semana === semana);
    page.querySelector('#ppRegistroTabla').innerHTML = lista.length ? `<table class="statement-table student-ledger"><thead><tr><th>Fecha / semana</th><th>Movimiento</th><th>Descripción</th><th class="text-right">Monto</th><th>Prioridad / medio</th><th>Observación</th><th>Acciones</th></tr></thead><tbody>${lista.map(m => `<tr><td>${fecha(m.fecha)}<small>Semana ${m.semana}</small></td><td>${esc(m.tipo)}<small>${esc(m.categoria)}</small></td><td>${esc(m.descripcion)}</td><td class="text-right">${monto(m.monto)}</td><td>${esc(m.prioridad)}<small>${esc(m.medio)}</small></td><td>${esc(m.observacion)}</td><td><div class="student-row-actions"><button class="btn btn-secondary" id="ppEditar-${m.indice}" aria-label="Editar movimiento ${m.indice + 1}">Editar</button><button class="btn btn-secondary" id="ppEliminar-${m.indice}" aria-label="Eliminar movimiento ${m.indice + 1}">Eliminar</button></div></td></tr>`).join('')}</tbody></table>` : '<p class="student-empty">No hay movimientos en esta selección. Define tu fecha inicial y registra el primero.</p>';
    for (const m of lista) {
      page.querySelector(`#ppEditar-${m.indice}`).addEventListener('click', () => {
        editarId = m.id;
        const campos = { ppFecha:m.fecha, ppTipo:m.tipo, ppCategoria:m.categoria, ppDescripcionMovimiento:m.descripcion, ppMonto:m.monto, ppPrioridad:m.prioridad, ppMedio:m.medio, ppObservacion:m.observacion };
        for (const [id, v] of Object.entries(campos)) page.querySelector(`#${id}`).value = v;
        page.querySelector('#ppGuardarMovimiento').textContent = 'Guardar cambios del movimiento';
        page.querySelector('#ppCancelarEdicion').hidden = false; page.querySelector('#ppFecha').focus();
      });
      page.querySelector(`#ppEliminar-${m.indice}`).addEventListener('click', () => {
        if (!window.confirm(`¿Eliminar ${m.tipo.toLowerCase()} de ${monto(m.monto)} del ${fecha(m.fecha)}?`)) return;
        if (persistir({ ...datos, movimientos:datos.movimientos.filter(f => f.id !== m.id) }, 'Movimiento eliminado.') && editarId === m.id) cancelarEdicion();
      });
    }
  }
  function actualizar() {
    const r = calcularSeguimiento(datos);
    const items = [['Ingresos registrados',r.ingreso], ['Gastos realizados',r.gasto], ['Ahorro para la meta',r.ahorro], ['Reserva acumulada',r.reserva], ['Saldo disponible',r.saldo]];
    page.querySelector('#ppTotales').innerHTML = `<p>Movimientos registrados durante el seguimiento</p><dl>${items.map(([t, v]) => `<div><dt>${t}</dt><dd>${monto(v)}</dd></div>`).join('')}</dl>`;
    page.querySelector('#ppMetaResultado').innerHTML = `<h3>Tu meta, semana a semana</h3><dl><div><dt>Aporte semanal recomendado</dt><dd>${monto(r.aporteRecomendado)}</dd></div><div><dt>Avance realizado</dt><dd>${porcentaje(r.avance)}</dd></div><div><dt>Final del seguimiento (domingo)</dt><dd>${fecha(r.final)}</dd></div></dl><p>El aporte recomendado orienta tu plan. No se registra automáticamente como ahorro.</p>`;
    page.querySelector('#ppSeguimientoResumen').innerHTML = `<strong>${monto(r.ahorro)} ahorrados para una meta de ${monto(datos.meta.costo)}</strong><span>${porcentaje(r.avance)} de avance real</span>`;
    page.querySelector('#ppSeguimientoTabla').innerHTML = `<table class="statement-table"><thead><tr><th>Semana / bloque</th><th>Desde lunes</th><th>Hasta domingo</th><th class="text-right">Ingreso</th><th class="text-right">Gasto</th><th class="text-right">Ahorro</th><th class="text-right">Reserva</th><th class="text-right">Saldo</th><th class="text-right">Ahorro acumulado</th><th class="text-right">Avance</th></tr></thead><tbody>${r.semanas.map(s => `<tr><th scope="row">${s.semana}<small>Bloque ${s.bloque}${s.movimientos ? '' : ' · Sin movimientos'}</small></th><td>${fecha(s.desde)}</td><td>${fecha(s.hasta)}</td>${['ingreso','gasto','ahorro','reserva','saldo','acumulado'].map(k => `<td class="text-right">${monto(s[k])}</td>`).join('')}<td class="text-right">${porcentaje(s.avance)}</td></tr>`).join('')}</tbody></table>`;
    const filtro = page.querySelector('#ppFiltroSemana'), anterior = filtro.value;
    filtro.innerHTML = '<option value="">Todas las semanas</option>' + r.semanas.map(s => `<option value="${s.semana}">Semana ${s.semana}</option>`).join('');
    filtro.value = r.semanas.some(s => String(s.semana) === anterior) ? anterior : '';
    mostrarRegistro();
  }
  // Actualizar resultados no reemplaza los controles ni descarta otros borradores.
  for (const id of ['real','deseada']) {
    const p = datos.proyecciones[id];
    page.querySelector(`#ppIngreso-${id}`).value = p.ingreso ?? '';
    page.querySelector(`#ppFrecuencia-${id}`).value = p.frecuencia;
    p.partidas.forEach((f, i) => {
      page.querySelector(`#ppMonto-${id}-${i}`).value = f.monto ?? '';
      page.querySelector(`#ppTipo-${id}-${i}`).value = f.tipo;
      page.querySelector(`#ppComentario-${id}-${i}`).value = f.comentario;
    });
    mostrarPlan(id);
  }
  actualizar();
  if (errorInicial) mensaje(errorInicial, true);
}
