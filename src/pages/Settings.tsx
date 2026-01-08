import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, Key, Eye, EyeOff, Trash2, Check, Sparkles, 
  RefreshCw, Bot, Plus, X, Edit2, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { useApiKey, ApiProvider } from "@/hooks/useApiKey";
import { useCustomModels, CustomModel } from "@/hooks/useCustomModels";
import { useModels } from "@/hooks/useModels";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const providers = [
  {
    id: "openai" as ApiProvider,
    name: "OpenAI",
    description: "GPT-4o, GPT-4, etc.",
    color: "bg-quaternary",
    url: "https://platform.openai.com/api-keys",
  },
  {
    id: "gemini" as ApiProvider,
    name: "Google Gemini",
    description: "Gemini Pro, Flash, etc.",
    color: "bg-tertiary",
    url: "https://aistudio.google.com/apikey",
  },
  {
    id: "openrouter" as ApiProvider,
    name: "OpenRouter",
    description: "Multi-provider gateway",
    color: "bg-secondary",
    url: "https://openrouter.ai/keys",
  },
  {
    id: "groq" as ApiProvider,
    name: "Groq",
    description: "Llama, Mixtral, etc.",
    color: "bg-primary",
    url: "https://console.groq.com/keys",
  },
  {
    id: "custom" as ApiProvider,
    name: "Custom",
    description: "Your own models",
    color: "bg-muted",
    url: "",
  },
];

export default function Settings() {
  const { 
    apiKey, provider, model, selectedCustomModelId,
    setApiKey, setProvider, setModel, setSelectedCustomModelId, 
    clearApiKey, hasApiKey 
  } = useApiKey();
  const { customModels, addCustomModel, removeCustomModel } = useCustomModels();
  const { models, isLoading: isLoadingModels, error: modelsError, fetchModels } = useModels();
  
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [newModel, setNewModel] = useState({ name: "", baseUrl: "", modelId: "" });
  
  const { toast } = useToast();

  // Fetch models when API key is saved (for non-custom providers)
  useEffect(() => {
    if (hasApiKey && provider !== "custom") {
      fetchModels(provider, apiKey);
    }
  }, [provider, hasApiKey]);

  // Sync input states when values change
  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

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
      description: "Your API key has been saved",
    });
    setTimeout(() => setSaved(false), 2000);
    
    // Fetch models with the new key (for non-custom providers)
    if (provider !== "custom") {
      fetchModels(provider, inputKey);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey("");
    toast({
      title: "Cleared",
      description: "Your API key has been removed",
    });
  };

  const handleRefreshModels = () => {
    if (hasApiKey && provider !== "custom") {
      fetchModels(provider, apiKey);
      toast({
        title: "Refreshing models...",
        description: "Fetching available models from API",
      });
    }
  };

  const handleAddCustomModel = () => {
    if (!newModel.name.trim() || !newModel.baseUrl.trim() || !newModel.modelId.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(newModel.baseUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    const added = addCustomModel({
      name: newModel.name.trim().slice(0, 100),
      baseUrl: newModel.baseUrl.trim(),
      modelId: newModel.modelId.trim().slice(0, 200),
    });
    
    setSelectedCustomModelId(added.id);
    setNewModel({ name: "", baseUrl: "", modelId: "" });
    setIsAddModelOpen(false);
    
    toast({
      title: "✨ Model Added!",
      description: `${added.name} has been saved`,
    });
  };

  const handleDeleteCustomModel = (id: string) => {
    removeCustomModel(id);
    if (selectedCustomModelId === id) {
      setSelectedCustomModelId("");
    }
    toast({
      title: "Deleted",
      description: "Custom model has been removed",
    });
  };

  const selectedCustomModel = customModels.find(m => m.id === selectedCustomModelId);

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
              All providers use OpenAI-compatible format
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
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
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-foreground flex items-center justify-center flex-shrink-0",
                          prov.color
                        )}
                      >
                        <span className="font-bold text-xs sm:text-sm text-primary-foreground">
                          {prov.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm truncate">{prov.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{prov.description}</p>
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

        {/* Custom Models Section (only for custom provider) */}
        {provider === "custom" && (
          <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                    Custom Models
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Add your own OpenAI-compatible API endpoints
                  </CardDescription>
                </div>
                <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Model</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-heading">Add Custom Model</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="model-name">Display Name</Label>
                        <Input
                          id="model-name"
                          placeholder="e.g., My Local LLM"
                          value={newModel.name}
                          onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base-url">Base URL</Label>
                        <Input
                          id="base-url"
                          type="url"
                          placeholder="https://api.example.com/v1"
                          value={newModel.baseUrl}
                          onChange={(e) => setNewModel({ ...newModel, baseUrl: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          OpenAI-compatible endpoint (will call /chat/completions)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model-id">Model ID</Label>
                        <Input
                          id="model-id"
                          placeholder="e.g., gpt-4, llama-3.1-8b"
                          value={newModel.modelId}
                          onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value })}
                          maxLength={200}
                        />
                      </div>
                      <Button onClick={handleAddCustomModel} className="w-full gap-2">
                        <Save className="h-4 w-4" />
                        Save Model
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {customModels.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No custom models yet</p>
                  <p className="text-xs">Click "Add Model" to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customModels.map((cm) => {
                    const isSelected = selectedCustomModelId === cm.id;
                    return (
                      <div
                        key={cm.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                          isSelected
                            ? "border-foreground bg-card shadow-hard-sm"
                            : "border-border hover:border-foreground/50"
                        )}
                        onClick={() => setSelectedCustomModelId(cm.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{cm.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{cm.modelId}</p>
                          <p className="text-[10px] text-muted-foreground/70 truncate">{cm.baseUrl}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isSelected && (
                            <div className="w-5 h-5 bg-tertiary rounded-full border-2 border-foreground flex items-center justify-center">
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomModel(cm.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedCustomModel && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border-2 bg-tertiary/10 border-tertiary">
                  <Bot className="h-4 w-4 text-tertiary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">
                    Using: {selectedCustomModel.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Key Input */}
        <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
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

        {/* Model Selection (for non-custom providers) */}
        {hasApiKey && provider !== "custom" && (
          <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                Select Model
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Choose the AI model for generating prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex gap-2">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a model"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefreshModels}
                  disabled={isLoadingModels}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoadingModels && "animate-spin")} />
                </Button>
              </div>

              {modelsError && (
                <p className="text-xs text-destructive">{modelsError}</p>
              )}

              {model && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border-2 bg-tertiary/10 border-tertiary">
                  <Bot className="h-4 w-4 text-tertiary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">Using: {model}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Need an API key? Get one from{" "}
            {providers.filter(p => p.url).map((prov, i, arr) => (
              <span key={prov.id}>
                <a 
                  href={prov.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "underline underline-offset-4 hover:opacity-80",
                    prov.id === "openai" && "text-quaternary",
                    prov.id === "gemini" && "text-tertiary",
                    prov.id === "openrouter" && "text-secondary",
                    prov.id === "groq" && "text-primary"
                  )}
                >
                  {prov.name}
                </a>
                {i < arr.length - 1 && (i === arr.length - 2 ? ", or " : ", ")}
              </span>
            ))}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
