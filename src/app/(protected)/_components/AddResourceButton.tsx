import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddResourceButtonProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
}

export function AddResourceButton({
  label,
  onClick,
  icon,
  className,
}: AddResourceButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      className={cn(
        "inline-flex items-center gap-2 text-sm sm:text-base",
        className,
      )}
      size="sm"
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      <span>{label}</span>
    </Button>
  );
}
