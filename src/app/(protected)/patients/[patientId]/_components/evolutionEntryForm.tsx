"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { upsertEvolution } from "@/actions/upsert-evolution/index"; // Caminho atualizado
import { upsertEvolutionSchema } from "@/actions/upsert-evolution/schema"; // Schema importado
import type { z } from "zod";
import type { evolutionTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";

type FormValues = z.infer<typeof upsertEvolutionSchema>;
type EvolutionEntry = typeof evolutionTable.$inferSelect;

interface EvolutionEntryFormProps {
  patientId: string;
  initialData?: EvolutionEntry | null;
  onSuccess: () => void;
}

export const EvolutionEntryForm = ({ patientId, initialData, onSuccess }: EvolutionEntryFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(upsertEvolutionSchema),
    defaultValues: {
      id: initialData?.id,
      patientId: patientId,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      description: initialData?.description ?? "",
      observations: initialData?.observations ?? "",
    },
  });

  const { execute, isPending } = useAction(upsertEvolution, {
      onSuccess: (data) => {
        toast.success(
          typeof data.data === "string"
            ? data.data
            : "Evolução salva com sucesso!"
        );
        onSuccess();
      },
      onError: (error) => {
        toast.error("Erro ao salvar", { description: error.error.serverError });
      }
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  const isEditMode = !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... (os FormFields são exatamente os mesmos que você já tinha) ... */}
        {/* A única diferença é o botão de submit */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Adicionar Evolução"}
        </Button>
      </form>
    </Form>
  );
};