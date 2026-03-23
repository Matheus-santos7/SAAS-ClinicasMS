import { z } from "zod";

export const deletePayableExpenseSchema = z.object({
  transactionId: z.string().uuid(),
});

export type DeletePayableExpenseSchema = z.infer<
  typeof deletePayableExpenseSchema
>;
