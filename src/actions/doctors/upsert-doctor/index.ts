"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { type UpsertDoctorSchema, upsertDoctorSchema } from "./schema";

dayjs.extend(utc);

export const upsertDoctor = protectedAction
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }: { parsedInput: UpsertDoctorSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);
    // Convertendo o horário local para UTC antes de salvar no banco
    const availableFromTime = parsedInput.availableFromTime; // 15:30:00
    const availableToTime = parsedInput.availableToTime; // 16:00:00

    const availableFromTimeUTC = dayjs()
      .set("hour", parseInt(availableFromTime.split(":")[0]))
      .set("minute", parseInt(availableFromTime.split(":")[1]))
      .set("second", parseInt(availableFromTime.split(":")[2]))
      .utc();
    const availableToTimeUTC = dayjs()
      .set("hour", parseInt(availableToTime.split(":")[0]))
      .set("minute", parseInt(availableToTime.split(":")[1]))
      .set("second", parseInt(availableToTime.split(":")[2]))
      .utc();

    await db
      .insert(doctorsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId,
        availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
        availableToTime: availableToTimeUTC.format("HH:mm:ss"),
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
          availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
          availableToTime: availableToTimeUTC.format("HH:mm:ss"),
        },
      });
    revalidatePath(ROUTES.DOCTORS);
  });
