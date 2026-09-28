# GFO Toolkit

**Gestión Financiera y Operativa** — *"Datos. Cálculo. Decisión."*

Proyecto Final | Semestre 4 | Ingeniería de Sistemas | UNI RUSB

---

## Descripción

GFO Toolkit es una aplicación web completa de gestión financiera operativa diseñada para estudiantes y profesionales que necesitan analizar, planificar y tomar decisiones financieras informadas. La herramienta integra seis módulos funcionales en una sola plataforma: presupuesto personal, estados financieros, análisis financiero, activos y depreciación, mercados financieros, e integración con exportación de reportes.

Toda la aplicación funciona 100% en el navegador, sin necesidad de servidores, sin cuentas de usuario, y con almacenamiento local para preservar la privacidad.

---

## Features por Módulo

### Módulo 1: Presupuesto Personal / Estudiantil
- Captura de ingresos regulares y ocasionales
- Clasificación de gastos: necesidad, deseo, imprevisto, meta
- Separación de ahorro (pagarse primero) con cálculo automático
- Control semanal con saldo acumulado
- Presupuesto proyectado: real vs deseado
- Ajuste por inflación y cambio de precios
- Gráficos de distribución (pastel y barras)

### Módulo 2: Estados Financieros Básicos
- Balance General multiperiodo (A = P + O)
- Estado de Resultados multiperiodo
- Flujo de Efectivo (método indirecto)
- Conexión entre estados: utilidad → patrimonio, efectivo → BG
- Importación de estados externos: JSON, CSV/TSV, Excel (.xlsx/.xls) y pegado directo desde Excel, con plantilla CSV descargable
- Edición manual de periodos (alta, renombrado, reordenado, baja) y de cuentas personalizadas con su clasificación
- Carga de demo con datos de MUNO MODA S.A.

### Módulo 3: Análisis Financiero
- Análisis Horizontal (AH): variaciones absolutas y relativas
- Análisis Vertical (AV): porcentajes sobre total activo o ventas
- Razones financieras completas: liquidez (RC, RR, prueba defensiva), actividad (rotaciones de inventario, CxC, CxP, activos, activos fijos y capital de trabajo; edad del inventario, PPC, PPP y ciclo de conversión, con año de 365 días), endeudamiento/solvencia (endeudamiento, solvencia, deuda/patrimonio, multiplicador de capital, cobertura de intereses) y rentabilidad (margen bruto, operativo y neto, ROA, ROE)
- Capital Neto de Trabajo (CNT) y Operativo (CNO)
- EOAF: Origen y Aplicación de Fondos con reglas automáticas
- EFE por método indirecto
- Modelo DuPont de 3 pasos (ROE = PM × AT × EM)
- Interpretación heurística automatizada

### Módulo 4: Activos y Depreciación
- Inventario de activos por categoría
- Depreciación anual por línea recta
- Depreciación acumulada con tope
- Valor en libros
- Evaluación de condición (8 aspectos)
- Clasificación y recomendación automática (7 estados)
- Costo de reposición y previsión mensual

### Módulo 5: Mercados e Instituciones Financieras
- Glosario interactivo con 20+ términos
- Comparador de Bonos vs Acciones
- Mapa visual del sistema financiero nicaragüense
- Quiz de opción múltiple con puntaje persistente

### Módulo 6: Integración y Exportación
- Exportar datos completos a JSON
- Exportar tablas a CSV
- Vista previa HTML del reporte
- Importar datos desde JSON exportado o desde CSV/Excel reimportable
- Dashboard resumen con KPIs de todos los módulos
- Almacenamiento local (localStorage)

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| **HTML** | HTML5 semántico |
| **CSS** | CSS3 + Variables CSS + Modo oscuro/claro |
| **JavaScript** | Vanilla JS (ES Modules, sin framework) |
| **Gráficos** | Chart.js (CDN) |
| **Almacenamiento** | localStorage + JSON export/import |
| **Tests** | Vitest |
| **Linting** | ESLint |
| **Deploy** | Static hosting (Netlify, Vercel, GitHub Pages) |

