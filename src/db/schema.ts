// Exportação adicional para compatibilidade com o Better Auth/Drizzle Adapter
export { usersTable as usersTables };
// Exportação adicional para compatibilidade com o Better Auth/Drizzle Adapter
export { accountsTable as accountsTables };
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
  
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  specialty: text("specialty").notNull(),
  color: text("color").default("#3174ad").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  sex: patientSexEnum("sex").notNull(),
  cpf: text("cpf"),
  birthDate: timestamp("birth_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela de Documents 
export const documentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(), // Caminho no seu storage (ex: S3, Vercel Blob)
  fileType: text("file_type").notNull(), // ex: 'application/pdf', 'image/jpeg'
  uploadedAt: timestamp("uploaded_at").defaultNow(),

  anamnesisId: uuid("anamnesis_id").references(
    () => patientsAnamnesisTable.id,
    { onDelete: "cascade" },
  ),
  evolutionId: uuid("evolution_id").references(() => evolutionTable.id, {
    onDelete: "cascade",
  }),
});

// Tabela de Anamnese simplificada
export const patientsAnamnesisTable = pgTable("patients_anamnesis", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  reasonConsultation: text("reason_consultation"),
  systemicDiseases: text("systemic_diseases"),
  medicationUsage: text("medication_usage"),
  allergies: text("allergies"),
  previousSurgeries: text("previous_surgeries"),
  habits: text("habits"),
  oralHygiene: text("oral_hygiene"),
  previousDentalProblems: text("previous_dental_problems"),
  currentTreatment: text("current_treatment"),
  familyHistory: text("family_history"),
  mentalConditions: text("mental_conditions"),
  observations: text("observations"),
  hasAllergies: boolean("has_allergies").default(false),
  usesMedication: boolean("uses_medication").default(false),
  hadPreviousSurgeries: boolean("had_previous_surgeries").default(false),
  smokes: boolean("smokes").default(false),
  drinksAlcohol: boolean("drinks_alcohol").default(false),
  isPregnant: boolean("pregnant").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de Evolução
export const evolutionTable = pgTable("evolution", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  date: timestamp("date").defaultNow().notNull(),
  observations: text("observations").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
    anamnesisForms: many(patientsAnamnesisTable),
    evolutionEntries: many(evolutionTable),
    doctors: many(doctorsTable), // Adiciona relação para buscar médicos da clínica do paciente
  }),
);

export const patientsAnamnesisTableRelations = relations(
  patientsAnamnesisTable,
  ({ one, many }) => ({
    patient: one(patientsTable, {
      fields: [patientsAnamnesisTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [patientsAnamnesisTable.doctorId],
      references: [doctorsTable.id],
    }),
    documents: many(documentsTable, { relationName: "anamnesisDocuments" }),
  }),
);

export const evolutionTableRelations = relations(
  evolutionTable,
  ({ one, many }) => ({
    patient: one(patientsTable, {
      fields: [evolutionTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [evolutionTable.doctorId],
      references: [doctorsTable.id],
    }),
    documents: many(documentsTable, { relationName: "evolutionDocuments" }), // NOVA RELAÇÃO
  }),
);

// Relação da tabela de documentos de volta para seus "pais"
export const documentsTableRelations = relations(documentsTable, ({ one }) => ({
  anamnesis: one(patientsAnamnesisTable, {
    fields: [documentsTable.anamnesisId],
    references: [patientsAnamnesisTable.id],
    relationName: "anamnesisDocuments",
  }),
  evolution: one(evolutionTable, {
    fields: [documentsTable.evolutionId],
    references: [evolutionTable.id],
    relationName: "evolutionDocuments",
  }),
}));

// Tabela de agendamentos
export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

// src/db/schema.ts

// ... (todo o seu schema existente) ...

// ==================================
// MÓDULO FINANCEIRO
// ==================================

export const budgetsTable = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  totalAmountInCents: integer("total_amount_in_cents").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const budgetItemsTable = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgetsTable.id, { onDelete: "cascade" }),
  procedureName: text("procedure_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  priceInCents: integer("price_in_cents").notNull(),
});

export const treatmentsTable = pgTable("treatments", {
  id: uuid("id").defaultRandom().primaryKey(),
  budgetId: uuid("budget_id").references(() => budgetsTable.id, {
    onDelete: "set null",
  }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  totalAmountInCents: integer("total_amount_in_cents").notNull(),
  amountPaidInCents: integer("amount_paid_in_cents").notNull().default(0),
  status: text("status", { enum: ["ongoing", "completed", "canceled"] })
    .notNull()
    .default("ongoing"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const paymentsTable = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  treatmentId: uuid("treatment_id")
    .notNull()
    .references(() => treatmentsTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  amountInCents: integer("amount_in_cents").notNull(),
  paymentMethod: text("payment_method", {
    enum: ["credit_card", "debit_card", "cash", "pix", "bank_transfer"],
  }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clinicFinancialTransactionsTable = pgTable(
  "clinic_financial_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amountInCents: integer("amount_in_cents").notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    category: text("category").notNull(), // e.g., 'patient_payment', 'salary', 'rent', 'supplies'
    paymentId: uuid("payment_id").references(() => paymentsTable.id, {
      onDelete: "set null",
    }), // Link to patient payment
    transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  },
);

// --- RELACIONAMENTOS DO MÓDULO FINANCEIRO ---

export const budgetsTableRelations = relations(
  budgetsTable,
  ({ one, many }) => ({
    patient: one(patientsTable, {
      fields: [budgetsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [budgetsTable.doctorId],
      references: [doctorsTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [budgetsTable.clinicId],
      references: [clinicsTable.id],
    }),
    items: many(budgetItemsTable),
    treatment: one(treatmentsTable, {
      fields: [budgetsTable.id],
      references: [treatmentsTable.budgetId],
    }),
  }),
);

export const budgetItemsTableRelations = relations(
  budgetItemsTable,
  ({ one }) => ({
    budget: one(budgetsTable, {
      fields: [budgetItemsTable.budgetId],
      references: [budgetsTable.id],
    }),
  }),
);

export const treatmentsTableRelations = relations(
  treatmentsTable,
  ({ one, many }) => ({
    budget: one(budgetsTable, {
      fields: [treatmentsTable.budgetId],
      references: [budgetsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [treatmentsTable.patientId],
      references: [patientsTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [treatmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    payments: many(paymentsTable),
  }),
);

export const paymentsTableRelations = relations(paymentsTable, ({ one }) => ({
  treatment: one(treatmentsTable, {
    fields: [paymentsTable.treatmentId],
    references: [treatmentsTable.id],
  }),
  clinic: one(clinicsTable, {
    fields: [paymentsTable.clinicId],
    references: [clinicsTable.id],
  }),
  clinicTransaction: one(clinicFinancialTransactionsTable, {
    fields: [paymentsTable.id],
    references: [clinicFinancialTransactionsTable.paymentId],
  }),
}));

export const clinicFinancialTransactionsTableRelations = relations(
  clinicFinancialTransactionsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [clinicFinancialTransactionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    payment: one(paymentsTable, {
      fields: [clinicFinancialTransactionsTable.paymentId],
      references: [paymentsTable.id],
    }),
  }),
);

// Exportação adicional para compatibilidade com o Better Auth/Drizzle Adapter
export { verificationsTable as verificationsTables };
