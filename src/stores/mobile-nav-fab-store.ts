import { create } from "zustand";

type MobileNavFabState = {
  handler: (() => void) | null;
  ariaLabel: string;
  register: (handler: () => void, ariaLabel: string) => void;
  unregister: () => void;
};

export const useMobileNavFabStore = create<MobileNavFabState>((set) => ({
  handler: null,
  ariaLabel: "Novo agendamento",
  register: (handler, ariaLabel) => set({ handler, ariaLabel }),
  unregister: () =>
    set({ handler: null, ariaLabel: "Novo agendamento" }),
}));
