import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, Zap, PanelLeftClose, PanelLeft,
  Image, Video, Box, Palette, ChevronDown, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useClickSound } from "@/hooks/useClickSound";

const generativeAITypes = [
  { id: "image", title: "Image", icon: Image, color: "bg-primary" },
  { id: "video", title: "Video", icon: Video, color: "bg-secondary" },
  { id: "3d", title: "3D Model", icon: Box, color: "bg-quaternary" },
  { id: "art", title: "Art Style", icon: Palette, color: "bg-tertiary" },
];

interface AppSidebarProps {
  selectedPromptType?: string;
  onSelectPromptType?: (type: string) => void;
}

export function AppSidebar({ selectedPromptType, onSelectPromptType }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar-open");
    return saved !== "false";
  });
  const [isGenAIOpen, setIsGenAIOpen] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick } = useClickSound();

  useEffect(() => {
    localStorage.setItem("sidebar-open", isOpen.toString());
  }, [isOpen]);

  const handleSelectPromptType = (typeId: string) => {
    playClick();
    if (onSelectPromptType) {
      onSelectPromptType(typeId);
    }
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    playClick();
    setIsOpen(!isOpen);
  };

  const isSettingsActive = location.pathname === "/settings";

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col h-screen bg-sidebar border-r-2 border-foreground flex-shrink-0 sticky top-0"
        initial={false}
        animate={{ width: isOpen ? 260 : 64 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full py-4">
          {/* Header */}
          <div className={cn(
            "flex items-center mb-6",
            isOpen ? "px-3 justify-between" : "justify-center"
          )}>
            {isOpen ? (
              <>
                <Link to="/" className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-tertiary rounded-full border-2 border-border-strong shadow-hard-sm flex items-center justify-center">
                      <Zap className="h-5 w-5 text-tertiary-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-border-strong" />
                  </div>
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-heading font-bold text-base whitespace-nowrap"
                  >
                    PromptGen
                  </motion.h1>
                </Link>
                
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <PanelLeftClose className="h-5 w-5" strokeWidth={2} />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <PanelLeft className="h-5 w-5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Menu Items */}
          <nav className={cn(
            "flex-1 flex flex-col gap-1",
            isOpen ? "px-3" : "items-center"
          )}>
            {/* Settings at top */}
            <Link
              to="/settings"
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isOpen ? "gap-3 py-2.5 px-2 w-full" : "p-2 justify-center",
                isSettingsActive ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full border-2 border-border-strong bg-muted flex items-center justify-center flex-shrink-0"
              >
                <Settings className="h-5 w-5" strokeWidth={2.5} />
              </motion.div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-semibold text-base whitespace-nowrap"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <div className={cn(
              "my-3 border-t border-border",
              isOpen ? "" : "w-10"
            )} />

            {/* Generative AI - Main Menu */}
            <div>
              <button
                onClick={() => {
                  playClick();
                  if (isOpen) setIsGenAIOpen(!isGenAIOpen);
                }}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 w-full",
                  isOpen ? "gap-3 py-2.5 px-2 justify-between" : "p-2 justify-center"
                )}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full border-2 border-border-strong bg-primary flex items-center justify-center flex-shrink-0"
                  >
                    <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-semibold text-base whitespace-nowrap"
                      >
                        Generative AI
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isGenAIOpen && "rotate-180"
                        )} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              
              {/* Sub Menu Items */}
              <AnimatePresence>
                {(isOpen ? isGenAIOpen : true) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("overflow-hidden", isOpen ? "ml-4 mt-1" : "")}
                  >
                    {generativeAITypes.map((item) => {
                      const isActive = selectedPromptType === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectPromptType(item.id)}
                          className={cn(
                            "flex items-center rounded-xl transition-all duration-200",
                            isOpen ? "gap-3 py-2 px-2 w-full" : "p-2 justify-center my-1",
                            isActive ? "bg-muted" : "hover:bg-muted/50"
                          )}
                        >
                          <div className="relative flex-shrink-0">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "rounded-full border-2 border-border-strong flex items-center justify-center",
                                isOpen ? "w-8 h-8" : "w-10 h-10",
                                item.color
                              )}
                            >
                              <item.icon className={cn("text-primary-foreground", isOpen ? "h-4 w-4" : "h-5 w-5")} strokeWidth={2.5} />
                            </motion.div>
                            <AnimatePresence>
                              {isActive && (
                                <>
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full"
                                  />
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full border-2 border-border-strong"
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
                                  "text-sm whitespace-nowrap",
                                  isActive ? "font-semibold" : "font-medium"
                                )}
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

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

      {/* Mobile */}
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
      <div className="fixed top-0 left-0 right-0 h-14 bg-sidebar border-b-2 border-border-strong flex items-center justify-between px-4 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-tertiary rounded-full border-2 border-border-strong shadow-hard-sm flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-tertiary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold leading-none">PromptGen</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-muted"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-14 bottom-0 w-64 bg-sidebar border-r-2 border-border-strong z-50 p-4"
            >
              <nav className="flex flex-col gap-1">
                {/* Settings at top */}
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-2 rounded-xl transition-all duration-200",
                    isSettingsActive ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-9 h-9 rounded-full border-2 border-border-strong bg-muted flex items-center justify-center">
                    <Settings className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold text-base">Settings</span>
                </Link>

                <div className="my-3 border-t border-border" />

                {/* Generative AI Header */}
                <div className="flex items-center gap-2 py-2 px-1">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Generative AI
                  </span>
                </div>
                
                {generativeAITypes.map((item) => {
                  const isActive = selectedPromptType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectPromptType(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 py-2 px-2 ml-3 rounded-xl transition-all duration-200",
                        isActive ? "bg-muted" : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 border-border-strong flex items-center justify-center",
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
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
