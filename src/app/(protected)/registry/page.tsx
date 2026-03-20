import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  getClinicProcedures,
  getExpenseTypesWithVendor,
  getVendors,
} from "@/data/registry";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import { RegistryPageClient } from "./_components/registry-page-client";

export default async function RegistryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  const clinicId = session.user.clinic.id;

  const [procedures, expenseTypes, vendors] = await Promise.all([
    getClinicProcedures(clinicId),
    getExpenseTypesWithVendor(clinicId),
    getVendors(clinicId),
  ]);

  return (
    <RegistryPageClient
      procedures={procedures}
      expenseTypes={expenseTypes}
      vendors={vendors}
    />
  );
}
