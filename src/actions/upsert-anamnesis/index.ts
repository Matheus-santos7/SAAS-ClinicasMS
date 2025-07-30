"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { patientsAnamnesisTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { createSafeAction } from "../../lib/safe-action";
// Or, if the export is named differently, for example 'safeAction':
// import { safeAction as createSafeAction } from "@/lib/safe-action"; // Usando o novo client
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

    // Separa os IDs dos dados a serem atualizados para maior segurança
    const { id, patientId, doctorId, ...updateData } = parsedInput;

    await db
      .insert(patientsAnamnesisTable)
      .values({
        id: id, // Passa o ID (pode ser undefined para novos registros)
        patientId: patientId,
        doctorId: doctorId,
        ...updateData,
      })
      .onConflictDoUpdate({
        target: [patientsAnamnesisTable.id], // Conflito no ID primário
        set: {
          ...updateData, // Atualiza apenas os outros dados
          updatedAt: new Date(), // Garante a atualização da data
        },
      });

    // Invalida o cache para que a página de detalhes mostre os dados atualizados
    revalidatePath(`/patients/${parsedInput.patientId}`);

    return { success: "Anamnese salva com sucesso." };
  },
);
