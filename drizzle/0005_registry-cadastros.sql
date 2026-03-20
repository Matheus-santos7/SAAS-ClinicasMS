CREATE TYPE "public"."expense_recurrence_type" AS ENUM('one_time', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TABLE "clinic_procedures" (
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
--> statement-breakpoint
CREATE TABLE "expense_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"recurrence_type" "expense_recurrence_type" NOT NULL,
	"notes" text,
	"vendor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "treatment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clinic_financial_transactions" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "clinic_financial_transactions" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "appointment_id" uuid;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "clinic_procedures" ADD CONSTRAINT "clinic_procedures_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_types" ADD CONSTRAINT "expense_types_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_types" ADD CONSTRAINT "expense_types_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clinic_procedures_clinic_id_idx" ON "clinic_procedures" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "expense_types_clinic_id_idx" ON "expense_types" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "expense_types_vendor_id_idx" ON "expense_types" USING btree ("vendor_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_appointment_id_idx" ON "payments" USING btree ("appointment_id");