# Catálogo de ejemplos: cambios, comparación docente y verificación

Fecha: 2026-11-07. Rama: `codex/catalogo-ejemplos-afod`. Revisión solicitada: Carlos (`char-lie17`). El merge requiere su revisión humana.

## Qué cambió y por qué

El botón que cargaba un único ejemplo se sustituye por un panel con selector, procedencia, alcance, unidad monetaria y una acción explícita de carga. Cambiar la selección no modifica ni guarda datos. La selección se conserva durante los redibujados de la pantalla. Los textos se escapan y los paneles se adaptan a tema claro/oscuro y a móvil.

Se cubren Estados, Flujo, Equilibrio, Inventario, Planeación, Presupuesto personal y Mercado de Análisis; Inicio tiene paneles separados para empresa y hogar. Son 18 opciones en esos siete módulos y seis accesos en Inicio que reutilizan casos del catálogo. La referencia Comercial Ejemplo de Planeación conserva un panel aparte y se identifica como capital de trabajo parcial, no como presupuesto maestro terminado. Proforma, razones y apalancamiento consumen los estados elegidos; no reciben copias independientes que puedan divergir.

MUNO MODA integral sustituye el ejemplo incompleto en las acciones públicas de carga. Añade ventas a crédito ficticias declaradas de 680000/736000 y pagos a proveedores de 500000/553000 para 2023/2024. No altera los importes de BG/ER. Las 24 razones del motor están disponibles en 2024; 2023 es la base comparativa y puede requerir datos previos. La constante histórica sigue disponible para pruebas y compatibilidad, pero no se ofrece como otra opción al usuario. Los datos ya guardados del usuario no se sobrescriben automáticamente: debe elegir y cargar el caso integral; en Estados se guarda después de revisar el borrador.

`js/examples/` contiene metadatos y datos; `js/components/ejemplos.js` genera y vincula los paneles. Las operaciones usan normalizadores, cálculos y persistencia existentes. No hay nuevas fórmulas financieras, librerías, cambios de días del año ni edición de los 20 JSON de razones o de su generado en esta entrega del catálogo.

## Ejemplos disponibles

| Sección | Opciones | Alcance |
|---|---|---|
| Estados | MUNO integral, Baker, Bartlett, Ejercicio práctico 2 | BG/ER resueltos; las fuentes incompletas conservan N/D legítimos |
| Flujo | MUNO anual, Baker directo, Bartlett directo | Cobros y pagos declarados; los dos docentes reproducen el flujo resuelto |
| Equilibrio | MUNO, TOR 100000 y TOR 120000 unidades | C-V-U y UAII; no pretende resolver DAP/GAF en este módulo |
| Planeación | MUNO trimestral, MUNO al contado | Casos ficticios completos; referencia Comercial Ejemplo separada y parcial |
| Inventario | Tienda de prendas, Bodega sin movimientos | Mismos cuatro productos; ocho movimientos o ninguno |
| Presupuesto personal | Salario + trabajo independiente, Solo salario | Ingresos de 22500 o 18000, gastos y meta declarados |
| Mercado | Acciones/dividendos, Sin dividendos | Datos ficticios para los periodos cargados; dividendos cero siguen visibles |
| Inicio empresa | MUNO integral y los tres casos docentes de Estados | MUNO llena módulos vacíos; docente reemplaza solo Estados con confirmación |
| Inicio personal | Hogar con dos ingresos, Hogar con un ingreso | Llena únicamente módulos personales vacíos |

Las variantes ficticias se identifican como propias de la app y nunca se atribuyen al profesor. Elegir un caso en un módulo no carga automáticamente casos de otros módulos ni presupone que pertenecen a la misma empresa.

En Planeación, cargar un ejemplo completo desde la referencia parcial confirma el reemplazo del presupuesto y sus escenarios. Cancelar conserva el conjunto anterior. Esto evita mezclar una base de referencia con supuestos de otro ejercicio.

## Contraste con la fuente docente

La fuente es el ZIP proporcionado por Cris, conservado en la carpeta externa `Toolkit/TEAM.md/Ejercicios_AFOD`. No se ejecutan instrucciones procedentes de los documentos. El código incorpora datos de cuatro transcripciones, con trazabilidad por nombre y SHA-256 en `fuentes.json`; no publica el ZIP completo.

