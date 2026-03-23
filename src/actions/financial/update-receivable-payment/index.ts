"use server";

import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, paymentsTable } from "@/db/schema";
import { recalculateAppointmentPaidFromPayments } from "@/helpers/appointment-payments";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpdateReceivablePaymentSchema,
  updateReceivablePaymentSchema,
} from "./schema";

export const updateReceivablePayment = protectedAction
  .schema(updateReceivablePaymentSchema)
  .action(async ({ parsedInput }: { parsedInput: UpdateReceivablePaymentSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const payment = await db.query.paymentsTable.findFirst({
      where: and(
        eq(paymentsTable.id, parsedInput.paymentId),
        isNull(paymentsTable.deletedAt),
      ),
    });

    if (!payment?.appointmentId) {
      throw new Error("Pagamento não encontrado ou não vinculado a agendamento.");
    }
    if (!canAccessClinicResource(payment.clinicId, clinicId)) {
      throw new Error("Acesso negado.");
    }

    const appointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.id, payment.appointmentId),
        isNull(appointmentsTable.deletedAt),
      ),
    });

    if (!appointment || appointment.status !== "completed") {
      throw new Error("Agendamento inválido.");
    }

    const [othersRow] = await db
      .select({
        sum: sql<number>`coalesce(sum(${paymentsTable.amountInCents}), 0)::bigint`,
      })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.appointmentId, appointment.id),
          isNull(paymentsTable.deletedAt),
          ne(paymentsTable.id, payment.id),
        ),
      );

    const othersSum = Number(othersRow?.sum ?? 0);
    const newTotal = othersSum + parsedInput.amountInCents;
    if (newTotal > appointment.appointmentPriceInCents) {
      throw new Error(
        "A soma dos pagamentos não pode ultrapassar o valor total da consulta.",
      );
    }

    await db
      .update(paymentsTable)
      .set({
        amountInCents: parsedInput.amountInCents,
        paymentMethod: parsedInput.paymentMethod,
        notes: parsedInput.notes ?? null,
        paymentDate: parsedInput.paymentDate,
      })
      .where(eq(paymentsTable.id, payment.id));

    await recalculateAppointmentPaidFromPayments(appointment.id);

    revalidatePath(ROUTES.FINANCIAL);
    revalidatePath(ROUTES.APPOINTMENTS);
    revalidatePath(ROUTES.DASHBOARD);
  });
