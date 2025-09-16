import { z } from "zod";

export const updateAppointmentDateSchema = z.object({
  id: z.string(),
  date: z.date(),
});