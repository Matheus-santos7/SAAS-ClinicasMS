ALTER TABLE "clinic_financial_transactions" ADD COLUMN "expense_type_id" uuid;--> statement-breakpoint
ALTER TABLE "clinic_financial_transactions" ADD CONSTRAINT "clinic_financial_transactions_expense_type_id_expense_types_id_fk" FOREIGN KEY ("expense_type_id") REFERENCES "public"."expense_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_financial_transactions" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "clinic_financial_transactions_expense_type_id_idx" ON "clinic_financial_transactions" USING btree ("expense_type_id");
