// src/actions/upsert-anamnesis/index.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { patientsAnamnesisTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSafeAction } from "../../lib/safe-action";
import { upsertAnamnesisSchema } from "./schema";

export const upsertAnamnesis = createSafeAction(
  upsertAnamnesisSchema,
  async ({
    parsedInput,
  }: {
    parsedInput: z.infer<typeof upsertAnamnesisSchema>;
  }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Sessão não autorizada.");
    }

    const { id, patientId, doctorId, ...updateData } = parsedInput;

    await db
      .insert(patientsAnamnesisTable)
      .values({
        id: id,
        patientId: patientId,
        doctorId: doctorId,
        ...updateData,
      })
      .onConflictDoUpdate({
        target: [patientsAnamnesisTable.id],
        set: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

    revalidatePath(`/patients/${parsedInput.patientId}`);

    return { success: "Anamnese salva com sucesso." };
  },
);