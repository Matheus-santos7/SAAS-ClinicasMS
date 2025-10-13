import { Suspense } from "react";

import {
  AppointmentsChartSkeleton,
  StatsCardsSkeleton,
  TopDoctorsSkeleton,
  TopSpecialtiesSkeleton,
} from "@/components/skeletons";

import AppointmentsChart from "../_components/appointments-chart";
import StatsCards from "../_components/stats-cards";
import TopDoctors from "../_components/top-doctors";
import TopSpecialties from "../_components/top-specialties";

// =================================
// TYPES
// =================================

interface StatsData {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

interface DoctorData {
  id: string;
  name: string;
  avatarImageUrl: string | null;
  specialty: string;
  appointments: number;
}

interface SpecialtyData {
  specialty: string;
  appointments: number;
}

interface DailyAppointmentData {
  date: string;
  appointments: number;
  revenue: number;
}

// =================================
// WRAPPER COMPONENTS
// =================================

/**
 * Wrapper para Stats Cards com Suspense
 */
export const StatsCardsWrapper = (props: StatsData) => {
  return (
    <Suspense fallback={<StatsCardsSkeleton />}>
      <StatsCards {...props} />
    </Suspense>
  );
};

/**
 * Wrapper para Top Doctors com Suspense
 */
export const TopDoctorsWrapper = ({ doctors }: { doctors: DoctorData[] }) => {
  return (
    <Suspense fallback={<TopDoctorsSkeleton />}>
      <TopDoctors doctors={doctors} />
    </Suspense>
  );
};

/**
 * Wrapper para Top Specialties com Suspense
 */
export const TopSpecialtiesWrapper = ({
  topSpecialties,
}: {
  topSpecialties: SpecialtyData[];
}) => {
  return (
    <Suspense fallback={<TopSpecialtiesSkeleton />}>
      <TopSpecialties topSpecialties={topSpecialties} />
    </Suspense>
  );
};

/**
 * Wrapper para Appointments Chart com Suspense
 */
export const AppointmentsChartWrapper = ({
  dailyAppointmentsData,
}: {
  dailyAppointmentsData: DailyAppointmentData[];
}) => {
  return (
    <Suspense fallback={<AppointmentsChartSkeleton />}>
      <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
    </Suspense>
  );
};
