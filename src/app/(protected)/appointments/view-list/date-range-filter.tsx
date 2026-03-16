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

  const today = React.useMemo(() => new Date(), []);
  const yesterday = React.useMemo(() => subDays(today, 1), [today]);
  const last7Start = React.useMemo(() => subDays(today, 7), [today]);
  const last30Start = React.useMemo(() => subDays(today, 30), [today]);

  const activePreset = React.useMemo(() => {
    if (!from || !to) return "custom";
    const fromDate = dayjs(from);
    const toDate = dayjs(to);

    if (fromDate.isSame(dayjs(today), "day") && toDate.isSame(dayjs(today), "day")) {
      return "today";
    }

    if (
      fromDate.isSame(dayjs(yesterday), "day") &&
      toDate.isSame(dayjs(yesterday), "day")
    ) {
      return "yesterday";
    }

    if (
      fromDate.isSame(dayjs(last7Start), "day") &&
      toDate.isSame(dayjs(today), "day")
    ) {
      return "last7";
    }

    if (
      fromDate.isSame(dayjs(last30Start), "day") &&
      toDate.isSame(dayjs(today), "day")
    ) {
      return "last30";
    }

    return "custom";
  }, [from, to, today, yesterday, last7Start, last30Start]);

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
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-1.5 md:flex-nowrap md:gap-2",
        className,
      )}
    >
      <Button
        variant={activePreset === "today" ? "default" : "outline"}
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => setDatePreset(today, today)}
      >
        Hoje
      </Button>
      <Button
        variant={activePreset === "yesterday" ? "default" : "outline"}
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => setDatePreset(yesterday, yesterday)}
      >
        Ontem
      </Button>
      <Button
        variant={activePreset === "last7" ? "default" : "outline"}
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => setDatePreset(last7Start, today)}
      >
        Últimos 7 dias
      </Button>
      <Button
        variant={activePreset === "last30" ? "default" : "outline"}
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => setDatePreset(last30Start, today)}
      >
        Últimos 30 dias
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-full justify-between text-left text-xs font-normal sm:w-[220px] md:w-[260px]",
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