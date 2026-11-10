# Reparación y verificación del PR #36 — AGRI-CORP

Fecha: 2026-11-09. Base revisada: `521f213`; propuesta original de Carlos: `aaa3db9`. Encargo: reparar los fallos reproducidos, probar e integrar mediante PR, conservando los autores y sin integrar el presupuesto pendiente del PR #35.

## Qué se corrigió y por qué

| Problema reproducido | Solución | Comprobación |
|---|---|---|
| Se guardaban siete módulos por separado; un fallo de almacenamiento podía mezclar el caso real y el simulado. | Preparación y normalización completas antes de una única escritura con `setModulesPersisted`, ya existente. | Fallo de cuota en ambos sentidos conserva memoria y JSON anteriores; un dato inválido no escribe. |
| Inicio/Análisis/Proforma estimaban CFO real −145,444,600 aunque el dossier y Flujo tenían 190,033,364. En la simulación se usaba un par mensual para un flujo trimestral. | Documento opcional de movimientos en Estados, con fuente, entidad, moneda, naturaleza e intervalo exacto. EFE, Inicio, Proforma y Reportes usan la misma salida. | CFO real 190,033,364 y simulado 1,075,760 coinciden en los cinco consumidores. Exportación/importación preserva el documento. |
| El selector de Inicio desaparecía después de cargar y obligaba a borrar datos para cambiar de caso. | Panel desplegable permanente, fuente visible y confirmación de sustitución. | Seleccionar sin cargar y cancelar no guardan; cambio real→simulado funciona después de un fallo de cuota. |
| D-109 colisionaba con el PR #35. | D-110 identifica AGRI-CORP; D-111 registra la fuente documental. | No se reescribe la decisión del presupuesto estudiantil. |
| Entradas de inventario sin costo activaban el comportamiento legado. | Costo unitario explícito 620 en cada entrada, producto enlazado al presupuesto y arreglo de ventas nuevo en cada fábrica. | Cero movimientos sin costo, existencia final 1000; modificar un ejemplo no afecta a futuras cargas. |
| El nombre largo y los gráficos desbordaban Inicio/Flujo en móvil. | Permitir ajuste de texto y reducción de tarjetas; limitar los lienzos a su contenedor, incluso sin Chart.js remoto. | Matriz de 24 variantes, sin desbordamiento de página; las tablas conservan su desplazamiento local. |

El presupuesto personal sigue separado del caso de empresa. El ejemplo mensual no reemplaza un documento estudiantil ya cargado; la carga de empresa conserva finanzas personales y Activos del hogar.

## Controles independientes del dossier

La fuente es `AGRICORP_GFO_datos_reales_y_simulados_justificados.md`, entregada por Cris. Su SHA-256 está en [verificacion.json](verificacion.json). Se contrastaron las cifras suministradas con los resultados de las funciones existentes: no se hizo una auditoría nueva del PDF original ni se certificaron sus cifras.

| Magnitud | Histórico real 2024 | Unidad simulada jul–sep 2027 |
|---|---:|---:|
| Activos al cierre | 6,328,132,696 | 6,390,760 |
| Pasivos al cierre | 5,327,911,005 | 3,740,960 |
| Patrimonio al cierre | 1,000,221,691 | 2,649,800 |
| Utilidad neta | 42,223,948 | 1,218,000 en el trimestre |
| Flujo de operación | 190,033,364 | 1,075,760 |
| Flujo de inversión | −78,516,767 | −150,000 |
| Flujo de financiamiento | 102,282,062 | −45,000 |
| Variación neta de efectivo | 213,798,659 | 880,760 |
| Apertura | 70,837,459 | 1,500,000 |
| Cierre | 284,636,118 | 2,380,760 |

Para la unidad simulada: compras 3840/4280/4680 sacos; caja mensual 1,805,480 / 1,990,560 / 2,380,760; PE 1800 sacos; agosto GAO 1.75, GAF 1.07416879795 y GAT 1.87979539642. Se reutilizan los métodos existentes de presupuesto, inventario, apalancamiento y C-V-U; no se añaden fórmulas alternativas para obtener esas cifras.

## Robustez y alcance docente

Los documentos reportados y simulados se distinguen de las estimaciones desde balances. La clasificación de movimientos conserva operación, inversión y financiamiento, signos de entrada/salida y la comprobación apertura + flujos = cierre. Un descuadre se muestra: no se fuerza el resultado ni se redistribuyen diferencias.

La simulación tiene intervalo junio→septiembre; el saldo de junio está declarado en la fuente, sin BG inicial cargado. No se rotula como flujo agosto→septiembre. El histórico usa 2023→2024. La limitación V1-05 continúa: el ejemplo de flujo de las diapositivas no incluye balances y ER completos y **no se comparó ese EFE con la clase**. Este trabajo contrasta el dossier de defensa, sin atribuirle al profesor convenciones no verificadas.

Editar nombre, moneda, periodos, BG o ER invalida la revisión documental: sus flujos pasan a N/D con causa, sin sustituirlos silenciosamente por una estimación. Una captura manual independiente no modifica el flujo asociado a Estados. Tipos/monedas inválidos, no finitos, huecos, ids repetidos y dos documentos para un mismo cierre se rechazan. La fuente se escapa antes de insertarla en HTML.

Sin documento para el intervalo consultado, se conserva íntegramente el EFE estimado anterior. Los 20 JSON y el motor de razones, las fórmulas compartidas, las reglas de días y las cuentas/totales del catálogo no se modifican.

El caso real no suministra ventas a crédito, pagos a proveedores ni clasificación fijo/variable: sus razones dependientes y GAO pueden ser N/D. No son fallos que deban rellenarse con supuestos. El caso simulado sigue rotulado como ficticio y no se suma a la empresa real. La advertencia sobre el informe histórico de origen se conserva en el catálogo.

## Validación

- 2,276 pruebas correctas en 81 archivos; 23 regresiones nuevas en `tests/unit/ejemplo-agricorp.test.js`.
- Lint: cero errores; se mantienen diez advertencias anteriores.
- Navegador Edge con perfil aislado: carga, cancelación, fallo de cuota, reintento, cinco consumidores del flujo y exportación HTML; presupuesto, inventario y equilibrio.
- 24 variantes de Inicio, EFE, Proforma y Flujo: 1440/390/320 px, claro/oscuro, sin errores de JavaScript ni desbordamiento de página.
- [Evidencia de navegador](navegador.json), [resumen automatizado](verificacion.json), [script reproducible](revisar.cjs) y [capturas](capturas/).

No se incorporan dependencias nuevas. El campo de Estados es opcional y compatible con respaldos anteriores. El cuadre de un documento reportado no constituye una certificación contable de la aplicación.
