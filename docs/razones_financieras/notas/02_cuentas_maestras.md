# 02 — Cuentas maestras (71)

Fuente única de verdad de los objetos `cuenta`. Cada cuenta se define aquí antes de copiarse
a los archivos (el generador escribe esta nota primero y luego los 20 JSON desde el mismo dato).
Formato compacto: `id — clasificación — rol — política de ausencia`.

## Tabla compacta

| id | clasificación | rol | política de ausencia | nota de la lista |
|---|---|---|---|---|
| `is.sales_total` | ingreso | reported_total | not_applicable | R5, interna |
| `is.product_sales` | ingreso | detail | zero_if_not_reported |  |
| `is.service_revenue` | ingreso | detail | zero_if_not_reported |  |
| `is.other_sales_revenue` | ingreso | detail | zero_if_not_reported |  |
| `is.sales_returns` | deduccion_ingreso | detail | zero_if_not_reported |  |
| `is.sales_discounts` | deduccion_ingreso | detail | zero_if_not_reported |  |
| `is.sales_allowances` | deduccion_ingreso | detail | zero_if_not_reported |  |
| `is.net_sales_reported` | ingreso | reported_total | not_applicable |  |
| `is.cost_of_sales_reported` | costo | reported_total | not_applicable |  |
| `is.merchandise_cost` | costo | detail | zero_if_not_reported |  |
| `is.product_cost` | costo | detail | zero_if_not_reported |  |
| `is.service_cost` | costo | detail | zero_if_not_reported |  |
| `is.gross_profit_reported` | resultado | reported_total | not_applicable |  |
| `is.selling_expenses` | gasto_operativo | detail | zero_if_not_reported |  |
| `is.administrative_expenses` | gasto_operativo | detail | zero_if_not_reported |  |
| `is.operating_depreciation` | gasto_operativo | detail | zero_if_not_reported |  |
| `is.operating_amortization` | gasto_operativo | detail | zero_if_not_reported |  |
| `is.other_operating_expenses` | gasto_operativo | detail | zero_if_not_reported |  |
| `is.other_operating_income` | ingreso | detail | zero_if_not_reported |  |
| `is.operating_profit_reported` | resultado | reported_total | not_applicable |  |
| `is.nonoperating_income` | no_operativo | detail | zero_if_not_reported |  |
| `is.noninterest_nonoperating_expenses` | no_operativo | detail | zero_if_not_reported |  |
| `is.interest_expense` | financiero | detail | zero_if_not_reported |  |
| `is.income_tax_expense` | impuesto | detail | zero_if_not_reported |  |
| `is.net_income_reported` | resultado | reported_total | not_applicable |  |
| `bs.current_assets_total` | total | reported_total | not_applicable |  |
| `bs.cash_and_equivalents` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.short_term_investments` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.trade_receivables` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.other_current_receivables` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.inventory_total` | activo_corriente | reported_total | not_applicable | R5, interna |
| `bs.inventory_merchandise` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.inventory_raw_materials` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.inventory_work_in_process` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.inventory_finished_goods` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.prepaid_expenses` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.other_current_assets` | activo_corriente | detail | zero_if_not_reported |  |
| `bs.fixed_assets_net_total` | activo_fijo | reported_total | not_applicable |  |
| `bs.ppe_land` | activo_fijo | detail | zero_if_not_reported |  |
| `bs.ppe_buildings` | activo_fijo | detail | zero_if_not_reported |  |
| `bs.ppe_machinery` | activo_fijo | detail | zero_if_not_reported | ambigua en el caso (Equipos) |
| `bs.ppe_vehicles` | activo_fijo | detail | zero_if_not_reported |  |
| `bs.ppe_furniture` | activo_fijo | detail | zero_if_not_reported |  |
| `bs.ppe_other` | activo_fijo | detail | zero_if_not_reported |  |
| `bs.accumulated_depreciation` | correctora_activo | contra_account | requires_data |  |
| `bs.intangible_assets` | activo_no_corriente | detail | zero_if_not_reported |  |
| `bs.long_term_investments` | activo_no_corriente | detail | zero_if_not_reported |  |
| `bs.other_noncurrent_assets` | activo_no_corriente | detail | zero_if_not_reported |  |
| `bs.total_assets` | total | reported_total | not_applicable |  |
| `bs.current_liabilities_total` | total | reported_total | not_applicable |  |
| `bs.trade_payables` | pasivo_corriente | detail | zero_if_not_reported |  |
| `bs.short_term_borrowings` | pasivo_corriente | detail | zero_if_not_reported |  |
| `bs.current_portion_long_term_debt` | pasivo_corriente | detail | zero_if_not_reported |  |
| `bs.taxes_payable` | pasivo_corriente | detail | zero_if_not_reported |  |
| `bs.accrued_expenses_payable` | pasivo_corriente | detail | zero_if_not_reported |  |
| `bs.current_provisions` | pasivo_corriente | detail | zero_if_not_reported |  |
| `bs.other_current_liabilities` | pasivo_corriente | detail | zero_if_not_reported | ambigua en el caso (Pasivo Corto Plazo) |
| `bs.long_term_borrowings` | pasivo_no_corriente | detail | zero_if_not_reported | ambigua en el caso (Pasivo Largo Plazo) |
| `bs.long_term_provisions` | pasivo_no_corriente | detail | zero_if_not_reported |  |
| `bs.other_noncurrent_liabilities` | pasivo_no_corriente | detail | zero_if_not_reported |  |
| `bs.total_liabilities` | total | reported_total | not_applicable |  |
| `bs.total_equity` | total | reported_total | not_applicable |  |
| `bs.share_capital` | patrimonio | detail | zero_if_not_reported |  |
| `bs.additional_paid_in_capital` | patrimonio | detail | zero_if_not_reported |  |
| `bs.legal_reserve` | patrimonio | detail | zero_if_not_reported |  |
| `bs.other_reserves` | patrimonio | detail | zero_if_not_reported | ambigua en el caso (Reservas) |
| `bs.retained_earnings` | patrimonio | detail | zero_if_not_reported |  |
| `bs.current_year_result_equity` | patrimonio | detail | zero_if_not_reported |  |
| `bs.other_equity_components` | patrimonio | detail | zero_if_not_reported |  |
| `supp.credit_sales` | suplementario | detail | requires_data | interna |
| `supp.supplier_payments` | suplementario | detail | requires_data | interna |

## Objetos completos

### is.sales_total

`is.sales_total` — ingreso — reported_total — not_applicable — R5, interna

```json
{
  "id": "is.sales_total",
  "canonical_name": "Ventas totales",
  "definition": "Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.",
  "statement": "estado_resultados",
  "classification": "ingreso",
  "account_role": "reported_total",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Ventas",
    "ventas ordinarias totales"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.sales_total"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.sales_total (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.sales_total."
      }
    ]
  }
}
```

### is.product_sales

`is.product_sales` — ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.product_sales",
  "canonical_name": "Ventas de productos",
  "definition": "Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.",
  "statement": "estado_resultados",
  "classification": "ingreso",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Ventas de mercaderías",
    "ventas de bienes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.product_sales (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.product_sales."
      }
    ]
  }
}
```

