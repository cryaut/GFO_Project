# Changelog

Todos los cambios notables en GFO Toolkit.

---

## [Sin publicar] — Reparación de carga de estados y completitud de razones

### Módulo 2: Estados Financieros
- **Importes ambiguos (importación):** `parseAmountCell(valor, { decimal, onAmbiguous })` admite un formato explícito (`'.'` o `','` decimal) además de `'auto'`. En automático, el separador se deduce de toda la tabla (`inferDecimalStyle`): un `1.234.567` o un `12,50` aclaran cómo leer `45.000`. Sin evidencia se conserva la convención (punto decimal) y se **avisa** con el número de fila en lugar de leer 45 en silencio.
- `0,500` ahora es 0.5 (antes 500) y `1.2.3` / `1,2,3` se rechazan (antes `1.2.3` se leía como 123). Los errores de importe indican fila, cuenta y periodo.
- Selector **Formato de importes** en Estados (Automático, Punto decimal, Coma decimal) para archivos CSV, Excel y tabla pegada; tras importar se muestra cuántos importes eran ambiguos.
- **Nuevo importador robusto** (`js/modules/estados/estados-import.js`): JSON, CSV, TSV, Excel (.xlsx/.xls vía SheetJS bajo demanda) y pegado directo desde Excel.
- Tabla ancha (`Estado`, `Grupo`, `Cuenta`, `Clasificacion`, periodos) y tabla larga (`Periodo`, `Cuenta`, `Importe`); hojas de Excel separadas por estado/grupo.
- Parseo de importes contables: `45,000`, `C$ 12.500,50`, `(500)`, `500-`; celdas en blanco omiten la cuenta en ese periodo (no la convierten en cero).
- Errores de importación con número de fila y sugerencia; periodos ordenados del más antiguo al más reciente.
- Botón **Descargar plantilla CSV** y panel de ayuda con los formatos admitidos.
- Edición manual ya disponible: alta, renombrado, reordenado y baja de periodos; alta/baja de cuentas con clasificación compartida entre periodos; validación de equilibrio A = P + O.
- Orden cronológico de periodos en `normalizeFinancialData` cuando todos empiezan con un año (`ordenarPeriodos`; el importador sigue usando `sortPeriods`): el "último periodo" y el periodo previo ya no dependen del orden de llegada. Con nombres como "Marzo" se respeta el orden que el usuario deja en Estados.

### Módulo 6: Reportes e Integración
- **Importar JSON validado** (`integracion-respaldo.js`): solo se aceptan módulos que el `store` conoce, con el tipo correcto; `estados` pasa por `normalizeFinancialData`; se rechazan `__proto__`/`constructor`/`prototype`, estructuras muy profundas y archivos de más de 5 MB. Antes se escribía cualquier clave con `store.set` sin validar.
- La importación pide confirmación, guarda con `setPersisted` y, si el almacenamiento falla a mitad, restaura los módulos ya guardados. Un JSON de Estados (sin módulos reconocibles) se rechaza con la indicación de importarlo desde Estados Financieros.
- **Reporte HTML corregido** (`integracion-reporte.js`): una columna por periodo (antes las filas tenían 2 celdas bajo N encabezados), agrega Estado de Resultados y Totales por periodo, muestra N/D y "—" en lugar de 0, y **escapa** cuentas, periodos y empresa (antes un nombre de cuenta importado se insertaba como HTML).
- Botón **Vista previa del reporte** (muestra el reporte en la página) y **Descargar reporte HTML**; antes el botón "Vista Previa HTML" descargaba el archivo.

