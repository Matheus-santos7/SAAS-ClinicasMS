"use client";

import { useEffect, useRef } from "react";

import { useMobileNavFabStore } from "@/stores";

/**
 * Registra a ação do botão + central da navegação mobile (md:hidden).
 * O handler mais recente vence; o cleanup remove o registro ao desmontar.
 */
export function useRegisterMobileNavFab(
  handler: () => void,
  ariaLabel: string,
  enabled = true,
) {
  const register = useMobileNavFabStore((s) => s.register);
  const unregister = useMobileNavFabStore((s) => s.unregister);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    register(() => handlerRef.current(), ariaLabel);
    return unregister;
  }, [enabled, ariaLabel, register, unregister]);
}
