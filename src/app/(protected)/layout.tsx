import type { ReactNode } from "react";

import { AppHeader } from "./_components/app-header";

export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      {/* pb compensa a bottom nav fixa no mobile (FAB + barra) */}
      <main className="flex flex-1 flex-col pb-24 md:pb-0">{children}</main>
    </div>
  );
}
