import { ESPECIFICACION_RAZONES } from './especificacion-razones.js';

// Solo presentación: el resultado del intérprete conserva toda su precisión.
export function formatearResultadoRazon(id, resultado, especificacion = ESPECIFICACION_RAZONES) {
  if (resultado.valor === null || !Number.isFinite(resultado.valor)) return 'N/D';
  const doc = especificacion[id];
  const unidad = doc.razon.unit;
  const formato = doc.presentacion;
  const numero = resultado.valor * (unidad === 'porcentaje' ? 100 : 1);
  const [entero, fraccion] = numero.toFixed(formato.decimales[unidad]).split('.');
  return entero.replace(/\B(?=(\d{3})+(?!\d))/g, formato.separador_miles)
    + (fraccion === undefined ? '' : formato.separador_decimal + fraccion)
    + (unidad === 'porcentaje' ? formato.sufijo_porcentaje : '');
}
