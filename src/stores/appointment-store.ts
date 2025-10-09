import { create } from "zustand";

import type { AppointmentWithRelations } from "@/types";

// Armazena as informações do slot de horário selecionado pelo usuário
export type NewAppointmentSlot = {
  start: Date;
  end: Date;
};

// ✅ UNIFICAÇÃO: Dados do modal podem ser um agendamento existente ou um novo slot
export type AppointmentModalData =
  | { type: "view"; appointment: AppointmentWithRelations }
  | { type: "create"; slot: NewAppointmentSlot }
  | null;

// ✅ SIMPLIFICADO: Estado unificado dos modais de agendamento
type AppointmentState = {
  // Estado unificado do modal
  isModalOpen: boolean;
  modalData: AppointmentModalData;

  // Ações simplificadas
  openViewModal: (appointment: AppointmentWithRelations) => void;
  openCreateModal: (slot: NewAppointmentSlot) => void;
  closeModal: () => void;

  // Getters para facilitar o uso nos componentes
  getSelectedAppointment: () => AppointmentWithRelations | null;
  getNewAppointmentSlot: () => NewAppointmentSlot | null;
  isViewModal: () => boolean;
  isCreateModal: () => boolean;
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  // ✅ Estado unificado
  isModalOpen: false,
  modalData: null,

  // ✅ Ações simplificadas
  openViewModal: (appointment) =>
    set({
      isModalOpen: true,
      modalData: { type: "view", appointment },
    }),

  openCreateModal: (slot) =>
    set({
      isModalOpen: true,
      modalData: { type: "create", slot },
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalData: null,
    }),

  // ✅ Getters para compatibilidade e facilidade de uso
  getSelectedAppointment: () => {
    const { modalData } = get();
    return modalData?.type === "view" ? modalData.appointment : null;
  },

  getNewAppointmentSlot: () => {
    const { modalData } = get();
    return modalData?.type === "create" ? modalData.slot : null;
  },

  isViewModal: () => {
    const { modalData } = get();
    return modalData?.type === "view";
  },

  isCreateModal: () => {
    const { modalData } = get();
    return modalData?.type === "create";
  },
}));
