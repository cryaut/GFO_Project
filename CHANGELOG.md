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

### Módulo 6: Reportes e Integración
- El dashboard y el CSV dejan de usar nombres de cuenta fijos: consumen el mismo motor normalizado que Análisis.
- El CSV exportado incluye `Estado`, `Grupo`, `Cuenta` y `Clasificacion`, y puede reimportarse en Estados sin edición manual.

### Correcciones
- Mercados: el quiz no persistía (`store` no estaba importado en `mercados/index.js`).
- Análisis: los shells `ah.js`, `av.js`, `razones.js`, `dupont.js`, `cnt-cno.js`, `eoaf.js` y `efe.js` reexportaban funciones que `index.js` no exportaba; ahora exponen `computeAH`, `computeAV`, `computeRazones`, `computeDuPont`, `computeCNTCNO`, `computeEOAF` y `computeEFE`, con prueba de guardia.
- Lint: se corrigieron 5 errores (comillas, variable no definida y escape innecesario).

### Pruebas
- Nuevos archivos: `tests/unit/estados-import.test.js`, `tests/unit/estados-calculations.test.js`, `tests/unit/estados-acceptance.test.js`, `tests/unit/razones-adicionales.test.js`, `tests/unit/analisis-reexports.test.js`.
- Suite total: 128 pruebas en verde; `npm run lint` sin errores.
- Muestras para probar la importación en el navegador: `scripts/sample-estados.json` y `scripts/sample-estados.csv` (dos periodos, balance equilibrado).

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
