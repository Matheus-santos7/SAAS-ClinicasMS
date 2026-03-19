"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { registerAppointmentPayment } from "@/actions/financial/register-appointment-payment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { formatCurrencyInCents } from "@/helpers/currency";
import { NumericFormat } from "react-number-format";

const formSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Valor é obrigatório." })
    .refine(
      (value) => {
        const normalized = value.replace(/\./g, "").replace(",", ".");
        const num = Number.parseFloat(normalized);
        return !Number.isNaN(num) && num > 0;
      },
      { message: "Informe um valor maior que zero." },
    ),
  method: z.enum(["pix", "cash", "credit_card", "debit_card", "bank_transfer"], {
    required_error: "Forma de pagamento é obrigatória.",
  }),
  paymentDate: z.date({
    required_error: "Data de pagamento é obrigatória.",
  }),
  notes: z
    .string()
    .max(500, { message: "Observações deve ter no máximo 500 caracteres." })
    .optional()
    .nullable(),
});

type RegisterPaymentFormValues = z.infer<typeof formSchema>;

interface RegisterPaymentDialogProps {
  appointmentId: string;
  defaultAmountInCents: number;
}

export function RegisterPaymentDialog({
  appointmentId,
  defaultAmountInCents,
}: RegisterPaymentDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RegisterPaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: (defaultAmountInCents / 100).toFixed(2).replace(".", ","),
      method: "cash",
      paymentDate: dayjs().toDate(),
      notes: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const registerPaymentAction = useAction(registerAppointmentPayment, {
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso.");
      setOpen(false);
    },
    onError: (error) => {
      const anyError = error as any;
      const message =
        anyError.serverError ||
        anyError.error?.serverError ||
        anyError.fetchError ||
        anyError.message ||
        "Erro ao registrar pagamento.";
      toast.error(message);
    },
  });

  const onSubmit = async (values: RegisterPaymentFormValues) => {
    const normalized = values.amount.replace(/\./g, "").replace(",", ".");
    const num = Number.parseFloat(normalized);
    const amountInCents = Math.round(num * 100);

    registerPaymentAction.execute({
      appointmentId,
      amountInCents,
      method: values.method,
      paymentDate: values.paymentDate,
      notes: values.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Registrar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            Informe os detalhes do pagamento recebido para esta consulta
            concluída.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor pago</FormLabel>
                  <FormControl>
                    <NumericFormat
                      value={field.value ?? ""}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      allowNegative={false}
                      placeholder="0,00"
                      customInput={Input}
                      onValueChange={(values) => {
                        field.onChange(values.formattedValue);
                      }}
                    />
                  </FormControl>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    Valor previsto da consulta:{" "}
                    {formatCurrencyInCents(defaultAmountInCents)}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de débito</SelectItem>
                      <SelectItem value="bank_transfer">
                        Transferência bancária
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do pagamento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? dayjs(field.value).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? dayjs(e.target.value).toDate()
                            : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ex.: desconto aplicado, parcelamento, observações gerais."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar pagamento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

