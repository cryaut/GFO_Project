"""Caso ficticio. Referencia independiente de Comercial Ejemplo, S.A."""

import json
from fractions import Fraction
from pathlib import Path


CARPETA = Path(__file__).resolve().parent
MESES = 12


def comprobar(condicion, control, detalle):
    if not condicion:
        raise ValueError(f"{control} | {detalle}")


def balance(saldos):
    activos = (
        saldos["efectivo"] + saldos["cxc"] + saldos["inventario_valor"]
        + saldos["activo_fijo_bruto"] + saldos["depreciacion_acumulada"]
    )
    pasivos = saldos["cxp"] + saldos["impuesto_por_pagar"] + saldos["deuda"]
    patrimonio = saldos["capital"] + saldos["resultados_acumulados"]
    return {
        **saldos,
        "activos": activos,
        "pasivos": pasivos,
        "patrimonio": patrimonio,
        "diferencia": activos - pasivos - patrimonio,
    }


def calcular_periodo(apertura, datos):
    periodo = datos["periodo"]
    tasa_impuesto = datos["tasa_impuesto"]
    comprobar(tasa_impuesto is not None, periodo, "Falta confirmar la tasa de impuesto.")
    ventas = datos["unidades_vendidas"] * datos["precio_unitario"]
    venta_contado = ventas * datos["venta_contado"]
    venta_credito = ventas - venta_contado

    compras = datos["compras_unidades"] * datos["costo_compra_unitario"]
    compra_contado = compras * datos["compra_contado"]
    compra_credito = compras - compra_contado
    unidades_disponibles = apertura["inventario_unidades"] + datos["compras_unidades"]
    comprobar(unidades_disponibles > 0, periodo, "El inventario disponible no es positivo.")
    valor_disponible = apertura["inventario_valor"] + compras
    costo_promedio = Fraction(valor_disponible) / unidades_disponibles
    unidades_finales = unidades_disponibles - datos["unidades_vendidas"]
    comprobar(unidades_finales >= 0, periodo, "Las ventas superan las existencias.")
    valor_final = unidades_finales * costo_promedio
    costo_ventas = valor_disponible - valor_final

    gastos = datos["gastos_operativos"]
    depreciacion = datos["depreciacion"]
    interes = datos["intereses"]
    utilidad_bruta = ventas - costo_ventas
    utilidad_operativa = utilidad_bruta - gastos - depreciacion
    utilidad_antes_impuesto = utilidad_operativa - interes
    impuesto = max(utilidad_antes_impuesto, 0) * tasa_impuesto
    utilidad_neta = utilidad_antes_impuesto - impuesto

    cobros = venta_contado + datos["cobros_cxc"]
    pagos_proveedores = compra_contado + datos["pagos_cxp"]
    operacion = cobros - pagos_proveedores - gastos - interes - datos["pago_impuesto"]
    inversion = -datos["inversion"]
    financiamiento = datos["prestamo"] - datos["principal"] - datos["dividendos"]
    variacion = operacion + inversion + financiamiento
    cierre = balance({
        "efectivo": apertura["efectivo"] + variacion,
        "cxc": apertura["cxc"] + venta_credito - datos["cobros_cxc"],
        "inventario_unidades": unidades_finales,
        "inventario_valor": valor_final,
        "activo_fijo_bruto": apertura["activo_fijo_bruto"] + datos["inversion"],
        "depreciacion_acumulada": apertura["depreciacion_acumulada"] - depreciacion,
        "cxp": apertura["cxp"] + compra_credito - datos["pagos_cxp"],
        "impuesto_por_pagar": apertura["impuesto_por_pagar"] + impuesto - datos["pago_impuesto"],
        "deuda": apertura["deuda"] + datos["prestamo"] - datos["principal"],
        "capital": apertura["capital"],
        "resultados_acumulados": apertura["resultados_acumulados"] + utilidad_neta - datos["dividendos"],
    })
    comprobar(cierre["diferencia"] == 0, periodo, f"Diferencia de balance {cierre['diferencia']}.")
    return {
        "periodo": periodo,
        "apertura": apertura,
        "inventario": {
            "unidades_disponibles": unidades_disponibles,
            "valor_disponible": valor_disponible,
            "costo_compra_unitario": datos["costo_compra_unitario"],
            "costo_promedio": costo_promedio,
            "unidades_finales": unidades_finales,
            "valor_final": valor_final,
        },
        "movimientos": {
            "unidades_vendidas": datos["unidades_vendidas"],
            "ventas_contado": venta_contado,
            "ventas_credito": venta_credito,
            "cobros_cxc": datos["cobros_cxc"],
            "cobros": cobros,
            "compras_unidades": datos["compras_unidades"],
            "compras_valor": compras,
            "compras_contado": compra_contado,
            "compras_credito": compra_credito,
            "pagos_cxp": datos["pagos_cxp"],
            "pagos_proveedores": pagos_proveedores,
            "pago_impuesto": datos["pago_impuesto"],
            "compra_activo_fijo": datos["inversion"],
            "prestamo": datos["prestamo"],
            "principal": datos["principal"],
            "dividendos": datos["dividendos"],
        },
        "estado_resultados": {
            "ventas": ventas,
            "costo_ventas": costo_ventas,
            "utilidad_bruta": utilidad_bruta,
            "gastos_operativos": gastos,
            "depreciacion": depreciacion,
            "utilidad_operativa": utilidad_operativa,
            "intereses": interes,
            "utilidad_antes_impuesto": utilidad_antes_impuesto,
            "impuesto_causado": impuesto,
            "utilidad_neta": utilidad_neta,
        },
        "flujo": {
            "operacion": operacion,
            "inversion": inversion,
            "financiamiento": financiamiento,
            "variacion": variacion,
        },
        "cierre": cierre,
    }


