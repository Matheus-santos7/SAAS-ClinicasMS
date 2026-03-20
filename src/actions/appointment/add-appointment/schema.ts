import { z } from "zod";

export const addAppointmentSchema = z.object({
  doctorId: z.string().uuid({
    message: "ID do Dentista é obrigatório.",
  }),
  patientId: z.string().uuid({
    message: "ID do paciente é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Formato de hora inicial inválido (HH:MM ou HH:MM:SS).",
    }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "Formato de hora final inválido (HH:MM ou HH:MM:SS).",
  }),
  observations: z
    .string()
    .max(1000, { message: "Observações deve ter no máximo 1000 caracteres." })
    .optional()
    .nullable(),
});

export type AddAppointmentSchema = z.infer<typeof addAppointmentSchema>;
