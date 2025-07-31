import { z } from "zod";

export const upsertEvolutionSchema = z.object({
  id: z.string().uuid().optional(), // O ID é opcional. Se existir, é uma edição.
  patientId: z.string().uuid(),
  doctorId: z.string().uuid({
    required_error: "Selecione o médico responsável.",
  }),
  date: z.date({
    required_error: "A data da evolução é obrigatória.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter no mínimo 10 caracteres.",
  }),
  observations: z.string().optional(),
  // TODO: Adicionar validação para imagens se necessário
  // imageUrls: z.array(z.string().url()).optional(),
});

export const deleteEvolutionSchema = z.object({
  id: z.string().uuid(),
});
