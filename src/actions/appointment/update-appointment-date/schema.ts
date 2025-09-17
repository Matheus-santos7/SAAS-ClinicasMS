import { z } from "zod";

export const updateAppointmentDateSchema = z.object({
  id: z.string(),
  date: z.date().optional(), // Início do agendamento
  endDate: z.date().optional(), // Fim do agendamento
}).refine(data => data.date || data.endDate, {
  message: "Pelo menos uma das datas (início ou fim) deve ser fornecida.",
});