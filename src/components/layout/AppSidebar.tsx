import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sparkles, Settings, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Prompt Generator",
    url: "/",
    icon: Sparkles,
    color: "bg-primary",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "bg-secondary",
  },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-40 h-screen w-72 bg-card border-r-2 border-foreground transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 animate-pop-in">
            <div className="relative">
              <div className="w-12 h-12 bg-tertiary rounded-full border-2 border-foreground shadow-hard flex items-center justify-center">
                <Zap className="h-6 w-6 text-tertiary-foreground" strokeWidth={2.5} />
              </div>
              {/* Decorative circle */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-foreground animate-bounce" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl">PromptGen</h1>
              <p className="text-xs text-muted-foreground">AI Prompt Magic ✨</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-3">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.url;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 group animate-pop-in",
                    isActive
                      ? "bg-card border-foreground shadow-hard"
                      : "border-transparent hover:border-border hover:bg-muted"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center transition-all duration-300 group-hover:animate-wiggle",
                      item.color
                    )}
                  >
                    <item.icon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className={cn("font-semibold", isActive && "text-foreground")}>
                    {item.title}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Decorative shapes */}
          <div className="relative h-32">
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-quaternary/20 rounded-full animate-float" />
            <div className="absolute bottom-8 right-4 w-8 h-8 bg-tertiary/30 rotate-45 animate-float animation-delay-500" />
            <div className="absolute bottom-16 left-8 w-6 h-6 bg-secondary/20 rounded-full animate-float animation-delay-200" />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Made with 💜 for creators
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
