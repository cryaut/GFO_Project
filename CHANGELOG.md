# Changelog

Todos los cambios notables en GFO Toolkit.

---

## [Sin publicar] — Reparación de carga de estados y completitud de razones

### Módulo 2: Estados Financieros
- **Nuevo importador robusto** (`js/modules/estados/estados-import.js`): JSON, CSV, TSV, Excel (.xlsx/.xls vía SheetJS bajo demanda) y pegado directo desde Excel.
- Tabla ancha (`Estado`, `Grupo`, `Cuenta`, `Clasificacion`, periodos) y tabla larga (`Periodo`, `Cuenta`, `Importe`); hojas de Excel separadas por estado/grupo.
- Parseo de importes contables: `45.000`, `45,000`, `C$ 12.500,50`, `(500)`, `500-`; celdas en blanco omiten la cuenta en ese periodo (no la convierten en cero).
- Errores de importación con número de fila y sugerencia; periodos ordenados del más antiguo al más reciente.
- Botón **Descargar plantilla CSV** y panel de ayuda con los formatos admitidos.
- Edición manual ya disponible: alta, renombrado, reordenado y baja de periodos; alta/baja de cuentas con clasificación compartida entre periodos; validación de equilibrio A = P + O.

### Módulo 3: Análisis Financiero
- Nuevas razones: rotación de activos fijos, rotación de capital de trabajo y solvencia (Activos ÷ Pasivos).
- Las razones extendidas y los totales se calculan con el motor compartido, por lo que cuentas importadas con nombres propios se suman correctamente.
- Integración de la rama de razones: rotación de cuentas por pagar (reemplaza a la "rotación de pasivos"), edad del inventario y grupo "Endeudamiento y Cobertura" en la pestaña Razones.
- Nuevos umbrales y hallazgos de interpretación: prueba ácida, deuda/patrimonio, cobertura de intereses, margen bruto, margen operativo, ROE y ciclo de conversión. Las razones N/D no generan hallazgos ni insignias.
- Plazos de cobro y pago, edad del inventario y ciclo de conversión con un año de 365 días (`DIAS_ANIO`); antes se usaban 360.
- Una sola función por concepto en `calculate.js`: se eliminaron 5 funciones repetidas que impedían cargar la app y 4 equivalentes con otro nombre.

### Apalancamiento (GAO, GAF y GAT)
- Fórmulas en `calculate.js`: `gao`, `gaf` y `gat` (estructurales), `gaoVariacion`, `gafVariacion` y `gatVariacion` (entre dos periodos), `tasaEfectiva`, `tasaImpuesto`, `denominadorGaf` y la constante `TASA_IR_DEFECTO` (30 %). Devuelven N/D si falta un dato o el denominador es 0.
- Derivación desde los estados guardados (`js/modules/apalancamiento/apalancamiento-calculations.js`): CV y CF según la clasificación de cada cuenta (variable, fija o mixta), UAI, T, DAP y UDAC, con traza por concepto y advertencias.
- `store`: nueva sección `apalancamiento` (clasificación de costos, DAP por periodo y tasa por defecto). Estados exporta `resolveAccountType`.

### Módulo 5: Mercados e Instituciones Financieras
- La pregunta del quiz sobre los días del PPC da como correcta 365, igual que el cálculo.

### Módulo 6: Reportes e Integración
- El dashboard y el CSV dejan de usar nombres de cuenta fijos: consumen el mismo motor normalizado que Análisis.
- El CSV exportado incluye `Estado`, `Grupo`, `Cuenta` y `Clasificacion`, y puede reimportarse en Estados sin edición manual.

### Correcciones
- Mercados: el quiz no persistía (`store` no estaba importado en `mercados/index.js`).
- Análisis: los shells `ah.js`, `av.js`, `razones.js`, `dupont.js`, `cnt-cno.js`, `eoaf.js` y `efe.js` reexportaban funciones que `index.js` no exportaba; ahora exponen `computeAH`, `computeAV`, `computeRazones`, `computeDuPont`, `computeCNTCNO`, `computeEOAF` y `computeEFE`, con prueba de guardia.
- Lint: se corrigieron 5 errores (comillas, variable no definida y escape innecesario).
- Análisis: la cobertura de intereses siempre salía N/D porque los intereses no llegaban al cálculo.

### Pruebas
- Nuevos archivos: `tests/unit/estados-import.test.js`, `tests/unit/estados-calculations.test.js`, `tests/unit/estados-acceptance.test.js`, `tests/unit/razones-adicionales.test.js`, `tests/unit/analisis-reexports.test.js`.
- `tests/unit/carga-modulos.test.js` importa la app y cada archivo de `js/`; falla si una función se declara dos veces o si un import apunta a un nombre inexistente.
- `tests/unit/razones-unificadas.test.js` y `tests/unit/analisis-razones.test.js`: razones unificadas, nombres reemplazados, cobertura de intereses y plazos de 365 días.
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
