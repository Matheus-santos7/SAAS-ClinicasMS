"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

export type ExpensesByVendorRow = {
  vendorName: string;
  totalInCents: number | string | null;
};

export type RevenueByProcedureTypeRow = {
  procedureName: string;
  totalInCents: number | string | null;
};

export default function DashboardFinanceiro({
  expensesByVendor,
  revenueByProcedureType,
}: {
  expensesByVendor: ExpensesByVendorRow[];
  revenueByProcedureType: RevenueByProcedureTypeRow[];
}) {
  const expenseConfig = {
    totalInCents: {
      label: "Despesas",
      color: "#F97316",
    },
  } satisfies ChartConfig;

  const revenueConfig = {
    totalInCents: {
      label: "Faturamento",
      color: "#10B981",
    },
  } satisfies ChartConfig;

  const expensesData = expensesByVendor.map((r) => ({
    vendorName: r.vendorName,
    totalInCents: Number(r.totalInCents ?? 0),
  }));

  const revenueData = revenueByProcedureType.map((r) => ({
    procedureName: r.procedureName,
    totalInCents: Number(r.totalInCents ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Despesas por fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {expensesData.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma despesa encontrada no período.
              </p>
            ) : (
              <ChartContainer
                config={expenseConfig}
                className="min-h-[240px] sm:min-h-[320px]"
              >
                <BarChart
                  data={expensesData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 6 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="vendorName"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs"
                    tickFormatter={(value) => formatCurrencyInCents(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-semibold">
                            {formatCurrencyInCents(Number(value))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="totalInCents"
                    fill="var(--color-totalInCents)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Faturamento por tipo de procedimento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {revenueData.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum faturamento recebido no período.
              </p>
            ) : (
              <ChartContainer
                config={revenueConfig}
                className="min-h-[240px] sm:min-h-[320px]"
              >
                <BarChart
                  data={revenueData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 6 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="procedureName"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs"
                    tickFormatter={(value) => formatCurrencyInCents(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-semibold">
                            {formatCurrencyInCents(Number(value))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="totalInCents"
                    fill="var(--color-totalInCents)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

