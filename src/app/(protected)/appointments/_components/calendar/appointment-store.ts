// src/app/(protected)/appointments/_components/calendar/appointment-store.ts
import { create } from "zustand";

import { AppointmentWithRelations } from "./agenda-view";

type AppointmentState = {
  selectedAppointment: AppointmentWithRelations | null;
  isModalOpen: boolean;
  openModal: (appointment: AppointmentWithRelations) => void;
  closeModal: () => void;
};

export const useAppointmentStore = create<AppointmentState>((set) => ({
  selectedAppointment: null,
  isModalOpen: false,
  openModal: (appointment) => set({ selectedAppointment: appointment, isModalOpen: true }),
  closeModal: () => set({ selectedAppointment: null, isModalOpen: false }),
}));