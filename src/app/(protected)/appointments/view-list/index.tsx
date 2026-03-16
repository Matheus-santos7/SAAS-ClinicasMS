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
    <div className="space-y-4 p-1 md:p-2 lg:p-4">
      <div className="flex justify-end">
        <DateRangeFilter className="w-full sm:w-auto" />
      </div>
      <DataTable data={appointments} columns={appointmentsTableColumns} />
    </div>
  );
}
