import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, Menu, X, Zap, ChevronDown, ChevronRight,
  Image, Video, Box, Music, Palette,
  Share2, Megaphone, Mail,
  MessageSquare, Code, FileText, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromptCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  items: {
    id: string;
    title: string;
    icon: React.ElementType;
    color: string;
  }[];
}

const promptCategories: PromptCategory[] = [
  {
    title: "Generative AI",
    icon: Wand2,
    color: "bg-primary",
    items: [
      { id: "image", title: "Image", icon: Image, color: "bg-primary" },
      { id: "video", title: "Video", icon: Video, color: "bg-secondary" },
      { id: "3d", title: "3D Model", icon: Box, color: "bg-quaternary" },
      { id: "music", title: "Music", icon: Music, color: "bg-tertiary" },
      { id: "art", title: "Art Style", icon: Palette, color: "bg-quaternary" },
    ],
  },
  {
    title: "Social & Marketing",
    icon: Share2,
    color: "bg-secondary",
    items: [
      { id: "social", title: "Social Media", icon: Share2, color: "bg-tertiary" },
      { id: "marketing", title: "Marketing", icon: Megaphone, color: "bg-secondary" },
      { id: "email", title: "Email", icon: Mail, color: "bg-tertiary" },
    ],
  },
  {
    title: "Text & Code",
    icon: Code,
    color: "bg-quaternary",
    items: [
      { id: "chat", title: "Chat/System", icon: MessageSquare, color: "bg-primary" },
      { id: "code", title: "Code", icon: Code, color: "bg-quaternary" },
      { id: "writing", title: "Writing", icon: FileText, color: "bg-primary" },
      { id: "custom", title: "Custom", icon: Wand2, color: "bg-secondary" },
    ],
  },
];

interface AppSidebarProps {
  selectedPromptType?: string;
  onSelectPromptType?: (type: string) => void;
}

export function AppSidebar({ selectedPromptType, onSelectPromptType }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Generative AI"]);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

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
          "fixed lg:relative z-40 h-screen w-72 bg-card border-r-2 border-foreground transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 p-2 animate-pop-in">
            <div className="relative">
              <div className="w-10 h-10 bg-tertiary rounded-full border-2 border-foreground shadow-hard-sm flex items-center justify-center">
                <Zap className="h-5 w-5 text-tertiary-foreground" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-foreground animate-bounce" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">PromptGen</h1>
              <p className="text-xs text-muted-foreground">AI Prompt Magic ✨</p>
            </div>
          </div>

          {/* Prompt Categories */}
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">
              Prompt Types
            </p>
            
            {promptCategories.map((category, catIndex) => {
              const isExpanded = expandedCategories.includes(category.title);
              const hasActiveItem = category.items.some((item) => item.id === selectedPromptType);
              
              return (
                <div key={category.title} className="animate-pop-in" style={{ animationDelay: `${catIndex * 50}ms` }}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300",
                      hasActiveItem
                        ? "border-foreground bg-muted shadow-hard-sm"
                        : "border-transparent hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center",
                        category.color
                      )}
                    >
                      <category.icon className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <span className="flex-1 text-left font-semibold text-sm">{category.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                      {category.items.map((item, itemIndex) => {
                        const isActive = selectedPromptType === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectPromptType(item.id)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 animate-pop-in",
                              isActive
                                ? "bg-card border-2 border-foreground shadow-hard-sm"
                                : "hover:bg-muted border-2 border-transparent"
                            )}
                            style={{ animationDelay: `${itemIndex * 30}ms` }}
                          >
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center",
                                item.color
                              )}
                            >
                              <item.icon className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                            </div>
                            <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>
                              {item.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Divider */}
            <div className="my-4 border-t border-border" />

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300",
                location.pathname === "/settings"
                  ? "border-foreground bg-card shadow-hard-sm"
                  : "border-transparent hover:border-border hover:bg-muted/50"
              )}
            >
              <div className="w-8 h-8 rounded-full border-2 border-foreground bg-muted flex items-center justify-center">
                <Settings className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm">Settings</span>
            </NavLink>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border mt-4">
            <p className="text-xs text-muted-foreground text-center">
              Made with 💜 for creators
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
