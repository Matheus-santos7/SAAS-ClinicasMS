import { z } from "zod";

export const addAppointmentSchema = z.object({
  doctorId: z.string().uuid({
    message: "ID do médico é obrigatório.",
  }),
  patientId: z.string().uuid({
    message: "ID do paciente é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "Formato de hora inválido (HH:MM ou HH:MM:SS).",
  }),
});

export type AddAppointmentSchema = z.infer<typeof addAppointmentSchema>;
