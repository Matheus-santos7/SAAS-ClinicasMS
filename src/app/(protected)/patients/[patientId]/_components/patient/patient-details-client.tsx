// /app/patients/[patientId]/_components/patient-details-client.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientWithDetails } from "@/types";

import { AnamnesisTab } from "../AnamnesisForm";
import { DocumentsTab } from "../DocumentsTab";
import { EvolutionTab } from "../evolution/evolution-tab";
import { FinancialTab } from "../financialTab";
import { PatientHeader } from "../PatientHeader";

interface PatientDetailsClientProps {
  initialData: PatientWithDetails;
}

const PatientDetailsClient = ({ initialData }: PatientDetailsClientProps) => {
  const currentAnamnesis = initialData.anamnesisForms[0];

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      <PatientHeader name={initialData.name} email={initialData.email} />

      <Tabs defaultValue="anamnesis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
          <TabsTrigger value="evolution">Quadro de Evolução</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="anamnesis" className="mt-6">
          <AnamnesisTab
            patientId={initialData.id}
            anamnesis={currentAnamnesis}
            doctors={initialData.doctorsTable}
          />
        </TabsContent>
        <TabsContent value="evolution" className="mt-6">
          <EvolutionTab
            patientId={initialData.id}
            evolutionEntries={initialData.evolutionEntries}
            doctors={initialData.doctorsTable}
          />
        </TabsContent>
        <TabsContent value="financial" className="mt-6">
          <FinancialTab
            patientId={initialData.id}
            budgets={initialData.budgets.map((budget) => ({
              id: budget.id,
              totalAmountInCents: budget.totalAmountInCents,
              createdAt: budget.createdAt,
              doctor: { name: budget.doctor?.name ?? "Desconhecido" },
              status: budget.status,
            }))}
            treatments={initialData.treatments}
            doctors={initialData.doctorsTable}
          />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentsTab patientId={initialData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetailsClient;
