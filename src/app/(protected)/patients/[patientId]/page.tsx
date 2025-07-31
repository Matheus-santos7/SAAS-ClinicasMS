// app/patients/[patientId]/page.tsx

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import PatientDetailsClient from "./_components/patient-details-client";

// ...existing code...
const PatientDetailsPage = async ({ params }: any) => {
  // CORREÇÃO APLICADA AQUI:
  const { patientId } = params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  const patientData = await db.query.patientsTable.findFirst({
    where: eq(patientsTable.id, patientId),
    with: {
      anamnesisForms: {
        orderBy: (forms, { desc }) => [desc(forms.createdAt)],
      },
      evolutionEntries: {
        orderBy: (entries, { desc }) => [desc(entries.createdAt)],
        with: {
          doctor: true,
        },
      },
      clinic: {
        with: {
          doctors: true,
        },
      },
    },
  });

  if (!patientData) {
    return redirect("/patients");
  }

  return (
    <PatientDetailsClient
      initialData={{
        ...patientData,
        doctorsTable: patientData.clinic?.doctors ?? [],
        evolutionEntries: (patientData.evolutionEntries ?? []).map((e) => ({
          date: e.date ?? null,
          id: e.id ?? "",
          createdAt: e.createdAt ?? null,
          updatedAt: e.updatedAt ?? null,
          description: e.description ?? "",
          patientId: e.patientId ?? "",
          doctorId: e.doctorId ?? "",
          observations: e.observations ?? "",
          doctor: e.doctor?.name ? { name: e.doctor.name } : { name: "" },
        })),
      }}
    />
  );
};

export default PatientDetailsPage;
