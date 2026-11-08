# Reparación de la auditoría independiente de ejemplos

- **Estado**: Verificada; preparada para revisión humana en PR #31.
- **Responsable**: Solicitud de Cris, 2026-11-07.
- **Rama**: `codex/reparacion-auditoria-ejemplos`, creada desde `origin/main` e incorporando el PR #31 auditado (`de788b7`).

## Objetivo

Corregir H-01 a H-05 del contraste independiente: EOAF/EFE que pierden cuentas reportadas, consumidores de UN divergentes y falsos ceros, ventas brutas no acreditadas y escenario docente Bartlett con premisas explícitas. Preservar N/D legítimos, datos originales, moneda y fórmulas existentes. Documentar causa, solución, pruebas y límites de cada hallazgo.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Reproducir fallos y definir contratos comunes | Completado |
| 2 | Reparar H-01 a H-04 con regresiones | Completado |
| 3 | Resolver H-05 sin inventar pagos o alterar escenarios existentes | Completado |
| 4 | Repetir contraste independiente, suite, lint y navegador | Completado |
| 5 | Informe, decisiones y documentación | Completado; revisión humana pendiente |

## Decisiones clave

No se cambió la respuesta esperada para ocultar un fallo: 70 celdas originales se contrastan antes/después. Las premisas docentes se incorporaron como escenario separado; el caso de flujo real de Bartlett permanece distinguible. Cris respondió «Corregir primero los cinco fallos»: los métodos nuevos de Proforma y los calendarios completos de caja quedan fuera. D-101 y D-102 registran selección de totales, UN compartida, N/D y base de compras declarada.

## Archivos que toca

Comprobación de EOAF/EFE, consumidores de UN (Inicio/Mercado), motor/adaptador y catálogos. Tres JSON admiten compras declaradas con la fórmula anterior como alternativa; generado mediante script. Análisis cambia solo la precisión visible de cuatro resultados en días. Son cambios necesarios para los fallos reproducidos, detallados en el informe. `calculate.js`, `store.js`, router y dependencias se conservan.

## Próximo paso

Carlos debe revisar el PR #31 y sus entregas dependientes; no hay merge automático. El directorio principal conserva documentos ajenos pendientes, excluidos del commit de reparación.

## Entrega y validación

- [Informe por hallazgo y contraste docente](INFORME-FINAL.md).
- [Constancia](validacion.json): **2192 pruebas / 74 archivos**, 22 regresiones focalizadas y una prueba adicional de política de la nueva cuenta; lint **0 errores / 10 advertencias anteriores**.
- [Contraste independiente](verificacion-independiente/resumen.json): **2391 comprobaciones**, 2252 coincidencias y 139 N/D justificados, sin diferencias.
- [Antes/después](verificacion-independiente/antes-despues.json): 70 errores originales corregidos sin cambiar esperados; cinco resultados con premisas docentes comprobados por separado.
- [Edge](verificacion-visual.json): cinco casos, 45 vistas y cuatro variantes de pantalla/tema; sin errores JS ni desbordamiento global. Capturas de escritorio y móvil inspeccionadas; servidor y perfil temporales cerrados al finalizar.