### is.service_revenue

`is.service_revenue` — ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.service_revenue",
  "canonical_name": "Ingresos por servicios",
  "definition": "Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.",
  "statement": "estado_resultados",
  "classification": "ingreso",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Ventas de servicios",
    "ingresos por servicios prestados"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.service_revenue (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.service_revenue."
      }
    ]
  }
}
```

### is.other_sales_revenue

`is.other_sales_revenue` — ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.other_sales_revenue",
  "canonical_name": "Otras ventas ordinarias",
  "definition": "Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.",
  "statement": "estado_resultados",
  "classification": "ingreso",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otras ventas",
    "otras ventas operativas si efectivamente son ventas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.other_sales_revenue (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.other_sales_revenue."
      }
    ]
  }
}
```

### is.sales_returns

`is.sales_returns` — deduccion_ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.sales_returns",
  "canonical_name": "Devoluciones sobre ventas",
  "definition": "Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).",
  "statement": "estado_resultados",
  "classification": "deduccion_ingreso",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "other",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Devoluciones de ventas",
    "ventas devueltas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.sales_returns (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.sales_returns."
      }
    ]
  }
}
```

### is.sales_discounts

`is.sales_discounts` — deduccion_ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.sales_discounts",
  "canonical_name": "Descuentos sobre ventas",
  "definition": "Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).",
  "statement": "estado_resultados",
  "classification": "deduccion_ingreso",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "other",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Descuentos concedidos sobre ventas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.sales_discounts (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.sales_discounts."
      }
    ]
  }
}
```

### is.sales_allowances

`is.sales_allowances` — deduccion_ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.sales_allowances",
  "canonical_name": "Rebajas sobre ventas",
  "definition": "Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).",
  "statement": "estado_resultados",
  "classification": "deduccion_ingreso",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "other",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Rebajas y bonificaciones sobre ventas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.sales_allowances (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.sales_allowances."
      }
    ]
  }
}
```

### is.net_sales_reported

`is.net_sales_reported` — ingreso — reported_total — not_applicable

```json
{
  "id": "is.net_sales_reported",
  "canonical_name": "Ventas netas reportadas",
  "definition": "Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.",
  "statement": "estado_resultados",
  "classification": "ingreso",
  "account_role": "reported_total",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Ventas netas",
    "ventas netas totales"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.net_sales_reported (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.net_sales_reported."
      }
    ]
  }
}
```

### is.cost_of_sales_reported

`is.cost_of_sales_reported` — costo — reported_total — not_applicable

```json
{
  "id": "is.cost_of_sales_reported",
  "canonical_name": "Costo de ventas reportado",
  "definition": "Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.",
  "statement": "estado_resultados",
  "classification": "costo",
  "account_role": "reported_total",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Costo de ventas",
    "costo de los bienes vendidos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.cost_of_sales_reported"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.cost_of_sales_reported (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a is.cost_of_sales_reported."
      }
    ]
  }
}
```

### is.merchandise_cost

`is.merchandise_cost` — costo — detail — zero_if_not_reported

```json
{
  "id": "is.merchandise_cost",
  "canonical_name": "Costo de mercadería vendida",
  "definition": "Coste de las mercaderías vendidas en el periodo.",
  "statement": "estado_resultados",
  "classification": "costo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Costo de ventas de mercaderías",
    "costo de bienes vendidos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.merchandise_cost (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a is.merchandise_cost."
      }
    ]
  }
}
```

### is.product_cost

`is.product_cost` — costo — detail — zero_if_not_reported

```json
{
  "id": "is.product_cost",
  "canonical_name": "Costo de productos vendidos",
  "definition": "Coste de producción de los productos vendidos en el periodo.",
  "statement": "estado_resultados",
  "classification": "costo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Costo de producción vendido",
    "costo de productos vendidos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.product_cost (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a is.product_cost."
      }
    ]
  }
}
```

### is.service_cost

`is.service_cost` — costo — detail — zero_if_not_reported

```json
{
  "id": "is.service_cost",
  "canonical_name": "Costo de servicios",
  "definition": "Coste directo de los servicios prestados en el periodo.",
  "statement": "estado_resultados",
  "classification": "costo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Costos de servicios prestados"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.service_cost (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.service_cost."
      }
    ]
  }
}
```

### is.gross_profit_reported

`is.gross_profit_reported` — resultado — reported_total — not_applicable

```json
{
  "id": "is.gross_profit_reported",
  "canonical_name": "Utilidad bruta reportada",
  "definition": "Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.",
  "statement": "estado_resultados",
  "classification": "resultado",
  "account_role": "reported_total",
  "normal_balance": "depends_on_context",
  "value_semantics": "signed_balance",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Ganancia bruta",
    "resultado bruto"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.gross_profit_reported (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.gross_profit_reported."
      }
    ]
  }
}
```

### is.selling_expenses

`is.selling_expenses` — gasto_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.selling_expenses",
  "canonical_name": "Gastos de ventas",
  "definition": "Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).",
  "statement": "estado_resultados",
  "classification": "gasto_operativo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Gastos comerciales",
    "gastos de distribución si el criterio de clase los clasifica como operativos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.selling_expenses"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.selling_expenses (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.selling_expenses."
      }
    ]
  }
}
```

