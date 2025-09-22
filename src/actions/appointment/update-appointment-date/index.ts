"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { updateAppointmentDateSchema } from "./schema";

export const updateAppointmentDate = protectedAction
  .schema(updateAppointmentDateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const { id, date, endDate } = parsedInput;

    const updateData: { date?: Date; endDate?: Date } = {};
    if (date) updateData.date = date;
    if (endDate) updateData.endDate = endDate;

    await db
      .update(appointmentsTable)
      .set(updateData)
      .where(
        and(
          eq(appointmentsTable.id, id),
          eq(appointmentsTable.clinicId, clinicId),
        ),
      );

    revalidatePath(ROUTES.APPOINTMENTS);
    return { success: "Agendamento atualizado com sucesso!" };
  });
