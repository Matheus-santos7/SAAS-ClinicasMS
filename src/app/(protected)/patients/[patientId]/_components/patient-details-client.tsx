// app/patients/[patientId]/_components/patient-details-client.tsx

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patientsTable } from "@/db/schema";
// Supondo que você tenha os tipos inferidos para as novas tabelas
import { evolutionTable, patientsAnamnesisTable } from "@/db/schema";

import UpsertPatientForm from "../../_components/upsert-patient-form";

// Tipagem para os dados completos recebidos do servidor
type PatientWithDetails = typeof patientsTable.$inferSelect & {
  anamnesisForms: (typeof patientsAnamnesisTable.$inferSelect)[];
  evolutionEntries: (typeof evolutionTable.$inferSelect)[];
};

interface PatientDetailsClientProps {
  initialData: PatientWithDetails;
}

const PatientDetailsClient = ({ initialData }: PatientDetailsClientProps) => {
  // Aqui você pode criar estados para controlar os formulários de anamnese/evolução

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-2 text-2xl font-bold">
        Detalhes de: {initialData.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        Visualize e gerencie todas as informações do paciente em um só lugar.
      </p>

      <Tabs defaultValue="personal-data">
        <TabsList>
          <TabsTrigger value="personal-data">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="anamnesis">Fichas de Anamnese</TabsTrigger>
          <TabsTrigger value="evolution">Quadro de Evolução</TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS PESSOAIS (REUTILIZANDO O FORMULÁRIO) */}
        <TabsContent value="personal-data">
          <div className="mt-6">
            <UpsertPatientForm patient={initialData} isOpen={false} />
          </div>
        </TabsContent>

        {/* ABA 2: FICHAS DE ANAMNESE */}
        <TabsContent value="anamnesis">
          <div className="mt-6">
            {/* TODO: Criar componente para Adicionar e Listar Fichas */}
            <h2 className="text-xl font-semibold">Anamnese</h2>
            <p>
              Aqui você irá adicionar um formulário para criar uma nova ficha e
              listar as existentes.
            </p>
            {/* Exemplo de listagem: */}
            {initialData.anamnesisForms.map((form) => (
              <div key={form.id} className="mt-4 rounded-md border p-4">
                <p>
                  Ficha de{" "}
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleDateString()
                    : "Data desconhecida"}
                </p>
                {/* Renderize o conteúdo do form.content */}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ABA 3: QUADRO DE EVOLUÇÃO */}
        <TabsContent value="evolution">
          <div className="mt-6">
            {/* TODO: Criar componente para Adicionar e Listar Entradas */}
            <h2 className="text-xl font-semibold">Evolução</h2>
            <p>
              Aqui você irá adicionar um formulário para uma nova entrada e
              listar as existentes.
            </p>
            {initialData.evolutionEntries.map((entry) => (
              <div key={entry.id} className="mt-4 rounded-md border p-4">
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(entry.date).toLocaleString()}
                </p>
                <p>{entry.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetailsClient;
