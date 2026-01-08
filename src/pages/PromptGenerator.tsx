import { useState, useRef } from "react";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Star, Upload, Layers, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { PromptHistoryPanel } from "@/components/prompt/PromptHistoryPanel";
import { useApiKey } from "@/hooks/useApiKey";
import { useCustomModels } from "@/hooks/useCustomModels";
import { usePromptHistory, PromptHistoryItem } from "@/hooks/usePromptHistory";
import { generatePromptBatch, generatePrompt } from "@/lib/generatePrompt";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const promptTypeLabels: Record<string, string> = {
  image: "Image",
  video: "Video",
  "3d": "3D Model",
  art: "Art Style",
};



export default function PromptGenerator() {
  const [promptType, setPromptType] = useState("image");
  const [userInput, setUserInput] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { provider, model, selectedCustomModelId, currentApiKey, hasApiKey } = useApiKey();
  const { customModels } = useCustomModels();
  const { history, addToHistory, removeFromHistory, toggleFavorite, clearHistory } = usePromptHistory();
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
    setGeneratedPrompts([]);
    setProgress({ completed: 0, total: batchSize });
    
    try {
      const results = await generatePromptBatch({
        apiKey: apiKeyToUse,
        provider,
        model: provider === "custom" ? selectedCustomModel?.modelId || "" : model,
        promptType,
        userInput,
        baseUrl: selectedCustomModel?.baseUrl,
        batchSize,
        onProgress: (completed, total) => {
          setProgress({ completed, total });
        },
      });
      
      setGeneratedPrompts(results);
      
      // Save all to history
      results.forEach((prompt) => {
        addToHistory({
          promptType,
          userInput,
          generatedPrompt: prompt,
        });
      });
      
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
    } finally {
      setIsLoading(false);
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
    const allPrompts = generatedPrompts.map((p, i) => `#${i + 1}: ${p}`).join("\n\n");
    await navigator.clipboard.writeText(allPrompts);
    toast({
      title: "All Copied!",
      description: `${generatedPrompts.length} prompts copied to clipboard`,
    });
  };

  const handleRegenerate = async (index: number) => {
    const hasValidKey = provider === "custom" 
      ? !!selectedCustomModel?.apiKey 
      : !!apiKeyToUse;

    if (!hasValidKey) return;

    setRegeneratingIndex(index);
    
    try {
      const result = await generatePrompt({
        apiKey: apiKeyToUse,
        provider,
        model: provider === "custom" ? selectedCustomModel?.modelId || "" : model,
        promptType,
        userInput,
        baseUrl: selectedCustomModel?.baseUrl,
      });
      
      setGeneratedPrompts(prev => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });
      
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
    }
  };

  const handleExportTxt = () => {
    const content = `Generate By: Mirava Studio.
==========================

${generatedPrompts.join('\n')}`;
    
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
      description: `${generatedPrompts.length} prompts saved to file`,
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

            {/* Prompt Count Input */}
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Jumlah prompt per idea:</span>
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

        {/* Output Section - Multiple Prompts */}
        {generatedPrompts.length > 0 && (
          <Card className="border-quaternary shadow-quaternary hover:translate-x-0 hover:translate-y-0">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-quaternary rounded-full border-2 border-border-strong flex items-center justify-center text-xs sm:text-sm text-quaternary-foreground font-bold">2</span>
                  <span>Generated Prompts ({generatedPrompts.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportTxt}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
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
                    "bg-muted rounded-xl p-3 sm:p-4 border-2 border-border relative group transition-opacity",
                    regeneratingIndex === index && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate(index)}
                        disabled={regeneratingIndex !== null}
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
                  </div>
                  <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{prompt}</p>
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
