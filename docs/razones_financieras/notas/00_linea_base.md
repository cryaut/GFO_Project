# 00 — Línea base (Fase 0, compuerta G0)

Orden: `prompt_correccion_agente_razones_v6.md` (2026-10-15).
Este archivo registra el estado del entregable **antes** de cualquier corrección de la orden v6.

## Estado del árbol y del commit

| Elemento | Valor |
|---|---|
| Fecha de captura | 2026-10-15 |
| Rama | `feat/razones-json-v3` |
| Estado del árbol | limpio (`git status --porcelain` → vacío) |
| Commit inicial de la corrección | `2a607c1334ac4fc3ebc1be51224217f61a1f09ed` (`2a607c1 docs: actualiza la ficha tras la revision del PR`) |
| Commits previos en la rama | `86e04e0`, `c50545a`, `dcdbb44`, `ab2f3a5`, `2a607c1` |
| PR | #10 abierto hacia `main`, head `2a607c1`, sin merge |

## Pruebas del repositorio (línea base)

Comando: `npm test`

```
Test Files  31 passed (31)
     Tests  375 passed (375)
```

Nota: 375 pruebas en 31 archivos. Son pruebas de la aplicación, no de los JSON.
Lint de referencia (ronda previa): `npm run lint` → 0 errores, 10 avisos preexistentes.

## SHA-256 de los 20 JSON

```
2f80a56a9f839c7d86bbc7a8ca1b54c2ccd9dac67565cd6ed681b48535385c35  actividad_ciclo_conversion_efectivo.json
8795afa7d1a5c1ceac880d528fafcf815c28dfd4f077fcbb84827a514cfb4349  actividad_edad_promedio_inventario.json
3a1c3e08d836a0a809fb04a486591ca20f8e863de8180dd46d825259b39e3eee  actividad_periodo_promedio_cobro.json
341b93c39118ffd835d31c448de4a77b56c8cf94dbbaed669e436ae230866b35  actividad_periodo_promedio_pago.json
d55e7133f6a178506c537fccef18868547cf44e26faf77e1548e3bb1ca5f9bb9  actividad_rotacion_activos_fijos.json
b0b84088d9876088d8e459abe6f3f784581ef3675f16148d79639cae1f7000cd  actividad_rotacion_activos_totales.json
ad7e35cba94b1b268e12c51edff6f1133fcb5161850ff8512edb32669e38bd85  actividad_rotacion_cuentas_por_cobrar.json
296596b2c26813e8dd0fa9705c7d6aca80315f1f36ed0008f94234d99637d2b5  actividad_rotacion_cuentas_por_pagar.json
d60a95694955066e27d83abb1e3ff04bbe785f479ee25aa0810ea6e875d62610  actividad_rotacion_inventarios.json
57e6b2e97be4e27a08263db8a2af644ef6ae8bea26c49be7e87ca58cb45b4b8d  endeudamiento_cobertura_interes.json
38a95843287b17189e888d7e9466286558850cc94c0d2df5882b866bdf8b7fc0  endeudamiento_razon_deuda_patrimonio.json
08e1cb6f1a6f1d3e33142306192f8acf2d2473948e9b479f437ca1bd30a5d8a7  endeudamiento_razon_deuda_total.json
a06d3d37bfcd6d3fbcb76227197b8bf54a0c3e0a385e2f901568f74953e2ecc6  liquidez_capital_trabajo_neto.json
ce0c1c347a349c0326b83539607fd4242fd378d81284e6af4024d57adf054ddf  liquidez_prueba_acida.json
f3e4503bf9fd8ae97ce826cdbb18ec2b75b46b757d14a334697d8ee45c82dff6  liquidez_razon_corriente.json
341be60aa4f195e6301c3db965951f87a934830bcaf1a12a429db035c33a51da  rentabilidad_margen_utilidad_bruta.json
15f7778801afebde174ad53ec2bc5778b84a9bd77067c30134ba94dcd44ea7b6  rentabilidad_margen_utilidad_neta.json
3dd9c9c5e54ad35bfbdf431c7dccee06dae71c45f6a00d2ba8deca6e22324d9e  rentabilidad_margen_utilidad_operativa.json
ce5bd9dc0c8866816a6d28fac9cca5e6f6e6d59434d444506a5d04ce0e2cb6dc  rentabilidad_roa.json
2bafbb63873868e8487a3bf605ca935e281d1323568ba0ff78869d425fb35ef0  rentabilidad_roe.json
```

## SHA-256 de los archivos de `notas/`

```
a28e7c3128d7f1be0b700ccc06d0028ad78fc9463242a28b3f8f03c92faba26a  00_control.md
e66d2ac295dc3c52e51c865c2ec125c573e5d4ef5e53a83303c35df0daee0ae6  01_decisiones.md
b9e8b495c67f4e9f6e5597ccd73149f21335707b8bbba8b482d909a75ccc0b3e  02_fuentes.md
911d94576002c031bc347bd7a3ffb1cc2cb933cebd21a3be995110ab70cb2a91  03_registro_cuentas.md
e2be19ef33a7e28698d322df162c8e592b9adef45b12119697af6b7fe7a803ff  04_derivados.md
3f661130871fc8b5ce5890a9b76ceae68eb5b17b1e06c64ef45186fc2adc4317  05_checks.md
```

(Además existen `../ratios/` con 20 notas de la v3, que la orden v6 reubica en `notas/ratios/` en B5.)

## Compuerta G0

- [x] Árbol limpio verificado.
- [x] Commit actual registrado.
- [x] SHA-256 de los 20 JSON y de `notas/` registrado.
- [x] Número de pruebas actual registrado (375 en 31 archivos).

**G0: pasa.**
