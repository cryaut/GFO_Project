export function exportJSON(data, filename = 'gfo-export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function exportCSV(rows, headers, filename = 'gfo-export.csv') {
  const escape = (v) => {
    let s = String(v ?? '');
    // Las etiquetas son texto aunque comiencen como una fórmula de una hoja de cálculo.
    // Los importes numéricos (incluidos negativos) conservan su tipo y valor.
    if (typeof v === 'string' && (/^[\s]*[=+\-@]/.test(s) || /^[\t\r\n]/.test(s))) s = "'" + s;
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  const csv = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportHTML(htmlContent, filename = 'gfo-report.html') {
  const full = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GFO Toolkit — Reporte</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto;padding:2rem;color:#1e293b}
  h1{color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:.5rem}
  table{width:100%;border-collapse:collapse;margin:1rem 0}
  th,td{border:1px solid #e2e8f0;padding:.5rem;text-align:left;font-size:.875rem}
  th{background:#f1f5f9;font-weight:600}
  tr:nth-child(even){background:#f8fafc}
  .positive{color:#16a34a}
  .negative{color:#dc2626}
  @media print{body{padding:0}}
</style>
</head>
<body>
${htmlContent}
<footer style="margin-top:2rem;font-size:.75rem;color:#94a3b8">Generado por GFO Toolkit</footer>
</body>
</html>`;
  const blob = new Blob([full], { type: 'text/html' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (e) {
        reject(new Error('Archivo JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
}
