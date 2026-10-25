# 02 — Cuentas maestras (72)

Fuente única de verdad de los objetos `cuenta`. Cada cuenta se define aquí antes de copiarse
a los archivos (el generador escribe esta nota primero y luego los 20 JSON desde el mismo dato).
Formato compacto: `id — clasificación — rol — política de ausencia`.

**Alcance de D-055 (24 de octubre de 2026).** Las políticas de esta nota corresponden al motor de razones. El catálogo de Estados conserva sus políticas anteriores; su eventual sincronización requiere otra decisión.

## Tabla compacta

| id | clasificación | rol | política de ausencia | nota de la lista |
|---|---|---|---|---|
| `is.sales_total` | ingreso | reported_total | not_applicable | R5, interna |
| `is.product_sales` | ingreso | detail | requires_data |  |
| `is.service_revenue` | ingreso | detail | requires_data |  |
| `is.other_sales_revenue` | ingreso | detail | requires_data |  |
| `is.sales_returns` | deduccion_ingreso | detail | requires_data |  |
| `is.sales_discounts` | deduccion_ingreso | detail | requires_data |  |
| `is.sales_allowances` | deduccion_ingreso | detail | requires_data |  |
| `is.net_sales_reported` | ingreso | reported_total | not_applicable |  |
| `is.cost_of_sales_reported` | costo | reported_total | not_applicable |  |
| `is.merchandise_cost` | costo | detail | requires_data |  |
| `is.product_cost` | costo | detail | requires_data |  |
| `is.service_cost` | costo | detail | requires_data |  |
| `is.gross_profit_reported` | resultado | reported_total | not_applicable |  |
| `is.selling_expenses` | gasto_operativo | detail | requires_data |  |
| `is.administrative_expenses` | gasto_operativo | detail | requires_data |  |
| `is.operating_depreciation` | gasto_operativo | detail | requires_data |  |
| `is.operating_amortization` | gasto_operativo | detail | requires_data |  |
| `is.other_operating_expenses` | gasto_operativo | detail | requires_data |  |
| `is.other_operating_income` | ingreso | detail | requires_data |  |
| `is.operating_profit_reported` | resultado | reported_total | not_applicable |  |
| `is.nonoperating_income` | no_operativo | detail | requires_data |  |
| `is.interest_income` | ingreso_financiero | detail | zero_if_not_reported | excepción D-051 |
| `is.noninterest_nonoperating_expenses` | no_operativo | detail | requires_data |  |
| `is.interest_expense` | financiero | detail | requires_data |  |
| `is.income_tax_expense` | impuesto | detail | requires_data |  |
| `is.net_income_reported` | resultado | reported_total | not_applicable |  |
| `bs.current_assets_total` | total | reported_total | not_applicable |  |
| `bs.cash_and_equivalents` | activo_corriente | detail | requires_data |  |
| `bs.short_term_investments` | activo_corriente | detail | requires_data |  |
| `bs.trade_receivables` | activo_corriente | detail | requires_data |  |
| `bs.other_current_receivables` | activo_corriente | detail | requires_data |  |
| `bs.inventory_total` | activo_corriente | reported_total | not_applicable | R5, interna |
| `bs.inventory_merchandise` | activo_corriente | detail | requires_data |  |
| `bs.inventory_raw_materials` | activo_corriente | detail | requires_data |  |
| `bs.inventory_work_in_process` | activo_corriente | detail | requires_data |  |
| `bs.inventory_finished_goods` | activo_corriente | detail | requires_data |  |
| `bs.prepaid_expenses` | activo_corriente | detail | requires_data |  |
| `bs.other_current_assets` | activo_corriente | detail | requires_data |  |
| `bs.fixed_assets_net_total` | activo_fijo | reported_total | not_applicable |  |
| `bs.ppe_land` | activo_fijo | detail | requires_data |  |
| `bs.ppe_buildings` | activo_fijo | detail | requires_data |  |
| `bs.ppe_machinery` | activo_fijo | detail | requires_data | ambigua en el caso (Equipos) |
| `bs.ppe_vehicles` | activo_fijo | detail | requires_data |  |
| `bs.ppe_furniture` | activo_fijo | detail | requires_data |  |
| `bs.ppe_other` | activo_fijo | detail | requires_data |  |
| `bs.accumulated_depreciation` | correctora_activo | contra_account | requires_data |  |
| `bs.intangible_assets` | activo_no_corriente | detail | requires_data |  |
| `bs.long_term_investments` | activo_no_corriente | detail | requires_data |  |
| `bs.other_noncurrent_assets` | activo_no_corriente | detail | requires_data |  |
| `bs.total_assets` | total | reported_total | not_applicable |  |
| `bs.current_liabilities_total` | total | reported_total | not_applicable |  |
| `bs.trade_payables` | pasivo_corriente | detail | requires_data |  |
| `bs.short_term_borrowings` | pasivo_corriente | detail | requires_data |  |
| `bs.current_portion_long_term_debt` | pasivo_corriente | detail | requires_data |  |
| `bs.taxes_payable` | pasivo_corriente | detail | requires_data |  |
| `bs.accrued_expenses_payable` | pasivo_corriente | detail | requires_data |  |
| `bs.current_provisions` | pasivo_corriente | detail | requires_data |  |
| `bs.other_current_liabilities` | pasivo_corriente | detail | requires_data | ambigua en el caso (Pasivo Corto Plazo) |
| `bs.long_term_borrowings` | pasivo_no_corriente | detail | requires_data | ambigua en el caso (Pasivo Largo Plazo) |
| `bs.long_term_provisions` | pasivo_no_corriente | detail | requires_data |  |
| `bs.other_noncurrent_liabilities` | pasivo_no_corriente | detail | requires_data |  |
| `bs.total_liabilities` | total | reported_total | not_applicable |  |
| `bs.total_equity` | total | reported_total | not_applicable |  |
| `bs.share_capital` | patrimonio | detail | requires_data |  |
| `bs.additional_paid_in_capital` | patrimonio | detail | requires_data |  |
| `bs.legal_reserve` | patrimonio | detail | requires_data |  |
| `bs.other_reserves` | patrimonio | detail | requires_data | ambigua en el caso (Reservas) |
| `bs.retained_earnings` | patrimonio | detail | requires_data |  |
| `bs.current_year_result_equity` | patrimonio | detail | requires_data |  |
| `bs.other_equity_components` | patrimonio | detail | requires_data |  |
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
  "ambiguities": [
    "Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo."
  ],
  "research": {
    "status": "partially_verified",
    "sources": []
  }
}
```

### is.product_sales

`is.product_sales` — ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 exige reconocer ingresos de actividades ordinarias por contratos con clientes siguiendo cinco pasos, entre ellos fijar el precio de la transacción (la contraprestación que la entidad espera recibir). Confirma la definición de «Ventas de productos» (is.product_sales)."
      }
    ]
  }
}
```

