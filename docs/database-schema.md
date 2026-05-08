| table_name             | column_name           | data_type                | is_nullable |
| ---------------------- | --------------------- | ------------------------ | ----------- |
| agendas                | id                    | uuid                     | NO          |
| agendas                | title                 | text                     | NO          |
| agendas                | description           | text                     | YES         |
| agendas                | date                  | timestamp with time zone | NO          |
| agendas                | location              | text                     | YES         |
| agendas                | type                  | text                     | YES         |
| agendas                | division              | text                     | YES         |
| agendas                | created_at            | timestamp with time zone | YES         |
| event_budgets          | id                    | uuid                     | NO          |
| event_budgets          | event_name            | text                     | NO          |
| event_budgets          | budget_amount         | numeric                  | YES         |
| event_budgets          | created_at            | timestamp with time zone | YES         |
| monthly_cash           | id                    | uuid                     | NO          |
| monthly_cash           | profile_id            | uuid                     | YES         |
| monthly_cash           | month                 | text                     | NO          |
| monthly_cash           | amount                | numeric                  | NO          |
| monthly_cash           | status                | text                     | NO          |
| monthly_cash           | proof_url             | text                     | YES         |
| monthly_cash           | notes                 | text                     | YES         |
| monthly_cash           | created_at            | timestamp with time zone | YES         |
| monthly_cash           | payment_type          | text                     | YES         |
| notifications          | id                    | uuid                     | NO          |
| notifications          | title                 | text                     | NO          |
| notifications          | message               | text                     | NO          |
| notifications          | type                  | text                     | NO          |
| notifications          | read                  | boolean                  | NO          |
| notifications          | user_id               | uuid                     | YES         |
| notifications          | created_at            | timestamp with time zone | YES         |
| profiles               | id                    | uuid                     | NO          |
| profiles               | full_name             | text                     | YES         |
| profiles               | student_id            | text                     | YES         |
| profiles               | division              | text                     | YES         |
| profiles               | batch                 | text                     | YES         |
| profiles               | role                  | text                     | YES         |
| profiles               | status                | text                     | YES         |
| profiles               | contact               | text                     | YES         |
| profiles               | avatar_url            | text                     | YES         |
| profiles               | created_at            | timestamp with time zone | NO          |
| profiles               | updated_at            | timestamp with time zone | YES         |
| settings               | key                   | text                     | NO          |
| settings               | value                 | jsonb                    | NO          |
| settings               | updated_at            | timestamp with time zone | YES         |
| settings               | updated_by            | uuid                     | YES         |
| split_bill_items       | id                    | uuid                     | NO          |
| split_bill_items       | bill_id               | uuid                     | YES         |
| split_bill_items       | profile_id            | uuid                     | YES         |
| split_bill_items       | amount                | numeric                  | NO          |
| split_bill_items       | status                | text                     | NO          |
| split_bill_items       | proof_url             | text                     | YES         |
| split_bill_items       | paid_at               | timestamp with time zone | YES         |
| split_bill_items       | created_at            | timestamp with time zone | YES         |
| split_bills            | id                    | uuid                     | NO          |
| split_bills            | title                 | text                     | NO          |
| split_bills            | description           | text                     | YES         |
| split_bills            | total_amount          | numeric                  | NO          |
| split_bills            | created_by            | uuid                     | YES         |
| split_bills            | created_at            | timestamp with time zone | YES         |
| tasks                  | id                    | uuid                     | NO          |
| tasks                  | title                 | text                     | NO          |
| tasks                  | description           | text                     | YES         |
| tasks                  | status                | text                     | YES         |
| tasks                  | division              | text                     | YES         |
| tasks                  | pic_id                | uuid                     | YES         |
| tasks                  | deadline              | timestamp with time zone | YES         |
| tasks                  | progress_percent      | integer                  | YES         |
| tasks                  | created_at            | timestamp with time zone | NO          |
| tasks                  | tags                  | ARRAY                    | YES         |
| tasks                  | updated_at            | timestamp with time zone | YES         |
| transactions           | id                    | uuid                     | NO          |
| transactions           | type                  | text                     | YES         |
| transactions           | amount                | numeric                  | NO          |
| transactions           | description           | text                     | YES         |
| transactions           | category              | text                     | YES         |
| transactions           | date                  | date                     | YES         |
| transactions           | approved_by           | uuid                     | YES         |
| transactions           | status                | text                     | YES         |
| transactions           | created_at            | timestamp with time zone | NO          |
| transactions           | event_type            | text                     | YES         |
| transactions           | item_name             | text                     | YES         |
| transactions           | debt_amount           | numeric                  | YES         |
| transactions           | credit_amount         | numeric                  | YES         |
| transactions           | division_target       | text                     | YES         |
| transactions           | from_entity           | text                     | YES         |
| transactions           | to_entity             | text                     | YES         |
| transactions           | location              | text                     | YES         |
| transactions           | payment_type          | text                     | YES         |
| transactions           | receipt_url           | text                     | YES         |
| transactions           | notes                 | text                     | YES         |
| transactions           | updated_at            | timestamp with time zone | YES         |
| transactions           | admin_adjustment_note | text                     | YES         |
| v_division_performance | division              | text                     | YES         |
| v_division_performance | total_tasks           | bigint                   | YES         |
| v_division_performance | completed_tasks       | bigint                   | YES         |
| v_division_performance | success_rate          | numeric                  | YES         |
| v_monthly_cashflow     | month_period          | text                     | YES         |
| v_monthly_cashflow     | total_income          | numeric                  | YES         |
| v_monthly_cashflow     | total_expense         | numeric                  | YES         |
| v_monthly_cashflow     | net_balance           | numeric                  | YES         |