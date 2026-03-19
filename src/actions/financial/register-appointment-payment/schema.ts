import { z } from "zod";

export const registerAppointmentPaymentSchema = z.object({
  appointmentId: z.string().uuid({
    message: "ID do agendamento é obrigatório.",
  }),
  amountInCents: z
    .number({
      required_error: "Valor é obrigatório.",
      invalid_type_error: "Informe um valor válido.",
    })
    .positive("Valor deve ser maior que zero."),
  method: z.enum(["pix", "cash", "credit_card", "debit_card", "bank_transfer"], {
    required_error: "Forma de pagamento é obrigatória.",
  }),
  paymentDate: z.date({
    required_error: "Data de pagamento é obrigatória.",
  }),
  notes: z
    .string()
    .max(500, { message: "Observações deve ter no máximo 500 caracteres." })
    .optional()
    .nullable(),
});

export type RegisterAppointmentPaymentSchema = z.infer<
  typeof registerAppointmentPaymentSchema
>;