### is.service_revenue

`is.service_revenue` — ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 exige reconocer ingresos de actividades ordinarias por contratos con clientes siguiendo cinco pasos, entre ellos fijar el precio de la transacción (la contraprestación que la entidad espera recibir). Confirma la definición de «Ingresos por servicios» (is.service_revenue)."
      }
    ]
  }
}
```

### is.other_sales_revenue

`is.other_sales_revenue` — ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 exige reconocer ingresos de actividades ordinarias por contratos con clientes siguiendo cinco pasos, entre ellos fijar el precio de la transacción (la contraprestación que la entidad espera recibir). Confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue)."
      }
    ]
  }
}
```

### is.sales_returns

`is.sales_returns` — deduccion_ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 trata la contraprestación del contrato con clientes; las devoluciones, descuentos y rebajas reducen ese ingreso. Confirma la definición de «Devoluciones sobre ventas» (is.sales_returns)."
      }
    ]
  }
}
```

### is.sales_discounts

`is.sales_discounts` — deduccion_ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Descuentos concedidos sobre ventas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 trata la contraprestación del contrato con clientes; las devoluciones, descuentos y rebajas reducen ese ingreso. Confirma la definición de «Descuentos sobre ventas» (is.sales_discounts)."
      }
    ]
  }
}
```

### is.sales_allowances

`is.sales_allowances` — deduccion_ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Rebajas y bonificaciones sobre ventas"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 trata la contraprestación del contrato con clientes; las devoluciones, descuentos y rebajas reducen ese ingreso. Confirma la definición de «Rebajas sobre ventas» (is.sales_allowances)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Ventas netas reportadas» (is.net_sales_reported)."
      },
      {
        "title": "IFRS 15 Revenue from Contracts with Customers",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
        "source_type": "accounting_standard",
        "supports": "NIIF 15 exige reconocer ingresos de actividades ordinarias por contratos con clientes siguiendo cinco pasos, entre ellos fijar el precio de la transacción (la contraprestación que la entidad espera recibir). Confirma la definición de «Ventas netas reportadas» (is.net_sales_reported)."
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported)."
      }
    ]
  }
}
```

### is.merchandise_cost

`is.merchandise_cost` — costo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost)."
      }
    ]
  }
}
```

