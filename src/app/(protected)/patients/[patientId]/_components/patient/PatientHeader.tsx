"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientHeaderProps {
  name: string;
  email: string | null;
  imageUrl?: string | null;
}

// Função para extrair as iniciais do nome
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

export const PatientHeader = ({
  name,
  email,
  imageUrl,
}: PatientHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={imageUrl ?? undefined} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-muted-foreground">{email}</p>
      </div>
    </div>
  );
};
