"use client";

import { CalendarIcon, ClockIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDoctor } from "@/actions/doctors/delete-doctor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Doctor } from "@/types";

import { getAvailability } from "../_helpers/availability";
import UpsertDoctorForm from "./upsert-doctor-form";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const [isUpsertDoctorDialogOpen, setIsUpsertDoctorDialogOpen] =
    useState(false);
  const deleteDoctorAction = useAction(deleteDoctor, {
    onSuccess: () => {
      toast.success("Médico deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar médico.");
    },
  });
  const handleDeleteDoctorClick = () => {
    if (!doctor) return;
    deleteDoctorAction.execute({ id: doctor.id });
  };

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");
  const availability = getAvailability(doctor);

  return (
    <Card className="h-full max-w-sm transition-shadow hover:shadow-md">
      <CardHeader className="px-2 pb-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-10 w-10 sm:w-10 lg:h-10">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {doctorInitials}
                </AvatarFallback>
              </Avatar>
              {/* Indicador de cor do médico */}
              <div
                className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: doctor.color }}
                title="Cor da agenda"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold">{doctor.name}</h3>
              <p className="text-muted-foreground truncate text-sm">
                {doctor.specialty}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {/* Mobile: horário e dia na mesma linha */}
          <div className="sm:hidden">
            <Badge variant="outline" className="w-full justify-center text-sm">
              <CalendarIcon className="mr-1 h-1 w-1" />
              <span className="truncate">
                {availability.from.format("ddd")} -{" "}
                {availability.to.format("ddd")}
              </span>
              <span className="mx-2">•</span>
              <ClockIcon className="mr-1 h-3 w-3" />
              <span>
                {availability.from.format("HH:mm")} -{" "}
                {availability.to.format("HH:mm")}
              </span>
            </Badge>
          </div>

          {/* Desktop: separado em duas linhas */}
          <div className="hidden space-y-1 sm:block">
            <Badge variant="outline" className="w-full justify-start text-sm">
              <CalendarIcon className="mr-1 h-3 w-3" />
              <span className="truncate">
                {availability.from.format("ddd")} -{" "}
                {availability.to.format("ddd")}
              </span>
            </Badge>
            <Badge variant="outline" className="w-full justify-start text-sm">
              <ClockIcon className="mr-1 h-3 w-3" />
              <span>
                {availability.from.format("HH:mm")} -{" "}
                {availability.to.format("HH:mm")}
              </span>
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-1 px-3 pt-0">
        <div className="flex gap-1">
          <Dialog
            open={isUpsertDoctorDialogOpen}
            onOpenChange={setIsUpsertDoctorDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="h-8 flex-1 text-xs">Ver detalhes</Button>
            </DialogTrigger>
            <UpsertDoctorForm
              doctor={{
                ...doctor,
                availableFromTime: availability.from.format("HH:mm:ss"),
                availableToTime: availability.to.format("HH:mm:ss"),
              }}
              onSuccess={() => setIsUpsertDoctorDialogOpen(false)}
              isOpen={isUpsertDoctorDialogOpen}
            />
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <TrashIcon className="h-3 w-3" />
                <span className="sr-only">Deletar médico</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base">
                  Deletar {doctor.name}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Essa ação não pode ser revertida. Isso irá deletar o médico e
                  todas as consultas agendadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                <AlertDialogCancel className="w-full sm:w-auto">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteDoctorClick}
                  className="w-full sm:w-auto"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
