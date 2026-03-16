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

interface DateRangeFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Nome do parâmetro de query para a data inicial.
   * Padrão: "from"
   */
  fromKey?: string;
  /**
   * Nome do parâmetro de query para a data final.
   * Padrão: "to"
   */
  toKey?: string;
  /**
   * Variante de layout.
   * - "full": botões de preset + botão de intervalo (mais largo)
   * - "compact": seletor único em formato de select + calendário
   * Padrão: "compact"
   */
  variant?: "full" | "compact";
}

export function DateRangeFilter({
  className,
  fromKey = "from",
  toKey = "to",
  variant = "compact",
  ...props
}: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get(fromKey);
  const to = searchParams.get(toKey);

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

    if (
      fromDate.isSame(dayjs(today), "day") &&
      toDate.isSame(dayjs(today), "day")
    ) {
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
    const fromValue = dateRange?.from
      ? dayjs(dateRange.from).format("YYYY-MM-DD")
      : undefined;
    const toValue = dateRange?.to
      ? dayjs(dateRange.to).format("YYYY-MM-DD")
      : undefined;
    router.push(
      `${pathname}?${createQueryString({
        [fromKey]: fromValue,
        [toKey]: toValue,
      })}`,
    );
  };

  const setDatePreset = (fromDate: Date, toDate: Date) => {
    const newDateRange = { from: fromDate, to: toDate };
    setDate(newDateRange);
    router.push(
      `${pathname}?${createQueryString({
        [fromKey]: dayjs(fromDate).format("YYYY-MM-DD"),
        [toKey]: dayjs(toDate).format("YYYY-MM-DD"),
      })}`,
    );
  };

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const labelByPreset: Record<string, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    last7: "Últimos 7 dias",
    last30: "Últimos 30 dias",
    custom: "Período personalizado",
  };

  const currentLabel =
    labelByPreset[activePreset as keyof typeof labelByPreset] ??
    labelByPreset.custom;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center justify-end",
          className,
        )}
        {...props}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              size="sm"
              className="h-8 min-w-[160px] justify-between rounded-full px-3 text-xs font-medium"
            >
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {currentLabel}
              </span>
              {date?.from && date?.to && (
                <span className="text-muted-foreground ml-2 hidden text-[10px] sm:inline">
                  {format(date.from, "dd/MM", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM", { locale: ptBR })}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Button
                variant={activePreset === "today" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setDatePreset(today, today)}
              >
                Hoje
              </Button>
              <Button
                variant={activePreset === "yesterday" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setDatePreset(yesterday, yesterday)}
              >
                Ontem
              </Button>
              <Button
                variant={activePreset === "last7" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setDatePreset(last7Start, today)}
              >
                Últimos 7
              </Button>
              <Button
                variant={activePreset === "last30" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setDatePreset(last30Start, today)}
              >
                Últimos 30
              </Button>
            </div>

            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={isMobile ? 1 : 2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-1.5 md:flex-nowrap md:gap-2",
        className,
      )}
      {...props}
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
                  {format(date.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yy", { locale: ptBR })
              )
            ) : (
              <span>Período personalizado</span>
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
            numberOfMonths={isMobile ? 1 : 2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

