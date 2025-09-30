import { Check } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DOCTOR_COLORS, getColorName } from "@/helpers/doctor-colors";
import { cn } from "@/lib/utils";

// Props do componente de amostra de cor
interface ColorSwatchProps {
  color: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  name,
  isSelected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "focus:ring-ring flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none",
      isSelected && "ring-primary ring-2 ring-offset-2",
    )}
    style={{ backgroundColor: color }}
    title={name}
  >
    {isSelected && <Check className="h-5 w-5 text-white" />}
    <span className="sr-only">{name}</span>
  </button>
);

const ColorSelect = () => {
  const { control, watch, setValue } = useFormContext();
  const currentColor = watch("color");
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name="color"
      render={() => (
        <FormItem>
          <FormLabel>Cor da Agenda</FormLabel>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start text-left font-normal"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: currentColor }}
                    />
                    <span>
                      {currentColor
                        ? getColorName(currentColor)
                        : "Selecione uma cor"}
                    </span>
                  </div>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="grid grid-cols-5 gap-2 p-2">
                {DOCTOR_COLORS.map((doctorColor) => (
                  <ColorSwatch
                    key={doctorColor.value}
                    color={doctorColor.hex}
                    name={doctorColor.name}
                    isSelected={currentColor === doctorColor.value}
                    onClick={() => {
                      setValue("color", doctorColor.value, {
                        shouldDirty: true,
                      });
                      setIsOpen(false); 
                    }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ColorSelect;
