import { z } from "zod";

export const expenseRecurrenceValues = [
  "one_time",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export const upsertExpenseTypeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
  recurrenceType: z.enum(expenseRecurrenceValues),
  notes: z.string().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
});

export type UpsertExpenseTypeSchema = z.infer<typeof upsertExpenseTypeSchema>;
