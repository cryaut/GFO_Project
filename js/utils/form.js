// Utilidades de formularios para las pantallas: sin DOM ni store.

// Número escrito por el usuario: '.' decimal, ',' de miles y prefijo C$ opcional.
// Devuelve { vacio: true, valor: null } si el campo está vacío y { vacio: false, valor: null }
// si el texto no es un número finito.
export function leerNumero(texto) {
  const limpio = String(texto ?? '').replace(/C\$/gi, '').replace(/\s+/g, '');
  if (!limpio) return { vacio: true, valor: null };
  if (!/^-?((\d{1,3}(,\d{3})+|\d+)(\.\d+)?|\.\d+)$/.test(limpio)) return { vacio: false, valor: null };
  const valor = Number(limpio.replace(/,/g, ''));
  return { vacio: false, valor: Number.isFinite(valor) ? valor : null };
}

// Identificador único para filas guardadas (productos, movimientos, ingresos…).
export function nuevoId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Fecha local de hoy en formato AAAA-MM-DD (toISOString daría la fecha UTC).
export function fechaHoy(fecha = new Date()) {
  const dos = n => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}
