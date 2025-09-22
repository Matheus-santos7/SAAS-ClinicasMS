// src/types/index.ts
import type { InferSelectModel } from "drizzle-orm";

import type {
  appointmentsTable,
  budgetsTable,
  doctorsTable,
  evolutionTable,
  patientsAnamnesisTable,
  patientsTable,
  treatmentsTable,
} from "@/db/schema";

// Tipos base inferidos do schema
export type Appointment = InferSelectModel<typeof appointmentsTable>;
export type Patient = InferSelectModel<typeof patientsTable>;
export type Doctor = InferSelectModel<typeof doctorsTable>;
export type Anamnesis = InferSelectModel<typeof patientsAnamnesisTable>;
export type Evolution = InferSelectModel<typeof evolutionTable>;
export type Budget = InferSelectModel<typeof budgetsTable>;
export type Treatment = InferSelectModel<typeof treatmentsTable>;

// Tipos com relações para uso em componentes
export type AppointmentWithRelations = Appointment & {
  patient: Patient;
  doctor: Doctor;
};

export type EvolutionEntryWithDoctor = Evolution & {
  doctor: Pick<Doctor, "name"> | null;
};
