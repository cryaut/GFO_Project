import { escapeHTML } from '../../utils/html.js';
import { obtenerCuenta } from '../estados/cuentas-identificador.js';

const NOMBRES = {
  RC: 'Ratio corriente', RR: 'Ratio rápido', RotInv: 'Rotación de inventario', RotCxC: 'Rotación de CxC',
  PPC: 'Plazo de cobro', endeudamiento: 'Endeudamiento', MN: 'Margen neto', ROA: 'ROA', roe: 'ROE',
  margenBruto: 'Margen bruto', margenOperativo: 'Margen operativo', coberturaIntereses: 'Cobertura de intereses',
  deudaPatrimonio: 'Deuda / patrimonio', cicloConversion: 'Ciclo de conversión', edadInventario: 'Edad de inventario',
  plazoPago: 'Plazo de pago', rotacionActivosFijos: 'Rotación de activos fijos', rotacionCxP: 'Rotación de CxP',
  rotacionActivos: 'Rotación de activos',
  pruebaDefensiva: 'Prueba defensiva', rotacionCapitalTrabajo: 'Rotación del capital de trabajo',
  apalancamiento: 'Apalancamiento', solvencia: 'Solvencia'
};
const MOTIVOS = {
  missing_required_account_data: 'Falta un importe que el motor exige. Revise si el ejercicio lo proporciona.',
  missing_required_period_balance: 'El motor exige el periodo anterior para esta razón de flujo.',
  composicion_no_declarada: 'Declare en Estados si otros ingresos excluyen los intereses ganados.',
  composicion_incluye_intereses: 'Separe los intereses ganados de otros ingresos para evitar contarlos dos veces.',
  ambiguous_account_match: 'Confirme la identidad de la cuenta en Estados.',
  unrecognized_imported_account: 'Identifique la cuenta en Estados antes de calcular.',
  zero_denominator: 'El denominador es cero; esta razón conserva N/D.',
  documento_no_normalizable: 'Revise el formato de los estados guardados.',
  periodo_no_disponible: 'El periodo solicitado no está disponible.',
  estados_no_legibles: 'Revise el aviso de lectura de los estados guardados.',
  reported_subtotal_unverifiable: 'Se usa el total reportado. Su desglose está incompleto o no permite comprobarlo.',
  reported_subtotal_mismatch: 'Se usa el total reportado, pero difiere del desglose calculable. Revise la fuente.'
};

export function disponibilidadRazones(razones) {
  const pendientes = Object.keys(NOMBRES).filter(c => razones[c] === null);
  const causas = new Map();
  const avisos = new Map();
  for (const m of razones.notAvailableReasons || []) {
    const advertencia = ['reported_subtotal_unverifiable', 'reported_subtotal_mismatch'].includes(m.motivo);
    const grupo = advertencia && typeof razones[m.campo] === 'number' && NOMBRES[m.campo] ? avisos
      : !advertencia && pendientes.includes(m.campo) ? causas : null;
    if (!grupo) continue;
    const cuentas = (m.operandos || []).map(id => obtenerCuenta(id)?.nombreCanonico).filter(Boolean);
    const mensaje = MOTIVOS[m.motivo] || 'El cálculo requiere revisar sus datos de origen.';
    const clave = JSON.stringify([mensaje, cuentas, m.periodo]);
    if (!grupo.has(clave)) grupo.set(clave, { mensaje, cuentas, periodo: m.periodo, campos: new Set() });
    grupo.get(clave).campos.add(NOMBRES[m.campo]);
  }
  const detalle = (titulo, descripcion, filas) => `<details class="analisis-availability"><summary>${titulo}</summary>
    <p>${descripcion}</p>
    <div class="table-wrapper"><table><thead><tr><th>Qué revisar</th><th>Periodo</th><th>Indicadores afectados</th></tr></thead>
    <tbody>${[...filas.values()].map(c => `<tr><td>${escapeHTML(c.mensaje)}${c.cuentas.length ? `<br><strong>${c.cuentas.map(escapeHTML).join(', ')}</strong>` : ''}</td>
      <td>${escapeHTML(c.periodo ?? 'N/D')}</td><td>${[...c.campos].map(escapeHTML).join(', ')}</td></tr>`).join('')}</tbody></table></div></details>`;
  return (pendientes.length ? detalle(`Por qué hay resultados N/D (${pendientes.length})`,
    'N/D no significa cero. Esta lista explica los datos requeridos por el motor; no agrega cuentas ni supone importes.', causas) : '')
    + (avisos.size ? detalle('Resultados con advertencias',
      'Estos resultados están disponibles. Los avisos de comprobación no los convierten en N/D.', avisos) : '');
}
