import { create } from "zustand";

import { AppointmentWithRelations } from "@/types";

// Armazena as informações do slot de horário selecionado pelo usuário
export type NewAppointmentSlot = {
  start: Date;
  end: Date;
};

type AppointmentState = {
  selectedAppointment: AppointmentWithRelations | null;
  isModalOpen: boolean;
  openModal: (appointment: AppointmentWithRelations) => void;
  closeModal: () => void;

  isNewModalOpen: boolean;
  newAppointmentSlot: NewAppointmentSlot | null;
  openNewModal: (slot: NewAppointmentSlot) => void;
  closeNewModal: () => void;
};

export const useAppointmentStore = create<AppointmentState>((set) => ({
  selectedAppointment: null,
  isModalOpen: false,
  openModal: (appointment) =>
    set({ selectedAppointment: appointment, isModalOpen: true }),
  closeModal: () => set({ selectedAppointment: null, isModalOpen: false }),

  isNewModalOpen: false,
  newAppointmentSlot: null,
  openNewModal: (slot) =>
    set({ newAppointmentSlot: slot, isNewModalOpen: true }),
  closeNewModal: () => set({ newAppointmentSlot: null, isNewModalOpen: false }),
}));