### is.product_cost

`is.product_cost` — costo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Costo de productos vendidos» (is.product_cost)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Costo de productos vendidos» (is.product_cost)."
      }
    ]
  }
}
```

### is.service_cost

`is.service_cost` — costo — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Costos de servicios prestados"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Costo de servicios» (is.service_cost)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Costo de servicios» (is.service_cost)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Utilidad bruta reportada» (is.gross_profit_reported)."
      }
    ]
  }
}
```

### is.selling_expenses

`is.selling_expenses` — gasto_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Gastos de ventas» (is.selling_expenses)."
      }
    ]
  }
}
```

### is.administrative_expenses

`is.administrative_expenses` — gasto_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Gastos administrativos» (is.administrative_expenses)."
      }
    ]
  }
}
```

### is.operating_depreciation

`is.operating_depreciation` — gasto_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Depreciación operativa» (is.operating_depreciation)."
      },
      {
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata la depreciación: el importe depreciable se reconoce como gasto de forma sistemática durante la vida útil de los activos fijos. Confirma la definición de «Depreciación operativa» (is.operating_depreciation)."
      }
    ]
  }
}
```

### is.operating_amortization

`is.operating_amortization` — gasto_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Amortización de activos usados en operaciones, bajo la misma regla de no duplicación"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Amortización operativa» (is.operating_amortization)."
      },
      {
        "title": "IAS 38 Intangible Assets",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/",
        "source_type": "accounting_standard",
        "supports": "NIC 38 trata la amortización del costo de los activos intangibles de vida útil finita. Confirma la definición de «Amortización operativa» (is.operating_amortization)."
      }
    ]
  }
}
```

### is.other_operating_expenses

`is.other_operating_expenses` — gasto_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Otros gastos de operación"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Otros gastos operativos» (is.other_operating_expenses)."
      }
    ]
  }
}
```

### is.other_operating_income

`is.other_operating_income` — ingreso — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Otros ingresos de operación si pertenecen a la actividad operativa"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Otros ingresos operativos» (is.other_operating_income)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Utilidad operativa reportada» (is.operating_profit_reported)."
      }
    ]
  }
}
```

### is.nonoperating_income

`is.nonoperating_income` — no_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Ingresos no operativos» (is.nonoperating_income)."
      }
    ]
  }
}
```

### is.noninterest_nonoperating_expenses

`is.noninterest_nonoperating_expenses` — no_operativo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Gastos no operativos distintos de intereses» (is.noninterest_nonoperating_expenses)."
      }
    ]
  }
}
```

### is.interest_expense

`is.interest_expense` — financiero — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 23 Borrowing Costs",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/",
        "source_type": "accounting_standard",
        "supports": "NIC 23 define los costos por préstamos como los intereses y otros costos incurridos y exige reconocerlos como gasto del periodo. Confirma la definición de «Gastos por intereses» (is.interest_expense)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Gastos por intereses» (is.interest_expense)."
      }
    ]
  }
}
```

### is.income_tax_expense

`is.income_tax_expense` — impuesto — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 12 Income Taxes",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/",
        "source_type": "accounting_standard",
        "supports": "NIC 12 exige reconocer como pasivo el impuesto corriente no pagado del periodo y regula los impuestos corrientes y diferidos sobre la renta. Confirma la definición de «Gasto por impuesto sobre la renta» (is.income_tax_expense)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Utilidad neta reportada» (is.net_income_reported)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Total de activos corrientes» (bs.current_assets_total)."
      }
    ]
  }
}
```

### bs.cash_and_equivalents

`bs.cash_and_equivalents` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 7 Statement of Cash Flows",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/",
        "source_type": "accounting_standard",
        "supports": "NIC 7 define el efectivo (efectivo en mano y depósitos a la vista) y los equivalentes de efectivo como inversiones a corto plazo, altamente líquidas, de conversión casi inmediata y con riesgo menor de cambio de valor. Confirma la definición de «Efectivo y equivalentes» (bs.cash_and_equivalents)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Efectivo y equivalentes» (bs.cash_and_equivalents)."
      }
    ]
  }
}
```

### bs.short_term_investments

`bs.short_term_investments` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 7 Statement of Cash Flows",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/",
        "source_type": "accounting_standard",
        "supports": "NIC 7 define el efectivo (efectivo en mano y depósitos a la vista) y los equivalentes de efectivo como inversiones a corto plazo, altamente líquidas, de conversión casi inmediata y con riesgo menor de cambio de valor. Confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments)."
      }
    ]
  }
}
```

