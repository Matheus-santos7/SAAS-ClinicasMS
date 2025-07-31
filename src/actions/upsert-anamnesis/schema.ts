// src/actions/anamnesis/schema.ts

import { z } from "zod";

export const upsertAnamnesisSchema = z
  .object({
    id: z.string().optional(),
    patientId: z.string().min(1, "ID do paciente é obrigatório"),
    doctorId: z.string().min(1, "ID do médico é obrigatório"),
    reasonConsultation: z.string().optional(),
    systemicDiseases: z.string().optional(),
    medicationUsage: z.string().optional(),
    allergies: z.string().optional(),
    previousSurgeries: z.string().optional(),
    habits: z.string().optional(),
    oralHygiene: z.string().optional(),
    previousDentalProblems: z.string().optional(),
    currentTreatment: z.string().optional(),
    familyHistory: z.string().optional(),
    mentalConditions: z.string().optional(),
    observations: z.string().optional(),
    hasAllergies: z.boolean().default(false),
    usesMedication: z.boolean().default(false),
    hadPreviousSurgeries: z.boolean().default(false),
    smokes: z.boolean().default(false),
    drinksAlcohol: z.boolean().default(false),
    isPregnant: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Se o usuário marcou que tem alergias, o campo de descrição de alergias não pode estar vazio.
      if (data.hasAllergies && !data.allergies?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Por favor, descreva as alergias.",
      path: ["allergies"], // Aplica o erro no campo 'allergies'
    },
  )
  .refine(
    (data) => {
      // Regra similar para uso de medicação
      if (data.usesMedication && !data.medicationUsage?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Por favor, descreva as medicações em uso.",
      path: ["medicationUsage"],
    },
  );

export type UpsertAnamnesisSchema = z.infer<typeof upsertAnamnesisSchema>;
