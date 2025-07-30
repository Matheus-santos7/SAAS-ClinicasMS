// /app/patients/[patientId]/_components/anamnesis-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks"; // CORREÇÃO: Importação correta
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAnamnesis } from "@/actions/upsert-anamnesis"; // Corrigido o caminho da action
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { patientsAnamnesisTable } from "@/db/schema";

// Schema de validação completo para a anamnese
const anamnesisSchema = z.object({
  // Mapeando todos os campos da tabela
  reasonConsultation: z.string().optional(),
  systemicDiseases: z.string().optional(),
  medicationUsage: z.string().optional(),
  allergies: z.string().optional(),
  previousSurgeries: z.string().optional(),
  habits: z.string().optional(),
  oralHygiene: z.string().optional(),
  previousDentalProblems: z.string().optional(),
  currentTreatment: z.string().optional(),
  familyHistory: z.string().optional(),
  mentalConditions: z.string().optional(),
  observations: z.string().optional(),

  // Campos booleanos
  hasAllergies: z.boolean(),
  usesMedication: z.boolean(),
  hadPreviousSurgeries: z.boolean(),
  smokes: z.boolean(),
  drinksAlcohol: z.boolean(),
  isPregnant: z.boolean(),
});

type AnamnesisFormValues = z.infer<typeof anamnesisSchema>;

interface AnamnesisFormProps {
  patientId: string;
  doctorId: string; // Adicionado para passar para a action
  anamnesis?: typeof patientsAnamnesisTable.$inferSelect;
}

export const AnamnesisForm = ({
  patientId,
  doctorId,
  anamnesis,
}: AnamnesisFormProps) => {
  const form = useForm<AnamnesisFormValues>({
    resolver: zodResolver(anamnesisSchema),
    // Valores padrão para todos os campos
    defaultValues: {
      reasonConsultation: anamnesis?.reasonConsultation ?? "",
      systemicDiseases: anamnesis?.systemicDiseases ?? "",
      medicationUsage: anamnesis?.medicationUsage ?? "",
      allergies: anamnesis?.allergies ?? "",
      previousSurgeries: anamnesis?.previousSurgeries ?? "",
      habits: anamnesis?.habits ?? "",
      oralHygiene: anamnesis?.oralHygiene ?? "",
      previousDentalProblems: anamnesis?.previousDentalProblems ?? "",
      currentTreatment: anamnesis?.currentTreatment ?? "",
      familyHistory: anamnesis?.familyHistory ?? "",
      mentalConditions: anamnesis?.mentalConditions ?? "",
      observations: anamnesis?.observations ?? "",
      hasAllergies: anamnesis?.hasAllergies ?? false,
      usesMedication: anamnesis?.usesMedication ?? false,
      hadPreviousSurgeries: anamnesis?.hadPreviousSurgeries ?? false,
      smokes: anamnesis?.smokes ?? false,
      drinksAlcohol: anamnesis?.drinksAlcohol ?? false,
      isPregnant: anamnesis?.isPregnant ?? false,
    },
  });

  const { execute, isPending } = useAction(upsertAnamnesis, {
    onSuccess: () => toast.success("Anamnese salva com sucesso!"),
    onError: (error) =>
      toast.error(typeof error?.error?.serverError === "string" && error.error.serverError.length > 0 ? error.error.serverError : "Erro ao salvar anamnese."),
  });

  const onSubmit = (values: AnamnesisFormValues) => {
    execute({
      ...values,
      patientId: patientId,
      doctorId: doctorId,
      id: anamnesis?.id,
    });
  };

  // Função auxiliar para criar checkboxes
  const renderCheckbox = (name: keyof AnamnesisFormValues, label: string) => (
    <FormField<AnamnesisFormValues>
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-y-0 space-x-3">
          <FormControl>
            <Checkbox
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="font-normal">{label}</FormLabel>
        </FormItem>
      )}
    />
  );

  // Função auxiliar para criar textareas
  const renderTextarea = (
    name: keyof AnamnesisFormValues,
    label: string,
    placeholder: string,
  ) => (
    <FormField<AnamnesisFormValues>
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              value={typeof field.value === "string" ? field.value : ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ficha de Anamnese</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Coluna da Esquerda */}
              <div className="space-y-6">
                {renderTextarea(
                  "reasonConsultation",
                  "Motivo da Consulta",
                  "Descreva o motivo principal...",
                )}
                {renderTextarea(
                  "systemicDiseases",
                  "Doenças Sistêmicas",
                  "Ex: Diabetes, hipertensão...",
                )}
                {renderTextarea(
                  "previousSurgeries",
                  "Cirurgias Anteriores",
                  "Descreva cirurgias relevantes...",
                )}
                {renderTextarea(
                  "habits",
                  "Hábitos",
                  "Ex: Roer unhas, bruxismo...",
                )}
                {renderTextarea(
                  "oralHygiene",
                  "Higiene Bucal",
                  "Ex: Frequência de escovação, uso de fio dental...",
                )}
                {renderTextarea(
                  "previousDentalProblems",
                  "Problemas Dentários Anteriores",
                  "Ex: Cáries, tratamentos de canal...",
                )}
              </div>

              {/* Coluna da Direita */}
              <div className="space-y-6">
                {renderTextarea(
                  "currentTreatment",
                  "Tratamento Atual",
                  "Descreva tratamentos médicos ou odontológicos em andamento...",
                )}
                {renderTextarea(
                  "familyHistory",
                  "Histórico Familiar",
                  "Doenças relevantes na família...",
                )}
                {renderTextarea(
                  "mentalConditions",
                  "Condições Psicológicas",
                  "Ex: Ansiedade, depressão...",
                )}
                {renderTextarea(
                  "observations",
                  "Observações Gerais",
                  "Qualquer outra informação relevante...",
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-medium">Questionário Rápido</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {renderCheckbox("smokes", "É fumante?")}
                {renderCheckbox("drinksAlcohol", "Consome bebidas alcoólicas?")}
                {renderCheckbox("isPregnant", "Está grávida / suspeita?")}
                {renderCheckbox(
                  "hadPreviousSurgeries",
                  "Já realizou cirurgias?",
                )}
              </div>
            </div>

            {/* Campos Condicionais */}
            <div className="space-y-4">
              {renderCheckbox("hasAllergies", "Possui alguma alergia?")}
              {form.watch("hasAllergies") &&
                renderTextarea(
                  "allergies",
                  "Quais alergias?",
                  "Ex: Penicilina, camarão...",
                )}
            </div>

            <div className="space-y-4">
              {renderCheckbox(
                "usesMedication",
                "Utiliza alguma medicação contínua?",
              )}
              {form.watch("usesMedication") &&
                renderTextarea(
                  "medicationUsage",
                  "Quais medicações?",
                  "Ex: Losartana, Metformina...",
                )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Salvando..." : "Salvar Anamnese"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
