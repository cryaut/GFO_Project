import store from '../../store.js';
import { depAnualLineaRecta, depAcumulada, valorEnLibros } from '../../utils/calculate.js';
import { formatCurrency, formatNumber } from '../../utils/format.js';
import { showToast } from '../../components/toast.js';

const ASPECTOS_CONDICION = [
  'Estado Físico', 'Funcionamiento', 'Frecuencia de Fallas',
  'Mantenimiento', 'Aspecto Estético', 'Compatibilidad',
  'Disponibilidad de Repuestos', 'Eficiencia'
];

const ESTADOS_POSIBLES = [
  'Excelente', 'Bueno', 'Regular', 'Deteriorado',
  'Deficiente', 'Obsoleto', 'Para Reparar'
];

// Exportada: el panorama de Inicio cuenta los activos que requieren atención.
export function calcularEstado(asset) {
  const score = asset.condicion?.score || 0;
  if (score >= 90) return 'Excelente';
  if (score >= 75) return 'Bueno';
  if (score >= 60) return 'Regular';
  if (score >= 45) return 'Deteriorado';
  if (score >= 30) return 'Deficiente';
  if (score >= 15) return 'Obsoleto';
  return 'Para Reparar';
}

function estadoColor(estado) {
  const map = { 'Excelente': 'success', 'Bueno': 'success', 'Regular': 'warning', 'Deteriorado': 'warning', 'Deficiente': 'danger', 'Obsoleto': 'danger', 'Para Reparar': 'danger' };
  return map[estado] || 'info';
}

// Ejemplo ficticio de bienes del hogar para la demostración. La condición guarda los 8
// puntajes (0–10) y su promedio × 10, igual que el formulario.
export function ejemploActivos() {
  const bien = (nombre, categoria, costoOriginal, vidaUtil, valorResidual, aniosConsumidos, costoReposicion, scores) => ({
    nombre, categoria, costoOriginal, vidaUtil, valorResidual, aniosConsumidos, costoReposicion,
    condicion: { scores, score: scores.reduce((a, b) => a + b, 0) / scores.length * 10 }
  });
  return [
    bien('Laptop', 'Tecnología', 28000, 4, 3000, 2, 32000, [8, 8, 7, 7, 8, 7, 8, 7]),
    bien('Refrigeradora', 'Electrodomésticos', 22000, 10, 2000, 6, 26000, [7, 8, 7, 6, 6, 8, 7, 7]),
    bien('Motocicleta', 'Transporte', 65000, 8, 15000, 7, 72000, [4, 5, 4, 4, 3, 5, 4, 4]),
    bien('Juego de sala', 'Mobiliario', 18000, 8, 1000, 3, 21000, [8, 9, 9, 8, 7, 9, 8, 8])
  ];
}

