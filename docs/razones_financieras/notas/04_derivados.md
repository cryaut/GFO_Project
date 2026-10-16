# 04 — Conjuntos y derivados (versión v6)

Este archivo **reemplaza** al de la ronda v3 (cuyos ids (`activo_corriente`, `cxp_saldo`, …) no
son los de la orden v6; su contenido está en el historial de git). Todo lo de abajo es copia
literal de la orden v6, parseada del propio documento y volcada sin cambios a los JSON:
los 11 conjuntos y los 17 derivados se cargaron en B1 junto con las fórmulas y B3 los
verifica con V6 (conjuntos sin totales reportados), V7 (mismo id = misma definición en todos
los archivos) y V16 (cada cuenta en un árbol).

## Conjuntos (11)

Reglas: solo cuentas de `cuentas` del archivo, ningún miembro `reported_total` (V6).

### `gross_sales_components` — 3 cuentas

- `is.product_sales`
- `is.service_revenue`
- `is.other_sales_revenue`

### `sales_deduction_components` — 3 cuentas

- `is.sales_returns`
- `is.sales_discounts`
- `is.sales_allowances`

### `cost_of_sales_components` — 3 cuentas

- `is.merchandise_cost`
- `is.product_cost`
- `is.service_cost`

### `operating_expense_components` — 5 cuentas

- `is.selling_expenses`
- `is.administrative_expenses`
- `is.operating_depreciation`
- `is.operating_amortization`
- `is.other_operating_expenses`

### `current_assets_excluding_inventory` — 6 cuentas

- `bs.cash_and_equivalents`
- `bs.short_term_investments`
- `bs.trade_receivables`
- `bs.other_current_receivables`
- `bs.prepaid_expenses`
- `bs.other_current_assets`

### `inventory_components` — 4 cuentas

- `bs.inventory_merchandise`
- `bs.inventory_raw_materials`
- `bs.inventory_work_in_process`
- `bs.inventory_finished_goods`

### `current_liabilities_components` — 7 cuentas

- `bs.trade_payables`
- `bs.short_term_borrowings`
- `bs.current_portion_long_term_debt`
- `bs.taxes_payable`
- `bs.accrued_expenses_payable`
- `bs.current_provisions`
- `bs.other_current_liabilities`

### `ppe_components` — 6 cuentas

- `bs.ppe_land`
- `bs.ppe_buildings`
- `bs.ppe_machinery`
- `bs.ppe_vehicles`
- `bs.ppe_furniture`
- `bs.ppe_other`

### `other_noncurrent_assets_components` — 2 cuentas

- `bs.long_term_investments`
- `bs.other_noncurrent_assets`

### `noncurrent_liabilities_components` — 3 cuentas

- `bs.long_term_borrowings`
- `bs.long_term_provisions`
- `bs.other_noncurrent_liabilities`

### `patrimony_components` — 7 cuentas

- `bs.share_capital`
- `bs.additional_paid_in_capital`
- `bs.legal_reserve`
- `bs.other_reserves`
- `bs.retained_earnings`
- `bs.current_year_result_equity`
- `bs.other_equity_components`

## Derivados (17)

Cada derivado declara `id`, `kind` y `formula`; la fórmula usa las operaciones de nodos de la
orden (incluye `reported_or_calculate` para el patrón D11 y `period: "previous"` en
`derived.credit_purchases`, D10).

### `derived.gross_sales` (flow)

```json
{
  "id": "derived.gross_sales",
  "kind": "flow",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "is.sales_total",
    "calculation": {
      "op": "sum_accounts",
      "account_set": "gross_sales_components"
    }
  }
}
```

### `derived.sales_deductions` (flow)

```json
{
  "id": "derived.sales_deductions",
  "kind": "flow",
  "formula": {
    "op": "sum_accounts",
    "account_set": "sales_deduction_components"
  }
}
```

### `derived.net_sales` (flow)

```json
{
  "id": "derived.net_sales",
  "kind": "flow",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "is.net_sales_reported",
    "calculation": {
      "op": "subtract",
      "left": {
        "op": "derived",
        "id": "derived.gross_sales"
      },
      "right": {
        "op": "derived",
        "id": "derived.sales_deductions"
      }
    }
  }
}
```

### `derived.cost_of_sales` (flow)

```json
{
  "id": "derived.cost_of_sales",
  "kind": "flow",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "is.cost_of_sales_reported",
    "calculation": {
      "op": "sum_accounts",
      "account_set": "cost_of_sales_components"
    }
  }
}
```

### `derived.gross_profit` (flow)

```json
{
  "id": "derived.gross_profit",
  "kind": "flow",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "is.gross_profit_reported",
    "calculation": {
      "op": "subtract",
      "left": {
        "op": "derived",
        "id": "derived.net_sales"
      },
      "right": {
        "op": "derived",
        "id": "derived.cost_of_sales"
      }
    }
  }
}
```

### `derived.operating_expenses` (flow)

