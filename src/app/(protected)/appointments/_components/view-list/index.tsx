"use client";

import { DataTable } from "@/components/ui/data-table";
import { AppointmentWithRelations } from "@/types";

import { DateRangeFilter } from "./date-range-filter";
import { appointmentsTableColumns } from "./table-columns";

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
