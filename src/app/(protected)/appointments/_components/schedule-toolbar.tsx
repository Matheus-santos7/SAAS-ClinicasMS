"use client";

import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewType = "day" | "week" | "month";

interface ScheduleToolbarProps {
  currentView: ViewType;
  currentDate: Date;
  onViewChange?: (view: ViewType) => void;
  onDateChange?: (date: Date) => void;
  className?: string;
}

export function ScheduleToolbar({
  currentView,
  currentDate,
  onViewChange,
  onDateChange,
  className,
}: ScheduleToolbarProps) {
  const handleToday = () => {
    const today = new Date();
    onDateChange?.(today);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const amount = direction === "prev" ? -1 : 1;
    const newDate = dayjs(currentDate).add(amount, currentView).toDate();
    onDateChange?.(newDate);
  };

  const periodLabel =
    currentView === "month"
      ? dayjs(currentDate).format("MMMM [de] YYYY")
      : `${dayjs(currentDate).startOf("week").format("DD MMM")} - ${dayjs(currentDate)
          .endOf("week")
          .format("DD MMM")}`;

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={handleToday}
        >
          Hoje
        </Button>

        <div className="flex flex-1 items-center gap-1 rounded-md border bg-background/80 px-1 py-0.5 shadow-sm sm:flex-none">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleNavigate("prev")}
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="line-clamp-1 px-2 text-xs font-medium text-muted-foreground">
            {periodLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleNavigate("next")}
            aria-label="Próximo período"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full items-center gap-1 rounded-md border bg-background/80 p-0.5 shadow-sm sm:w-auto sm:justify-start">
        {(["day", "week", "month"] as const).map((view) => (
          <Button
            key={view}
            variant={currentView === view ? "default" : "ghost"}
            size="sm"
            className="h-8 flex-1 px-2 text-xs capitalize sm:flex-none"
            onClick={() => onViewChange?.(view)}
          >
            {view === "day" ? "Dia" : view === "week" ? "Semana" : "Mês"}
          </Button>
        ))}
      </div>
    </div>
  );
}