| Caso | Convención verificada y tratamiento | Resultado de control |
|---|---|---|
| Baker | Fuente en miles de USD: cada importe monetario se multiplica por 1000. BG 2011/2012, ER solo 2012. Se conserva la ubicación corriente de documentos por pagar aunque su etiqueta en la fuente sea ambigua; se avisa. Depreciación acumulada negativa. DAP no se resta como gasto de ER. | 2012: A 3200000 = P 2000000 + E 1200000; UB 700000; UAII 370000; UN 180000 |
| Bartlett | Miles de USD a USD completos. Efectivo y valores negociables se agrupan como equivalentes conforme a la comprobación de caja de la fuente, conservando ambas filas originales. Arrendamiento y depreciación son gastos operativos. DAP no es gasto de ER. | 2012: A 3597000 = P 1643000 + E 1954000; UB 986000; UAII 418000; UN 231000 |
| Práctico 2 | El signo $ no identifica una moneda: se usa UM. PPE se recibe ya neto: no se inventa costo bruto ni depreciación. UAII se obtiene con las funciones existentes. | 2024: A 595000 = P 250000 + E 345000; UB 300000; UAII 150000; UN 77000 |
| Baker directo | Entradas positivas/salidas clasificadas; la app aplica su signo mediante el tipo de movimiento. No se infieren cobros desde saldos. | Operación 780000; inversión −300000; financiamiento 20000; variación 500000; caja final 1000000 USD |
| Bartlett directo | Misma convención; caja inicial incluye los equivalentes que usa el resuelto. | Operación 500000; inversión −347000; financiamiento −61000; variación 92000; caja final 431000 USD |
| TOR | Precio 7.50, variable unitario 3, fijos 250000; la fuente no identifica moneda, se usa UM. El módulo C-V-U excluye intereses, IR y DAP de UAII. | PE 55555.5556 unidades; UAII 200000 a 100000 unidades y 290000 a 120000 |

No se supone que todas las ventas sean a crédito ni que compras equivalgan a pagos. En los tres estados docentes, las rotaciones que necesitan suplementos no informados conservan N/D y su motivo. La cobertura completa declara qué detalle no aplica; no fabrica datos suplementarios. Los subtotales reportados y calculados conservan su procedencia y el orden de presentación docente implementado en las entregas anteriores.

## Monedas y compatibilidad

Campo opcional `moneda` validado: `C$`, `USD` o `UM`. Los archivos antiguos sin ese campo mantienen C$. Se conserva al normalizar, guardar y exportar Estados, Flujo y Equilibrio. Los renders de Estados, Análisis, Mercado, Apalancamiento, Inicio y Proforma usan la unidad de su fuente, incluidas las trazas monetarias. No hay conversión de divisas. Proforma impide calcular variaciones entre monedas distintas y explica la causa; Planeación e Inventario propios continúan en C$.

## Qué queda pendiente

Se incorporan cuatro de las 16 transcripciones del ZIP. No se afirma que todos los ejercicios ni métodos estén implementados. Quedan sin una opción independiente: B.G S.A, Baker práctico EFE (variante separada), Dayton, Halley, Bella Vista, Ejercicios E.R proformas, Electronic práctica, Electronic_y_Mundo_Moda, Electrónicas análisis financiero, La Grandiosa, La Pinolera y Mundo Moda análisis financiero. Requieren preparar y contrastar su propia importación; varios son variantes o demandan métodos fuera del alcance actual. En particular, los calendarios de pagos de IR de La Pinolera y los métodos docentes de proforma no se sustituyen por los supuestos ficticios de MUNO. Véase la revisión previa de `proforma-presupuesto-docente/REVISION-DOCENTE.md`.

El EFE derivado de Análisis sigue siendo una estimación con su clasificación vigente. Su totalizador legado todavía puede no reconstruir UN desde ciertas identidades de gasto operativo de Baker/Bartlett/Práctico 2 y conservar N/D, aun cuando Estados/Razones lean un total reportado. Asimismo, deudas acumuladas y otros movimientos requieren validar la clasificación y evidencia del método indirecto. No se cambia esa lógica para forzar coincidencias. Los ejemplos docentes resueltos y contrastados de flujo se cargan en **Flujo**, método directo; no equivalen a afirmar que el EFE indirecto de Análisis ya fue alineado con esos casos. Este límite queda explícito para la revisión de Carlos.

## Verificación

- `npm test -- --maxWorkers=2 --reporter=json`: 2169 pruebas aprobadas, 73 archivos, cero fallos.
- `npm run lint`: cero errores; diez advertencias preexistentes.
- Catorce pruebas nuevas contrastan cifras fuente, escala, suficiencia de MUNO, no mutación, selector, variantes, monedas y comparación entre divisas.
- Edge con perfil desechable: 44 escenarios sin errores JavaScript; escenarios y medidas en `verificacion-visual.json`; capturas de escritorio/móvil, claro/oscuro. Se comprueba que seleccionar no guarda, cargar conserva Estados en otros módulos, los dividendos cero se guardan y el reemplazo parcial de Planeación puede cancelarse.
- Se corrigió un desbordamiento móvil de Inventario: el encabezado accesible absolutamente posicionado escapaba del contenedor desplazable. Se limita su contención con `position: relative` en el envoltorio de esa tabla, sin cambiar datos ni cálculo.
- Ninguna prueba abre el perfil real del usuario ni modifica su localStorage. No se añade dependencia; el script visual usa Playwright del entorno de QA.

## Entregas previas incluidas en el PR

La rama parte de origin/main e incluye cuatro commits locales que aún no estaban publicados y que sostienen estos ejemplos: `dc4d96b` (estados resueltos), `8197215` (trazas Proforma/Presupuesto), `0b91ac6` (cuentas opcionales y diagnóstico N/D) y `6e8257c` (totales suficientes y cobertura del motor). Sus informes respectivos se conservan en las fichas correspondientes. El cambio del motor pertenece a esa reparación previa, autorizada por Cris, y debe revisarse junto con el catálogo. Los documentos de auditoría ajenos que siguen sin commit en el directorio principal no se incluyen accidentalmente.
