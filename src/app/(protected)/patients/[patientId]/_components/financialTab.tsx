"use client";

import { CheckCircle2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  budgetToTreatment,
  deleteBudget,
  upsertBudget,
} from "@/actions/patients/budget";
import { BudgetModal } from "@/components/budget/BudgetModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

// Tipos completos
export interface BudgetProcedure {
  id?: string;
  name: string;
  value: number;
  quantity?: number;
  priceInCents?: number;
}

export interface Budget {
  id: string;
  totalAmountInCents: number;
  createdAt: string | Date;
  doctor: { name: string; id?: string };
  status: string;
  clinicId?: string;
  procedures?: BudgetProcedure[];
  observations?: string;
}

export interface Treatment {
  id: string;
  totalAmountInCents: number;
  amountPaidInCents: number;
  status: string;
}

export interface BudgetFormData {
  patientId: string;
  doctorId: string;
  clinicId: string;
  procedures: BudgetProcedure[];
  total: number;
  observations: string;
}

interface FinancialTabProps {
  patientId: string;
  doctors: Array<{ id: string; name: string }>;
  budgets: Budget[];
  treatments: Treatment[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved":
    case "completed":
      return "default"; // green
    case "pending":
    case "ongoing":
      return "secondary"; // yellow
    case "rejected":
    case "canceled":
      return "destructive"; // red
    default:
      return "outline";
  }
};

export const FinancialTab = ({
  patientId,
  doctors,
  budgets,
  treatments,
}: FinancialTabProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetFormData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [budgetsState, setBudgetsState] = useState<Budget[]>(budgets);

  function budgetToFormData(budget: Budget): BudgetFormData {
    return {
      patientId,
      doctorId: budget.doctor.id || "",
      clinicId: budget.clinicId || "",
      procedures:
        budget.procedures?.map((p) => ({
          id: p.id,
          name: p.name,
          value: (p.priceInCents ?? 0) / 100,
          quantity: p.quantity ?? 1,
        })) || [],
      total: budget.totalAmountInCents / 100,
      observations: budget.observations || "",
    };
  }

  async function handleSaveBudget(data: BudgetFormData) {
    setLoading(true);
    try {
      await upsertBudget(data);
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBudget(id: string) {
    setLoading(true);
    try {
      await deleteBudget({ id });
      setBudgetsState(budgetsState.filter((b) => b.id !== id));
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveBudget(id: string) {
    setLoading(true);
    try {
      await budgetToTreatment({ id });
      // Atualize localmente ou faça refetch
    } finally {
      setLoading(false);
    }
  }

  function openEdit(budget: Budget) {
    setEditingBudget(budgetToFormData(budget));
    setModalOpen(true);
  }

  function openNew() {
    setEditingBudget(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <BudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveBudget}
        doctors={doctors}
        clinics={[]} // Adapte para passar as clínicas corretas
        patientId={patientId}
        initial={
          editingBudget
            ? {
                ...editingBudget,
                procedures: editingBudget.procedures.map((p) => ({
                  ...p,
                  quantity: p.quantity ?? 1,
                })),
              }
            : undefined
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>
                Orçamentos propostos para o paciente.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openNew} disabled={loading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </CardHeader>
          <CardContent>
            {budgetsState.length > 0 ? (
              <ul className="space-y-3">
                {budgetsState.map((budget) => (
                  <li
                    key={budget.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrencyInCents(budget.totalAmountInCents)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(budget.createdAt).toLocaleDateString("pt-BR")}{" "}
                        - Dr(a). {budget.doctor.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(budget.status)}>
                        {budget.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(budget)}
                        title="Editar"
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteBudget(budget.id)}
                        title="Excluir"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {budget.status === "pending" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleApproveBudget(budget.id)}
                          title="Aprovar e transformar em tratamento"
                          disabled={loading}
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Nenhum orçamento encontrado.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tratamentos</CardTitle>
              <CardDescription>
                Tratamentos em andamento ou finalizados.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" disabled>
              Registrar Pagamento
            </Button>
          </CardHeader>
          <CardContent>
            {treatments.length > 0 ? (
              <ul className="space-y-3">
                {treatments.map((treatment) => (
                  <li
                    key={treatment.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrencyInCents(treatment.totalAmountInCents)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Pago:{" "}
                        {formatCurrencyInCents(treatment.amountPaidInCents)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(treatment.status)}>
                      {treatment.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Nenhum tratamento encontrado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
