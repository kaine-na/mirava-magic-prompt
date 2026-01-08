import { useState } from "react";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { PromptTypeSelector } from "@/components/prompt/PromptTypeSelector";
import { PromptHistoryPanel } from "@/components/prompt/PromptHistoryPanel";
import { useApiKey } from "@/hooks/useApiKey";
import { usePromptHistory, PromptHistoryItem } from "@/hooks/usePromptHistory";
import { generatePrompt } from "@/lib/generatePrompt";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function PromptGenerator() {
  const [promptType, setPromptType] = useState("image");
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const { apiKey, provider, hasApiKey } = useApiKey();
  const { history, addToHistory, removeFromHistory, toggleFavorite, clearHistory } = usePromptHistory();
  const { toast } = useToast();

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
    <MainLayout>
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

        {/* Prompt Type Selection */}
        <div className="mb-8 animate-pop-in" style={{ animationDelay: "100ms" }}>
          <label className="font-heading font-bold text-sm uppercase tracking-wide mb-3 block">
            Select Prompt Type
          </label>
          <PromptTypeSelector selected={promptType} onSelect={setPromptType} />
        </div>

        {/* Input Section */}
        <Card className="mb-6 animate-pop-in hover:translate-x-0 hover:translate-y-0 hover:shadow-hard" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <span className="w-8 h-8 bg-primary rounded-full border-2 border-foreground flex items-center justify-center text-sm text-primary-foreground font-bold">1</span>
              Describe Your Idea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="E.g., A cozy coffee shop interior with warm lighting and vintage furniture..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[120px]"
            />
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
