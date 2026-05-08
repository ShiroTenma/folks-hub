| table_name             | column_name           | data_type                |
| ---------------------- | --------------------- | ------------------------ |
| split_bill_items       | amount                | numeric                  |
| tasks                  | pic_id                | uuid                     |
| tasks                  | updated_at            | timestamp with time zone |
| split_bill_items       | paid_at               | timestamp with time zone |
| split_bill_items       | created_at            | timestamp with time zone |
| agendas                | created_at            | timestamp with time zone |
| v_monthly_cashflow     | total_income          | numeric                  |
| v_monthly_cashflow     | total_expense         | numeric                  |
| v_monthly_cashflow     | net_balance           | numeric                  |
| monthly_cash           | id                    | uuid                     |
| monthly_cash           | profile_id            | uuid                     |
| profiles               | created_at            | timestamp with time zone |
| monthly_cash           | amount                | numeric                  |
| profiles               | updated_at            | timestamp with time zone |
| notifications          | id                    | uuid                     |
| profiles               | id                    | uuid                     |
| monthly_cash           | created_at            | timestamp with time zone |
| agendas                | id                    | uuid                     |
| event_budgets          | id                    | uuid                     |
| tasks                  | deadline              | timestamp with time zone |
| event_budgets          | budget_amount         | numeric                  |
| event_budgets          | created_at            | timestamp with time zone |
| transactions           | id                    | uuid                     |
| notifications          | read                  | boolean                  |
| transactions           | amount                | numeric                  |
| notifications          | user_id               | uuid                     |
| notifications          | created_at            | timestamp with time zone |
| transactions           | date                  | date                     |
| transactions           | approved_by           | uuid                     |
| tasks                  | progress_percent      | integer                  |
| transactions           | created_at            | timestamp with time zone |
| v_division_performance | total_tasks           | bigint                   |
| v_division_performance | completed_tasks       | bigint                   |
| transactions           | debt_amount           | numeric                  |
| transactions           | credit_amount         | numeric                  |
| tasks                  | id                    | uuid                     |
| v_division_performance | success_rate          | numeric                  |
| split_bills            | id                    | uuid                     |
| agendas                | date                  | timestamp with time zone |
| tasks                  | created_at            | timestamp with time zone |
| split_bills            | total_amount          | numeric                  |
| split_bills            | created_by            | uuid                     |
| transactions           | updated_at            | timestamp with time zone |
| split_bills            | created_at            | timestamp with time zone |
| split_bill_items       | id                    | uuid                     |
| settings               | value                 | jsonb                    |
| settings               | updated_at            | timestamp with time zone |
| settings               | updated_by            | uuid                     |
| split_bill_items       | bill_id               | uuid                     |
| split_bill_items       | profile_id            | uuid                     |
| transactions           | division_target       | text                     |
| tasks                  | title                 | text                     |
| tasks                  | description           | text                     |
| tasks                  | status                | text                     |
| tasks                  | division              | text                     |
| tasks                  | tags                  | ARRAY                    |
| agendas                | title                 | text                     |
| agendas                | description           | text                     |
| agendas                | location              | text                     |
| agendas                | type                  | text                     |
| agendas                | division              | text                     |
| profiles               | full_name             | text                     |
| profiles               | student_id            | text                     |
| profiles               | division              | text                     |
| profiles               | batch                 | text                     |
| profiles               | role                  | text                     |
| profiles               | status                | text                     |
| profiles               | contact               | text                     |
| profiles               | avatar_url            | text                     |
| notifications          | title                 | text                     |
| notifications          | message               | text                     |
| notifications          | type                  | text                     |
| v_division_performance | division              | text                     |
| split_bills            | title                 | text                     |
| split_bills            | description           | text                     |
| split_bill_items       | status                | text                     |
| split_bill_items       | proof_url             | text                     |
| v_monthly_cashflow     | month_period          | text                     |
| monthly_cash           | month                 | text                     |
| monthly_cash           | status                | text                     |
| monthly_cash           | proof_url             | text                     |
| monthly_cash           | notes                 | text                     |
| monthly_cash           | payment_type          | text                     |
| event_budgets          | event_name            | text                     |
| transactions           | type                  | text                     |
| transactions           | description           | text                     |
| transactions           | category              | text                     |
| transactions           | status                | text                     |
| transactions           | event_type            | text                     |
| transactions           | item_name             | text                     |
| transactions           | from_entity           | text                     |
| transactions           | to_entity             | text                     |
| transactions           | location              | text                     |
| transactions           | payment_type          | text                     |
| transactions           | receipt_url           | text                     |
| transactions           | notes                 | text                     |
| transactions           | admin_adjustment_note | text                     |
| settings               | key                   | text                     |