"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { protectedAction } from "@/lib/next-safe-action";
import type { Patient } from "@/types";

const schema = z.object({
  searchTerm: z.string().trim().min(1),
  searchType: z.enum(["name", "phone", "cpf"]),
});

export const searchPatients = protectedAction
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const clinicId = (ctx as { clinicId?: string })?.clinicId;
    if (!clinicId) throw new Error("Clínica não encontrada no contexto");
    const patients: Patient[] = await db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, clinicId),
    });

    let filteredPatients = patients;
    const { searchTerm, searchType } = parsedInput;

    if (searchType === "name") {
      filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } else if (searchType === "phone") {
      filteredPatients = patients.filter((patient) =>
        patient.phoneNumber
          .replace(/\D/g, "")
          .includes(searchTerm.replace(/\D/g, "")),
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
