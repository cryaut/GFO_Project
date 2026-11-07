# Análisis completo y presentación docente

- **Estado**: Implementada, en revisión
- **Rama**: `codex/analisis-docente`
- **Base**: `9730f6d` (main con el diseño de Estados `0d9caf7`, integrado mediante PR #28).
- **Solicitud**: revisar todas las secciones de Análisis, mejorar su diseño y completar AH/AV y el procedimiento DuPont.

## Alcance

AH y AV deben incluir todas las cuentas conservadas, con sus nombres propios. DuPont debe mostrar operandos, factores, ROA y ROE, y contrastarlos con las fórmulas directas. Se mantienen las convenciones existentes donde las fuentes no acreditan otra. El motor de razones y el generado no se editan. No se ejecuta AFOD R2.

## Fuentes

Carpeta docente `../TEAM.md`: guía actualizada, transcripciones de DuPont, razones, estados y flujo. Las transcripciones que solo dicen «Imagen de la diapositiva» no permiten reconstruir fórmulas. Se consulta también la auditoría local anterior, sin tratarla como fuente primaria.

## Pasos

1. Completado: [revisión de las nueve secciones](01-revision-docente.md), con fuentes y diferencias explícitas.
2. Completado: AH/AV incluyen todas las cuentas; DuPont muestra operandos, factores, ROA/ROE y comprobaciones. D-095 registra cobertura y coherencia de fuentes.
3. Completado: Impeccable en modo Operate, identidad y tokens existentes. Navegación en tres grupos, selector de periodo, métodos desplegables, contenedores redondeados y tablas con desplazamiento interno. Razones agrupadas por familia. Entradas alineadas a la izquierda.
4. Completado: 10 regresiones nuevas, 2025 pruebas en 62 archivos sobre el árbol local (incluye siete pruebas de cambios anteriores de Inicio, fuera de esta feature); lint 0 errores y 10 advertencias preexistentes.

Verificación adicional del contenido preparado en una copia aislada: **2018/2018 pruebas, 61/61 archivos**, lint sin errores (10 advertencias preexistentes), sin incorporar los cambios anteriores de Inicio/AFOD. La instantánea de código verificada es `eb5025ec0695006c9b58b6ff29ad7b7946ca0797`; después solo se agrega esta constancia documental.

## Navegador

[Script reproducible](revisar-visual.cjs): `node docs/planificacion/analisis-docente/revisar-visual.cjs`, con Edge y Playwright del runtime existente, o `GFO_PLAYWRIGHT_PATH` para indicar otra instalación. Sin nuevas dependencias de la app. El servidor y navegador se cierran al finalizar; se usan contextos nuevos sin perfil del usuario.

54 escenarios: las nueve secciones × 1440/390/320 px × claro/oscuro. Sin errores de página ni desbordamiento global; selector de periodo conserva la sección activa y navegar no escribe datos. Ejemplo docente DuPont: ROA 12 % y ROE 20 %, usando cierres sintéticos claramente identificados para construir sus promedios. Capturas de paneles y pantalla completa en `capturas/`; resumen en `verificacion-visual.json`, ambos generados localmente sin versionar.

Se inspeccionaron los paneles completos de DuPont en escritorio y Razones en móvil oscuro. La revisión detectó y corrigió el desbordamiento provocado por las etiquetas accesibles de las tablas de Mercado y la falta de alineación/espacio de los encabezados de fila.

## Integración

Estados se integró por PR #28 con la excepción de revisión autorizada por Cris solo para esa vez. La integración inicial quedó pendiente de revisión; la excepción posterior de Cris para los PR prioritarios se documenta al final. No se publica directamente a main. Los cambios previos de Inicio, auditoría y AFOD quedan fuera de su commit.

## Pendientes con causa

El EFE oficial no fue comparado con la clase por falta de BG/ER completos. Compras a crédito estimadas frente a pagos acreditados, composición CNO y condiciones sobre dividendos siguen declaradas en el informe; no se cambian políticas ni se edita el motor para forzar coincidencias.

## Preparación de integración · 2026-11-07

Se incorpora main con PR #26, conservando D-087, D-088 y D-095. DuPont mantiene la fuente del motor y el detalle ROA/ROE; el EFE conserva las advertencias de estimación. Se reproduce y corrige la pérdida del borrador de Mercado al cambiar periodo: ahora se actualizan los ocho paneles dependientes sin reconstruir Mercado. Una regresión confirma valores, cero, campos vacíos y ausencia de escrituras; falla antes de corregir el bug. El navegador comprueba también Guardar después del cambio. Cris autoriza expresamente la excepción puntual de revisión humana para integrar los PR prioritarios, mediante merge normal y sin cambiar protecciones.

Resultado combinado: **2040/2040 pruebas**, 63 archivos; lint 0 errores y 10 advertencias existentes. Edge: 54 escenarios sin errores ni desbordamiento; borrador intacto tras cambios de periodo y Guardar operativo.
