import { z } from "zod";

export const markPayablePaidSchema = z.object({
  transactionId: z.string().uuid(),
});

export type MarkPayablePaidSchema = z.infer<typeof markPayablePaidSchema>;
