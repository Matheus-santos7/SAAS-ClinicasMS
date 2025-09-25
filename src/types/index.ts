// src/types/index.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  appointmentsTable,
  budgetsTable,
  clinicsTable,
  doctorsTable,
  evolutionTable,
  patientsAnamnesisTable,
  patientsTable,
  treatmentsTable,
} from "@/db/schema";

// ========== TIPOS BASE INFERIDOS DO SCHEMA ==========
export type Appointment = InferSelectModel<typeof appointmentsTable>;
export type Patient = InferSelectModel<typeof patientsTable>;
export type Doctor = InferSelectModel<typeof doctorsTable>;
export type Clinic = InferSelectModel<typeof clinicsTable>;
export type Anamnesis = InferSelectModel<typeof patientsAnamnesisTable>;
export type Evolution = InferSelectModel<typeof evolutionTable>;
export type Budget = InferSelectModel<typeof budgetsTable>;
export type Treatment = InferSelectModel<typeof treatmentsTable>;

// Tipos para inserção (útil para formulários)
export type InsertAppointment = InferInsertModel<typeof appointmentsTable>;
export type InsertPatient = InferInsertModel<typeof patientsTable>;
export type InsertDoctor = InferInsertModel<typeof doctorsTable>;
export type InsertAnamnesis = InferInsertModel<typeof patientsAnamnesisTable>;
export type InsertEvolution = InferInsertModel<typeof evolutionTable>;
export type InsertBudget = InferInsertModel<typeof budgetsTable>;
export type InsertTreatment = InferInsertModel<typeof treatmentsTable>;

// ========== TIPOS COM RELAÇÕES ==========

// Tipos básicos para seleção/formulários
export type DoctorBasic = Pick<Doctor, "id" | "name">;
export type DoctorWithSpecialty = Pick<
  Doctor,
  "id" | "name" | "specialty" | "color"
>;
export type PatientBasic = Pick<
  Patient,
  "id" | "name" | "email" | "phoneNumber" | "sex"
>;
export type ClinicBasic = Pick<Clinic, "id" | "name">;

// Tipo para evolução com médico
export type EvolutionEntryWithDoctor = Evolution & {
  doctor: Pick<Doctor, "name"> | null;
};

// Tipo completo para agendamentos
export type AppointmentWithRelations = Appointment & {
  patient: PatientBasic;
  doctor: DoctorWithSpecialty;
};

// Tipo para orçamento com relações
export type BudgetWithRelations = Budget & {
  doctor: Doctor | null;
  items: Record<string, unknown>[];
};

// Tipo para tratamento com pagamentos
export type TreatmentWithPayments = Treatment & {
  payments: unknown[];
};

// Tipo completo para detalhes do paciente
export type PatientWithDetails = Patient & {
  anamnesisForms: Anamnesis[];
  evolutionEntries: EvolutionEntryWithDoctor[];
  doctorsTable: Doctor[];
  budgets: BudgetWithRelations[];
  treatments: TreatmentWithPayments[];
};

// ========== TIPOS PARA COMPONENTES ESPECÍFICOS ==========

// Para componentes de orçamento
export type Procedure = {
  name: string;
  value: number;
  quantity: number;
};

// Para filtros e seleções
export type DoctorFilterOption = DoctorBasic;
export type PatientSelectOption = PatientBasic;

// ========== TIPOS UTILITÁRIOS ==========

// Para status de agendamentos (pode ser expandido conforme necessário)
export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

// Para tipos de sexo padronizados
export type PatientSex = "male" | "female";

// Para dias da semana
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Para componente de seleção de cor
export type ColorSelectProps = {
  color: string;
  onSelectColor: (color: string) => void;
};

// Cores predefinidas para médicos
export type DoctorColor = {
  value: string;
  name: string;
  hex: string;
};
