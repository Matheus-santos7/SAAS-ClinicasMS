import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }
  if (!session.user.plan) {
    redirect(ROUTES.SUBSCRIPTION);
  }
  if (!session.user.clinic) {
    redirect(ROUTES.CLINIC_FORM);
  }
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dentistas</PageTitle>
          <PageDescription>
            Gerencie os Dentistas da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
