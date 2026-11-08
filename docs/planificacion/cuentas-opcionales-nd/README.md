# Cuentas opcionales y diagnóstico de N/D

El diagnóstico histórico de esta carpeta se continúa en la [reparación del motor y su informe final](../reparacion-totales-motor/INFORME-FINAL.md). Los conteos y el alcance siguientes corresponden a la entrega de diagnóstico anterior a D-099.

- **Estado**: Verificada localmente; sin push ni PR.
- **Responsable**: Solicitud de Cris.
- **Rama**: `codex/cuentas-opcionales-diagnostico-nd`.
- **Última actualización**: 2026-11-07.

## Objetivo

Compactar cuentas accesorias sin movimiento sin ocultar resultados calculados, separar BG/ER en AH y explicar por qué el ejemplo predeterminado MUNO MODA produce N/D. El usuario confirmó que se refiere al ejemplo del botón de Estados.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Rastrear demo, importación y políticas del motor | Completado |
| 2 | Cuentas opcionales en desplegable y BG/ER separados | Completado |
| 3 | Informe reproducible, propuesta y pruebas | Completado |

## Alcance y coordinación

Rama creada desde `origin/main` (`19c5c6f`), seguida de avance rápido a la rama local anterior (`8197215`), porque continúa sus cambios aún no publicados. Se edita el render compartido de Estados y `js/modules/analisis/index.js` por necesidad expresa de esta tarea. Se conservan datos, exportación, motor de razones, generado y JSON. La corrección de las políticas financieras se propone después del diagnóstico, no se aplica de forma implícita.

## Próximo paso

Revisar la [propuesta financiera posterior al diagnóstico](DIAGNOSTICO-Y-PROPUESTA.md). Las políticas de cobertura/no-aplica/no-informado, una demo completa acreditada y el control del primer periodo no se implementan en esta entrega. El motor y sus archivos siguen intactos.

## Ampliación solicitada: totales suficientes

2026-11-07: se amplió el mismo reporte para registrar el problema como deficiencia funcional del motor y su integración, no solo de la demo. Se verificó que RC sí usa AC/PC reportados sin exigir detalle; la demo muestra totales calculados por otro lector que no llegan al motor con cobertura acreditada. También se reprodujo UN reportada bloqueada por la evaluación innecesaria de su desglose. Se propone resolver agregados suficientes y separar cálculo de comprobación antes de completar la demo. Solo se modifican documentación y scripts de diagnóstico; la app conserva los cálculos anteriores.

`comprobar-totales.mjs` verifica ocho casos controlados y los dos periodos de la demo, con resultados en `evidencia-totales.json`. Todos los casos pasaron sus aserciones de caracterización actual; no equivalen a aprobar como deseados los N/D que documentan el defecto. Esta ampliación no requiere repetir la suite de la app porque no cambia su código.

## Resultado y validación

- D-098: cuentas accesorias sin movimiento en desplegable cerrado; se conservan edición y datos. Subtotales y razones cero/N/D siempre visibles. Si hay movimiento en otro periodo, se conserva la cuenta en el editor y AV; AH y la vista multiperiodo examinan sus columnas.
- AH con tablas distintas para BG, ER y datos complementarios/pendientes. Razones añade un diagnóstico legible de sus 23 indicadores y corrige la nota del primer periodo sin cambiar cálculos.
- Demo confirmada por el usuario: disponibles 1/24 en 2023 y 3/24 en 2024. Se identificaron 17 componentes BG, cuatro ER, composición, crédito y reglas temporales; contrafactuales sintéticos separados en [evidencias](evidencias.json).
- **2134/2134 pruebas, 70 archivos**. Lint: **0 errores y 10 advertencias preexistentes**. `git diff --check` limpio.
- Edge: regresión reproducida antes y 16 combinaciones después (Estados/AH/AV/Razones × escritorio/móvil × claro/oscuro), sin errores ni desbordamiento global. Verificados despliegue con teclado, edición de cuenta compactada, persistencia sin cambios al consultar y margen bruto calculado cero visible. Capturas/resultados locales ignorados por Git.

## Reproducir

```powershell
node docs/planificacion/cuentas-opcionales-nd/diagnosticar.mjs
node docs/planificacion/cuentas-opcionales-nd/comprobar-totales.mjs
node docs/planificacion/cuentas-opcionales-nd/revisar-visual.cjs --antes
node docs/planificacion/cuentas-opcionales-nd/revisar-visual.cjs
```

El QA usa el Playwright ya instalado en el runtime de Codex (o `GFO_PLAYWRIGHT_PATH`), Edge temporal y un servidor propio que cierra al terminar. No instala dependencias, no toca el perfil del usuario y no sustituye sus datos en la app activa.
