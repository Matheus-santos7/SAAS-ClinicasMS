"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, paymentsTable } from "@/db/schema";
import {
  getAppointmentPaidSumFromPayments,
  recalculateAppointmentPaidFromPayments,
} from "@/helpers/appointment-payments";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type RegisterReceivablePaymentSchema,
  registerReceivablePaymentSchema,
} from "./schema";

export const registerReceivablePayment = protectedAction
  .schema(registerReceivablePaymentSchema)
  .action(async ({ parsedInput }: { parsedInput: RegisterReceivablePaymentSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const appointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.id, parsedInput.appointmentId),
        isNull(appointmentsTable.deletedAt),
      ),
    });

    if (!appointment) {
      throw new Error("Atendimento não encontrado.");
    }
    if (!canAccessClinicResource(appointment.clinicId, clinicId)) {
      throw new Error("Acesso negado.");
    }
    if (appointment.status !== "completed") {
      throw new Error("Só é possível registrar pagamento em atendimentos concluídos.");
    }

    const paid = await getAppointmentPaidSumFromPayments(appointment.id);
    const remaining = appointment.appointmentPriceInCents - paid;
    if (remaining <= 0) {
      throw new Error("Este atendimento já está quitado.");
    }
    if (parsedInput.amountInCents > remaining) {
      throw new Error(
        `O valor informado excede o saldo em aberto (${(remaining / 100).toFixed(2)}).`,
      );
    }

    await db.transaction(async (tx) => {
      await tx.insert(paymentsTable).values({
        clinicId,
        appointmentId: appointment.id,
        amountInCents: parsedInput.amountInCents,
        paymentMethod: parsedInput.paymentMethod,
        notes: parsedInput.notes ?? null,
      });
    });

    await recalculateAppointmentPaidFromPayments(appointment.id);

    revalidatePath(ROUTES.FINANCIAL);
    revalidatePath(ROUTES.APPOINTMENTS);
    revalidatePath(ROUTES.DASHBOARD);
  });
