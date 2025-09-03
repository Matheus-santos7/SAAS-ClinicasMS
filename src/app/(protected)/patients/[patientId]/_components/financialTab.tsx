"use client";

import { PlusCircle } from "lucide-react";

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

interface FinancialTabProps {
  patientId: string;
  doctors: Array<{ id: string; name: string }>;
  budgets: Array<{
    id: string;
    totalAmountInCents: number;
    createdAt: string | Date;
    doctor: { name: string };
    status: string;
  }>;
  treatments: Array<{
    id: string;
    totalAmountInCents: number;
    amountPaidInCents: number;
    status: string;
  }>;
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

export const FinancialTab = ({ budgets, treatments }: FinancialTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>
                Orçamentos propostos para o paciente.
              </CardDescription>
            </div>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <ul className="space-y-3">
                {budgets.map((budget) => (
                  <li
                    key={budget.id}
                    className="flex items-center justify-between rounded-md border p-2"
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
                    <Badge variant={getStatusBadgeVariant(budget.status)}>
                      {budget.status}
                    </Badge>
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
