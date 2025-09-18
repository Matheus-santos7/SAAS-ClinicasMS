"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { DateRangeFilter } from "./date-range-filter";
import { appointmentsTableColumns } from "./table-columns";

// Tipo para os dados recebidos
type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

interface AppointmentListProps {
  appointments: AppointmentWithRelations[];
}

export function AppointmentListView({ appointments }: AppointmentListProps) {
  return (
    <div className="mt-6 space-y-4">
      <DateRangeFilter />
      <DataTable data={appointments} columns={appointmentsTableColumns} />
    </div>
  );
}
