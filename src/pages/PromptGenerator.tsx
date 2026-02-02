import { useState, useRef } from "react";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Star, Upload, Layers, RefreshCw, Download, Flame, ImageIcon, AlignLeft, Ruler, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { PromptHistoryPanel } from "@/components/prompt/PromptHistoryPanel";
import { useApiKey } from "@/hooks/useApiKey";
import { useCustomModels } from "@/hooks/useCustomModels";
import { usePromptHistory, PromptHistoryItem } from "@/hooks/usePromptHistory";
import { useGlobalStats } from "@/hooks/useGlobalStats";
import { generatePromptBatch, generatePrompt, DEFAULT_PROMPT_LENGTH } from "@/lib/generatePrompt";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const promptTypeLabels: Record<string, string> = {
  image: "Image",
  video: "Video",
  "3d": "3D Model",
  art: "Art Style",
};

// Background style options for image/video generation
const backgroundStyles = [
  { id: "none", label: "Default / Auto", description: "Let AI decide the background" },
  { id: "pure-white", label: "Pure White Background", description: "Clean white background (#FFFFFF)" },
  { id: "pure-green", label: "Green Screen", description: "Chroma key green background for compositing" },
  { id: "pure-black", label: "Pure Black Background", description: "Clean black background (#000000)" },
  { id: "transparent", label: "Transparent", description: "No background (for supported formats)" },
  { id: "studio", label: "Studio Backdrop", description: "Professional studio lighting with neutral backdrop" },
  { id: "gradient-white", label: "White Gradient", description: "Soft white to light gray gradient" },
  { id: "gradient-black", label: "Black Gradient", description: "Dark gradient vignette effect" },
] as const;

type BackgroundStyleId = typeof backgroundStyles[number]["id"];



