import { z } from "zod";

export const updateReceivablePaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amountInCents: z.number().int().positive(),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "cash",
    "pix",
    "bank_transfer",
  ]),
  notes: z.string().max(2000).optional().nullable(),
  paymentDate: z.coerce.date(),
});

export type UpdateReceivablePaymentSchema = z.infer<
  typeof updateReceivablePaymentSchema
>;
