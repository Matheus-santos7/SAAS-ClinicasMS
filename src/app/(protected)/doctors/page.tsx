import { db } from "@/db";

import DoctorsPageClient from "./DoctorsPageClient";

export default async function DoctorsPage() {
  // TODO: buscar sessão e validar permissões se necessário
  // const session = await auth.api.getSession({});
  // if (!session?.user) { ... }
  // if (!session.user.plan) { ... }
  // if (!session.user.clinic) { ... }

  // Exemplo: buscar todos os médicos (ajuste para filtrar por clínica se necessário)
  const doctors = await db.query.doctorsTable.findMany();
  return <DoctorsPageClient doctors={doctors} />;
}
