# Informe final: reparación de totales y disponibilidad del motor

Fecha: 2026-11-07. Rama local: `codex/reparacion-totales-motor`. Base: `0b91ac6`. Reparación autorizada por Cris después del [diagnóstico ampliado](../cuentas-opcionales-nd/DIAGNOSTICO-Y-PROPUESTA.md). Sin push, PR ni integración en main.

## Resultado

Se corrigieron los dos problemas reproducidos: un total reportado válido ya no depende de poder reconstruir su desglose, y los grupos declarados completos se calculan con sus partidas aplicables sin exigir todas las cuentas del catálogo. Los archivos parciales o sin confirmar conservan N/D cuando falta información necesaria.

La demo conserva nombres, cuentas e importes; ahora declara su alcance completo y la composición de otros ingresos. No se añadieron cuentas de depreciación, amortización, franquicias u otros conceptos en cero. No se modificaron las fórmulas, los 20 JSON, la especificación generada ni el catálogo. **Sí cambió el contrato de disponibilidad de datos**, documentado en D-099; no es una corrección meramente visual.

## Antes y después

Se reproduce el documento anterior retirando de una copia las declaraciones nuevas, sin modificar sus cifras. Así se verifica también que un archivo antiguo no se convierte automáticamente en completo.

| Medida | Antes / sin declaraciones | Demo declarada |
|---|---:|---:|
| Disponibles 2023, de 24 consultados | 1 | 13 |
| Disponibles 2024, de 24 consultados | 3 | 19 |
| Razón corriente 2024 | N/D | 412000 / 175000 = **2.3542857143** |
| Utilidad bruta 2024 | 375000 | **375000** |
| UAII 2024 | N/D en lectura estricta | **155000** |
| UAI 2024 | N/D en lectura estricta | **149750** |
| Utilidad neta 2024 | N/D en lectura estricta | **104825** |
| Margen neto 2024 | N/D | **11.3940217391 %** |
| ROA 2024 | N/D | 104825 / 813500 = **12.8856791641 %** |
| ROE 2024 | N/D | 104825 / 550027.5 = **19.0581380022 %** |

Los 24 incluyen las 20 razones del motor y cuatro complementarias. La pestaña Razones muestra 23; CNT se consulta también fuera de ella. Los factores de DuPont coinciden con los rendimientos directos. Proforma y Estados comparten UN 104825 y UAI 149750.

Caso independiente: AC 1000 y PC 400 producen RC **2.5** sin exigir el detalle. UN reportada 100 y ventas netas reportadas 1000 mantienen margen **10 %**, incluso si un ingreso no operativo del desglose carece de composición: se avisa que el detalle no pudo comprobarse, sin anular el total.

## Cambios realizados y por qué

| Parte | Cambio y motivo |
|---|---|
| Motor, `reported_or_calculate` | Conserva el total acreditado y solo compara cuando hay detalle. Una comprobación incompleta produce `reported_subtotal_unverifiable`, separada de la disponibilidad del resultado |
| Resolución de derivados | Limpieza con `finally` incluso al lanzar una excepción; evita falsos ciclos tras recuperar un error de comprobación |
| Ausencia de detalle | Interpreta cobertura completa explícita; diferencia partida no aplicable de importe desconocido sin crear cuentas |
| Traza | Expone `no_aplica_por_cobertura` para identificar el origen de esos ceros de operación |
| Composición | Un clasificador de errores compartido entre motor y adaptador; solo se recuperan los dos errores contractuales, no errores inesperados |
| Normalizador | Valida y conserva `coberturaEstados`, por periodo/grupo; los archivos anteriores siguen sin confirmar |
| Borrador | Los campos vaciados se proyectan como desconocidos aunque el grupo sea completo; UN queda N/D y UAI puede seguir disponible sin IR |
| Consultas de cuenta | `consultarMontoCuenta`/`montoCuenta` respetan la cobertura; evita diferencias con los conceptos consultados por Proforma |
| Totalizador | Sus guardas de depreciación y deducciones respetan la cobertura; no se reemplaza todo su algoritmo |
| Demo | Declara los cuatro grupos completos y otros ingresos excluyendo intereses, conservando las cifras. Su carga pública persiste el módulo entero normalizado para no heredar metadatos de otra empresa |
| Estados | Añade **Alcance del ejercicio**, con guardado/exportación y conservación al renombrar/eliminar periodos; no obliga a insertar ceros |
| Análisis | Separa **Resultados con advertencias** de los N/D; aclara primer periodo de serie frente a único periodo, sin cambiar el modo temporal |
| Documentación | D-099, API, arquitectura, dominio, manual, changelog, ficha e informes antes/después para registrar el cambio de contrato |

Los cambios de aplicación se limitan a Estados, intérprete/adaptador de Razones, avisos/textos de Análisis y una regla CSS del formulario. No se editó `store.js`, el router ni los presupuestos maestro/personal.