### Módulo 3: Análisis Financiero
- Nuevas razones: rotación de activos fijos, rotación de capital de trabajo y solvencia (Activos ÷ Pasivos).
- Las razones extendidas y los totales se calculan con el motor compartido, por lo que cuentas importadas con nombres propios se suman correctamente.
- Integración de la rama de razones: rotación de cuentas por pagar (reemplaza a la "rotación de pasivos"), edad del inventario y grupo "Endeudamiento y Cobertura" en la pestaña Razones.
- Nuevos umbrales y hallazgos de interpretación: prueba ácida, deuda/patrimonio, cobertura de intereses, margen bruto, margen operativo, ROE y ciclo de conversión. Las razones N/D no generan hallazgos ni insignias.
- Plazos de cobro y pago, edad del inventario y ciclo de conversión con un año de 365 días (`DIAS_ANIO`); antes se usaban 360.
- Semántica N/D en `calculate.js`: RC, RR, rotación de inventario, rotación de CxC, plazo de cobro, endeudamiento, margen neto y ROA devuelven `null` si falta el dato o el denominador es 0 (antes devolvían un 0 interpretable como valor financiero).
- Los promedios (inventario, CxC, CxP, activo y patrimonio) distinguen "cuenta ausente en el periodo" (→ N/D) de "cuenta con importe 0"; con un solo periodo se conserva el saldo final documentado.
- La rotación de CxC usa las ventas totales, como el plazo de cobro de Gitman, porque el modelo no separa las ventas a crédito; la tarjeta lo indica. (La versión de `razones-financieras-v3` la dejaba siempre en N/D, junto con el plazo de cobro y el ciclo de conversión.)
- La rotación de CxP usa compras reales (`Costo de Ventas + Inventario Final − Inventario Inicial`); sin inventario comparable usa el costo de ventas y la tarjeta lo etiqueta "aprox.".
- Interpretación sin conclusiones falsas: las razones N/D no generan hallazgos ni insignias; si nada es calculable muestra "No hay indicadores calculables (N/D)".
- DuPont sin `Infinity` ni `NaN`: un componente N/D anula el ROE y las tarjetas muestran N/D; la evolución entre periodos marca N/D cuando una razón no se calcula.
- Una sola función por concepto en `calculate.js`: se eliminaron 5 funciones repetidas que impedían cargar la app y 4 equivalentes con otro nombre.

### Apalancamiento (GAO, GAF y GAT)
- Fórmulas en `calculate.js`: `gao`, `gaf` y `gat` (estructurales), `gaoVariacion`, `gafVariacion` y `gatVariacion` (entre dos periodos), `tasaEfectiva`, `tasaImpuesto`, `denominadorGaf` y la constante `TASA_IR_DEFECTO` (30 %). Devuelven N/D si falta un dato o el denominador es 0.
- Derivación desde los estados guardados (`js/modules/apalancamiento/apalancamiento-calculations.js`): CV y CF según la clasificación de cada cuenta (variable, fija o mixta), UAI, T, DAP y UDAC, con traza por concepto y advertencias.
- `store`: nueva sección `apalancamiento` (clasificación de costos, DAP por periodo y tasa por defecto). Estados exporta `resolveAccountType`.
- Nueva pantalla `#/apalancamiento` (barra lateral y tarjeta de Inicio): clasificación de costos, DAP y tasa por defecto, grados por periodo y por variación, advertencias, interpretación y traza por periodo.

