"use client";
import ErrorComponent from "@/helpers/error";

export default function PatientsError({ error }: { error: Error }) {
  return (
    <ErrorComponent
      error={error}
      title="Erro ao carregar pacientes"
      description="Ocorreu um erro ao buscar os dados dos pacientes."
    />
  );
}
