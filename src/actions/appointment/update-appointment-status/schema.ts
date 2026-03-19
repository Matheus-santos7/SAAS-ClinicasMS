import { z } from "zod";

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid({
    message: "ID do agendamento é obrigatório.",
  }),
  status: z.enum(["pending", "confirmed", "canceled", "completed"], {
    required_error: "Status é obrigatório.",
  }),
});

export type UpdateAppointmentStatusSchema = z.infer<
  typeof updateAppointmentStatusSchema
>;

