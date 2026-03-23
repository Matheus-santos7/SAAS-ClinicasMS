ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "clinic_procedure_id" uuid;

ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_clinic_procedure_id_clinic_procedures_id_fk";

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_procedure_id_clinic_procedures_id_fk" FOREIGN KEY ("clinic_procedure_id") REFERENCES "clinic_procedures"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS "appointments_clinic_procedure_id_idx" ON "appointments" ("clinic_procedure_id");
