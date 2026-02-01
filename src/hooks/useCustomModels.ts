import { useState, useEffect } from "react";

const CUSTOM_MODELS_STORAGE_KEY = "mirava_custom_models";

export interface CustomModel {
  id: string;
  name: string;
  baseUrl: string;
  modelId: string;
  apiKey: string;
}

export function useCustomModels() {
  const [customModels, setCustomModelsState] = useState<CustomModel[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
    if (stored) {
      try {
        setCustomModelsState(JSON.parse(stored));
      } catch {
        setCustomModelsState([]);
      }
    }
  }, []);

  const saveToStorage = (models: CustomModel[]) => {
    localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(models));
  };

  const addCustomModel = (model: Omit<CustomModel, "id">) => {
    const newModel: CustomModel = {
      ...model,
      id: `custom_${Date.now()}`,
    };
    const updated = [...customModels, newModel];
    setCustomModelsState(updated);
    saveToStorage(updated);
    return newModel;
  };

  const removeCustomModel = (id: string) => {
    const updated = customModels.filter((m) => m.id !== id);
    setCustomModelsState(updated);
    saveToStorage(updated);
  };

  const updateCustomModel = (id: string, updates: Partial<Omit<CustomModel, "id">>) => {
    const updated = customModels.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    setCustomModelsState(updated);
    saveToStorage(updated);
  };

  return {
    customModels,
    addCustomModel,
    removeCustomModel,
    updateCustomModel,
  };
}
