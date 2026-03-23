import { z } from "zod";

export const upsertClinicProcedureSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
  durationSeconds: z
    .number()
    .int()
    .min(1, { message: "Duração inválida." }),
  hasReturn: z.boolean(),
});

export type UpsertClinicProcedureSchema = z.infer<
  typeof upsertClinicProcedureSchema
>;
