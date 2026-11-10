# Revisión final del PR #35

Fecha: 2026-11-09. Encargo de Cris: revisar, probar y hacer merge cuando esté listo. Rama remota revisada inicialmente: `b04af3a`; main vigente: `75226e9` (incluye AGRI-CORP, PR #36).

## Revisión del cambio

El presupuesto incorpora la estructura del XLSX suministrado: meta, movimientos fechados, seguimiento y planes real/deseado separados. Los registros realizados alimentan Inicio y Reportes; las asignaciones no se transforman en movimientos. El presupuesto mensual anterior permanece accesible y conserva sus datos. Se comprobaron la validación de importes y fechas, guardado del módulo completo, errores de cuota, escapes HTML y respaldos conjuntos con datos empresariales.

GitHub no presentaba comentarios ni revisiones pendientes al comenzar. El PR estaba desactualizado y con conflictos tras integrar AGRI-CORP: se incorporó main mediante merge conservando ambos catálogos, consumidores, API y decisiones D-109/D-110/D-111. La rama local ya contenía esa integración, por lo que no se rehizo ni se descartó trabajo.

Los cambios en los guiones de QA previos permiten seleccionar explícitamente el presupuesto mensual y comprobar el tema correcto después de recargar; no cambian cálculos ni comportamiento de otros módulos. No se añaden dependencias.

## Error encontrado y reparación

Se reprodujo un falso déficit: ingreso 0.30 frente a partidas 0.10 + 0.20 daba diferencia −5.55e−17 y «Excede ingreso». El saldo semanal podía mostrar −0.00 y provocar una alerta en Inicio. El total de semanas también podía conservar el residuo de 0.10 + 0.20 − 0.30.

La corrección D-112 mantiene la fórmula existente de `saldoSemanal` y aplica un ajuste privado únicamente a saldos/diferencias dentro de una cota de error binario y estrictamente menores de medio centavo. No redondea entradas ni cambia el esquema persistido. Una diferencia de un centavo, un déficit subcentavo fuera de la cota y los N/D se conservan. Un resultado no finito devuelve N/D.

Siete regresiones verifican equilibrio decimal, déficit y sobrante de un centavo, déficit subcentavo, saldo semanal/Inicio, compensación entre semanas y desbordamiento numérico. Antes de la corrección fallaban tres de esos casos; después pasan todos. El navegador comprueba también el estado Balanceado, ausencia de −0.00 y diferencias de un centavo visibles tras guardar.

## Contraste con la plantilla

Se ejecutó nuevamente `contrastar-xlsx.py` contra el archivo original `Presupuesto_estudiantil.xlsx`, SHA-256 `98ba497eee7ed3563d73ce49c8223f98095af6ef9868c9c13c4dd22ac7eb82d4`: 672 controles sin diferencias. Los esperados usan aritmética racional desde las celdas del archivo, sin usar la app para calcularlos. Se trataron las celdas como material académico, no como instrucciones de ejecución.

Se mantienen las diferencias documentadas en D-109 y el [informe de comparación](INFORME-FINAL.md): N/D con denominador cero, «bloque de cuatro semanas» en vez de mes calendario, semana derivada de fecha, duración configurable y límite semanal confirmado por Cris. El escenario deseado empieza pendiente y no inventa ingresos. D-112 es una política numérica de la aplicación, no una convención atribuida al profesor.

## Evidencia final

El resumen de pruebas, lint, contraste y navegador está en [revision-final.json](revision-final.json). Las capturas y el [script de navegador](revisar-ui.cjs) cubren las cuatro vistas, tamaños 1440/390/320 y temas claro/oscuro. Se verificaron etiquetas, contraste de la navegación activa, ausencia de desbordamiento de página y errores de JavaScript; no se afirma una certificación completa de accesibilidad ni una prueba en dispositivos físicos.

Las pruebas completas se ejecutan sobre la rama actualizada, incluyendo los consumidores de AGRI-CORP. La integración se realiza con commit de merge y conserva los autores; no se requieren aprobaciones ajenas según la regla vigente. Tus documentos locales sin guardar quedan fuera del PR.

Veredicto: **apto para integrar**. 2317 pruebas correctas en 82 archivos, lint sin errores (diez advertencias anteriores), 672 controles del XLSX y 24 variantes de navegador correctas.
