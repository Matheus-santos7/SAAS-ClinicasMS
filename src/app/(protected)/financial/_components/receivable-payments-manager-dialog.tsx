"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteReceivablePayment } from "@/actions/financial/delete-receivable-payment";
import { updateReceivableFinancial } from "@/actions/financial/update-receivable-financial";
import { updateReceivablePayment } from "@/actions/financial/update-receivable-payment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_LABELS } from "@/constants/payment-methods";
import type { ReceivablePaymentRow, ReceivableRow } from "@/data/financial";
import { formatCurrencyInCents } from "@/helpers/currency";

function reaisToCents(reaisStr: string): number {
  const n = parseFloat(reaisStr.replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(n) || n < 0) return -1;
  return Math.round(n * 100);
}

function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const editTotalSchema = z.object({
  appointmentPriceReais: z
    .string()
    .min(1, { message: "Informe o valor total da consulta." }),
});

type EditTotalForm = z.infer<typeof editTotalSchema>;

const editPaymentSchema = z
  .object({
    amountReais: z.string().min(1, { message: "Informe o valor." }),
    paymentMethod: z.enum([
      "credit_card",
      "debit_card",
      "cash",
      "pix",
      "bank_transfer",
    ]),
    notes: z.string().max(2000).optional(),
    paymentDateLocal: z.string().min(1, { message: "Informe data e hora." }),
  })
  .superRefine((data, ctx) => {
    const c = reaisToCents(data.amountReais);
    if (c <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor inválido.",
        path: ["amountReais"],
      });
    }
  });

type EditPaymentForm = z.infer<typeof editPaymentSchema>;

const deletePaymentObservationSchema = z.object({
  observation: z
    .string()
    .trim()
    .min(1, { message: "Informe a observação." }),
});

type DeleteObservationForm = z.infer<typeof deletePaymentObservationSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: ReceivableRow | null;
  onSuccess: () => void;
  onRequestRegisterPayment: (row: ReceivableRow) => void;
};

