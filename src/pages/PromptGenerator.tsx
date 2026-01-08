import { useState, useRef } from "react";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Star, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { PromptHistoryPanel } from "@/components/prompt/PromptHistoryPanel";
import { useApiKey } from "@/hooks/useApiKey";
import { usePromptHistory, PromptHistoryItem } from "@/hooks/usePromptHistory";
import { generatePrompt } from "@/lib/generatePrompt";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  
  const { apiKey, provider, hasApiKey } = useApiKey();
  const { history, addToHistory, removeFromHistory, toggleFavorite, clearHistory } = usePromptHistory();
  const { toast } = useToast();

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
    
    // Reset input
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

    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your API key in Settings",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsSaved(false);
    try {
      const result = await generatePrompt({
        apiKey,
        provider,
        promptType,
        userInput,
      });
      setGeneratedPrompt(result);
      
      // Auto-save to history
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
      <div className="relative max-w-4xl mx-auto">
        <DecorativeShapes />
        
        {/* Header */}
        <div className="text-center mb-10 relative z-10 animate-pop-in">
          <div className="inline-flex items-center gap-2 bg-tertiary px-4 py-2 rounded-full border-2 border-foreground shadow-hard mb-4">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            <span className="font-semibold text-sm">AI Prompt Generator</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Create <span className="text-primary">Magic</span> Prompts
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Transform your ideas into powerful prompts for any generative AI
          </p>
        </div>

        {/* API Key Warning */}
        {!hasApiKey && (
          <Card className="mb-6 border-secondary shadow-secondary animate-pop-in">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-secondary rounded-full border-2 border-foreground flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-secondary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">API Key Required</p>
                <p className="text-sm text-muted-foreground">
                  Add your API key in settings to start generating prompts
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/settings">Go to Settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Prompt Type Badge */}
        <div className="mb-6 animate-pop-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected type:</span>
            <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full border-2 border-foreground font-semibold text-sm shadow-hard-sm">
              {promptTypeLabels[promptType] || promptType}
            </span>
            <span className="text-xs text-muted-foreground">← Change in sidebar</span>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-6 animate-pop-in hover:translate-x-0 hover:translate-y-0 hover:shadow-hard" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-primary rounded-full border-2 border-foreground flex items-center justify-center text-sm text-primary-foreground font-bold">1</span>
                Describe Your Idea
              </div>
              {/* File Upload Button */}
              <div>
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
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Load from TXT
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="E.g., A cozy coffee shop interior with warm lighting and vintage furniture..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {userInput.length} characters
              </span>
              {userInput && (
                <button
                  onClick={() => setUserInput("")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !hasApiKey}
                className="min-w-[160px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" strokeWidth={2.5} />
                    Generate Prompt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        {generatedPrompt && (
          <Card className="animate-pop-in border-quaternary shadow-quaternary hover:translate-x-0 hover:translate-y-0 hover:shadow-quaternary">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-quaternary rounded-full border-2 border-foreground flex items-center justify-center text-sm text-quaternary-foreground font-bold">2</span>
                  Your Generated Prompt
                </div>
                <div className="flex items-center gap-2">
                  {isSaved && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <Star className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-xl p-4 border-2 border-border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{generatedPrompt}</p>
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
