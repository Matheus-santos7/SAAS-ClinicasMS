import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z
    .string()
    .email({ message: "Email inválido." })
    .or(z.literal(""))
    .transform((val) => val || ""),
  phoneNumber: z
    .string()
    .trim()
    .min(1, { message: "Número de telefone é obrigatório." })
    .or(z.literal(""))
    .transform((val) => val || ""),
  cpf: z.string().trim().optional(),
  sex: z.enum(["male", "female"], {
    required_error: "Sexo é obrigatório.",
  }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
