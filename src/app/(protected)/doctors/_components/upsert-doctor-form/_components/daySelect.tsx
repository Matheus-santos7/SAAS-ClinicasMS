import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DaySelect = () => {
  const form = useFormContext();
  return (
    <div className="flex gap-4">
      <FormField
        control={form.control}
        name="availableFromWeekDay"
        render={({
          field,
        }: {
          field: import("react-hook-form").ControllerRenderProps<
            import("react-hook-form").FieldValues,
            string
          >;
        }) => (
          <FormItem className="flex-1">
            <FormLabel>Dia Início</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">Domingo</SelectItem>
                <SelectItem value="1">Segunda</SelectItem>
                <SelectItem value="2">Terça</SelectItem>
                <SelectItem value="3">Quarta</SelectItem>
                <SelectItem value="4">Quinta</SelectItem>
                <SelectItem value="5">Sexta</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="availableToWeekDay"
        render={({
          field,
        }: {
          field: import("react-hook-form").ControllerRenderProps<
            import("react-hook-form").FieldValues,
            string
          >;
        }) => (
          <FormItem className="flex-1">
            <FormLabel>Dia Fim</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">Domingo</SelectItem>
                <SelectItem value="1">Segunda</SelectItem>
                <SelectItem value="2">Terça</SelectItem>
                <SelectItem value="3">Quarta</SelectItem>
                <SelectItem value="4">Quinta</SelectItem>
                <SelectItem value="5">Sexta</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DaySelect;
