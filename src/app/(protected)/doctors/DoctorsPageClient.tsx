"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import { AddResourceButton } from "@/app/(protected)/_components/AddResourceButton";
import { Dialog } from "@/components/ui/dialog";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import DoctorCard from "./_components/doctor-card";
import UpsertDoctorForm from "./_components/upsert-doctor-form";

interface DoctorsPageClientProps {
  doctors: (typeof import("@/db/schema").doctorsTable.$inferSelect)[];
}

export default function DoctorsPageClient({ doctors }: DoctorsPageClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Dentistas</PageTitle>
            <PageDescription>
              Gerencie os Dentistas da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddResourceButton
              label="Adicionar Médico"
              onClick={() => setIsDialogOpen(true)}
              icon={<UserPlus />}
            />
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <UpsertDoctorForm
          isOpen={isDialogOpen}
        />
      </Dialog>
    </>
  );
}
