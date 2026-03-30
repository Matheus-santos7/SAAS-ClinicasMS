"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  ArrowUpCircle,
  Banknote,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createPayableExpense } from "@/actions/financial/create-payable-expense";
import { deletePayableExpense } from "@/actions/financial/delete-payable-expense";
import { deleteAllAppointmentPayments } from "@/actions/financial/delete-all-appointment-payments";
import { markPayablePaid } from "@/actions/financial/mark-payable-paid";
import { updatePayableExpense } from "@/actions/financial/update-payable-expense";
import { registerReceivablePayment } from "@/actions/financial/register-receivable-payment";
import { upsertExpenseType } from "@/actions/registry/upsert-expense-type";
import { expenseRecurrenceValues } from "@/actions/registry/upsert-expense-type/schema";
import { upsertVendor } from "@/actions/registry/upsert-vendor";
import { upsertVendorSchema } from "@/actions/registry/upsert-vendor/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  PageContainer,
  PageContent,
  PageDescription,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_LABELS } from "@/constants/payment-methods";
import type {
  FinancialSummary,
  PayableRow,
  ReceivableRow,
} from "@/data/financial";
import { formatCurrencyInCents } from "@/helpers/currency";
import { ROUTES } from "@/lib/routes";

import {
  FinancialPrivacyToggle,
  MaskedCurrency,
  useFinancialValuesVisibility,
} from "./financial-value-mask";
import { ReceivablePaymentsManagerDialog } from "./receivable-payments-manager-dialog";

function reaisToCents(reaisStr: string): number {
  const n = parseFloat(reaisStr.replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(n) || n < 0) return -1;
  return Math.round(n * 100);
}

function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const registerPaymentFormSchema = z
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
  })
  .superRefine((data, ctx) => {
    const cents = reaisToCents(data.amountReais);
    if (cents <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor inválido.",
        path: ["amountReais"],
      });
    }
  });

type RegisterPaymentFormValues = z.infer<typeof registerPaymentFormSchema>;

const deleteAllPaymentsFormSchema = z.object({
  observation: z.string().trim().min(1, { message: "Informe a observação." }),
});

type DeleteAllPaymentsFormValues = z.infer<typeof deleteAllPaymentsFormSchema>;

const createPayableFormSchema = z.object({
  description: z.string().trim().min(1, { message: "Descrição é obrigatória." }),
  amountReais: z.string().min(1, { message: "Informe o valor." }),
  expenseTypeId: z.string().uuid({
    message: "Selecione o tipo de despesa.",
  }),
  vendorId: z.string().optional(),
  dueDate: z.string().optional(),
});

type CreatePayableFormValues = z.infer<typeof createPayableFormSchema>;

type PayableModalState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; row: PayableRow };

type ExpenseTypeOption = { id: string; name: string };

type VendorOption = {
  id: string;
  name: string;
};

const RECURRENCE_LABELS: Record<(typeof expenseRecurrenceValues)[number], string> =
  {
    one_time: "Unica",
    weekly: "Semanal",
    monthly: "Mensal",
    quarterly: "Trimestral",
    yearly: "Anual",
  };

const quickExpenseTypeFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome e obrigatorio." }),
  recurrenceType: z.enum(expenseRecurrenceValues),
  notes: z.string().optional(),
  vendorId: z.string().optional(),
});

type QuickExpenseTypeFormValues = z.infer<typeof quickExpenseTypeFormSchema>;
type QuickVendorFormValues = z.infer<typeof upsertVendorSchema>;

function receivableSituation(
  r: ReceivableRow,
): "pendente" | "parcial" | "quitado" {
  if (r.remainingInCents <= 0) return "quitado";
  if (r.paidAmountInCents > 0) return "parcial";
  return "pendente";
}

interface FinancialPageClientProps {
  summary: FinancialSummary;
  receivables: ReceivableRow[];
  payablesOpen: PayableRow[];
  payablesPaid: PayableRow[];
  expenseTypes: ExpenseTypeOption[];
  vendors: VendorOption[];
}

