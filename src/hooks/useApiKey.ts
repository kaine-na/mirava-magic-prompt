import { useState, useEffect } from "react";

const API_KEY_STORAGE_KEY = "promptgen_api_key";
const API_PROVIDER_STORAGE_KEY = "promptgen_api_provider";

export type ApiProvider = "openai" | "anthropic" | "gemini";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [provider, setProviderState] = useState<ApiProvider>("openai");

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedProvider = localStorage.getItem(API_PROVIDER_STORAGE_KEY) as ApiProvider;
    
    if (storedKey) setApiKeyState(storedKey);
    if (storedProvider) setProviderState(storedProvider);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  };

  const setProvider = (prov: ApiProvider) => {
    setProviderState(prov);
    localStorage.setItem(API_PROVIDER_STORAGE_KEY, prov);
  };

  const clearApiKey = () => {
    setApiKeyState("");
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  };

  const hasApiKey = apiKey.length > 0;

  return {
    apiKey,
    provider,
    setApiKey,
    setProvider,
    clearApiKey,
    hasApiKey,
  };
}
