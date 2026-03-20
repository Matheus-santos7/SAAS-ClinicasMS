"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRegisterMobileNavFab } from "@/hooks/use-register-mobile-nav-fab";
import { cn } from "@/lib/utils";
import { useAppointmentStore } from "@/stores";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    return newSearchParams.toString();
  };

  const handleChangeView = (view: "agenda" | "lista") => {
    router.push(`${pathname}?${createQueryString({ view })}`);
  };

  const openCreateModal = useAppointmentStore((s) => s.openCreateModal);
  const canAddAppointment = patients.length > 0 && doctors.length > 0;

  useRegisterMobileNavFab(
    () => {
      openCreateModal({
        start: new Date(),
        end: new Date(Date.now() + 30 * 60 * 1000),
      });
    },
    "Novo agendamento",
    canAddAppointment,
  );

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
            onClick={() => handleChangeView("agenda")}
            className="flex-1 text-sm md:flex-none md:px-4"
          >
            Agenda
          </TabsTrigger>
          <TabsTrigger
            value="lista"
            onClick={() => handleChangeView("lista")}
            className="flex-1 text-sm md:flex-none md:px-4"
          >
            Lista
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex justify-end">
        <AddAppointmentButton
          patients={patients}
          doctors={doctors}
          className="hidden md:inline-flex"
        />
      </div>
    </div>
  );
}