export function FinancialPageClient({
  summary,
  receivables,
  payablesOpen,
  payablesPaid,
  expenseTypes,
  vendors,
}: FinancialPageClientProps) {
  const router = useRouter();
  const { visible, hydrated, toggle } = useFinancialValuesVisibility();

  const [financeTab, setFinanceTab] = useState<"receber" | "pagar">("receber");
  const [paymentTarget, setPaymentTarget] = useState<ReceivableRow | null>(null);
  const [manageReceivable, setManageReceivable] = useState<ReceivableRow | null>(
    null,
  );
  const [deleteAllTarget, setDeleteAllTarget] = useState<ReceivableRow | null>(
    null,
  );
  const [payableModal, setPayableModal] = useState<PayableModalState>({
    kind: "closed",
  });
  const [deletePayableTarget, setDeletePayableTarget] =
    useState<PayableRow | null>(null);
  const [quickExpenseTypeOpen, setQuickExpenseTypeOpen] = useState(false);
  const [quickVendorOpen, setQuickVendorOpen] = useState(false);

  const paymentForm = useForm<RegisterPaymentFormValues>({
    resolver: zodResolver(registerPaymentFormSchema),
    defaultValues: {
      amountReais: "",
      paymentMethod: "pix",
      notes: "",
    },
  });

  const deleteAllPaymentsForm = useForm<DeleteAllPaymentsFormValues>({
    resolver: zodResolver(deleteAllPaymentsFormSchema),
    defaultValues: { observation: "" },
  });

  const payableForm = useForm<CreatePayableFormValues>({
    resolver: zodResolver(createPayableFormSchema),
    defaultValues: {
      description: "",
      amountReais: "",
      expenseTypeId: expenseTypes[0]?.id ?? "",
      vendorId: "",
      dueDate: "",
    },
  });
  const quickExpenseTypeForm = useForm<QuickExpenseTypeFormValues>({
    resolver: zodResolver(quickExpenseTypeFormSchema),
    defaultValues: {
      name: "",
      recurrenceType: "monthly",
      notes: "",
      vendorId: "",
    },
  });
  const quickVendorForm = useForm<QuickVendorFormValues>({
    resolver: zodResolver(upsertVendorSchema),
    defaultValues: {
      name: "",
      contactInfo: "",
      notes: "",
    },
  });

  const registerPayment = useAction(registerReceivablePayment, {
    onSuccess: () => {
      toast.success("Pagamento registrado.");
      setPaymentTarget(null);
      paymentForm.reset();
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(
        ctx.error.serverError ?? "Não foi possível registrar o pagamento.",
      );
    },
  });

  const resetPayableFormForCreate = () => {
    payableForm.reset({
      description: "",
      amountReais: "",
      expenseTypeId: expenseTypes[0]?.id ?? "",
      vendorId: "",
      dueDate: "",
    });
  };

  const createPayable = useAction(createPayableExpense, {
    onSuccess: () => {
      toast.success("Despesa lançada em contas a pagar.");
      setPayableModal({ kind: "closed" });
      resetPayableFormForCreate();
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(
        ctx.error.serverError ?? "Não foi possível lançar a despesa.",
      );
    },
  });

  const updatePayable = useAction(updatePayableExpense, {
    onSuccess: () => {
      toast.success("Despesa atualizada.");
      setPayableModal({ kind: "closed" });
      resetPayableFormForCreate();
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(
        ctx.error.serverError ?? "Não foi possível atualizar a despesa.",
      );
    },
  });

  const deletePayable = useAction(deletePayableExpense, {
    onSuccess: () => {
      toast.success("Despesa excluída.");
      setDeletePayableTarget(null);
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(
        ctx.error.serverError ?? "Não foi possível excluir a despesa.",
      );
    },
  });

  const markPaid = useAction(markPayablePaid, {
    onSuccess: () => {
      toast.success("Despesa marcada como paga.");
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(ctx.error.serverError ?? "Não foi possível atualizar.");
    },
  });

  const deleteAllPayments = useAction(deleteAllAppointmentPayments, {
    onSuccess: () => {
      toast.success("Pagamentos excluídos.");
      setDeleteAllTarget(null);
      deleteAllPaymentsForm.reset();
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(
        ctx.error.serverError ?? "Não foi possível excluir os pagamentos.",
      );
    },
  });
  const createExpenseType = useAction(upsertExpenseType, {
    onSuccess: () => {
      toast.success("Tipo de despesa salvo.");
      setQuickExpenseTypeOpen(false);
      quickExpenseTypeForm.reset({
        name: "",
        recurrenceType: "monthly",
        notes: "",
        vendorId: "",
      });
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(ctx.error.serverError ?? "Nao foi possivel salvar o tipo.");
    },
  });
  const createVendor = useAction(upsertVendor, {
    onSuccess: () => {
      toast.success("Fornecedor salvo.");
      setQuickVendorOpen(false);
      quickVendorForm.reset({
        name: "",
        contactInfo: "",
        notes: "",
      });
      router.refresh();
    },
    onError: (ctx) => {
      toast.error(ctx.error.serverError ?? "Nao foi possivel salvar o fornecedor.");
    },
  });

  const openPaymentDialog = (row: ReceivableRow) => {
    setPaymentTarget(row);
    paymentForm.reset({
      amountReais: centsToReaisInput(row.remainingInCents),
      paymentMethod: "pix",
      notes: "",
    });
  };

  const onSubmitPayment = (values: RegisterPaymentFormValues) => {
    if (!paymentTarget) return;
    const cents = reaisToCents(values.amountReais);
    if (cents > paymentTarget.remainingInCents) {
      toast.error("O valor não pode ser maior que o saldo em aberto.");
      return;
    }
    registerPayment.execute({
      appointmentId: paymentTarget.id,
      amountInCents: cents,
      paymentMethod: values.paymentMethod,
      notes: values.notes?.trim() || undefined,
    });
  };

  const onSubmitDeleteAllPayments = (values: DeleteAllPaymentsFormValues) => {
    if (!deleteAllTarget) return;
    deleteAllPayments.execute({
      appointmentId: deleteAllTarget.id,
      observation: values.observation,
    });
  };

  const onSubmitPayable = (values: CreatePayableFormValues) => {
    if (payableModal.kind === "closed") return;
    const cents = reaisToCents(values.amountReais);
    if (cents <= 0) {
      toast.error("Valor inválido.");
      return;
    }
    let due: Date | null | undefined;
    if (values.dueDate?.trim()) {
      const d = new Date(values.dueDate);
      if (Number.isNaN(d.getTime())) {
        toast.error("Data de vencimento inválida.");
        return;
      }
      due = d;
    }
    const vendorId = values.vendorId?.trim() ? values.vendorId : null;
    if (payableModal.kind === "edit") {
      updatePayable.execute({
        transactionId: payableModal.row.id,
        description: values.description,
        amountInCents: cents,
        expenseTypeId: values.expenseTypeId,
        vendorId,
        dueDate: due,
      });
      return;
    }
    createPayable.execute({
      description: values.description,
      amountInCents: cents,
      expenseTypeId: values.expenseTypeId,
      vendorId,
      dueDate: due,
    });
  };

  const openPayableCreate = () => {
    setPayableModal({ kind: "create" });
    resetPayableFormForCreate();
  };

  const openPayableEdit = (row: PayableRow) => {
    setPayableModal({ kind: "edit", row });
    payableForm.reset({
      description: row.description,
      amountReais: centsToReaisInput(row.amountInCents),
      expenseTypeId: row.expenseTypeId ?? expenseTypes[0]?.id ?? "",
      vendorId: row.vendorId ?? "",
      dueDate: row.dueDate ? dayjs(row.dueDate).format("YYYY-MM-DD") : "",
    });
  };

  const payableSubmitBusy =
    payableModal.kind === "edit"
      ? updatePayable.status === "executing"
      : createPayable.status === "executing";

  const onSubmitQuickExpenseType = (values: QuickExpenseTypeFormValues) => {
    createExpenseType.execute({
      name: values.name,
      recurrenceType: values.recurrenceType,
      notes: values.notes?.trim() || null,
      vendorId: values.vendorId?.trim() ? values.vendorId : null,
    });
  };

  const onSubmitQuickVendor = (values: QuickVendorFormValues) => {
    createVendor.execute({
      name: values.name,
      contactInfo: values.contactInfo?.trim() || null,
      notes: values.notes?.trim() || null,
    });
  };

  return (
    <PageContainer>
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeaderContent>
          <PageTitle>Financeiro</PageTitle>
          <PageDescription>
            Visão consolidada: valores recebidos nas consultas (quitado ou parcial),
            contas a pagar em aberto e saldo do consultório.
          </PageDescription>
        </PageHeaderContent>
        <FinancialPrivacyToggle visible={visible} onToggle={toggle} />
      </div>

      <PageContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Valor faturamento
                </CardTitle>
                <CardDescription className="text-xs">
                  Recebido em consultas concluídas (quitado ou parcial; em aberto não
                  entra)
                </CardDescription>
              </div>
              <Banknote className="text-muted-foreground size-4" aria-hidden />
            </CardHeader>
            <CardContent>
              {hydrated ? (
                <MaskedCurrency
                  cents={summary.faturamentoInCents}
                  visible={visible}
                  className="text-xl font-semibold"
                />
              ) : (
                <span className="text-muted-foreground text-xl font-semibold tabular-nums">
                  R$ ••••••
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Valor a pagar
                </CardTitle>
                <CardDescription className="text-xs">
                  Em aberto — despesas ainda não quitadas
                </CardDescription>
              </div>
              <ArrowUpCircle className="text-muted-foreground size-4" aria-hidden />
            </CardHeader>
            <CardContent>
              {hydrated ? (
                <MaskedCurrency cents={summary.payableOpenInCents} visible={visible} className="text-xl font-semibold" />
              ) : (
                <span className="text-muted-foreground text-xl font-semibold tabular-nums">
                  R$ ••••••
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Saldo do consultório
                </CardTitle>
                <CardDescription className="text-xs">
                  Faturamento − contas a pagar (em aberto)
                </CardDescription>
              </div>
              <Wallet className="text-muted-foreground size-4" aria-hidden />
            </CardHeader>
            <CardContent>
              {hydrated ? (
                <MaskedCurrency
                  cents={summary.saldoConsultorioInCents}
                  visible={visible}
                  className={
                    summary.saldoConsultorioInCents < 0
                      ? "text-destructive text-xl font-semibold"
                      : "text-xl font-semibold"
                  }
                />
              ) : (
                <span className="text-muted-foreground text-xl font-semibold tabular-nums">
                  R$ ••••••
                </span>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={financeTab}
          onValueChange={(v) => setFinanceTab(v as "receber" | "pagar")}
          className="w-full"
        >
          <div className="w-full space-y-3">
            <TabsList className="grid h-12 w-full grid-cols-2 gap-1.5 rounded-xl bg-muted p-1.5 sm:h-14">
              <TabsTrigger
                value="receber"
                className="rounded-lg px-3 py-2 text-base font-semibold shadow-none data-[state=active]:shadow-sm sm:text-lg"
              >
                Contas a receber
              </TabsTrigger>
              <TabsTrigger
                value="pagar"
                className="rounded-lg px-3 py-2 text-base font-semibold shadow-none data-[state=active]:shadow-sm sm:text-lg"
              >
                Contas a pagar
              </TabsTrigger>
            </TabsList>
            {financeTab === "pagar" ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="gap-1"
                  onClick={openPayableCreate}
                >
                  <Plus className="size-4" />
                  Nova despesa
                </Button>
              </div>
            ) : null}
          </div>

          <TabsContent value="receber" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contas a receber</CardTitle>
                <CardDescription>
                  Agendamentos com status &quot;Concluído&quot; na agenda. Use o
                  lápis para alterar o total ou os lançamentos; o ícone de lixeira
                  remove todos os pagamentos (com observação).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {receivables.length === 0 ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                    Nenhum agendamento concluído. Ao finalizar atendimentos na agenda
                    (status Concluído), eles aparecerão nesta lista.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Profissional</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Pago</TableHead>
                          <TableHead>Situação</TableHead>
                          <TableHead className="min-w-[150px] text-center">
                            Registrar pagamento
                          </TableHead>
                          <TableHead className="w-[100px] text-right">
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receivables.map((r) => {
                          const situation = receivableSituation(r);
                          return (
                          <TableRow key={r.id}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {dayjs(r.date).format("DD/MM/YYYY HH:mm")}
                            </TableCell>
                            <TableCell>{r.patientName}</TableCell>
                            <TableCell>{r.doctorName}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {visible
                                ? formatCurrencyInCents(r.appointmentPriceInCents)
                                : "R$ ••••••"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {visible
                                ? formatCurrencyInCents(r.paidAmountInCents)
                                : "R$ ••••••"}
                            </TableCell>
                            <TableCell>
                              {situation === "quitado" ? (
                                <Badge
                                  variant="secondary"
                                  className="border-emerald-600/30 bg-emerald-600/15 text-emerald-800 dark:text-emerald-400"
                                >
                                  Quitado
                                </Badge>
                              ) : situation === "parcial" ? (
                                <Badge variant="outline">Parcialmente</Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {r.remainingInCents > 0 ? (
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="h-auto px-2 py-0"
                                  onClick={() => openPaymentDialog(r)}
                                >
                                  Registrar pagamento
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setManageReceivable(r)}
                                aria-label="Editar pagamentos"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-8 w-8"
                                disabled={
                                  r.payments.length === 0 ||
                                  deleteAllPayments.status === "executing"
                                }
                                onClick={() => {
                                  setDeleteAllTarget(r);
                                  deleteAllPaymentsForm.reset({
                                    observation: "",
                                  });
                                }}
                                aria-label="Excluir todos os pagamentos"
                                title={
                                  r.payments.length === 0
                                    ? "Não há pagamentos para excluir"
                                    : undefined
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagar" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contas em aberto</CardTitle>
                <CardDescription>
                  Despesas lançadas com &quot;Nova despesa&quot;. Marque como paga após a
                  quitação; use os ícones para editar ou excluir.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {payablesOpen.length === 0 ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                    Nenhuma conta em aberto. Use &quot;Nova despesa&quot; para lançar
                    valores.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo de despesa</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Lançamento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="w-[120px] text-center">
                            Marcar pago
                          </TableHead>
                          <TableHead className="w-[100px] text-right">
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payablesOpen.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="max-w-[200px] truncate text-sm">
                              {p.description}
                            </TableCell>
                            <TableCell className="text-sm">{p.categoryName}</TableCell>
                            <TableCell className="text-sm">
                              {p.vendorName ?? "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {p.dueDate
                                ? dayjs(p.dueDate).format("DD/MM/YYYY")
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {dayjs(p.transactionDate).format("DD/MM/YYYY")}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm font-medium">
                              {visible
                                ? formatCurrencyInCents(p.amountInCents)
                                : "R$ ••••••"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={markPaid.status === "executing"}
                                onClick={() =>
                                  markPaid.execute({ transactionId: p.id })
                                }
                              >
                                {markPaid.status === "executing" ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  "Marcar pago"
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openPayableEdit(p)}
                                disabled={expenseTypes.length === 0}
                                aria-label="Editar despesa"
                                title={
                                  expenseTypes.length === 0
                                    ? "Cadastre um tipo de despesa para editar"
                                    : undefined
                                }
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-8 w-8"
                                disabled={deletePayable.status === "executing"}
                                onClick={() => setDeletePayableTarget(p)}
                                aria-label="Excluir despesa"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contas pagas</CardTitle>
                <CardDescription>
                  Histórico de despesas quitadas. Use os ícones para editar ou excluir
                  um lançamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {payablesPaid.length === 0 ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                    Nenhuma conta paga registrada ainda.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo de despesa</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Lançamento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="w-[100px] text-right">
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payablesPaid.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="max-w-[200px] truncate text-sm">
                              {p.description}
                            </TableCell>
                            <TableCell className="text-sm">{p.categoryName}</TableCell>
                            <TableCell className="text-sm">
                              {p.vendorName ?? "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {p.dueDate
                                ? dayjs(p.dueDate).format("DD/MM/YYYY")
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {dayjs(p.transactionDate).format("DD/MM/YYYY")}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm font-medium">
                              {visible
                                ? formatCurrencyInCents(p.amountInCents)
                                : "R$ ••••••"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openPayableEdit(p)}
                                disabled={expenseTypes.length === 0}
                                aria-label="Editar despesa"
                                title={
                                  expenseTypes.length === 0
                                    ? "Cadastre um tipo de despesa para editar"
                                    : undefined
                                }
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-8 w-8"
                                disabled={deletePayable.status === "executing"}
                                onClick={() => setDeletePayableTarget(p)}
                                aria-label="Excluir despesa"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>

      <Dialog
        open={!!paymentTarget}
        onOpenChange={(open) => {
          if (!open) setPaymentTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {paymentTarget ? (
            <Form {...paymentForm}>
              <form
                onSubmit={paymentForm.handleSubmit(onSubmitPayment)}
                className="space-y-4"
              >
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Paciente:</span>{" "}
                    {paymentTarget.patientName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Em aberto:</span>{" "}
                    {formatCurrencyInCents(paymentTarget.remainingInCents)}
                  </p>
                </div>
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
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            Object.keys(PAYMENT_METHOD_LABELS) as Array<
                              keyof typeof PAYMENT_METHOD_LABELS
                            >
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPaymentTarget(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerPayment.status === "executing"}
                  >
                    {registerPayment.status === "executing" ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Salvando
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ReceivablePaymentsManagerDialog
        open={manageReceivable !== null}
        onOpenChange={(open) => {
          if (!open) setManageReceivable(null);
        }}
        receivable={manageReceivable}
        onSuccess={() => router.refresh()}
        onRequestRegisterPayment={(row) => {
          setManageReceivable(null);
          openPaymentDialog(row);
        }}
      />

      <Dialog
        open={!!deleteAllTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteAllTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir todos os pagamentos</DialogTitle>
            <DialogDescription>
              Os lançamentos serão removidos e uma linha será acrescentada às
              observações do agendamento com o motivo informado abaixo.
            </DialogDescription>
          </DialogHeader>
          {deleteAllTarget ? (
            <Form {...deleteAllPaymentsForm}>
              <form
                onSubmit={deleteAllPaymentsForm.handleSubmit(
                  onSubmitDeleteAllPayments,
                )}
                className="space-y-4"
              >
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Paciente:</span>{" "}
                    {deleteAllTarget.patientName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Data:</span>{" "}
                    {dayjs(deleteAllTarget.date).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <FormField
                  control={deleteAllPaymentsForm.control}
                  name="observation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Motivo da exclusão dos pagamentos"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteAllTarget(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={deleteAllPayments.status === "executing"}
                  >
                    {deleteAllPayments.status === "executing" ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Excluindo
                      </>
                    ) : (
                      "Excluir pagamentos"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={payableModal.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setPayableModal({ kind: "closed" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {payableModal.kind === "edit"
                ? payableModal.row.isPaid
                  ? "Editar despesa quitada"
                  : "Editar despesa"
                : "Nova despesa — contas a pagar"}
            </DialogTitle>
            <DialogDescription>
              {payableModal.kind === "edit"
                ? payableModal.row.isPaid
                  ? "Altere os dados desta despesa já quitada. Ela continuará listada em contas pagas após salvar."
                  : "Altere os dados desta despesa ainda em aberto."
                : "Registra somente despesa da clínica em contas a pagar."}
            </DialogDescription>
          </DialogHeader>
          <Form {...payableForm}>
            <form
              onSubmit={payableForm.handleSubmit(onSubmitPayable)}
              className="space-y-4"
            >
              {expenseTypes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Ainda nao ha tipos de despesa cadastrados. Voce pode criar aqui
                  no botao <span className="font-medium text-foreground">Novo tipo</span>{" "}
                  ou na pagina{" "}
                  <Link
                    href={`${ROUTES.REGISTRY}?tab=despesas`}
                    className="text-primary underline"
                  >
                    Cadastros
                  </Link>
                  .
                </p>
              ) : null}
                <FormField
                  control={payableForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex.: Aluguel março" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payableForm.control}
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
                  control={payableForm.control}
                  name="expenseTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel>Tipo de despesa</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => setQuickExpenseTypeOpen(true)}
                        >
                          <Plus className="size-3.5" />
                          Novo tipo
                        </Button>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseTypes.length === 0 ? (
                            <SelectItem value="__no_expense_type__" disabled>
                              Nenhum tipo cadastrado
                            </SelectItem>
                          ) : null}
                          {expenseTypes.map((expenseType) => (
                            <SelectItem key={expenseType.id} value={expenseType.id}>
                              {expenseType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payableForm.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel>Fornecedor (opcional)</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => setQuickVendorOpen(true)}
                        >
                          <Plus className="size-3.5" />
                          Novo fornecedor
                        </Button>
                      </div>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(v === "__none__" ? "" : v)
                        }
                        value={field.value && field.value.length > 0 ? field.value : "__none__"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Nenhum</SelectItem>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={payableForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vencimento (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPayableModal({ kind: "closed" })}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={payableSubmitBusy}>
                    {payableSubmitBusy ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Salvando
                      </>
                    ) : payableModal.kind === "edit" ? (
                      "Salvar"
                    ) : (
                      "Lançar"
                    )}
                  </Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={quickExpenseTypeOpen} onOpenChange={setQuickExpenseTypeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo tipo de despesa</DialogTitle>
            <DialogDescription>
              Cadastro rapido para usar imediatamente no lancamento da despesa.
            </DialogDescription>
          </DialogHeader>
          <Form {...quickExpenseTypeForm}>
            <form
              onSubmit={quickExpenseTypeForm.handleSubmit(onSubmitQuickExpenseType)}
              className="space-y-4"
            >
              <FormField
                control={quickExpenseTypeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Aluguel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={quickExpenseTypeForm.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recorrencia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseRecurrenceValues.map((recurrence) => (
                          <SelectItem key={recurrence} value={recurrence}>
                            {RECURRENCE_LABELS[recurrence]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={quickExpenseTypeForm.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor (opcional)</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                      value={field.value?.trim() ? field.value : "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum</SelectItem>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={quickExpenseTypeForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observacao</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuickExpenseTypeOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createExpenseType.status === "executing"}
                >
                  {createExpenseType.status === "executing" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Salvando
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={quickVendorOpen} onOpenChange={setQuickVendorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo fornecedor</DialogTitle>
            <DialogDescription>
              Cadastro rapido para vincular no lancamento atual.
            </DialogDescription>
          </DialogHeader>
          <Form {...quickVendorForm}>
            <form
              onSubmit={quickVendorForm.handleSubmit(onSubmitQuickVendor)}
              className="space-y-4"
            >
              <FormField
                control={quickVendorForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Razao social ou fantasia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={quickVendorForm.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Telefone, e-mail ou responsavel"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={quickVendorForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observacao</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuickVendorOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createVendor.status === "executing"}>
                  {createVendor.status === "executing" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Salvando
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletePayableTarget}
        onOpenChange={(open) => {
          if (!open) setDeletePayableTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePayableTarget ? (
                <>
                  O lançamento{" "}
                  <span className="font-medium text-foreground">
                    &quot;{deletePayableTarget.description}&quot;
                  </span>{" "}
                  será removido da lista de contas a pagar. Esta ação não pode ser
                  desfeita.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePayable.status === "executing"}
              onClick={() => {
                if (!deletePayableTarget) return;
                deletePayable.execute({
                  transactionId: deletePayableTarget.id,
                });
              }}
            >
              {deletePayable.status === "executing" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Excluindo
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
