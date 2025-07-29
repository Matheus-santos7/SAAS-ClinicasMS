// app/patients/[patientId]/page.tsx

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth"; // Supondo que você use a mesma autenticação

import PatientDetailsClient from "./_components/patient-details-client";

interface PatientDetailsPageProps {
  params: {
    patientId: string;
  };
}

const PatientDetailsPage = async ({ params }: PatientDetailsPageProps) => {
  const { patientId } = params;
  const session = await auth.api.getSession({
    headers: await headers(),
  }); // Adapte se necessário
  if (!session?.user) {
    redirect("/authentication");
  }

  // Busca o paciente e todos os seus dados relacionados em uma única query
  const patientData = await db.query.patientsTable.findFirst({
    where: eq(patientsTable.id, patientId),
    with: {
      anamnesisForms: {
        orderBy: (forms, { desc }) => [desc(forms.createdAt)],
      },
      evolutionEntries: {
        orderBy: (entries, { desc }) => [desc(entries.createdAt)],
      },
    },
  });

  if (!patientData) {
    // Se o paciente não for encontrado, talvez redirecionar para uma página 404
    return redirect("/patients");
  }

  // Aqui você pode adicionar uma verificação se o paciente pertence à clínica do usuário logado
  // if (patientData.clinicId !== session.user.clinic.id) { ... }

  return <PatientDetailsClient initialData={patientData} />;
};

export default PatientDetailsPage;