### Módulos de la guía del proyecto final
- Nueva pantalla `#/inventario`: productos con existencia inicial, costo unitario y stock mínimo; entradas y salidas con fecha; kardex con saldo; existencia final, valor del inventario y alertas de reposición con la compra mínima sugerida. Rechaza salidas que dejen la existencia negativa.
- Nueva pantalla `#/equilibrio`: margen de contribución, punto de equilibrio en unidades y en C$, margen de seguridad, GAO, unidades para una utilidad objetivo, escenarios de ±10 % en precio, costo variable, costos fijos y volumen (más uno personalizado), gráfica C-V-U y cálculo paso a paso. Puede tomar precio y costos de un periodo de los estados con la clasificación de Apalancamiento.
- Nueva pantalla `#/flujo`: entradas y salidas de efectivo por actividades de operación, inversión y financiamiento; variación neta y saldo final; saldo inicial tomado del balance y comparación con el efectivo del periodo siguiente.
- Nueva pantalla `#/planeacion`: presupuesto maestro de una empresa comercial (1 a 12 meses o trimestres) con presupuestos de ventas y cobros, compras y pagos, costo de bienes vendidos, gastos de operación, caja con financiamiento requerido y estado de resultados presupuestado. Toma saldos iniciales del balance y el inventario inicial de un producto de Inventario.
- Nueva pantalla `#/proforma`: estado de resultados proforma contra el último periodo real, efectivo proyectado, indicadores de todos los módulos (reutiliza `computeRazones` y `computeDuPont`), alertas con acción sugerida e impresión a PDF.
- Fórmulas nuevas en `calculate.js`, con N/D: `margenContribucionUnitario`, `razonMargenContribucion`, `puntoEquilibrioUnidades`, `puntoEquilibrioVentas`, `unidadesUtilidadObjetivo`, `margenSeguridad`, `existenciaFinal`, `valorInventario`, `necesitaReposicion`, `flujoNeto`, `variacionNetaEfectivo`, `saldoFinalEfectivo`, `comprasPresupuestadas`, `costoBienesVendidos`, `financiamientoRequerido`, `capacidadAhorro` y `tasaAhorro`.
- `store`: secciones `inventario`, `equilibrio`, `flujo` y `planeacion`, y `presupuesto.ingresos`. Utilidades `js/utils/form.js`, `js/utils/estados-guardados.js` y `formatCurrencyND`, `formatNumberND` y `formatPercentND` en `format.js`. Análisis exporta `refreshSavedStates`.
- Cada módulo trae un ejemplo ficticio coherente de MUNO MODA 2025: la UAII del primer trimestre del presupuesto (C$ 28,000) es la del punto de equilibrio.
- Razones de mercado en la pestaña **Mercado** de Análisis: UPA, P/U, valor en libros por acción, P/VL, DPA, pago y rendimiento del dividendo, con datos de acciones por periodo (`store.razonesMercado`) y el DAP de Apalancamiento. También aparecen en el reporte integrado.
- La demo MUNO MODA ahora cuadra (A = P + O en 2023 y 2024), trae gastos por intereses e IR del 30 %, y sus utilidades acumuladas cambian por la utilidad neta menos C$ 40,000 de dividendos. Cambian las cifras de rentabilidad y del GAF de la demo, y la cobertura de intereses deja de ser N/D.
- Pruebas: `inventario`, `equilibrio`, `flujo`, `planeacion`, `proforma`, `presupuesto-personal` y `razones-mercado` (casos resueltos a mano, identidades de CxC, CxP, inventario y caja, y cuadre de la demo), con el doble de DOM compartido `tests/unit/helpers/dom-falso.js`. Suite total: 310 pruebas en verde.

### Módulo 1: Presupuesto Personal
- Ingresos por concepto (regular u ocasional) en una pestaña nueva; `ingresoMensual` queda como su total y los datos anteriores se leen como un ingreso regular.
- Total de ingresos, total de gastos, capacidad de ahorro (C$ y % de los ingresos), ahorro planificado y saldo disponible, con interpretación y ejemplo ficticio.
- Corrección de seguridad: los conceptos de ingresos y gastos se escapan con `escapeHTML` (antes se insertaban sin escapar).

### Módulo 5: Mercados e Instituciones Financieras
- La pregunta del quiz sobre los días del PPC da como correcta 365, igual que el cálculo.

### Módulo 6: Reportes e Integración
- El dashboard y el CSV dejan de usar nombres de cuenta fijos: consumen el mismo motor normalizado que Análisis.
- ROA y endeudamiento del dashboard reutilizan `computeRazones` (con `refreshSavedStates`): mismos promedios y semántica N/D que la pestaña Análisis, no un cálculo paralelo con saldo de cierre.
- El CSV exportado incluye `Estado`, `Grupo`, `Cuenta` y `Clasificacion`, y puede reimportarse en Estados sin edición manual.