def cotejar_historico(resultado, esperado):
    for bloque, valores in esperado.items():
        for campo, referencia in valores.items():
            obtenido = resultado[bloque][campo]
            comprobar(
                obtenido == referencia,
                resultado["periodo"],
                f"{bloque}.{campo}: resultado {obtenido}, referencia {referencia}.",
            )


def agendar(agenda, mes, origen, importe):
    if importe:
        agenda.setdefault(mes, []).append({"origen": origen, "importe": importe})


def fecha_mes(anio, mes):
    desplazamiento, indice = divmod(mes - 1, MESES)
    return f"{anio + desplazamiento:04d}-{indice + 1:02d}"


def proyectar(apertura, plan):
    anio = plan["anio"]
    agendas = {"cobros_cxc": {}, "pagos_cxp": {}, "pago_impuesto": {}}
    periodo_apertura = f"{anio - 1}-12"
    for mes, fraccion in enumerate(plan["distribucion_cobro_apertura"], start=1):
        agendar(agendas["cobros_cxc"], mes, periodo_apertura, apertura["cxc"] * fraccion)
    agendar(agendas["pagos_cxp"], plan["mes_pago_cxp_apertura"], periodo_apertura, apertura["cxp"])
    agendar(
        agendas["pago_impuesto"],
        plan["mes_pago_impuesto_apertura"],
        periodo_apertura,
        apertura["impuesto_por_pagar"],
    )

    meses = []
    for mes, unidades in enumerate(plan["unidades_vendidas"], start=1):
        periodo = fecha_mes(anio, mes)
        objetivo = (
            plan["unidades_vendidas"][mes] * plan["objetivo_inventario_siguiente"]
            if mes < MESES else plan["inventario_final_diciembre"]
        )
        compras = max(0, unidades + objetivo - apertura["inventario_unidades"])
        aplicados = {tipo: agenda.get(mes, []) for tipo, agenda in agendas.items()}
        totales = {tipo: sum(c["importe"] for c in cohortes) for tipo, cohortes in aplicados.items()}

        # El equipo de marzo deprecia desde abril. El préstamo de junio devenga desde julio.
        resultado = calcular_periodo(apertura, {
            **totales,
            "periodo": periodo,
            "unidades_vendidas": unidades,
            "precio_unitario": plan["precio_unitario"],
            "venta_contado": plan["venta_contado"],
            "compras_unidades": compras,
            "costo_compra_unitario": plan["costo_compra_unitario"][mes - 1],
            "compra_contado": plan["compra_contado"],
            "gastos_operativos": (
                plan["gasto_fijo_mensual"]
                + unidades * plan["precio_unitario"] * plan["gasto_variable_sobre_ventas"]
            ),
            "depreciacion": apertura["activo_fijo_bruto"] * plan["tasa_depreciacion_anual"] / MESES,
            "intereses": apertura["deuda"] * plan["tasa_interes_anual"] / MESES,
            "tasa_impuesto": plan["tasa_impuesto"],
            "inversion": plan["inversiones_por_mes"].get(str(mes), 0),
            "prestamo": plan["prestamos_al_cierre_por_mes"].get(str(mes), 0),
            "principal": plan["principal_mensual"],
            "dividendos": plan["dividendos_por_mes"].get(str(mes), 0),
        })
        resultado["mes"] = mes
        resultado["inventario"]["objetivo_unidades"] = objetivo
        resultado["inventario"]["sobrante_unidades"] = resultado["cierre"]["inventario_unidades"] - objetivo
        resultado["vencimientos_aplicados"] = aplicados
        meses.append(resultado)
        movimientos = resultado["movimientos"]
        for plazo, fraccion in enumerate(plan["distribucion_cobro_credito"], start=1):
            agendar(agendas["cobros_cxc"], mes + plazo, periodo, movimientos["ventas_credito"] * fraccion)
        agendar(
            agendas["pagos_cxp"], mes + plan["meses_hasta_pago_credito"],
            periodo, movimientos["compras_credito"],
        )
        agendar(
            agendas["pago_impuesto"], mes + plan["meses_hasta_pago_impuesto"],
            periodo, resultado["estado_resultados"]["impuesto_causado"],
        )
        apertura = resultado["cierre"]

    pendientes = {
        tipo: [
            {"vence": fecha_mes(anio, mes), **cohorte}
            for mes, cohortes in sorted(agenda.items())
            if mes > MESES
            for cohorte in cohortes
        ]
        for tipo, agenda in agendas.items()
    }
    anual = {
        bloque: {campo: sum(m[bloque][campo] for m in meses) for campo in meses[0][bloque]}
        for bloque in ("movimientos", "estado_resultados", "flujo")
    }
    anual.update({"apertura": meses[0]["apertura"], "cierre": meses[-1]["cierre"]})
    return {"meses": meses, "anual": anual, "vencimientos_pendientes": pendientes}