### is.administrative_expenses

`is.administrative_expenses` — gasto_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.administrative_expenses",
  "canonical_name": "Gastos administrativos",
  "definition": "Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).",
  "statement": "estado_resultados",
  "classification": "gasto_operativo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Gastos de administración",
    "gastos generales y administrativos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.administrative_expenses"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.administrative_expenses (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.administrative_expenses."
      }
    ]
  }
}
```

### is.operating_depreciation

`is.operating_depreciation` — gasto_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.operating_depreciation",
  "canonical_name": "Depreciación operativa",
  "definition": "Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.",
  "statement": "estado_resultados",
  "classification": "gasto_operativo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.operating_depreciation (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a is.operating_depreciation."
      }
    ]
  }
}
```

### is.operating_amortization

`is.operating_amortization` — gasto_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.operating_amortization",
  "canonical_name": "Amortización operativa",
  "definition": "Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.",
  "statement": "estado_resultados",
  "classification": "gasto_operativo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Amortización de activos usados en operaciones, bajo la misma regla de no duplicación"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.operating_amortization (secciones 5 a 8)"
      },
      {
        "title": "NIC 38 — Activos intangibles",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/",
        "source_type": "norma_internacional",
        "supports": "NIC 38: un activo intangible es un activo no financiero identificable sin sustancia física y se amortiza. Aplica a is.operating_amortization."
      }
    ]
  }
}
```

### is.other_operating_expenses

`is.other_operating_expenses` — gasto_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.other_operating_expenses",
  "canonical_name": "Otros gastos operativos",
  "definition": "Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).",
  "statement": "estado_resultados",
  "classification": "gasto_operativo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros gastos de operación"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.other_operating_expenses (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.other_operating_expenses."
      }
    ]
  }
}
```

### is.other_operating_income

`is.other_operating_income` — ingreso — detail — zero_if_not_reported

```json
{
  "id": "is.other_operating_income",
  "canonical_name": "Otros ingresos operativos",
  "definition": "Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).",
  "statement": "estado_resultados",
  "classification": "ingreso",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros ingresos de operación si pertenecen a la actividad operativa"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.other_operating_income (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.other_operating_income."
      }
    ]
  }
}
```

### is.operating_profit_reported

`is.operating_profit_reported` — resultado — reported_total — not_applicable

```json
{
  "id": "is.operating_profit_reported",
  "canonical_name": "Utilidad operativa reportada",
  "definition": "Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.",
  "statement": "estado_resultados",
  "classification": "resultado",
  "account_role": "reported_total",
  "normal_balance": "depends_on_context",
  "value_semantics": "signed_balance",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Resultado operativo",
    "utilidad de operación"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.operating_profit_reported (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.operating_profit_reported."
      }
    ]
  }
}
```

### is.nonoperating_income

