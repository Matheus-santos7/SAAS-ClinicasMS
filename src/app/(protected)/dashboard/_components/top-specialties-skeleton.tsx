import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TopSpecialtiesSkeleton = () => {
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon skeleton */}
            <Skeleton className="h-5 w-5" />
            {/* Title skeleton */}
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Specialties List Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Specialty icon skeleton */}
                  <Skeleton className="h-5 w-5" />
                  {/* Specialty name skeleton */}
                  <Skeleton className="h-4 w-28" />
                </div>
                {/* Appointments count skeleton */}
                <Skeleton className="h-4 w-12" />
              </div>
              {/* Progress bar skeleton */}
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSpecialtiesSkeleton;