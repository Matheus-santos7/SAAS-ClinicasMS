"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = protectedAction
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    if (
      !canAccessClinicResource(
        session?.user.clinic?.id,
        session?.user.clinic?.id,
      )
    ) {
      throw new Error("Acesso negado à clínica");
    }

    await db
      .insert(patientsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: clinicId,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
        },
      });
    revalidatePath(ROUTES.PATIENTS);
  });
