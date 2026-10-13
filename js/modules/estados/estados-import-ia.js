// Contrato para un servicio futuro. No hay proveedor, clave ni peticiones de red.
export const IMPORT_AI_STATUS = Object.freeze({
  enabled: false, reason: 'Pendiente de configuración del servicio y de una API key.'
});

export function buildImportAIRequest(session) {
  return {
    version: 1,
    accounts: session.rows.filter(row => !row.ignored && (!row.group || !row.type))
      .map(row => ({ id: row.id, name: row.account, group: row.group, sheet: row.sheet, row: row.line })),
    responseFields: ['id', 'group', 'type', 'explanation'],
    requiresHumanReview: true
  };
}

export async function suggestImportAccounts(_request) {
  throw new Error(`Asistencia con IA deshabilitada. ${IMPORT_AI_STATUS.reason}`);
}