### bs.trade_receivables

`bs.trade_receivables` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Cuentas por cobrar comerciales» (bs.trade_receivables)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Cuentas por cobrar comerciales» (bs.trade_receivables)."
      }
    ]
  }
}
```

### bs.other_current_receivables

`bs.other_current_receivables` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Otras cuentas por cobrar corrientes» (bs.other_current_receivables)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otras cuentas por cobrar corrientes» (bs.other_current_receivables)."
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
  "ambiguities": [
    "Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta."
  ],
  "research": {
    "status": "partially_verified",
    "sources": []
  }
}
```

### bs.inventory_merchandise

`bs.inventory_merchandise` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise)."
      }
    ]
  }
}
```

### bs.inventory_raw_materials

`bs.inventory_raw_materials` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials)."
      }
    ]
  }
}
```

### bs.inventory_work_in_process

`bs.inventory_work_in_process` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process)."
      }
    ]
  }
}
```

### bs.inventory_finished_goods

`bs.inventory_finished_goods` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 2 Inventories",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
        "source_type": "accounting_standard",
        "supports": "NIC 2 exige medir los inventarios al menor entre costo y valor neto realizable, fija cómo se asigna el costo a los inventarios y cuándo ese costo se reconoce como gasto. Confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods)."
      }
    ]
  }
}
```

### bs.prepaid_expenses

`bs.prepaid_expenses` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Gastos pagados por anticipado» (bs.prepaid_expenses)."
      }
    ]
  }
}
```

### bs.other_current_assets

`bs.other_current_assets` — activo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Otros activos circulantes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros activos corrientes» (bs.other_current_assets)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Total de activos fijos netos» (bs.fixed_assets_net_total)."
      },
      {
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Total de activos fijos netos» (bs.fixed_assets_net_total)."
      }
    ]
  }
}
```

### bs.ppe_land

`bs.ppe_land` — activo_fijo — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Terrenos de uso operativo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Terrenos» (bs.ppe_land)."
      }
    ]
  }
}
```

### bs.ppe_buildings

`bs.ppe_buildings` — activo_fijo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Edificios e instalaciones» (bs.ppe_buildings)."
      }
    ]
  }
}
```

### bs.ppe_machinery

`bs.ppe_machinery` — activo_fijo — detail — requires_data — ambigua en el caso (Equipos)

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
  "absence_policy": "requires_data",
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
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Maquinaria y equipo» (bs.ppe_machinery)."
      }
    ]
  }
}
```

### bs.ppe_vehicles

`bs.ppe_vehicles` — activo_fijo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Vehículos» (bs.ppe_vehicles)."
      }
    ]
  }
}
```

### bs.ppe_furniture

`bs.ppe_furniture` — activo_fijo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Mobiliario y equipo de oficina» (bs.ppe_furniture)."
      }
    ]
  }
}
```

### bs.ppe_other

`bs.ppe_other` — activo_fijo — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Otros activos fijos tangibles» (bs.ppe_other)."
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
        "title": "IAS 16 Property, Plant and Equipment",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
        "source_type": "accounting_standard",
        "supports": "NIC 16 trata la depreciación: el importe depreciable se reconoce como gasto de forma sistemática durante la vida útil de los activos fijos. Confirma la definición de «Depreciación acumulada» (bs.accumulated_depreciation)."
      }
    ]
  }
}
```

### bs.intangible_assets

`bs.intangible_assets` — activo_no_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 38 Intangible Assets",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/",
        "source_type": "accounting_standard",
        "supports": "NIC 38 define un activo intangible como un activo identificable no monetario sin sustancia física. Confirma la definición de «Activos intangibles» (bs.intangible_assets)."
      }
    ]
  }
}
```

### bs.long_term_investments

`bs.long_term_investments` — activo_no_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Inversiones de largo plazo» (bs.long_term_investments)."
      },
      {
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Inversiones de largo plazo» (bs.long_term_investments)."
      }
    ]
  }
}
```

### bs.other_noncurrent_assets

