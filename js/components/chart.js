let chartInstances = {};

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

  const theme = document.documentElement.getAttribute('data-theme');
  const textColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

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

  chartInstances[canvasId] = new Chart(canvas, config);
  return chartInstances[canvasId];
}

export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(destroyChart);
}
