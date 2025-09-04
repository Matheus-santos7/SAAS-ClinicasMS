"use client";
import {
  PageContainer,
  PageContent,
  PageHeader,
} from "@/components/ui/page-container";

interface ErrorProps {
  error: Error;
  title?: string;
  description?: string;
}

export default function ErrorComponent({
  error,
  title,
  description,
}: ErrorProps) {
  return (
    <PageContainer>
      <PageHeader>
        <h2 className="text-destructive text-xl font-bold">
          {title || "Erro ao carregar dados"}
        </h2>
      </PageHeader>
      <PageContent>
        <div className="text-destructive">
          <p>{description || "Ocorreu um erro ao buscar os dados."}</p>
          <pre className="bg-destructive/10 mt-2 overflow-x-auto rounded p-2 text-xs">
            {error.message}
          </pre>
        </div>
      </PageContent>
    </PageContainer>
  );
}
