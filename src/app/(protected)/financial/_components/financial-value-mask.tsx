"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrencyInCents } from "@/helpers/currency";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "financial-values-visible";

export function useFinancialValuesVisibility() {
  const [visible, setVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  const toggle = () => {
    setVisible((prev) => {
      const next = !prev;
      if (next) {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return next;
    });
  };

  return { visible, hydrated, toggle };
}

export function MaskedCurrency({
  cents,
  visible,
  className,
}: {
  cents: number;
  visible: boolean;
  className?: string;
}) {
  if (!visible) {
    return (
      <span
        className={cn("tabular-nums tracking-widest text-muted-foreground", className)}
        aria-hidden
      >
        R$ ••••••
      </span>
    );
  }
  return (
    <span className={cn("tabular-nums", className)}>
      {formatCurrencyInCents(cents)}
    </span>
  );
}

export function FinancialPrivacyToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0"
      onClick={onToggle}
      aria-label={visible ? "Ocultar valores" : "Mostrar valores"}
      aria-pressed={visible}
    >
      {visible ? (
        <Eye className="size-4" aria-hidden />
      ) : (
        <EyeOff className="size-4" aria-hidden />
      )}
    </Button>
  );
}
