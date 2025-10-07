import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Enums adicionais
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "canceled",
  "completed",
]);
export const treatmentPaymentStatusEnum = pgEnum("treatment_payment_status", [
  "pending",
  "partially_paid",
  "paid",
]);

// Tabela de usuários
export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  }),
);

// Relações de usuários
export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

// Tabela de sessões
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

// Tabela de contas
export const accountsTable = pgTable(
  "accounts",
  {
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
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

// Tabela de verificações
export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// Tabela de clínicas
export const clinicsTable = pgTable(
  "clinics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    nameIdx: index("clinics_name_idx").on(table.name),
  }),
);

// Relações de clínicas
export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
  transactionCategories: many(transactionCategoriesTable),
}));

// Tabela de relacionamento users_to_clinics
export const usersToClinicsTable = pgTable(
  "users_to_clinics",
  {
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
  },
  (table) => ({
    userIdIdx: index("users_to_clinics_user_id_idx").on(table.userId),
    clinicIdIdx: index("users_to_clinics_clinic_id_idx").on(table.clinicId),
  }),
);

// Relações de users_to_clinics
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

// Tabela de médicos
export const doctorsTable = pgTable(
  "doctors",
  {
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
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clinicIdIdx: index("doctors_clinic_id_idx").on(table.clinicId),
  }),
);

// Relações de médicos
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

// Enum para sexo do paciente
export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

// Tabela de pacientes com soft delete
export const patientsTable = pgTable(
  "patients",
  {
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
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clinicIdIdx: index("patients_clinic_id_idx").on(table.clinicId),
    emailIdx: index("patients_email_idx").on(table.email),
  }),
);

// Tabela de documentos
export const documentsTable = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileType: text("file_type").notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    anamnesisId: uuid("anamnesis_id").references(
      () => patientsAnamnesisTable.id,
      { onDelete: "cascade" },
    ),
    evolutionId: uuid("evolution_id").references(() => evolutionTable.id, {
      onDelete: "cascade",
    }),
  },
  (table) => ({
    anamnesisIdIdx: index("documents_anamnesis_id_idx").on(table.anamnesisId),
    evolutionIdIdx: index("documents_evolution_id_idx").on(table.evolutionId),
    // CHECK constraint para garantir que pelo menos um dos IDs esteja preenchido
    atLeastOneReferenceCheck: check(
      "at_least_one_reference",
      sql`(anamnesis_id IS NOT NULL OR evolution_id IS NOT NULL)`,
    ),
  }),
);

// Tabela de anamnese
export const patientsAnamnesisTable = pgTable(
  "patients_anamnesis",
  {
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()), // Padronizado
  },
  (table) => ({
    patientIdIdx: index("patients_anamnesis_patient_id_idx").on(
      table.patientId,
    ),
    doctorIdIdx: index("patients_anamnesis_doctor_id_idx").on(table.doctorId),
  }),
);

// Tabela de evolução
export const evolutionTable = pgTable(
  "evolution",
  {
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
  },
  (table) => ({
    patientIdIdx: index("evolution_patient_id_idx").on(table.patientId),
    doctorIdIdx: index("evolution_doctor_id_idx").on(table.doctorId),
  }),
);

// Relações de pacientes
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
    budgets: many(budgetsTable),
  }),
);

// Relações de anamnese
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

// Relações de evolução
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
    documents: many(documentsTable, { relationName: "evolutionDocuments" }),
  }),
);

// Relações de documentos (sem alterações)
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
export const appointmentsTable = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date").notNull(),
    endDate: timestamp("endDate").notNull(),
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
    budgetId: uuid("budget_id").references(() => budgetsTable.id, {
      // Nova coluna
      onDelete: "set null",
    }),
    treatmentId: uuid("treatment_id").references(() => treatmentsTable.id, {
      // Vincula agendamento a um tratamento contínuo
      onDelete: "set null",
    }),
    status: appointmentStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clinicIdIdx: index("appointments_clinic_id_idx").on(table.clinicId),
    patientIdIdx: index("appointments_patient_id_idx").on(table.patientId),
    doctorIdIdx: index("appointments_doctor_id_idx").on(table.doctorId),
    budgetIdIdx: index("appointments_budget_id_idx").on(table.budgetId),
    treatmentIdIdx: index("appointments_treatment_id_idx").on(
      table.treatmentId,
    ),
  }),
);

// Relações de agendamentos
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
    budget: one(budgetsTable, {
      // Nova relação
      fields: [appointmentsTable.budgetId],
      references: [budgetsTable.id],
    }),
    treatment: one(treatmentsTable, {
      // Relação com tratamento
      fields: [appointmentsTable.treatmentId],
      references: [treatmentsTable.id],
    }),
  }),
);

// === MÓDULO FINANCEIRO ===

// Nova tabela de fornecedores
export const vendorsTable = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contactInfo: text("contact_info"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clinicIdIdx: index("vendors_clinic_id_idx").on(table.clinicId),
  }),
);

