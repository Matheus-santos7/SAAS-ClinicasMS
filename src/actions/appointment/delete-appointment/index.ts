"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

export const deleteAppointment = protectedAction
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }
    if (!canAccessClinicResource(appointment.clinicId, clinicId)) {
      throw new Error("Agendamento não encontrado");
    }
    await db
      .update(appointmentsTable)
      // Soft delete: mantém registro no banco, mas remove das telas
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(appointmentsTable.id, parsedInput.id),
          eq(appointmentsTable.clinicId, clinicId),
        ),
      );
    revalidatePath(ROUTES.APPOINTMENTS);
  });
