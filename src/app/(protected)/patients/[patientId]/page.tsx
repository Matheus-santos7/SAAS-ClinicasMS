// app/patients/[patientId]/page.tsx

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { budgetsTable, patientsTable, treatmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import PatientDetailsClient from "./_components/patient/patient-details-client";

// ...existing code...
const PatientDetailsPage = async ({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) => {
  const { patientId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect(ROUTES.LOGIN);
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
    return redirect(ROUTES.PATIENTS);
  }

  // Buscar budgets do paciente
  const budgets = await db.query.budgetsTable.findMany({
    where: eq(budgetsTable.patientId, patientId),
    with: {
      doctor: true,
      items: true,
      clinic: true,
      treatment: true,
    },
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  });

  // Buscar treatments do paciente
  const treatments = await db.query.treatmentsTable.findMany({
    where: eq(treatmentsTable.patientId, patientId),
    with: {
      payments: true,
      clinic: true,
      budget: true,
    },
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  });

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
        budgets,
        treatments,
      }}
    />
  );
};

export default PatientDetailsPage;
