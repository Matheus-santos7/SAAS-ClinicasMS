import { Plus } from "lucide-react"; // Importe o ícone de "+"
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
    <>
      {/* Botão para Desktop (sm e acima) */}
      <Button
        onClick={onClick}
        variant="default"
        // 'hidden' em telas pequenas, 'flex' em telas 'sm' ou maiores
        className="hidden items-center gap-2 text-sm sm:flex sm:gap-2 sm:text-base"
        size="sm"
      >
        {icon && <span className="h-4 w-4">{icon}</span>}
        <span className="">{label}</span>
      </Button>

      {/* Botão Flutuante (FAB) para Mobile (escondido em 'sm' e acima) */}
      <Button
        onClick={onClick}
        variant="default"
        size="icon"
        // Mostrado em telas pequenas, 'hidden' em 'sm' ou maiores
        className="fixed z-40 right-4 bottom-4 h-14 w-14 rounded-full shadow-lg sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}