`is.nonoperating_income` — no_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.nonoperating_income",
  "canonical_name": "Ingresos no operativos",
  "definition": "Ingresos ajenos a la operación principal (arrendamientos, plusvalías, intereses ganados); entran en utilidad neta, no en la operativa (D5).",
  "statement": "estado_resultados",
  "classification": "no_operativo",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros ingresos no operativos",
    "ingresos financieros no clasificados en otra cuenta específica"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.nonoperating_income"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.nonoperating_income (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.nonoperating_income."
      }
    ]
  }
}
```

### is.noninterest_nonoperating_expenses

`is.noninterest_nonoperating_expenses` — no_operativo — detail — zero_if_not_reported

```json
{
  "id": "is.noninterest_nonoperating_expenses",
  "canonical_name": "Gastos no operativos distintos de intereses",
  "definition": "Gastos ajenos a la operación que no son intereses; entran en utilidad neta, no en la operativa (D5).",
  "statement": "estado_resultados",
  "classification": "no_operativo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros gastos no operativos",
    "gastos no operacionales excluyendo intereses identificados por separado"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.noninterest_nonoperating_expenses"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.noninterest_nonoperating_expenses (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.noninterest_nonoperating_expenses."
      }
    ]
  }
}
```

### is.interest_expense

`is.interest_expense` — financiero — detail — zero_if_not_reported

```json
{
  "id": "is.interest_expense",
  "canonical_name": "Gastos por intereses",
  "definition": "Costos de financiación de deudas; si es cero, la cobertura de intereses queda en `zero_denominator` (D, razón 11).",
  "statement": "estado_resultados",
  "classification": "financiero",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Intereses pagados o devengados",
    "gastos financieros por intereses"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.interest_expense"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.interest_expense (secciones 5 a 8)"
      },
      {
        "title": "NIC 23 — Costos de financiación",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/",
        "source_type": "norma_internacional",
        "supports": "NIC 23: los costos de financiación (intereses) se reconocen como gasto del periodo. Aplica a is.interest_expense."
      }
    ]
  }
}
```

### is.income_tax_expense

`is.income_tax_expense` — impuesto — detail — zero_if_not_reported

```json
{
  "id": "is.income_tax_expense",
  "canonical_name": "Gasto por impuesto sobre la renta",
  "definition": "Impuesto corriente sobre la utilidad del periodo; se resta después de la utilidad antes de impuestos (D6).",
  "statement": "estado_resultados",
  "classification": "impuesto",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "expense",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Impuesto sobre la renta",
    "impuesto a las ganancias del período"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a is.income_tax_expense"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.income_tax_expense (secciones 5 a 8)"
      },
      {
        "title": "NIC 12 — Impuesto sobre la renta",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/",
        "source_type": "norma_internacional",
        "supports": "NIC 12 obliga a reconocer el impuesto corriente como gasto del periodo en que se obtiene la utilidad. Aplica a is.income_tax_expense."
      }
    ]
  }
}
```

### is.net_income_reported

`is.net_income_reported` — resultado — reported_total — not_applicable

```json
{
  "id": "is.net_income_reported",
  "canonical_name": "Utilidad neta reportada",
  "definition": "Resultado final después de impuestos reportado por el ejercicio; una pérdida conserva signo negativo (D6).",
  "statement": "estado_resultados",
  "classification": "resultado",
  "account_role": "reported_total",
  "normal_balance": "depends_on_context",
  "value_semantics": "signed_balance",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Utilidad del ejercicio",
    "ganancia neta",
    "resultado neto"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de is.net_income_reported (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a is.net_income_reported."
      }
    ]
  }
}
```

### bs.current_assets_total

`bs.current_assets_total` — total — reported_total — not_applicable

```json
{
  "id": "bs.current_assets_total",
  "canonical_name": "Total de activos corrientes",
  "definition": "Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).",
  "statement": "balance_general",
  "classification": "total",
  "account_role": "reported_total",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Total activo corriente",
    "total activo circulante"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.current_assets_total (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.current_assets_total."
      }
    ]
  }
}
```

### bs.cash_and_equivalents

`bs.cash_and_equivalents` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.cash_and_equivalents",
  "canonical_name": "Efectivo y equivalentes",
  "definition": "Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Efectivo",
    "caja",
    "bancos",
    "caja y bancos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.cash_and_equivalents"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.cash_and_equivalents (secciones 5 a 8)"
      },
      {
        "title": "NIC 7 — Estados de flujos de efectivo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/",
        "source_type": "norma_internacional",
        "supports": "NIC 7 exige el estado de flujos de efectivo y define los equivalentes de efectivo como inversiones a corto plazo y altamente líquidas. Aplica a bs.cash_and_equivalents."
      }
    ]
  }
}
```

### bs.short_term_investments

`bs.short_term_investments` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.short_term_investments",
  "canonical_name": "Inversiones de corto plazo",
  "definition": "Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Inversiones temporales",
    "valores negociables de corto plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.short_term_investments (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.short_term_investments."
      }
    ]
  }
}
```

### bs.trade_receivables

`bs.trade_receivables` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.trade_receivables",
  "canonical_name": "Cuentas por cobrar comerciales",
  "definition": "Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "CxC",
    "clientes",
    "cuentas por cobrar a clientes",
    "deudores comerciales"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.trade_receivables"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.trade_receivables (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.trade_receivables."
      }
    ]
  }
}
```

### bs.other_current_receivables

`bs.other_current_receivables` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.other_current_receivables",
  "canonical_name": "Otras cuentas por cobrar corrientes",
  "definition": "Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Deudores varios corrientes",
    "otras cuentas por cobrar de corto plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_current_receivables (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_current_receivables."
      }
    ]
  }
}
```

### bs.inventory_total

`bs.inventory_total` — activo_corriente — reported_total — not_applicable — R5, interna

```json
{
  "id": "bs.inventory_total",
  "canonical_name": "Inventario total",
  "definition": "Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "reported_total",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Inventario",
    "existencias totales"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.inventory_total"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.inventory_total (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a bs.inventory_total."
      }
    ]
  }
}
```

### bs.inventory_merchandise

`bs.inventory_merchandise` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.inventory_merchandise",
  "canonical_name": "Inventario de mercaderías",
  "definition": "Bienes adquiridos para revender sin transformación; mide su coste de adquisición.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Mercaderías",
    "mercancías",
    "inventario para la venta"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.inventory_merchandise (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a bs.inventory_merchandise."
      }
    ]
  }
}
```