### Inicio y apariencia
- `#/home` es ahora un **panorama general** de la empresa (`js/modules/inicio/`): salud general, KPIs con variación contra el periodo anterior, gráfica de ventas y utilidad, alertas prioritarias, puntos clave con interpretación por área (liquidez, rentabilidad, endeudamiento, apalancamiento, equilibrio, flujo, presupuesto maestro, inventario y activos) y accesos a los módulos. Sin datos muestra "Cómo empezar".
- Las cifras salen de las mismas funciones que cada módulo: la proforma exporta `reunirEntradas()` y `razon()`, y Activos exporta `calcularEstado()`. `initHome` sale de `app.js`.
- Tema oscuro: los fondos `--color-*-light` pasan a tintes translúcidos. Corrige los iconos de Inicio, las insignias y el hover de las tablas, que quedaban como manchas claras con texto claro.
- Iconos de Inicio en SVG (los mismos de la barra lateral) con tono por módulo, en lugar de caracteres sueltos (`$`, `%`, `*`…).
- Insignias y enlaces usan `--ink-*`, un tono más contrastado (≥ 4.5:1) en ambos temas. Gradiente suave solo en el encabezado de Inicio.
- Al cambiar de tema, las gráficas abiertas se recolorean (`refreshChartsTheme` en `js/components/chart.js`) sin reiniciar la pantalla, así no se pierden formularios ni borradores. Los colores de ejes y leyenda salen de las variables CSS del tema.
- Botón **Cargar ejemplo de empresa** en Inicio cuando no hay datos: llena con MUNO MODA solo los módulos de la empresa vacíos (estados, razones de mercado, presupuesto maestro, equilibrio, flujo e inventario); nunca reemplaza datos existentes. **Cargar ejemplo personal** hace lo mismo con el presupuesto personal y los activos del hogar (`ejemploActivos()` en Activos).
- **Finanzas personales separadas de la empresa** (D-018):
  - Barra lateral en secciones: Empresa (en el orden del flujo de datos), Finanzas personales, Aprender y Datos. Las rutas no cambian.
  - "Presupuesto" pasa a "Presupuesto personal" y "Activos" a "Activos del hogar"; sus páginas llevan la etiqueta "Finanzas personales" y un acento verde azulado (`--color-personal`).
  - Inicio: los activos del hogar salen de los puntos clave y de la salud de la empresa; nuevo bloque "Mis finanzas personales" con capacidad y tasa de ahorro, ahorro necesario para la meta y estado de los bienes. La cuadrícula de módulos se agrupa igual que la barra lateral.
  - Reportes: el resumen por módulo separa Empresa, Finanzas personales y Aprender, y el conteo de activos sale de los KPIs de la empresa.
- Fondo de la app con gradiente radial muy suave sobre `--bg-app`, barra lateral con gradiente vertical y enlace activo con degradado. Las tarjetas se separan del fondo.
- Contraste: textos de estado (`.text-success`, `.text-danger`, KPIs, pestaña activa, glosario, quiz, cifras positivas y negativas) usan `--ink-*`; en oscuro las tablas tienen rayado y encabezado más suaves.
- Accesibilidad: foco visible con teclado en enlaces, botones y tarjetas; con `prefers-reduced-motion` se desactivan la entrada de páginas y las transiciones.
- Tipografía monoespaciada con respaldo `Cascadia Mono`/`Consolas`/`SF Mono`/`Menlo` para las cifras.
- Pruebas: `inicio.test.js` (12 casos) e `inicio-navegador.test.js` (carga del ejemplo sin sobrescribir y recoloreado de gráficas).

### Correcciones
- Mercados: el quiz no persistía (`store` no estaba importado en `mercados/index.js`).
- Análisis: los shells `ah.js`, `av.js`, `razones.js`, `dupont.js`, `cnt-cno.js`, `eoaf.js` y `efe.js` reexportaban funciones que `index.js` no exportaba; ahora exponen `computeAH`, `computeAV`, `computeRazones`, `computeDuPont`, `computeCNTCNO`, `computeEOAF` y `computeEFE`, con prueba de guardia.
- Lint: se corrigieron 5 errores (comillas, variable no definida y escape innecesario).
- Análisis: la cobertura de intereses siempre salía N/D porque los intereses no llegaban al cálculo.
- Análisis: una cuenta ausente en un periodo anterior se promediaba como 0 (RotInv/ROA/DuPont inflados); ahora es N/D. El dashboard calculaba ROA y endeudamiento con criterio distinto a Análisis; ahora comparte `computeRazones`. El orden de periodos "2025, 2024" invertía el periodo previo en promedios y EFE.

