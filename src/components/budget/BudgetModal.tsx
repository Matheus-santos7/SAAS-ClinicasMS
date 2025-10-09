import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClinicBasic, DoctorBasic, Procedure } from "@/types";

// Schema de validação
const procedureSchema = z.object({
  name: z.string().min(1, "Nome do procedimento é obrigatório"),
  value: z.number().min(0.01, "Valor deve ser maior que 0"),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
});

const budgetFormSchema = z.object({
  doctorId: z.string().min(1, "Médico é obrigatório"),
  clinicId: z.string().min(1, "Clínica é obrigatória"),
  procedures: z
    .array(procedureSchema)
    .min(1, "Pelo menos um procedimento é obrigatório"),
  observations: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    patientId: string;
    doctorId: string;
    clinicId: string;
    procedures: Procedure[];
    total: number;
    observations: string;
  }) => void;
  doctors: DoctorBasic[];
  clinics: ClinicBasic[];
  patientId: string;
  initial?: {
    doctorId?: string;
    clinicId?: string;
    procedures?: Procedure[];
    total?: number;
    observations?: string;
  };
}

export function BudgetModal({
  open,
  onClose,
  onSubmit,
  doctors,
  clinics,
  patientId,
  initial,
}: BudgetModalProps) {
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      doctorId: initial?.doctorId || "",
      clinicId: initial?.clinicId || "",
      procedures: initial?.procedures || [{ name: "", value: 0, quantity: 1 }],
      observations: initial?.observations || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedures",
  });

  // Calcular total automaticamente quando procedures mudam
  const procedures = form.watch("procedures");
  const total = procedures.reduce(
    (sum, p) => sum + (p.value || 0) * (p.quantity || 1),
    0,
  );

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (open) {
      form.reset({
        doctorId: initial?.doctorId || "",
        clinicId: initial?.clinicId || "",
        procedures: initial?.procedures || [
          { name: "", value: 0, quantity: 1 },
        ],
        observations: initial?.observations || "",
      });
    }
  }, [open, initial, form]);

  const handleSubmit = (data: BudgetFormData) => {
    onSubmit({
      patientId,
      doctorId: data.doctorId,
      clinicId: data.clinicId,
      procedures: data.procedures,
      total,
      observations: data.observations || "",
    });
  };

  const addProcedure = () => {
    append({ name: "", value: 0, quantity: 1 });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Orçamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Médico */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um médico" />
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

              {/* Clínica */}
              <FormField
                control={form.control}
                name="clinicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clínica</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma clínica" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Procedimentos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-semibold">
                  Procedimentos
                </FormLabel>
                <Button
                  type="button"
                  onClick={addProcedure}
                  variant="outline"
                  size="sm"
                >
                  Adicionar Procedimento
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 items-end gap-2 rounded-lg border p-4 md:grid-cols-12"
                >
                  {/* Nome do Procedimento */}
                  <div className="md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`procedures.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Procedimento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Limpeza, Restauração..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Valor */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`procedures.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`procedures.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Botão Remover */}
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="w-full"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre o orçamento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total */}
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-muted-foreground text-sm">
                  Total do Orçamento
                </div>
                <div className="text-primary text-2xl font-bold">
                  R${" "}
                  {total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Orçamento</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
