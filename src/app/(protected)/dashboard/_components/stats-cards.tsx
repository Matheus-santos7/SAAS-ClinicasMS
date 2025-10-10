import {
  CalendarIcon,
  DollarSignIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  totalDoctors,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: DollarSignIcon,
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: CalendarIcon,
    },
    {
      title: "Pacientes",
      value: totalPatients.toString(),
      icon: UserIcon,
    },
    {
      title: "Dentistas",
      value: totalDoctors.toString(),
      icon: UsersIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-3 sm:p-6">
            <div className="flex items-center justify-between space-y-0">
              <div className="flex flex-col space-y-1 sm:space-y-2">
                <CardTitle className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
                  {stat.title}
                </CardTitle>
                <div className="text-lg font-bold sm:text-2xl">
                  {stat.value}
                </div>
              </div>
              <div className="bg-primary/10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10">
                <Icon className="text-primary h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
