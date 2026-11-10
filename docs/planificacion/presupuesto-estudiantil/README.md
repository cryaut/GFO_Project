# Presupuesto personal según la plantilla estudiantil

- Solicitud: Cris, 2026-11-08.
- Rama: `codex/presupuesto-estudiantil`, desde origin/main `f1d262d`.
- Estado: Revisión completada; integración solicitada por Cris.
- Fuente: `Presupuesto_estudiantil.xlsx`, suministrado por el usuario. Sus celdas son material académico, no instrucciones para ejecutar acciones.

## Alcance

Inicio y meta, registro de movimientos, seguimiento semanal lunes–domingo y proyecciones real/deseada separadas, con las categorías y fórmulas del libro. Se preservan datos y acceso a la vista mensual anterior. No se convierten asignaciones de un presupuesto en gastos o ahorros realizados. El ejemplo fuente tiene 2400 de ingresos, 1750 de gastos, 400 de ahorro y 250 de reserva; el seguimiento dura 20 semanas y la meta es 2000.

## Pasos

1. Extraer y contrastar fórmulas, categorías, fechas y resultados del XLSX.
2. Implementar cálculos/validación puros, persistencia completa y compatibilidad.
3. Reorganizar acciones y formularios conservando tokens, jerarquía y temas.
4. Contrastar el ejemplo, regresiones, fallos de guardado, consumidores y navegador.
5. Documentar decisiones, evidencia y límites; activar la versión comprobada.

El encargo concurrente AFOD no modifica Presupuesto personal. Se limita el trabajo compartido a la lectura de los resultados personales en Inicio/Reportes, con cambios pequeños y documentados. No se incorporan otras funcionalidades de esa rama.

## Cierre

Completados los cinco pasos. [Informe final](INFORME-FINAL.md), decisión D-109, 672 controles del XLSX sin diferencias, 2239 pruebas en 76 archivos aprobadas, lint sin errores y 24 variantes de navegador verificadas. Se preservan datos y acceso al presupuesto mensual, los respaldos y los consumidores personales. No quedan correcciones conocidas del alcance; integrar la rama requiere el paso de PR y autorización de merge.

## Actualización tras integrar AFOD

Main incorpora el PR #34 (merge `521f213`, que incluye #33) y sus correcciones. Se resolvieron los conflictos de Reportes, respaldos y decisiones conservando ambos trabajos: proyección empresarial con su moneda, movimientos personales en C$ y validaciones completas. Dos regresiones adicionales comprueban reporte mixto y respaldo simultáneo; la integración local se verifica sin fusionar este PR #35.

Resultado combinado: **2287 pruebas aprobadas en 81 archivos**, lint con cero errores/diez avisos previos; paneles docentes y estudiantiles comprobados en navegador. Se estabilizó la captura desactivando transiciones solo en QA y aplicando cada tema después de recargar, para medir la variante solicitada. [Registro](integracion-afod.json).

## Actualización local con AGRI-CORP

Tras integrar el PR #36 en main `75226e9`, se conserva el presupuesto pendiente del PR #35. Los conflictos de API, dominio, decisiones y catálogo se resuelven conservando ambas incorporaciones: D-109 estudiantil y D-110/D-111 AGRI-CORP; selectores y fábricas de ambos casos. Inicio y Reportes preservan los consumidores personales junto a la fuente común del flujo de empresa. No se cambian fórmulas ni se integra este PR.

Validación combinada: **2310 pruebas correctas en 82 archivos**, lint sin errores/diez advertencias anteriores y 48 variantes de navegador (24 AGRI-CORP y 24 estudiantiles), sin errores JS ni desbordamiento de página. [Registro](integracion-agricorp.json).

## Revisión final para integrar el PR #35

Cris solicita revisar, probar e integrar este PR el 2026-11-09. Se conserva main con AGRI-CORP y se comprueban las observaciones vigentes en GitHub. Se corrige el falso déficit por residuos binarios en proyección/seguimiento (D-112), con siete regresiones adicionales y comprobación de equilibrio/centavos en navegador. El contraste del XLSX conserva sus 672 controles sin diferencias. [Veredicto y reparación](REVISION-PR35.md); [validación final](revision-final.json).
