-- Idempotente: adiciona expense_type_id e relaxa category_id se ainda não existirem.
-- Use: pnpm db:ensure-expense-type-column

ALTER TABLE "clinic_financial_transactions"
  ADD COLUMN IF NOT EXISTS "expense_type_id" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clinic_financial_transactions_expense_type_id_expense_types_id_fk'
  ) THEN
    ALTER TABLE "clinic_financial_transactions"
      ADD CONSTRAINT "clinic_financial_transactions_expense_type_id_expense_types_id_fk"
      FOREIGN KEY ("expense_type_id") REFERENCES "public"."expense_types"("id")
      ON DELETE restrict ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'clinic_financial_transactions'
      AND column_name = 'category_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "clinic_financial_transactions"
      ALTER COLUMN "category_id" DROP NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "clinic_financial_transactions_expense_type_id_idx"
  ON "clinic_financial_transactions" ("expense_type_id");
