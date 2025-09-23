// Centralized data access functions

// Appointments
export {
  getAppointmentById,
  getAppointments,
  getAppointmentsByDateRange,
  getAppointmentsForAgenda,
  getAppointmentsForList,
} from "./appointments";

// Doctors
export { getDoctorById, getDoctors } from "./doctors";

// Dashboard
export { getDashboard } from "./get-dashboard";

// Patients
export { getPatientById, getPatients } from "./patients";