### bs.inventory_raw_materials

`bs.inventory_raw_materials` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.inventory_raw_materials",
  "canonical_name": "Inventario de materias primas",
  "definition": "Materiales adquiridos para la producción que aún no se han transformado.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Materias primas",
    "materiales en almacén para producción"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.inventory_raw_materials (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a bs.inventory_raw_materials."
      }
    ]
  }
}
```

### bs.inventory_work_in_process

`bs.inventory_work_in_process` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.inventory_work_in_process",
  "canonical_name": "Inventario de productos en proceso",
  "definition": "Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Producción en proceso",
    "productos en proceso"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.inventory_work_in_process (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a bs.inventory_work_in_process."
      }
    ]
  }
}
```

### bs.inventory_finished_goods

`bs.inventory_finished_goods` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.inventory_finished_goods",
  "canonical_name": "Inventario de productos terminados",
  "definition": "Producto terminado listo para la venta; se lleva a costo de ventas al venderse.",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Productos terminados",
    "bienes terminados"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.inventory_finished_goods (secciones 5 a 8)"
      },
      {
        "title": "NIC 2 — Inventarios",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "norma_internacional",
        "supports": "NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden. Aplica a bs.inventory_finished_goods."
      }
    ]
  }
}
```

### bs.prepaid_expenses

`bs.prepaid_expenses` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.prepaid_expenses",
  "canonical_name": "Gastos pagados por anticipado",
  "definition": "Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Pagos anticipados",
    "seguros pagados por anticipado"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.prepaid_expenses (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.prepaid_expenses."
      }
    ]
  }
}
```

### bs.other_current_assets

`bs.other_current_assets` — activo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.other_current_assets",
  "canonical_name": "Otros activos corrientes",
  "definition": "Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).",
  "statement": "balance_general",
  "classification": "activo_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros activos circulantes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.other_current_assets"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_current_assets (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_current_assets."
      }
    ]
  }
}
```

### bs.fixed_assets_net_total

`bs.fixed_assets_net_total` — activo_fijo — reported_total — not_applicable

```json
{
  "id": "bs.fixed_assets_net_total",
  "canonical_name": "Total de activos fijos netos",
  "definition": "Subtotal neto de activos fijos reportado por el ejercicio; si existe, sustituye a la suma de componentes con depreciación (D3).",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "reported_total",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Activo fijo neto",
    "propiedad planta y equipo neto"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.fixed_assets_net_total (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.fixed_assets_net_total."
      }
    ]
  }
}
```

### bs.ppe_land

`bs.ppe_land` — activo_fijo — detail — zero_if_not_reported

```json
{
  "id": "bs.ppe_land",
  "canonical_name": "Terrenos",
  "definition": "Terrenos ocupados o destinados a la operación; no se deprecian.",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Terrenos de uso operativo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.ppe_land"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.ppe_land (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.ppe_land."
      }
    ]
  }
}
```

### bs.ppe_buildings

`bs.ppe_buildings` — activo_fijo — detail — zero_if_not_reported

```json
{
  "id": "bs.ppe_buildings",
  "canonical_name": "Edificios e instalaciones",
  "definition": "Construcciones usadas en la operación; su coste se deprecia a lo largo de su vida útil.",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Edificios",
    "construcciones de uso operativo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.ppe_buildings"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.ppe_buildings (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.ppe_buildings."
      }
    ]
  }
}
```

### bs.ppe_machinery

`bs.ppe_machinery` — activo_fijo — detail — zero_if_not_reported — ambigua en el caso (Equipos)

```json
{
  "id": "bs.ppe_machinery",
  "canonical_name": "Maquinaria y equipo",
  "definition": "Maquinaria y equipo utilizados en la producción o la operación; se deprecian por uso o por tiempo.",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Maquinaria",
    "equipo productivo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [
    "Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1)."
  ],
  "research": {
    "status": "ambiguous",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.ppe_machinery"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.ppe_machinery (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.ppe_machinery."
      }
    ]
  }
}
```

### bs.ppe_vehicles

`bs.ppe_vehicles` — activo_fijo — detail — zero_if_not_reported

```json
{
  "id": "bs.ppe_vehicles",
  "canonical_name": "Vehículos",
  "definition": "Vehículos usados en la operación; se deprecian a lo largo de su vida útil.",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Equipo de transporte",
    "vehículos de uso operativo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.ppe_vehicles"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.ppe_vehicles (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.ppe_vehicles."
      }
    ]
  }
}
```

### bs.ppe_furniture

`bs.ppe_furniture` — activo_fijo — detail — zero_if_not_reported

```json
{
  "id": "bs.ppe_furniture",
  "canonical_name": "Mobiliario y equipo de oficina",
  "definition": "Mobiliario y equipo de oficina en servicio; se deprecian por su vida útil.",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Mobiliario",
    "muebles y enseres",
    "equipo de oficina"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.ppe_furniture (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.ppe_furniture."
      }
    ]
  }
}
```

### bs.ppe_other

`bs.ppe_other` — activo_fijo — detail — zero_if_not_reported

```json
{
  "id": "bs.ppe_other",
  "canonical_name": "Otros activos fijos tangibles",
  "definition": "Bienes tangibles de la operación sin una cuenta específica; se deprecian según su vida útil.",
  "statement": "balance_general",
  "classification": "activo_fijo",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Propiedad, planta y equipo",
    "otros activos fijos tangibles"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.ppe_other (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.ppe_other."
      }
    ]
  }
}
```

### bs.accumulated_depreciation

`bs.accumulated_depreciation` — correctora_activo — contra_account — requires_data

```json
{
  "id": "bs.accumulated_depreciation",
  "canonical_name": "Depreciación acumulada",
  "definition": "Cuenta correctora que acumula el desgaste reconocido de los activos fijos; llega negativa y se suma con su signo (D13).",
  "statement": "balance_general",
  "classification": "correctora_activo",
  "account_role": "contra_account",
  "normal_balance": "acreedor",
  "value_semantics": "contra_asset",
  "absence_policy": "requires_data",
  "synonyms": [
    "Depreciación acumulada de activos fijos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.accumulated_depreciation"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.accumulated_depreciation (secciones 5 a 8)"
      },
      {
        "title": "NIC 16 — Propiedades, planta y equipo",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "norma_internacional",
        "supports": "NIC 16: las propiedades, planta y equipo son partidas tangibles usadas más de un periodo y se deprecian a lo largo de su vida útil. Aplica a bs.accumulated_depreciation."
      }
    ]
  }
}
```

### bs.intangible_assets

`bs.intangible_assets` — activo_no_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.intangible_assets",
  "canonical_name": "Activos intangibles",
  "definition": "Activos monetarios no financieros identificables sin sustancia física (software, patentes); se amortizan. Si no se reportan, aportan cero a activos totales (D12).",
  "statement": "balance_general",
  "classification": "activo_no_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Intangibles",
    "software capitalizado",
    "patentes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.intangible_assets"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.intangible_assets (secciones 5 a 8)"
      },
      {
        "title": "NIC 38 — Activos intangibles",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/",
        "source_type": "norma_internacional",
        "supports": "NIC 38: un activo intangible es un activo no financiero identificable sin sustancia física y se amortiza. Aplica a bs.intangible_assets."
      }
    ]
  }
}
```