`bs.other_noncurrent_assets` — activo_no_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Otros activos a largo plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros activos no corrientes» (bs.other_noncurrent_assets)."
      },
      {
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Otros activos no corrientes» (bs.other_noncurrent_assets)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Total de activos» (bs.total_assets)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Total de pasivos corrientes» (bs.current_liabilities_total)."
      }
    ]
  }
}
```

### bs.trade_payables

`bs.trade_payables` — pasivo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Cuentas por pagar comerciales» (bs.trade_payables)."
      },
      {
        "title": "IAS 32 Financial Instruments: Presentation",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/",
        "source_type": "accounting_standard",
        "supports": "NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Cuentas por pagar comerciales» (bs.trade_payables)."
      }
    ]
  }
}
```

### bs.short_term_borrowings

`bs.short_term_borrowings` — pasivo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Préstamos de corto plazo» (bs.short_term_borrowings)."
      },
      {
        "title": "IAS 32 Financial Instruments: Presentation",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/",
        "source_type": "accounting_standard",
        "supports": "NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Préstamos de corto plazo» (bs.short_term_borrowings)."
      }
    ]
  }
}
```

### bs.current_portion_long_term_debt

`bs.current_portion_long_term_debt` — pasivo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Vencimientos corrientes de deuda a largo plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Porción corriente de deuda de largo plazo» (bs.current_portion_long_term_debt)."
      },
      {
        "title": "IAS 32 Financial Instruments: Presentation",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/",
        "source_type": "accounting_standard",
        "supports": "NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Porción corriente de deuda de largo plazo» (bs.current_portion_long_term_debt)."
      }
    ]
  }
}
```

### bs.taxes_payable

`bs.taxes_payable` — pasivo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 12 Income Taxes",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/",
        "source_type": "accounting_standard",
        "supports": "NIC 12 exige reconocer como pasivo el impuesto corriente no pagado del periodo y regula los impuestos corrientes y diferidos sobre la renta. Confirma la definición de «Impuestos por pagar» (bs.taxes_payable)."
      }
    ]
  }
}
```

### bs.accrued_expenses_payable

`bs.accrued_expenses_payable` — pasivo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Gastos acumulados por pagar» (bs.accrued_expenses_payable)."
      },
      {
        "title": "IAS 37 Provisions, Contingent Liabilities and Contingent Assets",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
        "source_type": "accounting_standard",
        "supports": "NIC 37 trata la obligación presente y las obligaciones de fecha o importe incierto; respalda que un gasto ya incurrido que no se ha pagado genera una obligación presente. Confirma la definición de «Gastos acumulados por pagar» (bs.accrued_expenses_payable)."
      }
    ]
  }
}
```

### bs.current_provisions

`bs.current_provisions` — pasivo_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Provisiones de corto plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 37 Provisions, Contingent Liabilities and Contingent Assets",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
        "source_type": "accounting_standard",
        "supports": "NIC 37 define una provisión como una obligación presente de fecha o importe incierto y la distingue de las cuentas por pagar, que sí tienen fecha e importe ciertos. Confirma la definición de «Provisiones corrientes» (bs.current_provisions)."
      }
    ]
  }
}
```

### bs.other_current_liabilities

`bs.other_current_liabilities` — pasivo_corriente — detail — requires_data — ambigua en el caso (Pasivo Corto Plazo)

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos corrientes» (bs.other_current_liabilities)."
      }
    ]
  }
}
```

### bs.long_term_borrowings

`bs.long_term_borrowings` — pasivo_no_corriente — detail — requires_data — ambigua en el caso (Pasivo Largo Plazo)

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
  "absence_policy": "requires_data",
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
        "title": "IFRS 9 Financial Instruments",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
        "source_type": "accounting_standard",
        "supports": "NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Deudas de largo plazo» (bs.long_term_borrowings)."
      },
      {
        "title": "IAS 32 Financial Instruments: Presentation",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/",
        "source_type": "accounting_standard",
        "supports": "NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Deudas de largo plazo» (bs.long_term_borrowings)."
      }
    ]
  }
}
```

### bs.long_term_provisions

`bs.long_term_provisions` — pasivo_no_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Provisiones no corrientes"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 37 Provisions, Contingent Liabilities and Contingent Assets",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
        "source_type": "accounting_standard",
        "supports": "NIC 37 define una provisión como una obligación presente de fecha o importe incierto y la distingue de las cuentas por pagar, que sí tienen fecha e importe ciertos. Confirma la definición de «Provisiones de largo plazo» (bs.long_term_provisions)."
      }
    ]
  }
}
```

### bs.other_noncurrent_liabilities

