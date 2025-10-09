import { Suspense } from "react";

import { StatsCardsSkeleton } from "./dashboard-skeletons";
import StatsCards from "./stats-cards";

interface StatsCardsWrapperProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const StatsCardsWrapper = (props: StatsCardsWrapperProps) => {
  return (
    <Suspense fallback={<StatsCardsSkeleton />}>
      <StatsCards {...props} />
    </Suspense>
  );
};

export default StatsCardsWrapper;