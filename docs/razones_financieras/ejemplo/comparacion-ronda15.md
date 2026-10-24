# Comparación A5 contra el ejemplo v3

Fuente inmutable: `ejemplo-calculo-a-mano-v3.xlsx`. SHA-256: `2de3aca1298f5b45c138d0de91de71f5217e809a4e8b65fe715797851dfee814`.

Comando reproducible: `node scripts/comparar-ejemplo-razones.mjs`.

Control apagado: 40 celdas. Control encendido: 20 celdas de 2023.
Resultado: 60/60 coinciden; 0 diferencias.

Los porcentajes se comparan en puntos porcentuales, como Esperados. El motor conserva su fracción sin redondear. Los valores de la hoja se conservan completos; la tolerancia decimal es 0.0000005 (6 decimales).

| Celda de Esperados | Razón | Periodo | Control | Esperado (unidad de hoja) | Obtenido (unidad de hoja) | Resultado | Motivo N/D |
|---|---|---|---|---:|---:|---|---|
| D4 | actividad_ciclo_conversion_efectivo | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_ciclo_conversion_efectivo","periodo":"previous"} |
| E4 | actividad_ciclo_conversion_efectivo | 2024 | apagado | 69.8737228325 | 69.87372283250649 | coincide | — |
| F4 | actividad_ciclo_conversion_efectivo | 2023 | encendido | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"bs.trade_payables","periodo":"previous"} |
| D5 | actividad_edad_promedio_inventario | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_edad_promedio_inventario","periodo":"previous"} |
| E5 | actividad_edad_promedio_inventario | 2024 | apagado | 85.7530120482 | 85.75301204819277 | coincide | — |
| F5 | actividad_edad_promedio_inventario | 2023 | encendido | 93.8571428571 | 93.85714285714286 | coincide | — |
| D6 | actividad_periodo_promedio_cobro | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_periodo_promedio_cobro","periodo":"previous"} |
| E6 | actividad_periodo_promedio_cobro | 2024 | apagado | 64.6354166667 | 64.63541666666666 | coincide | — |
| F6 | actividad_periodo_promedio_cobro | 2023 | encendido | 73 | 73 | coincide | — |
| D7 | actividad_periodo_promedio_pago | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_periodo_promedio_pago","periodo":"previous"} |
| E7 | actividad_periodo_promedio_pago | 2024 | apagado | 80.5147058824 | 80.51470588235294 | coincide | — |
| F7 | actividad_periodo_promedio_pago | 2023 | encendido | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"bs.trade_payables","periodo":"previous"} |
| D8 | actividad_rotacion_activos_fijos | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_rotacion_activos_fijos","periodo":"previous"} |
| E8 | actividad_rotacion_activos_fijos | 2024 | apagado | 2.2727272727 | 2.272727272727273 | coincide | — |
| F8 | actividad_rotacion_activos_fijos | 2023 | encendido | 1.9180327869 | 1.9180327868852458 | coincide | — |
| D9 | actividad_rotacion_activos_totales | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_rotacion_activos_totales","periodo":"previous"} |
| E9 | actividad_rotacion_activos_totales | 2024 | apagado | 1.1804384486 | 1.1804384485666104 | coincide | — |
| F9 | actividad_rotacion_activos_totales | 2023 | encendido | 1.0263157895 | 1.0263157894736843 | coincide | — |
| D10 | actividad_rotacion_cuentas_por_cobrar | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_rotacion_cuentas_por_cobrar","periodo":"previous"} |
| E10 | actividad_rotacion_cuentas_por_cobrar | 2024 | apagado | 5.6470588235 | 5.647058823529412 | coincide | — |
| F10 | actividad_rotacion_cuentas_por_cobrar | 2023 | encendido | 5 | 5 | coincide | — |
| D11 | actividad_rotacion_cuentas_por_pagar | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_rotacion_cuentas_por_pagar","periodo":"previous"} |
| E11 | actividad_rotacion_cuentas_por_pagar | 2024 | apagado | 4.5333333333 | 4.533333333333333 | coincide | — |
| F11 | actividad_rotacion_cuentas_por_pagar | 2023 | encendido | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"bs.trade_payables","periodo":"previous"} |
| D12 | actividad_rotacion_inventarios | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"actividad_rotacion_inventarios","periodo":"previous"} |
| E12 | actividad_rotacion_inventarios | 2024 | apagado | 4.2564102564 | 4.256410256410256 | coincide | — |
| F12 | actividad_rotacion_inventarios | 2023 | encendido | 3.8888888889 | 3.888888888888889 | coincide | — |
| D13 | endeudamiento_cobertura_interes | 2023 | apagado | 7.5 | 7.5 | coincide | — |
| E13 | endeudamiento_cobertura_interes | 2024 | apagado | 11.9090909091 | 11.909090909090908 | coincide | — |
| F13 | endeudamiento_cobertura_interes | 2023 | encendido | 7.5 | 7.5 | coincide | — |
| D14 | endeudamiento_razon_deuda_patrimonio | 2023 | apagado | 1.1348314607 | 1.1348314606741574 | coincide | — |
| E14 | endeudamiento_razon_deuda_patrimonio | 2024 | apagado | 0.6830601093 | 0.6830601092896175 | coincide | — |
| F14 | endeudamiento_razon_deuda_patrimonio | 2023 | encendido | 1.1348314607 | 1.1348314606741574 | coincide | — |
| D15 | endeudamiento_razon_deuda_total | 2023 | apagado | 53.1578947368 | 53.1578947368421 | coincide | — |
| E15 | endeudamiento_razon_deuda_total | 2024 | apagado | 40.5844155844 | 40.58441558441558 | coincide | — |
| F15 | endeudamiento_razon_deuda_total | 2023 | encendido | 53.1578947368 | 53.1578947368421 | coincide | — |
| D16 | liquidez_capital_trabajo_neto | 2023 | apagado | 92000 | 92000 | coincide | — |
| E16 | liquidez_capital_trabajo_neto | 2024 | apagado | 127000 | 127000 | coincide | — |
| F16 | liquidez_capital_trabajo_neto | 2023 | encendido | 92000 | 92000 | coincide | — |
| D17 | liquidez_prueba_acida | 2023 | apagado | 1.0144927536 | 1.0144927536231885 | coincide | — |
| E17 | liquidez_prueba_acida | 2024 | apagado | 1.1517241379 | 1.1517241379310346 | coincide | — |
| F17 | liquidez_prueba_acida | 2023 | encendido | 1.0144927536 | 1.0144927536231885 | coincide | — |
| D18 | liquidez_razon_corriente | 2023 | apagado | 1.6666666667 | 1.6666666666666667 | coincide | — |
| E18 | liquidez_razon_corriente | 2024 | apagado | 1.875862069 | 1.8758620689655172 | coincide | — |
| F18 | liquidez_razon_corriente | 2023 | encendido | 1.6666666667 | 1.6666666666666667 | coincide | — |
| D19 | rentabilidad_margen_utilidad_bruta | 2023 | apagado | 40.1709401709 | 40.17094017094017 | coincide | — |
| E19 | rentabilidad_margen_utilidad_bruta | 2024 | apagado | 40.7142857143 | 40.714285714285715 | coincide | — |
| F19 | rentabilidad_margen_utilidad_bruta | 2023 | encendido | 40.1709401709 | 40.17094017094017 | coincide | — |
| D20 | rentabilidad_margen_utilidad_neta | 2023 | apagado | 11.2820512821 | 11.282051282051283 | coincide | — |
| E20 | rentabilidad_margen_utilidad_neta | 2024 | apagado | 14.1428571429 | 14.142857142857142 | coincide | — |
| F20 | rentabilidad_margen_utilidad_neta | 2023 | encendido | 11.2820512821 | 11.282051282051283 | coincide | — |
| D21 | rentabilidad_margen_utilidad_operativa | 2023 | apagado | 15.3846153846 | 15.384615384615385 | coincide | — |
| E21 | rentabilidad_margen_utilidad_operativa | 2024 | apagado | 18.7142857143 | 18.714285714285715 | coincide | — |
| F21 | rentabilidad_margen_utilidad_operativa | 2023 | encendido | 15.3846153846 | 15.384615384615385 | coincide | — |
| D22 | rentabilidad_roa | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"rentabilidad_roa","periodo":"previous"} |
| E22 | rentabilidad_roa | 2024 | apagado | 16.694772344 | 16.694772344013494 | coincide | — |
| F22 | rentabilidad_roa | 2023 | encendido | 11.5789473684 | 11.578947368421053 | coincide | — |
| D23 | rentabilidad_roe | 2023 | apagado | N/D | N/D | coincide | {"codigo":"missing_required_period_balance","id":"rentabilidad_roe","periodo":"previous"} |
| E23 | rentabilidad_roe | 2024 | apagado | 31.2796208531 | 31.27962085308057 | coincide | — |
| F23 | rentabilidad_roe | 2023 | encendido | 24.7191011236 | 24.719101123595504 | coincide | — |
