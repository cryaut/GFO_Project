# Reparación de totales y disponibilidad del motor

- **Estado**: Verificada localmente; sin push ni PR.
- **Responsable**: Solicitud de Cris, 2026-11-07.
- **Rama**: `codex/reparacion-totales-motor`.
- **Base**: Creada desde `origin/main` y avanzada a `0b91ac6` para conservar las tres entregas locales aún no publicadas. Se conserva la ampliación documental previa.

## Objetivo

Usar totales acreditados sin exigir desgloses innecesarios y permitir calcular conjuntos declarados completos sin introducir cuentas ficticias. Conservar N/D para importes desconocidos, datos parciales, errores de identidad y denominadores cero.

## Alcance autorizado

Cris autorizó expresamente comenzar la reparación y tocar el motor con cuidado. Esta autorización reemplaza la exclusión del motor de las rondas anteriores para esta tarea concreta. Las fórmulas de los 20 JSON y su generado se conservan; se cambia la resolución de datos y la comprobación del desglose. Se añade cobertura explícita por periodo/grupo y se permite declararla en Estados, conservando compatibilidad con archivos anteriores.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Total reportado independiente de comprobación incompleta | Completado |
| 2 | Cobertura explícita y demo sin cuentas ficticias | Completado |
| 3 | Regresiones, aceptación, prueba visual e informe final | Completado |

## Archivos compartidos

Se requieren cambios en el normalizador y presentación de Estados, `estados-calculations.js` (coherencia de cobertura), el motor/adaptador y el render de avisos de Análisis. `store.js`, las fórmulas de `calculate.js` y los 20 JSON/generado no requieren edición. Decisión registrada: D-099, con alcance limitado a esta reparación.

## Próximo paso

Revisión local por el usuario; publicación e integración siguen fuera del alcance autorizado. Los datos ya guardados requieren revisar su cobertura, no se migran por suposición. Se mantienen los N/D legítimos de crédito y periodo anterior.

## Entrega y verificación

- [Informe final de cambios, resultados y límites](INFORME-FINAL.md).
- **2155 pruebas en 72 archivos**, 21 nuevas; lint **0 errores/10 advertencias anteriores**.
- [Cálculos y comparación antes/después](verificacion-calculos.json): demo 2024 pasa de 3 a 19 indicadores disponibles de 24; RC 2.3542857143, UN 104825, ROA 12.8856791641 %, ROE 19.0581380022 %.
- Edge: regresión anterior reproducida y 16 combinaciones reparadas, sin errores de página ni desbordamiento global. Guardado/exportación, borrador IR vacío, cobertura reversible y total válido con aviso comprobados.

```powershell
node docs/planificacion/reparacion-totales-motor/verificar-motor.mjs
node docs/planificacion/reparacion-totales-motor/revisar-visual.cjs --antes
node docs/planificacion/reparacion-totales-motor/revisar-visual.cjs
```

El QA usa el Playwright existente del runtime de Codex (o `GFO_PLAYWRIGHT_PATH`) y Edge temporal; cierra navegador/servidor al terminar. Capturas y resultados visuales no se versionan.
