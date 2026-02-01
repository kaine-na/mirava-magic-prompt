import { useState, useCallback } from "react";
import { ApiProvider, providerEndpoints } from "./useApiKey";

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

// Cache for models to avoid repeated API calls
const modelsCache: Map<string, { models: ModelInfo[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async (provider: ApiProvider, apiKey: string, customBaseUrl?: string) => {
    if (!apiKey) {
      setError("API key is required");
      return;
    }

    if (provider === "custom" && !customBaseUrl) {
      setError("Base URL is required for custom provider");
      return;
    }

    // Check cache first
    const cacheKey = `${provider}-${apiKey.slice(-8)}`;
    const cached = modelsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setModels(cached.models);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setModels([]);

    try {
      let fetchUrl: string;
      let headers: HeadersInit = {};

      if (provider === "custom") {
        // Custom provider - assume OpenAI-compatible
        const baseUrl = customBaseUrl!.replace(/\/+$/, "");
        fetchUrl = `${baseUrl}/models`;
        headers = { Authorization: `Bearer ${apiKey}` };
      } else {
        const endpoint = providerEndpoints[provider];
        
        if (endpoint.authType === "query") {
          // Gemini uses API key as query parameter
          fetchUrl = `${endpoint.base}${endpoint.modelsPath}?key=${apiKey}`;
        } else {
          // OpenAI, OpenRouter, Groq use Bearer token
          fetchUrl = `${endpoint.base}${endpoint.modelsPath}`;
          headers = { Authorization: `Bearer ${apiKey}` };
        }
      }

      const response = await fetch(fetchUrl, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      let modelsList: ModelInfo[] = [];

      if (provider === "gemini") {
        // Gemini returns { models: [{ name: "models/gemini-1.5-pro", ... }] }
        modelsList = (data.models || [])
          .filter((m: any) => {
            // Filter to only show generative models (not embedding, etc.)
            const name = m.name || "";
            return name.includes("gemini") && 
                   m.supportedGenerationMethods?.includes("generateContent");
          })
          .map((m: any) => {
            // Extract model ID from "models/gemini-1.5-pro" format
            const fullName = m.name || "";
            const id = fullName.replace("models/", "");
            return {
              id: id,
              name: m.displayName || id,
              description: m.description,
            };
          });
      } else if (provider === "openrouter") {
        // OpenRouter returns { data: [{ id, name, ... }] }
        modelsList = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          description: m.description,
        }));
      } else {
        // OpenAI, Groq, and Custom - OpenAI-compatible format { data: [{ id, ... }] }
        modelsList = (data.data || [])
          .filter((m: any) => {
            if (provider === "openai") {
              // Filter to show only chat models (gpt, o1, o3)
              const id = m.id || "";
              return id.includes("gpt") || id.includes("o1") || id.includes("o3");
            }
            if (provider === "groq") {
              // Filter to show only text generation models
              const id = m.id || "";
              return !id.includes("whisper") && !id.includes("distil");
            }
            return true;
          })
          .map((m: any) => ({
            id: m.id,
            name: m.id,
          }));
      }

      // Sort alphabetically by name
      modelsList.sort((a, b) => a.name.localeCompare(b.name));
      
      // Update cache
      modelsCache.set(cacheKey, { models: modelsList, timestamp: Date.now() });
      
      setModels(modelsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models");
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Force refresh (bypass cache)
  const refreshModels = useCallback(async (provider: ApiProvider, apiKey: string, customBaseUrl?: string) => {
    const cacheKey = `${provider}-${apiKey.slice(-8)}`;
    modelsCache.delete(cacheKey);
    return fetchModels(provider, apiKey, customBaseUrl);
  }, [fetchModels]);

  return {
    models,
    isLoading,
    error,
    fetchModels,
    refreshModels,
  };
}
