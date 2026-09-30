let chartInstances = {};

// Colores de ejes y leyenda tomados de las variables del tema activo (css/variables.css).
function themeColors() {
  const fallback = document.documentElement.getAttribute('data-theme') === 'dark'
    ? { text: '#94a3b8', grid: '#334155' }
    : { text: '#475569', grid: '#e2e8f0' };
  const styles = typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement) : null;
  const leer = (name, def) => styles?.getPropertyValue(name).trim() || def;
  return { text: leer('--text-secondary', fallback.text), grid: leer('--border-color', fallback.grid) };
}

export function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

export function renderChart(canvasId, config) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const { text: textColor, grid: gridColor } = themeColors();

  if (config.options) {
    config.options.responsive = true;
    config.options.maintainAspectRatio = false;
    if (config.options.plugins) {
      config.options.plugins.legend = config.options.plugins.legend || {};
      config.options.plugins.legend.labels = { color: textColor, ...config.options.plugins.legend.labels };
    }
    if (config.options.scales) {
      for (const axis of Object.keys(config.options.scales)) {
        config.options.scales[axis].ticks = { color: textColor, ...config.options.scales[axis].ticks };
        config.options.scales[axis].grid = { color: gridColor, ...config.options.scales[axis].grid };
      }
    }
  }

  const Chart = window.Chart;
  if (!Chart) {
    console.warn('Chart.js not loaded');
    return null;
  }

  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  // Texto por defecto (gráficas sin ejes configurados, p. ej. dona o pastel).
  Chart.defaults.color = textColor;
  chartInstances[canvasId] = new Chart(canvas, config);
  chartInstances[canvasId].$temaColores = { text: textColor, grid: gridColor };
  return chartInstances[canvasId];
}

// Al cambiar de tema: recolorea ejes y leyendas de las gráficas abiertas sin volver a
// iniciar su pantalla (se conservan formularios y borradores). Solo cambia los colores
// que puso renderChart; los que definió el módulo se respetan.
export function refreshChartsTheme() {
  const { text, grid } = themeColors();
  if (window.Chart) window.Chart.defaults.color = text;
  for (const chart of Object.values(chartInstances)) {
    const previos = chart.$temaColores;
    if (!previos) continue;
    const opts = chart.options || {};
    const legend = opts.plugins?.legend?.labels;
    if (legend && legend.color === previos.text) legend.color = text;
    for (const scale of Object.values(opts.scales || {})) {
      if (scale.ticks && scale.ticks.color === previos.text) scale.ticks.color = text;
      if (scale.grid && scale.grid.color === previos.grid) scale.grid.color = grid;
    }
    chart.$temaColores = { text, grid };
    chart.update('none');
  }
}

export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(destroyChart);
}
