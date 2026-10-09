# 00 — Alcance y diseño

- **Estado**: Completado
- **Fecha**: 2026-10-09
- **Depende de**: —

## Objetivo

Auditar el EFE existente y rediseñarlo para que muestre las tres actividades derivadas de dos balances, con comprobación.

## Lo que había

`computeEFE(period)` solo calculaba el CFO con tres ajustes de capital de trabajo (Inventario, CxC, CxP + Provisiones), sin depreciación, sin inversión, sin financiamiento y sin comprobación contra la variación de efectivo. D-012 mantuvo `#/flujo` (método directo) separado y dejó esta derivación "como mejora coordinada con Henry"; la propuesta 3 de `modulos-guia/02-valor-agregado.md` la aprobó.

## Decisiones

- Nuevo módulo puro `js/modules/analisis/efe-calculations.js` (D-024): `TOLERANCIA_EFE`, `seleccionarPeriodoEFE`, `esResultadoAcumulado`, `construirEFE`, `interpretarEFE`.
- Operación: UN(ER del periodo final) + depreciación (Δ de la magnitud de la depreciación acumulada) − ΔInventario − ΔCxC − ΔACOtros + ΔCxP + ΔProvisiones.
- Inversión: −Δ activos fijos brutos (el reembolso de una baja entra como positivo).
- Financiamiento: +Δ pasivo largo plazo (incluye "Otros Pasivos" por inferencia), +Δ pasivo corto plazo; con cuentas de resultados acumuladas, aportaciones = ΔPatrimonio − ΔRE y dividendos = UN − ΔRE; sin ellas, ΔPatrimonio total con la UN descontada y advertencia (D-025). Ambas formas reconcilian exactamente.
- Identidad comprobada: CFO + CFI + CFF = Δ efectivo, con tolerancia `TOLERANCIA_EFE` = 0.01 + epsilon escalado. Estados: `cuadra`, `no-cuadra` (diferencia exacta), `incompleta` (motivos: cuenta sin saldo, sin clasificar, sin ER, sin efectivo). Nunca se inventan datos ni se ajustan cifras.
- Intereses e impuestos quedan dentro de la UN (nota al usuario).
- Tipo de cuenta ausente en la empresa → Δ = 0; tipo presente con saldo faltante → N/D y motivo.

## Cálculos de referencia (para las pruebas)

- Demo MUNO MODA 2023→2024: CFO 97,775; CFI 0; CFF −90,775 (deuda LP −55,775, CP +5,000, dividendos −40,000); Δ efectivo 7,000 → cuadra.
- Sintético 2024→2025 (Efectivo 100→130, CxC 40→30, Inv 50→65, Equipo 200→260, Dep −80→−104, CxP 60→70, Préstamo 100→120, Capital 100, UtilAcum 50→91, UN 66): CFO 95; CFI −60; CFF −5 (préstamo +20, dividendos −25); total 30 = Δ efectivo.

## Checkpoint

- [x] `npm test` y `npm run lint` sin errores (390 pruebas, 0 errores de lint).

## Preguntas abiertas

- Ninguna bloqueante. El conflicto de merge con `origen-y-aplicacion` en `analisis/index.js` se resuelve al integrar.

## Próximo paso

Revisión del equipo; PR hacia `main`.