## Contrato de cobertura y protección de N/D

`coberturaEstados[periodo][grupo]` admite `sin_confirmar`, `parcial` o `completo`. Grupos: activos, pasivos, patrimonio y estado de resultados.

- **Completo** declara que están todas las partidas del grupo y las no listadas no aplican. Solo el detalle ausente de ese grupo con datos puede aportar cero confirmado. No se rellenan totales reportados ni suplementos.
- Sin declaración o con grupo parcial, una ausencia requerida conserva N/D. No se infiere cobertura por nombre, cantidad de cuentas, cuadre del balance o parecido con la demo.
- Importe presente inválido/vaciado, identidad pendiente con monto o grupo sin datos conservan N/D en los resultados afectados. Denominador cero sigue N/D; numerador válido cero puede dar cero.
- La declaración no certifica la fuente: el usuario debe revisarla. El formulario explica su significado y permite volver a Parcial o Sin confirmar.

Las declaraciones no alteran filas/cifras ni convierten un subtotal calculado en reportado. La demo es un ejemplo didáctico propio de la app con supuestos ahora expresos; no se atribuyen esos supuestos al profesor.

## Avisos que se conservan

Un total válido con desglose incompleto se usa con advertencia de detalle no verificable. Si el desglose puede calcularse y difiere, se conserva `reported_subtotal_mismatch`, su tolerancia de un centavo y el ajuste por representación numérica. No se suma el total a sus componentes.

Al reconstruir UN desde ingresos no operativos presentes, sigue siendo obligatorio declarar su composición para evitar duplicar intereses. La reparación evita que esa comprobación invalide un total ya acreditado e independiente. Los errores estructurales o inesperados del intérprete siguen lanzándose.

## Verificación

- **2155 pruebas aprobadas en 72 archivos**, incluidas **21 nuevas** de motor/cobertura y edición. Se mantienen las pruebas de aceptación existentes de las razones y demás módulos.
- Lint: **0 errores y 10 advertencias preexistentes**. `git diff --check` limpio.
- Se probaron totales sin detalle, detalle parcial, grupos completos sin cuentas ficticias, cero/N/D, metadatos inválidos, pendientes, independencia entre periodos, composición, discrepancias, errores inesperados y coherencia Estados/Razones/Proforma/DuPont.
- Edge: fallo anterior reproducido en `0b91ac6`; después, **16 combinaciones** de Estados/Razones/DuPont/Proforma, escritorio/móvil y claro/oscuro, sin errores de página ni desbordamiento global. Se verificaron IR vacío con UAI independiente, Completo ↔ Parcial, foco, persistencia y exportación idéntica a lo guardado; también margen 10 % disponible con advertencia.

[Evidencia de cálculos](verificacion-calculos.json) y [script reproducible](verificar-motor.mjs). El script comprueba que no hay diferencias desde `0b91ac6` en los JSON, el generado, el catálogo ni `calculate.js`. Las capturas/JSON visuales son locales e ignorados por Git; las pruebas usan perfil desechable, no los datos del navegador del usuario. El diagnóstico histórico conserva un JSON «antes» separado y sus scripts distinguen caso histórico de resultado corregido.

## Cómo verificarlo en la app local

1. Refrescar la app. En Estados, usar **Cargar datos → Nuevo conjunto o ejemplo → Cargar ejemplo**, revisar el borrador y guardar para consultar la nueva demo en Análisis. No se carga ni reemplaza automáticamente el estado del usuario.
2. Para un documento ya guardado, revisar **Periodo de trabajo → Alcance del ejercicio** y declarar solo los grupos realmente completos, por cada periodo. Guardar publica el borrador a Análisis. Si el documento es parcial, conservar ese estado y proporcionar los totales acreditados cuando existan.
3. Comprobar los resultados de 2024 contra la tabla. No introducir ceros para eliminar avisos de información desconocida.

## Límites y pendientes

Los cinco N/D restantes de 2024 son rotación CxC, plazo de cobro, rotación CxP, plazo de pago y ciclo de conversión: faltan ventas a crédito/pagos reales según D-059. No se sustituyen por ventas totales ni compras/crédito supuestos.

En 2023 se mantienen los once N/D de flujo del primer periodo de una serie sin saldo anterior y con el control directo apagado, según D-032. Con un único periodo sigue el modo de cierre existente. No se añadió un control temporal ni se cambió la base de días.

No se migran los datos antiguos ni se declara completo un importado automáticamente. El totalizador legado no se reemplazó entero para todos sus consumidores; sus dos guardas indicadas y las consultas de cuenta sí respetan la cobertura. La declaración no certifica movimientos de caja ni cambia los límites del EFE estimado por variaciones. V1-05 conserva el pendiente aceptado: no fue comparado con el ejemplo oficial de clase por falta de BG/ER completos.

La rama queda para verificación local antes de publicar o integrar. No se hizo push, no se abrió PR y no se modificó main.