`bs.other_noncurrent_liabilities` — pasivo_no_corriente — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Otros pasivos a largo plazo"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos no corrientes» (bs.other_noncurrent_liabilities)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Total de pasivos» (bs.total_liabilities)."
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Total patrimonio» (bs.total_equity)."
      }
    ]
  }
}
```

### bs.share_capital

`bs.share_capital` — patrimonio — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 32 Financial Instruments: Presentation",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/",
        "source_type": "accounting_standard",
        "supports": "NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Capital social» (bs.share_capital)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Capital social» (bs.share_capital)."
      }
    ]
  }
}
```

### bs.additional_paid_in_capital

`bs.additional_paid_in_capital` — patrimonio — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 32 Financial Instruments: Presentation",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/",
        "source_type": "accounting_standard",
        "supports": "NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Aportes adicionales de capital» (bs.additional_paid_in_capital)."
      },
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Aportes adicionales de capital» (bs.additional_paid_in_capital)."
      }
    ]
  }
}
```

### bs.legal_reserve

`bs.legal_reserve` — patrimonio — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Reserva legal acumulada"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [
    "Reserva legal: figura del marco legal local, fuera de NIIF; el nombre puede aludir a reservas legales de distintos regímenes. Se clasifica como patrimonio por el nombre y se marca ambiguous porque ninguna norma NIIF la define."
  ],
  "research": {
    "status": "ambiguous",
    "sources": []
  }
}
```

### bs.other_reserves

`bs.other_reserves` — patrimonio — detail — requires_data — ambigua en el caso (Reservas)

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Otras reservas patrimoniales» (bs.other_reserves)."
      }
    ]
  }
}
```

### bs.retained_earnings

`bs.retained_earnings` — patrimonio — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Utilidades retenidas» (bs.retained_earnings)."
      }
    ]
  }
}
```

### bs.current_year_result_equity

`bs.current_year_result_equity` — patrimonio — detail — requires_data

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
  "absence_policy": "requires_data",
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
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Resultado del período incluido en patrimonio» (bs.current_year_result_equity)."
      }
    ]
  }
}
```

### bs.other_equity_components

`bs.other_equity_components` — patrimonio — detail — requires_data

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
  "absence_policy": "requires_data",
  "synonyms": [
    "Otras cuentas patrimoniales que no tengan un identificador más específico"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [],
  "research": {
    "status": "verified",
    "sources": [
      {
        "title": "IAS 1 Presentation of Financial Statements",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
        "source_type": "accounting_standard",
        "supports": "NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Otros componentes del patrimonio» (bs.other_equity_components)."
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
  "ambiguities": [
    "Dato suplementario del caso (D8): ventas a crédito reportadas solo por el caso; sin fuente externa. Se usa con requires_data y nunca se iguala a ventas netas."
  ],
  "research": {
    "status": "partially_verified",
    "sources": []
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
  "ambiguities": [
    "Dato suplementario del caso (D10): pagos a proveedores reportados solo por el caso; sin fuente externa. Se usa con requires_data para derivar compras a crédito."
  ],
  "research": {
    "status": "partially_verified",
    "sources": []
  }
}
```

### is.interest_income

`is.interest_income` — ingreso_financiero — detail — zero_if_not_reported — excepción D-051

```json
{
  "id": "is.interest_income",
  "canonical_name": "Ingresos por intereses",
  "definition": "Ingreso financiero por intereses ganados; no es un gasto por financiación.",
  "statement": "estado_resultados",
  "classification": "ingreso_financiero",
  "account_role": "detail",
  "normal_balance": "acreedor",
  "value_semantics": "revenue",
  "absence_policy": "zero_if_not_reported",
  "synonyms": [
    "Intereses ganados",
    "Intereses devengados a favor"
  ],
  "doubtful_synonyms": [],
  "ambiguities": [
    "Se suma a is.nonoperating_income como componente de los ingresos no operativos al calcular la utilidad neta sin utilidad reportada, según D-051."
  ],
  "research": {
    "status": "partially_verified",
    "sources": [
      {
        "title": "IFRS: Presentation of interest revenue",
        "organization_or_author": "IFRS Foundation",
        "url": "https://www.ifrs.org/projects/completed-projects/2018/presentation-of-interest-revenue-for-particular-financial-instruments-ifrs-9-and-ias-1/",
        "source_type": "project_page",
        "supports": "Título de proyecto; no define la cuenta. No respalda por sí solo su verificación.",
        "consulted_on": "2026-10-17"
      }
    ]
  }
}
```
