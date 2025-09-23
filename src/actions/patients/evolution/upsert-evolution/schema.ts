import { z } from "zod";

export const upsertEvolutionSchema = z.object({
  id: z.string().uuid().optional(), // O ID é opcional. Se existir, é uma edição.
  patientId: z.string().uuid(),
  // O doctorId passa a ser obrigatório e virá do formulário.
  doctorId: z.string().uuid("Selecione o médico responsável."),
  date: z.date(),
  description: z.string().min(10, {
    message: "A descrição deve ter no mínimo 10 caracteres.",
  }),
  observations: z.string().optional(),
});

export const deleteEvolutionSchema = z.object({
  id: z.string().uuid(),
});