### bs.long_term_investments

`bs.long_term_investments` — activo_no_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.long_term_investments",
  "canonical_name": "Inversiones de largo plazo",
  "definition": "Inversiones con disponibilidad o recuperación más allá del corto plazo.",
  "statement": "balance_general",
  "classification": "activo_no_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Inversiones permanentes",
    "inversiones no corrientes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.long_term_investments (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.long_term_investments."
      }
    ]
  }
}
```

### bs.other_noncurrent_assets

`bs.other_noncurrent_assets` — activo_no_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.other_noncurrent_assets",
  "canonical_name": "Otros activos no corrientes",
  "definition": "Activos no corrientes sin cuenta específica (derechos a largo plazo, anticipos a largo plazo).",
  "statement": "balance_general",
  "classification": "activo_no_corriente",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros activos a largo plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_noncurrent_assets (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_noncurrent_assets."
      }
    ]
  }
}
```

### bs.total_assets

`bs.total_assets` — total — reported_total — not_applicable

```json
{
  "id": "bs.total_assets",
  "canonical_name": "Total de activos",
  "definition": "Total de activos reportado por el ejercicio; si existe, sustituye al cálculo activo corriente + activos fijos netos + intangibles (D4).",
  "statement": "balance_general",
  "classification": "total",
  "account_role": "reported_total",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Total activo",
    "activo total",
    "total de recursos"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.total_assets (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.total_assets."
      }
    ]
  }
}
```

### bs.current_liabilities_total

`bs.current_liabilities_total` — total — reported_total — not_applicable

```json
{
  "id": "bs.current_liabilities_total",
  "canonical_name": "Total de pasivos corrientes",
  "definition": "Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).",
  "statement": "balance_general",
  "classification": "total",
  "account_role": "reported_total",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Total pasivo corriente",
    "total pasivo circulante"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.current_liabilities_total (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.current_liabilities_total."
      }
    ]
  }
}
```

### bs.trade_payables

`bs.trade_payables` — pasivo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.trade_payables",
  "canonical_name": "Cuentas por pagar comerciales",
  "definition": "Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "CxP",
    "proveedores",
    "cuentas por pagar a proveedores"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.trade_payables"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.trade_payables (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.trade_payables."
      }
    ]
  }
}
```

### bs.short_term_borrowings

`bs.short_term_borrowings` — pasivo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.short_term_borrowings",
  "canonical_name": "Préstamos de corto plazo",
  "definition": "Deudas financieras con vencimiento dentro del corto plazo.",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Deudas bancarias de corto plazo",
    "obligaciones financieras corrientes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.short_term_borrowings (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.short_term_borrowings."
      }
    ]
  }
}
```

### bs.current_portion_long_term_debt

`bs.current_portion_long_term_debt` — pasivo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.current_portion_long_term_debt",
  "canonical_name": "Porción corriente de deuda de largo plazo",
  "definition": "Parte de una deuda a largo plazo que vence en los próximos doce meses.",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Vencimientos corrientes de deuda a largo plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.current_portion_long_term_debt (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.current_portion_long_term_debt."
      }
    ]
  }
}
```

### bs.taxes_payable

`bs.taxes_payable` — pasivo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.taxes_payable",
  "canonical_name": "Impuestos por pagar",
  "definition": "Obligaciones tributarias devengadas sin pagar dentro del corto plazo.",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Tributos por pagar",
    "impuestos corrientes por pagar"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.taxes_payable (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.taxes_payable."
      }
    ]
  }
}
```

