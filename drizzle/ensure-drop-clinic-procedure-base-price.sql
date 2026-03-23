-- Remove valor base dos procedimentos (valor só no agendamento).
-- Idempotente. Uso: pnpm db:ensure-drop-clinic-procedure-base-price

ALTER TABLE "clinic_procedures" DROP COLUMN IF EXISTS "base_price_in_cents";
