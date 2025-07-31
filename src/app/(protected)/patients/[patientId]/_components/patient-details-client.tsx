// /app/patients/[patientId]/_components/patient-details-client.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  evolutionTable,
  patientsAnamnesisTable,
  patientsTable,
} from "@/db/schema";
import { doctorsTable } from "@/db/schema";

import { AnamnesisTab } from "./AnamnesisForm";
import { EvolutionTab } from "./evolution-tab";
import { DocumentsTab } from "./DocumentsTab";
import { PatientHeader } from "./PatientHeader";

// A tipagem que vem do servidor
type PatientWithDetails = typeof patientsTable.$inferSelect & {
  anamnesisForms: (typeof patientsAnamnesisTable.$inferSelect)[];
  evolutionEntries: (typeof evolutionTable.$inferSelect)[];
  doctorsTable: (typeof doctorsTable.$inferSelect)[];
};

interface PatientDetailsClientProps {
  initialData: PatientWithDetails;
}

const PatientDetailsClient = ({ initialData }: PatientDetailsClientProps) => {
  // A anamnese é geralmente uma só, então pegamos a primeira
  const currentAnamnesis = initialData.anamnesisForms[0];

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      <PatientHeader name={initialData.name} email={initialData.email} />

      <Tabs defaultValue="anamnesis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {/* A aba de dados pessoais agora é parte da anamnese ou pode ser uma aba separada se preferir */}
          <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
          <TabsTrigger value="evolution">Quadro de Evolução</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>{" "}
          {/* Aba extra sugerida */}
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
        <TabsContent value="documents" className="mt-6">
          <DocumentsTab patientId={initialData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetailsClient;
