"use client";

import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Package,
  PieChart,
  Settings,
  Stethoscope,
  Target,
  UsersRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/routes";

// Estrutura completa de módulos para clínica odontológica
const mainItems = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
];

const clinicModules = [
  {
    title: "Agendamentos",
    icon: CalendarDays,
    url: ROUTES.APPOINTMENTS,
    subItems: [
      { title: "Agenda Geral", url: "/appointments" },
      { title: "Novo Agendamento", url: "/appointments" },
      { title: "Consultas do Dia", url: "/appointments" },
      { title: "Agendamentos Pendentes", url: "/appointments" },
      { title: "Reagendamentos", url: "/appointments" },
      { title: "Cancelamentos", url: "/appointments" },
    ],
  },
  {
    title: "Pacientes",
    icon: UsersRound,
    url: ROUTES.PATIENTS,
    subItems: [
      { title: "Lista de Pacientes", url: "/patients" },
      { title: "Novo Paciente", url: "/patients" },
      { title: "Fichas Clínicas", url: "/patients" },
      { title: "Histórico Médico", url: "/patients" },
      { title: "Anamnese", url: "/patients" },
      { title: "Evolução", url: "/patients" },
      { title: "Exames", url: "/patients" },
      { title: "Prontuário Digital", url: "/patients" },
    ],
  },
  {
    title: "Dentistas",
    icon: Stethoscope,
    url: ROUTES.DOCTORS,
    subItems: [
      { title: "Lista de Dentistas", url: "/doctors" },
      { title: "Novo Dentista", url: "/doctors" },
      { title: "Especialidades", url: "/doctors" },
      { title: "Horários de Atendimento", url: "/doctors" },
      { title: "Permissões", url: "/doctors" },
    ],
  },
  {
    title: "Financeiro",
    icon: Wallet,
    url: ROUTES.FINANCIAL,
    subItems: [
      { title: "Dashboard Financeiro", url: "/financial" },
      { title: "Receitas", url: "/financial" },
      { title: "Despesas", url: "/financial" },
      { title: "Fluxo de Caixa", url: "/financial" },
      { title: "Contas a Receber", url: "/financial" },
      { title: "Contas a Pagar", url: "/financial" },
      { title: "Relatórios", url: "/financial" },
      { title: "Impostos", url: "/financial" },
    ],
  },
  {
    title: "Tratamentos",
    icon: Heart,
    url: "/treatments",
    subItems: [
      { title: "Catálogo de Tratamentos", url: "/treatments" },
      { title: "Planos de Tratamento", url: "/treatments" },
      { title: "Orçamentos", url: "/treatments" },
      { title: "Procedimentos", url: "/treatments" },
      { title: "Materiais", url: "/treatments" },
      { title: "Preços", url: "/treatments" },
    ],
  },
  {
    title: "Estoque",
    icon: Package,
    url: "/inventory",
    subItems: [
      { title: "Produtos", url: "/inventory" },
      { title: "Movimentações", url: "/inventory" },
      { title: "Fornecedores", url: "/inventory" },
      { title: "Compras", url: "/inventory" },
      { title: "Controle de Validade", url: "/inventory" },
      { title: "Alertas de Estoque", url: "/inventory" },
    ],
  },
  {
    title: "Marketing",
    icon: Target,
    url: "/marketing",
    subItems: [
      { title: "Campanhas", url: "/marketing" },
      { title: "Leads", url: "/marketing" },
      { title: "Follow-up", url: "/marketing" },
      { title: "Promoções", url: "/marketing" },
      { title: "Indicações", url: "/marketing" },
      { title: "Fidelização", url: "/marketing" },
    ],
  },
  {
    title: "Relatórios",
    icon: PieChart,
    url: "/reports",
    subItems: [
      { title: "Relatório de Vendas", url: "/reports" },
      { title: "Relatório de Pacientes", url: "/reports" },
      { title: "Relatório de Dentistas", url: "/reports" },
      { title: "Relatório Financeiro", url: "/reports" },
      { title: "Relatório de Agendamentos", url: "/reports" },
      { title: "Relatório de Tratamentos", url: "/reports" },
      { title: "Relatório de Estoque", url: "/reports" },
    ],
  },
  {
    title: "Comunicação",
    icon: MessageSquare,
    url: "/communication",
    subItems: [
      { title: "SMS", url: "/communication" },
      { title: "E-mail", url: "/communication/" },
      { title: "WhatsApp", url: "/communication/" },
      { title: "Lembretes", url: "/communication/" },
      { title: "Notificações", url: "/communication/" },
      { title: "Templates", url: "/communication" },
    ],
  },
  {
    title: "Configurações",
    icon: Settings,
    url: "/settings",
    subItems: [
      { title: "Dados da Clínica", url: "/settings" },
      { title: "Usuários", url: "/settings" },
      { title: "Permissões", url: "/settings" },
      { title: "Integrações", url: "/settings" },
      { title: "Backup", url: "/settings" },
      { title: "Auditoria", url: "/settings" },
      { title: "Segurança", url: "/settings" },
    ],
  },
];

function AppSidebarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  if (!session || !session.data) {
    return null; // Ou um esqueleto de carregamento
  }

  const { user } = session.data;

  const toggleModule = (moduleTitle: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleTitle]: !prev[moduleTitle],
    }));
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

  const clinicName = user?.clinic?.name ?? "Sua Clínica";
  const userName = user?.name ?? "Usuário";
  const userEmail = user?.email;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Building2 />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {clinicName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  Plano {user.plan === "essential" ? "Essential" : "Básico"}
                </span>
              </div>
              <MoreHorizontal className="size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
            side="right"
            sideOffset={12}
          >
            <DropdownMenuLabel>Minha Clínica</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.url)}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Módulos Principais */}
        <SidebarGroup>
          <SidebarMenu>
            {clinicModules.map((module) => (
              <SidebarMenuItem key={module.title}>
                <SidebarMenuButton
                  tooltip={module.title}
                  onClick={() => toggleModule(module.title)}
                >
                  <module.icon />
                  <span>{module.title}</span>
                  {openModules[module.title] ? (
                    <ChevronDown className="ml-auto" />
                  ) : (
                    <ChevronRight className="ml-auto" />
                  )}
                </SidebarMenuButton>
                {openModules[module.title] && (
                  <SidebarMenuSub>
                    {module.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{userName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
              <MoreHorizontal className="size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
            side="right"
            sideOffset={12}
          >
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <AppSidebarContent />;
}
