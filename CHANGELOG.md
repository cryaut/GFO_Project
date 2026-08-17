# Changelog

Todos los cambios notables en GFO Toolkit.

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
