# 05 — Checks de la orden v6

Este archivo reemplaza al de la ronda v3 (el contenido anterior —verificador de 12 reglas, 40 celdas
del caso v3— quedó en el historial de git, commit `2a607c1`; motivo: la orden v6 exige H8, que registre
el validador, el comando y la salida por bloque, y G3 con corrida completa).

## H8 — Validador

- **Script:** `docs/razones_financieras/notas/validador_v6.mjs` (forma parte del repo, commit G0-G1).
- **Comandos:**
  - Todas las validaciones: `cd docs/razones_financieras` y `node notas\validador_v6.mjs`
  - Solo las de un bloque: `node notas\validador_v6.mjs --solo V1,V2,V3,V5`
  - Sobre otra copia (G3): `node notas\validador_v6.mjs --raiz <ruta\al\worktree>\docs\razones_financieras`
- **Salida:** una línea por validación (`OK  Vx` o `FALLO Vx: detalle`), conteos y resultado; sale con
  código 1 si hay fallos. Cada bloque de abajo guarda el comando y la salida literal.

Nota sobre V12: el patrón `pendiente` se busca como palabra completa (sin distinción de mayúsculas),
`TODO` como palabra completa en mayúsculas y `información/informacion faltante`, `dato faltante`,
`DECISION_PENDIENTE` y `???` como cadenas literales (documentado en la cabecera del propio script).

## B1 — Estructura y sintaxis v6 (bloque B1)

Migra los 20 JSON a `schema_version 2.0` con las 9 claves, `razon`/`razones_dependientes` (notas
`DIFERENCIA_CONOCIDA_PROFESOR` en `razon.notes`), derivados/conjuntos/cuentas v6 y árboles con las 11
operaciones. `modo_periodo` entra sin `control_global` y `presentacion` sin formato F1: esas piezas se
completan en B4 (H1/H2). La investigación de fuentes todavía es la interina de la v3 y se corrige en B2.

Comando: `node notas\validador_v6.mjs --solo V1,V2,V3,V5`

```
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 4 validaciones
OK   V1
OK   V2
OK   V3
OK   V5
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=67 partially=0 ambiguous=4 notas_DIFERENCIA=8
RESULTADO: 4/4 validaciones sin fallos
```

**B1: pasa (4/4).** El conteo `verified=67 / partially=0 / ambiguous=4` es el estado interino de la v3;
se corrige en B2 (V14/V15).

## B2 — Fuentes y estados (bloque B2)

Reconstruye la investigación de las 71 cuentas: quita F1/F2 de las fuentes (H4), abre y registra las
normas que faltaban (NIC 1, NIIF 9, NIIF 15, NIC 32; ya abiertas en esta ejecución), corrige estados
(las 4 internas → `partially_verified` con `ambiguities`; las 5 `ambiguous` con motivo; el resto
`verified` con fuente normativa), escribe `notas/02_cuentas_maestras.md` y `notas/03_fuentes.md`, y
deja `02_fuentes.md` y `03_registro_cuentas.md` como punteros (regla 9).

Comando: `node notas\validador_v6.mjs --solo V1,V2,V3,V5,V14,V15`

```
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
OK   V1
OK   V2
OK   V3
OK   V5
OK   V14
OK   V15
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 6/6 validaciones sin fallos
```

**B2: pasa (6/6).** Corrección durante el bloque: el primer pase dejó 4 cuentas ambiguas del caso
(`bs.ppe_machinery`, `bs.other_current_liabilities`, `bs.long_term_borrowings`, `bs.other_reserves`)
como `verified`; el conteo del validador (66/4/1) delató el fallo y se corrigió el generador para
marcarlas `ambiguous` según la nota de la lista maestra (62/4/5).

## B3 — Conjuntos y derivados (bloque B3)

Los 11 conjuntos y los 17 derivados entraron en B1 junto con las fórmulas (V3 exige que todo id de
árbol exista en su sección: no podía dejarse para B3). Este bloque los verifica como copia textual
de la orden y regenera `notas/04_derivados.md` en versión v6 (los JSON no cambian en B3).

Comando: `node notas\validador_v6.mjs --solo V6,V7,V16`

```
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 3 validaciones
OK   V6
OK   V7
OK   V16
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 3/3 validaciones sin fallos
```

**B3: pasa (3/3).**
