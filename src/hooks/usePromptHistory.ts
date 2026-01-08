import { useState, useEffect } from "react";

const HISTORY_STORAGE_KEY = "promptgen_history";
const MAX_HISTORY_ITEMS = 50;

export interface PromptHistoryItem {
  id: string;
  promptType: string;
  userInput: string;
  generatedPrompt: string;
  createdAt: number;
  isFavorite?: boolean;
}

export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveToStorage = (items: PromptHistoryItem[]) => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  };

  const addToHistory = (item: Omit<PromptHistoryItem, "id" | "createdAt">) => {
    const newItem: PromptHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(updated);
      return updated;
    });

    return newItem;
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const getFavorites = () => history.filter((item) => item.isFavorite);

  return {
    history,
    addToHistory,
    removeFromHistory,
    toggleFavorite,
    clearHistory,
    getFavorites,
  };
}
