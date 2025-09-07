"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { actionClient } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

export const deleteDoctor = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.id),
    });
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }
    if (!canAccessClinicResource(doctor.clinicId, clinicId)) {
      throw new Error("Dentista não encontrado");
    }
    await db.delete(doctorsTable).where(eq(doctorsTable.id, parsedInput.id));
    revalidatePath(ROUTES.DOCTORS);
  });
