"""Extrae fuentes de defensa, sin modificar ni recalcular los XLSX originales.

Uso: python scripts/generar-ejemplos-personales.py <directorio extraído>
Requiere openpyxl solo para esta extracción local; la app no depende de Python.
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as E

import openpyxl
from openpyxl.utils.datetime import to_excel

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
NAMES = {
    'GFO_Presupuesto_estudiantil_Cris_Angel (1).xlsx': ('presupuesto-cris', 'Cris Angel Lumbí Rodríguez'),
    'Presupuesto_estudiantil_Carlos_Castillo_Ago-Oct_2026.xlsx': ('presupuesto-carlos', 'Carlos Castillo'),
    'Presupuesto_personal_octubre_corregido.xlsx': ('presupuesto-juan', 'Juan Pablo Sirias Espinoza'),
    'Presupuesto_Trimestre_Gabi.xlsx': ('presupuesto-gabriel', 'Gabriel Eduardo Segovia Fonseca'),
    'Presupuesto-Estudiantil-Henry-Sanchez-Octubre-The-Last.xlsx': ('presupuesto-henry', 'Henry David Lopez Sanchez'),
    'Analisis_Activos_Hogar_Carlos_Castillo.xlsx': ('activos-carlos', 'Carlos Castillo López'),
    'Analisis_Activos_Hogar_Gestion_Financiera_JuanSirias (1).xlsx': ('activos-juan', 'Juan Pablo Sirias Espinoza'),
    'Guia Activos_Cris_Angel_Lumbi_Rodriguez_corregido.xlsx': ('activos-cris', 'Cris Angel Lumbí Rodríguez'),
    'Inventario_Activos_HenryDavidLopezSanchez.xlsx': ('activos-henry', 'Henry David Lopez Sanchez'),
    'Levantamiento_Inventario_Activos_Hogar.docx': ('activos-gabriel', 'Gabriel Eduardo Segovia Fonseca'),
}
WARNINGS = {
    'presupuesto-cris': ['La etiqueta del archivo dice lunes, pero el inicio 30/07/2026 es jueves. Se conservan la fecha y los cortes originales.', 'El archivo recibido muestra saldo de C$805, incluido un ajuste de +C$210 en Seguimiento!I10. Solo los movimientos dan C$595 (6965 − 3780 − 2310 − 280). El ajuste no está registrado como movimiento ni explica su origen. Se conservan ambos resultados por separado; no se inventa un ingreso.'],
    'presupuesto-gabriel': ['El archivo contiene gastos y ahorro previstos; no declara ingresos ni movimientos realizados. Se conservan los supuestos de 30 días y 4 semanas, incluso en agosto y octubre.'],
    'activos-gabriel': ['El documento utiliza $ sin identificar expresamente la moneda. No se convierte a córdobas.', 'La conclusión dice que 9 de 12 activos están dentro de su vida útil y que dos la superaron: los dos muebles de 15 años están exactamente en el límite. Se conserva el texto original.', 'Las multiplicaciones escritas con cuotas anuales redondeadas son aproximaciones: por ejemplo 71.67 × 2 no es 143.33. Se muestran las fórmulas de la app con precisión interna y redondeo al presentar.'],
}
def excel_value(v):
    return to_excel(v) if hasattr(v, 'isoformat') else v

def workbook(path):
    formulas = openpyxl.load_workbook(path, data_only=False)
    cache = openpyxl.load_workbook(path, data_only=True)
    sheets = []
    for sheet in formulas:
        rows = []
        for row in sheet:
            cells = []
            for cell in row:
                if cell.value is None:
                    continue
                cached = cache[sheet.title][cell.coordinate]
                cells.append({'ref': cell.coordinate, 'valor': excel_value(cell.value),
                              'resultado': excel_value(cached.value), 'formato': cell.number_format,
                              'fecha': bool(cell.is_date or cached.is_date), 'negrita': bool(cell.font.bold)})
            if cells:
                rows.append({'n': row[0].row, 'celdas': cells})
        sheets.append({'nombre': sheet.title, 'filas': rows, 'combinadas': [str(m) for m in sheet.merged_cells.ranges],
                       'columnas': sheet.max_column, 'oculta': sheet.sheet_state != 'visible'})
    # Notas y textos de formas son datos también; no se pierden por estar fuera de las celdas.
    extras = []
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if re.match(r'xl/drawings/[^/]+\.xml$', name):
                texts = [n.text for n in E.fromstring(archive.read(name)).iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if n.text]
                if texts:
                    extras.append({'origen': name, 'textos': texts})
    comments = [{'hoja': s.title, 'ref': c.coordinate, 'autor': c.comment.author, 'texto': c.comment.text}
                for s in formulas for row in s for c in row if c.comment]
    links = [{'hoja': s.title, 'ref': c.coordinate, 'destino': c.hyperlink.target or c.hyperlink.location}
             for s in formulas for row in s for c in row if c.hyperlink]
    models = {}
    for sheet in sheets:
        if sheet['nombre'] == 'Inventario' or sheet['nombre'].startswith('Registro'):
            first = next((row for row in sheet['filas'] if row['n'] >= (5 if sheet['nombre'] == 'Inventario' else 6)), None)
            if first:
                models[sheet['nombre']] = first
    return {'tipo': 'xlsx', 'hojas': sheets, 'modelosRegistro': models, 'textosAdicionales': extras, 'comentarios': comments, 'enlaces': links}

def document(path):
    ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    with zipfile.ZipFile(path) as archive:
        body = E.fromstring(archive.read('word/document.xml')).find(ns+'body')
    text = lambda node: ''.join(t.text or '' for t in node.iter(ns+'t'))
    blocks = []
    for node in body:
        if node.tag == ns+'p':
            blocks.append({'tipo': 'parrafo', 'texto': text(node)})
        elif node.tag == ns+'tbl':
            blocks.append({'tipo': 'tabla', 'filas': [[text(c) for c in r.findall(ns+'tc')] for r in node.findall(ns+'tr')]})
    return {'tipo': 'docx', 'hojas': [], 'bloques': blocks}

docs = []
for filename, (identifier, owner) in NAMES.items():
    matches = list(SOURCE.rglob(filename))
    if len(matches) != 1:
        raise ValueError('Debe existir exactamente un archivo: '+filename)
    path = matches[0]
    payload = workbook(path) if path.suffix == '.xlsx' else document(path)
    docs.append({'version': 1, 'id': identifier, 'nombre': owner, 'archivo': filename,
                 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'avisos': WARNINGS.get(identifier, []), **payload})
target = ROOT/'js/examples/datos-personales-defensa.js'
payload = json.dumps(docs, ensure_ascii=False, separators=(',', ':')).replace('\\', '\\\\').replace("'", "\\'").replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
target.write_text('// Datos extraídos de presupuestos_activos.zip; regenerar con scripts/generar-ejemplos-personales.py.\n'
                  '// Se conservan las expresiones y los resultados guardados; no ejecutar las expresiones como código.\n'
                  "export const DOCUMENTOS_DEFENSA = JSON.parse('"+payload+"');\n", encoding='utf-8')
print(f'{len(docs)} documentos; {target.stat().st_size} bytes; fuentes sin modificar.')
