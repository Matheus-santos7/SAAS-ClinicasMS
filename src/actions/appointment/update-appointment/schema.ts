import { z } from "zod";

export const updateAppointmentSchema = z.object({
  id: z.string().uuid({
    message: "ID do agendamento é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Formato de hora inicial inválido (HH:MM ou HH:MM:SS).",
    }),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Formato de hora final inválido (HH:MM ou HH:MM:SS).",
    }),
  observations: z
    .string()
    .max(1000, { message: "Observações deve ter no máximo 1000 caracteres." })
    .optional()
    .nullable(),
  status: z
    .enum(["pending", "confirmed", "canceled", "completed"])
    .optional()
    .default("pending"),
});

export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;

