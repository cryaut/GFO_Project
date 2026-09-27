# Reglas de código

## Stack y estilo

- JavaScript vanilla con ES modules (`import`/`export`). Sin frameworks, TypeScript ni paso de build.
- ESLint (`eslint.config.js`) exige comillas simples, punto y coma y cero variables sin definir. `npm run lint` debe terminar sin errores.
- Sangría de 2 espacios. Nombres del dominio en español y camelCase (`rotacionCxP`, `utilidadNeta`); constantes en mayúsculas (`DIAS_ANIO`, `UMBRALES`).
- El nombre de una función es el término financiero: `edadInventario`, no `calcDias`.
- Comenta el porqué cuando no es obvio: una decisión de fórmula, un caso límite o un supuesto. No comentes lo que el código ya dice.
- No reformatees ni cambies los finales de línea de archivos que no editas. Muchos archivos están guardados con CRLF; un reformateo convierte el diff en el archivo entero y provoca conflictos con todo el equipo.

## Dónde va cada cosa

| Qué | Dónde |
|---|---|
| Fórmula financiera genérica (razón, grado, tasa) | `js/utils/calculate.js` |
| Lógica propia de un módulo (armar datos, derivar subtotales) | `js/modules/<modulo>/<modulo>-calculations.js` |
| Interfaz de un módulo | `js/modules/<modulo>/index.js` o `<modulo>-ui.js` |
| Formato de números y moneda | `js/utils/format.js` |
| Utilidades HTML | `js/utils/html.js` |
| Datos de ejemplo | `scripts/` |

Un módulo nuevo es una carpeta `js/modules/<modulo>/` con un `index.js` que exporta `init<Modulo>()`, más su ruta (pasos en `docs/contexto/arquitectura.md`).

## Funciones financieras

- **Puras.** Reciben números y devuelven un número o `null`. No usan `document`, `window`, `store` ni `localStorage`, y no importan componentes de interfaz.
- **Contrato N/D.** Devuelven `null` si falta un dato o el denominador es 0: `if (!denominador) return null;`. Si 0 es un valor válido de la entrada, compáralo de forma explícita.
- **Una por concepto.** Antes de crear una, busca en tres lugares:
  1. el código: `git grep -n "export function" -- js/`;
  2. el catálogo de `docs/contexto/dominio-financiero.md`;
  3. las ramas abiertas del equipo: `git fetch origin` y `git grep -n "<nombre>" origin/<rama> -- js/`.
- **Sin números mágicos.** Usa `DIAS_ANIO`. Los umbrales de interpretación van en `UMBRALES`, no dentro de la fórmula.
- **Documentadas y probadas.** Cada función pública nueva lleva su entrada en `docs/api.md`, su fila en el catálogo y un test con un caso resuelto a mano.

## Datos de estados financieros

- Lee los totales con `computeFinancialTotals(datos, periodo)`, nunca buscando cuentas por nombre.
- Obtén los datos guardados con `normalizeFinancialData`, como hacen Análisis e Integración.
- Si un total es `null` (hay cuentas sin clasificar), muestra N/D; no lo reemplaces por 0.
- Para guardar: `store.setPersisted('estados', normalizeFinancialData(datos))`.
- Un tipo de cuenta nuevo es un cambio compartido (ver `docs/contexto/dominio-financiero.md`).

## Interfaz

- Las vistas se arman con plantillas y `innerHTML`. Escapa con `escapeHTML` todo texto que venga del usuario o de un archivo: nombres de cuenta, periodos, nombre de la empresa, mensajes de error que los incluyan.
- `formatNumber`, `formatPercent` y `formatCurrency` convierten `null` en 0. Verifica `null` antes de formatear y muestra "N/D".
- Un estado no debe depender solo del color: acompaña cada insignia con texto ("OK", "Revisión").
- Cada control de formulario tiene su `<label>` y se puede usar con teclado.
- Mensajes para el usuario en español, concretos y con la acción a seguir (por ejemplo, "Fila 12: la cuenta … no se reconoce. Añada una Clasificación").

## Seguridad y privacidad

- Los datos no salen del navegador: no agregues envíos a servicios externos, analíticas ni rastreadores.
- Valida los archivos importados como lo hace `estados-normalize.js`: límites de tamaño, claves peligrosas (`__proto__`, `constructor`, `prototype`) y números finitos.
- Prohibido `eval`, `new Function` e insertar HTML sin escapar.
- Nada de claves ni tokens en el código.

## Dependencias

- Ninguna nueva sin acuerdo del equipo en un PR.
- Si se aprueba, con versión exacta: sin `^` en `package.json`, o una URL de CDN con la versión fija.
- Para librerías que leen archivos del usuario, prefiere una copia local en el repositorio antes que un CDN de terceros.
