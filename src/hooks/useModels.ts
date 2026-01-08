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

  const fetchModels = useCallback(async (provider: ApiProvider, apiKey: string, customBaseUrl?: string) => {
    if (!apiKey) {
      setError("API key is required");
      return;
    }

    if (provider === "custom" && !customBaseUrl) {
      setError("Base URL is required for custom provider");
      return;
    }

    setIsLoading(true);
    setError(null);
    setModels([]);

    try {
      let baseUrl: string;
      let modelsPath: string;

      if (provider === "custom") {
        // Remove trailing slash and add /models
        baseUrl = customBaseUrl!.replace(/\/+$/, "");
        modelsPath = "/models";
      } else {
        const endpoint = providerEndpoints[provider];
        baseUrl = endpoint.base;
        modelsPath = endpoint.modelsPath;
      }

      // All providers use OpenAI-compatible format with Bearer token
      const response = await fetch(`${baseUrl}${modelsPath}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      let modelsList: ModelInfo[] = [];

      if (provider === "openrouter") {
        modelsList = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
        }));
      } else {
        // OpenAI, Groq, Gemini (OpenAI-compatible), and Custom
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
