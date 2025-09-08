import {
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const budgetTable = pgTable("budget", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  procedures: jsonb("procedures").notNull(), // [{ nome, valor }]
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  observations: text("observations"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const treatmentTable = pgTable("treatment", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  procedures: jsonb("procedures").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  observations: text("observations"),
  startedAt: timestamp("started_at").defaultNow(),
});
