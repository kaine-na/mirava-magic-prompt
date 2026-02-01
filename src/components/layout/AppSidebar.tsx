import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, Zap, PanelLeftClose, PanelLeft,
  Image, Video, ChevronDown, Sparkles,
  // Image style icons
  Layers, Eye, Star, Box, Palette, Camera, PenTool, Grid3X3,
  // Video style icons
  Clapperboard, Film, Play, Clock, FileText, Music, Timer,
  // Social/Support icons
  MessageCircle, Radio, ShoppingBag, Coffee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useClickSound } from "@/hooks/useClickSound";

// Menu structure with Image and Video as main menus, each with style sub-menus
const mainMenus = [
  { 
    id: "image", 
    title: "Image", 
    icon: Image, 
    color: "bg-primary",
    styles: [
      { id: "image-general", title: "General", icon: Layers },
      { id: "image-realistic", title: "Realistic", icon: Eye },
      { id: "image-anime", title: "Anime", icon: Star },
      { id: "image-3d", title: "3D Render", icon: Box },
      { id: "image-painting", title: "Painting", icon: Palette },
      { id: "image-photography", title: "Photography", icon: Camera },
      { id: "image-illustration", title: "Illustration", icon: PenTool },
      { id: "image-pixel-art", title: "Pixel Art", icon: Grid3X3 },
    ]
  },
  { 
    id: "video", 
    title: "Video", 
    icon: Video, 
    color: "bg-secondary",
    styles: [
      { id: "video-general", title: "General", icon: Clapperboard },
      { id: "video-cinematic", title: "Cinematic", icon: Film },
      { id: "video-animation", title: "Animation", icon: Play },
      { id: "video-slow-motion", title: "Slow Motion", icon: Clock },
      { id: "video-documentary", title: "Documentary", icon: FileText },
      { id: "video-music-video", title: "Music Video", icon: Music },
      { id: "video-timelapse", title: "Time-lapse", icon: Timer },
    ]
  },
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["image", "video"]);
  
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

  const toggleMenu = (menuId: string) => {
    playClick();
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
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
                    Mirava Magic
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
            "flex-1 flex flex-col gap-1 overflow-y-auto",
            isOpen ? "px-3" : "items-center"
          )}>
            {/* Settings at top */}
            <Link
              to="/settings"
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isOpen ? "gap-3 py-2 px-3 w-full" : "p-2 justify-center",
                isSettingsActive ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border-2 border-border-strong bg-muted flex items-center justify-center flex-shrink-0"
              >
                <Settings className="h-4 w-4" strokeWidth={2.5} />
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

            {/* Social/Support Links */}
            <a
              href="https://chat.whatsapp.com/Hrnt98Ls4mH5RaQuyti824"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isOpen ? "gap-3 py-2 px-3 w-full" : "p-2 justify-center",
                "hover:bg-green-500/10"
              )}
              title={!isOpen ? "Join Group WhatsApp" : undefined}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border-2 border-border-strong bg-green-500 flex items-center justify-center flex-shrink-0"
              >
                <MessageCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
              </motion.div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-semibold text-sm whitespace-nowrap"
                  >
                    Join Group WhatsApp
                  </motion.span>
                )}
              </AnimatePresence>
            </a>

            <a
              href="https://whatsapp.com/channel/0029Vb6eoYPLY6d04a4n8u0E"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isOpen ? "gap-3 py-2 px-3 w-full" : "p-2 justify-center",
                "hover:bg-green-500/10"
              )}
              title={!isOpen ? "Join Saluran WhatsApp" : undefined}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border-2 border-border-strong bg-green-600 flex items-center justify-center flex-shrink-0"
              >
                <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
              </motion.div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-semibold text-sm whitespace-nowrap"
                  >
                    Join Saluran WhatsApp
                  </motion.span>
                )}
              </AnimatePresence>
            </a>

            <a
              href="https://lynk.id/mirava"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isOpen ? "gap-3 py-2 px-3 w-full" : "p-2 justify-center",
                "hover:bg-primary/10"
              )}
              title={!isOpen ? "List My Product" : undefined}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border-2 border-border-strong bg-primary flex items-center justify-center flex-shrink-0"
              >
                <ShoppingBag className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </motion.div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-semibold text-sm whitespace-nowrap"
                  >
                    List My Product
                  </motion.span>
                )}
              </AnimatePresence>
            </a>

            <a
              href="https://trakteer.id/mirava"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isOpen ? "gap-3 py-2 px-3 w-full" : "p-2 justify-center",
                "hover:bg-amber-500/10"
              )}
              title={!isOpen ? "Buy Coffee For Me!" : undefined}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border-2 border-border-strong bg-amber-500 flex items-center justify-center flex-shrink-0"
              >
                <Coffee className="h-4 w-4 text-white" strokeWidth={2.5} />
              </motion.div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-semibold text-sm whitespace-nowrap"
                  >
                    Buy Coffee For Me!
                  </motion.span>
                )}
              </AnimatePresence>
            </a>

            <div className={cn(
              "my-2 border-t border-border",
              isOpen ? "" : "w-8"
            )} />

            {/* Generative AI Label */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 mb-1"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Generative AI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image & Video Menus */}
            {mainMenus.map((menu) => {
              const isExpanded = expandedMenus.includes(menu.id);
              const hasActiveChild = menu.styles.some(s => selectedPromptType === s.id);
              
              return (
                <div key={menu.id} className="mb-1">
                  {/* Main Menu Button */}
                  <button
                    onClick={() => isOpen && toggleMenu(menu.id)}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 w-full",
                      isOpen ? "gap-3 py-2 px-3 justify-between hover:bg-muted/30" : "p-2 justify-center",
                      hasActiveChild && "bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "w-9 h-9 rounded-full border-2 border-border-strong flex items-center justify-center flex-shrink-0",
                          menu.color
                        )}
                      >
                        <menu.icon className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                      </motion.div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-semibold text-sm whitespace-nowrap"
                          >
                            {menu.title}
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
                              isExpanded && "rotate-180"
                            )} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  
                  {/* Sub Menu Items (Styles) */}
                  <AnimatePresence>
                    {isOpen && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-[22px] mt-1 border-l-2 border-border ml-[18px]"
                      >
                        {menu.styles.map((style) => {
                          const isActive = selectedPromptType === style.id;
                          const StyleIcon = style.icon;
                          return (
                            <button
                              key={style.id}
                              onClick={() => handleSelectPromptType(style.id)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 w-full rounded-lg transition-all duration-200 text-left group",
                                isActive 
                                  ? "bg-primary/10 text-primary font-semibold" 
                                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <motion.div 
                                whileHover={{ scale: 1.15, rotate: [0, -10, 10, -5, 0] }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ 
                                  scale: { type: "spring", stiffness: 400, damping: 17 },
                                  rotate: { duration: 0.4, ease: "easeInOut" }
                                }}
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer",
                                  isActive 
                                    ? "bg-primary border-primary" 
                                    : "bg-muted border-border group-hover:border-primary/50 group-hover:bg-primary/10"
                                )}
                              >
                                <StyleIcon className={cn(
                                  "h-3 w-3 transition-colors duration-200",
                                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                                )} strokeWidth={2.5} />
                              </motion.div>
                              <span className="text-sm">{style.title}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
          <span className="font-heading font-bold leading-none">Mirava Magic</span>
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

                {/* Social/Support Links */}
                <a
                  href="https://chat.whatsapp.com/Hrnt98Ls4mH5RaQuyti824"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl transition-all duration-200 hover:bg-green-500/10"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full border-2 border-border-strong bg-green-500 flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-semibold text-sm">Join Group WhatsApp</span>
                </a>

                <a
                  href="https://whatsapp.com/channel/0029Vb6eoYPLY6d04a4n8u0E"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl transition-all duration-200 hover:bg-green-500/10"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full border-2 border-border-strong bg-green-600 flex items-center justify-center"
                  >
                    <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-semibold text-sm">Join Saluran WhatsApp</span>
                </a>

                <a
                  href="https://lynk.id/mirava"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl transition-all duration-200 hover:bg-primary/10"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full border-2 border-border-strong bg-primary flex items-center justify-center"
                  >
                    <ShoppingBag className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-semibold text-sm">List My Product</span>
                </a>

                <a
                  href="https://trakteer.id/mirava"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl transition-all duration-200 hover:bg-amber-500/10"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full border-2 border-border-strong bg-amber-500 flex items-center justify-center"
                  >
                    <Coffee className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-semibold text-sm">Buy Coffee For Me!</span>
                </a>

                <div className="my-3 border-t border-border" />

                {/* Generative AI Label */}
                <div className="flex items-center gap-2 px-1 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Generative AI
                  </span>
                </div>
                
                {/* Image & Video Menus */}
                {mainMenus.map((menu) => (
                  <div key={menu.id} className="mb-1">
                    <div className="flex items-center gap-2 py-1.5 px-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 border-border-strong flex items-center justify-center",
                        menu.color
                      )}>
                        <menu.icon className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-sm">{menu.title}</span>
                    </div>
                    <div className="pl-5 border-l-2 border-border ml-4">
                      {menu.styles.map((style) => {
                        const isActive = selectedPromptType === style.id;
                        const StyleIcon = style.icon;
                        return (
                          <button
                            key={style.id}
                            onClick={() => {
                              onSelectPromptType(style.id);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 py-1.5 px-2 w-full rounded-lg transition-all duration-200 text-left group",
                              isActive 
                                ? "bg-primary/10 text-primary font-semibold" 
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <motion.div 
                              whileHover={{ scale: 1.15, rotate: [0, -10, 10, -5, 0] }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ 
                                scale: { type: "spring", stiffness: 400, damping: 17 },
                                rotate: { duration: 0.4, ease: "easeInOut" }
                              }}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer",
                                isActive 
                                  ? "bg-primary border-primary" 
                                  : "bg-muted border-border group-hover:border-primary/50 group-hover:bg-primary/10"
                              )}
                            >
                              <StyleIcon className={cn(
                                "h-3 w-3 transition-colors duration-200",
                                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                              )} strokeWidth={2.5} />
                            </motion.div>
                            <span className="text-sm">{style.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
