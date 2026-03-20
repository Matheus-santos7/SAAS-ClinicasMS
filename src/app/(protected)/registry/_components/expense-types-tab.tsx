"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteExpenseType } from "@/actions/registry/delete-expense-type";
import { upsertExpenseType } from "@/actions/registry/upsert-expense-type";
import { expenseRecurrenceValues } from "@/actions/registry/upsert-expense-type/schema";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RECURRENCE_LABELS: Record<(typeof expenseRecurrenceValues)[number], string> =
  {
    one_time: "Única",
    weekly: "Semanal",
    monthly: "Mensal",
    quarterly: "Trimestral",
    yearly: "Anual",
  };

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
  recurrenceType: z.enum(expenseRecurrenceValues),
  notes: z.string().optional(),
  vendorId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ExpenseTypeRow = {
  id: string;
  name: string;
  recurrenceType: (typeof expenseRecurrenceValues)[number];
  notes: string | null;
  vendorId: string | null;
  vendorName: string | null;
};

type VendorOption = { id: string; name: string };

interface ExpenseTypesTabProps {
  expenseTypes: ExpenseTypeRow[];
  vendors: VendorOption[];
}

export function ExpenseTypesTab({ expenseTypes, vendors }: ExpenseTypesTabProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ExpenseTypeRow | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      recurrenceType: "monthly",
      notes: "",
      vendorId: "",
    },
  });

  const saveAction = useAction(upsertExpenseType, {
    onSuccess: () => {
      toast.success("Tipo de despesa salvo.");
      setOpen(false);
      setEditing(null);
      form.reset();
      router.refresh();
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const deleteAction = useAction(deleteExpenseType, {
    onSuccess: () => {
      toast.success("Removido.");
      setDeleteId(null);
      router.refresh();
    },
    onError: () => toast.error("Erro ao remover."),
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      name: "",
      recurrenceType: "monthly",
      notes: "",
      vendorId: "",
    });
    setOpen(true);
  };

  const openEdit = (row: ExpenseTypeRow) => {
    setEditing(row);
    form.reset({
      id: row.id,
      name: row.name,
      recurrenceType: row.recurrenceType,
      notes: row.notes ?? "",
      vendorId: row.vendorId ?? "",
    });
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    saveAction.execute({
      id: values.id,
      name: values.name,
      recurrenceType: values.recurrenceType,
      notes: values.notes?.trim() || null,
      vendorId: values.vendorId?.trim() ? values.vendorId : null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={openNew} className="gap-1">
          <Plus className="size-4" />
          Novo tipo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Recorrência</TableHead>
              <TableHead className="hidden md:table-cell">Fornecedor</TableHead>
              <TableHead className="hidden lg:table-cell">Observação</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Nenhum tipo de despesa cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              expenseTypes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {RECURRENCE_LABELS[row.recurrenceType]}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {row.vendorName ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-sm">
                    {row.notes ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(row)}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => setDeleteId(row.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar tipo de despesa" : "Novo tipo de despesa"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recorrência</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Recorrência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseRecurrenceValues.map((v) => (
                          <SelectItem key={v} value={v}>
                            {RECURRENCE_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes opcionais..."
                        rows={3}
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
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveAction.status === "executing"}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o cadastro do tipo de despesa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteAction.execute({ id: deleteId });
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
