import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, Zap, Pin, PinOff,
  Image, Video, Box, Music, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClickSound } from "@/hooks/useClickSound";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("sidebar-pinned");
    return saved === "true";
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick } = useClickSound();

  // Save pin state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-pinned", isPinned.toString());
  }, [isPinned]);

  const isOpen = isPinned || isHovered;

  const handleSelectPromptType = (typeId: string) => {
    playClick();
    if (onSelectPromptType) {
      onSelectPromptType(typeId);
    }
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const togglePin = () => {
    playClick();
    setIsPinned(!isPinned);
  };

  const isSettingsActive = location.pathname === "/settings";

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col h-full bg-sidebar border-r-2 border-foreground flex-shrink-0 relative"
        initial={false}
        animate={{ width: isOpen ? 200 : 56 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full px-2 py-4">
          {/* Header: Logo + Pin */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-tertiary rounded-full border-2 border-foreground shadow-hard-sm flex items-center justify-center">
                  <Zap className="h-4 w-4 text-tertiary-foreground" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-foreground" />
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <h1 className="font-heading font-bold text-sm whitespace-nowrap">PromptGen</h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
            
            {/* Pin Toggle */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={togglePin}
                          className={cn(
                            "p-1.5 rounded-lg transition-all duration-200",
                            isPinned 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted text-muted-foreground"
                          )}
                        >
                          {isPinned ? (
                            <Pin className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            <PinOff className="h-4 w-4" strokeWidth={2.5} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {isPinned ? "Unpin sidebar" : "Pin sidebar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 flex flex-col gap-1">
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1"
                >
                  Generative AI
                </motion.span>
              )}
            </AnimatePresence>
            
            <TooltipProvider delayDuration={0}>
              {promptTypes.map((item) => {
                const isActive = selectedPromptType === item.id;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSelectPromptType(item.id)}
                        className={cn(
                          "flex items-center gap-2.5 py-2 px-1.5 rounded-lg transition-all duration-200 group/item w-full",
                          isActive ? "bg-muted" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center",
                              item.color
                            )}
                          >
                            <item.icon className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
                          </motion.div>
                          {/* Active dot */}
                          <AnimatePresence>
                            {isActive && (
                              <>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                                  transition={{ duration: 1.2, repeat: Infinity }}
                                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full"
                                />
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-foreground"
                                />
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className={cn(
                                "text-sm whitespace-nowrap overflow-hidden",
                                isActive ? "font-semibold" : "font-medium"
                              )}
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </TooltipTrigger>
                    {!isOpen && (
                      <TooltipContent side="right" className="font-semibold">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </TooltipProvider>

            {/* Divider */}
            <div className="my-2 border-t border-border" />

            {/* Settings */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/settings"
                    className={cn(
                      "flex items-center gap-2.5 py-2 px-1.5 rounded-lg transition-all duration-200 w-full",
                      isSettingsActive ? "bg-muted" : "hover:bg-muted/50"
                    )}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-7 h-7 rounded-full border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0"
                    >
                      <Settings className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </motion.div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="font-semibold text-sm whitespace-nowrap"
                        >
                          Settings
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" className="font-semibold">
                    Settings
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </nav>

          {/* Footer */}
          <AnimatePresence>
            {isOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground text-center mt-4"
              >
                Made with 💜 for creators
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <MobileSidebar
        selectedPromptType={selectedPromptType}
        onSelectPromptType={handleSelectPromptType}
        isSettingsActive={isSettingsActive}
      />
    </>
  );
}

function MobileSidebar({ 
  selectedPromptType, 
  onSelectPromptType,
  isSettingsActive 
}: { 
  selectedPromptType?: string;
  onSelectPromptType: (id: string) => void;
  isSettingsActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-sidebar border-b-2 border-foreground flex items-center justify-between px-4 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-tertiary rounded-full border-2 border-foreground shadow-hard-sm flex items-center justify-center">
            <Zap className="h-4 w-4 text-tertiary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold">PromptGen</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-muted"
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
          >
            {isOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-14 bottom-0 w-64 bg-sidebar border-r-2 border-foreground z-50 p-4"
            >
              <nav className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                  Generative AI
                </span>
                
                {promptTypes.map((item) => {
                  const isActive = selectedPromptType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectPromptType(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all duration-200",
                        isActive ? "bg-muted" : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center",
                        item.color
                      )}>
                        <item.icon className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                      </div>
                      <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}

                <div className="my-3 border-t border-border" />

                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all duration-200",
                    isSettingsActive ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-foreground bg-muted flex items-center justify-center">
                    <Settings className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold text-sm">Settings</span>
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
