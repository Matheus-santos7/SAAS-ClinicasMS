// app/patients/page.tsx

import { and, count, eq, ilike, or } from "drizzle-orm"; // Adicione and, count, or, ilike
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { APP_CONFIG } from "@/constants/config";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import PatientsPageClient from "./_components/patients-page-client";

// Tipagem para os parâmetros da URL que vamos receber
// ...existing code...
const PatientsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  // ... (toda a lógica de autenticação permanece a mesma)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  // --- LÓGICA DE PAGINAÇÃO E BUSCA ---

  // Aguarda os searchParams antes de usar suas propriedades
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const itemsPerPage = APP_CONFIG.PAGINATION.PATIENTS_PER_PAGE;

  // Cria a condição de busca (WHERE)
  const whereCondition = and(
    eq(patientsTable.clinicId, session.user.clinic.id),
    // Se houver um termo de busca, filtre por nome OU CPF
    search
      ? or(
          ilike(patientsTable.name, `%${search}%`),
          ilike(patientsTable.cpf, `%${search}%`),
        )
      : undefined,
  );

  // 1. Busca os pacientes da página atual
  const patients = await db.query.patientsTable.findMany({
    where: whereCondition,
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage, // Calcula o deslocamento
    orderBy: (patients, { desc }) => [desc(patients.createdAt)], // Opcional: ordenar
  });

  // 2. Busca a contagem total de pacientes que correspondem à busca
  const totalPatientsResult = await db
    .select({ total: count() })
    .from(patientsTable)
    .where(whereCondition);

  const totalPatients = totalPatientsResult[0]?.total ?? 0;
  const pageCount = Math.ceil(totalPatients / itemsPerPage);

  // Passa os dados e a contagem de páginas para o cliente
  return (
    <PatientsPageClient initialPatients={patients} pageCount={pageCount} />
  );
};

export default PatientsPage;
