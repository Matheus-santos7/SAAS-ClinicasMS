"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { upsertEvolution } from "@/actions/patients/evolution/upsert-evolution/index";
import { upsertEvolutionSchema } from "@/actions/patients/evolution/upsert-evolution/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { evolutionTable } from "@/db/schema";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof upsertEvolutionSchema>;
type EvolutionEntry = typeof evolutionTable.$inferSelect;

interface EvolutionEntryFormProps {
  patientId: string;
  initialData?: EvolutionEntry | null;
  onSuccess: () => void;
  doctors: Array<{ id: string; name: string }>; // Recebe a lista de médicos
}

export const EvolutionEntryForm = ({
  patientId,
  initialData,
  onSuccess,
  doctors, // A lista de médicos agora é uma prop
}: EvolutionEntryFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(upsertEvolutionSchema),
    defaultValues: {
      id: initialData?.id,
      patientId: patientId,
      doctorId: initialData?.doctorId ?? "", // Valor inicial para o médico
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      description: initialData?.description ?? "",
      observations: initialData?.observations ?? "",
    },
  });

  const { execute, isPending } = useAction(upsertEvolution, {
    onSuccess: (data) => {
      // Ajustado para o formato de retorno do `safeAction`
      if (data.data?.success) {
        toast.success(data.data.success);
      }
      onSuccess();
    },
    onError: (error) => {
      toast.error("Erro ao salvar", {
        description: error.error?.serverError ?? "Ocorreu um erro inesperado.",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  const isEditMode = !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo de Médico Adicionado */}
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico responsável</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                required
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de Data */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da evolução</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva a evolução do paciente"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? "Salvando..."
            : isEditMode
              ? "Salvar Alterações"
              : "Adicionar Evolução"}
        </Button>
      </form>
    </Form>
  );
};
