import { and, count, eq, ilike, or } from "drizzle-orm";

import { APP_CONFIG } from "@/constants/config";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";

export async function getDoctors(
  clinicId: string,
  page?: number,
  search?: string,
) {
  const itemsPerPage = APP_CONFIG.PAGINATION.DOCTORS_PER_PAGE;

  // Se não há paginação, retorna todos os médicos da clínica
  if (page === undefined) {
    const whereCondition = and(
      eq(doctorsTable.clinicId, clinicId),
      search
        ? or(
            ilike(doctorsTable.name, `%${search}%`),
            ilike(doctorsTable.specialty, `%${search}%`),
          )
        : undefined,
    );

    const doctors = await db.query.doctorsTable.findMany({
      where: whereCondition,
      orderBy: (doctors, { desc }) => [desc(doctors.createdAt)],
    });

    return { doctors, pageCount: 1 };
  }

  // Com paginação
  const whereCondition = and(
    eq(doctorsTable.clinicId, clinicId),
    search
      ? or(
          ilike(doctorsTable.name, `%${search}%`),
          ilike(doctorsTable.specialty, `%${search}%`),
        )
      : undefined,
  );

  const [doctors, totalDoctorsResult] = await Promise.all([
    db.query.doctorsTable.findMany({
      where: whereCondition,
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      orderBy: (doctors, { desc }) => [desc(doctors.createdAt)],
    }),
    db.select({ total: count() }).from(doctorsTable).where(whereCondition),
  ]);

  const pageCount = Math.ceil(
    (totalDoctorsResult[0]?.total ?? 0) / itemsPerPage,
  );

  return { doctors, pageCount };
}

export async function getDoctorById(doctorId: string, clinicId: string) {
  const doctor = await db.query.doctorsTable.findFirst({
    where: and(
      eq(doctorsTable.id, doctorId),
      eq(doctorsTable.clinicId, clinicId),
    ),
  });

  return doctor;
}
