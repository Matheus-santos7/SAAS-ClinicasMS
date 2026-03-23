import { z } from "zod";

export const updatePayableExpenseSchema = z.object({
  transactionId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amountInCents: z.number().int().positive(),
  expenseTypeId: z.string().uuid(),
  vendorId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export type UpdatePayableExpenseSchema = z.infer<
  typeof updatePayableExpenseSchema
>;
