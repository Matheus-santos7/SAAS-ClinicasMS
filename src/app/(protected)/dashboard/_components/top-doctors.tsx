import { Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface TopDoctorsProps {
  doctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
  }[];
}

export default function TopDoctors({ doctors }: TopDoctorsProps) {
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Dentistas</CardTitle>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-gray-100 text-sm sm:text-lg font-medium text-gray-600">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium">{doctor.name}</h3>
                  <p className="text-muted-foreground text-xs">
                    {doctor.specialty}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                  {doctor.appointments} agend.
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}