```json
{
  "id": "derived.operating_expenses",
  "kind": "flow",
  "formula": {
    "op": "sum_accounts",
    "account_set": "operating_expense_components"
  }
}
```

### `derived.operating_profit` (flow)

```json
{
  "id": "derived.operating_profit",
  "kind": "flow",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "is.operating_profit_reported",
    "calculation": {
      "op": "subtract",
      "left": {
        "op": "add",
        "operands": [
          {
            "op": "derived",
            "id": "derived.gross_profit"
          },
          {
            "op": "account",
            "id": "is.other_operating_income"
          }
        ]
      },
      "right": {
        "op": "derived",
        "id": "derived.operating_expenses"
      }
    }
  }
}
```

### `derived.net_income` (flow)

```json
{
  "id": "derived.net_income",
  "kind": "flow",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "is.net_income_reported",
    "calculation": {
      "op": "subtract",
      "left": {
        "op": "add",
        "operands": [
          {
            "op": "derived",
            "id": "derived.operating_profit"
          },
          {
            "op": "account",
            "id": "is.nonoperating_income"
          }
        ]
      },
      "right": {
        "op": "add",
        "operands": [
          {
            "op": "account",
            "id": "is.noninterest_nonoperating_expenses"
          },
          {
            "op": "account",
            "id": "is.interest_expense"
          },
          {
            "op": "account",
            "id": "is.income_tax_expense"
          }
        ]
      }
    }
  }
}
```

### `derived.inventory_total` (balance)

```json
{
  "id": "derived.inventory_total",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.inventory_total",
    "calculation": {
      "op": "sum_accounts",
      "account_set": "inventory_components"
    }
  }
}
```

### `derived.current_assets` (balance)

```json
{
  "id": "derived.current_assets",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.current_assets_total",
    "calculation": {
      "op": "add",
      "operands": [
        {
          "op": "sum_accounts",
          "account_set": "current_assets_excluding_inventory"
        },
        {
          "op": "derived",
          "id": "derived.inventory_total"
        }
      ]
    }
  }
}
```

### `derived.current_liabilities` (balance)

```json
{
  "id": "derived.current_liabilities",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.current_liabilities_total",
    "calculation": {
      "op": "sum_accounts",
      "account_set": "current_liabilities_components"
    }
  }
}
```

### `derived.fixed_assets_net` (balance)

```json
{
  "id": "derived.fixed_assets_net",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.fixed_assets_net_total",
    "calculation": {
      "op": "add",
      "operands": [
        {
          "op": "sum_accounts",
          "account_set": "ppe_components"
        },
        {
          "op": "account",
          "id": "bs.accumulated_depreciation"
        }
      ]
    }
  }
}
```

### `derived.noncurrent_liabilities` (balance)

```json
{
  "id": "derived.noncurrent_liabilities",
  "kind": "balance",
  "formula": {
    "op": "sum_accounts",
    "account_set": "noncurrent_liabilities_components"
  }
}
```

### `derived.total_liabilities` (balance)

```json
{
  "id": "derived.total_liabilities",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.total_liabilities",
    "calculation": {
      "op": "add",
      "operands": [
        {
          "op": "derived",
          "id": "derived.current_liabilities"
        },
        {
          "op": "derived",
          "id": "derived.noncurrent_liabilities"
        }
      ]
    }
  }
}
```

### `derived.total_assets` (balance)

```json
{
  "id": "derived.total_assets",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.total_assets",
    "calculation": {
      "op": "add",
      "operands": [
        {
          "op": "derived",
          "id": "derived.current_assets"
        },
        {
          "op": "derived",
          "id": "derived.fixed_assets_net"
        },
        {
          "op": "account",
          "id": "bs.intangible_assets"
        },
        {
          "op": "sum_accounts",
          "account_set": "other_noncurrent_assets_components"
        }
      ]
    }
  }
}
```

### `derived.total_equity` (balance)

```json
{
  "id": "derived.total_equity",
  "kind": "balance",
  "formula": {
    "op": "reported_or_calculate",
    "reported": "bs.total_equity",
    "calculation": {
      "op": "sum_accounts",
      "account_set": "patrimony_components"
    }
  }
}
```

### `derived.credit_purchases` (flow)

```json
{
  "id": "derived.credit_purchases",
  "kind": "flow",
  "formula": {
    "op": "subtract",
    "left": {
      "op": "add",
      "operands": [
        {
          "op": "account",
          "id": "supp.supplier_payments"
        },
        {
          "op": "account",
          "id": "bs.trade_payables",
          "period": "current"
        }
      ]
    },
    "right": {
      "op": "account",
      "id": "bs.trade_payables",
      "period": "previous"
    }
  }
}
```

## Qué archivo usa qué

Cada JSON solo declara los derivados/conjuntos que su árbol alcanza (regla 1, sin sobrantes);
la lista maestra de arriba es el universo completo. El detalle por razón está en
`notas/ratios/NN_*.md`.

