// app/patients/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPatients } from "@/data/patients";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import PatientsPageClient from "./_components/patients-page-client";

// Tipagem para os parâmetros da URL que vamos receber
const PatientsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  // Autenticação e validações
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  // Parâmetros de busca e paginação
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || "";

  // Busca os dados usando a função centralizada
  const { patients, pageCount } = await getPatients(
    session.user.clinic.id,
    page,
    search,
  );

  return (
    <PatientsPageClient initialPatients={patients} pageCount={pageCount} />
  );
};

export default PatientsPage;