def verificar_proyeccion(proyeccion, esperado):
    meses = proyeccion["meses"]
    anual = proyeccion["anual"]
    apertura = anual["apertura"]
    cierre = anual["cierre"]
    mov = anual["movimientos"]
    resultados = anual["estado_resultados"]
    flujo = anual["flujo"]
    pendientes_cxc = proyeccion["vencimientos_pendientes"]["cobros_cxc"]
    diciembre = meses[-1]
    julio = meses[6]
    costo_julio = julio["inventario"]["costo_promedio"]
    controles = {
        "E1-06": (
            len(meses) == MESES and
            all(abs(m["cierre"]["diferencia"]) <= esperado["tolerancia_balance"] for m in meses)
        ),
        "E1-07": (
            [m["mes"] for m in meses if not m["movimientos"]["compras_unidades"]] ==
            esperado["meses_sin_compras"]
            and all(m["inventario"]["sobrante_unidades"] > 0 for m in meses[:2])
        ),
        "E1-08": all(
            m["cierre"]["inventario_unidades"] == m["inventario"]["objetivo_unidades"]
            for m in meses if m["movimientos"]["compras_unidades"] > 0
        ),
        "E1-09": (
            julio["apertura"]["inventario_valor"] == 100 * julio["apertura"]["inventario_unidades"]
            and julio["inventario"]["costo_compra_unitario"] == 108
            and 100 < costo_julio < 108
        ),
        "E1-10": all(m["cierre"]["efectivo"] >= 0 for m in meses),
        "E1-11": (
            cierre["cxc"] == apertura["cxc"] + mov["ventas_credito"] - mov["cobros_cxc"]
            == sum(c["importe"] for c in pendientes_cxc)
            and {c["origen"] for c in pendientes_cxc} == {"2026-11", "2026-12"}
        ),
        "E1-12": (
            cierre["cxp"] == apertura["cxp"] + mov["compras_credito"] - mov["pagos_cxp"]
            == diciembre["movimientos"]["compras_credito"]
        ),
        "E1-13": (
            cierre["impuesto_por_pagar"] ==
            apertura["impuesto_por_pagar"] + resultados["impuesto_causado"] - mov["pago_impuesto"]
            == diciembre["estado_resultados"]["impuesto_causado"]
        ),
        "E1-14": (
            cierre["deuda"] == apertura["deuda"] + mov["prestamo"] - mov["principal"]
            == esperado["deuda_final_2026"]
        ),
        "E1-15": (
            cierre["activo_fijo_bruto"] == apertura["activo_fijo_bruto"] + mov["compra_activo_fijo"]
            == esperado["activo_fijo_bruto_final_2026"]
            and cierre["depreciacion_acumulada"] == apertura["depreciacion_acumulada"] - resultados["depreciacion"]
        ),
        "E1-16": cierre["resultados_acumulados"] == (
            apertura["resultados_acumulados"] + resultados["utilidad_neta"] - mov["dividendos"]
        ),
        "E1-17": cierre["efectivo"] == (
            apertura["efectivo"] + flujo["operacion"] + flujo["inversion"] + flujo["financiamiento"]
        ),
    }
    for control, conforme in controles.items():
        comprobar(conforme, control, "No coincide con la matriz de la ronda.")
    return controles


