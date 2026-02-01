import { useState } from "react";
import { Clock, Star, Trash2, Copy, Check, ChevronDown, ChevronUp, X, Download, FileJson, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptHistoryItem } from "@/hooks/usePromptHistory";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const promptTypeLabels: Record<string, string> = {
  // Legacy types
  image: "Image",
  video: "Video",
  social: "Social",
  "3d": "3D Model",
  chat: "Chat",
  code: "Code",
  music: "Music",
  writing: "Writing",
  marketing: "Marketing",
  email: "Email",
  art: "Art Style",
  custom: "Custom",
  // Image styles
  "image-general": "Image - General",
  "image-realistic": "Image - Realistic",
  "image-anime": "Image - Anime",
  "image-3d": "Image - 3D Render",
  "image-painting": "Image - Painting",
  "image-photography": "Image - Photography",
  "image-illustration": "Image - Illustration",
  "image-pixel-art": "Image - Pixel Art",
  // Video styles
  "video-general": "Video - General",
  "video-cinematic": "Video - Cinematic",
  "video-animation": "Video - Animation",
  "video-slow-motion": "Video - Slow Motion",
  "video-documentary": "Video - Documentary",
  "video-music-video": "Video - Music Video",
  "video-timelapse": "Video - Time-lapse",
};

const promptTypeColors: Record<string, string> = {
  // Legacy types
  image: "bg-primary",
  video: "bg-secondary",
  social: "bg-tertiary",
  "3d": "bg-quaternary",
  chat: "bg-primary",
  code: "bg-quaternary",
  music: "bg-tertiary",
  writing: "bg-primary",
  marketing: "bg-secondary",
  email: "bg-tertiary",
  art: "bg-quaternary",
  custom: "bg-secondary",
  // Image styles
  "image-general": "bg-primary",
  "image-realistic": "bg-primary",
  "image-anime": "bg-primary",
  "image-3d": "bg-primary",
  "image-painting": "bg-primary",
  "image-photography": "bg-primary",
  "image-illustration": "bg-primary",
  "image-pixel-art": "bg-primary",
  // Video styles
  "video-general": "bg-secondary",
  "video-cinematic": "bg-secondary",
  "video-animation": "bg-secondary",
  "video-slow-motion": "bg-secondary",
  "video-documentary": "bg-secondary",
  "video-music-video": "bg-secondary",
  "video-timelapse": "bg-secondary",
};

interface PromptHistoryPanelProps {
  history: PromptHistoryItem[];
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClear: () => void;
  onUsePrompt: (item: PromptHistoryItem) => void;
}

export function PromptHistoryPanel({
  history,
  onRemove,
  onToggleFavorite,
  onClear,
  onUsePrompt,
}: PromptHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 10;

  const filteredHistory = showFavoritesOnly
    ? history.filter((item) => item.isFavorite)
    : history;

  // Pagination calculations
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(1);
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const exportAsJSON = (exportFavoritesOnly: boolean) => {
    const dataToExport = exportFavoritesOnly
      ? history.filter((item) => item.isFavorite)
      : history;

    if (dataToExport.length === 0) {
      toast({
        title: "Nothing to export",
        description: exportFavoritesOnly ? "No favorites to export" : "No prompts to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = dataToExport.map((item) => ({
      type: promptTypeLabels[item.promptType] || item.promptType,
      input: item.userInput,
      prompt: item.generatedPrompt,
      createdAt: new Date(item.createdAt).toISOString(),
      isFavorite: item.isFavorite || false,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mirava-${exportFavoritesOnly ? "favorites" : "all"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✨ Exported!",
      description: `${dataToExport.length} prompt(s) exported as JSON`,
    });
  };

  const exportAsTXT = (exportFavoritesOnly: boolean) => {
    const dataToExport = exportFavoritesOnly
      ? history.filter((item) => item.isFavorite)
      : history;

    if (dataToExport.length === 0) {
      toast({
        title: "Nothing to export",
        description: exportFavoritesOnly ? "No favorites to export" : "No prompts to export",
        variant: "destructive",
      });
      return;
    }

    const txtContent = dataToExport
      .map((item, index) => {
        const divider = "═".repeat(50);
        return `${divider}
PROMPT #${index + 1}${item.isFavorite ? " ⭐ FAVORITE" : ""}
${divider}
Type: ${promptTypeLabels[item.promptType] || item.promptType}
Date: ${new Date(item.createdAt).toLocaleString()}

📝 INPUT:
${item.userInput}

✨ GENERATED PROMPT:
${item.generatedPrompt}
`;
      })
      .join("\n\n");

    const header = `PROMPTGEN EXPORT
Generated: ${new Date().toLocaleString()}
Total Prompts: ${dataToExport.length}
${"═".repeat(50)}\n\n`;

    const blob = new Blob([header + txtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mirava-${exportFavoritesOnly ? "favorites" : "all"}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✨ Exported!",
      description: `${dataToExport.length} prompt(s) exported as TXT`,
    });
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
      <CardHeader className="cursor-pointer pb-3 sm:pb-4" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="font-heading text-base sm:text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            <span>History</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              ({history.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-3 sm:space-y-4">
          {/* Filters & Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1.5 sm:gap-2">
<Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={handleFilterChange}
                className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              >
                <Star className={cn("h-3 w-3 sm:h-4 sm:w-4", showFavoritesOnly && "fill-current")} />
                <span className="hidden sm:inline">Favorites</span>
                <span className="sm:hidden">Fav</span>
              </Button>
              
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44 sm:w-48">
                  <DropdownMenuItem onClick={() => exportAsJSON(false)} className="gap-2 cursor-pointer text-xs sm:text-sm">
                    <FileJson className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    All as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportAsTXT(false)} className="gap-2 cursor-pointer text-xs sm:text-sm">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    All as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportAsJSON(true)} className="gap-2 cursor-pointer text-xs sm:text-sm">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Favorites JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportAsTXT(true)} className="gap-2 cursor-pointer text-xs sm:text-sm">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Favorites TXT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="gap-1 text-destructive hover:text-destructive text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>

{/* History List */}
          <div className="space-y-2 sm:space-y-3 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
            {paginatedHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No {showFavoritesOnly ? "favorites" : "history"} yet
              </p>
            ) : (
              paginatedHistory.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-border bg-muted/50 transition-all",
                    expandedId === item.id && "border-primary shadow-primary"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span
                        className={cn(
                          "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-primary-foreground border-2 border-foreground",
                          promptTypeColors[item.promptType]
                        )}
                      >
                        {promptTypeLabels[item.promptType] || item.promptType}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4",
                            item.isFavorite
                              ? "fill-tertiary text-tertiary"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  {/* User Input Preview */}
                  <p className="text-xs sm:text-sm font-medium mb-2 line-clamp-2">{item.userInput}</p>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="text-[10px] sm:text-xs text-primary font-semibold hover:underline"
                  >
                    {expandedId === item.id ? "Show less" : "Show prompt →"}
                  </button>

                  {/* Expanded Content */}
                  {expandedId === item.id && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border space-y-2 sm:space-y-3">
                      <div className="bg-card rounded-lg p-2 sm:p-3 border-2 border-border">
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">{item.generatedPrompt}</p>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(item.generatedPrompt, item.id)}
                          className="gap-1 text-xs h-8 px-2 sm:px-3"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => onUsePrompt(item)}
                          className="gap-1 text-xs h-8 px-2 sm:px-3"
                        >
                          Use Again
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
              <span className="text-xs text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
