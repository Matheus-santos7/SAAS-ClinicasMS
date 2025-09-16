"use server";

import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";

const schema = z.object({
  searchTerm: z.string().trim().min(1),
  searchType: z.enum(["name", "phone", "cpf"]),
});

export const searchPatients = protectedAction
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const { searchTerm, searchType } = parsedInput;

    // Constrói a condição de busca dinamicamente
    const searchCondition =
      searchType === "name"
        ? ilike(patientsTable.name, `%${searchTerm}%`)
        : searchType === "phone"
          ? ilike(
              patientsTable.phoneNumber,
              `%${searchTerm.replace(/\D/g, "")}%`,
            )
          : searchType === "cpf"
            ? ilike(patientsTable.cpf, `%${searchTerm.replace(/\D/g, "")}%`)
            : undefined;

    // Executa a busca no banco de dados já com o filtro
    const patients = await db.query.patientsTable.findMany({
      where: and(eq(patientsTable.clinicId, clinicId), searchCondition),
      limit: 50, // Opcional: Limita o número de resultados para evitar sobrecarga
    });

    return { data: patients };
  });
