import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, Menu, X, Zap,
  Image, Video, Box, Music, Palette, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const promptTypes = [
  { id: "image", title: "Image", icon: Image, color: "bg-primary" },
  { id: "video", title: "Video", icon: Video, color: "bg-secondary" },
  { id: "3d", title: "3D Model", icon: Box, color: "bg-quaternary" },
  { id: "music", title: "Music", icon: Music, color: "bg-tertiary" },
  { id: "art", title: "Art Style", icon: Palette, color: "bg-quaternary" },
];

interface AppSidebarProps {
  selectedPromptType?: string;
  onSelectPromptType?: (type: string) => void;
}

export function AppSidebar({ selectedPromptType, onSelectPromptType }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectPromptType = (typeId: string) => {
    if (onSelectPromptType) {
      onSelectPromptType(typeId);
    }
    if (location.pathname !== "/") {
      navigate("/");
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-hard-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-0 z-40 h-screen w-64 lg:w-72 bg-card border-r-2 border-foreground transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-tertiary rounded-full border-2 border-foreground shadow-hard-sm flex items-center justify-center">
                <Zap className="h-5 w-5 text-tertiary-foreground" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-lg truncate">PromptGen</h1>
              <p className="text-xs text-muted-foreground truncate">AI Prompt Magic ✨</p>
            </div>
          </div>

          {/* Prompt Types */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Generative AI
            </p>
            
            {promptTypes.map((item) => {
              const isActive = selectedPromptType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPromptType(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200",
                    isActive
                      ? "border-foreground bg-card shadow-hard-sm"
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center flex-shrink-0",
                      item.color
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className={cn("text-sm truncate", isActive ? "font-semibold" : "font-medium")}>
                    {item.title}
                  </span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="my-3 border-t border-border" />

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200",
                location.pathname === "/settings"
                  ? "border-foreground bg-card shadow-hard-sm"
                  : "border-transparent hover:bg-muted/50"
              )}
            >
              <div className="w-7 h-7 rounded-full border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0">
                <Settings className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm">Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground text-center">
            Made with 💜 for creators
          </p>
        </div>
      </aside>
    </>
  );
}