### Pruebas
- Nuevos archivos: `tests/unit/estados-import.test.js`, `tests/unit/estados-calculations.test.js`, `tests/unit/estados-acceptance.test.js`, `tests/unit/razones-adicionales.test.js`, `tests/unit/analisis-reexports.test.js`.
- `tests/unit/carga-modulos.test.js` importa la app y cada archivo de `js/`; falla si una función se declara dos veces o si un import apunta a un nombre inexistente.
- `tests/unit/razones-unificadas.test.js` y `tests/unit/analisis-razones.test.js`: razones unificadas, nombres reemplazados, cobertura de intereses y plazos de 365 días.
- `calculate.test.js` y `analisis-razones.test.js` ajustados a la semántica N/D, con casos nuevos por bug corregido: cuenta ausente en promedios, compras reales en RotCxP y DuPont sin `Infinity`/`NaN`.
- Suite total: 142 pruebas en verde; `npm run lint` sin errores.
- Muestras para probar la importación en el navegador: `scripts/sample-estados.json` y `scripts/sample-estados.csv` (dos periodos, balance equilibrado).

### Documentación y trabajo en equipo
- `AGENTS.md` con las reglas que siguen las IAs del equipo; `CLAUDE.md` y `GEMINI.md` lo importan.
- Una IA puede hacer el merge de un PR si se lo piden y otra persona del equipo ya lo aprobó (`docs/reglas/flujo-de-trabajo.md`).
- `docs/contexto/` (arquitectura y dominio financiero) y `docs/reglas/` (flujo de trabajo, código, y pruebas y documentación).
- Plantilla de Pull Request en `.github/` y planificación con una carpeta por feature en `docs/planificacion/`.
- `docs/api.md` documenta las razones agregadas, `DIAS_ANIO`, `saldoPromedio`, `variacion` y `escapeHTML`.

---

## [1.0.0] — 2026-08-16

Versión inicial de lanzamiento.

### Módulo 1: Presupuesto Personal
- Captura de ingresos regulares y ocasionales
- Clasificación de gastos: necesidad, deseo, imprevisto, meta
- Separación de ahorro con cálculo automático (pagarse primero)
- Control semanal con saldo acumulado
- Presupuesto proyectado: real vs deseado
- Ajuste por inflación y cambio de precios
- Gráficos de distribución (pastel y barras)

### Módulo 2: Estados Financieros Básicos
- Balance General multiperiodo con validación A = P + O
- Estado de Resultados multiperiodo
- Flujo de Efectivo (método indirecto)
- Conexión entre estados (utilidad → patrimonio, efectivo → BG)
- Carga de demo con datos de MUNO MODA S.A.

### Módulo 3: Análisis Financiero
- Análisis Horizontal (AH): variaciones absolutas y relativas
- Análisis Vertical (AV): porcentajes sobre total activo o ventas
- Razones de liquidez: Ratio Corriente (RC), Ratio Rápido (RR)
- Razones de actividad: Rotación de Inventario, Rotación de CxC, Plazo de Cobro
- Razones de endeudamiento
- Razones de rentabilidad: Margen Neto (MN), Retorno sobre Activos (ROA)
- Capital Neto de Trabajo (CNT) y Operativo (CNO)
- EOAF: Origen y Aplicación de Fondos con reglas automáticas
- EFE por método indirecto
- Modelo DuPont de 3 pasos (ROE = PM × AT × EM)
- Interpretación heurística automatizada

### Módulo 4: Activos y Depreciación
- Inventario de activos por categoría
- Depreciación anual por línea recta
- Depreciación acumulada con tope de vida útil
- Valor en libros
- Evaluación de condición (8 aspectos)
- Clasificación y recomendación automática (7 estados)
- Costo de reposición y previsión mensual

### Módulo 5: Mercados e Instituciones Financieras
- Glosario interactivo con 20+ términos financieros
- Comparador de Bonos vs Acciones
- Mapa visual del sistema financiero nicaragüense
- Quiz de opción múltiple con puntaje persistente

### Módulo 6: Integración y Exportación
- Exportar datos completos a JSON
- Exportar tablas a CSV
- Vista previa HTML del reporte
- Importar datos desde JSON exportado previamente
- Dashboard resumen con KPIs de todos los módulos
- Almacenamiento local (localStorage)

### Infraestructura
- SPA con routing hash-based (sin framework)
- Modo oscuro/claro con persistencia en localStorage
- Diseño responsive-first (320px a 1440px)
- 22 funciones puras de cálculo financiero
- Funciones de formateo de moneda, números y porcentajes
- Tests unitarios con Vitest
- Linting con ESLint
- Despliegue estático (Netlify, Vercel, GitHub Pages)
- Licencia MIT