export function ReceivablePaymentsManagerDialog({
  open,
  onOpenChange,
  receivable,
  onSuccess,
  onRequestRegisterPayment,
}: Props) {
  const totalForm = useForm<EditTotalForm>({
    resolver: zodResolver(editTotalSchema),
    defaultValues: { appointmentPriceReais: "" },
  });

  const paymentForm = useForm<EditPaymentForm>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      amountReais: "",
      paymentMethod: "pix",
      notes: "",
      paymentDateLocal: "",
    },
  });

  const deleteForm = useForm<DeleteObservationForm>({
    resolver: zodResolver(deletePaymentObservationSchema),
    defaultValues: { observation: "" },
  });

  const [editingPayment, setEditingPayment] =
    useState<ReceivablePaymentRow | null>(null);
  const [deletingPayment, setDeletingPayment] =
    useState<ReceivablePaymentRow | null>(null);

  useEffect(() => {
    if (receivable && open) {
      totalForm.reset({
        appointmentPriceReais: centsToReaisInput(
          receivable.appointmentPriceInCents,
        ),
      });
    }
  }, [receivable, open, totalForm]);

  const updateTotal = useAction(updateReceivableFinancial, {
    onSuccess: () => {
      toast.success("Valor total atualizado.");
      onSuccess();
    },
    onError: (ctx) => {
      toast.error(ctx.error.serverError ?? "Não foi possível salvar.");
    },
  });

  const updatePayment = useAction(updateReceivablePayment, {
    onSuccess: () => {
      toast.success("Pagamento atualizado.");
      setEditingPayment(null);
      paymentForm.reset();
      onSuccess();
    },
    onError: (ctx) => {
      toast.error(ctx.error.serverError ?? "Não foi possível salvar.");
    },
  });

  const removePayment = useAction(deleteReceivablePayment, {
    onSuccess: () => {
      toast.success("Pagamento excluído.");
      setDeletingPayment(null);
      deleteForm.reset();
      onSuccess();
    },
    onError: (ctx) => {
      toast.error(ctx.error.serverError ?? "Não foi possível excluir.");
    },
  });

  const onSubmitTotal = (values: EditTotalForm) => {
    if (!receivable) return;
    const cents = reaisToCents(values.appointmentPriceReais);
    if (cents < 0) return;
    updateTotal.execute({
      appointmentId: receivable.id,
      appointmentPriceInCents: cents,
    });
  };

  const openEditPayment = (p: ReceivablePaymentRow) => {
    setEditingPayment(p);
    paymentForm.reset({
      amountReais: centsToReaisInput(p.amountInCents),
      paymentMethod: p.paymentMethod as EditPaymentForm["paymentMethod"],
      notes: p.notes ?? "",
      paymentDateLocal: dayjs(p.paymentDate).format("YYYY-MM-DDTHH:mm"),
    });
  };

  const onSubmitEditPayment = (values: EditPaymentForm) => {
    if (!editingPayment) return;
    const cents = reaisToCents(values.amountReais);
    if (cents <= 0) return;
    updatePayment.execute({
      paymentId: editingPayment.id,
      amountInCents: cents,
      paymentMethod: values.paymentMethod,
      notes: values.notes?.trim() || null,
      paymentDate: new Date(values.paymentDateLocal),
    });
  };

  const onConfirmDeletePayment = (values: DeleteObservationForm) => {
    if (!deletingPayment) return;
    removePayment.execute({
      paymentId: deletingPayment.id,
      observation: values.observation,
    });
  };

  if (!receivable) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestão de pagamentos</DialogTitle>
            <DialogDescription>
              {receivable.patientName} ·{" "}
              {dayjs(receivable.date).format("DD/MM/YYYY HH:mm")}. Edite o valor
              total, os lançamentos ou exclua com observação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-medium">Valor total da consulta</h4>
              <Form {...totalForm}>
                <form
                  onSubmit={totalForm.handleSubmit(onSubmitTotal)}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <FormField
                    control={totalForm.control}
                    name="appointmentPriceReais"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="sr-only">Valor total (R$)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            inputMode="decimal"
                            placeholder="0,00"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateTotal.status === "executing"}
                  >
                    Salvar total
                  </Button>
                </form>
              </Form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-medium">Lançamentos</h4>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-1"
                onClick={() => {
                  onOpenChange(false);
                  onRequestRegisterPayment(receivable);
                }}
              >
                <Plus className="size-4" />
                Registrar pagamento
              </Button>
            </div>

            {receivable.payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum pagamento registrado. Use &quot;Registrar pagamento&quot; para
                lançar.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Valor</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="hidden md:table-cell">Obs.</TableHead>
                      <TableHead className="w-[88px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivable.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="tabular-nums text-sm">
                          {formatCurrencyInCents(p.amountInCents)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {PAYMENT_METHOD_LABELS[
                            p.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                          ] ?? p.paymentMethod}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {dayjs(p.paymentDate).format("DD/MM/YYYY HH:mm")}
                        </TableCell>
                        <TableCell className="hidden max-w-[140px] truncate text-sm md:table-cell">
                          {p.notes ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditPayment(p)}
                            aria-label="Editar pagamento"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => {
                              setDeletingPayment(p);
                              deleteForm.reset({ observation: "" });
                            }}
                            aria-label="Excluir pagamento"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingPayment}
        onOpenChange={(o) => {
          if (!o) setEditingPayment(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar pagamento</DialogTitle>
          </DialogHeader>
          <Form {...paymentForm}>
            <form
              onSubmit={paymentForm.handleSubmit(onSubmitEditPayment)}
              className="space-y-4"
            >
              <FormField
                control={paymentForm.control}
                name="amountReais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="decimal"
                        placeholder="0,00"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          Object.keys(
                            PAYMENT_METHOD_LABELS,
                          ) as Array<keyof typeof PAYMENT_METHOD_LABELS>
                        ).map((key) => (
                          <SelectItem key={key} value={key}>
                            {PAYMENT_METHOD_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentDateLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e hora</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPayment(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updatePayment.status === "executing"}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingPayment}
        onOpenChange={(o) => {
          if (!o) setDeletingPayment(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir pagamento</DialogTitle>
            <DialogDescription>
              Informe uma observação (ficará registrada no prontuário do agendamento).
            </DialogDescription>
          </DialogHeader>
          <Form {...deleteForm}>
            <form
              onSubmit={deleteForm.handleSubmit(onConfirmDeletePayment)}
              className="space-y-4"
            >
              <FormField
                control={deleteForm.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Motivo da exclusão" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingPayment(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={removePayment.status === "executing"}
                >
                  Excluir
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
