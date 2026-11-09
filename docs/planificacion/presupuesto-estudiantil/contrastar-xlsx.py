"""Contraste independiente, de solo lectura. Requiere Python y Node, sin paquetes.

Uso: python docs/planificacion/presupuesto-estudiantil/contrastar-xlsx.py RUTA.xlsx
Los esperados se calculan desde las celdas del libro con Fraction, no desde la app.
"""
import hashlib
import json
import math
import posixpath
import subprocess
import sys
import zipfile
from datetime import date, timedelta
from fractions import Fraction
from pathlib import Path
from xml.etree import ElementTree as ET

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
source = Path(sys.argv[1])
with zipfile.ZipFile(source) as book:
    strings = ["".join(e.itertext()) for e in ET.fromstring(book.read("xl/sharedStrings.xml"))]
    relations = {e.attrib["Id"]: e.attrib["Target"] for e in ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))}
    sheets = {}
    for sheet in ET.fromstring(book.read("xl/workbook.xml")).find("s:sheets", NS):
        target = relations[sheet.attrib[REL]]
        target = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
        cells = {}
        for cell in ET.fromstring(book.read(target)).findall(".//s:c", NS):
            value = cell.find("s:v", NS)
            if value is not None:
                cells[cell.attrib["r"]] = strings[int(value.text)] if cell.get("t") == "s" else value.text
            elif cell.get("t") == "inlineStr":
                cells[cell.attrib["r"]] = "".join(e.text or "" for e in cell.findall(".//s:t", NS))
        sheets[sheet.attrib["name"]] = cells

script = """
import {ejemploEstudiantil} from './js/modules/presupuesto/ejemplos-estudiantiles.js';
import {calcularSeguimiento,calcularProyeccion} from './js/modules/presupuesto/presupuesto-calculations.js';
const datos=ejemploEstudiantil();
console.log(JSON.stringify({datos,seguimiento:calcularSeguimiento(datos),plan:calcularProyeccion(datos.proyecciones.real)}));
"""
app = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", script], cwd=ROOT, encoding="utf-8"))
checks = []


def check(label, expected, actual):
    if isinstance(expected, (Fraction, int, float)):
        valid = isinstance(actual, (int, float)) and math.isclose(float(expected), actual, rel_tol=1e-12, abs_tol=1e-10)
    else:
        valid = expected == actual
    checks.append({"control": label, "esperado": float(expected) if isinstance(expected, Fraction) else expected, "app": actual, "conforme": valid})


def excel_date(value):
    return (date(1899, 12, 30) + timedelta(days=int(value))).isoformat()


meta, ledger, follow, plan = (sheets[n] for n in ["Inicio y meta", "Registro semanal", "Seguimiento", "Presupuesto proyectado"])
cost, weeks = Fraction(meta["B8"]), int(meta["B9"])
start = date.fromisoformat(excel_date(meta["B11"]))
check("meta: descripción B7", meta["B7"], app["datos"]["meta"]["descripcion"])
check("meta: costo B8", cost, app["datos"]["meta"]["costo"])
check("meta: duración B9", weeks, app["datos"]["meta"]["semanas"])
check("meta: inicio B11", start.isoformat(), app["datos"]["meta"]["inicio"])
check("meta: aporte B10", cost / weeks, app["seguimiento"]["aporteRecomendado"])
check("meta: final B12", (start + timedelta(days=weeks * 7 - 1)).isoformat(), app["seguimiento"]["final"])
records = []
for row in range(6, 206):
    if not ledger.get(f"H{row}"):
        continue
    record = {"fecha": excel_date(ledger[f"A{row}"]), "semana": int(ledger[f"B{row}"]), "monto": Fraction(ledger[f"H{row}"])}
    for column, key in [("E", "tipo"), ("F", "categoria"), ("G", "descripcion"), ("I", "prioridad"), ("J", "medio"), ("K", "observacion")]:
        record[key] = ledger.get(f"{column}{row}", "")
    records.append(record)
check("cantidad de movimientos", len(records), len(app["datos"]["movimientos"]))
for i, record in enumerate(records):
    for key, value in record.items():
        if key != "semana":
            check(f"registro fila {i + 6}: {key}", value, app["datos"]["movimientos"][i][key])

totals = dict.fromkeys(["ingreso", "gasto", "ahorro", "reserva", "saldo"], Fraction(0))
accumulated = Fraction(0)
for week in range(1, weeks + 1):
    result = {key: sum((r["monto"] for r in records if r["semana"] == week and r["tipo"] == kind), Fraction(0))
              for key, kind in [("ingreso", "Ingreso"), ("gasto", "Gasto"), ("ahorro", "Ahorro"), ("reserva", "Reserva")]}
    accumulated += result["ahorro"]
    result["saldo"] = result["ingreso"] - result["gasto"] - result["ahorro"] - result["reserva"]
    for key in totals:
        totals[key] += result[key]
    result.update(semana=week, bloque=(week + 3) // 4, desde=(start + timedelta(days=(week - 1) * 7)).isoformat(), hasta=(start + timedelta(days=week * 7 - 1)).isoformat(), acumulado=accumulated, avance=accumulated / cost)
    for key, value in result.items():
        check(f"seguimiento semana {week}: {key}", value, app["seguimiento"]["semanas"][week - 1][key])
    for col, key in [("E", "ingreso"), ("F", "gasto"), ("G", "ahorro"), ("H", "reserva"), ("I", "saldo"), ("J", "acumulado"), ("K", "avance")]:
        check(f"caché docente Seguimiento!{col}{week + 5}", result[key], float(follow[f"{col}{week + 5}"]))
for key, value in totals.items():
    check(f"total realizado: {key}", value, app["seguimiento"][key])
check("avance total", totals["ahorro"] / cost, app["seguimiento"]["avance"])
income = Fraction(plan["B6"])
assigned = sum(Fraction(plan[f"B{row}"]) for row in range(12, 21))
for key, expected in [("total", assigned), ("ahorro", Fraction(plan["B19"])), ("reserva", Fraction(plan["B18"])), ("diferencia", income - assigned), ("porcentaje", assigned / income), ("estado", plan["E7"]), ("limiteSemanal", (income - Fraction(plan["B19"]) - Fraction(plan["B18"])) / 4)]:
    check(f"proyección: {key}", expected, app["plan"][key])
for i, row in enumerate(range(12, 21)):
    for key, expected in [("categoria", plan[f"A{row}"]), ("monto", Fraction(plan[f"B{row}"])), ("tipo", plan[f"D{row}"]), ("porcentaje", Fraction(plan[f"B{row}"]) / income)]:
        check(f"partida {row}: {key}", expected, app["plan"]["partidas"][i][key])
result = {"fuente": source.name, "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "controles": len(checks), "diferencias": [c for c in checks if not c["conforme"]], "resultados": checks}
(HERE / "contraste-numerico.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({k: v for k, v in result.items() if k != "resultados"}, ensure_ascii=False))
sys.exit(bool(result["diferencias"]))
