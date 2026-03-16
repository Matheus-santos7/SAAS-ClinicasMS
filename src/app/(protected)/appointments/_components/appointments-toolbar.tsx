"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Doctor, Patient } from "@/types";

import AddAppointmentButton from "./add-appointment-button";
import { DoctorFilter } from "./doctor-filter";

interface AppointmentsToolbarProps {
  doctors: Doctor[];
  patients: Patient[];
  className?: string;
}

export function AppointmentsToolbar({
  doctors,
  patients,
  className,
}: AppointmentsToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-lg border bg-card/40 p-3 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <DoctorFilter doctors={doctors} />

        <TabsList className="w-full justify-start md:w-auto">
          <TabsTrigger
            value="agenda"
            className="flex-1 text-sm md:flex-none md:px-4"
          >
            Agenda
          </TabsTrigger>
          <TabsTrigger
            value="lista"
            className="flex-1 text-sm md:flex-none md:px-4"
          >
            Lista
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex justify-end">
        <AddAppointmentButton patients={patients} doctors={doctors} />
      </div>
    </div>
  );
}

