import { Suspense } from "react";

import { TopDoctorsSkeleton } from "./dashboard-skeletons";
import TopDoctors from "./top-doctors";

interface TopDoctorsWrapperProps {
  doctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
  }[];
}

const TopDoctorsWrapper = ({ doctors }: TopDoctorsWrapperProps) => {
  return (
    <Suspense fallback={<TopDoctorsSkeleton />}>
      <TopDoctors doctors={doctors} />
    </Suspense>
  );
};

export default TopDoctorsWrapper;