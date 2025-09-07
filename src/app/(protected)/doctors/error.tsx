"use client";
import ErrorComponent from "@/helpers/error";

export default function DoctorsError({ error }: { error: Error }) {
  return (
    <ErrorComponent
      error={error}
      title="Erro ao carregar dentistas"
      description="Ocorreu um erro ao buscar os dados dos dentistas."
    />
  );
}
