import { z } from "zod";

export const deleteReceivablePaymentSchema = z.object({
  paymentId: z.string().uuid(),
  observation: z
    .string()
    .trim()
    .min(1, { message: "Informe uma observação para o cancelamento deste lançamento." }),
});

export type DeleteReceivablePaymentSchema = z.infer<
  typeof deleteReceivablePaymentSchema
>;
