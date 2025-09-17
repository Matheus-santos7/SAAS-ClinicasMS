"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { updateAppointmentDateSchema } from "./schema";

export const updateAppointmentDate = protectedAction
  .schema(updateAppointmentDateSchema)
  .action(async ({ parsedInput }) => {
    const { id, date, endDate } = parsedInput;
    const session = await getSessionOrThrow();
    const user = session.user;

    if (!user?.clinic?.id) {
      throw new Error("Usuário sem clínica associada.");
    }

    // Objeto dinâmico para a atualização
    const updateData: { date?: Date; endDate?: Date } = {};
    if (date) {
      updateData.date = date;
    }
    if (endDate) {
      updateData.endDate = endDate;
    }

    try {
      await db
        .update(appointmentsTable)
        .set(updateData)
        .where(
          and(
            eq(appointmentsTable.id, id),
            eq(appointmentsTable.clinicId, user.clinic.id),
          ),
        );

      revalidatePath(ROUTES.APPOINTMENTS);

      return {
        success: "Agendamento atualizado com sucesso!",
      };
    } catch {
      throw new Error("Não foi possível atualizar o agendamento.");
    }
  });
