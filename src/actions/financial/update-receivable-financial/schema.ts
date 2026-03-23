import { z } from "zod";

/** Ajuste do valor total da consulta; o valor pago vem somente dos lançamentos em `payments`. */
export const updateReceivableFinancialSchema = z.object({
  appointmentId: z.string().uuid(),
  appointmentPriceInCents: z.number().int().min(0),
});

export type UpdateReceivableFinancialSchema = z.infer<
  typeof updateReceivableFinancialSchema
>;
