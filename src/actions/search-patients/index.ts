"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  searchTerm: z.string().trim().min(1),
  searchType: z.enum(["name", "phone", "cpf"]),
});

export const searchPatients = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    const { searchTerm, searchType } = parsedInput;

    const patients = await db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    });

    // Filtra os pacientes baseado no tipo de busca
    let filteredPatients = patients;

    if (searchType === "name") {
      filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } else if (searchType === "phone") {
      const cleanPhone = searchTerm.replace(/\D/g, "");
      filteredPatients = patients.filter((patient) =>
        patient.phoneNumber.replace(/\D/g, "").includes(cleanPhone),
      );
    } else if (searchType === "cpf") {
      const cleanCPF = searchTerm.replace(/\D/g, "");
      filteredPatients = patients.filter(
        (patient) =>
          patient.cpf && patient.cpf.replace(/\D/g, "").includes(cleanCPF),
      );
    }

    return { data: filteredPatients };
  });
