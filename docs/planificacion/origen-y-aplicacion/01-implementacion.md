# 01 — Implementación

- **Estado**: Completado
- **Fecha**: 2026-10-09
- **Depende de**: 00

## Objetivo

Implementar el EOAF completo (lógica, pantalla y pruebas) en la rama `origen-y-aplicacion`.

## Decisiones

- `js/modules/analisis/eoaf-calculations.js` con lógica pura (sin DOM ni `store`), como `apalancamiento-calculations.js`; `computeEOAF`/`renderEOAFSection` quedan en `index.js`.
- `computeEOAF` ahora devuelve `{ periodos, incompleto?, secciones, resumen, advertencias, interpretacion }`; `js/modules/analisis/eoaf.js` sigue reexportándolo sin cambios.
- Saldo ausente en un periodo = "Dato faltante" (nunca 0); cuenta sin tipo = "Sin clasificar"; depreciación que cambia de signo = "Revisar" (D-023).
- Los nombres de cuenta se escapan con `escapeHTML` antes de insertarlos en `innerHTML`.

## Checkpoint

- [x] `npx vitest run tests/unit/eoaf.test.js` en verde (24 pruebas).
- [x] `npm test` completo en verde (399 pruebas) y `npm run lint` sin errores.
- [x] Demo MUNO MODA 2023 → 2024: orígenes = aplicaciones = C$ 97,775.
- [x] Documentación actualizada: CHANGELOG, api.md, dominio-financiero.md, arquitectura.md, decisiones.md (D-021 a D-023), manual-usuario.md y esta ficha.

## Preguntas abiertas

- Falta el visto bueno del equipo sobre D-021 a D-023 (entradas marcadas "pendiente de revisión").
- Bug preexistente fuera de alcance: la tabla de estructura de razones no escapa nombres de cuenta (ver "Fuera de alcance" de la ficha).

## Próximo paso

Abrir el PR hacia `main` y esperar revisión. Etapa 2 (`flujo-de-efectivo`) solo con autorización de Henry.
