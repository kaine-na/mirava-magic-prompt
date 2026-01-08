import { useState, useEffect } from "react";

const API_KEYS_STORAGE_KEY = "promptgen_api_keys";
const API_PROVIDER_STORAGE_KEY = "promptgen_api_provider";
const API_MODEL_STORAGE_KEY = "promptgen_api_model";
const SELECTED_CUSTOM_MODEL_KEY = "promptgen_selected_custom_model";

export type ApiProvider = "openai" | "gemini" | "openrouter" | "groq" | "custom";

export const providerEndpoints: Record<Exclude<ApiProvider, "custom">, { base: string; modelsPath: string }> = {
  openai: {
    base: "https://api.openai.com/v1",
    modelsPath: "/models",
  },
  gemini: {
    base: "https://generativelanguage.googleapis.com/v1beta",
    modelsPath: "/openai/models",
  },
  openrouter: {
    base: "https://openrouter.ai/api/v1",
    modelsPath: "/models",
  },
  groq: {
    base: "https://api.groq.com/openai/v1",
    modelsPath: "/models",
  },
};

// Store API keys per provider
type ApiKeys = Partial<Record<Exclude<ApiProvider, "custom">, string>>;

export function useApiKey() {
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({});
  const [provider, setProviderState] = useState<ApiProvider>("openai");
  const [model, setModelState] = useState<string>("");
  const [selectedCustomModelId, setSelectedCustomModelIdState] = useState<string>("");

  useEffect(() => {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    const storedProvider = localStorage.getItem(API_PROVIDER_STORAGE_KEY) as ApiProvider;
    const storedModel = localStorage.getItem(API_MODEL_STORAGE_KEY);
    const storedCustomModelId = localStorage.getItem(SELECTED_CUSTOM_MODEL_KEY);
    
    if (storedKeys) {
      try {
        setApiKeysState(JSON.parse(storedKeys));
      } catch {
        setApiKeysState({});
      }
    }
    if (storedProvider) setProviderState(storedProvider);
    if (storedModel) setModelState(storedModel);
    if (storedCustomModelId) setSelectedCustomModelIdState(storedCustomModelId);
  }, []);

  const setApiKeyForProvider = (prov: Exclude<ApiProvider, "custom">, key: string) => {
    const updated = { ...apiKeys, [prov]: key };
    setApiKeysState(updated);
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updated));
  };

  const getApiKeyForProvider = (prov: Exclude<ApiProvider, "custom">) => {
    return apiKeys[prov] || "";
  };

  const setProvider = (prov: ApiProvider) => {
    setProviderState(prov);
    localStorage.setItem(API_PROVIDER_STORAGE_KEY, prov);
    // Clear model when provider changes (except for custom)
    if (prov !== "custom") {
      setModelState("");
      localStorage.removeItem(API_MODEL_STORAGE_KEY);
    }
  };

  const setModel = (mod: string) => {
    setModelState(mod);
    localStorage.setItem(API_MODEL_STORAGE_KEY, mod);
  };

  const setSelectedCustomModelId = (id: string) => {
    setSelectedCustomModelIdState(id);
    localStorage.setItem(SELECTED_CUSTOM_MODEL_KEY, id);
  };

  const clearApiKeyForProvider = (prov: Exclude<ApiProvider, "custom">) => {
    const updated = { ...apiKeys };
    delete updated[prov];
    setApiKeysState(updated);
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updated));
    if (provider === prov) {
      setModelState("");
      localStorage.removeItem(API_MODEL_STORAGE_KEY);
    }
  };

  // Current provider's API key (for non-custom)
  const currentApiKey = provider !== "custom" ? (apiKeys[provider] || "") : "";
  const hasApiKey = provider === "custom" ? true : currentApiKey.length > 0;

  return {
    apiKeys,
    provider,
    model,
    selectedCustomModelId,
    currentApiKey,
    setApiKeyForProvider,
    getApiKeyForProvider,
    setProvider,
    setModel,
    setSelectedCustomModelId,
    clearApiKeyForProvider,
    hasApiKey,
  };
}
