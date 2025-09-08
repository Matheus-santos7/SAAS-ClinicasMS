// src/actions/upsert-anamnesis/index.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsAnamnesisTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAnamnesisSchema } from "./schema";

export const upsertAnamnesis = actionClient
  .schema(upsertAnamnesisSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Sessão não autorizada.");
    const { id, patientId, doctorId, ...updateData } = parsedInput;
    await db
      .insert(patientsAnamnesisTable)
      .values({ id, patientId, doctorId, ...updateData })
      .onConflictDoUpdate({
        target: [patientsAnamnesisTable.id],
        set: { ...updateData, updatedAt: new Date() },
      });
    revalidatePath(`/patients/${parsedInput.patientId}`);
    return { success: "Anamnese salva com sucesso." };
  });
