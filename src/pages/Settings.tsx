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
      <div className="relative max-w-2xl mx-auto">
        <DecorativeShapes />

        {/* Header */}
        <div className="text-center mb-10 relative z-10 animate-pop-in">
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border-2 border-foreground shadow-hard mb-4">
            <SettingsIcon className="h-5 w-5 text-secondary-foreground" strokeWidth={2.5} />
            <span className="font-semibold text-sm text-secondary-foreground">Settings</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Configure Your <span className="text-secondary">Setup</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Add your API key to start generating amazing prompts
          </p>
        </div>

        {/* Provider Selection */}
        <Card className="mb-6 animate-pop-in hover:translate-x-0 hover:translate-y-0 hover:shadow-hard" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              Select AI Provider
            </CardTitle>
            <CardDescription>
              Choose which AI service you want to use for prompt generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {providers.map((prov, index) => {
                const isSelected = provider === prov.id;
                return (
                  <button
                    key={prov.id}
                    onClick={() => setProvider(prov.id)}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 transition-all duration-300 text-left animate-pop-in",
                      isSelected
                        ? "border-foreground bg-card shadow-hard"
                        : "border-border bg-card/50 hover:border-foreground hover:shadow-hard-sm"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center mb-2",
                        prov.color
                      )}
                    >
                      <span className="font-bold text-sm text-primary-foreground">
                        {prov.name.charAt(0)}
                      </span>
                    </div>
                    <p className="font-semibold">{prov.name}</p>
                    <p className="text-xs text-muted-foreground">{prov.description}</p>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-tertiary rounded-full border-2 border-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* API Key Input */}
        <Card className="animate-pop-in hover:translate-x-0 hover:translate-y-0 hover:shadow-hard" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Key className="h-5 w-5" strokeWidth={2.5} />
              API Key
            </CardTitle>
            <CardDescription>
              Your API key is stored locally in your browser and never sent to our servers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your API key..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 gap-2">
                {saved ? (
                  <>
                    <Check className="h-5 w-5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5" strokeWidth={2.5} />
                    Save Key
                  </>
                )}
              </Button>
              {hasApiKey && (
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <Trash2 className="h-5 w-5" />
                  Clear
                </Button>
              )}
            </div>

            {/* Status indicator */}
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-xl border-2",
              hasApiKey ? "bg-quaternary/10 border-quaternary" : "bg-muted border-border"
            )}>
              <div className={cn(
                "w-3 h-3 rounded-full",
                hasApiKey ? "bg-quaternary animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-sm font-medium">
                {hasApiKey ? "API key configured and ready!" : "No API key configured"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 text-center animate-pop-in" style={{ animationDelay: "300ms" }}>
          <p className="text-sm text-muted-foreground">
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
