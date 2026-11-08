# Revisión opcional para integrar

- **Responsable:** solicitud expresa de Cris, 2026-11-08.
- **Rama:** `codex/revision-opcional`, desde `origin/main`.
- **Estado:** Validada; configuración de GitHub aplicada.

Se elimina el requisito de aprobación de otra persona para hacer merge. AGENTS.md y la guía de flujo de trabajo conservan PR obligatorio, pruebas/lint, merge commit y autorización del usuario para integrar con IA. Si existen observaciones, deben leerse y atenderse; no se borra su historial.

GitHub: cambiar exclusivamente `required_approving_review_count` de 1 a 0. Se conservan el requisito de PR, resolución de conversaciones y las demás protecciones, incluidos force push/borrado bloqueados. La revisión sigue disponible como opción.

Decisión D-103. Esta tarea cambia reglas y documentación; no modifica la aplicación ni integra PR de funcionalidades.

Validación: 2096 pruebas en 66 archivos, cero fallos; lint 0 errores y 10 advertencias anteriores. GitHub confirma cero aprobaciones obligatorias y ninguna otra protección modificada. Evidencia en `validacion.json`.
