import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import { getDoctors } from "@/data/doctors";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import DoctorsPageClient from "./_components/DoctorsPageClient";

export default async function DoctorsPage() {
  // Autenticação e validações
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  // Busca todos os médicos da clínica (sem paginação por enquanto)
  const { doctors } = await getDoctors(session.user.clinic.id);

  return <DoctorsPageClient doctors={doctors} />;
}
