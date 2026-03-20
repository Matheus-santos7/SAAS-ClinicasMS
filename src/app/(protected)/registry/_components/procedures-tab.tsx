"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteClinicProcedure } from "@/actions/registry/delete-clinic-procedure";
import { upsertClinicProcedure } from "@/actions/registry/upsert-clinic-procedure";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyInCents } from "@/helpers/currency";

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
  basePriceReais: z
    .string()
    .min(1, { message: "Informe o valor base." })
    .refine(
      (v) => {
        const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Valor inválido." },
    ),
  durationMinutes: z.coerce
    .number({ invalid_type_error: "Informe a duração." })
    .int()
    .min(1, { message: "Mínimo 1 minuto." }),
  hasReturn: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type ProcedureRow = {
  id: string;
  name: string;
  basePriceInCents: number;
  durationSeconds: number;
  hasReturn: boolean;
};

/** Exibe duração armazenada em segundos como minutos na lista */
function formatDurationMinutes(sec: number) {
  const m = Math.round(sec / 60);
  return `${m} min`;
}

function reaisToCents(reaisStr: string): number {
  const n = parseFloat(reaisStr.replace(/\./g, "").replace(",", "."));
  return Math.round(n * 100);
}

function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

interface ProceduresTabProps {
  procedures: ProcedureRow[];
}

export function ProceduresTab({ procedures }: ProceduresTabProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProcedureRow | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      basePriceReais: "",
      durationMinutes: 30,
      hasReturn: false,
    },
  });

  const saveAction = useAction(upsertClinicProcedure, {
    onSuccess: () => {
      toast.success("Procedimento salvo.");
      setOpen(false);
      setEditing(null);
      form.reset();
      router.refresh();
    },
    onError: () => toast.error("Erro ao salvar procedimento."),
  });

  const deleteAction = useAction(deleteClinicProcedure, {
    onSuccess: () => {
      toast.success("Procedimento removido.");
      setDeleteId(null);
      router.refresh();
    },
    onError: () => toast.error("Erro ao remover."),
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      name: "",
      basePriceReais: "",
      durationMinutes: 30,
      hasReturn: false,
    });
    setOpen(true);
  };

  const openEdit = (p: ProcedureRow) => {
    setEditing(p);
    form.reset({
      id: p.id,
      name: p.name,
      basePriceReais: centsToReaisInput(p.basePriceInCents),
      durationMinutes: Math.max(1, Math.round(p.durationSeconds / 60)),
      hasReturn: p.hasReturn,
    });
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    saveAction.execute({
      id: values.id,
      name: values.name,
      basePriceInCents: reaisToCents(values.basePriceReais),
      durationSeconds: values.durationMinutes * 60,
      hasReturn: values.hasReturn,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={openNew} className="gap-1">
          <Plus className="size-4" />
          Novo procedimento
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Valor base</TableHead>
              <TableHead className="hidden md:table-cell">Duração</TableHead>
              <TableHead className="hidden lg:table-cell">Retorno</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedures.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Nenhum procedimento cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              procedures.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatCurrencyInCents(p.basePriceInCents)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatDurationMinutes(p.durationSeconds)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {p.hasReturn ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(p)}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => setDeleteId(p.id)}
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
              {editing ? "Editar procedimento" : "Novo procedimento"}
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
                      <Input placeholder="Ex.: Limpeza" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basePriceReais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor base (R$)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        inputMode="decimal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasReturn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Exige retorno</FormLabel>
                      <p className="text-muted-foreground text-xs font-normal">
                        Marque se o tratamento prevê consulta de retorno.
                      </p>
                    </div>
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
            <AlertDialogTitle>Excluir procedimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação pode ser desfeita apenas recriando o cadastro.
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
