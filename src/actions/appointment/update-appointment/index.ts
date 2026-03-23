"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, clinicProceduresTable } from "@/db/schema";
import { getAppointmentPaidSumFromPayments } from "@/helpers/appointment-payments";
import { parseReaisToCents } from "@/helpers/currency";
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

    const existing = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.id, parsedInput.id),
        eq(appointmentsTable.clinicId, clinicId),
        isNull(appointmentsTable.deletedAt),
      ),
    });

    if (!existing) {
      throw new Error("Agendamento não encontrado.");
    }

    const procedureId =
      parsedInput.clinicProcedureId === undefined
        ? existing.clinicProcedureId
        : parsedInput.clinicProcedureId === ""
          ? null
          : parsedInput.clinicProcedureId;

    const rawPrice = parseReaisToCents(parsedInput.appointmentPriceReais);
    if (rawPrice < 0) {
      return { errorMessage: "Valor da consulta inválido." };
    }

    if (procedureId) {
      const proc = await db.query.clinicProceduresTable.findFirst({
        where: and(
          eq(clinicProceduresTable.id, procedureId),
          eq(clinicProceduresTable.clinicId, clinicId),
          isNull(clinicProceduresTable.deletedAt),
        ),
      });
      if (!proc) {
        throw new Error("Tipo de tratamento não encontrado.");
      }
    }

    const paidSum = await getAppointmentPaidSumFromPayments(parsedInput.id);
    const appointmentPriceInCents = Math.max(rawPrice, paidSum);

    await db
      .update(appointmentsTable)
      .set({
        date: appointmentDateTime,
        endDate: appointmentEndDate,
        observations: parsedInput.observations ?? null,
        status: parsedInput.status ?? undefined,
        clinicProcedureId: procedureId,
        appointmentPriceInCents,
      })
      .where(
        and(
          eq(appointmentsTable.id, parsedInput.id),
          eq(appointmentsTable.clinicId, clinicId),
        ),
      );

    revalidatePath(ROUTES.APPOINTMENTS);
    revalidatePath(ROUTES.DASHBOARD);
    revalidatePath(ROUTES.FINANCIAL);

    return { success: true as const };
  });

