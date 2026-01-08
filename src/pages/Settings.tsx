import { useState } from "react";
import { Settings as SettingsIcon, Key, Eye, EyeOff, Trash2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { useApiKey, ApiProvider } from "@/hooks/useApiKey";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const providers = [
  {
    id: "openai" as ApiProvider,
    name: "OpenAI",
    description: "GPT-4o-mini",
    color: "bg-quaternary",
  },
  {
    id: "anthropic" as ApiProvider,
    name: "Anthropic",
    description: "Claude 3 Haiku",
    color: "bg-secondary",
  },
  {
    id: "gemini" as ApiProvider,
    name: "Google",
    description: "Gemini 1.5 Flash",
    color: "bg-tertiary",
  },
];

export default function Settings() {
  const { apiKey, provider, setApiKey, setProvider, clearApiKey, hasApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!inputKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    setApiKey(inputKey);
    setSaved(true);
    toast({
      title: "✨ Saved!",
      description: "Your API key has been saved securely",
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey("");
    toast({
      title: "Cleared",
      description: "Your API key has been removed",
    });
  };

  return (
    <MainLayout>
      <div className="relative">
        <DecorativeShapes />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-foreground shadow-hard-sm sm:shadow-hard mb-4">
            <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" strokeWidth={2.5} />
            <span className="font-semibold text-xs sm:text-sm text-secondary-foreground">Settings</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
            Configure Your <span className="text-secondary">Setup</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto px-4">
            Add your API key to start generating amazing prompts
          </p>
        </div>

        {/* Provider Selection */}
        <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              Select AI Provider
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose which AI service to use for prompt generation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {providers.map((prov) => {
                const isSelected = provider === prov.id;
                return (
                  <button
                    key={prov.id}
                    onClick={() => setProvider(prov.id)}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left",
                      isSelected
                        ? "border-foreground bg-card shadow-hard-sm sm:shadow-hard"
                        : "border-border bg-card/50 hover:border-foreground hover:shadow-hard-sm"
                    )}
                  >
                    <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-foreground flex items-center justify-center sm:mb-2 flex-shrink-0",
                          prov.color
                        )}
                      >
                        <span className="font-bold text-xs sm:text-sm text-primary-foreground">
                          {prov.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{prov.name}</p>
                        <p className="text-xs text-muted-foreground">{prov.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-tertiary rounded-full border-2 border-foreground flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* API Key Input */}
        <Card className="hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
              <Key className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              API Key
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Stored locally in your browser, never sent to our servers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter your API key..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="pr-12 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button onClick={handleSave} className="flex-1 gap-2">
                {saved ? (
                  <>
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Saved!</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                    <span className="text-sm sm:text-base">Save Key</span>
                  </>
                )}
              </Button>
              {hasApiKey && (
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Clear</span>
                </Button>
              )}
            </div>

            {/* Status indicator */}
            <div className={cn(
              "flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border-2",
              hasApiKey ? "bg-quaternary/10 border-quaternary" : "bg-muted border-border"
            )}>
              <div className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0",
                hasApiKey ? "bg-quaternary animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-xs sm:text-sm font-medium">
                {hasApiKey ? "API key configured and ready!" : "No API key configured"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Need an API key? Get one from{" "}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              OpenAI
            </a>
            ,{" "}
            <a 
              href="https://console.anthropic.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary underline underline-offset-4 hover:text-secondary/80"
            >
              Anthropic
            </a>
            , or{" "}
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-tertiary underline underline-offset-4 hover:text-tertiary/80"
            >
              Google AI
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
