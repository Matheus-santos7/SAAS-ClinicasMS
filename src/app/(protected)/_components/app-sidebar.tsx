"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UsersRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/routes";

const items = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Agendamentos",
    url: ROUTES.APPOINTMENTS,
    icon: CalendarDays,
  },
  {
    title: "Dentistas",
    url: ROUTES.DOCTORS,
    icon: Stethoscope,
  },
  {
    title: "Pacientes",
    url: ROUTES.PATIENTS,
    icon: UsersRound,
  },
  {
    title: "Financeiro",
    url: ROUTES.FINANCIAL,
    icon: Wallet,
  },
];

function AppSidebarContent() {
  const router = useRouter();
  const pathname = usePathname();

  // Hook deve ser chamado incondicionalmente
  const session = authClient.useSession();

  // Se não há dados de sessão, não renderizar
  if (!session || !session.data) {
    return null;
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTES.LOGIN);
        },
      },
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Image src="/logo.png" alt="Agenda" width={200} height={120} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hover:bg-secondary flex cursor-pointer items-center space-x-2 rounded p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {session.data?.user?.name?.slice(0, 2) || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="truncate text-sm font-medium">
                  {session.data?.user?.name || "Usuario"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {session.data?.user?.email}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
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

  // Verificar se estamos no lado do cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Não renderizar no lado do servidor para evitar problemas de hidratação
  if (!isClient) {
    return null;
  }

  return <AppSidebarContent />;
}
