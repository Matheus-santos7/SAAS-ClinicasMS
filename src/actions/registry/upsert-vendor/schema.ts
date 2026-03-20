import { z } from "zod";

export const upsertVendorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
  contactInfo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpsertVendorSchema = z.infer<typeof upsertVendorSchema>;
