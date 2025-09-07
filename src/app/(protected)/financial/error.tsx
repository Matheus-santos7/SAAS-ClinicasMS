"use client";
import ErrorComponent from "@/helpers/error";

export default function FinancialError({ error }: { error: Error }) {
  return (
    <ErrorComponent
      error={error}
      title="Erro ao carregar financeiro"
      description="Ocorreu um erro ao buscar os dados financeiros."
    />
  );
}
