"use server";

import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpdateAppointmentSchema,
  updateAppointmentSchema,
} from "./schema";

export const updateAppointment = protectedAction
  .schema(updateAppointmentSchema)
  .action(async ({ parsedInput }: { parsedInput: UpdateAppointmentSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const [startHour, startMinute] = parsedInput.startTime
      .split(":")
      .map((v) => parseInt(v, 10));
    const [endHour, endMinute] = parsedInput.endTime
      .split(":")
      .map((v) => parseInt(v, 10));

    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", startHour)
      .set("minute", startMinute)
      .set("second", 0)
      .toDate();

    const appointmentEndDate = dayjs(parsedInput.date)
      .set("hour", endHour)
      .set("minute", endMinute)
      .set("second", 0)
      .toDate();

    if (appointmentEndDate <= appointmentDateTime) {
      return {
        errorMessage: "Horário de término deve ser após o horário de início.",
      };
    }

    await db
      .update(appointmentsTable)
      .set({
        date: appointmentDateTime,
        endDate: appointmentEndDate,
        observations: parsedInput.observations ?? null,
        status: parsedInput.status ?? undefined,
      })
      .where(
        and(
          eq(appointmentsTable.id, parsedInput.id),
          eq(appointmentsTable.clinicId, clinicId),
        ),
      );

    revalidatePath(ROUTES.APPOINTMENTS);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true as const };
  });

