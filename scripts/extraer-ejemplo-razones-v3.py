"""Extrae valores literales y referencias del XLSX v3 sin editar el libro.

Uso: python scripts/extraer-ejemplo-razones-v3.py <ejemplo-v3.xlsx>
"""
import hashlib
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

SHA256_V3 = "2de3aca1298f5b45c138d0de91de71f5217e809a4e8b65fe715797851dfee814"


def extraer(origen):
    ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    sha256 = hashlib.sha256(origen.read_bytes()).hexdigest()
    if sha256 != SHA256_V3:
        raise ValueError(f"El libro no es el ejemplo v3 aprobado: SHA-256 {sha256}")
    with zipfile.ZipFile(origen) as libro:
        hojas = ET.fromstring(libro.read("xl/workbook.xml")).find("s:sheets", ns)
        if [hoja.get("name") for hoja in hojas] != ["Leeme", "Entradas", "Derivados", "Razones", "Esperados"]:
            raise ValueError("Las hojas no corresponden al ejemplo v3 aprobado.")
        textos = ["".join(si.itertext()) for si in ET.fromstring(libro.read("xl/sharedStrings.xml"))]

        def hoja(numero):
            filas = ET.fromstring(libro.read(f"xl/worksheets/sheet{numero}.xml")).find("s:sheetData", ns)
            celdas = {}
            for fila in filas:
                for celda in fila:
                    valor = celda.find("s:v", ns)
                    if valor is None:
                        continue
                    texto = valor.text
                    if celda.get("t") == "s":
                        dato = textos[int(texto)]
                    elif celda.get("t") in ("str", "e"):
                        dato = texto
                    elif celda.get("t") == "b":
                        dato = texto == "1"
                    else:
                        dato = float(texto) if "." in texto or "e" in texto.lower() else int(texto)
                    celdas[celda.get("r")] = dato
            return celdas

        entradas = hoja(2)
        esperados = hoja(5)
        derivados = hoja(3)
        datos = []
        for fila in range(7, 83):
            cuenta = entradas.get(f"A{fila}")
            if not isinstance(cuenta, str) or not cuenta.startswith(("bs.", "is.", "supp.")):
                continue
            dato = {"id": cuenta, "nombre": entradas[f"B{fila}"]}
            for periodo, columna in [("2023", "D"), ("2024", "E")]:
                celda = f"{columna}{fila}"
                dato[periodo] = {"celda": celda, "presente": celda in entradas}
                if celda in entradas:
                    dato[periodo]["valor"] = entradas[celda]
            datos.append(dato)
        referencias = []
        for fila in range(4, 24):
            for columna, periodo, control in [("D", "2023", False), ("E", "2024", False), ("F", "2023", True)]:
                celda = f"{columna}{fila}"
                original = esperados[celda]
                referencias.append({
                    "id": esperados[f"A{fila}"], "unidad": esperados[f"C{fila}"],
                    "periodo": periodo, "control": control, "celda": celda,
                    "valor": None if original == "N/D" else original,
                    "original": original,
                })
        regresiones = [{
            "periodo": periodo,
            "activos": {"celda": f"{columna}12", "valor": derivados[f"{columna}12"]},
            "utilidad": {"celda": f"{columna}20", "valor": derivados[f"{columna}20"]},
        } for periodo, columna in [("2023", "D"), ("2024", "E")]]
    return {
        "fuente": {"archivo": origen.name, "sha256": sha256,
                   "entradas": "Entradas!D7:E82", "esperados": "Esperados!D4:F23",
                   "regresiones": "Derivados!D12:E12 y D20:E20",
                   "ausencia": "Una celda vacía se omite de la entrada del motor; no se convierte en null ni en cero. Un valor explícito, incluido cero o null, conserva su identidad.",
                   "porcentajes": "Esperados expresa porcentajes en puntos porcentuales; el valor del motor se multiplica por 100 solo para comparar."},
        "periodos": ["2023", "2024"], "entradas": datos,
        "esperados": referencias, "regresiones": regresiones,
    }


if __name__ == "__main__":
    origen = Path(sys.argv[1])
    destino = Path(__file__).resolve().parents[1] / "tests/unit/fixtures/razones-ejemplo-v3.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(extraer(origen), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(destino)
