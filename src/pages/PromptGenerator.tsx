import { useState, useRef } from "react";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { PromptHistoryPanel } from "@/components/prompt/PromptHistoryPanel";
import { useApiKey } from "@/hooks/useApiKey";
import { useCustomModels } from "@/hooks/useCustomModels";
import { usePromptHistory, PromptHistoryItem } from "@/hooks/usePromptHistory";
import { generatePrompt } from "@/lib/generatePrompt";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const promptTypeLabels: Record<string, string> = {
  image: "Image",
  video: "Video",
  social: "Social Media",
  "3d": "3D Model",
  chat: "Chat/System",
  code: "Code",
  music: "Music",
  writing: "Writing",
  marketing: "Marketing",
  email: "Email",
  art: "Art Style",
  custom: "Custom",
};

export default function PromptGenerator() {
  const [promptType, setPromptType] = useState("image");
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { provider, model, selectedCustomModelId, currentApiKey, hasApiKey } = useApiKey();
  const { customModels } = useCustomModels();
  const { history, addToHistory, removeFromHistory, toggleFavorite, clearHistory } = usePromptHistory();
  const { toast } = useToast();

  // Get custom model config if using custom provider
  const selectedCustomModel = provider === "custom" 
    ? customModels.find(m => m.id === selectedCustomModelId) 
    : undefined;

  // Determine API key to use
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

    // Check if we have a valid API key
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
    setIsSaved(false);
    try {
      const result = await generatePrompt({
        apiKey: apiKeyToUse,
        provider,
        model: provider === "custom" ? selectedCustomModel?.modelId || "" : model,
        promptType,
        userInput,
        baseUrl: selectedCustomModel?.baseUrl,
      });
      setGeneratedPrompt(result);
      
      addToHistory({
        promptType,
        userInput,
        generatedPrompt: result,
      });
      setIsSaved(true);
      
      toast({
        title: "✨ Prompt Generated!",
        description: "Your magic prompt is ready and saved to history",
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePrompt = (item: PromptHistoryItem) => {
    setPromptType(item.promptType);
    setUserInput(item.userInput);
    setGeneratedPrompt(item.generatedPrompt);
    setIsSaved(true);
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
          <div className="inline-flex items-center gap-2 bg-tertiary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-foreground shadow-hard-sm sm:shadow-hard mb-4">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            <span className="font-semibold text-xs sm:text-sm">AI Prompt Generator</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
            Create <span className="text-primary">Magic</span> Prompts
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto px-4">
            Transform your ideas into powerful prompts for any generative AI
          </p>
        </div>

        {/* API Key Warning */}
        {!hasApiKey && (
          <Card className="mb-6 border-secondary shadow-secondary hover:translate-x-0 hover:translate-y-0">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4">
              <div className="w-10 h-10 bg-secondary rounded-full border-2 border-foreground flex items-center justify-center flex-shrink-0">
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
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Selected:</span>
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary text-primary-foreground rounded-full border-2 border-foreground font-semibold text-xs sm:text-sm shadow-hard-sm">
            {promptTypeLabels[promptType] || promptType}
          </span>
          {hasApiKey && (
            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-muted text-muted-foreground rounded-full border-2 border-border font-medium text-xs sm:text-sm">
              Model: {provider === "custom" ? selectedCustomModel?.name || "Not set" : model || "Not set"}
            </span>
          )}
          <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">← Change in sidebar</span>
        </div>

        {/* Input Section */}
        <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-heading text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full border-2 border-foreground flex items-center justify-center text-xs sm:text-sm text-primary-foreground font-bold">1</span>
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
              <span>{userInput.length} characters</span>
              {userInput && (
                <button
                  onClick={() => setUserInput("")}
                  className="hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !hasApiKey}
                className="w-full sm:w-auto min-w-[140px] sm:min-w-[160px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                    <span className="text-sm sm:text-base">Generate</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        {generatedPrompt && (
          <Card className="border-quaternary shadow-quaternary hover:translate-x-0 hover:translate-y-0">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-quaternary rounded-full border-2 border-foreground flex items-center justify-center text-xs sm:text-sm text-quaternary-foreground font-bold">2</span>
                  <span>Generated Prompt</span>
                </div>
                <div className="flex items-center gap-2">
                  {isSaved && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Saved
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted rounded-xl p-3 sm:p-4 border-2 border-border">
                <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{generatedPrompt}</p>
              </div>
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
