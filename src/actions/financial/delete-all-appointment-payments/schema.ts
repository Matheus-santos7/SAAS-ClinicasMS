import { z } from "zod";

export const deleteAllAppointmentPaymentsSchema = z.object({
  appointmentId: z.string().uuid(),
  observation: z
    .string()
    .trim()
    .min(1, { message: "Informe uma observação para excluir os pagamentos." }),
});

export type DeleteAllAppointmentPaymentsSchema = z.infer<
  typeof deleteAllAppointmentPaymentsSchema
>;
