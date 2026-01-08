import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background bg-dots">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
