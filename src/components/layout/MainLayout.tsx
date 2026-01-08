import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: ReactNode;
  selectedPromptType?: string;
  onSelectPromptType?: (type: string) => void;
}

export function MainLayout({ children, selectedPromptType, onSelectPromptType }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background bg-dots">
      <AppSidebar 
        selectedPromptType={selectedPromptType} 
        onSelectPromptType={onSelectPromptType} 
      />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
