// Centralized Zustand stores

// Appointment management store
export type { NewAppointmentSlot } from "./appointment-store";
export { useAppointmentStore } from "./appointment-store";

// Evolution management store
export { useEvolutionStore } from "./evolution-store";

// Mobile bottom nav FAB (central + button)
export { useMobileNavFabStore } from "./mobile-nav-fab-store";