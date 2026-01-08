import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, Zap,
  Image, Video, Box, Music, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  AnimatedSidebar, 
  AnimatedSidebarBody, 
  AnimatedSidebarLink,
  useAnimatedSidebar 
} from "@/components/ui/animated-sidebar";
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
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectPromptType = (typeId: string) => {
    if (onSelectPromptType) {
      onSelectPromptType(typeId);
    }
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <AnimatedSidebar open={open} setOpen={setOpen}>
      <AnimatedSidebarBody className="justify-between gap-6">
        <SidebarContent 
          selectedPromptType={selectedPromptType}
          onSelectPromptType={handleSelectPromptType}
          open={open}
        />
      </AnimatedSidebarBody>
    </AnimatedSidebar>
  );
}

function SidebarContent({ 
  selectedPromptType, 
  onSelectPromptType,
  open 
}: { 
  selectedPromptType?: string;
  onSelectPromptType: (type: string) => void;
  open: boolean;
}) {
  const location = useLocation();
  const { playClick } = useClickSound();

  const handleItemClick = (id: string) => {
    playClick();
    onSelectPromptType(id);
  };

  return (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo */}
        {open ? <Logo /> : <LogoIcon />}
        
        {/* Prompt Types */}
        <motion.div 
          className="mt-6 flex flex-col gap-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
              }
            }
          }}
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: -10 },
              visible: { opacity: open ? 1 : 0, y: 0, height: open ? "auto" : 0 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2 overflow-hidden"
          >
            Generative AI
          </motion.span>
          
          <TooltipProvider delayDuration={0}>
            {promptTypes.map((item, idx) => {
              const isActive = selectedPromptType === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, x: -20, scale: 0.8 },
                        visible: { opacity: 1, x: 0, scale: 1 }
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        "flex items-center gap-2.5 py-2 px-1 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group/item",
                        isActive
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="relative">
                        <motion.div
                          animate={{
                            scale: open ? 1 : 0.95,
                            rotate: 0,
                          }}
                          whileHover={{
                            scale: 1.1,
                            rotate: [0, 3, -3, 0],
                            transition: { rotate: { duration: 0.4 } }
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center flex-shrink-0",
                            item.color
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
                        </motion.div>
                        {/* Active indicator dot */}
                        <AnimatePresence>
                          {isActive && (
                            <>
                              {/* Pulse ring */}
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                  scale: [1, 1.8, 1.8],
                                  opacity: [0.6, 0, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeOut",
                                }}
                                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full"
                              />
                              {/* Main dot */}
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 25,
                                }}
                                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-foreground"
                              />
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.span 
                        animate={{
                          display: open ? "inline-block" : "none",
                          opacity: open ? 1 : 0,
                          x: open ? 0 : -10,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className={cn(
                          "text-sm whitespace-pre",
                          isActive ? "font-semibold" : "font-medium group-hover/item:translate-x-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        )}
                      >
                        {item.title}
                      </motion.span>
                    </motion.button>
                  </TooltipTrigger>
                  {!open && (
                    <TooltipContent side="right" className="font-semibold">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Divider */}
          <div className="my-3 border-t border-border" />

          {/* Settings Link */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={cn(
                    "flex items-center gap-2.5 py-2 px-1 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group/item",
                    location.pathname === "/settings"
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  )}
                >
                  <motion.div 
                    animate={{ scale: open ? 1 : 0.95 }}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, 3, -3, 0],
                      transition: { rotate: { duration: 0.4 } }
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                    }}
                    className="w-7 h-7 rounded-full border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0"
                  >
                    <Settings className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </motion.div>
                  <motion.span
                    animate={{
                      display: open ? "inline-block" : "none",
                      opacity: open ? 1 : 0,
                      x: open ? 0 : -10,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="font-semibold text-sm whitespace-pre group-hover/item:translate-x-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  >
                    Settings
                  </motion.span>
                </Link>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right" className="font-semibold">
                  Settings
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <motion.p 
          animate={{
            opacity: open ? 1 : 0,
            height: open ? "auto" : 0,
          }}
          className="text-xs text-muted-foreground text-center overflow-hidden"
        >
          Made with 💜 for creators
        </motion.p>
      </div>
    </>
  );
}

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20"
    >
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 bg-tertiary rounded-full border-2 border-foreground shadow-hard-sm flex items-center justify-center">
          <Zap className="h-4 w-4 text-tertiary-foreground" strokeWidth={2.5} />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-foreground" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-w-0"
      >
        <h1 className="font-heading font-bold text-base whitespace-pre">PromptGen</h1>
        <p className="text-[10px] text-muted-foreground whitespace-pre">AI Prompt Magic ✨</p>
      </motion.div>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20"
    >
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 bg-tertiary rounded-full border-2 border-foreground shadow-hard-sm flex items-center justify-center">
          <Zap className="h-4 w-4 text-tertiary-foreground" strokeWidth={2.5} />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-foreground" />
      </div>
    </Link>
  );
};
