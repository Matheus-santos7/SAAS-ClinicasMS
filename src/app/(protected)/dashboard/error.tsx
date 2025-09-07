"use client";
import ErrorComponent from "@/helpers/error";

export default function DashboardError({ error }: { error: Error }) {
  return (
    <ErrorComponent
      error={error}
      title="Erro ao carregar o dashboard"
      description="Ocorreu um erro ao buscar os dados do dashboard."
    />
  );
}
