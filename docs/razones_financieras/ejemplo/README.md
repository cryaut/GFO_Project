# Ejemplo de cálculo a mano v3 — ronda 15

Referencia vigente: `ejemplo-calculo-a-mano-v3.xlsx`, recibido el 23 de octubre de 2026. El archivo se conserva idéntico al adjunto de Carlos; no se editan sus entradas, fórmulas ni la hoja Esperados. No se usa el ejemplo v2.

SHA-256: `2de3aca1298f5b45c138d0de91de71f5217e809a4e8b65fe715797851dfee814`.

La hoja Entradas contiene las líneas por identificador y los periodos 2023/2024. Los vacíos se omiten en la entrada del motor; cero se conserva como número. La hoja Esperados, filas 4 a 23 y columnas D/E/F, contiene las 60 celdas: 2023 apagado, 2024 apagado y 2023 encendido. Los porcentajes están expresados multiplicados por 100; el motor conserva la razón sin escalar hasta presentarla.

La extracción reproducible está en `scripts/extraer-ejemplo-razones-v3.py` (solo biblioteca estándar de Python). La fixture extraída y sus referencias de celda están bajo `tests/unit/fixtures/`. `node scripts/comparar-ejemplo-razones.mjs` compara las 60 celdas con tolerancia de seis decimales, conforme a `docs/reglas/pruebas-y-documentacion.md`; una celda N/D exige valor `null` y motivo. La precisión interna del motor se conserva.

La nota histórica Leeme!A29 aún menciona la ronda 14. La ronda 15 la reemplaza; se informa la referencia antigua sin modificar el libro recibido. Con el control encendido también permanecen N/D los cálculos que necesitan expresamente un saldo de 2022 inexistente.

Documentación del motor: [API](../motor-api.md), [arquitectura](../motor-arquitectura.md) y [dominio](../motor-dominio.md). Se ubica aquí para que el PR respete el alcance de A9.
