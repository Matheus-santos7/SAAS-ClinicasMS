import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Procedure = { name: string; value: number; quantity: number };
type Doctor = { id: string; name: string };
type Clinic = { id: string; name: string };

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    patientId: string;
    doctorId: string;
    clinicId: string;
    procedures: Procedure[];
    total: number;
    observations: string;
  }) => void;
  doctors: Doctor[];
  clinics: Clinic[];
  patientId: string;
  initial?: {
    doctorId?: string;
    clinicId?: string;
    procedures?: Procedure[];
    total?: number;
    observations?: string;
  };
}

export function BudgetModal({
  open,
  onClose,
  onSubmit,
  doctors,
  clinics,
  patientId,
  initial,
}: BudgetModalProps) {
  const [doctorId, setDoctorId] = useState<string>(initial?.doctorId || "");
  const [clinicId, setClinicId] = useState<string>(initial?.clinicId || "");
  const [procedures, setProcedures] = useState<Procedure[]>(
    initial?.procedures || [{ name: "", value: 0, quantity: 1 }],
  );
  const [total, setTotal] = useState<number>(initial?.total || 0);
  const [observations, setObservations] = useState<string>(
    initial?.observations || "",
  );

  function handleProcedureChange(
    idx: number,
    field: keyof Procedure,
    value: string | number,
  ) {
    const updated = procedures.map((p, i) =>
      i === idx
        ? {
            ...p,
            [field]:
              field === "value" || field === "quantity" ? Number(value) : value,
          }
        : p,
    );
    setProcedures(updated);
    setTotal(updated.reduce((sum, p) => sum + p.value * p.quantity, 0));
  }

  function addProcedure() {
    setProcedures([...procedures, { name: "", value: 0, quantity: 1 }]);
  }

  function removeProcedure(idx: number) {
    const filtered = procedures.filter((_, i) => i !== idx);
    setProcedures(filtered);
    setTotal(filtered.reduce((sum, p) => sum + p.value * p.quantity, 0));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      patientId,
      doctorId,
      clinicId,
      procedures,
      total,
      observations,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Orçamento</DialogTitle>
        <DialogContent>
          <div className="space-y-2">
            <label>Médico</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <label>Clínica</label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label>Procedimentos</label>
            {procedures.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Nome"
                  value={p.name}
                  onChange={(e) =>
                    handleProcedureChange(idx, "name", e.target.value)
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Valor"
                  value={p.value}
                  min={0}
                  onChange={(e) =>
                    handleProcedureChange(idx, "value", e.target.value)
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={p.quantity}
                  min={1}
                  onChange={(e) =>
                    handleProcedureChange(idx, "quantity", e.target.value)
                  }
                  required
                />
                <Button
                  type="button"
                  onClick={() => removeProcedure(idx)}
                  variant="destructive"
                >
                  Remover
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addProcedure}>
              Adicionar procedimento
            </Button>
            <label>Observações</label>
            <Input
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações"
            />
            <div className="mt-2 font-bold">Total: R$ {total.toFixed(2)}</div>
          </div>
        </DialogContent>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="submit">Salvar</Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
