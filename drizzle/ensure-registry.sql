-- Idempotente: enum + clinic_procedures + expense_types + vendors.notes
-- Use quando `drizzle-kit migrate` não aplicar o histórico (arquivos .sql faltando no repositório).
-- Execute: pnpm db:ensure-registry

DO $$ BEGIN
  CREATE TYPE "public"."expense_recurrence_type" AS ENUM(
    'one_time',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."clinic_procedures" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "base_price_in_cents" integer NOT NULL,
  "duration_seconds" integer NOT NULL,
  "has_return" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now(),
  "deleted_at" timestamp
);

CREATE TABLE IF NOT EXISTS "public"."expense_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "recurrence_type" "public"."expense_recurrence_type" NOT NULL,
  "notes" text,
  "vendor_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now(),
  "deleted_at" timestamp
);

DO $$ BEGIN
  ALTER TABLE "public"."clinic_procedures"
    ADD CONSTRAINT "clinic_procedures_clinic_id_clinics_id_fk"
    FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."expense_types"
    ADD CONSTRAINT "expense_types_clinic_id_clinics_id_fk"
    FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."expense_types"
    ADD CONSTRAINT "expense_types_vendor_id_vendors_id_fk"
    FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id")
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "clinic_procedures_clinic_id_idx"
  ON "public"."clinic_procedures" USING btree ("clinic_id");

CREATE INDEX IF NOT EXISTS "expense_types_clinic_id_idx"
  ON "public"."expense_types" USING btree ("clinic_id");

CREATE INDEX IF NOT EXISTS "expense_types_vendor_id_idx"
  ON "public"."expense_types" USING btree ("vendor_id");

ALTER TABLE "public"."vendors" ADD COLUMN IF NOT EXISTS "notes" text;
