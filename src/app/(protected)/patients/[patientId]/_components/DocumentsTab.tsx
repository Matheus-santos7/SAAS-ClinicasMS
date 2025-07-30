"use client";

interface DocumentsTabProps {
  patientId: string;
}

export const DocumentsTab = ({ patientId }: DocumentsTabProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Documentos do Paciente</h2>
      <p>
        Área para visualizar todos os documentos do paciente (de anamnese e
        evolução). Em breve!
      </p>
    </div>
  );
};