// Tabela de orçamentos
export const budgetsTable = pgTable(
  "budgets",
  {
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
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    patientIdIdx: index("budgets_patient_id_idx").on(table.patientId),
    doctorIdIdx: index("budgets_doctor_id_idx").on(table.doctorId),
    clinicIdIdx: index("budgets_clinic_id_idx").on(table.clinicId),
  }),
);

// Nova tabela para histórico de orçamentos
export const budgetHistoryTable = pgTable(
  "budget_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgetsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    action: text("action", {
      enum: ["created", "updated", "approved", "rejected"],
    }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    budgetIdIdx: index("budget_history_budget_id_idx").on(table.budgetId),
    userIdIdx: index("budget_history_user_id_idx").on(table.userId),
  }),
);

// Tabela de itens de orçamento
export const budgetItemsTable = pgTable(
  "budget_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgetsTable.id, { onDelete: "cascade" }),
    procedureName: text("procedure_name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    priceInCents: integer("price_in_cents").notNull(),
    discountInCents: integer("discount_in_cents").default(0),
    finalPriceInCents: integer("final_price_in_cents").notNull(), // Preço final materializado para otimizar agregações
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    budgetIdIdx: index("budget_items_budget_id_idx").on(table.budgetId),
  }),
);

// Tabela de tratamentos
export const treatmentsTable = pgTable(
  "treatments",
  {
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
    paymentStatus: treatmentPaymentStatusEnum("payment_status")
      .notNull()
      .default("pending"), // Novo campo
    status: text("status", { enum: ["ongoing", "completed", "canceled"] })
      .notNull()
      .default("ongoing"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"), // Adicionado
  },
  (table) => ({
    patientIdIdx: index("treatments_patient_id_idx").on(table.patientId),
    clinicIdIdx: index("treatments_clinic_id_idx").on(table.clinicId),
    budgetIdIdx: index("treatments_budget_id_idx").on(table.budgetId),
  }),
);

// Tabela de pagamentos
export const paymentsTable = pgTable(
  "payments",
  {
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
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    treatmentIdIdx: index("payments_treatment_id_idx").on(table.treatmentId),
    clinicIdIdx: index("payments_clinic_id_idx").on(table.clinicId),
  }),
);

// Tabela de categorias de transações financeiras
export const transactionCategoriesTable = pgTable(
  "transaction_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // Ex: "Salários", "Materiais de Consumo", "Receita de Tratamento"
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    clinicIdIdx: index("transaction_categories_clinic_id_idx").on(
      table.clinicId,
    ),
    typeIdx: index("transaction_categories_type_idx").on(table.type),
    // Evita categorias duplicadas por clínica
    uniqueCategoryPerClinic: index("unique_category_per_clinic").on(
      table.clinicId,
      table.name,
      table.type,
    ),
  }),
);

// Tabela de transações financeiras da clínica
export const clinicFinancialTransactionsTable = pgTable(
  "clinic_financial_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id").references(() => vendorsTable.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    amountInCents: integer("amount_in_cents").notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => transactionCategoriesTable.id, {
        onDelete: "restrict",
      }),
    subcategory: text("subcategory"), // Mantido para flexibilidade adicional
    paymentId: uuid("payment_id").references(() => paymentsTable.id, {
      onDelete: "set null",
    }),
    transactionDate: timestamp("transaction_date").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clinicIdIdx: index("clinic_financial_transactions_clinic_id_idx").on(
      table.clinicId,
    ),
    vendorIdIdx: index("clinic_financial_transactions_vendor_id_idx").on(
      table.vendorId,
    ),
    paymentIdIdx: index("clinic_financial_transactions_payment_id_idx").on(
      table.paymentId,
    ),
    categoryIdIdx: index("clinic_financial_transactions_category_id_idx").on(
      table.categoryId,
    ),
  }),
);

// Relações do módulo financeiro

export const transactionCategoriesTableRelations = relations(
  transactionCategoriesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [transactionCategoriesTable.clinicId],
      references: [clinicsTable.id],
    }),
    transactions: many(clinicFinancialTransactionsTable),
  }),
);

export const vendorsTableRelations = relations(
  vendorsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [vendorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    transactions: many(clinicFinancialTransactionsTable),
  }),
);

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
    history: many(budgetHistoryTable),
    appointments: many(appointmentsTable),
  }),
);

export const budgetHistoryTableRelations = relations(
  budgetHistoryTable,
  ({ one }) => ({
    budget: one(budgetsTable, {
      fields: [budgetHistoryTable.budgetId],
      references: [budgetsTable.id],
    }),
    user: one(usersTable, {
      fields: [budgetHistoryTable.userId],
      references: [usersTable.id],
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
    appointments: many(appointmentsTable), // Agendamentos do tratamento
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
    vendor: one(vendorsTable, {
      fields: [clinicFinancialTransactionsTable.vendorId],
      references: [vendorsTable.id],
    }),
    category: one(transactionCategoriesTable, {
      fields: [clinicFinancialTransactionsTable.categoryId],
      references: [transactionCategoriesTable.id],
    }),
  }),
);

// Exportações para compatibilidade com Better Auth/Drizzle Adapter
export { usersTable as usersTables };
export { accountsTable as accountsTables };
export { verificationsTable as verificationsTables };
