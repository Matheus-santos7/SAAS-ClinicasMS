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
    <Button onClick={onClick} variant="default">
      {icon}
      {label}
    </Button>
  );
}
