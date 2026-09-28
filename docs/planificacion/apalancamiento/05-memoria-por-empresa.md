# 05 — Memoria por empresa

- **Estado**: Pendiente (opcional, fuera del MVP)
- **Fecha**: 2026-09-27
- **Depende de**: 04

## Objetivo

Que la clasificación de costos y el DAP de una empresa se reutilicen cuando se cargan de nuevo sus estados, aunque entre medio se haya trabajado con otra empresa. Es el CP5 de la ficha.

## Cambio propuesto

Hoy (paso 03) `apalancamiento` guarda una sola clasificación, la de los estados cargados. El CP5 la guarda por empresa, con `estados.name` como clave:

```js
apalancamiento: {
  tasaDefecto: 0.30,
  empresas: {
    'MUNO MODA S.A.': { comportamiento: { … }, dap: { … } }
  }
}
```

- Al entrar a la pantalla, se usa la entrada de la empresa cargada; si no existe, se empieza con las sugerencias.
- Migración: la clasificación única del paso 03 pasa a la empresa que esté cargada. Es un cambio en la forma de datos guardados, así que necesita su test y se anota en `docs/contexto/arquitectura.md`.

## Checkpoint

- [ ] Cargar la empresa A, clasificar, cargar la B y volver a la A: la clasificación de A sigue ahí.
- [ ] Los datos guardados con la forma del paso 03 se migran sin pérdida.
- [ ] Tests en verde; `npm test` y `npm run lint` sin errores.

## Preguntas abiertas

1. **Identidad de la empresa.** `estados.name` puede repetirse o cambiar entre cargas. Propuesta: usarlo en el MVP de este paso y avisar si dos cargas distintas tienen el mismo nombre.
2. **Relación con la pregunta 3 del paso 00** (cuentas no reconocidas). Si Estados pasa a marcar cuentas dudosas en lugar de detenerse, la memoria podría guardar también esas clasificaciones. Se decide con Cris.

## Próximo paso

Feature completa.
