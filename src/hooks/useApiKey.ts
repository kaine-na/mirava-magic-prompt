import { useState, useEffect } from "react";

const API_KEY_STORAGE_KEY = "promptgen_api_key";
const API_PROVIDER_STORAGE_KEY = "promptgen_api_provider";
const API_MODEL_STORAGE_KEY = "promptgen_api_model";
const API_BASE_URL_STORAGE_KEY = "promptgen_api_base_url";

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

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [provider, setProviderState] = useState<ApiProvider>("openai");
  const [model, setModelState] = useState<string>("");
  const [baseUrl, setBaseUrlState] = useState<string>("");

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedProvider = localStorage.getItem(API_PROVIDER_STORAGE_KEY) as ApiProvider;
    const storedModel = localStorage.getItem(API_MODEL_STORAGE_KEY);
    const storedBaseUrl = localStorage.getItem(API_BASE_URL_STORAGE_KEY);
    
    if (storedKey) setApiKeyState(storedKey);
    if (storedProvider) setProviderState(storedProvider);
    if (storedModel) setModelState(storedModel);
    if (storedBaseUrl) setBaseUrlState(storedBaseUrl);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  };

  const setProvider = (prov: ApiProvider) => {
    setProviderState(prov);
    localStorage.setItem(API_PROVIDER_STORAGE_KEY, prov);
    // Clear model when provider changes
    setModelState("");
    localStorage.removeItem(API_MODEL_STORAGE_KEY);
  };

  const setModel = (mod: string) => {
    setModelState(mod);
    localStorage.setItem(API_MODEL_STORAGE_KEY, mod);
  };

  const setBaseUrl = (url: string) => {
    setBaseUrlState(url);
    localStorage.setItem(API_BASE_URL_STORAGE_KEY, url);
  };

  const clearApiKey = () => {
    setApiKeyState("");
    setModelState("");
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    localStorage.removeItem(API_MODEL_STORAGE_KEY);
  };

  const hasApiKey = apiKey.length > 0;

  return {
    apiKey,
    provider,
    model,
    baseUrl,
    setApiKey,
    setProvider,
    setModel,
    setBaseUrl,
    clearApiKey,
    hasApiKey,
  };
}
