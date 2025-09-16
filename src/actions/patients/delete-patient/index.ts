"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

export const deletePatient = protectedAction
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, parsedInput.id),
    });
    if (!patient) {
      throw new Error("Paciente não encontrado");
    }
    if (!canAccessClinicResource(patient.clinicId, clinicId)) {
      throw new Error("Paciente não encontrado");
    }
    await db.delete(patientsTable).where(eq(patientsTable.id, parsedInput.id));
    revalidatePath(ROUTES.PATIENTS);
  });
