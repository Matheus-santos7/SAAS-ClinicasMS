"use client";

import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangeFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>(
    from && to ? { from: new Date(from), to: new Date(to) } : undefined,
  );

  const createQueryString = React.useCallback(
    (params: Record<string, string | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }
      return newSearchParams.toString();
    },
    [searchParams],
  );

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    setDate(dateRange);
    const from = dateRange?.from
      ? dayjs(dateRange.from).format("YYYY-MM-DD")
      : undefined;
    const to = dateRange?.to
      ? dayjs(dateRange.to).format("YYYY-MM-DD")
      : undefined;
    router.push(`${pathname}?${createQueryString({ from, to })}`);
  };

  const setDatePreset = (from: Date, to: Date) => {
    const newDateRange = { from, to };
    setDate(newDateRange);
    router.push(
      `${pathname}?${createQueryString({
        from: dayjs(from).format("YYYY-MM-DD"),
        to: dayjs(to).format("YYYY-MM-DD"),
      })}`,
    );
  };

  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDatePreset(new Date(), new Date())}
      >
        Hoje
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDatePreset(subDays(new Date(), 1), subDays(new Date(), 1))}
      >
        Ontem
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDatePreset(subDays(new Date(), 7), new Date())}
      >
        Últimos 7 dias
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDatePreset(subDays(new Date(), 30), new Date())}
      >
        Últimos 30 dias
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período personalizado</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}