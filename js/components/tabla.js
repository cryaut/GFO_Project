export function createTable(headers, rows, options = {}) {
  const { classes = '', striped = true } = options;
  const table = document.createElement('table');
  table.className = classes;

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const cell of row) {
      const td = document.createElement('td');
      if (typeof cell === 'object' && cell !== null) {
        td.textContent = cell.text ?? '';
        if (cell.className) td.className = cell.className;
        if (cell.align) td.style.textAlign = cell.align;
      } else {
        td.textContent = cell ?? '';
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}