---

## Instalación

Node.js es necesario únicamente para ejecutar los tests y el lint. La aplicación no requiere build.

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gfo-toolkit.git
cd gfo-toolkit

# Instalar dependencias de desarrollo (solo para tests)
npm install

# Ejecutar tests
npm test

# Ejecutar lint
npm run lint
```

---

## Uso

### Opción 1: Abrir directamente
Simplemente abre el archivo `index.html` en tu navegador.

### Opción 2: Servir con un servidor estático
```bash
# Con Python
python3 -m http.server 8000

# Con Node (npx)
npx serve .

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

---

## Despliegue

### Netlify Drop
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `gfo-toolkit/`
3. Listo — tu app está en línea

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
1. Sube el código a un repositorio en GitHub
2. Ve a Settings > Pages
3. Selecciona la rama `main` y carpeta raíz (`/`)
4. Guarda — la app estará en `https://tu-usuario.github.io/gfo-toolkit/`

---

## Estructura de Archivos

> Resumen general. La estructura detallada y al día está en [`docs/contexto/arquitectura.md`](docs/contexto/arquitectura.md).

```
gfo-toolkit/
├── index.html                  → Entry point + router hash-based
├── css/
│   ├── variables.css           → Design tokens (colores, tipografía, espaciado)
│   ├── base.css                → Reset, tipografía, utilidades
│   ├── components.css          → Botones, cards, formularios, tablas
│   └── pages.css               → Estilos específicos por página
├── js/
│   ├── app.js                  → Router + inicialización
│   ├── store.js                → Estado centralizado (localStorage)
│   ├── utils/
│   │   ├── calculate.js        → Fórmulas financieras puras (22 funciones)
│   │   ├── format.js           → Formateo de números, monedas, porcentajes
│   │   └── export.js           → Exportación JSON/CSV/HTML + importación
│   ├── modules/
│   │   ├── presupuesto/        → Módulo 1: Presupuesto personal
│   │   ├── estados/            → Módulo 2: Estados financieros básicos
│   │   ├── analisis/           → Módulo 3: AH, AV, Razones, EOAF, EFE, DuPont
│   │   ├── activos/            → Módulo 4: Activos y depreciación
│   │   ├── mercados/           → Módulo 5: Mercados e instituciones
│   │   └── integracion/        → Módulo 6: Exportación, reportes, dashboard
│   └── components/             → Componentes reutilizables
├── assets/
│   ├── icons/                  → Iconos SVG inline
│   └── data/                   → Datos demo (.json)
├── docs/
│   ├── manual-usuario.md       → Manual de usuario paso a paso
│   └── api.md                  → Documentación de la API de funciones
└── tests/
    ├── unit/                   → Tests unitarios por módulo
    └── integration/            → Tests de integración
```

---

## Colaborar

El proyecto se desarrolla en equipo y con asistentes de IA. Antes de empezar, lee:

- [`AGENTS.md`](AGENTS.md): reglas para las personas y para sus IAs (Kiro, Claude Code, Cursor, Copilot, Codex, Gemini y opencode).
- [`docs/reglas/flujo-de-trabajo.md`](docs/reglas/flujo-de-trabajo.md): ramas, commits, Pull Requests y conflictos.
- [`docs/contexto/`](docs/contexto/): arquitectura y dominio financiero.
- [`docs/planificacion/`](docs/planificacion/): plan y estado de cada feature.
- [`docs/decisiones.md`](docs/decisiones.md): decisiones discutibles, con su motivo y cómo revertirlas.

---

## Licencia

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Créditos

- **Proyecto Final**: Gestión Financiera y Operativa — Semestre 4, Ingeniería de Sistemas, UNI RUSB
- **Inspiración**: FinBot Uni (finbotuni.netlify.app) — herramienta de análisis financiero educativo
- **Gráficos**: [Chart.js](https://www.chartjs.org/) — librería ligera de visualización
- **Tests**: [Vitest](https://vitest.dev/) — framework de tests unitarios
- **Docs**: Manual de usuario y documentación API escritos en Markdown
