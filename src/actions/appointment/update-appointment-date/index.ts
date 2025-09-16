"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getSessionOrThrow } from "@/helpers/session";
import { ROUTES } from "@/lib/routes";
import { safeAction } from "@/lib/safe-action";

import { updateAppointmentDateSchema } from "./schema";

export const updateAppointmentDate = safeAction(
  updateAppointmentDateSchema,
  async ({ parsedInput }) => {
    const { id, date } = parsedInput;
    const session = await getSessionOrThrow();
    const user = session.user;

    if (!user) {
      return {
        error: "Não autenticado",
      };
    }

    try {
      if (!user.clinic || !user.clinic.id) {
        return {
          error: "Usuário sem clínica associada.",
        };
      }
      await db
        .update(appointmentsTable)
        .set({ date })
        .where(
          and(
            eq(appointmentsTable.id, id),
            eq(appointmentsTable.clinicId, user.clinic.id),
          ),
        );

      revalidatePath(ROUTES.APPOINTMENTS);

      return {
        success: "Agendamento reagendado com sucesso!",
      };
    } catch {
      return {
        error: "Não foi possível reagendar o agendamento.",
      };
    }
  },
);
