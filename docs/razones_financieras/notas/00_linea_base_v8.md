# Línea base v8 — Ronda 8 T3

- Commit solicitado por v8: `a87ef0af0954e00d3f95ed1476ec3154bc06d768`.
- Head recibido y conservado de ronda 7: `1481e79cf2995567c7641669a236d51eff250f95`.
- Fecha de esta ejecución: 2026-10-21 (America/Managua).
- Se lee cada JSON directamente de Git en el commit solicitado; no se reconstruye ni se atribuye a v8 una línea base de otra ronda.
- Método: parsear JSON, quitar exclusivamente `research` de cada elemento de `cuentas`, ordenar claves recursivamente, serializar UTF-8 sin espacios (`ensure_ascii=False`, `sort_keys=True`, separadores `,` y `:`) y calcular SHA-256. Los arreglos conservan su orden.
- La comparación estricta inicial ya tiene 3 archivos distintos fuera de research por la corrección autorizada de intangibles de ronda 7. No se revierte para forzar G3; se medirá también el incremento desde `1481e79cf2995567c7641669a236d51eff250f95`.

## SHA-256 sin `cuentas[].research`

| Archivo | SHA-256 canónico en a87ef0a |
|---|---|
| `actividad_ciclo_conversion_efectivo.json` | `a8561442c99faa7e8bc6d82bafd9384af62f5f4fbf6e6df6d15276c35ad0cb08` |
| `actividad_edad_promedio_inventario.json` | `6882ad08aac6c466670c81d78aab08d0d0520ad5c8830e6d57e02963c0e97dfc` |
| `actividad_periodo_promedio_cobro.json` | `865c91f7927a08e0f5cf56633243b92c100f765320be88b3d936b95e46c0c794` |
| `actividad_periodo_promedio_pago.json` | `75a1ca73218c90fe5f454f30f4d96b35f82abfd6e02c1cd78339ce55709253cd` |
| `actividad_rotacion_activos_fijos.json` | `070025c11225faf0636d4b71cc42fd7926a8d0f7aa1179887c237d6478dc29cc` |
| `actividad_rotacion_activos_totales.json` | `4e48850e196e6f3ef77c9c58ac2bf4ac8350dbecfa8fb112bf2004fdd5a5cef1` |
| `actividad_rotacion_cuentas_por_cobrar.json` | `62b6dbb0b1dde2d69227db8771e5bf9c7ca70449b0fe6c21dd24c1e2079907c1` |
| `actividad_rotacion_cuentas_por_pagar.json` | `cdc8813ea14c4efe5ac714e73a6b1cca1b5e65098eb8f18bb69bc6148f8adccf` |
| `actividad_rotacion_inventarios.json` | `58ab82f3a589056c6e661b70d9981cad6722f0ffd250b04c78a03201460042e8` |
| `endeudamiento_cobertura_interes.json` | `e909c46c8a7eaf66eb92c170a73758d39f6343a9d304fca3bb646246fe0b4f25` |
| `endeudamiento_razon_deuda_patrimonio.json` | `5bb5ed67afc76893faeb2c9f1184148eac8f0a13f567dfc56e326c4fcc78920d` |
| `endeudamiento_razon_deuda_total.json` | `b743c9ed0d3daa8c50596763f56dc8bee5506c9522bcabd13302ddd50a23c7e6` |
| `liquidez_capital_trabajo_neto.json` | `8d7c4a5adce4447deb2c9338af103ee51818e6be06a4639d014dd5c689be7cfb` |
| `liquidez_prueba_acida.json` | `adcad41c9a8bfda5d1fe777e60983e120e3976fa723806a04ea77b9685b2183b` |
| `liquidez_razon_corriente.json` | `b2515cbca037a6ce355e36dba8974b4c6bc54edba42aaf850e83df8b0c328c93` |
| `rentabilidad_margen_utilidad_bruta.json` | `9c41e010e871dc13b8b5a2d2611e6d9539e47eb9d0d105d09ddc9239ac3d3b21` |
| `rentabilidad_margen_utilidad_neta.json` | `bba58b0469679c487b4b0c620de5616ca7abcd0d878247b5e709c61fba15e961` |
| `rentabilidad_margen_utilidad_operativa.json` | `15c4ef31523a3d71e0a50cfd87486e30147324ef276614f2e4996b09d0f3abba` |
| `rentabilidad_roa.json` | `7126cc3d3d7edee7fff0e18a9b1ee1888a1e80d525b3e211d0a3637538f288f7` |
| `rentabilidad_roe.json` | `9a930f7f416a29cb50b4894f14a6db4f42a2078be25567c1953d051e9639724a` |

TOTAL archivos=20.
