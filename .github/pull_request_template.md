<!-- Completa cada sección. Si una no aplica, escribe "No aplica". Reglas: AGENTS.md y docs/reglas/. -->

## Qué cambia

<!-- Dos o tres líneas: qué hace este PR y por qué. -->

## Feature

<!-- Nombre y ficha, por ejemplo: apalancamiento, docs/planificacion/apalancamiento/README.md -->

## Archivos compartidos que toca

<!-- calculate.js, store.js, estados-calculations.js, analisis/index.js, app.js, index.html o CHANGELOG.md. Explica por qué hacía falta. -->

## Cómo se probó

- [ ] `npm test` en verde (cantidad de tests: )
- [ ] `npm run lint` sin errores
- [ ] Probado en el navegador con `node scripts/dev-server.cjs` (qué pantalla y con qué datos):

## Checklist

- [ ] La rama está al día con `main` (`git merge origin/main`)
- [ ] Busqué funciones existentes antes de crear nuevas; no hay dos funciones para el mismo concepto
- [ ] Las funciones nuevas devuelven `null` (N/D) cuando falta un dato y usan `DIAS_ANIO` para los días
- [ ] Todo texto del usuario o de archivos pasa por `escapeHTML`
- [ ] `CHANGELOG.md`, `docs/api.md` y el catálogo de funciones actualizados si corresponde
- [ ] Ficha de la feature actualizada
- [ ] Decisiones discutibles registradas en `docs/decisiones.md`

## Pendiente o riesgos

<!-- Lo que no se hizo, problemas vistos fuera del alcance y decisiones que el equipo debe tomar. -->
