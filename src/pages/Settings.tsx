import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, Key, Eye, EyeOff, Trash2, Check, Sparkles, 
  RefreshCw, Bot, Plus, Save, Sun, Moon, Monitor
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";
import { DecorativeShapes } from "@/components/prompt/DecorativeShapes";
import { useApiKey, ApiProvider } from "@/hooks/useApiKey";
import { useCustomModels } from "@/hooks/useCustomModels";
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

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
          Appearance
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Choose your preferred theme
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {themeOptions.map((option) => {
            const isSelected = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-center",
                  isSelected
                    ? "border-foreground bg-card shadow-hard-sm sm:shadow-hard"
                    : "border-border bg-card/50 hover:border-foreground hover:shadow-hard-sm"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center",
                      option.value === "light" && "bg-tertiary",
                      option.value === "dark" && "bg-primary",
                      option.value === "system" && "bg-muted"
                    )}
                  >
                    <option.icon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm">{option.label}</span>
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
  );
}

export default function Settings() {
  const { 
    provider, model, selectedCustomModelId, currentApiKey,
    setApiKeyForProvider, getApiKeyForProvider, setProvider, setModel, 
    setSelectedCustomModelId, clearApiKeyForProvider, hasApiKey 
  } = useApiKey();
  const { customModels, addCustomModel, removeCustomModel } = useCustomModels();
  const { models, isLoading: isLoadingModels, error: modelsError, fetchModels } = useModels();
  
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [showNewModelKey, setShowNewModelKey] = useState(false);
  const [newModel, setNewModel] = useState({ name: "", baseUrl: "", modelId: "", apiKey: "" });
  
  const { toast } = useToast();

  // Sync input key when provider changes
  useEffect(() => {
    if (provider !== "custom") {
      setInputKey(getApiKeyForProvider(provider));
    }
  }, [provider]);

  // Fetch models when provider has API key
  useEffect(() => {
    if (provider !== "custom" && currentApiKey) {
      fetchModels(provider, currentApiKey);
    }
  }, [provider, currentApiKey]);

  const handleSetModel = () => {
    if (!inputKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    if (!model) {
      // Save key first, then user can select model
      setApiKeyForProvider(provider as Exclude<ApiProvider, "custom">, inputKey);
      setSaved(true);
      toast({
        title: "✨ API Key Saved!",
        description: "Now select a model from the list",
      });
      setTimeout(() => setSaved(false), 2000);
      fetchModels(provider as Exclude<ApiProvider, "custom">, inputKey);
      return;
    }

    setApiKeyForProvider(provider as Exclude<ApiProvider, "custom">, inputKey);
    setSaved(true);
    toast({
      title: "✨ Model Set!",
      description: `Using ${model} with ${providers.find(p => p.id === provider)?.name}`,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearApiKeyForProvider(provider as Exclude<ApiProvider, "custom">);
    setInputKey("");
    toast({
      title: "Cleared",
      description: "API key and model have been removed",
    });
  };

  const handleRefreshModels = () => {
    if (currentApiKey && provider !== "custom") {
      fetchModels(provider, currentApiKey);
      toast({
        title: "Refreshing models...",
        description: "Fetching available models from API",
      });
    }
  };

  const handleAddCustomModel = () => {
    if (!newModel.name.trim() || !newModel.baseUrl.trim() || !newModel.modelId.trim() || !newModel.apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields including API key",
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
      apiKey: newModel.apiKey.trim(),
    });
    
    setSelectedCustomModelId(added.id);
    setNewModel({ name: "", baseUrl: "", modelId: "", apiKey: "" });
    setIsAddModelOpen(false);
    setShowNewModelKey(false);
    
    toast({
      title: "✨ Model Added!",
      description: `${added.name} has been saved and selected`,
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
  const currentProviderInfo = providers.find(p => p.id === provider);

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
            Configure Your <span className="text-secondary">AI Models</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto px-4">
            Set up your AI providers and preferences
          </p>
        </div>

        {/* Theme Selection */}
        <ThemeSelector />

        {/* Provider Selection */}
        <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              Select AI Provider
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Each provider stores its own API key separately
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {providers.map((prov) => {
                const isSelected = provider === prov.id;
                const hasKey = prov.id !== "custom" && getApiKeyForProvider(prov.id as Exclude<ApiProvider, "custom">);
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
                    <div className="flex flex-col items-start gap-2 w-full overflow-hidden">
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
                      <div className="w-full min-w-0 overflow-hidden">
                        <p className="font-semibold text-xs sm:text-sm truncate max-w-full">{prov.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate max-w-full">{prov.description}</p>
                      </div>
                    </div>
                    {/* Configured indicator */}
                    {hasKey && (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-quaternary rounded-full" />
                    )}
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
                    Each model has its own API key and endpoint
                  </CardDescription>
                </div>
                <Dialog open={isAddModelOpen} onOpenChange={(open) => {
                  setIsAddModelOpen(open);
                  if (!open) {
                    setNewModel({ name: "", baseUrl: "", modelId: "", apiKey: "" });
                    setShowNewModelKey(false);
                  }
                }}>
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
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="api-key"
                            type={showNewModelKey ? "text" : "password"}
                            placeholder="Enter API key for this model"
                            value={newModel.apiKey}
                            onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewModelKey(!showNewModelKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewModelKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                          <div className="w-2 h-2 bg-quaternary rounded-full" title="API key configured" />
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
                    Active: {selectedCustomModel.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Key & Model Selection (for non-custom providers) */}
        {provider !== "custom" && (
          <Card className="mb-6 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                {currentProviderInfo?.name} Configuration
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter API key and select model for {currentProviderInfo?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* API Key Input */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder={`Enter your ${currentProviderInfo?.name} API key...`}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5" />
                  Model {provider === "openrouter" && <span className="text-muted-foreground">(Model ID)</span>}
                </Label>
                {provider === "openrouter" ? (
                  <Input
                    type="text"
                    placeholder="e.g. openai/gpt-4o, anthropic/claude-3.5-sonnet"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                      <Select value={model} onValueChange={setModel} disabled={!currentApiKey}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={
                            !currentApiKey 
                              ? "Enter API key first" 
                              : isLoadingModels 
                                ? "Loading models..." 
                                : "Select a model"
                          } />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 max-w-[calc(100vw-4rem)]">
                          {models.map((m) => (
                            <SelectItem key={m.id} value={m.id} className="truncate">
                              <span className="truncate">{m.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleRefreshModels}
                      disabled={isLoadingModels || !currentApiKey}
                      className="flex-shrink-0"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoadingModels && "animate-spin")} />
                    </Button>
                  </div>
                )}
                {modelsError && provider !== "openrouter" && (
                  <p className="text-xs text-destructive">{modelsError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button onClick={handleSetModel} className="flex-1 gap-2">
                  {saved ? (
                    <>
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                      <span className="text-sm sm:text-base">Set Model AI</span>
                    </>
                  )}
                </Button>
                {currentApiKey && (
                  <Button variant="outline" onClick={handleClear} className="gap-2">
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Clear</span>
                  </Button>
                )}
              </div>

              {/* Status indicator */}
              {model && currentApiKey && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border-2 bg-tertiary/10 border-tertiary">
                  <Bot className="h-4 w-4 text-tertiary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">Active: {model}</span>
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
