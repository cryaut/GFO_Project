# Inicio en blanco y navegación tras un error

- **Estado**: Implementada y comprobada para integración
- **Responsable**: Corrección solicitada por Cris; ejecución con Codex
- **Rama**: `codex/fix-inicio-navegacion`
- **Última actualización**: 2026-11-06

## Objetivo
Corregir Inicio en blanco cuando el EFE no está disponible y evitar que un error de una pantalla impida cambiar de sección. Trabajo separado de AFOD; no se inicia R2 ni se cambian fórmulas o datos financieros.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Reproducir con EFE no disponible y comprobar el arranque del router | Completado: seis regresiones fallaron antes de la corrección |
| 2 | Corregir Inicio y conservar navegación ante errores | Completado localmente |
| 3 | Pruebas de regresión, suite y lint | Completado: 2015 pruebas/60 archivos, lint sin errores y 10 advertencias heredadas |
| 4 | Recorrido en navegador real | Completado: Edge headless con perfil desechable; 14 rutas, reintento y navegación tras fallo |

## Decisiones clave
Un flujo marcado `disponible: false` no tiene totales ni debe convertirse en una evaluación de salud financiera. Inicio conserva el faltante que ya ofrece Proforma. El router muestra un aviso ante errores de pantalla y conserva acceso al menú; no se alteran estados guardados ni cálculos.

Decisión de recuperación del router: D-094, sin ocupar D-087 a D-093 usados en otras ramas. La corrección toca el archivo compartido `app.js` por necesidad del fallo; el alcance se notificó a Cris antes de editarlo. No se cambiaron rutas ni módulos financieros.

## Archivos que toca
`js/modules/inicio/inicio-calculations.js`, `js/app.js` (compartido, cambio necesario por la inicialización de la navegación), pruebas de Inicio/router y registro de la corrección en documentación. Los documentos previos de auditoría y AFOD se conservan.

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | Reproducción, corrección y validación automática | Completado |

## Evidencia de validación

- Antes del cambio: `npx.cmd vitest run tests/unit/inicio-navegacion.test.js tests/unit/inicio.test.js` produjo seis fallos por lectura de `flujo.neto.operacion` o excepción sin capturar.
- Después: pruebas de módulos reales con frontera DOM simulada comprueban Inicio vacío, navegación Inicio→Inventario→Mercados→Inicio sin refrescar, recuperación de error inicial, error al cambiar de sección y botón de reintento.
- Se comprueban los tres motivos de EFE no disponible y que un EFE disponible mantiene sus indicadores y evaluación.
- Suite completa: `npm.cmd test -- --reporter=dot`, 2015 pruebas en 60 archivos, salida0, duración42.53 s. Siete pruebas nuevas frente a la base2008.
- `npm.cmd run lint`: salida0, 0 errores y las10 advertencias anteriores. `git diff --check` sin errores.
- No se afirma una revisión visual: el navegador integrado no pudo conectar al servidor local y el acceso nativo a Edge se detuvo por no poder comprobar su URL. No se intentó eludir la restricción. El servidor temporal de puerto8081 se detuvo al terminar ese intento.
- No hay cambios al motor de razones, generado, JSON financieros, store ni cálculos de AFOD. Los documentos de las rondas previas permanecen locales.

## Próximo paso
Publicar e integrar por PR con la excepción puntual de revisión autorizada expresamente por Cris para las correcciones prioritarias. La corrección no inicia R2 de AFOD.

## Validación final · 2026-11-07

La corrección local se publica separada sobre main con #26, #29 y #27 integrados. Resultado: **2096/2096 pruebas**, 66 archivos; lint 0 errores y 10 advertencias existentes.

[Verificación reproducible](revisar-integracion.cjs): `node docs/planificacion/inicio-navegacion/revisar-integracion.cjs`. Edge con perfil desechable comprueba Inicio vacío, las 14 rutas sin recargar y un fallo de inicialización inducido; se muestra el aviso, funciona Volver a intentar y la navegación sigue activa. Sin errores de página. Se usa Playwright del runtime existente, sin agregar dependencias; servidor y navegador se cierran. Este resultado cierra la comprobación visual pendiente del intento anterior, sin usar el perfil ni datos del usuario.
