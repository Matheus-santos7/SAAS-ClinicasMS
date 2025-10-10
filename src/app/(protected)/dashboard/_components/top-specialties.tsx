import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  Hospital,
  Stethoscope,
} from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopSpecialtiesProps {
  topSpecialties: {
    specialty: string;
    appointments: number;
  }[];
}

const getSpecialtyIcon = (specialty: string) => {
  const specialtyLower = specialty.toLowerCase();
  if (specialtyLower.includes("cardiolog")) return Heart;
  if (specialtyLower.includes("ginecolog") || specialtyLower.includes("obstetri")) return Baby;
  if (specialtyLower.includes("pediatr")) return Activity;
  if (specialtyLower.includes("dermatolog")) return Hand;
  if (specialtyLower.includes("ortoped") || specialtyLower.includes("traumatolog")) return Bone;
  if (specialtyLower.includes("oftalmolog")) return Eye;
  if (specialtyLower.includes("neurolog")) return Brain;
  return Stethoscope;
};

export default function TopSpecialties({ topSpecialties }: TopSpecialtiesProps) {
  const maxAppointments = Math.max(...topSpecialties.map((i) => i.appointments));
  
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Especialidades</CardTitle>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {topSpecialties.map((specialty) => {
            const Icon = getSpecialtyIcon(specialty.specialty);
            const progressValue = (specialty.appointments / maxAppointments) * 100;

            return (
              <div key={specialty.specialty} className="flex items-center gap-2">
                <div className="bg-primary/10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full shrink-0">
                  <Icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex w-full flex-col justify-center min-w-0">
                  <div className="flex w-full justify-between gap-2">
                    <h3 className="text-xs sm:text-sm truncate">{specialty.specialty}</h3>
                    <span className="text-muted-foreground text-xs sm:text-sm font-medium shrink-0">
                      {specialty.appointments} agend.
                    </span>
                  </div>
                  <Progress value={progressValue} className="w-full mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}