export default function PromptGenerator() {
  const [promptType, setPromptType] = useState("image");
  const [userInput, setUserInput] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<(string | null)[]>([]);
  const [batchSize, setBatchSize] = useState(3);
  const [creativity, setCreativity] = useState(3);
  const [promptLength, setPromptLength] = useState<number>(DEFAULT_PROMPT_LENGTH);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyleId>("none");
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const { provider, model, selectedCustomModelId, currentApiKey, hasApiKey } = useApiKey();
  const { customModels } = useCustomModels();
  const { history, addToHistory, removeFromHistory, toggleFavorite, clearHistory } = usePromptHistory();
  const { incrementPrompt, setGenerating } = useGlobalStats();
  const { toast } = useToast();

  const selectedCustomModel = provider === "custom" 
    ? customModels.find(m => m.id === selectedCustomModelId) 
    : undefined;

  const apiKeyToUse = provider === "custom" 
    ? selectedCustomModel?.apiKey || "" 
    : currentApiKey;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setUserInput(content.trim());
        toast({
          title: "📄 File loaded!",
          description: `Loaded ${file.name}`,
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Oops!",
        description: "Please enter some ideas first",
        variant: "destructive",
      });
      return;
    }

    const hasValidKey = provider === "custom" 
      ? !!selectedCustomModel?.apiKey 
      : !!apiKeyToUse;

    if (!hasValidKey) {
      toast({
        title: "Model Not Configured",
        description: provider === "custom" 
          ? "Please select a custom model in Settings" 
          : "Please set up your AI model in Settings",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Set generating status for global stats
    setGenerating(true);
    // Initialize with empty placeholders to show loading state for each slot
    setGeneratedPrompts(new Array(batchSize).fill(null));
    setProgress({ completed: 0, total: batchSize });
    
    // Track which prompts have been saved to history
    const savedToHistory = new Set<number>();
    
    try {
      const results = await generatePromptBatch({
        apiKey: apiKeyToUse,
        provider,
        model: provider === "custom" ? selectedCustomModel?.modelId || "" : model,
        promptType,
        userInput,
        baseUrl: selectedCustomModel?.baseUrl,
        batchSize,
        creativity,
        backgroundStyle,
        promptLength,
        onProgress: (completed, total) => {
          setProgress({ completed, total });
        },
        onPromptReady: (prompt, index) => {
          // Stream each prompt as it completes
          setGeneratedPrompts(prev => {
            const updated = [...prev];
            updated[index] = prompt;
            return updated;
          });
          
          // Increment global prompt count for EACH individual prompt
          incrementPrompt();
          
          // Save to history immediately when ready
          if (!savedToHistory.has(index)) {
            savedToHistory.add(index);
            addToHistory({
              promptType,
              userInput,
              generatedPrompt: prompt,
            });
          }
          
          // Auto-scroll to output on first result
          if (index === 0 || savedToHistory.size === 1) {
            setTimeout(() => {
              outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        },
      });
      
      // Final update with all results (in case any were missed)
      setGeneratedPrompts(results);
      
      toast({
        title: `✨ ${results.length} Prompt${results.length > 1 ? 's' : ''} Generated!`,
        description: "Your magic prompts are ready and saved to history",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      // Clear empty placeholders on error
      setGeneratedPrompts(prev => prev.filter(p => p !== null));
    } finally {
      setIsLoading(false);
      // Clear generating status for global stats
      setGenerating(false);
    }
  };
  
  const handleCopy = async (prompt: string, index: number) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    toast({
      title: "Copied!",
      description: `Prompt #${index + 1} copied to clipboard`,
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

const handleCopyAll = async () => {
    const completedPrompts = generatedPrompts.filter((p): p is string => p !== null);
    const allPrompts = completedPrompts.map((p, i) => `#${i + 1}: ${p}`).join("\n\n");
    await navigator.clipboard.writeText(allPrompts);
    toast({
      title: "All Copied!",
      description: `${completedPrompts.length} prompts copied to clipboard`,
    });
  };
  
  const handleRegenerate = async (index: number) => {
    const hasValidKey = provider === "custom" 
      ? !!selectedCustomModel?.apiKey 
      : !!apiKeyToUse;

    if (!hasValidKey) return;

    setRegeneratingIndex(index);
    setGenerating(true);
    
    try {
      const result = await generatePrompt({
        apiKey: apiKeyToUse,
        provider,
        model: provider === "custom" ? selectedCustomModel?.modelId || "" : model,
        promptType,
        userInput,
        baseUrl: selectedCustomModel?.baseUrl,
        creativity,
        backgroundStyle,
        promptLength,
      });
      
      setGeneratedPrompts(prev => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });
      
      // Increment global prompt count for regenerated prompt
      incrementPrompt();
      
      addToHistory({
        promptType,
        userInput,
        generatedPrompt: result,
      });
      
      toast({
        title: "✨ Regenerated!",
        description: `Prompt #${index + 1} has been regenerated`,
      });
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setRegeneratingIndex(null);
      setGenerating(false);
    }
  };

const handleExportTxt = () => {
    const completedPrompts = generatedPrompts.filter((p): p is string => p !== null);
    const content = `Generate By: Mirava Studio.
==========================

${completedPrompts.join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts-${promptType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "📄 Exported!",
      description: `${completedPrompts.length} prompts saved to file`,
    });
  };
  
  const handleUsePrompt = (item: PromptHistoryItem) => {
    setPromptType(item.promptType);
    setUserInput(item.userInput);
    setGeneratedPrompts([item.generatedPrompt]);
    toast({
      title: "Prompt Loaded",
      description: "Previous prompt has been loaded",
    });
  };

  return (
    <MainLayout 
      selectedPromptType={promptType} 
      onSelectPromptType={setPromptType}
    >
      <div className="relative">
        <DecorativeShapes />
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-tertiary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-border-strong shadow-hard-sm sm:shadow-hard mb-4">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            <span className="font-semibold text-xs sm:text-sm">AI Prompt Generator</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
            Create <span className="text-primary">Magic</span> Prompts
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto px-4">
            Generate multiple unique prompt variations in parallel
          </p>
        </div>

        {/* API Key Warning */}
        {!hasApiKey && (
          <Card className="mb-6 border-secondary shadow-secondary hover:translate-x-0 hover:translate-y-0">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4">
              <div className="w-10 h-10 bg-secondary rounded-full border-2 border-border-strong flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-secondary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base">API Key Required</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Add your API key in settings to start generating
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto">
                <Link to="/settings">Go to Settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Prompt Type & Model Badge */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Selected:</span>
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary text-primary-foreground rounded-full border-2 border-border-strong font-semibold text-xs sm:text-sm shadow-hard-sm">
            {promptTypeLabels[promptType] || promptType}
          </span>
          {hasApiKey && (
            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-muted text-muted-foreground rounded-full border-2 border-border font-medium text-xs sm:text-sm">
              Model: {provider === "custom" ? selectedCustomModel?.name || "Not set" : model || "Not set"}
            </span>
          )}
        </div>

        {/* Input Section */}
        <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-heading text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full border-2 border-border-strong flex items-center justify-center text-xs sm:text-sm text-primary-foreground font-bold">1</span>
                <span>Describe Your Idea</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Load from</span> TXT
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="E.g., A cozy coffee shop interior with warm lighting and vintage furniture..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[120px] sm:min-h-[150px] text-sm sm:text-base"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{userInput.length} characters</span>
                <span>•</span>
                <span>{userInput.split('\n').filter(line => line.trim()).length} idea{userInput.split('\n').filter(line => line.trim()).length !== 1 ? 's' : ''}</span>
              </div>
              {userInput && (
                <button
                  onClick={() => setUserInput("")}
                  className="hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Prompt Count & Creativity */}
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Prompt Count */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Jumlah prompt:</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={batchSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setBatchSize(Math.max(val, 1));
                    }}
                    className="w-16 h-9 px-2 text-center text-sm font-bold rounded-xl border-2 border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Creativity Slider */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Kreativitas:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[creativity]}
                      onValueChange={(values) => setCreativity(parseInt(values[0]))}
                      min={1}
                      max={5}
                      className="w-20 sm:w-24 h-2 accent-primary cursor-pointer"
                    />
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full border-2 border-border-strong">
                      {creativity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prompt Length Selector */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Prompt Length</span>
                </div>
                
                {/* Slider + Input Container */}
                <div className="bg-muted/50 rounded-xl border-2 border-border p-4">
                  <div className="flex items-center gap-4">
                    {/* Slider */}
                    <div className="flex-1">
                      <Slider
                        value={[promptLength]}
                        onValueChange={(value) => setPromptLength(value[0])}
                        min={10}
                        max={500}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Numeric Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={500}
                        value={promptLength}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || DEFAULT_PROMPT_LENGTH;
                          setPromptLength(Math.max(10, Math.min(500, val)));
                        }}
                        className="w-16 h-9 px-2 text-center text-sm font-bold rounded-xl border-2 border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                      <span className="text-sm text-muted-foreground font-medium">words</span>
                    </div>
                  </div>
                  
                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Quick:</span>
                    {[
                      { label: "50", value: 50 },
                      { label: "100", value: 100 },
                      { label: "200", value: 200 },
                      { label: "300", value: 300 },
                      { label: "400", value: 400 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setPromptLength(preset.value)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-lg border transition-all",
                          promptLength === preset.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tip */}
                <div className="flex items-start gap-2 mt-3 p-2.5 bg-tertiary/30 rounded-lg border border-tertiary/50">
                  <Lightbulb className="h-4 w-4 text-tertiary-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Tip:</span>{" "}
                    50-100 words for Midjourney, 150+ for DALL-E 3, 200+ for detailed Flux scenes
                  </p>
                </div>
              </div>

              {/* Background Style Selector - Show for image/video/3d/art prompt types */}
              {(promptType.startsWith("image") || promptType.startsWith("video") || promptType === "3d" || promptType === "art") && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Background Style:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {backgroundStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setBackgroundStyle(style.id)}
                        className={cn(
                          "px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all text-left",
                          backgroundStyle === style.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                        )}
                        title={style.description}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                  {backgroundStyle !== "none" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ✓ Prompt akan include: "{backgroundStyles.find(s => s.id === backgroundStyle)?.description}"
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {(() => {
                  const ideaCount = userInput.split('\n').filter(line => line.trim()).length || 1;
                  const totalPrompts = batchSize * ideaCount;
                  return (
                    <span className="px-3 py-2 bg-quaternary text-quaternary-foreground rounded-full border-2 border-border-strong font-bold text-xs whitespace-nowrap">
                      Total: {totalPrompts} prompt{totalPrompts > 1 ? 's' : ''}
                    </span>
                  );
                })()}
                
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !hasApiKey}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{progress.completed}/{progress.total}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                      <span className="text-sm">Generate</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {isLoading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Generating prompts...</span>
                  <span className="font-bold text-primary">{progress.completed} / {progress.total}</span>
                </div>
                <div className="h-3 bg-muted rounded-full border-2 border-border overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

{/* Output Section - Multiple Prompts with Streaming */}
        {generatedPrompts.length > 0 && (
          <Card ref={outputRef} className="border-quaternary shadow-quaternary hover:translate-x-0 hover:translate-y-0">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-quaternary rounded-full border-2 border-border-strong flex items-center justify-center text-xs sm:text-sm text-quaternary-foreground font-bold">2</span>
                  <span>Generated Prompts ({generatedPrompts.filter(p => p !== null).length}/{generatedPrompts.length})</span>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportTxt}
                    disabled={generatedPrompts.filter(p => p !== null).length === 0}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
                    disabled={generatedPrompts.filter(p => p !== null).length === 0}
                    className="gap-1.5 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {generatedPrompts.map((prompt, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "bg-muted rounded-xl p-3 sm:p-4 border-2 border-border relative group transition-all",
                    regeneratingIndex === index && "opacity-50",
                    prompt === null && "animate-pulse"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold border",
                        prompt !== null 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
                      )}>
                        #{index + 1}
                      </span>
                      {prompt === null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </span>
                      )}
                    </div>
                    {prompt !== null && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRegenerate(index)}
                          disabled={regeneratingIndex !== null || isLoading}
                          className="h-7 px-2"
                        >
                          {regeneratingIndex === index ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Regenerate</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(prompt, index)}
                          className="h-7 px-2"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {prompt !== null ? (
                    <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{prompt}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted-foreground/10 rounded w-full"></div>
                      <div className="h-4 bg-muted-foreground/10 rounded w-5/6"></div>
                      <div className="h-4 bg-muted-foreground/10 rounded w-4/6"></div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* History Panel */}
        <PromptHistoryPanel
          history={history}
          onRemove={removeFromHistory}
          onToggleFavorite={toggleFavorite}
          onClear={clearHistory}
          onUsePrompt={handleUsePrompt}
        />
      </div>
    </MainLayout>
  );
}