export function initActivos() {
  const page = document.getElementById('page-activos');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header flex-between">
      <div>
        <p class="page-eyebrow">Finanzas personales</p>
        <h1 class="page-title">Activos del Hogar</h1>
        <p class="page-subtitle">Bienes del hogar: depreciación en línea recta, condición y recomendación de reparación o reposición</p>
      </div>
      <button class="btn btn-primary" id="btnAddAsset">+ Nuevo Activo</button>
    </div>
    <div id="activosList"></div>
    <div id="activosChart" style="height:300px;margin-top:var(--space-6)"><canvas id="activosChartCanvas"></canvas></div>`;

  page.querySelector('#btnAddAsset')?.addEventListener('click', () => showAssetForm(page));
  renderActivos(page);
}

function showAssetForm(page, editIdx = null) {
  const modal = document.getElementById('modal-overlay');
  const isEdit = editIdx !== null;
  const asset = isEdit ? (store.get('activos.inventario') || [])[editIdx] : {};

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Editar' : 'Nuevo'} Activo</h3>
        <button class="modal-close" data-close-modal>&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-input" id="assetNombre" value="${asset.nombre || ''}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select class="form-select" id="assetCategoria">
              ${['Tecnología', 'Electrodomésticos', 'Mobiliario', 'Transporte', 'Herramientas'].map(c =>
                `<option value="${c}" ${asset.categoria === c ? 'selected' : ''}>${c}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Costo Original (C$)</label>
            <input type="number" class="form-input" id="assetCosto" min="0" step="0.01" value="${asset.costoOriginal || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Vida Útil (años)</label>
            <input type="number" class="form-input" id="assetVidaUtil" min="1" value="${asset.vidaUtil || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Valor Residual (C$)</label>
            <input type="number" class="form-input" id="assetResidual" min="0" step="0.01" value="${asset.valorResidual || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">Años Consumidos</label>
            <input type="number" class="form-input" id="assetAnios" min="0" value="${asset.aniosConsumidos || 0}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Costo Reposición (C$)</label>
          <input type="number" class="form-input" id="assetReposicion" min="0" step="0.01" value="${asset.costoReposicion || ''}">
        </div>
        <h4 class="mb-4 mt-4">Condición (0-10 por aspecto)</h4>
        <div class="form-row">
          ${ASPECTOS_CONDICION.map((a, i) => `
            <div class="form-group">
              <label class="form-label">${a}</label>
              <input type="number" class="form-input asset-condicion" data-idx="${i}" min="0" max="10" value="${asset.condicion?.scores?.[i] || 5}">
            </div>`).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-close-modal>Cancelar</button>
        <button class="btn btn-primary" id="btnSaveAsset">${isEdit ? 'Guardar' : 'Agregar'}</button>
      </div>
    </div>`;

  modal.classList.remove('hidden');
  modal.querySelector('[data-close-modal]')?.addEventListener('click', () => modal.classList.add('hidden'));

  modal.querySelector('#btnSaveAsset')?.addEventListener('click', () => {
    const scores = [];
    modal.querySelectorAll('.asset-condicion').forEach(input => scores.push(parseInt(input.value) || 0));
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length * 10;
    const newAsset = {
      nombre: modal.querySelector('#assetNombre').value.trim(),
      categoria: modal.querySelector('#assetCategoria').value,
      costoOriginal: parseFloat(modal.querySelector('#assetCosto').value) || 0,
      vidaUtil: parseInt(modal.querySelector('#assetVidaUtil').value) || 5,
      valorResidual: parseFloat(modal.querySelector('#assetResidual').value) || 0,
      aniosConsumidos: parseInt(modal.querySelector('#assetAnios').value) || 0,
      costoReposicion: parseFloat(modal.querySelector('#assetReposicion').value) || 0,
      condicion: { scores, score: avgScore }
    };
    if (!newAsset.nombre) return showToast('Ingrese un nombre', 'warning');

    const inventario = store.get('activos.inventario') || [];
    if (isEdit) {
      inventario[editIdx] = newAsset;
    } else {
      inventario.push(newAsset);
    }
    store.set('activos.inventario', inventario);
    modal.classList.add('hidden');
    showToast(`Activo ${isEdit ? 'actualizado' : 'agregado'}`, 'success');
    renderActivos(page);
  });
}

function renderActivos(page) {
  const el = page.querySelector('#activosList');
  if (!el) return;
  const inventario = store.get('activos.inventario') || [];

  if (inventario.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>Sin activos registrados. Haga clic en "+ Nuevo Activo" para comenzar.</p></div>';
    return;
  }

  el.innerHTML = inventario.map((asset, i) => {
    const depAn = depAnualLineaRecta(asset.costoOriginal, asset.valorResidual, asset.vidaUtil);
    const depAc = depAcumulada(depAn, asset.aniosConsumidos, asset.vidaUtil);
    const vLibros = valorEnLibros(asset.costoOriginal, depAc);
    const estado = calcularEstado(asset);
    const pctDep = asset.costoOriginal > 0 ? (depAc / asset.costoOriginal) * 100 : 0;
    const previsionMensual = asset.costoReposicion > 0 ? (asset.costoReposicion - vLibros) / 12 : 0;

    return `
      <div class="asset-card">
        <div class="asset-card-header">
          <div>
            <h4>${asset.nombre}</h4>
            <span class="badge badge-info">${asset.categoria}</span>
            <span class="badge badge-${estadoColor(estado)}" style="margin-left:var(--space-2)">${estado}</span>
          </div>
          <div class="flex-gap">
            <button class="btn btn-sm btn-secondary" data-edit-asset="${i}">Editar</button>
            <button class="btn btn-sm btn-danger" data-del-asset="${i}">Eliminar</button>
          </div>
        </div>
        <div class="form-row">
          <div><span class="text-muted">Costo Original:</span> <strong>${formatCurrency(asset.costoOriginal)}</strong></div>
          <div><span class="text-muted">Dep. Anual:</span> <strong>${formatCurrency(depAn)}</strong></div>
          <div><span class="text-muted">Dep. Acumulada:</span> <strong class="text-danger">${formatCurrency(depAc)}</strong></div>
          <div><span class="text-muted">Valor en Libros:</span> <strong class="text-success">${formatCurrency(vLibros)}</strong></div>
        </div>
        <div class="form-row mt-4">
          <div><span class="text-muted">Vida Útil:</span> ${asset.vidaUtil} años</div>
          <div><span class="text-muted">Años Consumidos:</span> ${asset.aniosConsumidos}</div>
          <div><span class="text-muted">Costo Reposición:</span> ${formatCurrency(asset.costoReposicion)}</div>
          <div><span class="text-muted">Previsión Mensual:</span> ${formatCurrency(previsionMensual)}</div>
        </div>
        <div class="asset-progress mt-4">
          <div class="asset-progress-bar ${pctDep < 40 ? 'good' : pctDep < 75 ? 'moderate' : 'poor'}" style="width:${Math.min(pctDep, 100)}%"></div>
        </div>
        <div class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-1)">Depreciación: ${pctDep.toFixed(1)}% consumida</div>
      </div>`;
  }).join('');

  el.querySelectorAll('[data-edit-asset]').forEach(btn => {
    btn.addEventListener('click', () => showAssetForm(page, parseInt(btn.dataset.editAsset)));
  });
  el.querySelectorAll('[data-del-asset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.delAsset);
      const inv = store.get('activos.inventario') || [];
      inv.splice(idx, 1);
      store.set('activos.inventario', inv);
      renderActivos(page);
      showToast('Activo eliminado', 'info');
    });
  });

  renderActivosChart(inventario);
}

function renderActivosChart(inventario) {
  const cats = {};
  for (const a of inventario) {
    cats[a.categoria] = (cats[a.categoria] || 0) + a.costoOriginal;
  }
  if (Object.keys(cats).length === 0) return;

  import('../../components/chart.js').then(({ renderChart }) => {
    renderChart('activosChartCanvas', {
      type: 'bar',
      data: {
        labels: Object.keys(cats),
        datasets: [{ label: 'Costo Original', data: Object.values(cats), backgroundColor: ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#0891b2'] }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  });
}
