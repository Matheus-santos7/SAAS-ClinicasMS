import { create } from "zustand";

import type { EvolutionEntryWithDoctor } from "@/types";

// Store para gerenciar o estado dos modais de evolução
type EvolutionStore = {
  selectedEvolution: EvolutionEntryWithDoctor | null;
  isFormOpen: boolean;
  isViewModalOpen: boolean;
  isDeleteAlertOpen: boolean;
  handleView: (evolution: EvolutionEntryWithDoctor) => void;
  handleEdit: (evolution: EvolutionEntryWithDoctor | null) => void;
  handleDelete: (evolution: EvolutionEntryWithDoctor) => void;
  closeAll: () => void;
};

export const useEvolutionStore = create<EvolutionStore>((set) => ({
  selectedEvolution: null,
  isFormOpen: false,
  isViewModalOpen: false,
  isDeleteAlertOpen: false,
  handleView: (evolution) =>
    set({ selectedEvolution: evolution, isViewModalOpen: true }),
  handleEdit: (evolution: EvolutionEntryWithDoctor | null) =>
    set({ selectedEvolution: evolution, isFormOpen: true }),
  handleDelete: (evolution) =>
    set({ selectedEvolution: evolution, isDeleteAlertOpen: true }),
  closeAll: () =>
    set({
      isFormOpen: false,
      isViewModalOpen: false,
      isDeleteAlertOpen: false,
      selectedEvolution: null,
    }),
}));
