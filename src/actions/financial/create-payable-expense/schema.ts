import { z } from "zod";

export const createPayableExpenseSchema = z.object({
  description: z.string().min(1).max(500),
  amountInCents: z.number().int().positive(),
  /** Classificação = cadastro de tipos de despesa (`expense_types`). */
  expenseTypeId: z.string().uuid(),
  vendorId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export type CreatePayableExpenseSchema = z.infer<
  typeof createPayableExpenseSchema
>;
