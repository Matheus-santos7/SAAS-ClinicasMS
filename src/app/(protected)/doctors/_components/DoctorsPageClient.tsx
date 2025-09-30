"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
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

import DoctorCard from "./doctor-card";
import UpsertDoctorForm from "./upsert-doctor-form";

interface DoctorsPageClientProps {
  doctors: (typeof import("@/db/schema").doctorsTable.$inferSelect)[];
}

export default function DoctorsPageClient({ doctors }: DoctorsPageClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    router.refresh(); // Atualiza a página para mostrar o novo médico
  };

  return (
    <>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle className="text-xl sm:text-2xl">Dentistas</PageTitle>
            <PageDescription className="text-sm sm:text-base">
              Gerencie os dentistas da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddResourceButton
              label="Adicionar Médico"
              onClick={() => setIsDialogOpen(true)}
              icon={<UserPlus className="h-4 w-4" />}
            />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
          {doctors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-muted-foreground mb-4">
                <UserPlus className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                Nenhum médico cadastrado
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Adicione seu primeiro médico para começar a gerenciar consultas
              </p>
              <AddResourceButton
                label="Adicionar Primeiro Médico"
                onClick={() => setIsDialogOpen(true)}
                icon={<UserPlus />}
              />
            </div>
          )}
        </PageContent>
      </PageContainer>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <UpsertDoctorForm isOpen={isDialogOpen} onSuccess={handleSuccess} />
      </Dialog>
    </>
  );
}
