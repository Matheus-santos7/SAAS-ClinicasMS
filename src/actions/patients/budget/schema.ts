import { z } from "zod";

export const budgetSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  procedures: z.array(
    z.object({
      name: z.string().min(2),
      value: z.number().min(0),
      quantity: z.number().min(1).default(1),
    }),
  ),
  total: z.number().min(0),
  observations: z.string().optional(),
});

export const budgetDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const budgetToTreatmentSchema = z.object({
  id: z.string().uuid(),
});