### bs.accrued_expenses_payable

`bs.accrued_expenses_payable` — pasivo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.accrued_expenses_payable",
  "canonical_name": "Gastos acumulados por pagar",
  "definition": "Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Gastos devengados por pagar",
    "obligaciones acumuladas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.accrued_expenses_payable (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.accrued_expenses_payable."
      }
    ]
  }
}
```

### bs.current_provisions

`bs.current_provisions` — pasivo_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.current_provisions",
  "canonical_name": "Provisiones corrientes",
  "definition": "Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Provisiones de corto plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.current_provisions"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.current_provisions (secciones 5 a 8)"
      },
      {
        "title": "NIC 37 — Provisiones, pasivos y activos contingentes",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
        "source_type": "norma_internacional",
        "supports": "NIC 37: una provisión es un pasivo de tiempo o importe incierto reconocido cuando es probable la salida de recursos. Aplica a bs.current_provisions."
      }
    ]
  }
}
```

### bs.other_current_liabilities

`bs.other_current_liabilities` — pasivo_corriente — detail — zero_if_not_reported — ambigua en el caso (Pasivo Corto Plazo)

```json
{
  "id": "bs.other_current_liabilities",
  "canonical_name": "Otros pasivos corrientes",
  "definition": "Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).",
  "statement": "balance_general",
  "classification": "pasivo_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros pasivos circulantes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [
    "Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1)."
  ],
  "research": {
    "status": "ambiguous",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.other_current_liabilities"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_current_liabilities (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_current_liabilities."
      }
    ]
  }
}
```

### bs.long_term_borrowings

`bs.long_term_borrowings` — pasivo_no_corriente — detail — zero_if_not_reported — ambigua en el caso (Pasivo Largo Plazo)

```json
{
  "id": "bs.long_term_borrowings",
  "canonical_name": "Deudas de largo plazo",
  "definition": "Deudas financieras con vencimiento más allá del corto plazo.",
  "statement": "balance_general",
  "classification": "pasivo_no_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Préstamos a largo plazo",
    "obligaciones financieras no corrientes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [
    "Nombre genérico del caso «Pasivo Largo Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo no corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1)."
  ],
  "research": {
    "status": "ambiguous",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.long_term_borrowings"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.long_term_borrowings (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.long_term_borrowings."
      }
    ]
  }
}
```

### bs.long_term_provisions

