import { and, count, eq, ilike, or } from "drizzle-orm";

import { APP_CONFIG } from "@/constants/config";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";

export async function getPatients(
  clinicId: string,
  page?: number,
  search?: string,
) {
  const itemsPerPage = APP_CONFIG.PAGINATION.PATIENTS_PER_PAGE;

  const whereCondition = and(
    eq(patientsTable.clinicId, clinicId),
    search
      ? or(
          ilike(patientsTable.name, `%${search}%`),
          ilike(patientsTable.cpf, `%${search}%`),
        )
      : undefined,
  );

  // Se não há paginação, retorna todos os pacientes da clínica
  if (page === undefined) {
    const patients = await db.query.patientsTable.findMany({
      where: whereCondition,
      orderBy: (patients, { desc }) => [desc(patients.createdAt)],
    });

    return { patients, pageCount: 1 };
  }

  // Com paginação
  const [patients, totalPatientsResult] = await Promise.all([
    db.query.patientsTable.findMany({
      where: whereCondition,
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      orderBy: (patients, { desc }) => [desc(patients.createdAt)],
    }),
    db.select({ total: count() }).from(patientsTable).where(whereCondition),
  ]);

  const pageCount = Math.ceil(
    (totalPatientsResult[0]?.total ?? 0) / itemsPerPage,
  );

  return { patients, pageCount };
}

export async function getPatientById(patientId: string, clinicId: string) {
  const patient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.id, patientId),
      eq(patientsTable.clinicId, clinicId),
    ),
  });

  return patient;
}
