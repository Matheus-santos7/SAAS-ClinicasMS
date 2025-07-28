"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { searchPatients } from "@/actions/search-patients";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { patientsTable } from "@/db/schema";

const searchSchema = z.object({
  searchTerm: z.string().trim().min(1, "Digite algo para buscar."),
  searchType: z.enum(["name", "phone", "cpf"], {
    required_error: "Selecione o tipo de busca.",
  }),
});

type SearchSchema = z.infer<typeof searchSchema>;
type Patient = typeof patientsTable.$inferSelect;

interface PatientSearchFormProps {
  isOpen: boolean;
  onSuccess?: (results: Patient[]) => void;
}

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 11
    ? `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    : phone;
};

const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.length === 11
    ? `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
    : cpf;
};

const SearchTypeSelect = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name="searchType"
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel>Tipo de busca</FormLabel>
        <FormControl>
          <select
            {...field}
            className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="name">Nome</option>
            <option value="phone">Telefone</option>
            <option value="cpf">CPF</option>
          </select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const SearchInput = ({
  control,
  searchType,
}: {
  control: any;
  searchType: string;
}) => (
  <FormField
    control={control}
    name="searchTerm"
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel>Termo de busca</FormLabel>
        <FormControl>
          {searchType === "phone" ? (
            <PatternFormat
              format="(##) #####-####"
              mask="_"
              placeholder="(11) 99999-9999"
              value={field.value}
              onValueChange={(value) => field.onChange(value.value)}
              customInput={Input}
              className="h-12 w-full text-base"
            />
          ) : searchType === "cpf" ? (
            <PatternFormat
              format="###.###.###-##"
              mask="_"
              placeholder="123.456.789-00"
              value={field.value}
              onValueChange={(value) => field.onChange(value.value)}
              customInput={Input}
              className="h-12 w-full text-base"
            />
          ) : (
            <Input
              placeholder="Digite o nome completo do paciente"
              {...field}
              className="h-12 w-full text-base"
            />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const PatientResult = ({ patient }: { patient: Patient }) => (
  <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3">
    <div className="flex-1">
      <p className="font-medium">{patient.name}</p>
      <p className="text-muted-foreground text-sm">
        {patient.email} • {formatPhoneNumber(patient.phoneNumber)}
      </p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => console.log("Ver paciente:", patient.id)}
    >
      Ver detalhes
    </Button>
  </div>
);

const PatientSearchForm = ({ isOpen, onSuccess }: PatientSearchFormProps) => {
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const form = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: { searchTerm: "", searchType: "name" },
  });

  const { execute, isPending } = useAction(searchPatients, {
    onSuccess: ({ data }) => {
      if (data) {
        setSearchResults(data);
        onSuccess?.(data);
        toast.success(`${data.length} paciente(s) encontrado(s)`);
      }
    },
    onError: () => toast.error("Erro ao buscar pacientes"),
  });

  const clearSearch = useCallback(() => {
    form.reset();
    setSearchResults([]);
  }, [form]);

  const searchType = form.watch("searchType");
  const hasSearchTerm = !!form.watch("searchTerm");

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Buscar Pacientes</DialogTitle>
        <DialogDescription>
          Busque pacientes por nome completo, telefone ou CPF
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(execute)} className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/3">
              <SearchTypeSelect control={form.control} />
            </div>
            <div className="flex-1">
              <SearchInput control={form.control} searchType={searchType} />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={clearSearch}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Search className="mr-2 h-4 w-4" />
              {isPending ? "Buscando..." : "Buscar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>

      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">
            Resultados da busca ({searchResults.length})
          </h3>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {searchResults.map((patient) => (
              <PatientResult key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && hasSearchTerm && !isPending && (
        <div className="text-muted-foreground mt-6 text-center">
          Nenhum paciente encontrado com os critérios informados.
        </div>
      )}
    </DialogContent>
  );
};

export default PatientSearchForm;
