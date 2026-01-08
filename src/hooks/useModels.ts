import { useState, useCallback } from "react";
import { ApiProvider, providerEndpoints } from "./useApiKey";

export interface ModelInfo {
  id: string;
  name: string;
}

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async (provider: ApiProvider, apiKey: string) => {
    if (!apiKey) {
      setError("API key is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setModels([]);

    try {
      const endpoint = providerEndpoints[provider];
      let response: Response;
      let modelsList: ModelInfo[] = [];

      if (provider === "gemini") {
        // Gemini uses API key as query parameter
        response = await fetch(`${endpoint.base}${endpoint.modelsPath}?key=${apiKey}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }
        
        const data = await response.json();
        modelsList = (data.models || [])
          .filter((m: any) => m.name?.includes("gemini"))
          .map((m: any) => ({
            id: m.name?.replace("models/", "") || m.name,
            name: m.displayName || m.name?.replace("models/", "") || m.name,
          }));
      } else {
        // OpenAI, OpenRouter, Groq use Bearer token
        response = await fetch(`${endpoint.base}${endpoint.modelsPath}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json();
        
        if (provider === "openrouter") {
          modelsList = (data.data || []).map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
          }));
        } else {
          // OpenAI and Groq
          modelsList = (data.data || [])
            .filter((m: any) => {
              if (provider === "openai") {
                return m.id?.includes("gpt") || m.id?.includes("o1") || m.id?.includes("o3");
              }
              return true;
            })
            .map((m: any) => ({
              id: m.id,
              name: m.id,
            }));
        }
      }

      // Sort alphabetically
      modelsList.sort((a, b) => a.name.localeCompare(b.name));
      setModels(modelsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models");
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    models,
    isLoading,
    error,
    fetchModels,
  };
}
