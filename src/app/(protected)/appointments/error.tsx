"use client";
import ErrorComponent from "@/helpers/error";

export default function AppointmentsError({ error }: { error: Error }) {
  return (
    <ErrorComponent
      error={error}
      title="Erro ao carregar agendamentos"
      description="Ocorreu um erro ao buscar os dados dos agendamentos."
    />
  );
}
