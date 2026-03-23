import { z } from "zod";

export const registerReceivablePaymentSchema = z.object({
  appointmentId: z.string().uuid(),
  amountInCents: z.number().int().positive(),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "cash",
    "pix",
    "bank_transfer",
  ]),
  notes: z.string().max(2000).optional(),
});

export type RegisterReceivablePaymentSchema = z.infer<
  typeof registerReceivablePaymentSchema
>;