`bs.long_term_provisions` — pasivo_no_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.long_term_provisions",
  "canonical_name": "Provisiones de largo plazo",
  "definition": "Pasivos de tiempo o importe incierto cuya salida de recursos se prevé más allá del corto plazo.",
  "statement": "balance_general",
  "classification": "pasivo_no_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Provisiones no corrientes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.long_term_provisions (secciones 5 a 8)"
      },
      {
        "title": "NIC 37 — Provisiones, pasivos y activos contingentes",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
        "source_type": "norma_internacional",
        "supports": "NIC 37: una provisión es un pasivo de tiempo o importe incierto reconocido cuando es probable la salida de recursos. Aplica a bs.long_term_provisions."
      }
    ]
  }
}
```

### bs.other_noncurrent_liabilities

`bs.other_noncurrent_liabilities` — pasivo_no_corriente — detail — zero_if_not_reported

```json
{
  "id": "bs.other_noncurrent_liabilities",
  "canonical_name": "Otros pasivos no corrientes",
  "definition": "Pasivos no corrientes sin cuenta específica (obligaciones a largo plazo diversas).",
  "statement": "balance_general",
  "classification": "pasivo_no_corriente",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otros pasivos a largo plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.other_noncurrent_liabilities"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_noncurrent_liabilities (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_noncurrent_liabilities."
      }
    ]
  }
}
```

### bs.total_liabilities

`bs.total_liabilities` — total — reported_total — not_applicable

```json
{
  "id": "bs.total_liabilities",
  "canonical_name": "Total de pasivos",
  "definition": "Total de pasivos reportado por el ejercicio; si existe, sustituye a pasivo corriente + pasivo no corriente (D14).",
  "statement": "balance_general",
  "classification": "total",
  "account_role": "reported_total",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Pasivo total",
    "total pasivo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.total_liabilities (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.total_liabilities."
      }
    ]
  }
}
```

### bs.total_equity

`bs.total_equity` — total — reported_total — not_applicable

```json
{
  "id": "bs.total_equity",
  "canonical_name": "Total patrimonio",
  "definition": "Total del patrimonio reportado por el ejercicio; si existe, sustituye a la suma de `bs.patrimony_components`.",
  "statement": "balance_general",
  "classification": "total",
  "account_role": "reported_total",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "not_applicable",
  "synonyms": [
    "Patrimonio total",
    "capital contable total",
    "patrimonio neto"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.total_equity (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.total_equity."
      }
    ]
  }
}
```

### bs.share_capital

`bs.share_capital` — patrimonio — detail — zero_if_not_reported

```json
{
  "id": "bs.share_capital",
  "canonical_name": "Capital social",
  "definition": "Aportes de los propietores representados en títulos; su saldo cambia con aportes y retiros, no con utilidades.",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Capital emitido",
    "capital aportado",
    "capital social pagado"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.share_capital"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.share_capital (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.share_capital."
      }
    ]
  }
}
```

### bs.additional_paid_in_capital

`bs.additional_paid_in_capital` — patrimonio — detail — zero_if_not_reported

```json
{
  "id": "bs.additional_paid_in_capital",
  "canonical_name": "Aportes adicionales de capital",
  "definition": "Excedente aportado por encima del valor nominal de las acciones.",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Prima en emisión",
    "aportes adicionales"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.additional_paid_in_capital (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.additional_paid_in_capital."
      }
    ]
  }
}
```

### bs.legal_reserve

`bs.legal_reserve` — patrimonio — detail — zero_if_not_reported

```json
{
  "id": "bs.legal_reserve",
  "canonical_name": "Reserva legal",
  "definition": "Porción de utilidades retenidas legalmente reservada; no está disponible para distribución.",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Reserva legal acumulada"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.legal_reserve (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.legal_reserve."
      }
    ]
  }
}
```

### bs.other_reserves

`bs.other_reserves` — patrimonio — detail — zero_if_not_reported — ambigua en el caso (Reservas)

```json
{
  "id": "bs.other_reserves",
  "canonical_name": "Otras reservas patrimoniales",
  "definition": "Reservas patrimoniales distintas de la reserva legal (revaluación, estatutarias).",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Reservas",
    "otras reservas de capital o patrimonio"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [
    "Nombre genérico del caso «Reservas»: el detalle de la reserva es incierto, pero su clasificación en el patrimonio es segura y el detalle no altera ningún resultado (tabla de mapeo, F1)."
  ],
  "research": {
    "status": "ambiguous",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.other_reserves"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_reserves (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_reserves."
      }
    ]
  }
}
```

### bs.retained_earnings

`bs.retained_earnings` — patrimonio — detail — zero_if_not_reported

```json
{
  "id": "bs.retained_earnings",
  "canonical_name": "Utilidades retenidas",
  "definition": "Utilidades acumuladas no distribuidas; su saldo se actualiza con la utilidad del periodo menos dividendos.",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Resultados acumulados",
    "utilidades acumuladas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a bs.retained_earnings"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.retained_earnings (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.retained_earnings."
      }
    ]
  }
}
```

### bs.current_year_result_equity

`bs.current_year_result_equity` — patrimonio — detail — zero_if_not_reported

```json
{
  "id": "bs.current_year_result_equity",
  "canonical_name": "Resultado del período incluido en patrimonio",
  "definition": "Resultado del periodo presentado como línea separada del patrimonio; puede residir en otro archivo o estar ya incluido en utilidades retenidas.",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Utilidad del ejercicio",
    "pérdida del ejercicio",
    "resultado del período dentro del patrimonio"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.current_year_result_equity (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.current_year_result_equity."
      }
    ]
  }
}
```

### bs.other_equity_components

`bs.other_equity_components` — patrimonio — detail — zero_if_not_reported

```json
{
  "id": "bs.other_equity_components",
  "canonical_name": "Otros componentes del patrimonio",
  "definition": "Partidas patrimoniales diversas sin identificador más específico (ajustes de conversión, acciones propias).",
  "statement": "balance_general",
  "classification": "patrimonio",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Otras cuentas patrimoniales que no tengan un identificador más específico"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de bs.other_equity_components (secciones 5 a 8)"
      },
      {
        "title": "NIC 1 — Presentación de estados financieros",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "norma_internacional",
        "supports": "NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas y la presentación de partidas. Aplica a bs.other_equity_components."
      }
    ]
  }
}
```

### supp.credit_sales

`supp.credit_sales` — suplementario — detail — requires_data — interna

```json
{
  "id": "supp.credit_sales",
  "canonical_name": "Ventas a crédito",
  "definition": "Ventas cobrables a crédito del periodo actual; es el numerador de la rotación de CxC. Nunca se aproxima con ventas netas ni totales (D8): si falta, la razón es N/D.",
  "statement": "supplemental_data",
  "classification": "suplementario",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "requires_data",
  "synonyms": [
    "Ventas a crédito del periodo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a supp.credit_sales"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de supp.credit_sales (secciones 5 a 8)"
      }
    ]
  }
}
```

### supp.supplier_payments

`supp.supplier_payments` — suplementario — detail — requires_data — interna

```json
{
  "id": "supp.supplier_payments",
  "canonical_name": "Pagos a proveedores",
  "definition": "Pagos efectuados a proveedores en el periodo actual; forma con la CxP el numerador de compras a crédito (D10). Si falta, la razón es N/D con `missing_required_account_data`.",
  "statement": "supplemental_data",
  "classification": "suplementario",
  "account_role": "detail",
  "normal_balance": "deudor",
  "value_semantics": "positive_magnitude",
  "absence_policy": "requires_data",
  "synonyms": [
    "Pagos a proveedores del periodo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor)",
        "organization_or_author": "Material del profesor (curso GFO)",
        "url": "J_formulas/instrucciones_agente_json_razones_financieras_v3.md",
        "source_type": "documento_local",
        "supports": "Fórmulas, decisiones D1-D14, R1-R5 y tabla de mapeo del caso que definen a supp.supplier_payments"
      },
      {
        "title": "Especificación del JSON para cuentas, fórmulas y razones financieras",
        "organization_or_author": "Equipo GFO",
        "url": "C:/Users/aleja/Downloads/especificacion_json_razones_financieras.md",
        "source_type": "documento_local",
        "supports": "Nombre canónico, sinónimos, categoría y reglas de agregación de supp.supplier_payments (secciones 5 a 8)"
      }
    ]
  }
}
```

