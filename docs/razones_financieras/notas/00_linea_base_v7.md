# Línea base v7 (orden `prompt_correccion_agente_razones_v7.md`)

Línea base de la corrección v7 sobre el PR #10. Cualquier cambio de un JSON fuera de
`cuentas[].research` se detecta comparando el SHA-256 "sin `cuentas[].research`" contra esta tabla.

- **Commit base:** `b325ab2` (head de `feat/razones-json-v3` al empezar la v7)
- **Rama:** `feat/razones-json-v3`
- **Número de pruebas:** 375 (31 archivos) — `npm test`, verde, corrido 2026-10-15
- **Método del SHA-256 sin `cuentas[].research`:** se parsea cada JSON, se borra `research` de cada
  entrada de `cuentas`, se ordenan las claves recursivamente (forma canónica) y se hashea el UTF-8
  resultante. El SHA-256 "completo" es el de los bytes exactos del archivo.

Generado por el script `baseline_v7.mjs` (fuera del repo, en el área de trabajo temporal del agente).

## SHA-256 de los 20 JSON

| Archivo | SHA-256 completo | SHA-256 sin `cuentas[].research` |
|---|---|---|
| `actividad_ciclo_conversion_efectivo.json` | `51c7e37dae6edf077164b60b07bf59ce50bfbb37d7e80115084f3cf208873a53` | `a8561442c99faa7e8bc6d82bafd9384af62f5f4fbf6e6df6d15276c35ad0cb08` |
| `actividad_edad_promedio_inventario.json` | `453309b13394734843aef31d112174d792d1f40ade2ec28bcb3f9cde06d2db37` | `6882ad08aac6c466670c81d78aab08d0d0520ad5c8830e6d57e02963c0e97dfc` |
| `actividad_periodo_promedio_cobro.json` | `46f3c3a36959836b5636b42ed199b37e0e0a5974f84c7c97fbfaa71f41f0199a` | `865c91f7927a08e0f5cf56633243b92c100f765320be88b3d936b95e46c0c794` |
| `actividad_periodo_promedio_pago.json` | `56e8d175438af038a8bad55b5e592bb43a5f821d9664e090e3d798003ae3e882` | `75a1ca73218c90fe5f454f30f4d96b35f82abfd6e02c1cd78339ce55709253cd` |
| `actividad_rotacion_activos_fijos.json` | `887a64b35fe69394456c4747e3b8d56aecbfd599f6480658c5facb9891c6d128` | `070025c11225faf0636d4b71cc42fd7926a8d0f7aa1179887c237d6478dc29cc` |
| `actividad_rotacion_activos_totales.json` | `14f855eceb79c14864601adffd090229da428c6e581304278b1fb924ebff7efd` | `4e48850e196e6f3ef77c9c58ac2bf4ac8350dbecfa8fb112bf2004fdd5a5cef1` |
| `actividad_rotacion_cuentas_por_cobrar.json` | `ad2d47be37e227236be964a001397e6b8301486a23a5baf37467a119d2842cd0` | `62b6dbb0b1dde2d69227db8771e5bf9c7ca70449b0fe6c21dd24c1e2079907c1` |
| `actividad_rotacion_cuentas_por_pagar.json` | `ff4aa850e61959f93c389aa27b3db7f82f7cfc7a506a53111e4f92bd24608758` | `cdc8813ea14c4efe5ac714e73a6b1cca1b5e65098eb8f18bb69bc6148f8adccf` |
| `actividad_rotacion_inventarios.json` | `01d937ffceece9a1070e3d384deca22102abf086f7eb0a1967268842c4b1a46b` | `58ab82f3a589056c6e661b70d9981cad6722f0ffd250b04c78a03201460042e8` |
| `endeudamiento_cobertura_interes.json` | `efedc9052c2b71bcf44a2fa9c661eacbd4a452d99d38cd4326474f6f6e4076ec` | `e909c46c8a7eaf66eb92c170a73758d39f6343a9d304fca3bb646246fe0b4f25` |
| `endeudamiento_razon_deuda_patrimonio.json` | `82f03cc139e6e677f25eeaa0aa2adfc899a1da1b1515991a795fbb74848e0541` | `5bb5ed67afc76893faeb2c9f1184148eac8f0a13f567dfc56e326c4fcc78920d` |
| `endeudamiento_razon_deuda_total.json` | `ff06916ef8299614185de57b44682495e8255f0628a307e88864d2435532df67` | `b743c9ed0d3daa8c50596763f56dc8bee5506c9522bcabd13302ddd50a23c7e6` |
| `liquidez_capital_trabajo_neto.json` | `34ac7cee0f0bbfaa2cce1e797bc2ecc658144f0b32cc803fb4e6ef61abd08f30` | `8d7c4a5adce4447deb2c9338af103ee51818e6be06a4639d014dd5c689be7cfb` |
| `liquidez_prueba_acida.json` | `6f847966fee5283f6c94bf1643218fb6ef7883dbcb21a63ef99309245ac5364b` | `adcad41c9a8bfda5d1fe777e60983e120e3976fa723806a04ea77b9685b2183b` |
| `liquidez_razon_corriente.json` | `16ee68d1ffda7916f4da89a6371adc7e41fa1b0b33eca5319c4cab14b1fb6857` | `b2515cbca037a6ce355e36dba8974b4c6bc54edba42aaf850e83df8b0c328c93` |
| `rentabilidad_margen_utilidad_bruta.json` | `2183cc840c8c1501795952691fa145e54f03919e70cb3474ba14489358307a71` | `9c41e010e871dc13b8b5a2d2611e6d9539e47eb9d0d105d09ddc9239ac3d3b21` |
| `rentabilidad_margen_utilidad_neta.json` | `7d85f0ccfdf956322ec9816b5d57d5873f38dd682594c4f2e721e0a99d164f7c` | `bba58b0469679c487b4b0c620de5616ca7abcd0d878247b5e709c61fba15e961` |
| `rentabilidad_margen_utilidad_operativa.json` | `7568ad61bc3f79d4a1e293b33baee755aea2f243c7d0c4b008da902381a511e8` | `15c4ef31523a3d71e0a50cfd87486e30147324ef276614f2e4996b09d0f3abba` |
| `rentabilidad_roa.json` | `eb242fc1f2d2f33b9dd9ed1eb248e0ceb71ea226914d0c3ef7728d04301a81ef` | `7126cc3d3d7edee7fff0e18a9b1ee1888a1e80d525b3e211d0a3637538f288f7` |
| `rentabilidad_roe.json` | `79c2ca0012f0e861ca6a49dce322653a055f072cc9c50af78856fa5f2726b05f` | `9a930f7f416a29cb50b4894f14a6db4f42a2078be25567c1953d051e9639724a` |

TOTAL archivos=20
