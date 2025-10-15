"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { getAvailableTimes } from "../../clinic/get-available-times";
import { type AddAppointmentSchema, addAppointmentSchema } from "./schema";

export const addAppointment = protectedAction
  .schema(addAppointmentSchema)
  .action(async ({ parsedInput }: { parsedInput: AddAppointmentSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    if (
      !canAccessClinicResource(
        session?.user.clinic?.id,
        session?.user.clinic?.id,
      )
    ) {
      throw new Error("Acesso negado à clínica");
    }
    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });
    if (!availableTimes?.data) {
      throw new Error("No available times");
    }
    const isTimeAvailable = availableTimes.data?.some(
      (time: { value: string; available: boolean }) =>
        time.value === parsedInput.startTime && time.available,
    );
    if (!isTimeAvailable) {
      throw new Error("Time not available");
    }
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

    // Buscar o preço do médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: (doctors, { eq }) => eq(doctors.id, parsedInput.doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      clinicId: clinicId,
      date: appointmentDateTime,
      endDate: appointmentEndDate,
      appointmentPriceInCents: doctor.appointmentPriceInCents,
    });

    revalidatePath(ROUTES.APPOINTMENTS);
    revalidatePath(ROUTES.DASHBOARD);
  });
