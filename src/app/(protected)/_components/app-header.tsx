"use client";

import * as React from "react";

import {
  CalendarDays,
  Home,
  Menu,
  MoreHorizontal,
  Users,
  Wallet,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuSub,
  NavigationMenuSubItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/routes";

type NavItem = {
  label: string;
  href: string;
  matchPath?: string;
};

const desktopSections = {
  dashboard: {
    label: "Início",
    href: ROUTES.DASHBOARD,
  },
  agenda: {
    label: "Agenda",
    href: ROUTES.APPOINTMENTS,
    items: [
      {
        label: "Calendário",
        description: "Visualize a agenda completa da clínica.",
        href: ROUTES.APPOINTMENTS,
      },
      {
        label: "Lista do Dia",
        description: "Veja todos os atendimentos agendados para hoje.",
        href: ROUTES.APPOINTMENTS,
      },
      {
        label: "Profissionais",
        description: "Filtre a agenda por dentista ou sala.",
        href: ROUTES.DOCTORS,
      },
    ],
  },
  patients: {
    label: "Pacientes",
    href: ROUTES.PATIENTS,
    items: [
      {
        label: "Buscar Paciente",
        description: "Encontre rapidamente qualquer paciente da clínica.",
        href: ROUTES.PATIENTS,
      },
      {
        label: "Prontuários",
        description: "Acesse o histórico clínico completo.",
        href: ROUTES.PATIENTS,
      },
      {
        label: "Orçamentos",
        description: "Gerencie planos de tratamento e orçamentos.",
        href: ROUTES.FINANCIAL,
      },
    ],
  },
  financial: {
    label: "Financeiro",
    href: ROUTES.FINANCIAL,
    items: [
      {
        label: "Recebimentos",
        description: "Controle os pagamentos recebidos.",
        href: ROUTES.FINANCIAL,
      },
      {
        label: "Despesas",
        description: "Registre e acompanhe os custos da clínica.",
        href: ROUTES.FINANCIAL,
      },
    ],
  },
} as const;

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (!session || !session.data) {
    return null;
  }

  const { user } = session.data;

  const userName = user?.name ?? "Usuário";
  const userEmail = user?.email ?? "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleNewAppointment = () => {
    router.push(ROUTES.APPOINTMENTS);
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTES.LOGIN);
        },
      },
    });
  };

  const isActive = (matchPath?: string) => {
    if (!matchPath) return false;
    return pathname.startsWith(matchPath);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/90 px-4 py-2 shadow-sm backdrop-blur md:flex md:items-center md:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Home className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              {user?.clinic?.name ?? "Clínica Odontológica"}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <NavigationMenu>
            {/* Início */}
            <NavigationMenuItem>
              <Button
                asChild
                variant={isActive(ROUTES.DASHBOARD) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-3 text-xs font-medium",
                  !isActive(ROUTES.DASHBOARD) &&
                    "bg-transparent hover:bg-muted/70",
                )}
              >
                <Link href={desktopSections.dashboard.href}>
                  Início
                </Link>
              </Button>
            </NavigationMenuItem>

            {/* Agenda */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Agenda</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSub>
                  {desktopSections.agenda.items.map((item) => (
                    <NavigationMenuSubItem
                      key={item.label}
                      title={item.label}
                      description={item.description}
                      href={item.href}
                      icon={<CalendarDays className="size-3.5" />}
                      active={isActive(item.href)}
                    />
                  ))}
                </NavigationMenuSub>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Pacientes */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Pacientes</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSub>
                  {desktopSections.patients.items.map((item) => (
                    <NavigationMenuSubItem
                      key={item.label}
                      title={item.label}
                      description={item.description}
                      href={item.href}
                      icon={<Users className="size-3.5" />}
                      active={isActive(item.href)}
                    />
                  ))}
                </NavigationMenuSub>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Financeiro */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Financeiro</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSub>
                  {desktopSections.financial.items.map((item) => (
                    <NavigationMenuSubItem
                      key={item.label}
                      title={item.label}
                      description={item.description}
                      href={item.href}
                      icon={<Wallet className="size-3.5" />}
                      active={isActive(item.href)}
                    />
                  ))}
                </NavigationMenuSub>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-2 py-1 text-left text-xs transition-colors hover:bg-muted">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 flex-col sm:flex">
                  <span className="truncate text-xs font-medium">
                    {userName}
                  </span>
                  {userEmail && (
                    <span className="text-muted-foreground truncate text-[10px]">
                      {userEmail}
                    </span>
                  )}
                </div>
                <MoreHorizontal className="ml-1 size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.FINANCIAL}>
                  <Wallet className="mr-2 size-4" />
                  <span>Financeiro</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <span className="text-destructive font-normal">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center md:hidden">
        <div className="pointer-events-auto relative flex w-full max-w-md items-center justify-between gap-2 rounded-t-3xl border border-border/60 bg-background/95 px-4 pb-3 pt-2 shadow-[0_-6px_18px_rgba(0,0,0,0.45)] backdrop-blur">
          {/* Left items */}
          <button
            type="button"
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 text-[11px] font-medium transition-colors",
              isActive(ROUTES.DASHBOARD)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Home className="mb-0.5 size-5" />
            <span>Início</span>
          </button>

          <button
            type="button"
            onClick={() => router.push(ROUTES.APPOINTMENTS)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 text-[11px] font-medium transition-colors",
              isActive(ROUTES.APPOINTMENTS)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CalendarDays className="mb-0.5 size-5" />
            <span>Agenda</span>
          </button>

          {/* Central FAB */}
          <button
            type="button"
            onClick={handleNewAppointment}
            className="absolute -top-6 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/40 transition-transform active:scale-95"
            aria-label="Novo agendamento"
          >
            <Plus className="size-6" />
          </button>

          <button
            type="button"
            onClick={() => router.push(ROUTES.PATIENTS)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 text-[11px] font-medium transition-colors",
              isActive(ROUTES.PATIENTS)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Users className="mb-0.5 size-5" />
            <span>Pacientes</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 text-[11px] font-medium transition-colors",
              "text-muted-foreground hover:text-foreground",
            )}
          >
            <Menu className="mb-0.5 size-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile extra menu as Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="space-y-4 pb-6">
          <SheetHeader className="text-left">
            <SheetTitle>Mais opções</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                router.push(ROUTES.FINANCIAL);
              }}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Financeiro</span>
                <span className="text-muted-foreground text-[11px]">
                  Recebimentos &amp; despesas
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                router.push(ROUTES.DASHBOARD);
              }}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Home className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Dashboard</span>
                <span className="text-muted-foreground text-[11px]">
                  Visão geral da clínica
                </span>
              </div>
            </button>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                router.push(ROUTES.DASHBOARD);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/60"
            >
              <span>Configurações</span>
              <MoreHorizontal className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                void handleSignOut();
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              <span>Sair</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

