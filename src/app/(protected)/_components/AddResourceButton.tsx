import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface AddResourceButtonProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

export function AddResourceButton({
  label,
  onClick,
  icon,
}: AddResourceButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      className="flex items-center gap-2 text-sm sm:gap-2 sm:text-base"
      size="sm"
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Adicionar</span>
    </Button>
  );
}