def generar_referencia(entradas):
    apertura_2023 = balance(entradas["apertura_2023"])
    esperado = entradas["verificacion"]
    comprobar(
        apertura_2023["diferencia"] == 0 and apertura_2023["activos"] == esperado["apertura_activos"],
        "E1-01",
        "El balance de apertura debe cuadrar en 300000.",
    )
    historicos = {}
    apertura = apertura_2023
    for datos in entradas["historicos"]:
        periodo = datos["periodo"]
        resultado = calcular_periodo(apertura, {**datos, "intereses": apertura["deuda"] * datos["tasa_interes"]})
        cotejar_historico(resultado, esperado["historicos"][periodo])
        historicos[periodo] = resultado
        apertura = resultado["cierre"]

    proyeccion = proyectar(apertura, entradas["proyeccion_2026"])
    controles = verificar_proyeccion(proyeccion, esperado)
    return {
        "caso": entradas["caso"],
        "empresa": entradas["empresa"],
        "moneda": entradas["moneda"],
        "base_main": entradas["base_main"],
        "apertura_2023": apertura_2023,
        "historicos": historicos,
        "proyeccion_2026": proyeccion,
        "controles": {**{f"E1-{i:02d}": True for i in range(1, 6)}, **controles},
    }


def a_json(valor):
    # Se redondea una sola vez al exportar. Los controles usan fracciones exactas.
    if isinstance(valor, Fraction):
        return float(round(valor, 2))
    if isinstance(valor, dict):
        return {clave: a_json(item) for clave, item in valor.items()}
    if isinstance(valor, list):
        return [a_json(item) for item in valor]
    return valor


def main():
    entradas = json.loads((CARPETA / "inputs.json").read_text(encoding="utf-8"), parse_float=Fraction)
    try:
        referencia = generar_referencia(entradas)
    except ValueError as error:
        raise SystemExit(str(error)) from error
    destino = CARPETA / "referencia_resultados.json"
    destino.write_text(json.dumps(a_json(referencia), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{entradas['caso']}. {len(referencia['controles'])} controles conformes.")
    print(destino)


if __name__ == "__main__":
    main()
